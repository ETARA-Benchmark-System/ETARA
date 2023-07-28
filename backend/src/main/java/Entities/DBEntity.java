package Entities;

import Configuration.DatabaseConfig;
import QueryProcessing.TraversalHelper;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

public interface DBEntity {

    boolean isResource();

    boolean isAnonymousResource();

    default String getValue() {
        return isResource() ? asResource().getURI() : asLiteral().getValue();
    }

    default DBResourceEntity asResource() {
        throw new RuntimeException("Not a resource");
    }

    default DBAnonymousResourceEntity asAnonymousResource() {throw new RuntimeException("not a anonymousResource"); }

    default DBLiteralEntity asLiteral() {
        throw new RuntimeException("Not a literal");
    }


}





