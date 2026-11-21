# Cumcraft

![Cumcraft server icon](server-icon.png)

This repository defines the Cumcraft Minecraft server. The [NixOS flake](flake.nix) runs Fabric through [nix-minecraft](https://github.com/Infinidoge/nix-minecraft), pins mod versions in [`mods.json`](mods.json), and copies defaults from [`config/`](config/) only when a config file is missing.

Existing configs stay on the host; Cumcraft updates only the EasyAuth login policy and reads its password from a host file. The world and player data stay on the host. The Traverse JAR is supplied separately.

Report bugs, suggest features, or flag mod compatibility problems in [Issues](https://github.com/Teto-Industries/cumcraft/issues).
