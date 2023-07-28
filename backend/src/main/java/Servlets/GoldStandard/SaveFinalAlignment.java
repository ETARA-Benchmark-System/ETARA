package Servlets.GoldStandard;

import Utils.AlignmentJsonConverter;
import Utils.JsonHelper.JsonBuilder;
import Utils.Loader.ConfigurationLoader;
import Utils.ReaderWriter.DiskWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.http.HttpStatus;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@WebServlet(urlPatterns = "/gsb/saveFinalAlignment")
public class SaveFinalAlignment extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");

        ServletOutputStream out = resp.getOutputStream();
        resp.setContentType("application/json;charset=UTF-8");

        JSONObject jsonRequest = JsonBuilder.requestToJson(req, resp);
        JSONObject respJson = new JSONObject();

        if (jsonRequest == null) {
            return;
        }

        String localLabel;
        try {
            localLabel = jsonRequest.getString("localLabel");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter localLabel required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String webLabel;
        try {
            webLabel = jsonRequest.getString("webLabel");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter webLabel required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        JSONObject alignment;
        try {
            alignment = jsonRequest.getJSONObject("alignment");
        } catch (JSONException e) {
            JSONObject errMsg = new JSONObject().put("errMsg", "parameter alignment required");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // Save normal format
        String filename= localLabel+"_"+webLabel;
        String path = ConfigurationLoader.getOutputPath() + "goldStandard/"+filename+".json";

        File yourFile = new File(path.substring(0,path.lastIndexOf("/")));
        yourFile.mkdirs();

        File f = new File(path);
        int counter= 0;
        while (Files.exists(f.toPath())){
            String name = filename+"_"+counter++;
            path = ConfigurationLoader.getOutputPath() + "goldStandard/"+name+".json";
            f = new File(path);
        }
        try {
            Files.deleteIfExists(f.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        DiskWriter.writeJson(path, alignment);

        if (Files.exists(f.toPath())){
            resp.setStatus(HttpServletResponse.SC_OK);
        }else {
            JSONObject errMsg = new JSONObject().put("errMsg", "Unable to create file");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        respJson.put("gsbPath", path);

        // Save alignment cube format
        JSONObject cubeJson = AlignmentJsonConverter.GsbToAlignmentCube(alignment, localLabel, webLabel);

        filename= localLabel+"_"+webLabel;
        path = ConfigurationLoader.getOutputPath() + "alignmentCube/"+filename+".json";

        yourFile = new File(path.substring(0,path.lastIndexOf("/")));
        yourFile.mkdirs();

        f = new File(path);
        counter= 0;
        while (Files.exists(f.toPath())){
            String name = filename+"_"+counter++;
            path = ConfigurationLoader.getOutputPath() + "alignmentCube/"+name+".json";
            f = new File(path);

            // Update JSON
            cubeJson.put("name",name);
        }
        try {
            Files.deleteIfExists(f.toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
        DiskWriter.writeJson(path, cubeJson);

        if (Files.exists(f.toPath())){
            resp.setStatus(HttpServletResponse.SC_OK);
        }else {
            JSONObject errMsg = new JSONObject().put("errMsg", "Unable to create file");
            out.print(errMsg.toString(4));
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        respJson.put("cubePath", path);

        out.print(respJson.toString());
        resp.setStatus(HttpStatus.SC_OK);
    }
}
