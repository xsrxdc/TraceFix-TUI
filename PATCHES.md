# TraceFix harness — patch discipline

This branch (`tracefix`) turns opencode into **TraceFix's verification-native
agent harness**. Base: upstream tag `v1.17.4` (MIT — LICENSE retained).

## Rules (read before changing anything)

1. **Thin fork.** Changes live in ADDITIVE modules (new TUI panels, new commands,
   new session modes) wherever possible. Scattered edits to core loop code are a
   last resort and each one must be listed in the manifest below.
2. **Upstream-first.** Anything generic (bug fixes, harness improvements that
   aren't TraceFix-specific) goes to sst/opencode as a PR — every accepted PR
   makes this fork thinner.
3. **CLI compatibility contract.** The following MUST keep working exactly like
   upstream, because all TraceFix Python orchestration (runtime adapter,
   `tracefix design`, driver.py) depends on them and must run against EITHER
   this fork or stock opencode (`--opencode-bin` switches):
   - `run [message] --agent <key> --format json --dir <path>` + JSONL event
     schema (`{type, timestamp, sessionID, part}`)
   - `OPENCODE_CONFIG_CONTENT` env config injection (mcp / agent / permission)
   - permission keys incl. `<mcpServer>_<tool>` gating and `doom_loop`
4. **Track releases, not main.** Upstream history is NOT always linear across
   releases (verified: v1.15.13 → v1.17.4 had a history rewrite — naive rebase
   replays ancient commits and conflicts). Sync procedure:
   ```bash
   git fetch origin --tags
   git checkout -B tracefix vX.Y.Z          # recreate the branch at the new tag
   git cherry-pick <each patch from the manifest, in order>
   bun install                               # then run the validation below
   ```
   Update "Base" above. Cadence: every 1–2 upstream releases. This is also why
   the patch manifest matters: it IS the cherry-pick list.

## Validation after any change / rebase

```bash
bun install   # requires bun >= 1.3.14 (repo packageManager pin)
bun run --cwd packages/opencode --conditions=browser src/index.ts --version
# compile the real binary (single platform, no embedded web UI — we cut `web`):
bun run packages/opencode/script/build.ts --single --skip-embed-web-ui
#   → packages/opencode/dist/tracefix-tui-darwin-arm64/bin/opencode (~92MB)
# zero-modification compat probe (from the tracefix-public repo):
tracefix design "Two agents ping and pong exchange greetings through one channel." \
  --name p0_probe --timeout 75 --model openai/gpt-5.4 \
  --opencode-bin "bun run --cwd $(pwd)/packages/opencode --conditions=browser src/index.ts"
# expect: status TIMEOUT, events > 0, a real ir.json in the probe workspace
```

## Patch manifest

One row per commit on top of the base tag, in cherry-pick order (`git log
--oneline v1.17.4..tracefix` must match this list bottom-up).

| # | Commit subject | Area | Why | Upstreamable? |
|---|----------------|------|-----|---------------|
| 1 | slim to the CLI/TUI closure | deletes 12 packages + cloud/CI infra | lean fork: keep only what the binary build reaches | no |
| 2 | rename the face to tracefix-tui | scriptName, logo, wordmark | branding; compat surface (env vars, paths) untouched | no |
| 3 | cut the command surface 23→12 | src/index.ts, cli/cmd/* | verification harness doesn't need acp/account/upgrade/web/github/pr/db/... | no |
| 4 | build works on the slim tree | packages/script TEAM_MEMBERS fallback | build script read a deleted CI file | yes (graceful fallback) |
| 5 | native /design | agent/designer + command/design templates | the TraceFix designer agent + slash command | no |
| 6 | harness resolves the verification toolchain | tool/shell.ts shellEnv PATH injection | `tla-verify-pluscal` on PATH without venv activation | no |
| 7 | designer default + user-visible rebrand | tui strings, GO_UPSELL off | no upstream product upsells/titles in our TUI | no |
| 8 | designer is THE agent | agent/agent.ts (build/plan hidden, sort default) | single-purpose harness: designer is the only primary | no |
| 9 | .env auto-load + designer purple | src/index.ts middleware, agent color | provider keys work without `source .env` | partly (env loader) |
| 10 | kill self-update | cli/tui/worker.ts, cli/upgrade.ts stub | fork must never replace itself with upstream via autoupdate / curl\|sh | no |
| 11 | drop cloud-feature dead weight | packages/cli removed; TUI share/org/workspace dialogs, Go-upsell art, stale tips | features tied to opencode.ai cloud or deleted commands | no |

Dormant-but-kept (deliberate): server-side `/session/share` routes, `account/`,
`control-plane/`, `sync/` modules (never activate without an opencode.ai login;
deleting them entangles app-runtime/storage/openapi and makes every upstream
sync conflict). The 24 bundled `@ai-sdk/*` providers (~40% of binary size) stay
until size actually hurts — cutting them diverges from upstream provider.ts.

Runtime flags the fork relies on (set by the Python harness for headless
reproducibility, optional in the TUI): `OPENCODE_DISABLE_MODELS_FETCH=1`
(freeze the models.dev catalog snapshot), `OPENCODE_DISABLE_LSP_DOWNLOAD=1`
(no on-demand LSP binary downloads). Auto-update needs no flag — patch 10
removes it at the source.
