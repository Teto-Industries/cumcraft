{
  config,
  lib,
  pkgs,
  ...
}:

let
  mods = builtins.fromJSON (builtins.readFile ../mods.json);
  publicMods = lib.filterAttrs (_: mod: mod ? url) mods;
  localMods = lib.filterAttrs (_: mod: !(mod ? url)) mods;
  localPaths = map (name: "mods/${name}") (builtins.attrNames localMods);
  defaults = "${../config}";
  inherit (config.services.cumcraft.easyAuth) passwordFile;
in
{
  options.services.cumcraft = {
    enable = lib.mkEnableOption "Cumcraft Minecraft server";
    easyAuth.passwordFile = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = ''
        Runtime path to the EasyAuth global password. When set, Cumcraft enables
        global-password login and reads the password at server startup. Otherwise
        it leaves the existing global-password settings alone.
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
        package = pkgs.fabricServers.fabric-26_2.override {
          jre_headless = pkgs.jdk25_headless;
        };
        jvmOpts = lib.concatStringsSep " " (
          [
            "-Xms2G -Xmx4G -XX:MaxDirectMemorySize=1G -XX:MaxMetaspaceSize=512M"
            "-Dfabric.modsFolder=.cumcraft-mods"
          ]
          ++ lib.optional (localPaths != [ ]) (
            lib.escapeShellArg "-Dfabric.addMods=${lib.concatStringsSep ":" localPaths}"
          )
        );
        serverProperties = {
          difficulty = "normal";
          player-idle-timeout = 0;
          spawn-protection = 0;
          server-port = 25569;
          motd = "<3";
          online-mode = false;
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
          }) publicMods
        );
        extraStartPre = ''
          ${lib.concatMapStringsSep "\n" (path: ''
            if ! test -r ${lib.escapeShellArg path}; then
              echo ${lib.escapeShellArg "Missing or unreadable host-local mod: ${path}"} >&2
              exit 1
            fi
          '') localPaths}

          while IFS= read -r -d "" source; do
            target="config/''${source#${defaults}/}"
            if [ ! -e "$target" ] && [ ! -L "$target" ]; then
              mkdir -p "$(dirname "$target")"
              cp "$source" "$target"
              chmod u+w "$target"
            fi
          done < <(find ${lib.escapeShellArg defaults} -type f -print0)

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
