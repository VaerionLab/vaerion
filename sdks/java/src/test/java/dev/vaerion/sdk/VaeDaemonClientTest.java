package dev.vaerion.sdk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

/**
 * Wire-contract tests over REAL loopback HTTP stubs
 * (com.sun.net.httpserver.HttpServer) — loopback law, token rules, and the
 * daemon error-body mapping, exactly as the Python conformance suite does.
 */
class VaeDaemonClientTest {

    private HttpServer server;
    private String base;

    @BeforeEach
    void startStub() throws IOException {
        server = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), 0), 0);
        server.start();
        base = "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @AfterEach
    void stopStub() {
        server.stop(0);
    }

    private static void respond(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    // ── loopback law (standard §11) ───────────────────────────────────────

    @Test
    void refusesNonLoopbackBaseWithE2006BeforeAnyRequest() {
        AtomicInteger exchanges = new AtomicInteger();
        server.createContext("/", ex -> {
            exchanges.incrementAndGet();
            respond(ex, 200, "{\"ok\":true}");
        });
        VaeDaemonClient control = new VaeDaemonClient(base, "t");
        assertEquals(Map.of("ok", true), control.health());
        assertEquals(1, exchanges.get());

        VaerionError err = assertThrows(VaerionError.class,
                () -> new VaeDaemonClient("http://10.1.2.3:8787", "t"));
        assertEquals("E2006", err.getCode());
        assertNotNull(err.getFix());
        err = assertThrows(VaerionError.class,
                () -> new VaeDaemonClient("http://example.com:8787", "t"));
        assertEquals("E2006", err.getCode());
        // not one byte left the machine for those bases
        assertEquals(1, exchanges.get());
    }

    @Test
    void acceptsOnlyTheThreeLoopbackHostForms() {
        int port = server.getAddress().getPort();
        assertEquals(base, new VaeDaemonClient("http://127.0.0.1:" + port, "t").getBase());
        assertEquals("http://localhost:" + port, new VaeDaemonClient("http://localhost:" + port, "t").getBase());
        assertEquals("http://[::1]:" + port, new VaeDaemonClient("http://[::1]:" + port, "t").getBase());
        assertThrows(VaerionError.class, () -> new VaeDaemonClient("http://0.0.0.0:" + port, "t"));
    }

    // ── token rules (standard §11) ────────────────────────────────────────

    @Test
    void metadataRoutesNeverCarryTheToken() {
        AtomicReference<String> seenAuth = new AtomicReference<>("unset");
        server.createContext("/health", ex -> {
            seenAuth.set(ex.getRequestHeaders().getFirst("Authorization"));
            respond(ex, 200, "{\"ok\":true,\"engine_version\":\"0.1.15\"}");
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "secret-token");
        client.health();
        assertNull(seenAuth.get(), "the metadata trio is unauthenticated (ADR-0010)");
        assertFalse(client.headers("/health", false).containsKey("Authorization"));
        assertFalse(client.headers("/version", false).containsKey("Authorization"));
        assertFalse(client.headers("/openapi.json", false).containsKey("Authorization"));
        assertEquals("Bearer secret-token", client.headers("/runs", false).get("Authorization"));
        assertEquals("Bearer secret-token", client.headers("/runs/crn_run_X/answer", true).get("Authorization"));
    }

    @Test
    void authenticatedRoutesCarryTheBearerToken() {
        AtomicReference<String> seenAuth = new AtomicReference<>("unset");
        AtomicReference<String> seenBody = new AtomicReference<>("unset");
        server.createContext("/runs", ex -> {
            seenBody.set(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            seenAuth.set(ex.getRequestHeaders().getFirst("Authorization"));
            respond(ex, 201, "{\"run_id\":\"crn_run_01HTESTTESTTESTTESTTEST\",\"trace_id\":\"tr_1\",\"kind\":\"agent\"}");
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "secret-token");
        RunStarted started = client.startAgentRun("probe goal");
        assertEquals("Bearer secret-token", seenAuth.get());
        assertTrue(seenBody.get().contains("\"goal\":\"probe goal\""));
        assertEquals("crn_run_01HTESTTESTTESTTESTTEST", started.runId());
        assertEquals("agent", started.kind());
        assertEquals("tr_1", started.traceId());
        assertEquals("crn_run_01HTESTTESTTESTTESTTEST", started.started().get("run_id"));
    }

    // ── error contract (standard §10) ─────────────────────────────────────

    @Test
    void daemonErrorBodiesMapOntoVaerionErrorWithTheCodeIntact() {
        server.createContext("/runs/crn_run_MISSING", ex ->
                respond(ex, 404, "{\"error\":{\"code\":\"E2003\",\"message\":\"unknown run\",\"fix\":\"check the run id\"}}"));
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        VaerionError err = assertThrows(VaerionError.class, () -> client.getRun("crn_run_MISSING"));
        assertEquals("E2003", err.getCode());
        assertEquals("unknown run", err.getErrorMessage());
        assertEquals("check the run id", err.getFix());
        assertEquals("E2003 unknown run (Fix: check the run id)", err.getMessage());
    }

    @Test
    void unparseableErrorBodiesBecomeE1900() {
        server.createContext("/runs/crn_run_ANY", ex -> respond(ex, 500, "not json at all"));
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        VaerionError err = assertThrows(VaerionError.class, () -> client.getRun("crn_run_ANY"));
        assertEquals("E1900", err.getCode());
        assertTrue(err.getMessage().contains("HTTP 500"));
    }

    @Test
    void unreachableDaemonIsE1601WithAFix() {
        VaeDaemonClient client = new VaeDaemonClient("http://127.0.0.1:1", "t", Duration.ofSeconds(2));
        VaerionError err = assertThrows(VaerionError.class, () -> client.getRun("crn_run_X"));
        assertEquals("E1601", err.getCode());
        assertNotNull(err.getFix());
    }

    // ── run lifecycle ─────────────────────────────────────────────────────

    @Test
    void startAgentRunDeclaresKindGoalPlannerAndOptionalFields() throws IOException {
        AtomicReference<String> body = new AtomicReference<>();
        server.createContext("/runs", ex -> {
            body.set(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(ex, 201, "{\"run_id\":\"crn_run_01HTESTTESTTESTTESTTEST\",\"kind\":\"agent\"}");
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        client.startAgentRun("g", List.of(Map.of("kind", "note", "text", "goal: g")), "inline", 5);
        Map<?, ?> sent = new ObjectMapper().readValue(body.get(), Map.class);
        assertEquals("agent", sent.get("kind"));
        assertEquals("g", sent.get("goal"));
        assertEquals("inline", sent.get("planner"));
        assertEquals(List.of(Map.of("kind", "note", "text", "goal: g")), sent.get("steps"));
        assertEquals(5, sent.get("max_steps"));
        client.startWorkflowRun(Map.of("id", "wf"));
        Map<?, ?> workflowSent = new ObjectMapper().readValue(body.get(), Map.class);
        assertEquals("workflow", workflowSent.get("kind"));
        assertEquals(Map.of("id", "wf"), workflowSent.get("dag"));
    }

    @Test
    void missingRunIdInStartPayloadIsE1900() {
        server.createContext("/runs", ex -> respond(ex, 201, "{\"kind\":\"agent\"}"));
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        VaerionError err = assertThrows(VaerionError.class, () -> client.startAgentRun("g"));
        assertEquals("E1900", err.getCode());
    }

    @Test
    void waitForRunReturnsTheTerminalView() {
        AtomicBoolean first = new AtomicBoolean(true);
        server.createContext("/runs/crn_run_CLOSE", ex -> {
            String payload = first.getAndSet(false)
                    ? "{\"run_id\":\"crn_run_CLOSE\",\"status\":\"open\"}"
                    : "{\"run_id\":\"crn_run_CLOSE\",\"status\":\"closed\",\"journal_ok\":true,\"receipt\":{\"journal\":{\"head_hash\":\"" + "a".repeat(64) + "\"}}}";
            respond(ex, 200, payload);
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        Map<String, Object> result = client.waitForRun("crn_run_CLOSE", Duration.ofSeconds(10));
        assertEquals("closed", result.get("status"));
        assertNotNull(result.get("receipt"));
    }

    @Test
    void waitForRunTimesOutWithE1602AndAFix() {
        server.createContext("/runs/crn_run_SLOW", ex ->
                respond(ex, 200, "{\"run_id\":\"crn_run_SLOW\",\"status\":\"open\"}"));
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        VaerionError err = assertThrows(VaerionError.class,
                () -> client.waitForRun("crn_run_SLOW", Duration.ofMillis(450)));
        assertEquals("E1602", err.getCode());
        assertNotNull(err.getFix());
        assertTrue(err.getMessage().contains("crn_run_SLOW"));
    }

    @Test
    void answerGateSendsTheSnakeCaseWireKeys() {
        AtomicReference<String> body = new AtomicReference<>();
        server.createContext("/runs/crn_run_G/answer", ex -> {
            body.set(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(ex, 200, "{\"resolved\":true}");
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        client.answerGate("crn_run_G", "gate_1");
        assertEquals("{\"gate_id\":\"gate_1\"}", body.get());
        client.answerGate("crn_run_G", "gate_1", Map.of("approved", true));
        assertTrue(body.get().contains("\"answer\":{\"approved\":true}"));
    }

    @Test
    void shutdownEchoesTheTokenInTheBody() {
        AtomicReference<String> body = new AtomicReference<>();
        server.createContext("/shutdown", ex -> {
            body.set(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            respond(ex, 200, "{\"stopping\":true}");
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "secret-token");
        client.shutdown();
        assertTrue(body.get().contains("secret-token"));
        VaerionError err = assertThrows(VaerionError.class,
                () -> new VaeDaemonClient(base, null).shutdown());
        assertEquals("E2000", err.getCode());
    }

    @Test
    void eventsStreamYieldsTheJsonObjectPayloads() {
        String sse = ": replay\n"
                + "data: {\"seq\":1,\"type\":\"run.opened\"}\n"
                + "\n"
                + "data: {\"seq\":2,\"type\":\"note.completed\"}\n"
                + "\n"
                + "event: end\n"
                + "\n";
        server.createContext("/runs/crn_run_E/events", ex -> {
            byte[] bytes = sse.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "text/event-stream");
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) {
                os.write(bytes);
            }
        });
        VaeDaemonClient client = new VaeDaemonClient(base, "t");
        Iterator<Map<String, Object>> events = client.events("crn_run_E");
        assertEquals("run.opened", events.next().get("type"));
        assertEquals(2, events.next().get("seq"));
        assertFalse(events.hasNext(), "the end frame carries no data payload");
    }
}
