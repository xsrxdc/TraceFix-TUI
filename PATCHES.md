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

| # | Area | Files | Why | Upstreamable? |
|---|------|-------|-----|---------------|
| — | (none yet — P0 is a clean pin at v1.15.13) | | | |
