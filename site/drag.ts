(() => {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const grip = 48;
  type DragBody = {
    boxes: DOMRect[];
    bounds: DOMRect | null;
    x: number;
    y: number;
  };
  type Gesture = {
    element: HTMLElement;
    pointerId: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    samples: { x: number; y: number; time: number }[];
    body: DragBody | null;
  };
  let gesture: Gesture | null = null;
  let frame = 0;
  let layer = 0;
  let suppressClick = false;

  function enabled() {
    return finePointer.matches && !document.body.hasAttribute("data-exploring");
  }

  const solid = "button, summary, input, select, textarea, img, svg, canvas, video, iframe";

  function hasColor(color: string) {
    return color !== "transparent" && !/^rgba\(.*?,\s*0\)$|\/ 0\)$/.test(color);
  }

  function borderWidth(width: string, color: string) {
    return hasColor(color) ? parseFloat(width) : 0;
  }

  function visibleBoxes(element: HTMLElement, moving = false) {
    const boxes: DOMRect[] = [];
    const range = document.createRange();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    function add(x: number, y: number, width: number, height: number) {
      if (width > 0 && height > 0) boxes.push(new DOMRect(x + scrollX, y + scrollY, width, height));
    }

    function visit(node: Element) {
      if (moving && node !== element && node.hasAttribute("data-drag-moved")) return;
      const style = getComputedStyle(node);
      if (style.display === "none" || Number(style.opacity) === 0) return;

      const visible = style.visibility === "visible";
      if (visible) {
        const solidBox = node.matches(solid);
        const filled = solidBox || hasColor(style.backgroundColor) || style.backgroundImage !== "none";
        const top = borderWidth(style.borderTopWidth, style.borderTopColor);
        const right = borderWidth(style.borderRightWidth, style.borderRightColor);
        const bottom = borderWidth(style.borderBottomWidth, style.borderBottomColor);
        const left = borderWidth(style.borderLeftWidth, style.borderLeftColor);
        if (filled || top || right || bottom || left) {
          for (const rect of node.getClientRects()) {
            if (filled) add(rect.x, rect.y, rect.width, rect.height);
            else {
              add(rect.x, rect.y, rect.width, top);
              add(rect.right - right, rect.y, right, rect.height);
              add(rect.x, rect.bottom - bottom, rect.width, bottom);
              add(rect.x, rect.y, left, rect.height);
            }
          }
        }
        if (solidBox) return;
      }

      if (node instanceof HTMLDetailsElement && !node.open) {
        const summary = [...node.children].find((child) => child.localName === "summary");
        if (summary) visit(summary);
        return;
      }

      const visibleText = visible && hasColor(style.color);
      for (const child of node.childNodes) {
        if (child instanceof Element) visit(child);
        if (!visibleText || !(child instanceof Text)) continue;
        // Measure rendered word fragments, not line boxes or whitespace between words.
        for (const word of child.data.matchAll(/\S+/gu)) {
          range.setStart(child, word.index);
          range.setEnd(child, word.index + word[0].length);
          for (const rect of range.getClientRects()) add(rect.x, rect.y, rect.width, rect.height);
        }
      }
    }

    visit(element);
    return boxes;
  }

  function measureDragBody(element: HTMLElement): DragBody {
    const boxes = visibleBoxes(element, true);
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const box of boxes) {
      left = Math.min(left, box.left);
      top = Math.min(top, box.top);
      right = Math.max(right, box.right);
      bottom = Math.max(bottom, box.bottom);
    }
    return { boxes, bounds: boxes.length ? new DOMRect(left, top, right - left, bottom - top) : null, x: 0, y: 0 };
  }

  function shift(element: HTMLElement, x: number, y: number) {
    const currentX = parseFloat(element.style.getPropertyValue("--drag-x")) || 0;
    const currentY = parseFloat(element.style.getPropertyValue("--drag-y")) || 0;
    element.style.setProperty("--drag-x", `${currentX + x}px`);
    element.style.setProperty("--drag-y", `${currentY + y}px`);
  }

  function move(element: HTMLElement, x: number, y: number) {
    shift(element, x, y);
    element.setAttribute("data-drag-moved", "");

    // Counter only the outermost detached blocks; their contents stay put with them.
    for (const child of element.querySelectorAll<HTMLElement>("[data-drag-moved]")) {
      if (child.parentElement!.closest("[data-drag-moved]") === element) shift(child, -x, -y);
    }
  }

  function stopMomentum() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function obstacles(element: HTMLElement) {
    const parents = new Set<Element | null>();
    for (let node: Element | null = element; node; node = node.parentElement!.closest("[data-drag]")) {
      parents.add(node.parentElement!.closest("[data-drag]"));
    }
    return [...document.querySelectorAll<HTMLElement>("[data-drag]")].filter((other) =>
      other !== element && !other.contains(element) && !element.contains(other) &&
      parents.has(other.parentElement!.closest("[data-drag]")) && other.getClientRects().length
    );
  }

  // Limit outward movement without snapping a block back inside the page.
  function pageDelta(start: number, size: number, delta: number, limit: number) {
    const min = size > limit ? grip - size : 0;
    const max = size > limit ? limit - grip : limit - size;
    if (delta < 0) return Math.max(delta, Math.min(0, min - start));
    return Math.min(delta, Math.max(0, max - start));
  }

  function collisionDelta(body: DragBody, delta: number, axis: "x" | "y", boxes: DOMRect[], crossOffset = 0) {
    const horizontal = axis === "x";
    const offset = body[axis];
    crossOffset += horizontal ? body.y : body.x;
    for (const rect of body.boxes) {
      if (!delta) break;
      const start = (horizontal ? rect.left : rect.top) + offset;
      const end = (horizontal ? rect.right : rect.bottom) + offset;
      const crossStart = (horizontal ? rect.top : rect.left) + crossOffset;
      const crossEnd = (horizontal ? rect.bottom : rect.right) + crossOffset;
      for (const box of boxes) {
        if (crossEnd <= (horizontal ? box.top : box.left) || crossStart >= (horizontal ? box.bottom : box.right)) continue;
        const gap = delta > 0 ? (horizontal ? box.left : box.top) - end : (horizontal ? box.right : box.bottom) - start;
        if (delta > 0 && gap >= 0 && gap < delta) delta = gap;
        if (delta < 0 && gap <= 0 && gap > delta) delta = gap;
        if (!delta) return 0;
      }
    }
    return delta;
  }

  function translate(element: HTMLElement, body: DragBody, dx: number, dy: number, others?: DOMRect[]) {
    const rect = body.bounds;
    let x = rect ? pageDelta(rect.left + body.x, rect.width, dx, root.scrollWidth) : dx;
    let y = rect ? pageDelta(rect.top + body.y, rect.height, dy, root.scrollHeight) : dy;
    if (others) {
      x = collisionDelta(body, x, "x", others);
      y = collisionDelta(body, y, "y", others, x);
    }
    if (x || y) {
      move(element, x, y);
      body.x += x;
      body.y += y;
    }
    return { x: x !== dx, y: y !== dy };
  }

  function throwElement(element: HTMLElement, vx: number, vy: number) {
    const body = measureDragBody(element);
    if (!body.bounds) return;
    const others = obstacles(element).flatMap((other) => visibleBoxes(other));
    let previous = performance.now();
    function tick(now: number) {
      if (!enabled() || !element.getClientRects().length) return stopMomentum();
      const elapsed = Math.max(0, Math.min(now - previous, 32));
      previous = now;
      const hit = translate(element, body, vx * elapsed, vy * elapsed, others);
      if (hit.x) vx *= -0.5;
      if (hit.y) vy *= -0.5;
      const damping = Math.exp(-elapsed / 280);
      vx *= damping;
      vy *= damping;
      if (Math.hypot(vx, vy) < 0.02) return stopMomentum();
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Element) || !enabled() || event.pointerType !== "mouse" || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    const element = event.target.closest<HTMLElement>("[data-drag]");
    if (!element) return;
    stopMomentum();
    gesture = { element, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      startX: event.clientX, startY: event.clientY, samples: [{ x: event.clientX, y: event.clientY, time: event.timeStamp }], body: null };
  });

  document.addEventListener("selectstart", (event) => {
    if (gesture) event.preventDefault();
  });
  document.addEventListener("dragstart", (event) => {
    if (gesture) event.preventDefault();
  });

  document.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (!enabled()) return endGesture(event, false);
    if (!gesture.body) {
      if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 5) return;
      gesture.element.setPointerCapture(event.pointerId);
      gesture.element.style.setProperty("--drag-layer", String(++layer));
      root.setAttribute("data-dragging", "");
      root.setAttribute("data-drag-layout", "");
      gesture.body = measureDragBody(gesture.element);
    }
    translate(gesture.element, gesture.body, event.clientX - gesture.x, event.clientY - gesture.y);
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    gesture.samples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
    gesture.samples = gesture.samples.filter((sample) => event.timeStamp - sample.time <= 100);
  });

  function endGesture(event: Pick<PointerEvent, "pointerId"> & Partial<Pick<PointerEvent, "timeStamp" | "clientX" | "clientY">>, release: boolean) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const current = gesture;
    gesture = null;
    root.removeAttribute("data-dragging");
    if (!current.body) return;
    if (current.element.hasPointerCapture(event.pointerId)) current.element.releasePointerCapture(event.pointerId);
    if (!release) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    const first = current.samples[0];
    const elapsed = event.timeStamp! - first.time;
    const dx = event.clientX! - first.x;
    const dy = event.clientY! - first.y;
    const distance = Math.hypot(dx, dy);
    if (!reducedMotion.matches && distance >= 8 && elapsed > 0 && event.timeStamp! - current.samples.at(-1)!.time < 100) {
      const speed = Math.min(distance / elapsed, 1.5);
      throwElement(current.element, dx / distance * speed, dy / distance * speed);
    }
  }

  document.addEventListener("pointerup", (event) => endGesture(event, true));
  document.addEventListener("pointercancel", (event) => endGesture(event, false));
  document.addEventListener("lostpointercapture", (event) => endGesture(event, false));
  document.addEventListener("click", (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  window.addEventListener("scroll", stopMomentum, { passive: true });
  function cancelInteraction() {
    stopMomentum();
    if (gesture) endGesture({ pointerId: gesture.pointerId }, false);
  }
  window.addEventListener("site:sectionchange", cancelInteraction);
  window.addEventListener("blur", cancelInteraction);
})();
