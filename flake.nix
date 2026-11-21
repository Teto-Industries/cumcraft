{
  description = "Cumcraft Minecraft server";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz";
    nix-minecraft.url = "github:Infinidoge/nix-minecraft";
    nix-minecraft.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { nixpkgs, nix-minecraft, ... }: {
    packages = nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" ] (system: {
      website = nixpkgs.legacyPackages.${system}.callPackage ./nix/website.nix { };
    });
    nixosModules.default = {
      imports = [
        nix-minecraft.nixosModules.minecraft-servers
        ./nix/server.nix
      ];
      nixpkgs.overlays = [ nix-minecraft.overlay ];
    };
  };
}
