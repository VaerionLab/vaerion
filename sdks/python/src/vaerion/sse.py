"""Minimal, dependency-free SSE parsing (the daemon's event streams).

The daemon emits ``text/event-stream`` with JSON data frames. parse_sse
handles the whole body at once (tests, buffered reads); iter_sse consumes a
line iterator lazily (live streams). Comments (``:`` lines) and unknown
fields are ignored per the SSE spec.
"""

from __future__ import annotations

import json
from typing import Any, Iterable, Iterator, List

__all__ = ["parse_sse", "iter_sse"]


def _decode_data(data_lines: List[str]) -> Any:
    raw = "\n".join(data_lines).strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def parse_sse(text: str) -> List[Any]:
    """Parse a complete SSE body into its JSON data payloads (in order)."""
    return list(iter_sse(iter(text.splitlines())))


def iter_sse(lines: Iterable[str]) -> Iterator[Any]:
    """Lazily yield the JSON data payload of each SSE event."""
    data_lines: List[str] = []
    for line in lines:
        if line == "":
            if data_lines:
                payload = _decode_data(data_lines)
                data_lines = []
                if payload is not None:
                    yield payload
            continue
        if line.startswith(":"):
            continue
        if line.startswith("data:"):
            data_lines.append(line[5:].lstrip(" "))
        # event:/id:/retry: and anything else — ignored (data-only consumer)
    if data_lines:
        payload = _decode_data(data_lines)
        if payload is not None:
            yield payload
