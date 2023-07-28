package Servlets.ApiManager;


import Utils.JsonHelper.JsonBuilder;
import Utils.JsonHelper.JsonUtil;
import com.github.wnameless.json.flattener.JsonFlattener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@WebServlet(urlPatterns = "/apiManager/jsonDiff")
public class JsonDiff extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject respJson = new JSONObject();
        JSONObject jsonRequest = JsonBuilder.requestToJson(req, resp);

        if (jsonRequest == null) {
            return;
        }

        JSONObject original;
        try {
            original = jsonRequest.getJSONObject("original");
        } catch (JSONException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter original required");
            return;
        }

        JSONObject modified;
        try {
            modified = jsonRequest.getJSONObject("modified");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter modified required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        Map<String, Object> mapOriginal = JsonFlattener.flattenAsMap(original.toString());
        Map<String, Object> mapModified = JsonFlattener.flattenAsMap(modified.toString());
        JSONArray array = new JSONArray();

        Set<String> removedPaths = new HashSet<>();

        for (String key : mapOriginal.keySet()){
            if (!mapModified.containsKey(key)){
                removedPaths.add(key);
            }
        }

        JSONArray removedPathsArray = new JSONArray();
        for (String key: removedPaths) {
            removedPathsArray.put(key);
        }
        JSONArray generalPaths = new JSONArray();
        Set<String> generel = JsonUtil.generalPaths(removedPaths);
        for (String key: generel) {
            generalPaths.put(key);
        }
        JSONArray regex = new JSONArray();
        Set<String> rexMap = JsonUtil.generalPathsToRegex(generel);
        for (String key: rexMap) {
            regex.put(key);
        }

        respJson.put("removedPaths", removedPathsArray);
        respJson.put("general", generalPaths);
        respJson.put("regex", regex);


        String respString = respJson.toString();
        ByteBuffer bytes = StandardCharsets.ISO_8859_1.encode(respString);
        String output = StandardCharsets.ISO_8859_1.decode(bytes).toString();
        out.print(output);

        resp.setStatus(HttpServletResponse.SC_OK);
    }
}
