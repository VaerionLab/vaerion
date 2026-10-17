package dev.vaerion.sdk;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The result of recomputing a journal's blake3 chain — the same
 * {@code VerifyReport} the engine's {@code verifyJournal} produces
 * (VAERION_SDK_STANDARD §4). Verification trusts bytes on disk, never the
 * process that produced them; the SDK only carries and surfaces it.
 *
 * <p>Wire keys stay snake_case verbatim ({@code run_id}, {@code head_hash});
 * accessors are Java-idiomatic.</p>
 *
 * @param runId    the verified run ({@code crn_run_<ulid>}), when known
 * @param ok       true when every check passed (issues empty)
 * @param torn     true when the journal has an incomplete crash tail
 * @param records  number of complete records read
 * @param events   number of evt records
 * @param headHash the terminal chain hash (64 hex), when any record exists
 * @param issues   per-issue findings {@code {i, code, message}}
 */
public record VerifyReport(
        @JsonProperty("run_id") String runId,
        boolean ok,
        boolean torn,
        Integer records,
        Integer events,
        @JsonProperty("head_hash") String headHash,
        List<Map<String, Object>> issues) {

    @Override
    public String toString() {
        return "VerifyReport[run_id=" + runId + ", ok=" + ok + ", torn=" + torn
                + ", records=" + records + ", events=" + events
                + ", head_hash=" + headHash + ", issues=" + issues.size() + "]";
    }
}
