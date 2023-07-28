package Utils.JsonHelper;

import org.apache.jena.atlas.json.*;

import java.io.*;
import java.util.function.*;


public class JsonImporter {

    private String readJson(File file) throws  IOException{
        StringBuilder complete = new StringBuilder();

        FileReader fileReader = new FileReader(file);
        BufferedReader bufferedReader = new BufferedReader(fileReader);

        String nextline = bufferedReader.readLine();

        while (nextline != null) {
            complete.append(nextline);
            nextline = bufferedReader.readLine();
        }
        bufferedReader.close();
        fileReader.close();

        return complete.toString();
    }

    private JsonObject parseJson(File file)throws IOException{
        return JSON.parse(readJson(file));
    }

    public JsonObject getJson(File file)throws IOException {
        return parseJson(file);
    }

    /**
     * If value is an array, this maps the contents of value using map and returns them as an array.
     * If value is not an array, it calls map on it and returns it in an array of size 1.
     */
    public static <T> T[] parseOneOrMany(JsonValue value, Function<JsonValue, T> map, IntFunction<T[]> newArray) {
        if (value.isArray()) { //multiple
            return value.getAsArray().stream()
                    .map(map)
                    .toArray(newArray);
        } else { //single
            T[] array = newArray.apply(1);
            array[0] = map.apply(value);
            return array;
        }
    }

}
