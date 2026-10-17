"""Vaerion errors — stable E-codes, never buried causes.

The daemon's error body is ``{"error": {"code", "message", "fix", ...}}``
(the same E-code contract the CLI renders). VaerionError carries all three
so callers can branch on codes (E1301 broker denial, E2000 auth required, …)
and show the Fix line verbatim.
"""

from __future__ import annotations

from typing import Any, Optional

__all__ = ["VaerionError"]


class VaerionError(Exception):
    """One stable diagnostic: code + what failed + the Fix."""

    def __init__(self, code: str, message: str, fix: Optional[str] = None,
                 detail: Optional[Any] = None) -> None:
        self.code = code
        self.message = message
        self.fix = fix
        self.detail = detail
        super().__init__(f"{code} {message}" + (f" (Fix: {fix})" if fix else ""))

    @classmethod
    def from_error_payload(cls, payload: Any) -> "VaerionError":
        """Build from the daemon's NDJSON/JSON error body (best effort)."""
        if isinstance(payload, dict):
            err = payload.get("error") if isinstance(payload.get("error"), dict) else payload
            code = str(err.get("code", "E1900"))
            message = str(err.get("message", "unknown daemon error"))
            fix = err.get("fix")
            detail = err.get("detail")
            return cls(code, message, str(fix) if fix else None, detail)
        return cls("E1900", str(payload))
