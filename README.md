# BidLab - Prebid.js Interactive Demo

BidLab is a valid HTML5 demonstration environment for Prebid.js, allowing developers to see real-time bidding in action with mock adapters and clear console logging.

## Features
- **Real-time Auction Logs**: See exactly what's happening during the bidding process.
- **Mock Adapters**: Includes simulated demand from AppNexus, Rubicon, and OpenX.
- **Dynamic Rendering**: The winning creative is automatically rendered in a secure iframe.
- **Multiple Preview Modes**: Choose the one that fits your environment.

## Project Structure
The project is designed to be flexible, supporting both a modern React/Vite development workflow and a build-less "Regular JavaScript" preview.

- `index.html`: Main entry point for the Vite-based development environment.
- `demo.html`: **Recommended for easy preview.** Uses regular JavaScript (ES Modules) and CDNs for a build-less experience.
- `public/js/`: Contains the build-less version of the application components.
- `src/`: Contains the React/JSX version of the application (requires Node.js).
- `dist/`: Contains the production-optimized build.

## How to Preview

### 1. Simple Preview (Recommended)
This version uses regular JavaScript and requires no installation.
```bash
./preview.sh demo
```
Then open `http://localhost:3000/demo.html` in your browser.

### 2. Standalone Single File
If you want to see everything in one file without any external dependencies other than CDNs:
Open `static-preview.html` directly in your web browser.

### 3. Development Mode (for Engineers)
Requires Node.js and `npm install`.
```bash
./preview.sh
```
This starts the Vite development server with Hot Module Replacement (HMR).

### 4. Production Build
```bash
./preview.sh prod
```

## KPIs & Revenue Model
- **Value Proposition**: Interactive Prebid.js testing environment.
- **Target Customer**: Ad tech developers, publishers, and AdOps teams.
- **Revenue Model**: Freemium tool with premium templates and consulting services.
- **Key Metric**: Demo completions (successful auctions run).
