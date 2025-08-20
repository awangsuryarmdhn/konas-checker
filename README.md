# Monad Wallet Analyzer (Full Starter)

This is a starter Next.js app (ready for Vercel) that includes:
- Frontend UI (pages/index.js)
- Serverless APIs: /api/analyze (fetch explorer), /api/upload (upload to Web3.Storage)
- Sybil Score card generator (client-side canvas) with preview and IPFS upload
- Tailwind via CDN for fast styling

## Quick start (local)
1. Copy repository and create `.env.local` from `.env.example`.
2. Install dependencies:
   ```
   npm install
   ```
3. Run dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import project in Vercel (vercel.com/new).
3. Add Environment Variables in Vercel dashboard:
   - EXPLORER_API_BASE
   - EXPLORER_API_KEY
   - WEB3STORAGE_TOKEN
   - NEXT_PUBLIC_IMGUR_CLIENT_ID (optional)
4. Deploy.

## Notes
- Do NOT commit `.env.local` containing secrets.
- Explorer must provide an Etherscan-compatible `account&action=txlist` endpoint for `/api/analyze` to work as-is.
