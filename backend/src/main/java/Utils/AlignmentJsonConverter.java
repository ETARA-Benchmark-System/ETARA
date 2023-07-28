package Utils;

import org.json.JSONArray;
import org.json.JSONObject;

public class AlignmentJsonConverter {

    public static JSONObject GsbToAlignmentCube(JSONObject gsbJson, String localLabel, String webLabel){
        JSONArray mappings = gsbJson.getJSONArray("mappings");

        JSONObject cubeJson = new JSONObject();
        JSONArray alignments = new JSONArray();

        for (int i = 0; i < mappings.length(); i++) {
            JSONObject newMapping = new JSONObject();
            newMapping.put("metrics", new JSONObject().put("confidence" , 1));
            JSONArray newRelationPaths = new JSONArray();

            JSONObject mappingEntry = mappings.getJSONObject(i);
            JSONArray localEntries = mappingEntry.getJSONArray("localEntries");
            JSONArray webEntries = mappingEntry.getJSONArray("webEntries");

            for (int x = 0; x < localEntries.length(); x++) {
                JSONArray pathJson = new JSONArray();
                String path = localEntries.getString(x);
                String[] parts = path.split(", ");
                for (String part : parts) {
                    pathJson.put(part);
                }
                JSONObject entry = new JSONObject().put("path", pathJson);
                newRelationPaths.put(entry);
            }

            newMapping.put("relation_path", newRelationPaths );
            newMapping.put("api_path", webEntries);

            alignments.put(newMapping);
        }

        cubeJson.put("alignments", alignments);
        cubeJson.put("name", localLabel + "_" +webLabel  );
        cubeJson.put("system", "Goldstandard Builder");

        return cubeJson;
    }
}
