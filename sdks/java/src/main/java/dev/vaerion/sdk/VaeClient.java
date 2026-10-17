package dev.vaerion.sdk;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.URISyntaxException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * VaeClient — the five-line Vaerion experience in Java (mirrors the Python
 * {@code Agent} facade).
 *
 * <pre>
 * try (VaeClient vae = new VaeClient()) {
 *     Map&lt;String,Object&gt; result = vae.run("summarize the project"); // brokered + journaled
 *     Map&lt;?,?&gt; receipt = (Map&lt;?,?&gt;) result.get("receipt");
 *     System.out.println(((Map&lt;?,?&gt;) receipt.get("journal")).get("head_hash")); // integrity commitment
 *     System.out.println(vae.verify((String) result.get("run_id")));             // chain recomputation
 * }
 * </pre>
 *
 * <p>By default VaeClient SPAWNS its own {@code vae serve} daemon on a free
 * loopback port ({@code VAE_TRUST} pre-provisions the pairing token — the
 * secret is never printed) and stops it on {@link #close()}. Use
 * {@link #attach(String, String)} to bind to a daemon you run yourself.</p>
 *
 * <p>{@code verify()} executes the CLI of record against the journal bytes on
 * disk — this engine version has no standalone daemon verify route
 * (VAERION_SDK_STANDARD §4b), so verification trusts bytes, not processes.</p>
 */
public final class VaeClient implements AutoCloseable {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final SecureRandom RNG = new SecureRandom();
    private static final String REPO_VAE = "packages/vaerion/src/cli/vae.ts";

    private final Path cwd;
    private final VaeDaemonClient client;
    private Process process;

    /** Spawn a daemon bound to the process working directory. */
    public VaeClient() {
        this(Path.of("").toAbsolutePath(), Duration.ofSeconds(20));
    }

    /** Spawn a daemon bound to {@code cwd} (a Vaerion workspace; ad-hoc is fine). */
    public VaeClient(Path cwd) {
        this(cwd, Duration.ofSeconds(20));
    }

    /** Spawn a daemon bound to {@code cwd}, polling {@code /health} for at most {@code serveTimeout}. */
    public VaeClient(Path cwd, Duration serveTimeout) {
        this.cwd = cwd.toAbsolutePath().normalize();
        this.process = null;
        this.client = spawn(serveTimeout);
    }

    /** Attach to a daemon you run yourself (loopback base, pairing token). */
    public static VaeClient attach(String base, String token) {
        return attach(base, token, Path.of("").toAbsolutePath());
    }

    /** Attach to a daemon you run yourself; {@code cwd} is where verify() runs the CLI. */
    public static VaeClient attach(String base, String token, Path cwd) {
        return new VaeClient(cwd, new VaeDaemonClient(base, token));
    }

    private VaeClient(Path cwd, VaeDaemonClient attachedClient) {
        this.cwd = cwd.toAbsolutePath().normalize();
        this.process = null;
        this.client = attachedClient;
    }

    /** The daemon client this facade drives (health, openapi, gates, streams). */
    public VaeDaemonClient client() {
        return client;
    }

    // ── the run surface ───────────────────────────────────────────────────

    /**
     * One brokered, journaled agent run; returns the final status view
     * (receipt present once closed). Inline planning is DECLARED: with no
     * {@code steps}, the honest default is a single journaled note step —
     * deterministic, no model calls, no fake intelligence. A failed step does
     * NOT throw — the run closes with a receipt and the agent fold carries
     * {@code outcome="failed"} (evidence, not an exception).
     */
    public Map<String, Object> run(String goal) {
        return run(goal, null, "inline", null, Duration.ofSeconds(120));
    }

    public Map<String, Object> run(String goal, List<Map<String, Object>> steps,
                                   String planner, Integer maxSteps, Duration timeout) {
        if (steps == null && (planner == null || planner.equals("inline"))) {
            Map<String, Object> note = new LinkedHashMap<>();
            note.put("kind", "note");
            note.put("text", "goal: " + goal);
            steps = List.of(note);
        }
        RunStarted started = client.startAgentRun(goal, steps, planner, maxSteps);
        return client.waitForRun(started.runId(), timeout);
    }

    /** One deterministic workflow DAG run on the journal. */
    public Map<String, Object> workflow(Map<String, Object> dag) {
        return workflow(dag, Duration.ofSeconds(120));
    }

    public Map<String, Object> workflow(Map<String, Object> dag, Duration timeout) {
        RunStarted started = client.startWorkflowRun(dag);
        return client.waitForRun(started.runId(), timeout);
    }

    /** The live SSE event stream for a run (JSON-object payloads). */
    public java.util.Iterator<Map<String, Object>> events(String runId) {
        return client.events(runId);
    }

    /** The folded status view without waiting. */
    public Map<String, Object> status(String runId) {
        return client.getRun(runId);
    }

    // ── verification (CLI of record) ──────────────────────────────────────

    /**
     * Journal verification through the CLI of record: the FULL blake3 chain
     * recomputed from the bytes on disk. {@code vae verify} (latest) by
     * default; pass {@code runId} to verify a specific run. A failed chain
     * (exit 5) throws {@link VaerionError} carrying the report as detail.
     */
    public VerifyReport verify(String runId) {
        List<String> args = new ArrayList<>(resolveVaeCommand());
        if (runId == null || runId.isEmpty()) {
            args.add("verify");
        } else {
            args.add("journal");
            args.add("verify");
            args.add(runId);
        }
        args.add("--json");

        Process proc;
        String stdout;
        String stderr;
        int exit;
        try {
            proc = new ProcessBuilder(args)
                    .directory(cwd.toFile())
                    .redirectErrorStream(false)
                    .start();
            stdout = new String(proc.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            stderr = new String(proc.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            if (!proc.waitFor(60, TimeUnit.SECONDS)) {
                proc.destroyForcibly();
                throw new VaerionError("E1601", "verification command did not finish within 60s",
                        "run `vae journal verify <run_id> --json` manually and inspect the workspace");
            }
            exit = proc.exitValue();
        } catch (IOException e) {
            throw new VaerionError("E1601", "cannot execute the vae CLI: " + e.getMessage(),
                    "set VAE_BIN to the command that runs vae");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new VaerionError("E1601", "interrupted while verifying the journal");
        }

        Map<String, Object> payload = lastJsonLine(stdout);
        if (payload == null) {
            throw new VaerionError("E1900",
                    "verification produced no machine output (exit " + exit + ")",
                    null, tail(stderr, 500));
        }
        if (exit != 0) {
            throw new VaerionError("E1001", "journal verification FAILED — see the report payload",
                    "vae journal recover <run_id>", payload);
        }
        return normalizeVerifyPayload(payload);
    }

    /**
     * Normalize the two CLI faces into ONE report: {@code vae verify} is flat
     * with snake_case keys; {@code vae journal verify} wraps a VerifyReport
     * (camelCase {@code headHash}) under {@code report}.
     */
    static VerifyReport normalizeVerifyPayload(Map<String, Object> payload) {
        Object reportObj = payload.get("report");
        Map<?, ?> report = reportObj instanceof Map<?, ?> r ? r : payload;
        String runId = firstText(payload.get("run_id"), report.get("run_id"));
        boolean ok = Boolean.TRUE.equals(report.get("ok"));
        boolean torn = Boolean.TRUE.equals(report.get("torn"));
        Integer records = intOf(report.get("records"));
        Integer events = intOf(report.get("events"));
        String headHash = firstText(report.get("headHash"), report.get("head_hash"));
        List<Map<String, Object>> issues = List.of();
        if (report.get("issues") instanceof List<?> list) {
            List<Map<String, Object>> found = new ArrayList<>();
            for (Object entry : list) {
                if (entry instanceof Map<?, ?> m) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> issue = (Map<String, Object>) m;
                    found.add(issue);
                }
            }
            issues = List.copyOf(found);
        }
        return new VerifyReport(runId, ok, torn, records, events, headHash, issues);
    }

    /** Parse the LAST NDJSON line of a CLI --json payload (best effort). */
    private static Map<String, Object> lastJsonLine(String stdout) {
        Map<String, Object> last = null;
        for (String line : stdout.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            try {
                Object parsed = MAPPER.readValue(trimmed, Object.class);
                if (parsed instanceof Map<?, ?> m) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) m;
                    last = map;
                }
            } catch (JsonProcessingException e) {
                // non-JSON line — skipped, like the Python reference
            }
        }
        return last;
    }

    // ── lifecycle ─────────────────────────────────────────────────────────

    private VaeDaemonClient spawn(Duration serveTimeout) {
        List<String> cmd = new ArrayList<>(resolveVaeCommand());
        int port = freePort();
        String token = randomToken();
        cmd.add("serve");
        cmd.add("--port");
        cmd.add(String.valueOf(port));
        cmd.add("--host");
        cmd.add("127.0.0.1");
        ProcessBuilder pb = new ProcessBuilder(cmd.toArray(new String[0]))
                .directory(cwd.toFile())
                .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                .redirectError(ProcessBuilder.Redirect.DISCARD);
        pb.environment().put("VAE_TRUST", token);
        try {
            process = pb.start();
        } catch (IOException e) {
            throw new VaerionError("E1601", "cannot start the vae daemon: " + e.getMessage(),
                    "run `vae serve` manually to see the startup error");
        }
        VaeDaemonClient daemon = new VaeDaemonClient("http://127.0.0.1:" + port, token);
        long deadline = System.nanoTime() + serveTimeout.toNanos();
        while (System.nanoTime() < deadline) {
            if (!process.isAlive()) {
                throw new VaerionError("E1601", "the spawned vae serve process exited before becoming healthy",
                        "run `vae serve` manually to see the startup error");
            }
            try {
                Map<String, Object> health = daemon.health();
                if (Boolean.TRUE.equals(health.get("ok"))) {
                    return daemon;
                }
            } catch (VaerionError e) {
                // not up yet — poll until the deadline (Python reference behavior)
            }
            try {
                Thread.sleep(150);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
                throw new VaerionError("E1601", "interrupted while waiting for the daemon");
            }
        }
        process.destroy();
        throw new VaerionError("E1601", "the daemon did not become healthy within "
                + serveTimeout.toSeconds() + "s",
                "check that port allocation is allowed and no security software blocks loopback");
    }

    /**
     * Stop a daemon this client spawned (a no-op for attached daemons):
     * token-echo {@code POST /shutdown {"token": …}}, then wait; escalate to
     * destroyForcibly if the daemon ignores the graceful stop.
     */
    @Override
    public void close() {
        Process proc = process;
        if (proc == null) {
            return;
        }
        process = null;
        try {
            client.shutdown();
        } catch (RuntimeException e) {
            // the daemon may already be gone; fall through to process reaping
        }
        try {
            if (!proc.waitFor(10, TimeUnit.SECONDS)) {
                proc.destroy();
                if (!proc.waitFor(5, TimeUnit.SECONDS)) {
                    proc.destroyForcibly();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            proc.destroyForcibly();
        }
    }

    // ── vae resolution (mirrors the Python `_vae_command`) ────────────────

    /** Resolve the `vae` CLI: $VAE_BIN, PATH, or the repo layout (dev checkouts). */
    public static List<String> resolveVaeCommand() {
        return resolveVaeCommand(System.getenv());
    }

    static List<String> resolveVaeCommand(Map<String, String> env) {
        String envBin = env.get("VAE_BIN");
        if (envBin != null && !envBin.isBlank()) {
            return List.of(envBin.trim().split("\\s+"));
        }
        String onPath = which("vae", env);
        if (onPath != null) {
            return List.of(onPath);
        }
        Path repoVae = findRepoVae();
        if (repoVae != null && which("bun", env) != null) {
            return List.of("bun", "run", repoVae.toString());
        }
        throw new VaerionError("E1601",
                "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout)",
                "install it: npm install -g vaerion@rc — or set VAE_BIN to the command that runs vae");
    }

    /** The repo's vae.ts entrypoint (found by walking up from this class or cwd), or null. */
    static Path findRepoVae() {
        for (Path start : candidateRoots()) {
            Path dir = start.toAbsolutePath().normalize();
            for (int depth = 0; dir != null && depth < 12; depth++) {
                Path candidate = dir.resolve(REPO_VAE);
                if (Files.isRegularFile(candidate)) {
                    return candidate;
                }
                dir = dir.getParent();
            }
        }
        return null;
    }

    private static List<Path> candidateRoots() {
        List<Path> roots = new ArrayList<>();
        try {
            URI location = VaeClient.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            if ("file".equals(location.getScheme())) {
                Path p = Path.of(location);
                roots.add(Files.isDirectory(p) ? p : p.getParent() != null ? p.getParent() : Path.of("."));
            }
        } catch (URISyntaxException | RuntimeException ignored) {
            // fall through to user.dir
        }
        roots.add(Path.of("").toAbsolutePath());
        return roots;
    }

    /** POSIX-style `which`: first executable file match on PATH. */
    static String which(String command, Map<String, String> env) {
        String path = env.getOrDefault("PATH", "");
        for (String dir : path.split(java.io.File.pathSeparator)) {
            if (dir.isBlank()) {
                continue;
            }
            Path candidate = Path.of(dir).resolve(command);
            if (Files.isRegularFile(candidate) && Files.isExecutable(candidate)) {
                return candidate.toAbsolutePath().toString();
            }
        }
        return null;
    }

    // ── small helpers ─────────────────────────────────────────────────────

    private static int freePort() {
        try (ServerSocket socket = new ServerSocket(0, 1, InetAddress.getByName("127.0.0.1"))) {
            return socket.getLocalPort();
        } catch (IOException e) {
            throw new UncheckedIOException("cannot allocate a free loopback port", e);
        }
    }

    /** 24 bytes of SecureRandom, URL-safe base64 — 32 chars, never printed or logged. */
    private static String randomToken() {
        byte[] bytes = new byte[24];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String firstText(Object... candidates) {
        for (Object c : candidates) {
            if (c instanceof String s && !s.isEmpty()) {
                return s;
            }
        }
        return null;
    }

    private static Integer intOf(Object v) {
        return v instanceof Number n ? Integer.valueOf(n.intValue()) : null;
    }

    private static String tail(String s, int max) {
        if (s == null || s.isEmpty()) {
            return null;
        }
        return s.length() <= max ? s : s.substring(s.length() - max);
    }
}
