package Utils.Loader;

import Utils.ReaderWriter.DiskReader;
import org.json.JSONObject;

public class ConfigurationLoader {
    private static final String configPath = "global-config.json";

    private static JSONObject loadGlobals() {
        String configString = DiskReader.readFile(configPath);

        return new JSONObject(configString);
    }

    public static String getApiPath() {
        return loadGlobals().getString("apiPath");
    }

    public static String getDbPath() {
        return loadGlobals().getString("dbPath");
    }

    public static String getOutputPath() {
        return loadGlobals().getString("outputPath");
    }

    public static int getMemory() {
        return loadGlobals().getInt("memory");
    }

    public static String getLogPath() {
        return loadGlobals().getString("logpath");
    }

    public static double getFunctionalityThreshold() {
        return loadGlobals().getDouble("functionality_threshold");
    }

    public static String getWebservicesEndpoint() {
        return loadGlobals().getString("webservicesEndpoint");
    }

    public static String getWebserviceConfigFolder() {
        return loadGlobals().getString("config-folder");
    }

    public static int getLogLevel() {
        return loadGlobals().getInt("loglevel");
    }

    public static int getTraversalDepth() {
        return loadGlobals().getInt("traversal_depth");
    }

    public static boolean isInSupportMode() {
        return (Integer.parseInt(loadGlobals().getString("support_mode")) != 0);
    }

    public static int getMode() {
        return Integer.parseInt(loadGlobals().getString("mode"));
    }

    public static int getTimeout() {
        return Integer.parseInt(loadGlobals().getString("timeout"));
    }

    public static double getCandidateResponses() {
        return Double.parseDouble(loadGlobals().getString("candidate_responses"));
    }
}
