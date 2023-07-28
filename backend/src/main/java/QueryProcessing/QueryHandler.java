package QueryProcessing;

import Entities.DBEntity;
import Configuration.ServerConfig;
import Configuration.WebserviceConfig;
import Exceptions.IdentifierMapException;
import Exceptions.ServerConfigException;
import Exceptions.WebserviceConfigException;
import freemarker.core.ParseException;
import freemarker.template.MalformedTemplateNameException;
import freemarker.template.TemplateNotFoundException;
import org.apache.jena.query.QueryParseException;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetFormatter;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

//DOIS :

public class QueryHandler {

    private final ServerConfig globalConfig;
    private final WebserviceConfig config;
    private final TraversalHelper traversalHelper;
    private Map<String, String> inputMap;

    public static void main(String[] args) throws WebserviceConfigException, ServerConfigException, ParseException, TemplateNotFoundException, MalformedTemplateNameException, IdentifierMapException {

    /*    var global = ServerConfig.fromFile("Configs/global-config.json");
        QueryHandler queryHandler = new QueryHandler(
                global,
				WebserviceConfig.fromFile(global, new File("Configs/webservices/getAuthorByName.json"))
		);

        HashMap<String, String> test = new HashMap<>();
        test.put("name","Roland");
        List<DBEntity> resultGraphs = queryHandler.run(test);

        for (DBEntity root : resultGraphs) {
            System.out.println(root.asResource().getValue());

        }

     */

    }

    public QueryHandler(ServerConfig globalConfig, WebserviceConfig config){
        this.globalConfig = globalConfig;
        this.config = config;
        this.traversalHelper = new TraversalHelper(config.getDatabase());
    }
    
    public List<DBEntity> run(Map<String, String> inputs) {
        setInputs(inputs);
        String query = getQuery();

        List<QuerySolution> solutions;
        QueryProcessor qp;
        try {
            qp = new QueryProcessor(query, config.getDatabase().getTdb());
            solutions = ResultSetFormatter.toList(qp.query());

            System.out.println("Results: " + solutions.size());

            LinkedList<DBEntity> resultGraphs = new LinkedList<>();
            LinkedList<String> startSubjects = new LinkedList<>();          //need to close queryprocessor before starting creating Graphs to prevent active-transactions errors
            for (QuerySolution qs : solutions ) {
                startSubjects.add(qs.get("subject").toString());
            }
            qp.close();
            for (String startSubject : startSubjects){
                resultGraphs.add(traversalHelper.createGraph(startSubject));
            }

            if (resultGraphs.isEmpty()) {
                return null;
            }

            return resultGraphs;

        } catch (QueryParseException qpe) {
            System.err.println("Failed to parse the following query:");
            System.err.println(query);
            throw qpe;
        }
    }



    private void setInputs(Map<String, String> inputs) {
        inputMap = new HashMap<>();
        String[] inputKeys = config.getInputs();

        if (inputs.size() < inputKeys.length) {
            throw new RuntimeException(config.getPath() + ": too little inputs for this webservice");
        } else if (inputKeys.length < inputs.size()) {
            throw new RuntimeException(config.getPath() + ": too many inputs for this webservice");
        }
        for (String inputName : inputKeys) {
            inputMap.put("$" + inputName, inputs.get(inputName));
        }
    }

    public String getSimilarityRegex(String input){
        String regex="\"";
        StringBuilder replace= new StringBuilder("\"");
        for (int i = 0; i < input.length(); i++) {
            regex+=("[^"+input.substring(i)+"]*(["+input.charAt(i)+"]?)");
            replace.append("$").append(i + 1);
        }
        regex+=(".*\", ");
        replace.append("\"");

        return regex.concat(replace.toString())+", \"i\") as ?match) ";
    }


    private String getQuery() {
        var conditions = config.getConditions();
        StringBuilder query = new StringBuilder("select * where {  ");
        for (var condition : conditions) {
            if (condition.getSubject() != null) {
                query.append(getIdentifier(condition.getSubject()));
            } else {
                query.append("?subject");
            }
            query.append(" ");
            query.append(getIdentifier(condition.getPredicate()));
            query.append(" ");
            if (condition.isObjectLiteral()&&!config.isFuzzy())  //für fuzzy suche werden eingaben nicht direkt eingesetzt, sondern alles angefragt, und dann gefiltert
                query.append("\"" + getIdentifier(condition.getObject()) + "\"");
            else
                query.append(getIdentifier(condition.getObject()));
            query.append(".");
        }
        if(config.isFuzzy()){
            for(String key : inputMap.keySet()){
                System.out.println(key+" "+inputMap.get(key));

                query.append("bind( replace("+ getIdentifier(key)+", "+getSimilarityRegex(inputMap.get(key)));
                query.append(". bind(strlen(?match)/strlen('"+inputMap.get(key) +"') as ?percent)");
                query.append("FILTER (?percent > 0.9)");
            }
        }
        query.append("}");
        if(config.isFuzzy()){
            query.append("order by ?pattern desc(?percent) ");
        }

        System.out.println("Query: " + query.toString());
        return query.toString();
    }

    private String getIdentifier(String s){
        if(s.startsWith("$")){
            if(config.isFuzzy()){
                return s.replaceFirst("[$]","?");
            }else {
                if(config.getInputMode().equalsIgnoreCase("LowerCase")){
                    return inputMap.get(s).toLowerCase();
                } else if(config.getInputMode().equalsIgnoreCase("UpperCase")) {
                    return inputMap.get(s).toUpperCase();
                } else {
                    return inputMap.get(s);
                }
            }
        }
        if(s.startsWith("?")){
            return s;
        }

        if(config.getInputMode().equalsIgnoreCase("LowerCase")){
            return "<" + config.getDatabase().resolveIdentifier(s).toLowerCase() + ">";
        } else if(config.getInputMode().equalsIgnoreCase("UpperCase")) {
            return "<" + config.getDatabase().resolveIdentifier(s).toUpperCase() + ">";
        } else {
            return "<" + config.getDatabase().resolveIdentifier(s) + ">";
        }
    }
}
