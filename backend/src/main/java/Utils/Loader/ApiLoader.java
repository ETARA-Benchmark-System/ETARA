package Utils.Loader;

import Utils.ReaderWriter.DiskReader;
import Utils.ReaderWriter.DiskWriter;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

public class ApiLoader {

    private static JSONObject loadApis() {
        String configString = DiskReader.readFile(ConfigurationLoader.getApiPath());

        return new JSONObject(configString);
    }

    public static JSONObject getApis() {
        return loadApis();
    }

    public static JSONObject getApiConfiguration(String apiName){
        JSONArray apisArray = loadApis().optJSONArray("apis");
        if (apisArray == null) {
            return null;
        }
        for (Iterator<Object> it = apisArray.iterator(); it.hasNext(); ) {
            JSONObject api = (JSONObject) it.next();
            String label = api.optString("label");
            if (apiName.equals(label)){
                return api;
            }
        }
        return null;
    }

    public static void addApi(JSONObject newApi) throws Exception {
        String apiPath = ConfigurationLoader.getApiPath();
        JSONArray apis = loadApis().getJSONArray("apis");
        Iterator<Object> it = apis.iterator();
        String label = newApi.getString("label");
        boolean isNew = true;
        while (it.hasNext()) {
            JSONObject api = (JSONObject) it.next();
            if (api.getString("label").equals(label)){
                isNew = false;
                break;
            }
        }
        if (!isNew){
            throw new Exception();
        }

        apis.put(newApi);
        File f = new File(apiPath);
        try {
            Files.deleteIfExists(f.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }

        DiskWriter.writeJson(apiPath, new JSONObject().put("apis", apis));
    }

    public static void deleteApi(String label) throws Exception {
        String apiPath = ConfigurationLoader.getApiPath();
        JSONArray apis = loadApis().getJSONArray("apis");
        JSONArray newApis = new JSONArray();
        Iterator<Object> it = apis.iterator();
        boolean isKnown = false;
        while (it.hasNext()) {
            JSONObject api = (JSONObject) it.next();
            if (api.getString("label").equals(label)){
                isKnown = true;
            }else {
                newApis.put(api);
            }
        }
        if (isKnown == false){
            throw new Exception();
        }
        File f = new File(apiPath);
        try {
            Files.deleteIfExists(f.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        DiskWriter.writeJson(apiPath, new JSONObject().put("apis", newApis));
    }

    public static void updateApi(String oldLabel, JSONObject newApi) throws Exception {
        // use delete and add
        try {
            deleteApi(oldLabel);
        } catch (Exception e) {
            throw new Exception();
        }

        addApi(newApi);
    }

    public static String getSingleInputType(String apiName){
        JSONObject tmp = getApiConfiguration(apiName);
        JSONArray array = Objects.requireNonNull(tmp).getJSONArray("parameters");

        try{
            return array.getJSONObject(0).getString("type");
        } catch (Exception e){
            return null;
        }
    }

    public static List<String[]> getSelection(String apiName){
        JSONObject apiConfig = getApiConfiguration(apiName);
        JSONArray array = apiConfig.getJSONArray("selection");

        List<String[]> list = new LinkedList<>();
        for (int i = 0; i < array.length(); i++) {
            String[] tmp = array.getJSONObject(i).getString("type").split(", ");
            list.add(tmp);
        }

        return list;
    }

    public static boolean existsSelection(String apiName){
        try{
            JSONObject apiConfig = getApiConfiguration(apiName);
            JSONArray array = apiConfig.getJSONArray("selection");

            return true;
        } catch (Exception e){
            return false;
        }
    }
}
