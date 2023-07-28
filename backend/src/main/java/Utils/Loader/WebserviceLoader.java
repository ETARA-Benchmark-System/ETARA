package Utils.Loader;

import Utils.ReaderWriter.DiskReader;
import Utils.ReaderWriter.DiskWriter;
import Utils.ReaderWriter.FileManager;
import org.apache.commons.io.filefilter.DirectoryFileFilter;
import org.apache.commons.io.filefilter.OrFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.json.JSONObject;

import java.io.Console;
import java.io.File;
import java.io.FilenameFilter;
import java.util.Set;

public class WebserviceLoader {
    private static JSONObject loadWebservices() {
        JSONObject webservices = new JSONObject();

        File webserviceFolder = new File(ConfigurationLoader.getWebserviceConfigFolder());
        if (!webserviceFolder.isDirectory() || !webserviceFolder.exists()) {
            System.err.println("Could not find webservice configs");
            return null;
        }
        for (File serviceFile : getWebserviceDirs()) {
            if (serviceFile.isDirectory()) {
                String dirName = serviceFile.getName();
                for (File subserviceFile : serviceFile.listFiles((FilenameFilter) new SuffixFileFilter(".json"))) {
                    JSONObject webservice = new JSONObject();
                    JSONObject webserviceConfigJson;
                    webserviceConfigJson = new JSONObject(DiskReader.readFile(subserviceFile.getPath()));
                    String returnTemplatePath = webserviceConfigJson.getString("returnTemplate");
                    String returnTemplate = DiskReader.readFile(ConfigurationLoader.getWebserviceConfigFolder()
                            + "/" + returnTemplatePath);
                    webservice.put("name", dirName);
                    webservice.put("configuration", webserviceConfigJson);
                    webservice.put("returnTemplate", returnTemplate);

                    webservices.put(dirName, webservice);
                }
            }
        }
        return webservices;
    }

    private static File[] getWebserviceDirs() {
        JSONObject webservices = new JSONObject();

        File webserviceFolder = new File(ConfigurationLoader.getWebserviceConfigFolder());
        if (!webserviceFolder.isDirectory() || !webserviceFolder.exists()) {
            System.err.println("Could not find webservice configs");
            return null;
        }
        return webserviceFolder.listFiles((FilenameFilter) new OrFileFilter(
                new SuffixFileFilter(".json"),
                DirectoryFileFilter.DIRECTORY));
    }

    public static File getWebserviceDir(String webserviceName) {
        for (File dir : getWebserviceDirs()) {
            String dirName = dir.getName();
            if (dirName.equals(webserviceName)) {
                return dir;
            }
        }
        return null;
    }

    public static JSONObject getWebservices() {
        return loadWebservices();
    }

    public static JSONObject getWebservice(String webserviceName) {
        JSONObject webservices = loadWebservices();
        Set<String> keys = webservices.keySet();

        if (keys == null || !keys.contains(webserviceName)) {
            return null;
        }
        return webservices.getJSONObject(webserviceName);
    }

    public static boolean addWebservice(String webserviceName, JSONObject webserviceConfig, String returnTemplate) {

        // schauen ob Ordner exisrert
        if (webserviceExist(webserviceName)) {
            return false;
        }

        // create new directory
        String newDirPath = ConfigurationLoader.getWebserviceConfigFolder() + "/" + webserviceName;
        File newFolder = new File(newDirPath);
        boolean dirCreated = newFolder.mkdir();

        if (!dirCreated) return false;

        // Config erstellen
        String configPath = newDirPath + "/" + webserviceName + ".json";
        DiskWriter.writeJson(configPath, webserviceConfig);

        // returnTemplate erstellen
        String returnTemplatePath = newDirPath + "/" + webserviceName + ".json.ftl";
        DiskWriter.writeString(returnTemplatePath, returnTemplate);
        return true;
    }


    /**
     * @param webserviceName
     * @return true if webservice exist and successful deleted
     */
    public static boolean deleteWebservice(String webserviceName) {
        for (File dir : getWebserviceDirs()) {
            String dirName = dir.getName();
            if (dirName.equals(webserviceName)) {
                System.out.println("Deleting dir " + dirName + " in progress...");
                if (FileManager.deleteDirectory(dir)) {
                    return dir.delete();
                }
            }
        }
        return false;
    }

    public static boolean updateWebservice(String webserviceName, JSONObject config, String returnTemplateName, String returnTemplate) {
        if (!updateWebserviceConfig(webserviceName, config)) return false;
        return updateReturnTemplate(webserviceName, returnTemplateName, returnTemplate);
    }

    public static boolean updateWebserviceConfig(String webserviceName, JSONObject config) {
        // schauen ob Ordner exisrert
        File dir = getWebserviceDir(webserviceName);
        if (dir == null) {
            return false;
        }
        File[] jsonFiles = dir.listFiles((FilenameFilter) new SuffixFileFilter(".json"));
        if (jsonFiles.length != 0) {
            DiskWriter.writeJson(jsonFiles[0].getPath(), config);
        }

        return true;
    }

    public static boolean addReturnTemplate(String webserviceName, String returnTemplateName, String returnTemplateContext) {
        File dir = getWebserviceDir(webserviceName);
        if (dir == null) {
            return false;
        }
        String rtFileName = returnTemplateName + ".json.ftl";
        File[] ftlFiles = dir.listFiles((FilenameFilter) new SuffixFileFilter(".ftl"));
        for (File file : ftlFiles) {
            if (file.getName().equals(rtFileName)) {
                return false;
            }
        }
        DiskWriter.writeString(dir.getPath() + "/" + rtFileName, returnTemplateContext);

        return true;
    }

    public static boolean updateReturnTemplate(String webserviceName, String returnTemplateName, String returnTemplateContext) {
        File dir = getWebserviceDir(webserviceName);
        if (dir == null) {
            return false;
        }
        int index = returnTemplateName.lastIndexOf("/");
        String rtFileName = returnTemplateName.substring(index + 1);
        File[] ftlFiles = dir.listFiles((FilenameFilter) new SuffixFileFilter(".ftl"));
        for (File file : ftlFiles) {
            if (file.getName().equals(rtFileName)) {
                DiskWriter.writeString(file.getPath(), returnTemplateContext);
                return true;
            }else{
                System.out.println(rtFileName+ " != " + file.getName());
            }
        }

        return false;
    }

    private static boolean webserviceExist(String webserviceName) {
        for (File dir : getWebserviceDirs()) {
            String dirName = dir.getName();
            if (dirName.equals(webserviceName)) {
                return true;
            }
        }
        return false;
    }
}
