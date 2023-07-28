package Servlets;

import Configuration.ServerConfig;
import Configuration.WebserviceConfig;
import QueryProcessing.QueryHandler;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class ConfigurableServlet extends HttpServlet {
	
	private final QueryHandler handler;
	private final ServerConfig serverConfig;
	public final WebserviceConfig config;
	private final Application application;

	public ConfigurableServlet(ServerConfig globalConfig, WebserviceConfig clientConfig, Application application) {
		this.application = application;
		handler = new QueryHandler(globalConfig, clientConfig);
		config = clientConfig;
		serverConfig = globalConfig;
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		var start = Instant.now();
		application.previousRequests.add(start);
		application.counter++;

		response.setContentType(config.getReturnTemplate().getContentType());

		//remove requests older than 1 minute
		for (var it = application.previousRequests.iterator(); it.hasNext() ;) {
			var prevRequest = it.next();
			if (!prevRequest.isBefore(start.minus(Duration.ofMinutes(1))))
				break;
			it.remove();
		}

		//check if requests per minute is too high
		if (application.previousRequests.size() > config.getMaxRequestsPerMinute()) {
			try {
				error(429, "Too many requests", response);
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}

		//check if maximum number of requests is reached
		if(application.counter >= config.getMaxRequests()){
			try{
				error(429, "Your request limit has been reached", response);
			} catch (IOException e) {
				e.printStackTrace();
			}
			return;
		}

		Map<String, String> inputs;
		try {
			inputs = validateInputs(request, response);
		} catch (IOException ioException) {
			ioError(ioException, response);
			return;
		}

		if (inputs == null)
			return;

		var results = handler.run(inputs);
		if (results != null) {
			response.setStatus(HttpServletResponse.SC_OK);

			if (config.isFuzzy() || results.size() > 0) {
				String formattedResult;
				try {
					formattedResult = config.getReturnTemplate().format(results);
				} catch (TemplateException temp) {
					templateError(temp, response);
					return;
				} catch (IOException ioException) {
					ioError(ioException, response);
					return;
				}
				delayToLatency(() -> {
					try {
						response.getWriter().write(formattedResult);
					} catch (IOException ioException) {
						ioException.printStackTrace();
					}
				}, start);
			} else {
				delayToLatency(() -> noResultError(response,inputs), start);
			}
		} else {
			delayToLatency(() -> noResultError(response,inputs), start);
		}
	}

	private void delayToLatency(Runnable runDelayed, Instant start) {
		var end = start.plusMillis(config.getLatency());
		var waitingTime = Duration.between(Instant.now(), end);
		if (!waitingTime.isNegative() && !waitingTime.isZero()) {
			try {
				Thread.sleep(waitingTime.toMillis());
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		runDelayed.run();
	}

	private void templateError(TemplateException exception, HttpServletResponse response) {
		try {
			error(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, exception.getMessage(), response);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void ioError(IOException exception, HttpServletResponse response) {
		try {
			error(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "IOException:" + exception.getMessage(), response);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void noResultError(HttpServletResponse response, Map<String, String> inputs) {
		try {
			final List<String> resList = new LinkedList<>();
			inputs.forEach((paramter, value) -> resList.add(paramter + ":" + value));

			StringBuilder requestedResource = new StringBuilder();
			for (int i = 0; i < resList.size(); i++) {
				if(i == resList.size() - 1){
					requestedResource.append(resList.get(i));
				} else {
					requestedResource.append(resList.get(i)).append(",");
				}
			}

			error(404, requestedResource.toString(), "The requested ressource could not be found", response);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Validates the inputs and returns them.
	 * @return a map of input names to their values or null if the validation failed
	 */
	Map<String, String> validateInputs(HttpServletRequest request, HttpServletResponse response) throws IOException {
		var inputs = new HashMap<String, String>();
		for (var inputName : config.getInputs()) {
			String value = request.getParameter(inputName);
			if (value == null || value.length() == 0) {
				error(422, inputName + " is required", response);
				return null;
			}

			inputs.put(inputName, value);
		}

		return inputs;
	}

	private void error(int code, String message, HttpServletResponse response) throws IOException {
		error(code,null,message,response);
	}

	private void error(int code, String resource, String message, HttpServletResponse response) throws IOException {
		switch (config.getErrorHandling()) {
			case Server:
				response.sendError(code, message);
				break;
			case JsonWithStatus:
				response.setStatus(code);
				JSONObject codeJson = new JSONObject();
				codeJson.put("code", code);
				codeJson.put("error", message);
				response.getWriter().print(codeJson);
				break;
			case JsonWithoutStatus:
				JSONObject resourceJson = new JSONObject();
				if(resource != null){
					resourceJson.put("query", resource);
				}
				resourceJson.put("error", message);
				response.getWriter().print(resourceJson);
				break;
		}
	}


}
