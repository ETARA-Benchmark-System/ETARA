# ETARA - Evaluation Toolkit for API and RDF Alignment

## What is ETARA?
ETARA (Evaluation Toolkit for API and RDF Alignment) is a toolkit to support the development and configuration of appropriate alignment tools. Furthermore, the toolkit offers a detailed benchmark to evaluate existing alignment systems and to determine their strengths and weaknesses more precisely. Existing benchmark systems, e.g. MELT, SEALS and HOBBIT, focus only on data sets of the same format. In contrast, ETARA enables the simulation and creation of RESTful Web APIs with the common response formats (e.g., XML and JSON). It provides a variety of existing Web APIs and their response formats such as CrossRef, SciGraph, ArXiv and Semantic Scholar.

## Where to find data sets?
[Download](https://tinyurl.com/iswcdata "Link to datasets")

## Quick Start
In order to run ETARA several configurations must be done first. The cloned project has to be opened (currently) in an IDE of your choice. This step will be replaced soon by simply providing an executable jar file. Afterwards, two steps need to be performed: (1) Providing all necessary global configurations and (2) providing all configurations needed to simulate the chosen Web APIs, i.e., response templates, data sources and more.

### Global Configurations
ETARA's global configuration is located in the file `clobal-config.json` and includes specifications about the port to be used, a path to the response templates, the configuration files of each Web API to be simulated, and more. The path to the response templates and the configuration files of each simulated API is specified under `config-folder` and points by default to [config/webservices](https://github.com/anonresearcher123/ETARA/tree/master/configs/webservices "Link to the API Configuration Folder"). The folder contains for each API to be simulated a subfolder with the name of the API and contains on the one hand all important configurations of the API (e.g. rate limit, latency, etc.) and a response template. Since the APIs simulated in this case are to return a response to requests, they must be connected to data sources. These data sources are specified in the global configuration under `dbPath` and stores for each database used a label and the location of the database index. Thus, ETARA can query these indices during runtime and return the requested data in form of the response templates.

```
{
  "port": 8080,
  "config-folder": "configs/webservices",
  "dbPath": "configs/databases.json",
  "loglevel": "0"
}
```

### Configuring Data Bases
The previously described configuration file for the databases used by ETARA looks like the following example.

```
{
  "databases": {
    "example_db": {
      "path": "C:\\Databases\\example\\tdb",
      "source": "C:\\Databases\\example\\example.nt",
      "identifierMap": "configs\\identifierMaps\\example.json"
    }
  }
}
```

The JSON object `databases` consists of entries, also JSON objects, which store all the information that needs to be specified for a database. In this example, only one database is stored with the label `example_db`. Here `path` describes the path to the database index, in this case a TDB index. The entry `source` points to the raw text file of the database, typically a .nt or .ttl file. The access to the raw data is needed because ETARA initially generates a so-called identifier map. This is a mapping between the URI formatted relations (predicates) of an RDF file and a short keyword. Typically, the suffix specifies the keyword, but this can be renamed by the user. The identifier map is only created when ETARA is run for the first time, if it does not already exist.  An example for an identifier map looks as following:

```
{ 
  "type" : "<http://example/com/crossref/type>" ,
  "doi" : "<http://example/com/crossref/doi>" ,
  "url" : "<http://example/com/crossref/url>" ,
  "publisher" : "<http://example/com/crossref/publisher>" ,
  "page" : "<http://example/com/crossref/page>" ,
  "volume" : "<http://example/com/crossref/volume>" ,
  "issue" : "<http://example/com/crossref/issue>" ,
  "score" : "<http://example/com/crossref/score>" ,
  "referenceCount" : "<http://example/com/crossref/referenceCount>" ,
  "citationCount" : "<http://example/com/crossref/citationCount>" ,
  "author" : "<http://example/com/crossref/author>" ,
  "title" : "<http://example/com/crossref/title>"
}
```

The purpose of such an identifier map is to be able to use short keywords when configuring a response template, instead of using sperring and possibly incomprehensible URLs. A more detailed explanation of its use can be found in the next section of this documentation.

### Configuring Web APIs
The first step in creating an API is to configure the general environment. The following example shows many possible settings for an API, among others the latency (see `latency`) and the rate limit (see `maxRequestsPerMinute` and `maxRequests`) can be configured for each API individually. However, there are also other options, which are not so easy to understand. 

* `webservice`: The simulated APIs are all hosted at the same base URL, but for each simulated API there is a path that leads only to that API. For example, the base URL can be set as `http://localhost:8080`. Now to send a request to the API shown in the example you must use the full path, i.e. `http://localhost:8080/webservices/example/publication`. With this setting the path to the API can also be underlaid with a semantic, for example `/author/works` indicates that all works written by an author are output.
* `inputs`: This option is used to specify the query parameter of the API, since the URL alone does not enable a data query. In the example, the parameter `doi` is named, which results in a URL of the following form: `http://localhost:8080/webservices/example/publication?doi=...`
* `where`: This parameter can be used to specify the WHERE pattern of a SPARQL query to find the resource requested by GET request in the database. It is important that the parameter in `inputs` and the object value in `where` match, because the object value will be overwritten by the user input when the SPARQL query is sent to the database.
* `returnTemplate`: This parameter can be used to refer to the response template that is to be used. Usually this is located in the same folder as the environment config discussed here, but this does not have to be the case. Furthermore, different templates can be stored which are used for different scenarios. The response template is an Apache FreeMarker file and will be explained in the next section.
* `db`: This specifies which of the registered databases is to be used as the information source. The label of a database is always used to reference it.

```
{
  "webservice" : "/example/publication",
  "errorType": "jsonWithStatus",
  "type": "precise",
  "latency": "1000",
  "maxRequestsPerMinute": "60",
  "maxRequests": "2000",
  "inputs" : [ "doi" ],
  "where" : [
    ["?subject", "doi", "$doi"]
  ],
  "returnTemplate": "example/example.json.ftl",
  "db": "example_db"
}         
```

Apache FreeMarker is a text engine and Java library to generate text output (e.g. JSON or XML files) based on templates and dynamic data. This means that based on a template (see example below) and a data source (e.g. the result of the SPARQL query configured in the `where` section) an output in the required format and type is generated. Apache FreeMarker provides some features that can be helpful when creating Repsonse templates, e.g., conditional blocks, iterations, assignments, string and arithmetic operations and formatting, macros and functions, including other templates, escaping by default (optional), and many more (see [Manual](https://freemarker.apache.org/docs/index.html)).

```
{
    "feed": {
        "entry": {
            "title": <#if subject.findValue("title")??>"${subject.findValue("title")?json_string}",<#else>"",</#if>
            "author": [<#list subject.find("author") as author>
                {
                  "name": "${author.findValue("name")?json_string}"
                }<#sep>,</#sep>
            </#list>]
        }
    }
}            
```

The shown example of a response template should output the title and author names of a requested DOI in JSON format. It is important to note that the `where` parameter in the environment configuration does not need to query all the information such as title and author names, but only queries the entity with the corresponding DOI. If an entity with this DOI exists in the database, the next step is to collect all the information about this entity, which can then be inserted into the response template if needed. The line that will later contain the title information of a publication consists of an if statement. It is first checked if a title for the requested DOI exists, if this is the case the title is inserted into the template, otherwise an empty string is inserted. 

The next section generates a list of author names using the iteration feature of FreeMarker. It is iterated over all entities that are bound to the requested entity using the author relation. Then the name relation is queried for each author entity and the corresponding value is inserted into the template as a JSON string. Therefore, a response looks like the following example:

```
{
    "feed": {
        "entry": {
            "title": "This is an example title"
            "author": [
                {
                  "name": "Example Name"
                },
                {
                  "name": "Another Name"
                }
            ]
        }
    }
}            
```

### Running and Using ETARA
After all configurations have been made, ETARA can be executed using an IDE (for example IntelliJ or Eclipse). All APIs specified by default under `configs/webservices` are then started and simulated. An example of such a simulation can be seen in the following screenshot.

![Screenshot 2023-05-15 170136](https://github.com/anonresearcher123/ETARA/assets/120786910/f7b29cd7-71c8-48cd-a4a0-d17e7019028f)

The simulated APIs are located under the base domain `http://localhost:8080` and can be requested via the respective paths, for example `http://localhost:8080/webservices/a0/work`. Executing a GET request (for example `http://localhost:8080/webservices/a0/work?orcid=0000-0003-2514-9306`) causes the simulated API a0 to issue a query to the database used, parse the query result and respond according to the template specifications. An example of such a response looks like the following:

![Screenshot 2023-05-15 171242](https://github.com/anonresearcher123/ETARA/assets/120786910/636b055c-03f7-410e-9d06-5461c6a0f13d)

