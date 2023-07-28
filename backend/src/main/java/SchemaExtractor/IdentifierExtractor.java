package SchemaExtractor;

import QueryProcessing.QueryProcessor;
import org.apache.jena.atlas.json.JsonObject;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetFormatter;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class IdentifierExtractor {
    public static void createIdentifierMap(String path, String identifierMapPath){
        String queryString = "select distinct ?p where { ?s ?p ?o . }";

        QueryProcessor qp = new QueryProcessor(queryString,path);
        List<QuerySolution> solutions = ResultSetFormatter.toList(qp.query());
        qp.close();

        JsonObject identifierMap = new JsonObject();
        for(QuerySolution solution : solutions){
            if(solution.get("p").toString().contains("#")){
                String key = solution.get("p").toString().substring(solution.get("p").toString().lastIndexOf("#")+1);
                identifierMap.put(key, "<"+solution.get("p")+">");
            } else {
                String key = solution.get("p").toString().substring(solution.get("p").toString().lastIndexOf("/")+1);
                identifierMap.put(key, "<"+solution.get("p")+">");
            }
        }

        try {
            File file = new File(identifierMapPath);
            file.createNewFile();

            FileWriter myWriter = new FileWriter(file);
            myWriter.write(identifierMap.toString());
            myWriter.close();
        } catch (IOException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }
    }
}
