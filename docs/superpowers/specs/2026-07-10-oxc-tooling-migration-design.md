# Oxc Tooling Migration Design

Date: 2026-07-10

## Goal

Replace the project's ESLint-based linting and import sorting with Oxlint and
Oxfmt while preserving the current code-quality rules, TypeScript checks,
pre-commit protection, and CI behavior.

## Scope

The migration covers developer tooling only:

- Use Oxlint as the JavaScript, TypeScript, React, and Vitest linter.
- Use Oxfmt for formatting and deterministic import/export sorting.
- Remove ESLint, typescript-eslint, ESLint React plugins,
  eslint-plugin-simple-import-sort, and globals.
- Keep `tsc -b` as the TypeScript type checker.
- Keep Vite, Vitest, Bun, Husky, and the existing GitHub Actions workflow.
- Keep the `@src/*` import alias and prohibit `./*` and `../*` source imports.

Direct Oxc transformer or minifier integration is out of scope because Vite 8
already provides the project's build integration through Rolldown.

## Configuration

Create `.oxlintrc.json` with the built-in TypeScript, React, and Vitest plugins.
It will preserve these existing rules:

- Recommended correctness rules for JavaScript and TypeScript.
- React Hooks rules.
- React Refresh `only-export-components`, including `allowConstantExport` and
  the existing `PET_TILES` and `formatTime` allowlist.
- Separate `import type` declarations through
  `typescript/consistent-type-imports`.
- `no-restricted-imports` patterns that reject `./*` and `../*` imports.

The current `src/assets/pets.tsx` React Refresh override remains disabled.

Create `.oxfmtrc.json` using the project's existing double quotes, semicolons,
and two-space indentation. Enable import sorting with separate groups for Node
built-ins, external packages, `@src/*` imports, and type imports. Oxfmt becomes
the single owner of whitespace and import/export ordering.

## Commands And Automation

Update `package.json` scripts:

- `lint`: run Oxlint without changing files.
- `lint:fix`: apply safe Oxlint fixes.
- `format`: write Oxfmt formatting changes.
- `format:check`: verify formatting without changing files.
- `check`: run lint, formatting verification, tests, and the production build.

The Husky pre-commit hook runs `lint` and `format:check`. CI runs the same lint
and formatting checks before tests and build. Existing tests and build commands
remain unchanged.

## Dependency Updates

Add `oxlint` and `oxfmt` as development dependencies and remove the seven
ESLint-related direct dependencies. Regenerate `bun.lock` with Bun.

Oxlint is eligible for the existing Renovate non-major automerge policy. Oxfmt
is still pre-1.0, so add a package rule that disables automerge for `oxfmt`.
Oxfmt updates may still open pull requests and run CI, but require manual merge.

## Migration And Verification

Run Oxfmt once to normalize the repository. Import order may change because
Oxfmt's sorter is not byte-for-byte compatible with simple-import-sort; this is
an accepted one-time migration difference.

The migration is complete when all of the following pass:

- `bun run lint`
- `bun run format:check`
- `bun run test -- --run`
- `bun run build`
- `.husky/pre-commit`

No gameplay behavior, UI output, localization, persistence, or deployed runtime
behavior should change.
