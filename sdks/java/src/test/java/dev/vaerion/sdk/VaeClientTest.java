package dev.vaerion.sdk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** vae resolution + verify-report normalization (unit layer). */
class VaeClientTest {

    @TempDir
    Path temp;

    @Test
    void vaeBinEnvSplitsOnWhitespace() {
        List<String> cmd = VaeClient.resolveVaeCommand(Map.of("VAE_BIN", "bun run /opt/vae/vae.ts"));
        assertEquals(List.of("bun", "run", "/opt/vae/vae.ts"), cmd);
        assertEquals(List.of("/usr/local/bin/vae"),
                VaeClient.resolveVaeCommand(Map.of("VAE_BIN", "/usr/local/bin/vae")));
    }

    @Test
    void missingEverywhereIsE1601WithAFix() {
        VaerionError err = assertThrows(VaerionError.class,
                () -> VaeClient.resolveVaeCommand(Map.of(
                        "PATH", temp.resolve("empty-path").toString())));
        assertEquals("E1601", err.getCode());
        assertNotNull(err.getFix());
        assertTrue(err.getMessage().contains("$VAE_BIN"));
    }

    @Test
    void repoLayoutFallbackRunsTheEngineEntrypointThroughBun() throws Exception {
        // A PATH that has a `bun` but no `vae` — the dev-checkout fallback is
        // `bun run <repoRoot>/packages/vaerion/src/cli/vae.ts`.
        Path bin = Files.createDirectory(temp.resolve("bin"));
        Path bun = bin.resolve("bun");
        Files.writeString(bun, "#!/bin/sh\nexit 0\n");
        Files.setPosixFilePermissions(bun, PosixFilePermissions.fromString("rwxr-xr-x"));
        Path repoVae = VaeClient.findRepoVae();
        assertNotNull(repoVae, "this test runs inside the repo checkout");
        assertTrue(repoVae.endsWith("packages/vaerion/src/cli/vae.ts"));
        List<String> cmd = VaeClient.resolveVaeCommand(Map.of("PATH", bin.toString()));
        assertEquals(List.of("bun", "run", repoVae.toString()), cmd);
    }

    @Test
    void pathLookupWinsOverTheRepoFallback() throws Exception {
        Path bin = Files.createDirectory(temp.resolve("bin"));
        Path vae = bin.resolve("vae");
        Files.writeString(vae, "#!/bin/sh\nexit 0\n");
        Files.setPosixFilePermissions(vae, PosixFilePermissions.fromString("rwxr-xr-x"));
        assertEquals(List.of(vae.toAbsolutePath().toString()),
                VaeClient.resolveVaeCommand(Map.of("PATH", bin.toString())));
    }

    @Test
    void normalizesTheFlatVerifyShape() {
        Map<String, Object> flat = new java.util.LinkedHashMap<>();
        flat.put("command", "verify");
        flat.put("run_id", "crn_run_FLAT");
        flat.put("verdict", "VERIFIED");
        flat.put("ok", true);
        flat.put("records", 12);
        flat.put("events", 9);
        flat.put("head_hash", "a".repeat(64));
        flat.put("torn", false);
        flat.put("issues", List.of());
        VerifyReport r = VaeClient.normalizeVerifyPayload(flat);
        assertEquals("crn_run_FLAT", r.runId());
        assertTrue(r.ok());
        assertFalse(r.torn());
        assertEquals(12, r.records());
        assertEquals(9, r.events());
        assertEquals("a".repeat(64), r.headHash());
        assertTrue(r.issues().isEmpty());
    }

    @Test
    void normalizesTheReportWrappedVerifyShape() {
        // `vae journal verify RUN --json` wraps a VerifyReport (camelCase headHash).
        Map<String, Object> report = Map.of(
                "ok", true, "path", "/ws/.vaerion/journal/crn_run_WRAP.ndjson",
                "records", 13, "events", 10, "maxSeq", 10,
                "headHash", "b".repeat(64), "torn", false, "issues", List.of());
        Map<String, Object> wrapped = Map.of(
                "command", "journal", "sub", "verify",
                "run_id", "crn_run_WRAP", "report", report);
        VerifyReport r = VaeClient.normalizeVerifyPayload(wrapped);
        assertEquals("crn_run_WRAP", r.runId());
        assertTrue(r.ok());
        assertEquals(13, r.records());
        assertEquals(10, r.events());
        assertEquals("b".repeat(64), r.headHash());
        assertTrue(r.issues().isEmpty());
    }

    @Test
    void normalizeToleratesMissingOptionalFields() {
        VerifyReport r = VaeClient.normalizeVerifyPayload(Map.of("ok", false, "torn", true));
        assertFalse(r.ok());
        assertTrue(r.torn());
        assertEquals(null, r.records());
        assertEquals(null, r.headHash());
        assertTrue(r.issues().isEmpty());
    }
}
