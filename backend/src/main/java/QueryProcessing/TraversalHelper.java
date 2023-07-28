package QueryProcessing;

import Configuration.DatabaseConfig;
import Entities.DBAnonymousResourceEntity;
import Entities.DBEntity;
import Entities.DBLiteralEntity;
import Entities.DBResourceEntity;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetFormatter;

import java.util.List;

public class TraversalHelper {

    private final DatabaseConfig config;

    public TraversalHelper(DatabaseConfig config) {
        this.config = config;
    }

    public DBEntity createGraph(String uri) {
        return new DBResourceEntity(uri, this, this.config);
    }

    public void stepInto(DBResourceEntity start) {
        var query = "select * where { <" + start.getURI() + "> ?predicate ?object . }";
        QueryProcessor qp = new QueryProcessor(query, config.getTdb());
        var results = ResultSetFormatter.toList(qp.query());
        qp.close();

        var inverseQuery = "select * where { ?object ?predicate  <" + start.getURI() + "> . }";
        qp = new QueryProcessor(inverseQuery, config.getTdb());
        var inverseResults = ResultSetFormatter.toList(qp.query());
        qp.close();

        addResults(results, "", start);
        addResults(inverseResults, "^", start);
    }

    private void addResults(List<QuerySolution> results, String predicatePrefix, DBResourceEntity addTo) {
        for (var solution : results) {
            var childPredicate = predicatePrefix + solution.get("predicate").toString();
            var childObject = solution.get("object");

            System.out.println("s: "+addTo.getValue()+    " p: " + childPredicate + " o " + childObject.toString());

            if (childObject.isResource()) {
                //a connected resource
                if(childObject.isAnon()){
                    addTo.addConnection(childPredicate,new DBAnonymousResourceEntity(childObject.toString(),this,this.config));
                }else {
                    addTo.addConnection(childPredicate, new DBResourceEntity(childObject.toString(), this, this.config));
                }
            } else {
                //a connected literal
                addTo.addConnection(childPredicate, new DBLiteralEntity(childObject.toString()));
            }
        }
    }
}