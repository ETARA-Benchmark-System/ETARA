import Servlets.WebAppHandler;

public class MainServer {
    public static void main(String[] args) throws Exception {
        WebAppHandler.init();
        WebAppHandler.loadWebservices();
        WebAppHandler.start();
    }
}
