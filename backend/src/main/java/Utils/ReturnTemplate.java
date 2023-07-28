package Utils;

import Entities.DBEntity;
import freemarker.cache.ConditionalTemplateConfigurationFactory;
import freemarker.cache.FileExtensionMatcher;
import freemarker.cache.FirstMatchTemplateConfigurationFactory;
import freemarker.core.JSONOutputFormat;
import freemarker.core.ParseException;
import freemarker.core.TemplateConfiguration;
import freemarker.core.XMLOutputFormat;
import freemarker.template.*;
import org.apache.jena.atlas.json.JsonNumber;
import org.apache.jena.atlas.json.JsonString;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ReturnTemplate {

    static Configuration freeMarkerConfig;

    static {
        // Create your Configuration instance, and specify if up to what FreeMarker
        // version (here 2.3.29) do you want to apply the fixes that are not 100%
        // backward-compatible. See the Configuration JavaDoc for details.
        freeMarkerConfig = new Configuration(Configuration.VERSION_2_3_29);

        // Specify the source where the template files come from. Here I set a
        // plain directory for it, but non-file-system sources are possible too:
        try {
            freeMarkerConfig.setDirectoryForTemplateLoading(new File("configs/webservices"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        // From here we will set the settings recommended for new projects. These
        // aren't the defaults for backward compatibilty.

        // Set the preferred charset template files are stored in. UTF-8 is
        // a good choice in most applications:
        freeMarkerConfig.setDefaultEncoding("UTF-8");

        // Sets how errors will appear.
        // During web page *development* TemplateExceptionHandler.HTML_DEBUG_HANDLER is better.
        freeMarkerConfig.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);

        // Don't log testsystem.exceptions inside FreeMarker that it will thrown at you anyway:
        freeMarkerConfig.setLogTemplateExceptions(false);

        // Wrap unchecked testsystem.exceptions thrown during template processing into TemplateException-s:
        freeMarkerConfig.setWrapUncheckedExceptions(true);

        // Do not fall back to higher scopes when reading a null loop variable:
        freeMarkerConfig.setFallbackOnNullLoopVariable(false);

        // Auto-escaping
        var tcXML = new TemplateConfiguration();
        tcXML.setOutputFormat(XMLOutputFormat.INSTANCE);

        var tcJSON = new TemplateConfiguration();
        tcJSON.setOutputFormat(JSONOutputFormat.INSTANCE);

        freeMarkerConfig.setTemplateConfigurations(new FirstMatchTemplateConfigurationFactory(
                new ConditionalTemplateConfigurationFactory(
                        new FileExtensionMatcher("xml.ftl"),
                        tcXML
                ),
                new ConditionalTemplateConfigurationFactory(
                        new FileExtensionMatcher("json.ftl"),
                        tcJSON
                )
        ));
    }

    private final Template temp;

    public ReturnTemplate(String templatePath) throws TemplateNotFoundException, MalformedTemplateNameException, ParseException, IOException {
        temp = freeMarkerConfig.getTemplate(templatePath);
    }

    public String getContentType() {
        return temp.getOutputFormat().getMimeType();
    }

    private static Map<String, Object> wrapDBEntity(DBEntity entity) {
        Map<String, Object> e = new HashMap<>();

        if (entity.isResource()) {
            e.put("find", (TemplateMethodModelEx)
                    args -> entity.asResource().find(toStrings(args)).stream()
                            .map(ReturnTemplate::wrapDBEntity)
                            .toArray()
            );
            e.put("findValue", (TemplateMethodModelEx)
                    args -> entity.asResource().find(toStrings(args)).stream()
                            .findFirst()
                            .map(DBEntity::getValue).orElse(null)
            );
            e.put("findValues", (TemplateMethodModelEx)
                    args -> entity.asResource().find(toStrings(args)).stream()
                            .map(DBEntity::getValue)
                            .collect(Collectors.toList())
            );
            e.put("getConnections", (TemplateMethodModelEx)
                    args -> {
                        if (args.size() != 1)
                            throw new TemplateModelException("getConnections requires exactly one argument of type String");
                        return entity.asResource().getConnections(toStrings(args).get(0)).stream()
                                .map(ReturnTemplate::wrapDBEntity)
                                .collect(Collectors.toList());
                    }
            );
            e.put("findList",(TemplateMethodModelEx)
                args -> {
                    var potListResult = entity.asResource().find(toStrings(args));
                    if (potListResult.size() > 1) {
                        throw new TemplateModelException("start point for List should be a single entity, but there were found many");
                    }
                    if(potListResult.size() < 1){
                        return potListResult.stream().map(ReturnTemplate::wrapDBEntity).collect(Collectors.toList());
                    }
                    DBEntity potList = potListResult.iterator().next();
                    if(!potList.isAnonymousResource()){
                        throw new TemplateModelException("found Entity is no AnonymousResource and therefore no List");
                    }
                    return potList.asAnonymousResource().getList().stream().map(ReturnTemplate::wrapDBEntity).collect(Collectors.toList());
                }


            );
            if(entity.isAnonymousResource()){
                e.put("getList",entity.asAnonymousResource().getList().stream().map(ReturnTemplate::wrapDBEntity).collect(Collectors.toList()));
            }
        }
        e.put("value", entity.getValue());
        e.put("isResource", entity.isResource());
        e.put("isAnonymousResource", entity.isAnonymousResource());

        return e;
    }

    private static List<TemplateModel> cast(List list) {
        return list;
    }

    private static List<String> toStrings(List list) {
        return cast(list).stream().map(Object::toString).collect(Collectors.toList());
    }

    public String format(List<DBEntity> entities) throws IOException, TemplateException {
        Map<String, Object> root = new HashMap<>();
        root.put("toJSONString", (TemplateMethodModelEx) args -> jsonString(args.get(0)));
        root.put("toJSONNumber", (TemplateMethodModelEx) args -> jsonNumber(args.get(0)));
        root.put("toJSONBool", (TemplateMethodModelEx) args -> jsonBool(args.get(0)));
        root.put("ifNotNull", (TemplateMethodModelEx) args -> args.get(0).equals("null") ? "" : args.get(0));
        if (entities.size() > 0)
            root.put("subject", wrapDBEntity(entities.get(0)));
        root.put("subjects", entities.stream().map(ReturnTemplate::wrapDBEntity).toArray());

        var out = new StringWriter();
        temp.process(root, out);
        return out.toString();
    }

    private static String jsonString(Object value) {
        if (value == null)
            return "null";

        var str = new JsonString(value.toString());
        return str.toString();
    }

    private static String jsonNumber(Object value) {
        if (value == null)
            return "null";

        var i = JsonNumber.valueDecimal(value.toString());
        return i.toString();
    }

    private static String jsonBool(Object value) {
        if (value == null)
            return "null";

        if (value.toString().equals("true")) {
            return "true";
        } else if (value.toString().equals("false")) {
            return "false";
        }
        return "null";
    }
}