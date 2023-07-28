package Configuration;

import org.apache.jena.atlas.json.JsonValue;

public class WebserviceCondition {

    private final String subject;
    private final String predicate;
    private final String object;
    private final boolean isObjectLiteral;

    private WebserviceCondition(String subject, String predicate, String object, boolean isObjectLiteral) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.isObjectLiteral = isObjectLiteral;
    }

    public static WebserviceCondition fromJsonValue(JsonValue where) {
        if (where.isObject()) {
            var whereObj = where.getAsObject();
            boolean isObjectLiteral = whereObj.hasKey("literal");
            String objectKey = isObjectLiteral ? "literal" : "object";

            return new WebserviceCondition(
                    whereObj.hasKey("subject") ? whereObj.get("subject").getAsString().value() : null,
                    whereObj.get("predicate").getAsString().value(),
                    whereObj.get(objectKey).getAsString().value(),
                    isObjectLiteral
            );
        } else { //array
            var whereArr = where.getAsArray();
            var subject = whereArr.size() > 2 ? whereArr.get(0).getAsString().value() : null;
            int predIndex = subject == null ? 0 : 1;
            int objIndex = predIndex + 1;
            var object = whereArr.get(objIndex).getAsString().value();
            return new WebserviceCondition(
                    subject,
                    whereArr.get(predIndex).getAsString().value(),
                    object,
                    object.startsWith("$")
            );
        }
    }

    /**
     * Returns true if the object of this condition is a literal, false if it is a URI
     */
    public boolean isObjectLiteral() {
        return isObjectLiteral;
    }

    public String getObject() {
        return object;
    }

    public String getPredicate() {
        return predicate;
    }

    public String getSubject() {
        return subject;
    }
}
