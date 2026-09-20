/// <reference types="@cloudflare/workers-types" />
// Custom worker entry point.
//
// Kenapa ini ada: worker yang di-generate OpenNext (.open-next/worker.js)
// cuma nge-export `fetch` handler - nggak ada cara buat nge-expose Durable
// Object class dari situ. Solusinya (sesuai dokumentasi resmi OpenNext
// Cloudflare, "Custom Worker"): bikin entry point sendiri yang re-export
// fetch handler hasil build apa adanya (jadi behavior Next.js/OpenNext-nya
// 100% sama, nggak ada yang berubah) + tambahin export Durable Object di
// sini.
//
// wrangler.jsonc "main" diarahkan ke file ini, bukan ke .open-next/worker.js
// langsung.

// @ts-ignore - ".open-next/worker.js" baru ada setelah `next build` +
// `opennextjs-cloudflare build` dijalankan, jadi TypeScript nggak bisa
// resolve filenya sebelum proses build itu selesai.
import { default as handler } from '../.open-next/worker.js';

export { EdgeGuardDO } from './durable-objects/edge-guard';

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;
