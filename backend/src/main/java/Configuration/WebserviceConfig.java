package Configuration;

import Exceptions.WebserviceConfigException;
import Utils.ErrorType;
import Utils.ReturnTemplate;
import freemarker.core.ParseException;
import freemarker.template.MalformedTemplateNameException;
import freemarker.template.TemplateNotFoundException;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.jena.atlas.json.JsonArray;
import org.apache.jena.atlas.json.JsonException;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.atlas.json.JsonValue;
import Utils.JsonHelper.JsonImporter;

import java.io.File;
import java.io.IOException;

public class WebserviceConfig {

    private static final String[] supportedMatchingModes = new String[]{"precise", "fuzzy"};
    private static final String[] supportedInputModes = new String[]{"none","lowerCase", "upperCase"};

    private final String path;
    private final String configFilePath;
    private final String returnTemplateFilePath;
    private final String[] inputs;
    private final WebserviceCondition[] conditions;
    private final ReturnTemplate returnTemplate;
    private final DatabaseConfig database;
    private final boolean fuzzy;
    private final String mode;
    private final ErrorType errorHandling;
    private final int latency;
    private final int maxRequestsPerMinute;
    private final int maxRequests;

    private WebserviceConfig(String path, String configFilePath, String returnTemplateFilePath, String[] inputs, WebserviceCondition[] conditions, boolean fuzzy,
                             String mode, ErrorType errorHandling, int latency, int maxRequestsPerMinute, int maxRequests,
                             ReturnTemplate returnTemplate, DatabaseConfig database)
    {
        this.path = path;
        this.configFilePath = configFilePath;
        this.returnTemplateFilePath = returnTemplateFilePath;
        this.inputs = inputs;
        this.conditions = conditions;
        this.fuzzy = fuzzy;
        this.mode = mode;
        this.errorHandling = errorHandling;
        this.latency = latency;
        this.maxRequestsPerMinute = maxRequestsPerMinute;
        this.maxRequests = maxRequests;
        this.returnTemplate = returnTemplate;
        this.database = database;
    }

    public static WebserviceConfig fromFile(ServerConfig global, File file)
            throws WebserviceConfigException, ParseException, TemplateNotFoundException,
                   MalformedTemplateNameException
    {
        JsonObject json;
        try {
            json = new JsonImporter().getJson(file);
        } catch (IOException ioException) {
            throw new WebserviceConfigException(file);
        }

        String configFilePath = file.getPath();

        JsonValue where = json.get("where");
        WebserviceCondition[] conditions;
        if (where == null)
            throw new WebserviceConfigException(file, "where", "is required");
        try {
            conditions = JsonImporter.parseOneOrMany(where,
                    WebserviceCondition::fromJsonValue,
                    WebserviceCondition[]::new);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "where",
                    "needs to be an object of type {string subject?, string predicate, string object} " +
                            "or an array of such objects or an array of arrays of strings (with length 2 or 3)");
        }

        String matchingMode;
        try {
            matchingMode = json.hasKey("type") ? json.get("type").getAsString().value() : supportedMatchingModes[0];
            if (!ArrayUtils.contains(supportedMatchingModes, matchingMode))
                throw new WebserviceConfigException(file, "type", "unsupported matching mode " + matchingMode);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "type", "needs to be a string");
        }

        int latency;
        try{
            latency = json.hasKey("latency") ? Integer.parseInt(json.get("latency").getAsString().value()) : 0;
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "latency", "needs to be a string");
        }

        int maxRequestsPerMinute;
        try{
            maxRequestsPerMinute = json.hasKey("maxRequestsPerMinute") ?
                    Integer.parseInt(json.get("maxRequestsPerMinute").getAsString().value()) : Integer.MAX_VALUE;
        } catch (JsonException e){
            throw new WebserviceConfigException(file, "maxRequestsPerMinute", "needs to be a string");
        }

        int maxRequests;
        try{
            maxRequests = json.hasKey("maxRequests") ?
                    Integer.parseInt(json.get("maxRequests").getAsString().value()) : Integer.MAX_VALUE;
        } catch (JsonException e){
            throw new WebserviceConfigException(file, "maxRequests", "needs to be a string");
        }

        String mode;
        try {
            mode = json.hasKey("inputMode") ? json.get("inputMode").getAsString().value() : supportedInputModes[0];
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "inputMode", "needs to be a string");
        }

        String errorTypeValue = "";
        ErrorType errorType;
        try {
            if (!json.hasKey("errorType")) throw new WebserviceConfigException(file, "errorType", "is required");
            errorTypeValue = json.get("errorType").getAsString().value();
            errorType = ErrorType.fromString(errorTypeValue);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "errorType", "needs to be a string");
        } catch (IllegalArgumentException e) {
            throw new WebserviceConfigException(file, "errorType", "unsupported errorType " + errorTypeValue);
        }

        String[] inputs;
        try {
            var inputField = json.hasKey("inputs") ? json.get("inputs") : new JsonArray();
            inputs = inputField.getAsArray().stream()
                    .map(v -> v.getAsString().value()).toArray(String[]::new);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "inputs", "needs to be an array of strings");
        }

        ReturnTemplate returnTemplate;
        String returnTemplateFilePath;
        if (!json.hasKey("returnTemplate"))
            throw new WebserviceConfigException(file, "returnTemplate", "is required");
        try {
            returnTemplate = new ReturnTemplate(json.get("returnTemplate").getAsString().value());
            returnTemplateFilePath = file.getParentFile().getParentFile().getPath()+ "\\" + (json.get("returnTemplate").getAsString().value());
        } catch (TemplateNotFoundException | MalformedTemplateNameException | ParseException temp) {
            throw temp;
        } catch (IOException ioException) {
            throw new WebserviceConfigException(file, "returnTemplate", "could not load file '"
                    + json.get("returnTemplate").getAsString().value() + "'");
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "returnTemplate", "has to be a string");
        }

        DatabaseConfig db;
        if (!json.hasKey("db"))
            throw new WebserviceConfigException(file, "db", "is required");
        try {
            var dbName = json.get("db").getAsString().value();
            db = global.getDatabase(dbName);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "db", "needs to be a string");
        }

        if (!json.hasKey("webservice"))
            throw new WebserviceConfigException(file, "webservice", "is required");
        try {
            return new WebserviceConfig(json.get("webservice").getAsString().value(),
                    configFilePath, returnTemplateFilePath, inputs, conditions, matchingMode.equals("fuzzy"), mode, errorType,
                    latency, maxRequestsPerMinute, maxRequests, returnTemplate, db);
        } catch (JsonException e) {
            throw new WebserviceConfigException(file, "type", "needs to be a string");
        }
    }

    /**
     * Returns the path under which the webservice should be made available
     */
    public String getPath() {
        return path;
    }

    public String[] getInputs() {
        return inputs;
    }

    public String getConfigFilePath() {
        return configFilePath;
    }

    public String getReturnTemplateFilePath() {
        return returnTemplateFilePath;
    }

    public WebserviceCondition[] getConditions() {
        return conditions;
    }

    public ReturnTemplate getReturnTemplate() {
        return returnTemplate;
    }

    public boolean isFuzzy() {
        return fuzzy;
    }

    public String getInputMode(){
        return mode;
    }

    public ErrorType getErrorHandling() {
        return errorHandling;
    }

    public int getLatency() {
        return latency;
    }

    public int getMaxRequestsPerMinute() {
        return maxRequestsPerMinute;
    }

    public int getMaxRequests() {
        return maxRequests;
    }

    public DatabaseConfig getDatabase() {
        return database;
    }
}