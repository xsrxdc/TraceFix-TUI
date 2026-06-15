# TraceFix TUI

The native, interactive front end for **[TraceFix](https://github.com/xsrxdc/tracefix-public)** — a research platform that turns a natural-language multi-agent coordination requirement into a **TLA+-verified** protocol and per-agent runtime prompts.

This is a **thin fork of [opencode](https://github.com/sst/opencode)** (MIT). Its only visible agent is the TraceFix `designer`: you describe what your agents need to coordinate, in plain language, and it asks clarifying questions, pauses for your approval of the coordination plan, then derives and TLC-verifies the protocol — all inside the terminal UI. The heavy lifting (the `tla-verify-pluscal` toolchain and the design knowledge) lives in the TraceFix platform repo; this fork is the interactive shell around it.

## Relationship to the TraceFix platform

Two repositories, one product:

| Repo | Role |
|------|------|
| **[tracefix-public](https://github.com/xsrxdc/tracefix-public)** | the Python verification platform: the `tla-verify-pluscal` CLI, the design knowledge, benchmarks, and runtimes |
| **this repo** (`tracefix` branch) | the interactive TUI; its `designer` agent calls `tla-verify-pluscal guide` + the CLI from the platform install |

You do **not** need this fork to use TraceFix. The platform repo offers the same design+verify flow headless (`tracefix design`) and through the Claude Code `/tla-verify-pluscal` skill. Build the TUI only for the native interactive experience.

## Build

```bash
# 1. Install the TraceFix platform first (provides the toolchain + design guide),
#    in a clone of tracefix-public:
pip install -e .
bash scripts/download_tla2tools.sh
tla-verify-pluscal doctor

# 2. Build this fork (needs bun >= 1.3.14; produces a ~92 MB single-file binary):
bun install
bun run packages/opencode/script/build.ts --single --skip-embed-web-ui
# → packages/opencode/dist/tracefix-tui-<platform>/bin/opencode
```

`tracefix-public/tui/build-tui.sh` automates this (clone + build + PATH hint). Launch the binary in any project where the platform is `pip install -e .`'d; the designer resolves `tla-verify-pluscal` and the design guide from that install regardless of the launch directory.

## How it relates to upstream opencode

This fork is deliberately **thin and re-syncable**. `origin` stays pointed at upstream opencode so new releases can be pulled and the TraceFix changes re-applied by cherry-pick. Every change on top of the base tag is one commit listed in **[PATCHES.md](PATCHES.md)**, which is both the changelog and the cherry-pick manifest for tracking new opencode releases.

Base: opencode `v1.17.4`. The patches slim the tree to the verification harness, rebrand the front end, make the `designer` the only primary agent, wire the toolchain + `.env` auto-loading, disable self-update, and add typed-domain-tool support. See PATCHES.md for the full list.

## License

MIT, inherited from upstream opencode — see [LICENSE](LICENSE). TraceFix's modifications are released under the same license.
