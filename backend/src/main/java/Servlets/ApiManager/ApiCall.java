package Servlets.ApiManager;

import GoldStandardBuilder.ResponseConverter;
import Utils.JsonHelper.JsonBuilder;
import Utils.JsonHelper.JsonUtil;
import Utils.Loader.ApiLoader;
import Utils.Utils;
import WebApi.ArgumentException;
import WebApi.GeneralWebApi;
import WebApi.HttpResponse;
import com.github.wnameless.json.flattener.JsonFlattener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import javafx.util.Pair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@WebServlet(urlPatterns = "/apiManager/call")
public class ApiCall extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject respJson = new JSONObject();
        JSONObject jsonRequest = JsonBuilder.requestToJson(req, resp);

        if (jsonRequest == null) {
            return;
        }

        String apiLabel;
        try {
            apiLabel = jsonRequest.getString("label");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter label required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String value;
        try {
            value = jsonRequest.getString("value");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter value required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        JSONArray regexArray;
        regexArray = jsonRequest.optJSONArray("regex");


        JSONObject json = ApiLoader.getApiConfiguration(apiLabel);
        if (json == null) {
            JSONObject errMsg = new JSONObject().put("errMsg", "api " + apiLabel + " unknown");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        GeneralWebApi api = new GeneralWebApi(apiLabel);

        HttpResponse apiResponse;
        if (value.contains("^^")) value = value.substring(0, value.indexOf("^^"));
        try {
            String url = api.buildCallUrl(false, value);
            apiResponse = api.doApiCall(url);
        } catch (ArgumentException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "ArgumentException during the api call");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        if (apiResponse == null){
            JSONObject errMsg = new JSONObject().put("errMsg", "Api response was empty for value " + value);
            errMsg.put("errCode", 1);
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        HashMap<String, Object> map = ResponseConverter.convertResponse(apiResponse);
        JSONObject apiResponseJson = new JSONObject(apiResponse.getContent());
        respJson.put("originalResponse", apiResponseJson);

        JSONObject reducedJSon = apiResponseJson;
        if (regexArray != null && regexArray.length() != 0) {
            reducedJSon = JsonUtil.filterForRegexPaths(apiResponseJson, regexArray);
        }
        respJson.put("reducedResponse", reducedJSon);


        JSONArray array = new JSONArray();
        if (apiResponse != null) {
            Map<String, Object> reducedMap = JsonFlattener.flattenAsMap(reducedJSon.toString());
            for (Map.Entry<String, Object> entry : reducedMap.entrySet()) {
                JSONObject entryJson = new JSONObject();
                entryJson.put("path", entry.getKey());
                String apiValue;
                try {
                    apiValue = entry.getValue().toString().trim();
                } catch (Exception e) {
                    apiValue = "";
                }
                entryJson.put("value", apiValue);

//                entryJson.put("value", entry.getValue().toString());
                array.put(entryJson);
            }
            respJson.put("dictionary", array);
        } else {
            JSONObject errMsg = new JSONObject().put("errMsg", "empty response for api call");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        String respString = respJson.toString();
        ByteBuffer bytes = StandardCharsets.ISO_8859_1.encode(respString);
        String output = StandardCharsets.ISO_8859_1.decode(bytes).toString();
        out.print(output);

        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private Pair<String, Integer> determineCommonPrefix(HttpResponse resp) {

        HashMap<String, Object> map = ResponseConverter.convertResponse(resp);

        String maxPrefix = "";
        int maxCount = -1;

        if (map != null) {
            Map<String, Integer> countMap = new HashMap<>();
            for (Map.Entry<String, Object> path1 : map.entrySet()) {
                for (Map.Entry<String, Object> path2 : map.entrySet()) {
                    int end = Utils.getLongestSubsequenceLength(path1.getKey(), path2.getKey());
                    if (end != path1.getKey().length()) {
                        String str = path1.getKey().substring(0, end);
                        if (countMap.containsKey(str)) {
                            countMap.put(str, countMap.get(str) + 1);
                        } else {
                            countMap.put(str, 1);
                        }
                    }
                }
            }

            for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
                if (entry.getValue() > maxCount) {
                    maxPrefix = entry.getKey();
                    maxCount = entry.getValue();
                }
            }
        }

        return new Pair<>(maxPrefix, maxCount);
    }
}
