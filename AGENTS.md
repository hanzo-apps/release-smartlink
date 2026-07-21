# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Dropmark, a single-release smart link. Vite + React 19 + `@hanzo/gui` +
`@hanzo/iam` + `@hanzo/base`. Keep it real — no fabricated UI or metrics.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this). Absolute
fills need a `position="relative"` parent. `schema.sql` (`release`, `links`) is
the Base data contract. Prove changes with `npm run build` (tsc + vite). Never
build a container image locally — Hanzo Cloud owns deploys.
