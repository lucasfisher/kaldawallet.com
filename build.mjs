// Builds the site's HTML pages: `node build.mjs`, then commit the output.
//  - index.html from src/home.html
//  - guides/ from data/tutorials.json (exported from the app's Profile → Tutorials)
//  - coins.html and accounts/ from the data below
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const NAV = [
  ["/guides/", "Guides"],
  ["/coins.html", "Coins"],
  ["/#accounts", "Accounts"],
  ["/#faq", "FAQ"],
];

function page({ path, title, description, body, current }) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ");
  const fullTitle = title ? `${title} · Kalda Wallet` : "Kalda Wallet";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="https://kaldawallet.com/assets/kalda-logo-512.png">
  <meta property="og:url" content="https://kaldawallet.com${path}">
  <meta name="theme-color" content="#0B0E14">
  <link rel="icon" type="image/svg+xml" href="/assets/kalda-logo.svg">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
  <script>document.documentElement.classList.add("js")</script>
</head>
<body>

<header>
  <div class="wrap nav">
    <a class="brand" href="/" aria-label="Kalda home">
      <img src="/assets/kalda-logo.svg" alt="">
      Kalda
    </a>
    <nav class="nav-links" aria-label="Main">
      ${links}
      <a class="btn btn-primary" href="/#download">Get Kalda</a>
    </nav>
  </div>
  <nav class="subnav" aria-label="Main">
    ${links}
  </nav>
</header>

<main id="top">
${body}
</main>

<footer>
  <div class="wrap foot">
    <a class="brand" href="/"><img src="/assets/kalda-logo.svg" alt="">Kalda</a>
    <span>© <span id="year">2026</span> Kalda. A wallet you look after yourself.</span>
  </div>
</footer>

<script>document.getElementById("year").textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

function write(path, html) {
  const file = path.endsWith("/") ? `${path}index.html` : path;
  const out = `.${file}`;
  mkdirSync(out.slice(0, out.lastIndexOf("/")), { recursive: true });
  writeFileSync(out, html);
}

const head = (crumbs, title, lead) => `
  <div class="page-head">
    <div class="wrap">
      ${crumbs ? `<div class="crumbs">${crumbs}</div>` : ""}
      <h1>${title}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ""}
    </div>
  </div>`;

/* ---------- Account types ---------- */

const ACCOUNTS = [
  {
    key: "personal",
    emoji: "🙂",
    name: "Personal",
    tagline: "Send and receive crypto, simply.",
    intro: "For everyday use. Kalda keeps things simple and does the tricky parts for you.",
    can: [
      "Starts with five coins: Bitcoin, Ethereum, BNB, Zcash and USD Coin. Any coin you hold shows up too.",
      "Send, receive and swap with a few taps.",
      "Private by default. Kalda picks the private way to pay for you.",
      "Add friends with Link Up and pay them by name.",
      "Send secret messages to your contacts.",
      "Short guides open the first time you visit each page, plus tips on the trickier steps.",
    ],
    who: "You want a wallet that just works, without learning how crypto works first.",
    guides: ["wallet-and-phrase", "send-receive", "contacts-link-up", "swaps", "security"],
  },
  {
    key: "business",
    emoji: "💼",
    name: "Business",
    tagline: "Shared wallets, scheduled payments and locks.",
    intro: "For teams, families and anyone who pays on a schedule.",
    can: [
      "Every coin Kalda supports, on your wallet screen.",
      "Family and business wallets: separate XRP wallets that need approval from partners or family.",
      "Scheduled payments: pay someone later, or set up an allowance.",
      "Locks: put XRP away until a date you choose.",
      "Everything a Personal account has.",
    ],
    who: "You share money with others, or you pay people on a schedule.",
    guides: ["xrp-rlusd", "xrp-locks", "shared-wallets", "secret-sharing"],
  },
  {
    key: "investment",
    emoji: "📈",
    name: "Investment",
    tagline: "Hold for the long run, stake and earn.",
    intro: "For holding coins over months and years, and putting them to work.",
    can: [
      "Stake ETH, right from its coin card.",
      "Earn interest on your USDC and USDT.",
      "The risks are explained with every stake, before you confirm.",
      "A Positions tab with everything you hold and everything staked.",
      "A market price check on every swap, so you know you're getting a fair rate.",
      "See how each coin has done since you bought it.",
    ],
    who: "You buy to hold, and want your coins to earn while they wait.",
    guides: ["staking", "gas-saving", "swaps", "network-fees"],
  },
  {
    key: "trading",
    emoji: "📊",
    name: "Trading",
    tagline: "Buy and sell over days or weeks.",
    intro: "For swing trading: buying and selling over days or weeks.",
    can: [
      "A Positions tab with your open trades and how they're doing.",
      "History → Analytics: your stats, your wins and losses, and tips on your trading.",
      "A market price check on every swap, on by default.",
      "See the route a swap takes when it goes through another coin.",
      "A fair warning when you choose it: frequent trading adds up in fees.",
    ],
    who: "You trade often and want to see how your trades are really doing.",
    guides: ["swaps", "swap-flow", "exchange-multi-step", "network-fees"],
  },
  {
    key: "developer",
    emoji: "🛠",
    name: "Developer",
    tagline: "Everything, plus the developer tools.",
    intro: "For people who want to see and control everything.",
    can: [
      "Every feature from every other account type.",
      "Private and public balances shown side by side, so you choose which to use.",
      "Developer Settings for the finer controls.",
      "The developer docs: every guide in full technical depth.",
      "No guides or tips getting in your way.",
    ],
    who: "You know crypto well and want the full picture.",
    guides: ["shielded-zcash", "stealth-addresses", "exchange-thorchain", "exchange-uniswap"],
  },
];

/* ---------- Guides ---------- */

const SECTIONS = JSON.parse(readFileSync("data/tutorials.json", "utf8"));
// Wallet skins aren't shipping, so the site leaves them out.
const DROP = new Set(["wallet-skins"]);
const EDITS = { "notifications": [[", or a wallet skin someone has sent you", ""]] };
for (const s of SECTIONS) {
  s.tutorials = s.tutorials.filter((t) => !DROP.has(t.id));
  for (const t of s.tutorials) {
    for (const [from, to] of EDITS[t.id] ?? []) {
      for (const d of Object.keys(t.body)) t.body[d] = t.body[d].map((b) => b.replace(from, to));
    }
  }
}
const ALL = SECTIONS.flatMap((s) => s.tutorials.map((t) => ({ ...t, section: s.title })));
const byId = Object.fromEntries(ALL.map((t) => [t.id, t]));
const SHOWN_FROM = { business: "Business", investor: "Investment", trader: "Trading", developer: "Developer" };
const LEVELS = [
  ["simple", "Simple"],
  ["detailed", "Detailed"],
  ["complex", "In depth"],
];

function blocks(list) {
  const out = [];
  let bullets = [];
  const flush = () => {
    if (bullets.length) out.push(`<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`);
    bullets = [];
  };
  for (const raw of list) {
    const b = esc(raw);
    if (b.startsWith("• ")) {
      bullets.push(b.slice(2));
      continue;
    }
    flush();
    if (b.startsWith("## ")) out.push(`<h3>${b.slice(3)}</h3>`);
    else if (/^`.*`$/s.test(b)) out.push(`<pre><code>${b.slice(1, -1)}</code></pre>`);
    else out.push(`<p>${b}</p>`);
  }
  flush();
  return out.join("\n        ");
}

const guideCard = (t) => `
        <a class="card" href="/guides/${t.id}.html">
          <h3 style="margin-top:0">${esc(t.title)}${t.shownFrom ? `<span class="tag">${SHOWN_FROM[t.shownFrom]}</span>` : ""}</h3>
          <p>${esc(t.summary)}</p>
        </a>`;

write(
  "/guides/",
  page({
    path: "/guides/",
    title: "Guides",
    current: "/guides/",
    description: "Short guides to every Kalda feature, from your recovery phrase to private payments and swaps.",
    body: `${head("", "Guides", "Every Kalda feature, explained. Each guide has three levels: simple, detailed and in depth.")}
  <div class="page-body">
    <div class="wrap">
      ${SECTIONS.map((s) => `<h2 class="group">${esc(s.title)}</h2>
      <div class="cards">${s.tutorials.map(guideCard).join("")}
      </div>`).join("\n      ")}
      <p class="note">The same guides are in the app, under Profile → Tutorials.</p>
    </div>
  </div>`,
  }),
);

ALL.forEach((t, i) => {
  const prev = ALL[i - 1];
  const next = ALL[i + 1];
  const levels = LEVELS.map(
    ([key, label], n) => `
      <section class="level" id="${key}" role="tabpanel" aria-label="${label}"${n ? '' : ""}>
        <h2>${label}</h2>
        ${blocks(t.body[key])}
      </section>`,
  ).join("");
  write(
    `/guides/${t.id}.html`,
    page({
      path: `/guides/${t.id}.html`,
      title: t.title,
      current: "/guides/",
      description: t.summary,
      body: `${head(`<a href="/guides/">Guides</a> › ${esc(t.section)}`, esc(t.title), esc(t.summary))}
  <div class="page-body">
    <div class="wrap article">
      <div class="tabs" role="tablist" hidden>
        ${LEVELS.map(([key, label], n) => `<button role="tab" data-level="${key}" aria-selected="${n === 0}">${label}</button>`).join("\n        ")}
      </div>${levels}
      <nav class="pager" aria-label="More guides">
        ${prev ? `<a href="/guides/${prev.id}.html"><small>Previous</small>${esc(prev.title)}</a>` : ""}
        ${next ? `<a class="next" href="/guides/${next.id}.html"><small>Next</small>${esc(next.title)}</a>` : ""}
      </nav>
    </div>
  </div>
  <script>
    (function () {
      var tabs = document.querySelector(".tabs"), buttons = tabs.querySelectorAll("button");
      var levels = document.querySelectorAll(".level");
      function show(key) {
        buttons.forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.level === key)); });
        levels.forEach(function (l) { l.hidden = l.id !== key; });
        try { localStorage.setItem("kalda.guideLevel", key); } catch (e) {}
      }
      var saved = null;
      try { saved = localStorage.getItem("kalda.guideLevel"); } catch (e) {}
      tabs.hidden = false;
      buttons.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.level); }); });
      show(saved && document.getElementById(saved) ? saved : "simple");
    })();
  </script>`,
    }),
  );
});

/* ---------- Coins ---------- */

const COIN_GROUPS = [
  {
    title: "Coins",
    coins: [
      ["BTC", "Bitcoin"], ["ETH", "Ethereum"], ["XRP", "XRP"], ["BNB", "BNB"], ["SOL", "Solana"],
      ["DOGE", "Dogecoin"], ["TRX", "TRON"], ["AVAX", "Avalanche"], ["ATOM", "Cosmos"], ["LTC", "Litecoin"],
      ["BCH", "Bitcoin Cash"], ["ADA", "Cardano"], ["XLM", "Stellar"], ["SUI", "Sui"], ["POL", "Polygon"],
      ["NEAR", "NEAR"], ["RUNE", "THORChain"],
    ],
  },
  { title: "Private coins", coins: [["ZEC", "Zcash"], ["XMR", "Monero"]] },
  {
    title: "Dollars and stablecoins",
    coins: [["USDC", "USD Coin"], ["USDT", "Tether"], ["RLUSD", "Ripple USD"], ["EURC", "Euro Coin"], ["AUSD", "AUSD"], ["XAUT", "Tether Gold"]],
  },
  {
    title: "Tokens",
    coins: [
      ["UNI", "Uniswap"], ["LINK", "Chainlink"], ["ARB", "Arbitrum"], ["EIGEN", "Eigen"], ["MANA", "Decentraland"],
      ["PEPE", "Pepe"], ["VIRTUAL", "Virtuals"], ["CAKE", "PancakeSwap"], ["ICP", "Internet Computer"],
    ],
  },
];

const COIN_FEATURES = [
  ["Send, receive and swap", "Every coin here. Swap one for another right in the app, with no exchange account.", "swaps"],
  ["Private payments", "Zcash keeps amounts and senders hidden. Monero is private by default. ETH, BNB and AVAX get a new address for every payment. Bitcoin, Litecoin, Dogecoin and Bitcoin Cash can use a fresh address each time.", "shielded-zcash"],
  ["Secret messages", "Send private notes to your contacts, carried by a tiny Zcash payment.", "secret-messages"],
  ["Digital dollars", "USDC and USDT work on several networks, and Kalda helps you move them for less.", "gas-saving"],
  ["XRP tools", "RLUSD, locks, scheduled payments, and family and business wallets.", "xrp-locks"],
  ["Earn", "Stake ETH, and earn interest on USDC and USDT, with an Investment account.", "staking"],
];

write(
  "/coins.html",
  page({
    path: "/coins.html",
    title: "Coins",
    current: "/coins.html",
    description: "The coins and tokens Kalda supports, and what you can do with them.",
    body: `${head("", "Coins and tokens", "Kalda holds over 30 coins and tokens, all backed up by the same 12 words.")}
  <div class="page-body">
    <div class="wrap">
      ${COIN_GROUPS.map((g) => `<h2 class="group">${g.title}</h2>
      <div class="chips">
        ${g.coins.map(([sym, name]) => `<span class="chip"><b>${name}</b><span>${sym}</span></span>`).join("\n        ")}
      </div>`).join("\n      ")}

      <h2 class="group" style="margin-top:64px">What you can do</h2>
      <div class="cards two">
        ${COIN_FEATURES.map(([title, text, guide]) => `<a class="card" href="/guides/${guide}.html">
          <h3 style="margin-top:0">${title}</h3>
          <p>${text}</p>
          <span class="more">Read the guide →</span>
        </a>`).join("\n        ")}
      </div>
      <p class="note">Personal accounts start with five coins on the wallet screen. Any coin you hold shows up, and you can add the rest under Profile → Coins on my wallet.</p>
    </div>
  </div>`,
  }),
);

/* ---------- Account pages ---------- */

rmSync("accounts", { recursive: true, force: true });
for (const a of ACCOUNTS) {
  write(
    `/accounts/${a.key}.html`,
    page({
      path: `/accounts/${a.key}.html`,
      title: `${a.name} account`,
      current: "/#accounts",
      description: `${a.name} account: ${a.tagline}`,
      body: `${head(`<a href="/#accounts">Account types</a>`, `<span class="emoji">${a.emoji}</span> ${a.name} account`, a.intro)}
  <div class="page-body">
    <div class="wrap split">
      <div class="card">
        <h2 style="font-size:1.4rem;margin-top:0">What it does for you</h2>
        <ul class="checks">
          ${a.can.map((c) => `<li>${c}</li>`).join("\n          ")}
        </ul>
      </div>
      <div style="display:grid;gap:18px">
        <div class="card">
          <h3 style="margin-top:0">Right for you if</h3>
          <p>${a.who}</p>
        </div>
        <div class="card">
          <h3 style="margin-top:0">Good guides to start with</h3>
          <p>${a.guides.map((id) => `<a href="/guides/${id}.html">${esc(byId[id].title)}</a>`).join("<br>")}</p>
        </div>
      </div>
    </div>
    <div class="wrap">
      <p class="note">Kalda asks for your account type when you first open it. You can change it any time on your Profile. Your coins and addresses stay the same; only the layout changes.</p>
      <div class="cards" style="margin-top:32px">
        ${ACCOUNTS.filter((o) => o.key !== a.key).slice(0, 3).map((o) => `<a class="card" href="/accounts/${o.key}.html"><span class="emoji">${o.emoji}</span><h3>${o.name}</h3><p>${o.tagline}</p></a>`).join("\n        ")}
      </div>
    </div>
  </div>`,
    }),
  );
}

/* ---------- Home ---------- */

const accountCards = ACCOUNTS.map(
  (a) => `<a class="card" href="/accounts/${a.key}.html">
          <span class="emoji">${a.emoji}</span>
          <h3>${a.name}</h3>
          <p>${a.tagline}</p>
          <span class="more">What it does →</span>
        </a>`,
).join("\n        ");

write(
  "/index.html",
  page({
    path: "/",
    title: "",
    current: "/",
    description: "Kalda is a crypto wallet you look after yourself. Hold, send, receive and swap coins from one app, with one backup.",
    body: readFileSync("src/home.html", "utf8").replace("<!-- ACCOUNT_CARDS -->", accountCards),
  }),
);

console.log(`Built index, ${ALL.length} guides, coins and ${ACCOUNTS.length} account pages.`);
