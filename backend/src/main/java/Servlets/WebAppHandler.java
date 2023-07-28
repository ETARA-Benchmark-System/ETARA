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
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ErrorPageErrorHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.webapp.WebAppContext;

public class WebAppHandler {
    static WebAppContext webapp;
    static ServerConfig config;
    static Server server;
    static ServletContextHandler handler;
    static ErrorPageErrorHandler errorHandler;

    public static void init() throws IdentifierMapException, ServerConfigException {
        config = ServerConfig.fromFile("global-config.json");
        server = new Server(config.getPort());

        System.out.println("Initialising server..");
        webapp = new WebAppContext();
        webapp.setWar("client");
        webapp.setContextPath("/");

        // Adding api related servlets
        webapp.addServlet(ApiManager.class,"/etara/apiManager");
        webapp.addServlet(ApiCall.class,"/etara/apiManager/call");
        webapp.addServlet(JsonDiff.class,"/etara/apiManager/jsonDiff");
        webapp.addServlet(ToFlatJson.class,"/etara/apiManager/flatJson");

        // Adding database related servlets
        webapp.addServlet(DatabaseManager.class,"/etara/dbManager");
        webapp.addServlet(DatabaseKnowledge.class,"/etara/dbManager/knowledge");
        webapp.addServlet(DatabaseSchema.class,"/etara/dbManager/schema");

        // Adding alignment services
        webapp.addServlet(AlignmentManager.class,"/etara/alignmentManagement");
        webapp.addServlet(SaveFinalAlignment.class,"/etara/gsb/saveFinalAlignment");
        webapp.addServlet(SuggestionsServelt.class,"/etara/gsb/suggestions");
    }

    public static void loadWebservices(){
        // Adding webservice related servlets
        Application application = new Application(config);
        application.contextInitialized(webapp);

        server.setHandler(webapp);
    }

    public static void start() throws Exception {
        try {
            server.start();
            System.out.println("Server started: http://localhost:" + config.getPort());
            server.join();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            server.stop();
            System.out.println("Server start was not possible. Server stopped.");
        }
    }
}
