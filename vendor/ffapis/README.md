# Vendored ffapis

The published `ffapis@1.6.0` npm package has a packaging bug: its `package.json`
`files` field only whitelists `dist/index.*`, but the ESM build (via tsup)
splits shared code into separate chunk files (e.g. `chunk-XXXX.mjs`,
`crypto-XXXX.mjs`). Those chunk files get excluded from the published npm
tarball, so `dist/index.mjs` ends up importing files that don't exist,
breaking any ESM bundler (including the esbuild step in
`@opennextjs/cloudflare build`).

This folder is a full local build of ffapis@1.6.0 straight from
https://github.com/rifancorteza/ffapis (commit at time of build), including
the chunk files, so it can be used as a `file:` dependency instead of the
broken npm package.

To update: clone the ffapis repo, `npm install && npm run build`, then copy
`dist/`, `proto/`, `config/`, `data/` here again.

Note: ffapis reads `proto/`, `config/`, `data/` files via `fs.readFileSync`
relative to its own package root at runtime. On Cloudflare Workers this only
works for files actually bundled/deployed alongside the worker - if the
`/api/search` (or other ffapis-backed) endpoint throws a file-not-found error
after deploy, that's the next thing to fix (likely needs those files copied
into the Workers assets, or the relevant data inlined).
