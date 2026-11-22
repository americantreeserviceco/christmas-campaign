# Christmas Projects

A private working collection for the American Tree Colorado Christmas projects.

| Project | Entry point |
| --- | --- |
| Christmas Dr. Troy Advent calendar | [Open the date-gated calendar](advent/index.html). Doors open December 25 through January 5 at midnight Mountain Time. |
| Twelve Days of Tree-mendous Cheer | [Open the all-days audio preview](advent/american-tree-advent-preview.html). Review only. The preview opens every door immediately. |
| Santa’s Toy Shop | [Play the clicker](games/santas-toy-shop/index.html) or read the [production playbook](games/santas-toy-shop/production-playbook.md). |
| Christmas Ornament Wheel | [Play the standalone wheel](games/ornament-wheel/index.html). |
| Campaign preview and games | [Open the campaign hub](campaign/preview/index.html) for the reel, Elf Workshop Tycoon, and Christmas Roulette. |
| Campaign kit | [Read the campaign playbook](campaign/playbook.md) and [open the printable calendar](campaign/christmas-campaign/printable-calendar.html). |
| Dashboard integration | [Review the Toy Shop patch](integrations/american-tree-dashboard/american-tree-toy-shop.patch). The seasonal dashboard page snapshots use dashboard-specific navigation and assets. |

Open the HTML entry points from a local checkout. Preserve the folder layout for games and campaign assets. The twelve original ornament PNGs are in `assets/ornaments/`. Santa’s Toy Shop can load them through its artwork picker. The matching sequence of MIDI and MP3 tracks in `assets/audio/` was extracted from the downloaded audio preview.

The separately maintained [full American Tree Christmas Advent edition](https://chatgpt.com/library?file_id=libfile_6c4fdac7decc81918c9b1ea53f06ead1&account_id=personal) could not be retrieved for this import. Its locally available preview and the independent date-gated Dr. Troy calendar are included.

## Game regression tests

With Node.js, Playwright, and its Chromium browser installed, serve the checkout
with `python3 -m http.server 8765 --bind 127.0.0.1`. In another terminal, run
`node --test tests/christmas-games.cjs`. Set `PLAYWRIGHT_MODULE` to the module path
if Playwright is installed outside the checkout, or `GAMES_URL` to a different
local server URL.
