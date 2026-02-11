# Distordia Social

An on-chain discussion forum module for the [Nexus blockchain](https://nexus.io/). Posts are stored as immutable on-chain assets, creating a permanent, decentralized social feed.

Built as a [Nexus Wallet](https://github.com/Nexusoft/NexusInterface) module using React and Redux.

## Features

- **On-chain posts** — Each post is a blockchain asset (max 512 characters), permanently stored and publicly verifiable
- **Replies and quotes** — Reference other posts directly on-chain
- **Verification badges** — L1, L2, and L3 tier badges based on DIST token holdings
- **Namespace identity** — Post under your registered Nexus namespace
- **Content warnings** — Flag sensitive content with optional warnings
- **Multiple views** — Social Feed, Namespace Feed, and User Profile tabs
- **Search and filtering** — Filter posts by namespace, verification status, or text content

## Prerequisites

- [Node.js](https://nodejs.org/) (with npm)
- [Nexus Wallet](https://github.com/Nexusoft/NexusInterface/releases/latest) v3.1.5 or later

## Installation

### From a verified release

1. Go to the [latest release](https://github.com/AkstonCap/distordiaNews/releases/latest) and download the zip file.
2. Open Nexus Wallet and navigate to **Settings > Modules**.
3. Drag and drop the zip file into the **Add module** section.
4. Click **Install module** when prompted.

### From source

```bash
git clone https://github.com/AkstonCap/distordiaNews.git
cd distordiaNews
npm install
npm run build
```

Then install in the wallet:

1. Open Nexus Wallet and enable **Developer mode** in settings.
2. Go to **Settings > Modules**.
3. Drag and drop the project folder into the **Add module** section.
4. Click **Install module** when prompted.

The module will appear in the bottom navigation bar of the wallet.

## Development

Start the dev server with hot reload:

```bash
npm run dev
```

This runs a webpack dev server on `http://localhost:24011`. The wallet loads the module from the dev server when installed in developer mode.

### Production build

```bash
npm run build
```

Output is written to `dist/js/app.js`.

## Architecture

```
src/
  index.js              # Entry point, Redux provider setup
  App/
    Main.js             # Tab navigation (Feed, Namespace, Profile)
    news.js             # Social feed view
    namespace.js        # Namespace-filtered feed
    profile.js          # User profile and post history
    ComposePost.js      # Post composer (512 char limit, 1 NXS cost)
  actions/
    createAsset.js      # Creates on-chain post assets via Nexus API
    actionCreators.js   # Redux action creators
  reducers/             # Redux state (ui + settings)
  utils/
    verification.js     # Verification tier lookup with caching
  components/
    styles.js           # Emotion styled components
```

**Key dependencies:**

| Package | Purpose |
|---------|---------|
| `nexus-module` | Nexus Wallet SDK — API calls, UI components, middleware |
| `react-redux` / `redux` | State management |
| `webpack` / `babel` | Build toolchain |

### On-chain post format

Posts are created as JSON assets with these fields:

| Field | Mutable | Description |
|-------|---------|-------------|
| `distordia-type` | No | Always `distordia-post` |
| `distordia-status` | Yes | `official` for active posts |
| `text` | No | Post content (max 512 chars) |
| `cw` | No | Content warning (max 64 chars) |
| `reply-to` | No | Address of parent post |
| `quote` | No | Address of quoted post |
| `tags` | No | Hashtags (max 128 chars) |
| `lang` | No | Language code |

### Verification tiers

Verification badges are assigned based on DIST token holdings registered on-chain:

- **L1** — 1,000 DIST
- **L2** — 10,000 DIST
- **L3** — 100,000 DIST

The registry is read from `distordia:{TIER}-verified-{index}` assets and cached for 5 minutes.

## License

See the repository for license details.
