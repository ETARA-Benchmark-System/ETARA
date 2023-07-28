import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {
    IApi,
    ILocalDatabase,
    ILocalDatabaseSchema,
    IWebserviceDetails
} from '../_interfaces';
import {GSBMapping} from '../_interfaces/gsb/alignment';
import {IFinalAlignment} from '../_interfaces/gsb/suggestion';

@Injectable({
    providedIn: 'root'
})
export class BackendConnectionService {

    constructor(private httpClient: HttpClient) {
    }

    async getApis() {
        return await this.httpClient.get(environment.baseUrl + environment.apiManagerEndpoint).toPromise();
    }

    async getWebserviceConfiguration(name: string) {
        const body = {
            mode: 'webserviceInformation',
            name
        };
        return this.httpClient.post<IWebserviceDetails>(environment.baseUrl + environment.webserviceManagerEndpoint, body).toPromise();
    }

    async getLocalDatabaseData(dbName: string) {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('label', dbName);
        return await this.httpClient.get<ILocalDatabase>(
            environment.baseUrl + environment.dbManagerEndpoint,
            {params: queryParams}
        ).toPromise();
    }

    async getWebDatabaseData(apiName: string): Promise<IApi> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('label', apiName);
        return await this.httpClient.get<IApi>(
            environment.baseUrl + environment.apiManagerEndpoint,
            {params: queryParams}
        ).toPromise();
    }

    getWebEntity(apiName: string, value: string, regex: any[]) {

        const body = {
            label: apiName,
            value,
            regex
        };

        return this.httpClient.post<any>(
            environment.baseUrl + environment.apiCallEndpoint,
            body
        );
    }

    // Databases
    async getDatabases() {
        return await this.httpClient.get(environment.baseUrl + environment.dbManagerEndpoint).toPromise();
    }

    async getAlignments() {
        return await this.httpClient.get(environment.baseUrl + environment.alignmentManager).toPromise();
    }

    getLocalDatabaseSchema(dbName: string): Observable<ILocalDatabaseSchema> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('label', dbName);
        return this.httpClient.get<ILocalDatabaseSchema>(
            environment.baseUrl + environment.dbSchemaEndpoint,
            {params: queryParams}
        );
    }

    getLocalEntity(dbName: string, predicate: string, inputType: string, limit: number) {
        const body = {
            label: dbName,
            predicate,
            inputType,
            // inputType: 'https://dblp.org/rdf/schema-2020-07-01#Publication',
            // inputType: 'http://example/com/crossref/Publication',
            limit
        };

        return this.httpClient.post(
            environment.baseUrl + environment.dbKnowledgeBaseEndpoint,
            body
        );
    }

    updateDatabase(oldDb, newDb) {
        const body = {
            mode: 'update',
            db: oldDb,
            newDb
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.dbManagerEndpoint,
            body
        );
    }

    deleteDatabase(label: string) {
        const body = {
            mode: 'delete',
            label
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.dbManagerEndpoint,
            body
        );
    }

    addNewDatabase(config){
        const body = {
            mode: 'new',
            db: config
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.dbManagerEndpoint,
            body
        );
    }

    getWebservices() {
        return this.httpClient.get(environment.baseUrl + environment.webserviceManagerEndpoint);
    }

    restartWebServices(){
        return this.httpClient.get(environment.baseUrl + environment.webservicRestartEndoint);
    }

    addNewWebservice(label: string, configuration, returnTemplate: string) {
        const body = {
            name: label,
            mode: 'new',
            configuration,
            returnTemplate
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.webserviceManagerEndpoint,
            body
        );
    }

    updateWebservice(label: string, configuration, returnTemplate: string) {
        const lastIndex = configuration.returnTemplate.lastIndexOf('\\');
        const returnTemplateName = configuration.returnTemplate.substring(lastIndex + 1);

        const body = {
            name: label,
            mode: 'update',
            configuration,
            returnTemplate,
            returnTemplateName
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.webserviceManagerEndpoint,
            body
        );
    }

    deleteWebservice(webserviceName) {
        const body = {
            mode: 'delete',
            name: webserviceName
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.webserviceManagerEndpoint,
            body
        );
    }

    // APIs
    updateApi(oldLabel, newApi) {
        const body = {
            mode: 'update',
            label: oldLabel,
            newApi
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.apiManagerEndpoint,
            body
        );
    }

    deleteApi(label: string) {
        const body = {
            mode: 'delete',
            label
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.apiManagerEndpoint,
            body
        );
    }

    addNewApi(config){
        const body = {
            mode: 'new',
            api: config
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.apiManagerEndpoint,
            body
        );
    }

    // GSB
    postToFlatJson(json: any) {
        return this.httpClient.post<any>(
            environment.baseUrl + environment.apiToFlatJson,
            json
        );
    }

    postJsonDiff(original: any, modified: any) {
        const body = {
            original,
            modified
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.jsonDiffEndpoint,
            body
        );
    }

    postSuggestions(mappings: GSBMapping[]) {
        const body = {
            mappings
        };
        return this.httpClient.post<any>(
            environment.baseUrl + environment.gsbSuggestions,
            body
        );
    }

    postFinalAlignment(finalAlignment: IFinalAlignment) {
        return this.httpClient.post<any>(
            environment.baseUrl + environment.gsbFinalAlignment,
            {webLabel: finalAlignment.webLabel, localLabel: finalAlignment.localLabel, alignment: finalAlignment}
        );
    }
}
