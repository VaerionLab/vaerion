package dev.vaerion.sdk;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Minimal SSE parsing for the daemon's event streams ({@code text/event-stream}).
 *
 * <p>{@link #parse(String)} handles a whole body at once (tests, buffered
 * reads); {@link #iterate(Iterator)} consumes a line iterator lazily (live
 * streams). Only {@code data:} lines are consumed: comments ({@code :} lines)
 * and {@code event:}/{@code id:}/{@code retry:} fields are ignored per the
 * SSE spec — this is a data-only consumer. Multiline data is joined with
 * {@code \n}; JSON payloads decode to Java objects (Maps, Lists, Strings,
 * Numbers); non-JSON data passes through untouched as text
 * (VAERION_SDK_STANDARD §13).</p>
 */
public final class Sse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Sse() {
    }

    /** Parse a complete SSE body into its data payloads, in order. */
    public static List<Object> parse(String text) {
        List<Object> out = new ArrayList<>();
        Iterator<Object> it = iterate(splitLines(text).iterator());
        while (it.hasNext()) {
            out.add(it.next());
        }
        return out;
    }

    /** Lazily yield the JSON data payload of each SSE event. */
    public static Iterator<Object> iterate(Iterator<String> lines) {
        return new Iterator<>() {
            private final List<String> dataLines = new ArrayList<>();
            private Object next = null;

            private void advance() {
                while (next == null && lines.hasNext()) {
                    String line = lines.next();
                    if (line.isEmpty()) {
                        next = flush();
                    } else if (line.startsWith(":")) {
                        // comment — ignored
                    } else if (line.startsWith("data:")) {
                        dataLines.add(stripLeadingSpaces(line.substring(5)));
                    }
                    // event:/id:/retry: and anything else — ignored (data-only consumer)
                }
                if (next == null) {
                    next = flush();
                }
            }

            private Object flush() {
                if (dataLines.isEmpty()) {
                    return null;
                }
                String raw = String.join("\n", dataLines).trim();
                dataLines.clear();
                if (raw.isEmpty()) {
                    return null;
                }
                try {
                    return MAPPER.readValue(raw, Object.class);
                } catch (JsonProcessingException e) {
                    return raw;
                }
            }

            @Override
            public boolean hasNext() {
                advance();
                return next != null;
            }

            @Override
            public Object next() {
                advance();
                Object current = next;
                next = null;
                return current;
            }
        };
    }

    private static String stripLeadingSpaces(String s) {
        int i = 0;
        while (i < s.length() && s.charAt(i) == ' ') {
            i++;
        }
        return s.substring(i);
    }

    /** Line splitter that keeps interior/trailing empty lines (Python splitlines semantics). */
    private static List<String> splitLines(String text) {
        String normalized = text.replace("\r\n", "\n").replace("\r", "\n");
        List<String> lines = new ArrayList<>();
        int start = 0;
        int nl = normalized.indexOf('\n', start);
        while (nl >= 0) {
            lines.add(normalized.substring(start, nl));
            start = nl + 1;
            nl = normalized.indexOf('\n', start);
        }
        if (start < normalized.length()) {
            lines.add(normalized.substring(start));
        }
        return lines;
    }
}
