package Utils;

public class PathConverter {

    public static String pathToGeneralPath(String path) {
        return path.replaceAll("\\[(\\d*)]", "[*]");
    }
    public static String generalToRegexPath(String path) {
        return path.replaceAll("\\[\\*]", "\\\\[\\\\d*]");
    }
    public static String pathToRegexPath(String path) {
        return path.replaceAll("\\[(\\d*)]", "\\\\[\\\\d*]");
    }


}
