package Exceptions;

public class ServerConfigException extends Exception {
    public ServerConfigException(String field, String message) {
        super("Could not parse global testsystem.config. Error in field '" + field + "': " + message);
    }

    public ServerConfigException(String path) {
        super("Could not find global testsystem.config: " + path);
    }
}
