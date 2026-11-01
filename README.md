# kaldawallet.com

The public website for Kalda, served by GitHub Pages from `main`.

The pages are plain HTML made by `build.mjs` (Node, no packages):

- `src/home.html`: the homepage body
- `data/tutorials.json`: the guides, exported from the app's Profile → Tutorials
- `build.mjs`: the shared header and footer, the coins list and the account types
- `assets/style.css`: all the styles
- `assets/screens/NN-name.png`: app screenshots (names in build.mjs SHOTS); any that exist are shown
- `tools/make-graphics.py`: draws `assets/trade-graph.svg` and `assets/trade-roads.svg` from `data/swap-graph.json` and `data/swap-roads.json` (the app's swapGraph.ts pairs and roads)

Edit those, run `node build.mjs`, then commit the output and push.
