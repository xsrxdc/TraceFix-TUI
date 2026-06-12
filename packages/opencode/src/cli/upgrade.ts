// tracefix: hard-disabled. Upstream's upgrade() checks opencode's release
// channels and — via Installation.upgrade — can pipe https://opencode.ai/install
// to a shell, replacing this fork's binary with stock opencode. A fork must
// never self-update to its upstream. The only caller (tui worker checkUpgrade)
// no longer invokes this; the stub remains so any future cherry-pick that
// re-wires it stays a no-op instead of silently restoring auto-update.
export async function upgrade() {}
