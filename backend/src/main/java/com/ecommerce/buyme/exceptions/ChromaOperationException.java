package com.ecommerce.buyme.exceptions;

import java.io.Serial;

public class ChromaOperationException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 1L;

    public ChromaOperationException(String message, Throwable cause) {
        super(message, cause);
    }

}
