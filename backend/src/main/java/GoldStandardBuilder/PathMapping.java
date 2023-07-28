package GoldStandardBuilder;

import Utils.PathConverter;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

public class PathMapping {
    private Set<String> localEntries;
    private Set<String> webEntries;
    private Mapping.Type type;

    public PathMapping(Set<String> localEntries, Set<String> webEntries, Mapping.Type type) {
        this.localEntries = localEntries;
        this.webEntries = webEntries;
        this.type = type;
    }

    public PathMapping convertToGeneral() {
        Set<String> newWebEntries = new HashSet<>();
        for (String webEntry : this.webEntries) {
            String newPath = PathConverter.pathToGeneralPath(webEntry);
            newWebEntries.add(newPath);
        }
        return new PathMapping(this.localEntries, newWebEntries, this.type);
    }

    public PathMapping convertToRegEx() {
        Set<String> newWebEntries = new HashSet<>();
        for (String webEntry : this.webEntries) {
            String newPath = PathConverter.pathToRegexPath(webEntry);
            newWebEntries.add(newPath);
        }
        return new PathMapping(this.localEntries, newWebEntries, this.type);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PathMapping)) return false;

        PathMapping that = (PathMapping) o;
        boolean found;

        Set<String> thatlocalEntries =that.getLocalEntries();
        for (String localEntry : this.localEntries) {
            found = thatlocalEntries.contains(localEntry);
            if (found){
                break;
            }else {
                return false;
            }
        }

        Set<String> thatwebEntries =that.getWebEntries();
        for (String webEntry : this.webEntries) {
            found = thatwebEntries.contains(webEntry);
            if (found){
                break;
            }else {
                return false;
            }
        }
        if (this.type != that.type) return false;
        return true;
    }

    public Set<String> getLocalEntries() {
        return localEntries;
    }

    public Set<String> getWebEntries() {
        return webEntries;
    }

    public Mapping.Type getType() {
        return type;
    }

    public JSONObject toJSONObject() {
        JSONObject mapping = new JSONObject();
        JSONArray localEntriesArray = new JSONArray();
        JSONArray webEntriesArray = new JSONArray();
        for (String entry : this.localEntries) {
            localEntriesArray.put(entry);
        }
        for (String entry : this.webEntries) {
            webEntriesArray.put(entry);
        }
        mapping.put("localEntries", localEntriesArray);
        mapping.put("webEntries", webEntriesArray);
        mapping.put("type", this.type.index);
        return mapping;
    }


}
