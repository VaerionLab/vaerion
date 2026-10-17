//! Vaerion errors — one stable diagnostic: code + what failed + the Fix.
//!
//! The daemon's error body is `{"error": {"code", "message", "fix", "detail"}}`
//! — the same E-code contract the CLI renders (VAERION_SDK_STANDARD §10).
//! [`VaerionError`] carries all of it so callers can branch on stable codes
//! (E1301 broker denial, E2000 auth required, E2006 non-loopback base, …) and
//! render the Fix line verbatim. Codes are strings, never enums that would
//! require recompilation to learn new values (standard §10c).

use serde_json::Value;
use std::fmt;

/// One stable diagnostic: code + what failed + the Fix.
#[derive(Debug, Clone)]
pub struct VaerionError {
    /// Stable engine E-code (`E1000`–`E2312`, append-only forever).
    pub code: String,
    /// What failed, as the engine stated it — never rewritten.
    pub message: String,
    /// The actionable next step (the `Fix:` line), when the engine provides one.
    pub fix: Option<String>,
    /// Machine-readable detail payload, when the engine provides one.
    pub detail: Option<Value>,
}

impl VaerionError {
    /// Build an error from its code and message (fix/detail attach fluently).
    pub fn new(code: &str, message: impl Into<String>) -> Self {
        VaerionError {
            code: code.to_string(),
            message: message.into(),
            fix: None,
            detail: None,
        }
    }

    /// Attach the `Fix:` line.
    pub fn with_fix(mut self, fix: impl Into<String>) -> Self {
        self.fix = Some(fix.into());
        self
    }

    /// Attach a machine-readable detail payload.
    pub fn with_detail(mut self, detail: Value) -> Self {
        self.detail = Some(detail);
        self
    }

    /// Build from the daemon's NDJSON/JSON error body (best effort).
    ///
    /// Mirrors the Python reference: a `{"error": {…}}` envelope is unwrapped,
    /// a bare error object is used as-is, and any non-object payload degrades
    /// to `E1900` (unreadable/unknown error shape — never a silent swallow).
    pub fn from_error_payload(payload: &Value) -> Self {
        match payload {
            Value::Object(_) => {
                let err = payload
                    .get("error")
                    .filter(|v| v.is_object())
                    .unwrap_or(payload);
                let code = match err.get("code") {
                    Some(Value::String(s)) if !s.is_empty() => s.clone(),
                    Some(Value::Null) | None => "E1900".to_string(),
                    Some(other) => other.to_string(),
                };
                let message = match err.get("message") {
                    Some(Value::String(s)) => s.clone(),
                    Some(Value::Null) | None => "unknown daemon error".to_string(),
                    Some(other) => other.to_string(),
                };
                let fix = err
                    .get("fix")
                    .filter(|v| !v.is_null())
                    .map(|v| match v {
                        Value::String(s) => s.clone(),
                        other => other.to_string(),
                    })
                    .filter(|s| !s.is_empty());
                let detail = err.get("detail").cloned().filter(|v| !v.is_null());
                VaerionError {
                    code,
                    message,
                    fix,
                    detail,
                }
            }
            other => VaerionError::new("E1900", other.to_string()),
        }
    }
}

impl fmt::Display for VaerionError {
    /// `"E1234 message (Fix: …)"` — the Fix line appears only when present.
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} {}", self.code, self.message)?;
        if let Some(fix) = &self.fix {
            write!(f, " (Fix: {fix})")?;
        }
        Ok(())
    }
}

impl std::error::Error for VaerionError {}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn display_carries_code_message_and_optional_fix() {
        let plain = VaerionError::new("E1602", "run did not close");
        assert_eq!(plain.to_string(), "E1602 run did not close");
        let fixed =
            VaerionError::new("E1301", "unmatched request").with_fix("declare a policy rule");
        assert_eq!(
            fixed.to_string(),
            "E1301 unmatched request (Fix: declare a policy rule)"
        );
    }

    #[test]
    fn from_error_payload_unwraps_the_error_envelope() {
        let err = VaerionError::from_error_payload(&json!({
            "error": {"code": "E1301", "message": "unmatched request", "fix": "declare a policy rule"}
        }));
        assert_eq!(err.code, "E1301");
        assert_eq!(err.message, "unmatched request");
        assert_eq!(err.fix.as_deref(), Some("declare a policy rule"));
        assert!(err.detail.is_none());
    }

    #[test]
    fn from_error_payload_tolerates_non_object_payloads() {
        assert_eq!(
            VaerionError::from_error_payload(&json!("boom")).code,
            "E1900"
        );
        assert_eq!(VaerionError::from_error_payload(&Value::Null).code, "E1900");
        assert_eq!(
            VaerionError::from_error_payload(&json!({"unrelated": true})).message,
            "unknown daemon error"
        );
    }

    #[test]
    fn error_is_a_std_error() {
        let err: Box<dyn std::error::Error> = Box::new(VaerionError::new("E1001", "torn journal"));
        assert!(err.to_string().starts_with("E1001"));
    }
}
