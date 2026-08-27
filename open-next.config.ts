import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// App ini tidak pakai ISR (getStaticProps + revalidate), jadi tidak perlu
// override incrementalCache ke R2. Kalau nanti butuh ISR, tambahkan R2
// binding di wrangler.jsonc lalu import overrides/incremental-cache/r2-incremental-cache
// di sini. Lihat: https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
