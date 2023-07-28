package Servlets.Alignment;

import Utils.JsonHelper.JsonBuilder;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.io.FileUtils;
import org.apache.http.HttpStatus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;

@WebServlet(urlPatterns = "/alignmentManagement")
public class AlignmentManager extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        File folder = new File("res/alignmentCube");
        File[] files = folder.listFiles();

        JSONArray array = new JSONArray();
        for(File file : files){
            String jsonString = FileUtils.readFileToString(file);
            array.put(new JSONObject(jsonString));
        }

        JSONObject respJson = new JSONObject();
        respJson.put("files", array);

        out.print(respJson.toString());
        resp.setStatus(HttpStatus.SC_OK);
    }
}
