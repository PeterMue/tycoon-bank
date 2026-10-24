# 🏦 TycoonBank — Digital Board Game Banker

A touch-first, client-side web application designed for iPad / tablet tabletop gaming and desktop browsers. It replaces physical cash in Monopoly and high-stakes board games with a central Bank Vault and customizable Player Credit Cards.

Runs **100% in the browser** with **zero backend dependencies**, making it instantly deployable to **GitHub Pages**.

---

## ✨ Features

- **📱 iPad Tabletop Layout**: Place your iPad in the center of the table. The central Bank Vault is surrounded by player cards. Players sitting opposite the screen can rotate their credit card 180° for easy reading.
- **💳 Credit Card Player Accounts**: Each player gets a realistic credit card with EMV chip, contactless wave icon, custom metallic theme (Gold, Obsidian, Sapphire, Emerald, Ruby, etc.), and custom avatar (🎩, 🏎️, 🐈, 🚢, 👑, etc.).
- **👆 Drag & Drop & Tap Transfers**:
  - Drag Player Card onto another Player Card to pay rent/trade.
  - Drag Player Card onto the Central Vault to pay taxes/fines or buy property.
  - Drag the Central Vault onto a Player Card to pay out Pass GO or mortgage rewards.
  - Or tap the dedicated **"Transfer"** and **"Pass GO"** buttons.
- **⚡ Smart Multiplier Keypad (2 + Mio = 2.000.000)**:
  - Formats large amounts clearly with European (`2.000.000 €`) or US (`$2,000,000`) separators.
  - Type `2` and tap `Mio` to complete `2.000.000`. Type `2.5` and tap `Mio` for `2.500.000`.
  - Live spoken words preview (*"2 Millionen"* / *"2 Million"*) prevents accidental overpayments.
- **🌍 Multi-Lingual (German 🇩🇪 & English 🇬🇧)**:
  - Full translations for German and English.
  - Localized units: `Tsd / k`, `Mio`, `Mrd / B`.
  - Localized action buttons: *"Über Los (+2 Mio)"* / *"Pass GO (+2M)"*.
- **⏮️ Audit Ledger with 1-Click Undo**:
  - Full chronological transaction history.
  - Accidentally transferred the wrong amount or to the wrong player? Hit **Undo** to instantly restore balances.
  - Export transaction log to CSV.
- **🔗 URL-Hash State Sharing & QR Code**:
  - Encodes the full game state into a compressed URL hash via `lz-string`.
  - Share the link or display the on-screen QR Code for friends to scan with their phones or tablets.
  - Full offline auto-save to `localStorage`.
- **🔊 Web Audio API Synthesizer**:
  - Zero-dependency audio effects (cash register "cha-ching", card swipes, victory chimes).
- **⚙️ Configurable Game Rules**:
  - Starting balance (e.g. 15.000.000 or classic 1.500).
  - Pass GO reward (e.g. 2.000.000 or 200).
  - Currency symbol (€, $, £, ℳ, CHF) and separator style.

---

## 🚀 Quick Start

### 1. Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/monopoly-bank.git
cd monopoly-bank

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### 2. Run Tests
```bash
npm run test
```

### 3. Build for Production
```bash
npm run build
```
The output will be generated in the `dist/` directory, ready to be hosted on any static web host or GitHub Pages.

---

## 🌐 Deploy to GitHub Pages

This repository includes a preconfigured GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically build and publish your app!

---

## ⚖️ Trademark Disclaimer

*Monopoly* is a registered trademark of Hasbro, Inc. This project is an independent open-source utility for board game enthusiasts and is not affiliated with, endorsed by, or sponsored by Hasbro.
