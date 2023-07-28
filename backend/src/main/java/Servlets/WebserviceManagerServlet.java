package Servlets;

import Utils.JsonHelper.JsonBuilder;
import Utils.Loader.ConfigurationLoader;
import Utils.Loader.WebserviceLoader;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.http.HttpStatus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;

public class WebserviceManagerServlet extends HttpServlet {

    private final Application application;

    public WebserviceManagerServlet(Application application) {
        this.application = application;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");

        String option = request.getParameter("option");
        if(option.equals("overview")){
            JSONObject webservices = WebserviceLoader.getWebservices();
            JSONArray webservicesArray = new JSONArray();
            String endpoint = ConfigurationLoader.getWebservicesEndpoint();
            Set<String> keys = webservices.keySet();
            for (String key : keys) {
                JSONObject webservice = webservices.getJSONObject(key);
                JSONObject config = webservice.getJSONObject("configuration");
                String path = config.getString("webservice");
                ConfigurableServlet servlet = application.webservices.get(path);
                String status = (servlet != null) ? "online" : "offline";
                JSONObject webserviceJsonObject = new JSONObject();
                webserviceJsonObject.put("path", path);
                webserviceJsonObject.put("name", key);
                webserviceJsonObject.put("status", status);
                webservicesArray.put(webserviceJsonObject);
            }

            JSONObject respJson = new JSONObject().put("webservices", webservicesArray);
            respJson.put("endpoint", endpoint);

            response.setStatus(HttpStatus.SC_OK);
            PrintWriter out = response.getWriter();
            out.print(respJson.toString(4));
            out.flush();
        } else {
            response.setStatus(HttpStatus.SC_OK);
            PrintWriter out = response.getWriter();
            out.print("{\"status\":\"OK\"}");
            out.flush();

            try {
                ServletHandler.restart();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        JSONObject jsonRequest;

        try {
            jsonRequest = JsonBuilder.requestToJson(request);
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error parsing JSON request to string");
            return;
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        String mode;
        try {
            mode = jsonRequest.getString("mode");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter mode required ");
            return;
        }

        switch (mode) {
            case "webserviceInformation" -> {
                webserviceInformation(request, response, jsonRequest);
            }
            case "new" -> {
                newWebservice(request, response, jsonRequest);
            }
            case "update", "updateReturnTemplate", "updateConfiguration" -> {
                updateWebservice(request, response, jsonRequest);
            }
            case "delete" -> {
                delete(request, response, jsonRequest);
            }
            default -> {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "unknown value for mode");
            }
        }
    }

    private void delete(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        if (WebserviceLoader.getWebservice(name) == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No webservice found for name " + name);
            return;
        }
        if (!WebserviceLoader.deleteWebservice(name)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to delete webservice" + name);
            return;
        }
    }

    private void updateWebservice(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        JSONObject configuration;
        try {
            configuration = jsonRequest.getJSONObject("configuration");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (JSONObject) configuration required ");
            return;
        }
        String returnTemplateName;
        try {
            returnTemplateName = jsonRequest.getString("returnTemplateName");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
        String returnTemplate;
        try {
            returnTemplate = jsonRequest.getString("returnTemplate");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
        if (!WebserviceLoader.updateWebservice(name, configuration, returnTemplateName, returnTemplate)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unable to update webservice configurations/returnTemolate ");
            return;
        }
    }

    private void updateWebserviceReturnTemplate(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        String returnTemplateName;
        try {
            returnTemplateName = jsonRequest.getString("returnTemplateName");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
        String returnTemplate;
        try {
            returnTemplate = jsonRequest.getString("returnTemplate");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
        if (!WebserviceLoader.updateReturnTemplate(name, returnTemplateName, returnTemplate)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unable to update the returnTemplate of webservice " + name);
            return;
        }
    }

    private void updateWebserviceConfig(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        JSONObject configuration;
        try {
            configuration = jsonRequest.getJSONObject("configuration");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (JSONObject) configuration required ");
            return;
        }
        if (!WebserviceLoader.updateWebserviceConfig(name, configuration)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unable to update webservice configurations/returnTemolate ");
            return;
        }
    }

    private void updateReturnTemplate(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        String returnTemplate;
        try {
            returnTemplate = jsonRequest.getString("returnTemplate");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
    }

    private void webserviceInformation(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        ServletOutputStream out = response.getOutputStream();
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        try {
            JSONObject json = WebserviceLoader.getWebservice(name);
            if (json != null) {
                out.print(json.toString(4));
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "no webservice found for name " + name);
            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private void newWebservice(HttpServletRequest request, HttpServletResponse response, JSONObject jsonRequest) throws IOException {
        String name;
        try {
            name = jsonRequest.getString("name");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter name required");
            return;
        }
        JSONObject configuration;
        try {
            configuration = jsonRequest.getJSONObject("configuration");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (JSONObject) configuration required ");
            return;
        }
        String returnTemplate;
        try {
            returnTemplate = jsonRequest.getString("returnTemplate");
        } catch (JSONException e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "parameter (string) returnTemplate required ");
            return;
        }
        if (!WebserviceLoader.addWebservice(name, configuration, returnTemplate)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Creating new webservice failed");
            return;
        }
    }
}

































