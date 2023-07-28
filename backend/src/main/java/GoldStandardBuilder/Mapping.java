package GoldStandardBuilder;

import javafx.util.Pair;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Mapping {
    enum Type {
        LocalToWeb(0),
        WebToLocal(1),
        Bidirectional(2);

        public final int index;

        private Type(int index) {
            this.index = index;
        }
    }

    private List<Pair<String, String>> localEntries;
    private List<Pair<String, String>> webEntries;
    private Type type;

    public Mapping(List<Pair<String, String>> localEntries, List<Pair<String, String>> webEntries, int type) {
        this.localEntries = localEntries;
        this.webEntries = webEntries;
        switch (type) {
            case 0 -> {
                this.type = Type.LocalToWeb;
            }
            case 1 -> {
                this.type = Type.WebToLocal;
            }
            case 2 -> {
                this.type = Type.Bidirectional;
            }
        }
    }

    public Mapping(JSONArray localEntries, JSONArray webEntries, int type) {
        this.localEntries = new ArrayList<>();
        this.webEntries = new ArrayList<>();
        setLocalEntries(localEntries);
        setWebEntries(webEntries);
        switch (type) {
            case 0 -> {
                this.type = Type.LocalToWeb;
            }
            case 1 -> {
                this.type = Type.WebToLocal;
            }
            case 2 -> {
                this.type = Type.Bidirectional;
            }
        }
    }

    private void setLocalEntries(JSONArray localEntries) {
        for (int i = 0; i < localEntries.length(); i++) {
            JSONObject entry = localEntries.getJSONObject(i);
            String path = entry.getString("path");
            String value = entry.getString("value");
            this.localEntries.add(new Pair<>(path, value));
        }
    }

    private void setWebEntries(JSONArray webEntries) {
        for (int i = 0; i < webEntries.length(); i++) {
            JSONObject entry = webEntries.getJSONObject(i);
            String path = entry.getString("path");
            String value = entry.getString("value");
            this.webEntries.add(new Pair<>(path, value));
        }
    }

    public boolean equalsToPathMapping(PathMapping pathMapping) {
        return pathMapping.equals(this.toPathMapping());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Mapping)) return false;
        Mapping mapping = (Mapping) o;
        boolean found;
        for (Pair<String, String> entry : mapping.localEntries) {
            found = false;
            for (Pair<String, String> entryThis : mapping.localEntries) {
                if (entry.getKey().equals(entryThis.getKey())) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        for (Pair<String, String> entry : mapping.webEntries) {
            found = false;
            for (Pair<String, String> entryThis : mapping.webEntries) {
                if (entry.getKey().equals(entryThis.getKey())) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }
        if (this.type != mapping.type) return false;
        return true;
    }

    public JSONObject toJSONObject() {
        JSONObject mapping = new JSONObject();
        JSONArray localEntriesArray = new JSONArray();
        JSONArray webEntriesArray = new JSONArray();
        for (Pair<String, String> entry : this.localEntries) {
            String path = entry.getKey();
            String value = entry.getValue();
            JSONObject newEntry = new JSONObject();
            newEntry.put("path", path);
            newEntry.put("value", value);
            localEntriesArray.put(newEntry);
        }
        for (Pair<String, String> entry : this.webEntries) {
            String path = entry.getKey();
            String value = entry.getValue();
            JSONObject newEntry = new JSONObject();
            newEntry.put("path", path);
            newEntry.put("value", value);
            webEntriesArray.put(newEntry);
        }
        mapping.put("localEntries", localEntriesArray);
        mapping.put("webEntries", webEntries);
        mapping.put("type", this.type.index);
        return mapping;
    }

    public PathMapping toPathMapping() {
        return new PathMapping(getLocalEntriesPaths(), getWebEntriesPaths(), this.type);
    }

    public Set<String> getLocalEntriesPaths() {
        Set<String> set = new HashSet<>();
        for (Pair<String, String> entry : this.localEntries) {
            set.add(entry.getKey());
        }
        return set;
    }

    public Set<String> getWebEntriesPaths() {
        Set<String> set = new HashSet<>();
        for (Pair<String, String> entry : this.webEntries) {
            set.add(entry.getKey());
        }
        return set;
    }

    @Override
    public String toString() {
        return "Mapping{" +
                "localEntries=" + localEntries +
                ", webEntries=" + webEntries +
                '}';
    }

    public List<Pair<String, String>> getLocalEntries() {
        return localEntries;
    }

    public List<Pair<String, String>> getWebEntries() {
        return webEntries;
    }

    public Type getType() {
        return type;
    }
}
