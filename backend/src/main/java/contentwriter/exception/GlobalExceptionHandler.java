package contentwriter.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the REST API.
 * <p>
 * Provides user-friendly error messages instead of exposing stack traces
 * or database internals to the client applications.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle MethodArgumentNotValidException - validation errors.
     * <p>
     * Example: Client sends invalid length type like "INVALID" instead of "MEDIUM".
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RuntimeException handleValidationExceptions(final MethodArgumentNotValidException ex) {
        log.warn("Validation error occurred", ex);

        return new RuntimeException(ex.getMessage(), ex);
    }

    /**
     * Handle HttpMessageNotReadableException - malformed JSON/body.
     * <p>
     * Example: Client sends invalid JSON or incorrect content-type header.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RuntimeException handleInvalidBody(final HttpMessageNotReadableException ex) {
        return new RuntimeException("Request body is malformed or invalid", ex);
    }

    /**
     * Handle MissingServletRequestParameterException - missing required param.
     * <p>
     * Example: Backend expects "contentType" but client didn't provide it.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RuntimeException handleMissingParameter(final MissingServletRequestParameterException ex) {
        log.warn("Missing request parameter: {} in contentType {}", 
                ex.getParameterName(), ex.getMessage());
        
        RuntimeException error = new RuntimeException(
            String.format("Missing required request parameter: %s", ex.getParameterName())
        );
        error.initCause(ex);
        return error;
    }

    /**
     * Handle ConstraintViolationException - validation errors.
     * <p>
     * Additional bean validation exceptions for manual constraint checks.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RuntimeException handleConstraints(final ConstraintViolationException ex) {
        log.warn("Constraint validation error: {}", ex.getMessage());
        return new RuntimeException(ex.getMessage(), ex);
    }

    /**
     * Handle generic RuntimeException (fallback).
     * <p>
     * Catch-all for unexpected errors from services or repositories.
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public RuntimeException handleGeneric(final RuntimeException ex) {
        log.error("Unexpected error while processing request", ex);

        return new RuntimeException(
            "Internal server error: " +
            (ex.getMessage() != null ? ex.getMessage() : "unknown error")
        );
    }
}
