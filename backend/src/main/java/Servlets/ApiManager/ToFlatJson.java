package Servlets.ApiManager;

import Utils.JsonHelper.JsonBuilder;
import com.github.wnameless.json.flattener.JsonFlattener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@WebServlet(urlPatterns = "/apiManager/flatJson")
public class ToFlatJson extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject respJson = new JSONObject();
        JSONObject jsonRequest = JsonBuilder.requestToJson(req, resp);

        if (jsonRequest == null) {
            return;
        }

        Map<String, Object> map = JsonFlattener.flattenAsMap(jsonRequest.toString());
        JSONArray array = new JSONArray();

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            JSONObject entryJson = new JSONObject();
            entryJson.put("path", entry.getKey());
            String apiValue;
            try {
                apiValue = entry.getValue().toString().trim();
            } catch (Exception e) {
                apiValue = "";
            }
            entryJson.put("value", apiValue);

            array.put(entryJson);
        }
        respJson.put("dictionary", array);

        String respString = respJson.toString();
        ByteBuffer bytes = StandardCharsets.ISO_8859_1.encode(respString);
        String output = StandardCharsets.ISO_8859_1.decode(bytes).toString();
        out.print(output);

//        out.print(apiResponse.getContent().toString());
        resp.setStatus(HttpServletResponse.SC_OK);
    }
}
