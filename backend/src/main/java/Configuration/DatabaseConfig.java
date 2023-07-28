package Configuration;

import Exceptions.IdentifierMapException;
import Exceptions.ServerConfigException;
import Utils.JsonHelper.JsonImporter;
import org.apache.jena.atlas.json.JsonException;
import org.apache.jena.atlas.json.JsonObject;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DatabaseConfig {

    private final String tdb;
    private final Map<String, String> identifierMap;

    public DatabaseConfig(String tdb, Map<String, String> identifierMap) {
        this.tdb = tdb;
        this.identifierMap = identifierMap;
    }

    public static DatabaseConfig fromJson(String name, JsonObject value) throws ServerConfigException, IdentifierMapException {
        if (!value.hasKey("path"))
            throw new ServerConfigException("databases." + name + ".path", "is required");

        var path = value.get("path").getAsString().value();
        var tdbFolder = new File(path);
        if (!tdbFolder.exists() || !tdbFolder.isDirectory()) {
            System.err.println("WARNING: Looks like the tdb folder '" + path + "' for database " + name + " does not exist");
        }

        Map<String, String> identifierMap;
        if (value.hasKey("identifierMap")) {
            String mapFile = value.get("identifierMap").getAsString().value();
            identifierMap = parseIdentifierMap(mapFile);
        } else {
            identifierMap = new HashMap<>();
        }

        return new DatabaseConfig(path, identifierMap);
    }

    public String getTdb() {
        return tdb;
    }

    public Map<String, String> getIdentifierMap() {
        return identifierMap;
    }

    /**
     * Resolves the given `uri` using the identifierMap
     * If no match is found inside the identifierMap, the uri itself is used
     * @param uri the URI to resolve
     * @return the resolved URI without "<" and ">"
     */
    public String resolveIdentifier(String uri) {
        if (uri.startsWith("^")) { //inverse query
            var actualUri = uri.substring(1);
            return "^" + resolveIdentifier(actualUri);
        }
        var result = this.identifierMap.getOrDefault(uri, uri);
        return result.startsWith("<") && result.endsWith(">") ? result.substring(1, result.length() - 1) : result;
    }

    private static Map<String, String> parseIdentifierMap(String file) throws IdentifierMapException {
        JsonObject identifierJson;
        var identifierMapFile = new File(file);
        var identifierMap = new HashMap<String, String>();
        try {
            identifierJson = new JsonImporter().getJson(identifierMapFile);
        } catch (IOException ioException) {
            throw new IdentifierMapException(identifierMapFile);
        }
        for (var entry : identifierJson.entrySet()) {
            try {
                identifierMap.put(entry.getKey(), entry.getValue().getAsString().value());
            } catch (JsonException e) {
                throw new IdentifierMapException(entry.getKey());
            }
        }

        return identifierMap;
    }
}
