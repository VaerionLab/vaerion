// Wire types — snake_case json tags verbatim (standard §0 law 2: the wire
// is canonical; field names on the wire are law, casing maps per language
// idiom but semantics are never renamed). Shapes mirror RunStarted /
// RunStatusView in packages/vaerion/src/api/run-registry.ts and the
// daemon's meta routes in packages/vaerion/src/api/server.ts.
package vae

// Health is GET /health: {ok, engine_version, uptime_ms}.
type Health struct {
	OK            bool   `json:"ok"`
	EngineVersion string `json:"engine_version"`
	UptimeMS      int64  `json:"uptime_ms"`
}

// RunStarted is the 201 body of POST /runs (Location: /runs/{run_id}).
type RunStarted struct {
	RunID   string `json:"run_id"`
	TraceID string `json:"trace_id"`
	Kind    string `json:"kind"` // "agent" | "workflow"
}

// DecisionCounts is the journaled broker decision fold (first match wins;
// no match ⇒ deny E1301 — the engine decides, the SDK only surfaces).
type DecisionCounts struct {
	Allow  int `json:"allow"`
	Deny   int `json:"deny"`
	Prompt int `json:"prompt"`
}

// RunStatus is GET /runs/{run_id}: the deterministic restoration folded
// from the journal — status, decision counts, gates, agent/workflow folds,
// metrics, and the terminal receipt when the run is closed.
type RunStatus struct {
	RunID         string           `json:"run_id"`
	Kind          string           `json:"kind"`   // "agent" | "workflow" | "unknown"
	Status        string           `json:"status"` // "open" | "awaiting_gate" | "closed"
	JournalOK     bool             `json:"journal_ok"`
	TraceID       *string          `json:"trace_id"`
	Decisions     DecisionCounts   `json:"decisions"`
	OpenGates     []map[string]any `json:"open_gates"`
	ResolvedGates int              `json:"resolved_gates"`
	LastSeq       int              `json:"last_seq"`
	EventsSeen    int              `json:"events_seen"`
	Receipt       map[string]any   `json:"receipt"` // nil until closed
	Agent         map[string]any   `json:"agent"`
	Workflow      map[string]any   `json:"workflow"`
	Metrics       map[string]any   `json:"metrics"`
	Note          string           `json:"note"`
}
