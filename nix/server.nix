{
  config,
  lib,
  pkgs,
  ...
}:

let
  inherit (config.services.cumcraft) bluemap;
  mods = lib.filterAttrs (
    name: mod: lib.elem "server" mod.sides && (name != "bluemap-5.29-fabric.jar" || bluemap.enable)
  ) (builtins.fromJSON (builtins.readFile ../mods.json));
  traverse = ../client/overrides/mods/traverse-9.1.0-beta.1+cumcraft.26.3.jar;
  metadata = builtins.fromJSON (builtins.readFile ../server.json);
  fabricPackage = "fabric-${lib.replaceStrings [ "." ] [ "_" ] metadata.minecraft}";
  managedConfigs = "${../config}";
  pythonWithTomlkit = pkgs.python3.withPackages (ps: [ ps.tomlkit ]);
  inherit (config.services.cumcraft.easyAuth) passwordFile;
in
{
  options.services.cumcraft = {
    enable = lib.mkEnableOption "Cumcraft Minecraft server";
    bluemap = {
      enable = lib.mkEnableOption "BlueMap, accepting its download and use of Mojang Minecraft client assets";
      livePlayers = lib.mkEnableOption "publication of live player locations on the BlueMap web map";
    };
    easyAuth.passwordFile = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = ''
        Runtime path to the EasyAuth global password used for registration by
        players who do not use premium auto-login. If unset, Cumcraft leaves
        the existing global-password settings alone.
      '';
    };
  };

  config = lib.mkIf config.services.cumcraft.enable {
    services.minecraft-servers = {
      enable = true;
      eula = true;
      openFirewall = false;
      servers.cum = {
        enable = true;
        autoStart = true;
        package = pkgs.fabricServers.${fabricPackage}.override {
          loaderVersion = metadata.fabricLoader;
          jre_headless = pkgs.jdk25_headless;
        };
        jvmOpts = "-Xms2G -Xmx4G -XX:MaxDirectMemorySize=1G -XX:MaxMetaspaceSize=512M -Dfabric.modsFolder=.cumcraft-mods";
        serverProperties = {
          difficulty = "normal";
          player-idle-timeout = 0;
          spawn-protection = 0;
          server-port = metadata.server.port;
          motd = "<3";
          online-mode = true;
          max-players = 10;
          white-list = true;
          enable-status = true;
          hide-online-players = true;
          allow-flight = true;
          sync-chunk-writes = false;
        };
        symlinks.".cumcraft-mods" = pkgs.linkFarm "cumcraft-mods" (
          lib.mapAttrsToList (name: mod: {
            inherit name;
            path = pkgs.fetchurl {
              inherit name;
              inherit (mod) url hash;
            };
          }) mods
          ++ [
            {
              name = baseNameOf traverse;
              path = traverse;
            }
          ]
        );
        extraStartPre = ''
          while IFS= read -r -d "" source; do
            install -CDm 0644 "$source" "config/''${source#${managedConfigs}/}"
          done < <(find ${lib.escapeShellArg managedConfigs} -type f -print0)

          ${lib.optionalString bluemap.enable ''
            for source in ${./bluemap/config}/*.conf; do
              install -CDm 0644 "$source" "config/bluemap/$(basename "$source")"
            done
            install -CDm 0644 ${pkgs.writeText "bluemap-plugin.conf" ''
              live-player-markers: ${lib.boolToString bluemap.livePlayers}
              skin-download: false
            ''} config/bluemap/plugin.conf
            install -CDm 0644 ${./bluemap/cumcraft-embed.js} bluemap/web/cumcraft-embed.js
          ''}

          ${pythonWithTomlkit}/bin/python3 ${./configure-distant-horizons.py} ${./distant-horizons.toml}

          ${pkgs.python3}/bin/python3 ${./configure-easyauth.py} ${
            lib.optionalString (passwordFile != null) (lib.escapeShellArg passwordFile)
          }

          if [ ! -e server-icon.png ] && [ ! -L server-icon.png ]; then
            cp ${../server-icon.png} server-icon.png
            chmod u+w server-icon.png
          fi
        '';
      };
    };

    systemd.services.minecraft-server-cum.path = [
      pkgs.git
      pkgs.git-lfs
    ];
  };
}
