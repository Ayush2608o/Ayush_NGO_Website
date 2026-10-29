package org.ayushngo.api.web;

import org.ayushngo.api.dto.ApiDtos.ErrorResponse;
import org.ayushngo.api.service.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.Comparator;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ErrorResponse> handleApi(ApiException error) {
        return ResponseEntity.status(error.getStatus()).body(new ErrorResponse(error.getMessage(), error.getCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException error) {
        String field = error.getBindingResult().getFieldErrors().stream().map(FieldError::getField)
                .min(Comparator.naturalOrder()).orElse("request");
        return ResponseEntity.badRequest().body(new ErrorResponse("Check the " + field + " field and try again.", "VALIDATION_ERROR"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ErrorResponse> handleTypeMismatch() {
        return ResponseEntity.badRequest().body(new ErrorResponse("Request value is invalid.", "INVALID_VALUE"));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnexpected(Exception error) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("The request could not be completed.", "INTERNAL_ERROR"));
    }
}
