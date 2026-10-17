package dev.vaerion.sdk;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The daemon's {@code 201} response for {@code POST /runs}:
 * {@code {run_id, trace_id, kind}} plus the raw payload.
 *
 * <p>Wire keys stay snake_case verbatim (VAERION_SDK_STANDARD §2c); the
 * accessors are Java-idiomatic ({@link #getRunId()}).</p>
 */
public record RunStarted(
        @JsonProperty("run_id") String runId,
        @JsonProperty("trace_id") String traceId,
        @JsonProperty("kind") String kind,
        Map<String, Object> started) {

    @Override
    public String toString() {
        return "RunStarted[run_id=" + runId + ", trace_id=" + traceId + ", kind=" + kind + "]";
    }
}
