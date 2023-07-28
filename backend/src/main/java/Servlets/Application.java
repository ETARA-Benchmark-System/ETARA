package Servlets;

import Configuration.ServerConfig;
import Configuration.WebserviceConfig;
import Utils.Loader.WebserviceLoader;
import jakarta.servlet.annotation.WebListener;
import org.apache.commons.io.filefilter.DirectoryFileFilter;
import org.apache.commons.io.filefilter.OrFileFilter;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.io.File;
import java.io.FilenameFilter;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Objects;

@WebListener
public class Application {

	ServerConfig global;
	LinkedList<Instant> previousRequests = new LinkedList<>();
	HashMap<String, ConfigurableServlet> webservices = new HashMap<>();
	WebserviceManagerServlet webserviceManagerServlet;
	int counter = 0;

	public Application(ServerConfig config){
		this.global = config;
	}

	public void contextInitialized(ServletContextHandler context) {
		File webserviceFolder = new File(global.getConfigPath());
		if (!webserviceFolder.isDirectory() || !webserviceFolder.exists()) {
			System.err.println("Could not find webservice configs");
			return;
		}

		for (File service : Objects.requireNonNull(webserviceFolder.listFiles((FilenameFilter) new OrFileFilter(
				new SuffixFileFilter(".json"),
				DirectoryFileFilter.DIRECTORY)))) {
			if(!service.isDirectory()) {
				addWebservice(context, global, service);
			}else{
				for (File subservice : Objects.requireNonNull(service.listFiles((FilenameFilter) new SuffixFileFilter(".json")))) {
					addWebservice(context, global, subservice);
				}
			}
		}

		// Add webserviceManager servlet
		this.webserviceManagerServlet = new WebserviceManagerServlet(this);
		ServletHolder webserviceManagerHolder = new ServletHolder(webserviceManagerServlet);
		context.addServlet(webserviceManagerHolder,"/etara/webserviceManager");
		System.out.println("Added " + "/etara/webserviceManager");
	}

	private void addWebservice(ServletContextHandler context, ServerConfig global, File service) {
		try {
			var config = WebserviceConfig.fromFile(global, service);
			String servicePath = global.getWebservicesEndpoint() + config.getPath();

			System.out.println("Added " + servicePath);
			ConfigurableServlet configurableServlet = new ConfigurableServlet(global, config, this);
			ServletHolder configurableServletHolder = new ServletHolder(configurableServlet);
			context.addServlet(configurableServletHolder, servicePath);
			webservices.put(config.getPath(), configurableServlet);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void stopWebservice(String webserviceName){
		File dir = WebserviceLoader.getWebserviceDir(webserviceName);
		if(dir != null){
			for (File configFile : Objects.requireNonNull(dir.listFiles((FilenameFilter) new SuffixFileFilter(".json")))) {
				try {
					var config = WebserviceConfig.fromFile(global, dir);
					String path = config.getPath();
					ConfigurableServlet service = this.webservices.get(path);
					this.webservices.remove(path);
					System.out.println("Stopped " + path);
					service.destroy();

				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}
}