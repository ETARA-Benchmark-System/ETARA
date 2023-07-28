package Utils.JsonHelper;

import com.github.wnameless.json.flattener.JsonFlattener;
import com.github.wnameless.json.unflattener.JsonUnflattener;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class JsonUtil {

    public static Set<String> diff(JSONObject obj1, JSONObject obj2) {
        Map<String, Object> mapOriginal = JsonFlattener.flattenAsMap(obj1.toString());
        Map<String, Object> mapModified = JsonFlattener.flattenAsMap(obj2.toString());

        Set<String> removedPaths = new HashSet<>();

        for (String key : mapOriginal.keySet()) {
            if (!mapModified.containsKey(key)) {
                removedPaths.add(key);
            }
        }
        return removedPaths;
    }

    public static Set<String> generalPaths(Set<String> set) {
        Set<String> general = new HashSet<>();
        for (String value : set) {
//            String generalPath = value.replaceAll("\\[(\\d*)]", "[*]");
            String generalPath = value.replaceAll("\\[(\\d*)]", "[*]");
            general.add(generalPath);
        }
        return general;
    }

    public static Set<String> generalPathsToRegex(Set<String> set) {
        Set<String> regexMap = new HashSet<>();
        for (String value : set) {
//            String regex = value.replaceAll("\\\\\\[\\\\\\*]", "\\\\\\[\\d*]");
            String regex = value.replaceAll("\\[\\*]", "\\\\[\\\\d*]");

            regexMap.add("^" + regex);
        }
        return regexMap;
    }

    public static JSONObject filterForRegexPaths(JSONObject json, JSONArray regexps) {

        Map<String, Object> originalMap = JsonFlattener.flattenAsMap(json.toString());
        JSONObject modified = new JSONObject(JsonFlattener.flatten(json.toString()));
        for (int i = 0; i < regexps.length(); i++) {
            String regex = regexps.getString(i);
            for (String key : originalMap.keySet()) {
                if (key.matches(regex)) {
                    modified.remove(key);
                }
            }
        }

        JSONObject reducedJson = new JSONObject(JsonUnflattener.unflatten(modified.toString()));
        return reducedJson;
    }
}
