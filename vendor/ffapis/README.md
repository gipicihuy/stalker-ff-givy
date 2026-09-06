# Vendored ffapis (patched for Cloudflare Workers)

The published `ffapis@1.6.0` npm package had two problems that don't show up
on a normal Node.js server but break it on Cloudflare Workers:

1. **Broken npm packaging.** `package.json`'s `files` field only whitelisted
   `dist/index.*`, but the ESM build (via tsup) splits shared code into
   separate chunk files (e.g. `chunk-XXXX.mjs`, `crypto-XXXX.mjs`). Those
   chunk files were excluded from the published npm tarball, so
   `dist/index.mjs` ended up importing files that don't exist. This broke
   `opennextjs-cloudflare build` (esbuild "Could not resolve ./chunk-....mjs").

2. **Runtime filesystem reads.** The library loaded its `.proto` schemas,
   `config/settings.yaml`, and `config/credentials/*.yaml` guest-login pools
   via `fs.readFileSync` at runtime, relative to the installed package's own
   folder. That works fine on a normal Node server, but Cloudflare Workers
   has no real filesystem (even with the `nodejs_compat` flag), so every
   ffapis call failed at runtime with a 500 once deployed (`/api/search`
   etc.), even though the build itself succeeded.

## What's in this folder

This is a patched build of `ffapis@1.6.0`, built from
https://github.com/rifancorteza/ffapis with source changes so that:

- `.proto` files are pre-compiled to JSON descriptors (`protobuf.Root.fromJSON`)
  and imported as normal JS/JSON modules instead of read from disk
  (`protobuf.load(path)`).
- `config/settings.yaml` and `config/credentials/*.yaml` are pre-converted to
  JSON and imported directly (embedded at build time) instead of read via `fs`.
- `data/items.json` (~4.5MB, ~430KB gzipped) is imported as a JSON module
  instead of read via `fs`.

No code path in this build calls `fs` anymore, so it works the same on a
normal Node server and on Cloudflare Workers / other edge runtimes.

## Updating

If you need to pull in a newer ffapis release:

1. Clone https://github.com/rifancorteza/ffapis and apply the same pattern:
   remove all `fs.readFileSync`/`resolveProjectFile`/`resolveProjectDir`
   usage in `src/lib/*.ts`, replacing each with a static import of
   pre-generated JSON (proto descriptors via
   `(await protobuf.load(protoPath)).toJSON()`, yaml files converted to
   `.json` once at build time).
2. `npm install && npm run build`.
3. Copy the resulting `dist/` folder into `vendor/ffapis/dist` here.
