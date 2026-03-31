# 💎 DIAMOND DRONES — LAUNCH CHECKLIST

## Pre-Deploy
- [ ] Generate all Diamond Shop videos (100 diamond drone videos) via FAL
- [ ] Generate all Cinema Reel videos (10 x 1min with soundtrack) via FAL
- [ ] Generate all Gallery stills (1000 FAL blind mint images) via Batch Studio
- [ ] Upscale chosen Gallery stills to 4x
- [ ] Upload all assets to Pinata — confirm each CID is pinned
- [ ] Create brand in admin: `drones-of-suburbia`
- [ ] Create 3 collections in admin:
  - `diamond-shop` (100 NFTs, choose-mint, video)
  - `cinema` (10 NFTs, choose-mint, video + audio)
  - `gallery` (1000 NFTs, blind mint, still images)
- [ ] Add all NFTs + metadata to each collection

## Contract Deploy
- [ ] Deploy 3 separate contracts (one per collection)
- [ ] Set BASE_URI on each contract immediately to:
  `https://ruthven-world-production.up.railway.app/api/nfts/metadata/`
- [ ] Verify BASE_URI on Etherscan straight after deploy:
  - Go to contract → Read Contract → tokenURI → enter `0` → confirm URL is correct
- [ ] Set mint price, mint windows, max supply on each contract
- [ ] Test a mint on each contract before launch

## Launch Day
- [ ] Trigger OpenSea metadata refresh via API immediately after first mint
- [ ] Confirm images showing on OpenSea within 10 mins of first mint
- [ ] Check withdraw function — mint proceeds sit in contract until withdrawn
- [ ] Post launch content across social channels

## OpenSea Metadata Refresh Command
```bash
curl -X POST "https://api.opensea.io/api/v2/chain/ethereum/contract/CONTRACT_ADDRESS/nfts/TOKEN_ID/refresh" \
  -H "accept: application/json" \
  -H "x-api-key: af9009e549b34a7bbb52874d38a397a4"
```

## Common Fixes
- If images not showing: check tokenURI on Etherscan read contract
- If tokenURI is wrong: call setBaseURI on write contract from owner wallet
- If metadata_url null on OpenSea: fire API refresh above
- Mint proceeds: call withdraw() on write contract to release ETH to owner wallet
