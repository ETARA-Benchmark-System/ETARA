package Utils.ReaderWriter;

import org.json.JSONObject;

import java.io.FileWriter;
import java.io.IOException;

public class DiskWriter {

    public static void writeJson(String path, JSONObject json){
        try {
            FileWriter writer = new FileWriter(path, false);
            writer.write(json.toString(4));
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void writeString(String path, String content){
        try {
            FileWriter writer = new FileWriter(path, false);
            writer.write(content);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
