// Event streams (standard §13/§14): GET /runs/{run_id}/events is SSE with
// journal-cursor replay — the stream first REPLAYS every journaled
// envelope with seq > cursor, then FOLLOWS the journal until the run
// seals, terminating with `event: end` (failures arrive as `event: error`
// — whose data payload is yielded like any other, python parity).
package vae

import (
	"bufio"
	"net"
	"net/http"
)

// EventStream is an open SSE connection over one run's events. Next yields
// dict payloads in stream order; a stream error (or a clean end) stops it,
// with the terminal transport error retrievable via Err.
type EventStream struct {
	body    *http.Response
	scanner *bufio.Scanner
	parser  *sseDecoder
	flushed bool
	err     error
}

// OpenEvents opens the run's SSE stream (cursor 0, follow — the stream
// ends when the run seals). Unlike Events (the range-over-func form,
// which cannot surface an open error), this returns the dial error.
func (c *DaemonClient) OpenEvents(runID string) (*EventStream, error) {
	if err := assertLoopbackBase(c.Base); err != nil {
		return nil, err
	}
	// Streams may legitimately outlive any single request timeout (the
	// follow phase runs until the run seals), so this client bounds only
	// dial + TLS, never the body read. Closing the stream closes the body.
	streamHTTP := &http.Client{
		Transport: &http.Transport{
			DialContext:         (&net.Dialer{Timeout: defaultRequestTimeout}).DialContext,
			TLSHandshakeTimeout: defaultRequestTimeout,
		},
	}
	req, err := http.NewRequest("GET", c.Base+"/runs/"+runID+"/events", nil)
	if err != nil {
		return nil, &VaerionError{Code: "E1900", Message: "cannot build event stream request: " + err.Error()}
	}
	req.Header.Set("Accept", "application/json")
	if c.Token != "" {
		req.Header.Set("Authorization", "Bearer "+c.Token)
	}
	resp, err := streamHTTP.Do(req)
	if err != nil {
		return nil, &VaerionError{
			Code:    "E1601",
			Message: "cannot reach the daemon at " + c.Base + ": " + err.Error(),
			Fix:     "start it with `vae serve` (loopback only) and pass the pairing token",
		}
	}
	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 0, 64*1024), 4*1024*1024) // envelopes can exceed the default 64KB token cap
	return &EventStream{body: resp, scanner: sc, parser: &sseDecoder{}}, nil
}

// Next yields the next dict payload (map[string]any) from the stream.
// Non-dict payloads (raw text, arrays) are skipped — the same filter the
// Python reference applies (isinstance(p, dict)). False = stream ended.
func (s *EventStream) Next() (map[string]any, bool) {
	for {
		if s.scanner.Scan() {
			if p, ok := s.parser.feed(s.scanner.Text()); ok {
				if m, ok := p.(map[string]any); ok {
					return m, true
				}
			}
			continue
		}
		if !s.flushed {
			s.flushed = true // scanner exhausted: flush a dangling data block once
			if p, ok := s.parser.flush(); ok {
				if m, ok := p.(map[string]any); ok {
					return m, true
				}
			}
			s.err = s.scanner.Err()
			_ = s.body.Body.Close()
		}
		return nil, false
	}
}

// Err returns the terminal transport error, if any (io.EOF-clean ends are nil).
func (s *EventStream) Err() error { return s.err }

// Close releases the stream's connection.
func (s *EventStream) Close() error { return s.body.Body.Close() }

// Events is the Go 1.23 range-over-func iterator over the run's parsed SSE
// payloads (python parity: `for event in client.events(run_id)`). The
// connection opens lazily on first iteration and closes when iteration
// stops. Stream-open errors terminate iteration silently here — use
// OpenEvents when the dial error must be observed.
func (c *DaemonClient) Events(runID string) func(yield func(map[string]any) bool) {
	return func(yield func(map[string]any) bool) {
		stream, err := c.OpenEvents(runID)
		if err != nil {
			return
		}
		defer stream.Close()
		for {
			payload, ok := stream.Next()
			if !ok || !yield(payload) {
				return
			}
		}
	}
}
