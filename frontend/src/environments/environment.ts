// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: require('../../package.json').version,
  baseUrl: 'http://localhost:8080/etara',
  webserviceManagerEndpoint: '/webserviceManager?option=overview',
  webservicRestartEndoint: '/webserviceManager?option=restart',
  apiManagerEndpoint: '/apiManager',
  apiCallEndpoint: '/apiManager/call',
  apiToFlatJson: '/apiManager/flatJson',
  jsonDiffEndpoint: '/apiManager/jsonDiff',
  dbManagerEndpoint: '/dbManager',
  dbSchemaEndpoint: '/dbManager/schema',
  dbKnowledgeBaseEndpoint: '/dbManager/knowledge',
  alignmentManager: '/alignmentManagement',
  gsbSuggestions: '/gsb/suggestions',
  gsbFinalAlignment: '/gsb/saveFinalAlignment',

  gsbEndpoint: '/gsb',
  webservicesEndpoint: '/webservices'
};
