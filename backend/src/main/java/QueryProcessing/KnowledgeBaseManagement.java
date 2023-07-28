package QueryProcessing;

import Utils.Loader.ConfigurationLoader;
import Utils.Loader.DatabaseLoader;
import Utils.Loader.SchemaLoader;
import javafx.util.Pair;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSetFormatter;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;


public class KnowledgeBaseManagement {
    private static final int DEPTH = ConfigurationLoader.getTraversalDepth();

    public static List<Pair<String, String>> getPredicateValues(String dbName, String type, String p, int limit) {
        String queryString = "select ?s ?value (UUID() AS ?uuid) where { ?s <" + p + "> ?value . ?s a <" + type + "> . } order by ?uuid limit " + limit;
        QueryProcessor qp = new QueryProcessor(queryString, Objects.requireNonNull(DatabaseLoader.getDatabasePath(dbName)));
        List<QuerySolution> result = ResultSetFormatter.toList(qp.query());
        qp.close();

        List<Pair<String, String>> list = new LinkedList<>();
        for (QuerySolution solution : result) {
            list.add(new Pair<>(solution.get("value").toString(), solution.get("s").toString()));
        }

        return list;
    }

    public static List<QuerySolution> getCompleteEntry(String dbName, String entity) {
        String queryString = "select ?relation ?value where { <" + entity + "> ?relation ?value . }";
        QueryProcessor qp = new QueryProcessor(queryString, Objects.requireNonNull(DatabaseLoader.getDatabasePath(dbName)));
        List<QuerySolution> solutions = ResultSetFormatter.toList(qp.query());
        qp.close();

        return solutions;
    }

    /**
     * @param dbName
     * @param inputType
     * @param entity
     * @return Only return nodes with literals
     */
    public static Set<Pair<String, String>> getFullKnowledgeOnlyLiteral(String dbName, String inputType, String entity) {
        List<QuerySolution> localKnowledge = KnowledgeBaseManagement.getCompleteEntry(dbName, entity);
        Set<Pair<String, String>> fullKnowledge = getKnowledgeOnlyLiterals(dbName, localKnowledge, null);
        Set<String> inverseRelations = getInverseRelations(dbName, inputType);

        for (String relation : inverseRelations) {
            String inverseQuery = "select ?relation ?value where { <" + entity + "> ^<" + relation + "> ?e . ?e ?relation ?value . }";
            QueryProcessor qp = new QueryProcessor(inverseQuery, Objects.requireNonNull(DatabaseLoader.getDatabasePath(dbName)));
            List<QuerySolution> solutions = ResultSetFormatter.toList(qp.query());
            qp.close();

            Set<Pair<String, String>> inverseFullKnowledge = new HashSet<>();
            for (Pair<String, String> pair : getKnowledgeOnlyLiterals(dbName, solutions, null)) {
                Pair<String, String> newPair = new Pair<>("^" + relation + ", " + pair.getKey(), pair.getValue());
                inverseFullKnowledge.add(newPair);
            }
            fullKnowledge.addAll(inverseFullKnowledge);
        }
        return fullKnowledge;
    }

    private static Set<String> getInverseRelations(String dbName, String inputType) {
        JSONArray schema = SchemaLoader.getStructure(dbName);

        Set<String> inverseRelations = new HashSet<>();
        for (int i = 0; i < schema.length(); i++) {
            JSONObject obj = schema.getJSONObject(i);

            try {
                String object = obj.getString("object");

                if (object.equals(inputType)) {
                    inverseRelations.add(obj.getString("predicate"));
                }
            } catch (JSONException ignored) {
            }
        }

        return inverseRelations;
    }

    private static Set<Pair<String, String>> getKnowledgeOnlyLiterals(String dbName, List<QuerySolution> localKnowledge, String predecessor) {
        Set<Pair<String, String>> fullKnowledge = new HashSet<>();
        for (QuerySolution solution : localKnowledge) {
            if (solution.get("value").isLiteral()) {
                fullKnowledge.add(new Pair<>(solution.get("relation").toString(), solution.get("value").toString()));
            }
        }

        for (QuerySolution dbEntry : localKnowledge) {
            String dbRelation = dbEntry.get("relation").toString();

            // If the value is an URI query the entity and get the facts of that entity (path traversal)
            // Dont go traverse backwards over the predecessor edge (prevent circles)
            if ((predecessor == null && dbEntry.get("value").isResource())
                    || (predecessor != null && !predecessor.equals(dbEntry.get("relation").toString()) && dbEntry.get("value").isResource())) {

                List<Pair<String, String>> innerRecord = traverse(dbName, dbRelation, dbEntry.get("value").asResource());
                fullKnowledge.addAll(innerRecord);
            }
        }
        return fullKnowledge;
    }

    private static List<Pair<String, String>> traverse(String dbName, String relation, Resource entity) {
        int currentDepth = relation.split(",").length;
        List<QuerySolution> innerRecord = traverseEntity(dbName, entity); // Query properties and values
        List<Pair<String, String>> intermediateResult = new LinkedList<>();

        if (currentDepth < (DEPTH)) {
            for (QuerySolution solution : innerRecord) {
                if (solution.get("value").isResource()) {
                    intermediateResult.add(new Pair<>(relation + ", " + solution.get("relation").toString(), solution.get("value").toString()));
                    intermediateResult.addAll(traverse(dbName, relation + ", " + solution.get("relation").toString(), solution.get("value").asResource()));
                } else {
                    intermediateResult.add(new Pair<>(relation + ", " + solution.get("relation").toString(), solution.get("value").toString()));
                }
            }
        }

        return intermediateResult;
    }

    private static List<QuerySolution> traverseEntity(String dbName, Resource entity) {
        String traversalQuery;
        if (entity.isAnon())
            traversalQuery = "select ?relation ?value where { <_:" + entity.getId().getBlankNodeId().getLabelString() + "> ?relation ?value . }";
        else traversalQuery = "select ?relation ?value where { <" + entity.getURI() + "> ?relation ?value . }";

        QueryProcessor qp = new QueryProcessor(traversalQuery, Objects.requireNonNull(DatabaseLoader.getDatabasePath(dbName)));
        List<QuerySolution> innerRecord = ResultSetFormatter.toList(qp.query());
        qp.close();

        String query = null;
        for (QuerySolution sol : innerRecord) {
            if (sol.get("relation").asResource().equals(RDF.type) && sol.get("value").asResource().equals(RDF.List))
                query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT ?item WHERE { <_:" + entity.getId().getBlankNodeId().getLabelString() + "> rdf:rest*/rdf:first ?item . }";
        }

        if (query != null) {
            qp = new QueryProcessor(query, Objects.requireNonNull(DatabaseLoader.getDatabasePath(dbName)));
            List<QuerySolution> list = ResultSetFormatter.toList(qp.query());
            qp.close();

            innerRecord = new LinkedList<>();
            for (QuerySolution sol : list) {
                innerRecord.addAll(traverseEntity(dbName, sol.get("item").asResource()));
            }
        }

        return innerRecord;
    }
}
