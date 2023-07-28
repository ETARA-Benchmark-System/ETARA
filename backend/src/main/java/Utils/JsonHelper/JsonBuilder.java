package Utils.JsonHelper;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;

public class JsonBuilder {

    public static JSONObject requestToJson(HttpServletRequest req) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        String line;

            BufferedReader reader = req.getReader();
            while ((line = reader.readLine()) != null)
                stringBuilder.append(line);

        return new JSONObject(stringBuilder.toString());
    }

    public static JSONObject requestToJson(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ServletOutputStream out = resp.getOutputStream();
        StringBuilder stringBuilder = new StringBuilder();
        String line;
        try {
            BufferedReader reader = req.getReader();
            while ((line = reader.readLine()) != null)
                stringBuilder.append(line);
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "Error parsing JSON request to string");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return null;
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return null;
        }


        return new JSONObject(stringBuilder.toString());
    }
}
