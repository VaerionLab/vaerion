package dev.vaerion.sdk;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Spliterators;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * VaeDaemonClient — the wire client for the local Vaerion daemon.
 *
 * <p>The daemon ({@code vae serve}) is loopback-only with a first-run pairing
 * token (ADR-0010). This client speaks exactly the published contract
 * ({@code /openapi.json}) of engine 0.1.15:</p>
 *
 * <pre>
 *   GET  /health, /version, /openapi.json   (open metadata routes)
 *   POST /runs                              start an agent|workflow run
 *   GET  /runs/{id}                         folded status + terminal receipt
 *   GET  /runs/{id}/events                  SSE event stream (cursor replay)
 *   POST /runs/{id}/answer                  resolve a durable human gate
 *   POST /shutdown                          token-echo guarded shutdown
 * </pre>
 *
 * <p>Auth: {@code Authorization: Bearer <token>} on every route except the
 * metadata trio. Errors arrive as {@code {"error": {code, message, fix}}} —
 * raised as {@link VaerionError} with the E-code intact. Non-loopback bases
 * are refused in code before any byte is sent (E2006, standard §11).</p>
 */
public class VaeDaemonClient {

    /** The three unauthenticated metadata routes (ADR-0010). */
    static final List<String> OPEN_PATHS = List.of("/health", "/version", "/openapi.json");

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final String base;
    private final String token;
    private final Duration timeout;
    private final HttpClient http;

    public VaeDaemonClient() {
        this("http://127.0.0.1:7897", null);
    }

    public VaeDaemonClient(String base, String token) {
        this(base, token, Duration.ofSeconds(30));
    }

    public VaeDaemonClient(String base, String token, Duration timeout) {
        String stripped = base == null ? "" : base.strip();
        requireLoopback(stripped);
        this.base = stripped.endsWith("/") ? stripped.substring(0, stripped.length() - 1) : stripped;
        this.token = token == null || token.isEmpty() ? null : token;
        this.timeout = timeout == null ? Duration.ofSeconds(30) : timeout;
        this.http = HttpClient.newBuilder().connectTimeout(this.timeout).build();
    }

    /** The loopback base this client is bound to. */
    public String getBase() {
        return base;
    }

    // ── loopback law (standard §11) ───────────────────────────────────────

    /** Only 127.0.0.1, localhost, and [::1] may ever see a request byte. */
    private static void requireLoopback(String base) {
        String host;
        try {
            host = URI.create(base).getHost();
        } catch (IllegalArgumentException e) {
            host = null;
        }
        boolean ok = "127.0.0.1".equals(host) || "localhost".equals(host) || "[::1]".equals(host) || "::1".equals(host);
        if (!ok) {
            throw new VaerionError("E2006",
                    "refusing non-loopback base '" + base + "' — the daemon is loopback-only (ADR-0010)",
                    "point the client at the daemon's loopback URL (http://127.0.0.1:<port>) — remote exposure requires a ratified transport-security ADR");
        }
    }

    // ── transport ─────────────────────────────────────────────────────────

    /** Headers for one request; the token never touches the metadata trio. */
    Map<String, String> headers(String path, boolean withBody) {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Accept", "application/json");
        if (withBody) {
            headers.put("Content-Type", "application/json");
        }
        if (token != null && !OPEN_PATHS.contains(path)) {
            headers.put("Authorization", "Bearer " + token);
        }
        return headers;
    }

    private Object request(String method, String path, Map<String, Object> body) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(base + path))
                    .timeout(timeout);
            headers(path, body != null).forEach(builder::header);
            if (body != null) {
                builder.POST(HttpRequest.BodyPublishers.ofString(MAPPER.writeValueAsString(body)));
            } else {
                builder.method(method, HttpRequest.BodyPublishers.noBody());
            }
            HttpResponse<String> resp = http.send(builder.build(), BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) {
                throw raiseForStatus(resp.statusCode(), resp.body());
            }
            return resp.body().isEmpty() ? null : MAPPER.readValue(resp.body(), Object.class);
        } catch (VaerionError e) {
            throw e;
        } catch (JsonProcessingException e) {
            throw new VaerionError("E1900", "unreadable daemon response body: " + e.getOriginalMessage());
        } catch (java.net.http.HttpTimeoutException e) {
            throw new VaerionError("E1601", "cannot reach the daemon at " + base + ": " + e.getMessage(),
                    "start it with `vae serve` (loopback only) and pass the pairing token");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new VaerionError("E1601", "interrupted while calling the daemon at " + base);
        } catch (java.io.IOException e) {
            throw new VaerionError("E1601", "cannot reach the daemon at " + base + ": " + e.getMessage(),
                    "start it with `vae serve` (loopback only) and pass the pairing token");
        }
    }

    private static VaerionError raiseForStatus(int status, String raw) {
        try {
            if (!raw.isEmpty()) {
                return VaerionError.fromErrorPayload(MAPPER.readValue(raw, Object.class));
            }
        } catch (JsonProcessingException ignored) {
            // fall through to E1900
        }
        return new VaerionError("E1900", "daemon returned HTTP " + status + " with an unreadable body");
    }

    // ── metadata (open routes) ────────────────────────────────────────────

    /** Liveness probe: ok, engine version, daemon uptime (no token). */
    @SuppressWarnings("unchecked")
    public Map<String, Object> health() {
        return (Map<String, Object>) requireMap(request("GET", "/health", null), "/health");
    }

    /** The engine version of record (no token). */
    @SuppressWarnings("unchecked")
    public Map<String, Object> version() {
        return (Map<String, Object>) requireMap(request("GET", "/version", null), "/version");
    }

    /** The generated OpenAPI contract — every route, described. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> openapi() {
        return (Map<String, Object>) requireMap(request("GET", "/openapi.json", null), "/openapi.json");
    }

    // ── runs ──────────────────────────────────────────────────────────────

    /** Start the supervised agent loop (background, serial per workspace). */
    public RunStarted startAgentRun(String goal) {
        return startAgentRun(goal, null, "inline", null);
    }

    /**
     * Start the supervised agent loop. Returns the run coordinates; poll
     * {@link #getRun(String)} or stream {@link #events(String)}.
     */
    public RunStarted startAgentRun(String goal, List<Map<String, Object>> steps, String planner, Integer maxSteps) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("kind", "agent");
        body.put("goal", goal);
        body.put("planner", planner == null ? "inline" : planner);
        if (steps != null) {
            body.put("steps", steps);
        }
        if (maxSteps != null) {
            body.put("max_steps", maxSteps);
        }
        return toRunStarted(request("POST", "/runs", body));
    }

    /** Start a deterministic workflow DAG execution (background). */
    public RunStarted startWorkflowRun(Map<String, Object> dag) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("kind", "workflow");
        body.put("dag", dag);
        return toRunStarted(request("POST", "/runs", body));
    }

    private RunStarted toRunStarted(Object payload) {
        Map<String, Object> started = castMap(payload, "/runs");
        Object idValue = started.get("run_id");
        String runId = idValue == null ? "" : String.valueOf(idValue);
        if (runId.isEmpty()) {
            throw new VaerionError("E1900", "daemon accepted the run but returned no run_id");
        }
        Object trace = started.get("trace_id");
        Object kind = started.get("kind");
        return new RunStarted(runId, trace == null ? null : String.valueOf(trace),
                kind == null ? null : String.valueOf(kind), started);
    }

    /** Folded status: verification result, decisions, gates, receipt when closed. */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRun(String runId) {
        return (Map<String, Object>) requireMap(request("GET", "/runs/" + runId, null), "/runs/{run_id}");
    }

    /**
     * The run's SSE event stream (JSON data payloads, cursor replay) as a
     * lazy {@link Iterator}. Frames without a JSON-object data payload are
     * skipped; the stream ends when the daemon seals the run.
     */
    public Iterator<Map<String, Object>> events(String runId) {
        return new EventIterator(requestStream("/runs/" + runId + "/events"));
    }

    /** The same event stream as a {@link Stream} (Java idiom, standard §13c). */
    public Stream<Map<String, Object>> eventsStream(String runId) {
        return StreamSupport.stream(Spliterators.spliteratorUnknownSize(events(runId), 0), false);
    }

    /** Human authority over a paused run — the durable gate resolution. */
    public Map<String, Object> answerGate(String runId, String gateId, Map<String, Object> answer) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("gate_id", gateId);
        if (answer != null) {
            body.put("answer", answer);
        }
        return castMap(request("POST", "/runs/" + runId + "/answer", body), "/runs/{run_id}/answer");
    }

    /** Resolve a gate with the engine default answer ({"approved": true}). */
    public Map<String, Object> answerGate(String runId, String gateId) {
        return answerGate(runId, gateId, null);
    }

    /**
     * Poll {@link #getRun(String)} until the run closes. Terminal = a receipt
     * exists or the status leaves {@code open}. The final status view is
     * returned; {@code E1602} when the deadline passes.
     */
    public Map<String, Object> waitForRun(String runId, Duration timeout) {
        long deadline = System.nanoTime() + (timeout == null ? Duration.ofSeconds(120) : timeout).toNanos();
        Map<String, Object> last = Map.of();
        while (System.nanoTime() < deadline) {
            last = getRun(runId);
            if (last.get("receipt") != null
                    || (last.get("status") != null && !"open".equals(last.get("status")))) {
                return last;
            }
            sleep(100);
        }
        long seconds = (timeout == null ? Duration.ofSeconds(120) : timeout).toSeconds();
        throw new VaerionError("E1602", "run " + runId + " did not close within " + seconds + "s",
                "inspect GET /runs/{id} and GET /runs/{id}/events for where it is paused");
    }

    /** Poll until the run closes (default deadline: 120s). */
    public Map<String, Object> waitForRun(String runId) {
        return waitForRun(runId, Duration.ofSeconds(120));
    }

    /** Graceful daemon stop (token-echo guarded). */
    public void shutdown() {
        if (token == null) {
            throw new VaerionError("E2000", "shutdown requires the pairing token (echo guard)");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("token", token);
        request("POST", "/shutdown", body);
    }

    // ── SSE streaming plumbing ────────────────────────────────────────────

    private HttpResponse<InputStream> requestStream(String path) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(base + path))
                    .timeout(timeout);
            headers(path, false).forEach(builder::header);
            builder.GET();
            HttpResponse<InputStream> resp = http.send(builder.build(), BodyHandlers.ofInputStream());
            if (resp.statusCode() / 100 != 2) {
                String raw = new String(resp.body().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                throw raiseForStatus(resp.statusCode(), raw);
            }
            return resp;
        } catch (VaerionError e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new VaerionError("E1601", "interrupted while streaming from " + base + path);
        } catch (java.io.IOException e) {
            throw new VaerionError("E1601", "cannot reach the daemon at " + base + path + ": " + e.getMessage(),
                    "start it with `vae serve` (loopback only) and pass the pairing token");
        }
    }

    private static final class EventIterator implements Iterator<Map<String, Object>> {
        private final HttpResponse<InputStream> response;
        private final java.io.BufferedReader reader;
        private final Iterator<Object> payloads;
        private Map<String, Object> next;
        private boolean closed;

        EventIterator(HttpResponse<InputStream> response) {
            this.response = response;
            this.reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(response.body(), java.nio.charset.StandardCharsets.UTF_8));
            this.payloads = Sse.iterate(reader.lines().iterator());
        }

        private void advance() {
            while (next == null && !closed && payloads.hasNext()) {
                Object payload = payloads.next();
                if (payload instanceof Map<?, ?> m) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) m;
                    next = map;
                }
            }
            if (next == null) {
                close();
            }
        }

        private void close() {
            if (!closed) {
                closed = true;
                try {
                    reader.close();
                } catch (java.io.IOException ignored) {
                    // the daemon ends the stream at seal; nothing to recover
                }
            }
        }

        @Override
        public boolean hasNext() {
            advance();
            return next != null;
        }

        @Override
        public Map<String, Object> next() {
            advance();
            Map<String, Object> current = next;
            next = null;
            return current;
        }
    }

    // ── small helpers ─────────────────────────────────────────────────────

    private static Object requireMap(Object payload, String where) {
        if (payload instanceof Map<?, ?>) {
            return payload;
        }
        throw new VaerionError("E1900", "daemon returned an unexpected payload shape for " + where);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Object payload, String where) {
        requireMap(payload, where);
        return (Map<String, Object>) payload;
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new VaerionError("E1601", "interrupted while polling the run status");
        }
    }
}
