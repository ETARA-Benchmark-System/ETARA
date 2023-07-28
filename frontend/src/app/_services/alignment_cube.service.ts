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
export class AlignmentCubeConnectionService {

    constructor(private httpClient: HttpClient) {
    }

    async getAlignmentsOverview() {
        return await this.httpClient.get(environment.baseUrl + environment.alignmentManager).toPromise();
    }
}
