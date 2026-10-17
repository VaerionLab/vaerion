//! Minimal, dependency-free SSE parsing (the daemon's event streams).
//!
//! The daemon emits `text/event-stream` with JSON data frames: each frame is
//! `data: <envelope JSON>`, the stream terminates with `event: end`, and
//! comments (`:` lines) keep connections alive. [`parse_sse`] handles a whole
//! body at once (tests, buffered reads); [`SseParser`] consumes line by line
//! (live streams). Comments and unknown fields (`event:`/`id:`/`retry:`) are
//! ignored per the SSE spec — a data-only consumer, exactly like the Python
//! reference `sdks/python/src/vaerion/sse.py`.
//!
//! One honest type decision: a data payload that does not parse as JSON is
//! passed through as [`Value::String`] (never dropped, never mangled), so an
//! unknown future frame shape still reaches the caller.

use serde_json::Value;

/// Incremental SSE parser: feed lines, receive one payload per completed event.
#[derive(Debug, Default)]
pub struct SseParser {
    data_lines: Vec<String>,
}

impl SseParser {
    pub fn new() -> Self {
        SseParser {
            data_lines: Vec::new(),
        }
    }

    /// Feed one stream line. Returns the payload when this line completes an
    /// event (the empty line that terminates its `data:` block).
    pub fn push_line(&mut self, line: &str) -> Option<Value> {
        if line.is_empty() {
            if self.data_lines.is_empty() {
                return None;
            }
            let payload = self.decode_data();
            self.data_lines.clear();
            return payload;
        }
        if line.starts_with(':') {
            return None; // comment (keep-alive)
        }
        if let Some(rest) = line.strip_prefix("data:") {
            self.data_lines
                .push(rest.trim_start_matches(' ').to_string());
        }
        // event:/id:/retry: and anything else — ignored (data-only consumer)
        None
    }

    /// Flush a trailing event that was never closed by an empty line (EOF).
    pub fn finish(&mut self) -> Option<Value> {
        if self.data_lines.is_empty() {
            return None;
        }
        let payload = self.decode_data();
        self.data_lines.clear();
        payload
    }

    fn decode_data(&self) -> Option<Value> {
        let raw = self.data_lines.join("\n");
        let raw = raw.trim();
        if raw.is_empty() {
            return None;
        }
        Some(serde_json::from_str(raw).unwrap_or(Value::String(raw.to_string())))
    }
}

/// Parse a complete SSE body into its JSON data payloads (in order).
///
/// Multiline `data:` blocks are joined with `\n`; non-JSON data passes
/// through as a [`Value::String`]; comments and empty events yield nothing.
pub fn parse_sse(text: &str) -> Vec<Value> {
    let mut parser = SseParser::new();
    let mut out = Vec::new();
    for line in text.lines() {
        if let Some(payload) = parser.push_line(line) {
            out.push(payload);
        }
    }
    if let Some(payload) = parser.finish() {
        out.push(payload);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_multi_event_bodies() {
        let body = ": keep-alive comment\n\
                    event: spine\n\
                    data: {\"seq\":1,\"type\":\"run.opened\"}\n\
                    \n\
                    data: {\"seq\":2,\"type\":\"run.closed\"}\n\
                    \n";
        let events = parse_sse(body);
        assert_eq!(events.len(), 2);
        assert_eq!(events[0]["type"], json!("run.opened"));
        assert_eq!(events[1]["seq"], json!(2));
    }

    #[test]
    fn joins_multiline_data_blocks() {
        let events = parse_sse("data: {\"a\":\ndata: 1}\n\n");
        assert_eq!(events, vec![json!({"a": 1})]);
    }

    #[test]
    fn garbage_data_passes_through_as_text() {
        assert_eq!(parse_sse("data: not-json\n\n"), vec![json!("not-json")]);
    }

    #[test]
    fn empty_body_yields_nothing() {
        assert!(parse_sse("").is_empty());
        assert!(parse_sse(": only a comment\n\n").is_empty());
    }

    #[test]
    fn trailing_event_without_blank_line_is_flushed_at_eof() {
        assert_eq!(parse_sse("data: {\"seq\":7}"), vec![json!({"seq": 7})]);
    }
}
