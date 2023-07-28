package Servlets.DatabaseManager;

import Utils.JsonHelper.JsonBuilder;
import Utils.Loader.DatabaseLoader;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.http.HttpStatus;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

@WebServlet(urlPatterns = "/dbManager")
public class DatabaseManager extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        String dbLabel = req.getParameter("label");

        JSONObject respJson;

        if (dbLabel != null){
            respJson = DatabaseLoader.getDatabase(dbLabel);
            if (respJson == null){
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "database "+dbLabel+" unknown");
                return;
            }
            JSONObject jsonIdentMap = DatabaseLoader.getIdentifierMap(dbLabel);
            respJson.put("identifierMapContent", jsonIdentMap);
        }else{
            respJson = DatabaseLoader.getDatabases();
        }

        out.print(respJson.toString(4));
        resp.setStatus(HttpStatus.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject jsonRequest;
        try {
            jsonRequest = JsonBuilder.requestToJson(req);
        } catch (JSONException e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON request string");
            return;
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        String mode;
        try {
            mode = jsonRequest.getString("mode");
        }catch (JSONException e){
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter mode required ");
            return;
        }

        switch (mode) {
            case "new" -> {
                try {
                    JSONObject db;
                    try {
                        db = jsonRequest.getJSONObject("db");
                    }catch (JSONException e){
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter db required ");
                        return;
                    }
                    DatabaseLoader.addDatabase(db);
                } catch (Exception e) {
                    System.out.println(e);
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }

            case "update" -> {
                JSONObject newDb = jsonRequest.getJSONObject("newDb");
                JSONObject oldDb = jsonRequest.getJSONObject("db");
                try {
                    DatabaseLoader.updateDatabase(oldDb, newDb);
                } catch (Exception e) {
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }

            case "delete" -> {
                String label;
                label = jsonRequest.getString("label");
                try {
                    DatabaseLoader.deleteDatabase(label);
                } catch (Exception e) {
                    e.printStackTrace();
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }
            default -> {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "unknown value for mode");
                return;
            }
        }
    }
}
