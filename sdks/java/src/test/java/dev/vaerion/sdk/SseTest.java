package dev.vaerion.sdk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

/** SSE parsing — the daemon's event-stream frames (VAERION_SDK_STANDARD §13). */
class SseTest {

    @Test
    void parsesMultiEventBodiesSkippingCommentsAndEventFields() {
        String body = ": keep-alive comment\n"
                + "event: spine\n"
                + "data: {\"seq\":1,\"type\":\"run.opened\"}\n"
                + "\n"
                + "data: {\"seq\":2,\"type\":\"run.closed\"}\n"
                + "\n";
        List<Object> events = Sse.parse(body);
        assertEquals(2, events.size());
        assertEquals("run.opened", ((Map<?, ?>) events.get(0)).get("type"));
        assertEquals(2, ((Map<?, ?>) events.get(1)).get("seq"));
    }

    @Test
    void joinsMultilineDataWithNewlines() {
        List<Object> events = Sse.parse("data: {\"a\":\ndata: 1}\n\n");
        assertEquals(List.of(Map.of("a", 1)), events);
    }

    @Test
    void passesGarbageDataThroughAsText() {
        assertEquals(List.of("not-json"), Sse.parse("data: not-json\n\n"));
    }

    @Test
    void emptyBodyYieldsNothing() {
        assertTrue(Sse.parse("").isEmpty());
    }

    @Test
    void unterminatedFinalEventIsStillEmitted() {
        List<Object> events = Sse.parse("data: {\"seq\":7}");
        assertEquals(1, events.size());
        assertEquals(7, ((Map<?, ?>) events.get(0)).get("seq"));
    }

    @Test
    void endEventWithoutDataYieldsNothing() {
        // The daemon terminates streams with `event: end` — a data-only
        // consumer never sees a payload for it.
        assertTrue(Sse.parse("event: end\n\n").isEmpty());
    }

    @Test
    void jsonNullAndWhitespaceOnlyDataAreSkipped() {
        assertTrue(Sse.parse("data: null\n\n").isEmpty());
        assertTrue(Sse.parse("data:    \n\n").isEmpty());
    }

    @Test
    void lazyIteratorConsumesLineIterators() {
        Iterator<Object> it = Sse.iterate(List.of(
                "data: {\"v\":1}", "", "data: {\"v\":2}", "").iterator());
        assertEquals(1, ((Map<?, ?>) it.next()).get("v"));
        assertEquals(2, ((Map<?, ?>) it.next()).get("v"));
        assertFalse(it.hasNext());
    }

    @Test
    void crlfLineEndingsAreHandled() {
        List<Object> events = Sse.parse("data: {\"a\":1}\r\n\r\n");
        assertEquals(1, events.size());
        assertEquals(1, ((Map<?, ?>) events.get(0)).get("a"));
    }

    @Test
    void arraysAndScalarsDecodeAsNativeJsonValues() {
        assertEquals(List.of(List.of(1, 2, 3)), Sse.parse("data: [1,2,3]\n\n"));
        assertEquals(List.of("plain"), Sse.parse("data: plain\n\n"));
    }
}
