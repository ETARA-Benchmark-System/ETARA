package Exceptions;

import java.io.File;

public class WebserviceConfigException extends Exception {

    public WebserviceConfigException(File file, String field, String message) {
        super("Could not parse " + file.getPath() + ". Error in field '" + field + "': " + message);
    }

    public WebserviceConfigException(File file) {
        super("Could not find webservice testsystem.config " + file.getPath());
    }
}
