export const environment = {
    production: true,
    version: require('../../package.json').version,
    baseUrl: 'http://localhost:8080/etara',
    webserviceManagerEndpoint: '/webserviceManager',
    apiManagerEndpoint: '/apiManager',
    apiCallEndpoint: '/apiManager/call',
    apiToFlatJson: '/apiManager/flatJson',
    jsonDiffEndpoint: '/apiManager/jsonDiff',
    dbManagerEndpoint: '/dbManager',
    dbSchemaEndpoint: '/dbManager/schema',
    dbKnowledgeBaseEndpoint: '/dbManager/knowledge',
    gsbSuggestions: '/gsb/suggestions',
    gsbFinalAlignment: '/gsb/saveFinalAlignment',

    gsbEndpoint: '/gsb',
    webservicesEndpoint: '/webservices'
};
