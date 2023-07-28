package Servlets.DatabaseManager;

import QueryProcessing.KnowledgeBaseManagement;
import Utils.JsonHelper.JsonBuilder;
import Utils.Loader.DatabaseLoader;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import javafx.util.Pair;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpStatus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

@WebServlet(urlPatterns = "/dbManager/knowledge")
public class DatabaseKnowledge extends HttpServlet {

    // Not in use
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        String dbName = req.getParameter("db");

        JSONObject respJson = new JSONObject();

        if (dbName != null) {
            JSONObject json = DatabaseLoader.getDatabase(dbName);
            if (json == null) {
                JSONObject errMsg = new JSONObject().put("errMsg", "database " + dbName + " unknown");
                out.print(errMsg.toString(4));
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
            if (respJson == null) {
                JSONObject errMsg = new JSONObject().put("errMsg", "no schema for database " + dbName + " available");
                out.print(errMsg.toString(4));
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
        } else {
            JSONObject errMsg = new JSONObject().put("errMsg", "missing parameter db");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        int similarityRequests = 10;
        String predicate = "http://example/com/crossref/doi";
        String db = "crossref";
        String inputType = "http://example/com/crossref/Publication";
        List<Pair<String, String>> valueList = KnowledgeBaseManagement.getPredicateValues(dbName, inputType, predicate, similarityRequests);

        JSONArray pairsJson = new JSONArray();
        for (Pair<String, String> pair : valueList) {

            pairsJson.put(new JSONObject().put(pair.getKey(), pair.getValue()));
        }
        respJson.put(predicate, pairsJson);

        out.print(respJson.toString(4));
        resp.setStatus(HttpStatus.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject respJson = new JSONObject();
        JSONObject jsonRequest = JsonBuilder.requestToJson(req, resp);

        if (jsonRequest == null) {
            return;
        }

        String dbLabel;
        try {
            dbLabel = jsonRequest.getString("label");
        } catch (JSONException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter label required");
            return;
        }

        String predicate;
        try {
            predicate = jsonRequest.getString("predicate");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter predicate required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        int limit;
        try {
            limit = jsonRequest.getInt("limit");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter limit required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String inputType;
        try {
            inputType = jsonRequest.getString("inputType");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter inputType required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        JSONObject json = DatabaseLoader.getDatabase(dbLabel);
        if (json == null) {
            JSONObject errMsg = new JSONObject().put("errMsg", "database " + dbLabel + " unknown");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        JSONObject schema = DatabaseLoader.getDatabaseSchema(dbLabel);
        if (schema == null) {
            JSONObject errMsg = new JSONObject().put("errMsg", "no schema for database " + dbLabel + " available");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        List<Pair<String, String>> valueList = KnowledgeBaseManagement.getPredicateValues(dbLabel, inputType, predicate, limit);

        JSONArray pairsJson = new JSONArray();

        for (Pair<String, String> valuePair : valueList) {

            JSONObject entry = new JSONObject();
            entry.put("subject", valuePair.getKey());
            entry.put("value", valuePair.getValue());

            Set<Pair<String, String>> fullKnowledge = KnowledgeBaseManagement.getFullKnowledgeOnlyLiteral(dbLabel, inputType, valuePair.getValue());
            JSONArray fullKnowledgeJson = new JSONArray();
            for (Pair<String, String> pair : fullKnowledge) {
                String hash = DigestUtils.md5Hex(pair.getKey()+pair.getValue());
                JSONObject path = new JSONObject();
                path.put("path", pair.getKey());
                path.put("hash", hash);
                path.put("value", pair.getValue());
                fullKnowledgeJson.put(path);
            }
            entry.put("fullKnowledge", fullKnowledgeJson);

            pairsJson.put(entry);
        }
        respJson.put("predicate", predicate);
        respJson.put("valueList", pairsJson);

        ByteBuffer bytes = StandardCharsets.ISO_8859_1.encode(respJson.toString());
        String output = StandardCharsets.ISO_8859_1.decode(bytes).toString();

        out.print(output);
        resp.setStatus(HttpStatus.SC_OK);
    }
}
