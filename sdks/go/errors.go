// Package vae is the Go SDK for Vaerion — a projection of the engine's
// published contracts (VAERION_SDK_STANDARD §0–§19), never a second
// implementation. It binds through the loopback daemon (`vae serve`) over
// HTTP/SSE and verifies journals through the CLI of record.
//
// The wire is canonical: field names on the wire (run_id, journal_ok,
// head_hash) are law and stay snake_case in every wire-facing struct's
// json tags. Errors are one taxonomy: VaerionError with a stable E-code.
//
// Standard library only: no dependencies, no telemetry, no invented routes.
package vae

import (
	"encoding/json"
	"fmt"
	"strings"
)

// VaerionError is the one stable diagnostic: code + what failed + the Fix
// (standard §10). Codes are stable strings ("E1301", "E2006", …) — never
// renumbered, never recycled; unknown codes render as received.
type VaerionError struct {
	// Code is the stable E-code from the engine catalog (spec/errors.yaml).
	Code string
	// Message is the human-readable what-failed line.
	Message string
	// Fix is the actionable next step; empty when the engine sent none.
	Fix string
	// Detail carries the machine-readable payload (error body detail, the
	// verify report on a failed chain, stderr tail, …).
	Detail any
	// Status is the HTTP status the error arrived with over the wire
	// (standard §10(b): SDKs attach code, fix, and — over the wire —
	// status). Zero when not wire-originated.
	Status int
}

// Error renders the canonical form: "E1234 message (Fix: ...)".
func (e *VaerionError) Error() string {
	var b strings.Builder
	b.WriteString(e.Code)
	b.WriteString(" ")
	b.WriteString(e.Message)
	if e.Fix != "" {
		b.WriteString(" (Fix: ")
		b.WriteString(e.Fix)
		b.WriteString(")")
	}
	return b.String()
}

// NewVaerionError builds a VaerionError (code, message, optional fix).
func NewVaerionError(code, message, fix string) *VaerionError {
	return &VaerionError{Code: code, Message: message, Fix: fix}
}

// errorPayload is the daemon's non-2xx body: {"error":{...}} — the same
// E-code contract the CLI renders (server.ts errorBody → errors.ts toJSON).
type errorPayload struct {
	Error struct {
		Code    string          `json:"code"`
		Name    string          `json:"name"`
		Message string          `json:"message"`
		Fix     *string         `json:"fix"`
		Detail  json.RawMessage `json:"detail"`
	} `json:"error"`
}

// ErrorFromPayload builds a VaerionError from a daemon error body
// ({"error":{code,message,fix,detail}}), tolerating anything else the way
// the Python reference does: non-object payloads become E1900.
func ErrorFromPayload(payload any) *VaerionError {
	m, ok := payload.(map[string]any)
	if !ok {
		return &VaerionError{Code: "E1900", Message: fmt.Sprint(payload)}
	}
	inner, ok := m["error"].(map[string]any)
	if !ok {
		inner = m // bare {code,message,fix} object — best effort
	}
	e := &VaerionError{
		Code:    stringField(inner, "code", "E1900"),
		Message: stringField(inner, "message", "unknown daemon error"),
	}
	if fix, ok := inner["fix"].(string); ok && fix != "" {
		e.Fix = fix
	}
	if d, ok := inner["detail"]; ok && d != nil {
		e.Detail = d
	}
	return e
}

// stringField reads a string field with a fallback (JSON numbers must not
// crash the error path — tolerance is the law of the error path itself).
func stringField(m map[string]any, key, fallback string) string {
	if v, ok := m[key].(string); ok && v != "" {
		return v
	}
	return fallback
}

// Open paths: the three unauthenticated metadata routes (standard §11).
func isOpenPath(path string) bool {
	switch path {
	case "/health", "/version", "/openapi.json":
		return true
	}
	return false
}
