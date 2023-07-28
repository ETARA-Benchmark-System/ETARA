package Configuration;

import Exceptions.IdentifierMapException;
import Exceptions.ServerConfigException;
import SchemaExtractor.IdentifierExtractor;
import Utils.JsonHelper.JsonImporter;
import org.apache.jena.atlas.json.JsonException;
import org.apache.jena.atlas.json.JsonObject;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ServerConfig {
	private final int port;
	private final String configPath;
	private final String webservicesEndpoint;
	private final Map<String, DatabaseConfig> databases;

	public ServerConfig(int port, String configPath, String webservicesEndpoint, Map<String, DatabaseConfig> databases) {
		this.port = port;
		this.configPath = configPath;
		this.webservicesEndpoint = webservicesEndpoint;
		this.databases = databases;
	}

	public static ServerConfig fromFile(String s) throws ServerConfigException, IdentifierMapException {
		JsonObject json;
		try {
			json = new JsonImporter().getJson(new File(s));
		} catch (IOException ioException) {
			throw new ServerConfigException(s);
		}

		int port;
		try{
			port = json.get("port").getAsNumber().value().intValue();
		} catch (JsonException e){
			throw new ServerConfigException("port", "is not correctly specified");
		}

		String dbsPath;
		try{
			dbsPath = json.get("dbPath").getAsString().value();
		} catch (JsonException e){
			throw new ServerConfigException("dbPath", "is not correctly specified");
		}

		JsonObject jsonDBs;
		try {
			jsonDBs = new JsonImporter().getJson(new File(dbsPath));
		} catch (IOException ioException) {
			throw new ServerConfigException(s);
		}

		String configPath;
		try{
			configPath = json.get("config-folder").getAsString().value();
		} catch (JsonException e){
			throw new ServerConfigException("path", "is not correctly specified");
		}

		String webservicesEndpoint;
		try{
			webservicesEndpoint = json.get("webservicesEndpoint").getAsString().value();
		} catch (JsonException e){
			throw new ServerConfigException("webservicesEndpoint", "is not correctly specified");
		}

		Map<String, DatabaseConfig> dbs = new HashMap<>();
		try {
			if (!jsonDBs.hasKey("databases"))
				throw new ServerConfigException("databases", "is required");

			for (var entry : jsonDBs.get("databases").getAsObject().entrySet()) {
				String dbPath = entry.getValue().getAsObject().get("path").getAsString().value();
				String identifierMapPath = entry.getValue().getAsObject().get("identifierMap").getAsString().value();
				boolean exists = new File(identifierMapPath).exists();

				if(exists){
					dbs.put(entry.getKey(), DatabaseConfig.fromJson(entry.getKey(), entry.getValue().getAsObject()));
				} else {
					System.out.println("Create Identifier Map: " + identifierMapPath);
					IdentifierExtractor.createIdentifierMap(dbPath,identifierMapPath);
					dbs.put(entry.getKey(), DatabaseConfig.fromJson(entry.getKey(), entry.getValue().getAsObject()));
				}
			}
		} catch (JsonException e) {
			throw new ServerConfigException("databases", "needs to be an object containing objects with a 'path' and an optional 'identifierMap' each");
		}

		return new ServerConfig(port, configPath, webservicesEndpoint, dbs);
	}

	public int getPort(){
		return port;
	}

	public String getConfigPath() {
		return configPath;
	}

	public String getWebservicesEndpoint() {
		return webservicesEndpoint;
	}

	public Map<String, DatabaseConfig> getDatabases() {
        return databases;
    }

    public DatabaseConfig getDatabase(String name) {
	    return databases.get(name);
    }

}
