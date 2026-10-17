package dev.vaerion.sdk;

import java.util.Map;

/**
 * Vaerion errors — one stable diagnostic: E-code + what failed + the Fix.
 *
 * <p>The daemon's error body is {@code {"error": {"code", "message", "fix",
 * "detail"}}} (the same E-code contract the CLI renders). {@link VaerionError}
 * carries all three so callers can branch on codes (E1301 broker denial,
 * E2000 auth required, …) and show the Fix line verbatim. Codes are stable
 * strings, never enums that require recompilation to learn new values
 * (VAERION_SDK_STANDARD §10).</p>
 *
 * <p>{@link #getMessage()} and {@link #toString()} render
 * {@code "E1234 message (Fix: ...)"} — exactly the shape the engine prints.</p>
 */
public class VaerionError extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String code;
    private final String message;
    private final String fix;
    private final Object detail;

    public VaerionError(String code, String message) {
        this(code, message, null, null);
    }

    public VaerionError(String code, String message, String fix) {
        this(code, message, fix, null);
    }

    public VaerionError(String code, String message, String fix, Object detail) {
        super(render(code, message, fix));
        this.code = code;
        this.message = message;
        this.fix = fix;
        this.detail = detail;
    }

    /** Build from the daemon's JSON error body (best effort, never throws). */
    public static VaerionError fromErrorPayload(Object payload) {
        if (payload instanceof Map<?, ?> m) {
            Object errObj = m.get("error");
            Map<?, ?> err = errObj instanceof Map<?, ?> e ? e : m;
            String code = err.get("code") == null ? "E1900" : String.valueOf(err.get("code"));
            String message = err.get("message") == null ? "unknown daemon error" : String.valueOf(err.get("message"));
            Object fixObj = err.get("fix");
            String fix = fixObj == null ? null
                    : (fixObj instanceof String s && s.isEmpty() ? null : String.valueOf(fixObj));
            return new VaerionError(code, message, fix, err.get("detail"));
        }
        return new VaerionError("E1900", String.valueOf(payload), null, null);
    }

    private static String render(String code, String message, String fix) {
        return code + " " + message + (fix == null || fix.isEmpty() ? "" : " (Fix: " + fix + ")");
    }

    /** The stable {@code E####} code — a string, never an enum (§10c). */
    public String getCode() {
        return code;
    }

    /** The human message, without the code/fix decoration. */
    public String getErrorMessage() {
        return message;
    }

    /** The actionable next step (may be {@code null}). */
    public String getFix() {
        return fix;
    }

    /** Machine-readable detail payload from the daemon (may be {@code null}). */
    public Object getDetail() {
        return detail;
    }

    /** Renders {@code "E1234 message (Fix: ...)"} — no class-name prefix. */
    @Override
    public String toString() {
        return getMessage();
    }
}
