class IntentParserError extends Error {
    constructor(code, message, options = {}) {
        super(message, options);
        this.name = "IntentParserError";
        this.code = code;
        this.retryable = options.retryable ?? false;
    }
}

class IntentParserConfigurationError extends IntentParserError {
    constructor(message = "Intent parser is not configured") {
        super("INTENT_PARSER_NOT_CONFIGURED", message);
        this.name = "IntentParserNotConfigured"
    }
}

class InvalidIntentOutputError extends IntentParserError {
    constructor() {
        super(
            "INVALID_INTENT_OUTPUT",
            "The model returned invalid structured output"
        );
        this.name = "InvalidIntentOutputError";
    }
}

class IntentParserUnavailableError extends IntentParserError {
    constructor() {
        super(
            "INTENT_PARSER_UNAVAILBLE",
            "The intent parser is temporarily unavailable ",
            {
                cause: options.cause,
                retryable: true
            }
        );
        this.name = "IntentParserUnvailableError";
    }
}

/**
 * action === "undefined"
        Valid output; customer intent is unclear.

    error.code === "INVALID_INTENT_OUTPUT"
        The model/provider produced an invalid result.

    error.code === "INTENT_PARSER_NOT_CONFIGURED"
        Deployment configuration is missing.

    error.retryable === true
        Temporary provider/network failure.
 */

module.exports = {
    IntentParserError,
    IntentParserConfigurationError,
    InvalidIntentOutputError,
    IntentParserUnavailableError
};