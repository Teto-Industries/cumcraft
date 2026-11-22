(() => {
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const grip = 48;
  type Gesture = {
    element: HTMLElement;
    pointerId: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    samples: { x: number; y: number; time: number }[];
    dragging: boolean;
  };
  let gesture: Gesture | null = null;
  let frame = 0;
  let layer = 0;
  let suppressClick = false;

  function enabled() {
    return finePointer.matches && !document.body.hasAttribute("data-exploring");
  }

  function bounds(element: HTMLElement) {
    const target = element.dataset.drag === "landmark"
      ? [...element.children].find((child) => child.classList.contains("wrap") && child.getClientRects().length)
      : element;
    return (target || element).getBoundingClientRect();
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
    root.setAttribute("data-drag-layout", "");

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

  // Limit outward movement without pulling an already offscreen block into view.
  function viewportDelta(start: number, size: number, delta: number, limit: number) {
    const min = size > limit ? grip - size : 0;
    const max = size > limit ? limit - grip : limit - size;
    if (delta < 0) return Math.max(delta, Math.min(0, min - start));
    return Math.min(delta, Math.max(0, max - start));
  }

  function collisionDelta(rect: DOMRect, delta: number, axis: "x" | "y", boxes: DOMRect[], crossOffset = 0) {
    const start = axis === "x" ? rect.left : rect.top;
    const end = axis === "x" ? rect.right : rect.bottom;
    const crossStart = (axis === "x" ? rect.top : rect.left) + crossOffset;
    const crossEnd = (axis === "x" ? rect.bottom : rect.right) + crossOffset;
    for (const box of boxes) {
      const otherStart = axis === "x" ? box.left : box.top;
      const otherEnd = axis === "x" ? box.right : box.bottom;
      const otherCrossStart = axis === "x" ? box.top : box.left;
      const otherCrossEnd = axis === "x" ? box.bottom : box.right;
      if (crossEnd <= otherCrossStart || crossStart >= otherCrossEnd) continue;
      if (delta > 0 && end <= otherStart && end + delta > otherStart) delta = otherStart - end;
      if (delta < 0 && start >= otherEnd && start + delta < otherEnd) delta = otherEnd - start;
    }
    return delta;
  }

  function translate(element: HTMLElement, dx: number, dy: number, others?: HTMLElement[]) {
    const rect = bounds(element);
    let x = viewportDelta(rect.left, rect.width, dx, root.clientWidth);
    let y = viewportDelta(rect.top, rect.height, dy, root.clientHeight);
    if (others) {
      const boxes = others.map(bounds);
      x = collisionDelta(rect, x, "x", boxes);
      y = collisionDelta(rect, y, "y", boxes, x);
    }
    if (x || y) move(element, x, y);
    return { x: x !== dx, y: y !== dy };
  }

  function throwElement(element: HTMLElement, vx: number, vy: number) {
    const others = obstacles(element);
    let previous = performance.now();
    function tick(now: number) {
      if (!enabled() || !element.getClientRects().length) return stopMomentum();
      const elapsed = Math.max(0, Math.min(now - previous, 32));
      previous = now;
      const hit = translate(element, vx * elapsed, vy * elapsed, others);
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
      startX: event.clientX, startY: event.clientY, samples: [{ x: event.clientX, y: event.clientY, time: event.timeStamp }], dragging: false };
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
    if (!gesture.dragging) {
      if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 5) return;
      gesture.dragging = true;
      gesture.element.setPointerCapture(event.pointerId);
      gesture.element.style.setProperty("--drag-layer", String(++layer));
      root.setAttribute("data-dragging", "");
    }
    translate(gesture.element, event.clientX - gesture.x, event.clientY - gesture.y);
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
    if (!current.dragging) return;
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
