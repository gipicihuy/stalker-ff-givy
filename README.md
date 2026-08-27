# Free Fire Stalk

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Struktur

```
app/layout.tsx     root layout
app/globals.css     token warna + font-face GFF Latin
app/page.tsx        semua logic + UI (formatter, estimasi topup, tampilan)
pages/api/ff.ts     GET /api/ff?uid=... proxy ke adenpedia.my.id
public/image/       taruh manual: default-avatar.png, level.png, exp.png, prime.png, region.png, skor.png
public/fonts/       taruh manual: GFF-Latin-Thin/Regular/Medium/Bold.ttf
```

## Deploy

```bash
npx vercel --prod
```
