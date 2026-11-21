{
  lib,
  stdenvNoCC,
  bun,
  makeWrapper,
  static-web-server,
}:
let
  siteDeps = stdenvNoCC.mkDerivation {
    name = "cumcraft-site-deps-${
      builtins.substring 0 12 (builtins.hashFile "sha256" ../site/bun.lock)
    }";
    src = lib.fileset.toSource {
      root = ../site;
      fileset = lib.fileset.unions [
        ../site/package.json
        ../site/bun.lock
      ];
    };
    nativeBuildInputs = [ bun ];
    dontConfigure = true;
    buildPhase = ''
      runHook preBuild
      export HOME="$TMPDIR"
      bun install --frozen-lockfile --ignore-scripts --linker hoisted
      runHook postBuild
    '';
    installPhase = ''
      runHook preInstall
      mv node_modules "$out"
      runHook postInstall
    '';
    outputHashMode = "recursive";
    outputHash = "sha256-UCV9RErro+kVbkuglUzCU4Xsn/g5rhBntlIAI6AdM5E=";
  };
in
stdenvNoCC.mkDerivation {
  pname = "cumcraft-website";
  version = "1";
  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.unions [
      ../site
      ../client/pack.json
      ../server.json
      ../server-icon.png
    ];
  };
  nativeBuildInputs = [
    bun
    makeWrapper
  ];
  dontConfigure = true;
  buildPhase = ''
    runHook preBuild
    cd site
    cp -r ${siteDeps} node_modules
    export HOME="$TMPDIR"
    export CUMCRAFT_RELEASES_FILE="$PWD/releases.json"
    export CUMCRAFT_MAP_URL="https://mine.cum.army/map/"
    bun run build
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p "$out/share"
    cp -r dist "$out/share/cumcraft-website"
    makeWrapper ${lib.getExe static-web-server} "$out/bin/cumcraft-website" \
      --add-flags "--root $out/share/cumcraft-website"
    runHook postInstall
  '';
  meta.mainProgram = "cumcraft-website";
}
