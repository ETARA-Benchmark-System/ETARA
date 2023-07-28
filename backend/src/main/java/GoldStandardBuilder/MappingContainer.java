package GoldStandardBuilder;

import javafx.util.Pair;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.*;

public class MappingContainer {
    private PathMapping generalMapping;
    private PathMapping regexMapping;
    private Map<PathMapping, Pair<List<Mapping>, Integer>> suggestionMap;

    public MappingContainer(Mapping mapping) {
        this.generalMapping = mapping.toPathMapping().convertToGeneral();
        this.regexMapping = mapping.toPathMapping().convertToRegEx();
        this.suggestionMap = new HashMap<>();
        List<Mapping> list = new ArrayList<>();
        list.add(mapping);
        this.suggestionMap.put(mapping.toPathMapping(), new Pair<>(list, 1));
    }

    public boolean addMapping(Mapping mapping) {
        for (String localPath : regexMapping.getLocalEntries()) {
            boolean found = false;
            for (Pair<String, String> localEntry : mapping.getLocalEntries()) {
                if (localEntry.getKey().equals(localPath)) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        for (String webRegex : regexMapping.getWebEntries()) {
            boolean found = false;
            for (Pair<String, String> webEntry : mapping.getWebEntries()) {
                if (webEntry.getKey().matches(webRegex)) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        if (this.generalMapping.getType() != mapping.getType()) return false;

        for (Map.Entry<PathMapping, Pair<List<Mapping>, Integer>> map : suggestionMap.entrySet()) {
            PathMapping pathMapping = map.getKey();
            Pair<List<Mapping>, Integer> pair = map.getValue();
            List<Mapping> list = pair.getKey();
            Integer counter = pair.getValue();
            if (mapping.equalsToPathMapping(pathMapping)) {
                list.add(mapping);
                counter = counter + 1;
                pair = new Pair<>(list, counter);
                map.setValue(pair);
                return true;
            }
        }
        List<Mapping> list = new ArrayList<>();
        list.add(mapping);
        this.suggestionMap.put(mapping.toPathMapping(), new Pair<>(list, 1));

        return true;
    }

    public PathMapping getGeneralMapping() {
        return generalMapping;
    }

    public PathMapping getRegexMapping() {
        return regexMapping;
    }

    public Map<PathMapping, Pair<List<Mapping>, Integer>> getSuggestionMap() {
        return suggestionMap;
    }

    public JSONObject toJSONObject() {
        JSONObject json = new JSONObject();
        JSONObject general = this.getGeneralMapping().toJSONObject();
        general.put("selected", true);

        JSONArray mappingsArray = new JSONArray();
        int count = 0;
        for (Map.Entry<PathMapping, Pair<List<Mapping>, Integer>> entry : this.getSuggestionMap().entrySet()) {
            Pair<List<Mapping>, Integer> pair = entry.getValue();
            JSONObject suggestionEntry = new JSONObject();
            JSONObject template = entry.getKey().toJSONObject();
            JSONArray array = new JSONArray();
            for (Mapping map : pair.getKey()) {
                array.put(map.toJSONObject());
            }
            suggestionEntry.put("template", template);
            suggestionEntry.put("selected", false);
            suggestionEntry.put("counter", pair.getValue());
            count += pair.getValue();
            suggestionEntry.put("mappings", array);
            mappingsArray.put(suggestionEntry);
        }

        general.put("counter", count);
        json.put("general", general);
        json.put("suggestions", mappingsArray);
        return json;
    }
}
