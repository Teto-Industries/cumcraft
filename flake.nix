{
  description = "Cumcraft Minecraft server";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz";
    nix-minecraft.url = "github:Infinidoge/nix-minecraft";
    nix-minecraft.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nix-minecraft, ... }: {
    nixosModules.default = {
      imports = [
        nix-minecraft.nixosModules.minecraft-servers
        ./nix/server.nix
      ];
      nixpkgs.overlays = [ nix-minecraft.overlay ];
    };
  };
}
