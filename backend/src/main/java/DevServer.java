import Servlets.ServletHandler;

public class DevServer {
    public static void main(String[] args) throws Exception {
        ServletHandler.init();
        ServletHandler.loadWebservices();
        ServletHandler.start();
    }
}
