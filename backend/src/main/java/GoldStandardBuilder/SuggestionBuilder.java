package GoldStandardBuilder;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.*;

public class SuggestionBuilder {

    public static JSONObject build(JSONArray mappings) {
        return null;
    }

    public static JSONArray buildSuggestionArray(JSONArray mappings) {
        List<Mapping> mappingList = new ArrayList<>();
        List<MappingContainer> mappingContainers = new ArrayList<>();

        // Retrieve all mappings
        for (int i = 0; i < mappings.length(); i++) {
            JSONObject mappingJson = mappings.getJSONObject(i);
            JSONArray localEntries = mappingJson.getJSONArray("localEntries");
            JSONArray webEntries = mappingJson.getJSONArray("webEntries");
            int type = mappingJson.getInt("type");
            Mapping newMapping = new Mapping(localEntries, webEntries, type);
            mappingList.add(newMapping);
        }

        // Assign each Mapping to a container
        for (Mapping mapping : mappingList) {
            boolean added = false;
            for (MappingContainer container : mappingContainers) {
                added = container.addMapping(mapping);
                if (added) break;
            }
            if (!added){
                mappingContainers.add(new MappingContainer(mapping));
            }
        }

        // Convert Container to JSON
        JSONArray suggestionsJson = new JSONArray();
        for (MappingContainer container : mappingContainers) {
            JSONObject containerJson = container.toJSONObject();
            suggestionsJson.put(containerJson);
        }

        return suggestionsJson;
    }
}
