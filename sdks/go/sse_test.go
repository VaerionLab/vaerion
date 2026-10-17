package vae

import (
	"reflect"
	"testing"
)

func TestParseSSEMultiEvent(t *testing.T) {
	body := ": keep-alive comment\n" +
		"event: spine\n" +
		"data: {\"seq\":1,\"type\":\"run.opened\"}\n" +
		"\n" +
		"data: {\"seq\":2,\"type\":\"run.closed\"}\n" +
		"\n"
	events := ParseSSE(body)
	if len(events) != 2 {
		t.Fatalf("expected 2 events, got %d: %#v", len(events), events)
	}
	first, ok := events[0].(map[string]any)
	if !ok || first["type"] != "run.opened" {
		t.Fatalf("first event wrong: %#v", events[0])
	}
	second, ok := events[1].(map[string]any)
	if !ok || second["seq"] != float64(2) {
		t.Fatalf("second event wrong: %#v", events[1])
	}
}

func TestParseSSEMultilineData(t *testing.T) {
	events := ParseSSE("data: {\"a\":\ndata: 1}\n\n")
	want := []any{map[string]any{"a": float64(1)}}
	if !reflect.DeepEqual(events, want) {
		t.Fatalf("multiline data wrong: %#v", events)
	}
}

func TestParseSSEGarbageDataIsPassedThroughAsText(t *testing.T) {
	events := ParseSSE("data: not-json\n\n")
	want := []any{"not-json"}
	if !reflect.DeepEqual(events, want) {
		t.Fatalf("garbage passthrough wrong: %#v", events)
	}
}

func TestParseSSEEmptyBody(t *testing.T) {
	if events := ParseSSE(""); len(events) != 0 {
		t.Fatalf("empty body must parse to zero events, got %#v", events)
	}
}

func TestParseSSEDanglingDataWithoutTrailingBlankLine(t *testing.T) {
	events := ParseSSE("data: {\"seq\":7}\n")
	if len(events) != 1 {
		t.Fatalf("dangling data block must flush, got %#v", events)
	}
}

func TestParseSSEJSONNullPayloadIsDropped(t *testing.T) {
	// python parity: json "null" decodes to None and is not yielded.
	if events := ParseSSE("data: null\n\n"); len(events) != 0 {
		t.Fatalf("null payload must be dropped, got %#v", events)
	}
}
