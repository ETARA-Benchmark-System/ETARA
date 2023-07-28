package Servlets.ApiManager;

import Servlets.ServletHandler;
import Utils.JsonHelper.JsonBuilder;
import Utils.Loader.ApiLoader;
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

@WebServlet(urlPatterns = "/apiManager")
public class ApiManager extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        String apiName = req.getParameter("label");

        JSONObject respJson;

        if (apiName != null){
            respJson = ApiLoader.getApiConfiguration(apiName);
            if (respJson == null){
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "web database "+apiName+" unknown");
                return;
            }
        }else{
            respJson = ApiLoader.getApis();
        }

        resp.setStatus(HttpStatus.SC_OK);
        out.print(respJson.toString(4));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject jsonRequest;

        try {
            jsonRequest = JsonBuilder.requestToJson(req);
            System.out.println(jsonRequest);
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
        } catch (JSONException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter mode required ");
            return;
        }

        switch (mode) {
            case "new" -> {
                try {
                    JSONObject api;
                    try {
                        api = jsonRequest.getJSONObject("api");
                    } catch (JSONException e) {
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter api required ");
                        return;
                    }
                    ApiLoader.addApi(api);
                } catch (Exception e) {
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }

            case "update" -> {
                JSONObject newApi = jsonRequest.getJSONObject("newApi");
                String oldApi = jsonRequest.getString("label");
                try {
                    ApiLoader.updateApi(oldApi, newApi);
                } catch (Exception e) {
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }

            case "delete" -> {
                String label;
                label = jsonRequest.getString("label");
                try {
                    ApiLoader.deleteApi(label);
                } catch (Exception e) {
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }
            }
            default -> {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "unknown value for mode");
            }
        }
    }
}
