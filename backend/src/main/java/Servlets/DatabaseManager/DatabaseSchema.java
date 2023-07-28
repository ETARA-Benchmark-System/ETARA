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

@WebServlet(urlPatterns = "/dbManager/schema")
public class DatabaseSchema extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        String dbName = req.getParameter("label");

        JSONObject respJson = new JSONObject();

        if (dbName != null){
            JSONObject json = DatabaseLoader.getDatabase(dbName);
            if (json == null){
                JSONObject errMsg = new JSONObject().put("errMsg", "database " + dbName + " unknown");
                out.print(errMsg.toString(4));
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
            respJson = DatabaseLoader.getDatabaseSchema(dbName);
            if (respJson == null){
                JSONObject errMsg = new JSONObject().put("errMsg", "no schema for database "+dbName+" available");
                out.print(errMsg.toString(4));
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
        }else {
            JSONObject errMsg = new JSONObject().put("errMsg", "missing parameter db");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
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
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON request to string");
            return;
        } catch (Exception e) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        String dbName = req.getParameter("label");

        JSONObject respJson =null;

        if (dbName != null){
            String source = DatabaseLoader.getDatabaseSource(dbName);
            if (source == null){
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "database "+dbName+" unknown");
                return;
            }
            respJson = DatabaseLoader.getDatabaseSchema(dbName);

        }else {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "missing parameter db");
            return;
        }

        out.print(respJson.toString(4));
        resp.setStatus(HttpStatus.SC_OK);
    }
}
