package Utils.Loader;

import SchemaExtractor.IdentifierExtractor;
import SchemaExtractor.SchemaExtractor;
import Utils.ReaderWriter.DiskReader;
import Utils.ReaderWriter.DiskWriter;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Set;


public class DatabaseLoader {

    private static JSONObject loadDatabases() {
        String configString = DiskReader.readFile(ConfigurationLoader.getDbPath());
        return new JSONObject(configString);
    }

    public static JSONObject getDatabases() {
        JSONObject json = loadDatabases().getJSONObject("databases");
        JSONArray array = new JSONArray();

        for (String key : json.keySet()) {
            JSONObject database = json.getJSONObject(key);
            database.put("label", key);
            array.put(database);
        }

        return new JSONObject().put("databases", array);
    }

    public static JSONObject getDatabase(String dbName) {
        JSONObject json = loadDatabases().getJSONObject("databases").optJSONObject(dbName);
        if (json == null) {
            return null;
        }
        json.put("label", dbName);
        return json;
    }

    public static String getDatabasePath(String dbName) {
        return loadDatabases().getJSONObject("databases").getJSONObject(dbName).optString("path");
    }

    public static String getDatabaseSource(String dbName) {
        return loadDatabases().getJSONObject("databases").getJSONObject(dbName).optString("source");
    }

    public static JSONObject getDatabaseSchema(String dbName) {
        String source = getDatabaseSource(dbName);
        if (source == null){
            return null;
        }

        String path = ConfigurationLoader.getOutputPath() + "data/" + dbName + "/schema/index.json";
        File file = new File(path);

        if (!file.exists()) {
            return generateDatabaseSchema(dbName);
        }

        String schema = DiskReader.readFile(path);
        return new JSONObject(schema);
    }

    public static JSONObject generateDatabaseSchema(String dbName) {
        String source = getDatabaseSource(dbName);
        if (source == null){
            return null;
        }

        String path = ConfigurationLoader.getOutputPath() + "data/" + dbName + "/schema/index.json";
        File file = new File(path);

        if (!file.exists()) {
            SchemaExtractor extractor = new SchemaExtractor(dbName, source, ConfigurationLoader.getFunctionalityThreshold());
            extractor.extractSchema();
        }

        String schema = DiskReader.readFile(path);
        return new JSONObject(schema);
    }

    public static JSONObject getIdentifierMap(String dbName) {

        JSONObject json = getDatabase(dbName);
        String path = json.getString("identifierMap");

        String content = DiskReader.readFile(path);

        return new JSONObject(content);
    }

    public static void addDatabase(JSONObject newDb) throws Exception {
        String dbPath = ConfigurationLoader.getDbPath();
        String dbsString = DiskReader.readFile(dbPath);
        JSONObject json = (new JSONObject(dbsString)).getJSONObject("databases");
        Set<String> keys = json.keySet();
        String label = newDb.getString("label");
        if (keys.contains(label)) {
            throw new Exception();
        }
        newDb.remove("label");
        json.put(label, newDb);
        File f = new File(dbPath);
        try {
            Files.deleteIfExists(f.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        DiskWriter.writeJson(dbPath, new JSONObject().put("databases", json));

        String identifierMapPath = newDb.getString("identifierMap");
        String sourcePath = newDb.getString("source");
        System.out.println("Create Identifier Map: " + identifierMapPath);
        IdentifierExtractor.createIdentifierMap(sourcePath,identifierMapPath);
    }

    public static void deleteDatabase(String label) throws Exception {
        String dbPath = ConfigurationLoader.getDbPath();
        String dbsString = DiskReader.readFile(dbPath);
        JSONObject json = (new JSONObject(dbsString)).getJSONObject("databases");
        Set<String> keys = json.keySet();
        if (!keys.contains(label)) {
            throw new Exception();
        }
        String identifierPath = json.getJSONObject(label).getString("identifierMap");

        json.remove(label);
        DiskWriter.writeJson(dbPath, new JSONObject().put("databases", json));

        System.out.println("Delete: " + identifierPath);
        File identifierFile= new File(identifierPath);
        identifierFile.delete();
    }

    public static void updateDatabase(JSONObject oldDb, JSONObject newDb) throws Exception {
        // use delete and add
        try {
            deleteDatabase(oldDb.getString("label"));
        } catch (Exception e) {
            throw new Exception();
        }

        addDatabase(newDb);
    }
}
