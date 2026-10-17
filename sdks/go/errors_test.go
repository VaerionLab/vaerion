package vae

import (
	"strings"
	"testing"
)

func TestErrorPayloadCarriesCodeMessageFix(t *testing.T) {
	err := ErrorFromPayload(map[string]any{
		"error": map[string]any{
			"code":    "E1301",
			"message": "unmatched request",
			"fix":     "declare a policy rule",
		},
	})
	if err.Code != "E1301" {
		t.Fatalf("code = %q, want E1301", err.Code)
	}
	if err.Message != "unmatched request" {
		t.Fatalf("message = %q", err.Message)
	}
	if err.Fix != "declare a policy rule" {
		t.Fatalf("fix = %q", err.Fix)
	}
	if !strings.Contains(err.Error(), "E1301") {
		t.Fatalf("Error() must render the code: %q", err.Error())
	}
	want := "E1301 unmatched request (Fix: declare a policy rule)"
	if err.Error() != want {
		t.Fatalf("Error() = %q, want %q", err.Error(), want)
	}
}

func TestErrorRenderingWithoutFix(t *testing.T) {
	err := NewVaerionError("E1900", "boom", "")
	if err.Error() != "E1900 boom" {
		t.Fatalf("Error() = %q", err.Error())
	}
}

func TestErrorPayloadTolerance(t *testing.T) {
	if got := ErrorFromPayload("boom").Code; got != "E1900" {
		t.Fatalf("string payload code = %q, want E1900", got)
	}
	if got := ErrorFromPayload(nil).Code; got != "E1900" {
		t.Fatalf("nil payload code = %q, want E1900", got)
	}
	if got := ErrorFromPayload(map[string]any{}).Code; got != "E1900" {
		t.Fatalf("empty payload code = %q, want E1900", got)
	}
}

func TestErrorPayloadBareErrorObjectIsAccepted(t *testing.T) {
	// A bare {code,message,fix} object (no wrapping "error" key) is
	// tolerated best-effort, python parity.
	err := ErrorFromPayload(map[string]any{"code": "E2003", "message": "unknown run"})
	if err.Code != "E2003" || err.Message != "unknown run" {
		t.Fatalf("bare object tolerance broken: %#v", err)
	}
}

func TestErrorPayloadCarriesDetail(t *testing.T) {
	err := ErrorFromPayload(map[string]any{
		"error": map[string]any{"code": "E1001", "message": "chain failed", "detail": map[string]any{"ok": false}},
	})
	detail, ok := err.Detail.(map[string]any)
	if !ok || detail["ok"] != false {
		t.Fatalf("detail not carried: %#v", err.Detail)
	}
}

func TestOpenPathClassification(t *testing.T) {
	for _, p := range []string{"/health", "/version", "/openapi.json"} {
		if !isOpenPath(p) {
			t.Fatalf("%s must be an open path", p)
		}
	}
	for _, p := range []string{"/runs", "/shutdown", "/runs/x/events"} {
		if isOpenPath(p) {
			t.Fatalf("%s must not be an open path", p)
		}
	}
}
