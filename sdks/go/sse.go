// Minimal, dependency-free SSE parsing (the daemon's event streams).
//
// The daemon emits `text/event-stream` with JSON data frames
// (`data: <envelope JSON>`; the stream terminates with `event: end`,
// failures arrive as `event: error` — server.ts). This parser is a 1:1
// port of the Python reference (sdks/python/src/vaerion/sse.py): comments
// (`:` lines) and unknown fields (`event:`, `id:`, `retry:`) are ignored —
// it is a data-only consumer — and a non-JSON data payload passes through
// as raw text (forward-compat duty, standard §17).
package vae

import (
	"encoding/json"
	"strings"
)

// sseDecoder is the per-stream line state machine shared by ParseSSE
// (whole-body tests) and the live EventStream reader.
type sseDecoder struct {
	dataLines []string
}

// feed consumes one line; it returns a payload when the line terminates an
// event (the blank line that ends a frame).
func (d *sseDecoder) feed(line string) (any, bool) {
	if line == "" {
		if len(d.dataLines) > 0 {
			payload := decodeData(d.dataLines)
			d.dataLines = nil
			if payload != nil {
				return payload, true
			}
		}
		return nil, false
	}
	if strings.HasPrefix(line, ":") {
		return nil, false // comment / keep-alive
	}
	if strings.HasPrefix(line, "data:") {
		d.dataLines = append(d.dataLines, strings.TrimLeft(line[5:], " "))
	}
	// event:/id:/retry: and anything else — ignored (data-only consumer).
	return nil, false
}

// flush emits a payload when the stream ended with a dangling data block
// (no trailing blank line).
func (d *sseDecoder) flush() (any, bool) {
	if len(d.dataLines) == 0 {
		return nil, false
	}
	payload := decodeData(d.dataLines)
	d.dataLines = nil
	if payload == nil {
		return nil, false
	}
	return payload, true
}

// decodeData joins multiline data, strips it, tries JSON, and passes
// non-JSON through as raw text (python parity: json failure → the string).
func decodeData(lines []string) any {
	raw := strings.TrimSpace(strings.Join(lines, "\n"))
	if raw == "" {
		return nil
	}
	var v any
	if err := json.Unmarshal([]byte(raw), &v); err != nil {
		return raw
	}
	return v // json "null" → nil → filtered by the caller, python parity
}

// ParseSSE parses a complete SSE body into its JSON data payloads (in
// order). Unit-test and buffered-read surface.
func ParseSSE(text string) []any {
	dec := &sseDecoder{}
	var out []any
	for _, line := range strings.Split(text, "\n") {
		if p, ok := dec.feed(strings.TrimSuffix(line, "\r")); ok {
			out = append(out, p)
		}
	}
	if p, ok := dec.flush(); ok {
		out = append(out, p)
	}
	return out
}
