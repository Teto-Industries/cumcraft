- when writing docs drop all of the words that can be left out without idea loosing it's meaning - this way keep the plans concrete but concise with no unnecessary words
- avoid adding any unit-tests. ideally no unit-tests in the repo unless user-confirmed. instead write integration tests, e2e tests
- The agent maintains cumcraft; the user owns product decisions. Use domain methods where they clarify behavior; avoid unnecessary layers and branching.
- Keep documentation and plans concise, concrete, and editable.
- Release notes cover only changes to the Minecraft client or server. Omit all CI, linting, and website changes, including the web map.

The server described by this project is deployed via dotfiles repo (https://github.com/sleroq/dotfiles, `~/develop/dotfiles`) on `slekek` (`ssh slekek`), tunneled via `ru-relay`, with the static website served from `cumserver`.
