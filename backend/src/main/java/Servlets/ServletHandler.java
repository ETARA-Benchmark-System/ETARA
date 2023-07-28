package Servlets;

import Configuration.ServerConfig;
import Exceptions.IdentifierMapException;
import Exceptions.ServerConfigException;
import Servlets.Alignment.AlignmentManager;
import Servlets.ApiManager.ApiCall;
import Servlets.ApiManager.ApiManager;
import Servlets.ApiManager.JsonDiff;
import Servlets.ApiManager.ToFlatJson;
import Servlets.DatabaseManager.DatabaseKnowledge;
import Servlets.DatabaseManager.DatabaseManager;
import Servlets.DatabaseManager.DatabaseSchema;
import Servlets.GoldStandard.SaveFinalAlignment;
import Servlets.GoldStandard.SuggestionsServelt;
import jakarta.servlet.DispatcherType;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ErrorPageErrorHandler;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlets.CrossOriginFilter;

import java.util.EnumSet;

public class ServletHandler {
    static ServerConfig config;
    static Server server;
    static ServletContextHandler handler;
    static ErrorPageErrorHandler errorHandler;

    public static void init() throws IdentifierMapException, ServerConfigException {
        config = ServerConfig.fromFile("global-config.json");
        server = new Server(config.getPort());

        System.out.println("Initialising server..");
        handler = new ServletContextHandler(server, "/");

        // Adding error handler
        errorHandler = new ErrorPageErrorHandler();
        errorHandler.addErrorPage(404, "/");
        handler.setErrorHandler(errorHandler);

        // Add the filter, and then use the provided FilterHolder to configure it
        FilterHolder cors = handler.addFilter(CrossOriginFilter.class,"/*", EnumSet.of(DispatcherType.REQUEST));
        cors.setInitParameter(CrossOriginFilter.ALLOWED_ORIGINS_PARAM, "*");
        cors.setInitParameter(CrossOriginFilter.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER, "*");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_METHODS_PARAM, "GET,POST,HEAD");
        cors.setInitParameter(CrossOriginFilter.ALLOWED_HEADERS_PARAM, "X-Requested-With,Content-Type,Accept,Origin");

        // Adding api related servlets
        handler.addServlet(ApiManager.class,"/etara/apiManager");
        handler.addServlet(ApiCall.class,"/etara/apiManager/call");
        handler.addServlet(JsonDiff.class,"/etara/apiManager/jsonDiff");
        handler.addServlet(ToFlatJson.class,"/etara/apiManager/flatJson");

        // Adding database related servlets
        handler.addServlet(DatabaseManager.class,"/etara/dbManager");
        handler.addServlet(DatabaseKnowledge.class,"/etara/dbManager/knowledge");
        handler.addServlet(DatabaseSchema.class,"/etara/dbManager/schema");

        // Adding alignment services
        handler.addServlet(AlignmentManager.class,"/etara/alignmentManagement");
        handler.addServlet(SaveFinalAlignment.class,"/etara/gsb/saveFinalAlignment");
        handler.addServlet(SuggestionsServelt.class,"/etara/gsb/suggestions");
    }

    public static void loadWebservices(){
        // Adding webservice related servlets
        Application application = new Application(config);
        application.contextInitialized(handler);

        server.setHandler(handler);
    }

    public static void start() throws Exception {
        try {
            server.start();
            System.out.println("Development server started: http://localhost:" + config.getPort());
            server.join();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            server.stop();
            System.out.println("Server start was not possible. Server stopped.");
        }
    }

    public static void restart() throws Exception {
        System.out.println("Restarting server.");
        server.stop();
        ServletHandler.init();
        ServletHandler.loadWebservices();
        ServletHandler.start();
    }
}
