package Entities;

public class DBLiteralEntity implements DBEntity {
    private final String value;

    public DBLiteralEntity(String value) {
        this.value = value.replaceAll("(\\^\\^http://www.w3.org/2001/XMLSchema#).*","");
    }

    public String getValue() {
        return value;
    }

    @Override
    public DBLiteralEntity asLiteral() {
        return this;
    }

    @Override
    public boolean isAnonymousResource(){return false;}
    @Override
    public boolean isResource() {
        return false;
    }
}
