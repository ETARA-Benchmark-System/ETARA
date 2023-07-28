package Entities;

import Configuration.DatabaseConfig;
import QueryProcessing.TraversalHelper;

import java.util.ArrayList;
import java.util.Collection;

public class DBAnonymousResourceEntity extends DBResourceEntity{

    public DBAnonymousResourceEntity(String uri, TraversalHelper traversalHelper, DatabaseConfig database) {
        super(uri, traversalHelper, database);
    }

    @Override
    public boolean isAnonymousResource() {
        return true;
    }

    @Override
    public DBAnonymousResourceEntity asAnonymousResource() {
        return this;
    }

    @Override
    public String getURI() {
        return "_:"+super.getURI();
    }

    public Collection<DBEntity> getList(){

        ArrayList<DBEntity> list = new ArrayList<>();
        ArrayList<String> first = new ArrayList<>();
        first.add("http://www.w3.org/1999/02/22-rdf-syntax-ns#first");
        ArrayList<String> rest = new ArrayList<>();
        rest.add("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest");

        list.addAll(this.asAnonymousResource().find(first));
        DBAnonymousResourceEntity current=this;
        DBEntity next = this.find(rest).iterator().next();
        while (!next.getValue().equals("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil")){
            current=next.asAnonymousResource();
            list.addAll(current.asAnonymousResource().find(first));
            next=current.asAnonymousResource().find(rest).iterator().next();
        }
        return list;
    }
}
