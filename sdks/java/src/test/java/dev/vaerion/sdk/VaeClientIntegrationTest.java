package dev.vaerion.sdk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Integration layer: a REAL spawned daemon — VaeClient starts {@code vae
 * serve}, runs a brokered agent goal, reads the terminal receipt, and
 * verifies the journal chain through the CLI of record. Skipped (never
 * faked) when no vae runtime exists on the machine — same law as the Python
 * conformance suite (VAERION_SDK_STANDARD §18).
 */
class VaeClientIntegrationTest {

    @TempDir
    Path workspace;

    private static boolean vaeAvailable() {
        try {
            VaeClient.resolveVaeCommand();
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    @Test
    void spawnRunReceiptVerify() {
        Assumptions.assumeTrue(vaeAvailable(),
                "no vae runtime on this machine — integration layer skipped, never faked");
        try (VaeClient vae = new VaeClient(workspace)) {
            // The daemon is up and honest about its version.
            Map<String, Object> health = vae.client().health();
            assertEquals(Boolean.TRUE, health.get("ok"));
            assertNotNull(vae.client().version().get("engine_version"));

            // One brokered, journaled run with the declared note plan.
            Map<String, Object> result = vae.run("summarize the project from the journal");
            assertEquals("agent", result.get("kind"));
            String runId = String.valueOf(result.get("run_id"));
            assertTrue(runId.startsWith("crn_run_"), "run_id is a crn_run_ ULID coordinate");
            assertEquals(Boolean.TRUE, result.get("journal_ok"));

            Map<?, ?> receipt = castMap(result.get("receipt"), "a closed run carries its receipt");
            Map<?, ?> journal = castMap(receipt.get("journal"), "receipt certifies its journal");
            String headHash = String.valueOf(journal.get("head_hash"));
            assertTrue(headHash.matches("[0-9a-f]{64}"), "head_hash is 64 hex, got: " + headHash);
            assertTrue(((Number) journal.get("records")).intValue() > 0);

            // Receipt fields of §3 exist with the right shape.
            for (String field : new String[] {"run_id", "trace_id", "engine_version", "config_fingerprint",
                    "opened_at", "closed_at", "counts", "blob_refs", "journal", "summary"}) {
                assertTrue(receipt.containsKey(field), "receipt." + field + " present");
            }
            Map<?, ?> counts = castMap(receipt.get("counts"), "receipt.counts");
            for (String key : new String[] {"records", "events", "decisions_allow", "decisions_deny",
                    "decisions_prompt", "gates_opened", "gates_resolved", "snapshots", "recovery_notes"}) {
                assertTrue(counts.containsKey(key), "receipt.counts." + key + " present");
            }
            assertTrue(receipt.get("blob_refs") instanceof List<?>, "receipt.blob_refs is a list");

            // The status fold agrees with the terminal state.
            Map<String, Object> status = vae.status(runId);
            assertEquals(runId, status.get("run_id"));
            assertNotNull(status.get("receipt"));

            // Verification through the CLI of record: chain recomputed, green.
            VerifyReport verified = vae.verify(runId);
            assertTrue(verified.ok(), "issues: " + verified.issues());
            assertFalse(verified.torn());
            assertTrue(verified.records() >= ((Number) journal.get("records")).intValue());
            assertTrue(verified.headHash().matches("[0-9a-f]{64}"));
        }
    }

    @Test
    void eventsStreamReplaysTheRun() {
        Assumptions.assumeTrue(vaeAvailable(),
                "no vae runtime on this machine — integration layer skipped, never faked");
        try (VaeClient vae = new VaeClient(workspace)) {
            Map<String, Object> result = vae.run("event stream probe");
            String runId = String.valueOf(result.get("run_id"));
            int count = 0;
            boolean sawOpened = false;
            Iterator<Map<String, Object>> events = vae.events(runId);
            while (events.hasNext()) {
                Map<String, Object> envelope = events.next();
                count++;
                if ("run.opened".equals(envelope.get("type"))) {
                    sawOpened = true;
                    assertTrue(((Number) envelope.get("seq")).intValue() >= 1, "seq is 1-based and gapless");
                }
            }
            assertTrue(count > 0, "the stream replays the journaled envelopes");
            assertTrue(sawOpened, "run.opened is on the stream");
        }
    }

    @Test
    void undeclaredToolStepFailsClosedWithEvidence() {
        Assumptions.assumeTrue(vaeAvailable(),
                "no vae runtime on this machine — integration layer skipped, never faked");
        try (VaeClient vae = new VaeClient(workspace)) {
            // The daemon's ad-hoc config declares NO tools → the undeclared
            // tool step fails CLOSED at the tool gate (fail-closed law). The
            // run still closes WITH a receipt — the refusal is evidence on
            // the chain, not an exception to hide.
            Map<String, Object> toolStep = new LinkedHashMap<>();
            toolStep.put("kind", "tool");
            toolStep.put("tool", "echo");
            toolStep.put("args", Map.of("value", "hi"));
            Map<String, Object> result = vae.run("undeclared tool call",
                    List.of(toolStep), "inline", null, null);
            String runId = String.valueOf(result.get("run_id"));
            assertEquals("closed", result.get("status"));
            Map<?, ?> agent = castMap(result.get("agent"), "agent fold");
            assertEquals("failed", agent.get("outcome"));
            assertNotNull(result.get("receipt"), "even a failed run leaves a receipt");
            // …and the journal STILL verifies: the evidence trail is intact.
            assertTrue(vae.verify(runId).ok());
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Object value, String why) {
        assertNotNull(value, why);
        assertTrue(value instanceof Map, why);
        return (Map<String, Object>) value;
    }
}
