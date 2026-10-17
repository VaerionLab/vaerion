package dev.vaerion.sdk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

/** The error contract: code + what failed + why likely + Fix (standard §10). */
class VaerionErrorTest {

    @Test
    void carriesCodeMessageFixFromDaemonPayload() {
        VaerionError err = VaerionError.fromErrorPayload(Map.of("error", Map.of(
                "code", "E1301",
                "message", "unmatched request",
                "fix", "declare a policy rule")));
        assertEquals("E1301", err.getCode());
        assertEquals("unmatched request", err.getErrorMessage());
        assertEquals("declare a policy rule", err.getFix());
        assertTrue(err.getMessage().contains("E1301"));
        assertTrue(err.getMessage().contains("(Fix: declare a policy rule)"));
    }

    @Test
    void rendersCodeMessageFixShapeExactly() {
        assertEquals("E1234 thing broke (Fix: do the fix)",
                new VaerionError("E1234", "thing broke", "do the fix").getMessage());
        assertEquals("E1234 thing broke",
                new VaerionError("E1234", "thing broke").getMessage());
        // toString renders the same diagnostic line — no class-name prefix.
        VaerionError err = new VaerionError("E1602", "run did not close", "inspect events");
        assertEquals(err.getMessage(), err.toString());
    }

    @Test
    void tolerantOfGarbagePayloads() {
        assertEquals("E1900", VaerionError.fromErrorPayload("boom").getCode());
        assertEquals("boom", VaerionError.fromErrorPayload("boom").getErrorMessage());
        assertEquals("E1900", VaerionError.fromErrorPayload(null).getCode());
        // A map without an "error" object is treated as the error itself.
        assertEquals("unknown daemon error", VaerionError.fromErrorPayload(Map.of()).getErrorMessage());
        assertEquals("E1900", VaerionError.fromErrorPayload(Map.of()).getCode());
    }

    @Test
    void carriesDetailThrough() {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("i", 3);
        detail.put("code", "E1001");
        VaerionError err = VaerionError.fromErrorPayload(Map.of("error", new LinkedHashMap<>(Map.of(
                "code", "E1001", "message", "chain mismatch", "fix", "vae journal recover <run_id>",
                "detail", detail))));
        assertEquals(detail, err.getDetail());
    }

    @Test
    void nonStringFixValuesAreRendered() {
        VaerionError err = VaerionError.fromErrorPayload(Map.of("error", Map.of(
                "code", "E1600", "message", "bad usage", "fix", 42)));
        assertEquals("42", err.getFix());
    }

    @Test
    void errorIsUncheckedForTryWithResourcesErgonomics() {
        // RuntimeException lineage: callers choose when to catch.
        assertTrue(RuntimeException.class.isAssignableFrom(VaerionError.class));
        assertNull(new VaerionError("E2000", "no token").getFix());
    }
}
