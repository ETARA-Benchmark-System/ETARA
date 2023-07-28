package Entities;

import Configuration.DatabaseConfig;
import QueryProcessing.TraversalHelper;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

public class DBResourceEntity implements DBEntity {
    private boolean cached = false;
    private final Map<String, LinkedList<DBEntity>> connectedWith = new HashMap<>();
    private final String uri;
    private final TraversalHelper traversalHelper;
    private final DatabaseConfig database;

    public DBResourceEntity(String uri, TraversalHelper traversalHelper, DatabaseConfig database) {
        this.uri = uri;
        this.traversalHelper = traversalHelper;
        this.database = database;
    }

    public void addConnection(String relation, DBEntity entity) {
        connectedWith
                .computeIfAbsent(relation, rel -> new LinkedList<>())
                .add(entity);
    }

    public Collection<DBEntity> getConnections(String relation) {
        // connections are only queried once and taken from cache for every subsequent call
        if (!cached) {
            traversalHelper.stepInto(this);
            cached = true;
        }

        return this.connectedWith.get(database.resolveIdentifier(relation));
    }

    public Collection<DBEntity> find(Iterable<String> path) {
        var iterator = path.iterator();
        if (!iterator.hasNext())
            return List.of(this);
        var nextPathPart = iterator.next();
        var connections = this.getConnections(nextPathPart);
        if (connections == null)
            return Collections.emptyList();
        if (!iterator.hasNext())
            return connections;

        return connections.stream()
                .filter(DBEntity::isResource)
                .flatMap(e -> e.asResource().find( ()->iterator).stream())
                .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Traverses all cached connections starting from, but not including, this entity.
     *
     * @param traversalMethod The method to call for every connected entity (and their connections, and so on)
     *                        with the relation it is connected by and the
     */
    public void traverse(BiConsumer<Iterable<String>, DBEntity> traversalMethod) {
        traverse(new LinkedList<>(), traversalMethod);
    }

    private void traverse(LinkedList<String> pathList, BiConsumer<Iterable<String>, DBEntity> traversalMethod) {
        for (var entry : connectedWith.entrySet()) {
            var predicate = entry.getKey();
            var entities = entry.getValue();
            pathList.add(predicate);
            for (var entity : entities) {
                traversalMethod.accept(pathList, entity);
                if (entity.isResource())
                    entity.asResource().traverse(pathList, traversalMethod);
            }
            pathList.removeLast();
        }
    }

    @Override
    public boolean isAnonymousResource() {
        return false;
    }

    @Override
    public boolean isResource() {
        return true;
    }

    @Override
    public DBResourceEntity asResource() {
        return this;
    }

    public String getURI() {
        return uri;
    }
}
