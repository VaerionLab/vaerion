package dev.vaerion.sdk.examples;

import java.nio.file.Path;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import dev.vaerion.sdk.VaeClient;
import dev.vaerion.sdk.VerifyReport;

/**
 * Basic — the five-line Vaerion experience, executed for real.
 *
 * <p>Run it against a scratch workspace:</p>
 *
 * <pre>
 *   java -cp 'target/classes:$(dependency classpath)' dev.vaerion.sdk.examples.Basic /tmp/vaerion-demo
 * </pre>
 *
 * <p>The example SPAWNS its own loopback daemon ({@code vae serve} with
 * {@code VAE_TRUST} pre-provisioned — the token is never printed), runs one
 * brokered, journaled agent goal, prints the receipt's integrity commitment,
 * replays the event stream, and verifies the journal chain through the CLI of
 * record before shutting the daemon down.</p>
 */
public final class Basic {

    private Basic() {
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        Path cwd = Path.of(args.length > 0 ? args[0] : ".").toAbsolutePath();
        System.out.println("vaerion java sdk — basic example");
        System.out.println("workspace: " + cwd);

        try (VaeClient vae = new VaeClient(cwd)) {
            Map<String, Object> health = vae.client().health();
            System.out.println("health: ok=" + health.get("ok") + " engine_version=" + health.get("engine_version"));

            Map<String, Object> result = vae.run("summarize the project from the journal");
            String runId = String.valueOf(result.get("run_id"));
            System.out.println("run: run_id=" + runId + " status=" + result.get("status")
                    + " journal_ok=" + result.get("journal_ok"));
            Map<String, Object> receipt = (Map<String, Object>) result.get("receipt");
            Map<String, Object> journal = (Map<String, Object>) receipt.get("journal");
            System.out.println("receipt: head_hash=" + journal.get("head_hash")
                    + " records=" + journal.get("records"));

            int count = 0;
            List<String> firstTypes = new java.util.ArrayList<>();
            Iterator<Map<String, Object>> events = vae.events(runId);
            while (events.hasNext()) {
                Object type = events.next().get("type");
                count++;
                if (firstTypes.size() < 3) {
                    firstTypes.add(String.valueOf(type));
                }
            }
            System.out.println("events replayed: " + count + " (first: " + String.join(", ", firstTypes) + ")");

            VerifyReport report = vae.verify(runId);
            System.out.println("verify: ok=" + report.ok() + " torn=" + report.torn()
                    + " records=" + report.records() + " events=" + report.events()
                    + " head_hash=" + report.headHash());

            System.out.println("daemon stopped");
        }
    }
}
