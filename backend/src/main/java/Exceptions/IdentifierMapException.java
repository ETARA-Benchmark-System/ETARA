package Exceptions;

import java.io.File;

public class IdentifierMapException extends Exception {
    public IdentifierMapException(String field) {
        super("Could not parse identifier map: Field '" + field + "' is not a string");
    }

    public IdentifierMapException(File file) {
        super("Could not find identifier map: " + file.getPath());
    }
}
