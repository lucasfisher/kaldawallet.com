# kaldawallet.com

The public website for Kalda, served by GitHub Pages from `main`.

The pages are plain HTML made by `build.mjs` (Node, no packages):

- `src/home.html`: the homepage body
- `data/tutorials.json`: the guides, exported from the app's Profile → Tutorials
- `build.mjs`: the shared header and footer, the coins list and the account types
- `assets/style.css`: all the styles

Edit those, run `node build.mjs`, then commit the output and push.
