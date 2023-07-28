import {Injectable} from '@angular/core';
import {BackendConnectionService} from './backend-connection.service';
import {GSBAlignment, GSBMapping} from '../_interfaces/gsb/alignment';
import {IApi, ILocalDatabase} from '../_interfaces';
import * as testWebEntity from '../../assets/data/testEntities/apiEntity.json';
import * as testLocalEntity from '../../assets/data/testEntities/localEntity.json';
import * as testLocalDB from '../../assets/data/testEntities/localDb.json';
import * as testWebDB from '../../assets/data/testEntities/webDb.json';
import * as testSuggestion from '../../assets/data/testEntities/exampleSuggestion.json';
import {Utils} from '../_classes/Utils';
import {IFinalAlignment, ISuggestionContainer} from '../_interfaces/gsb/suggestion';
import {error} from 'protractor';


@Injectable({
    providedIn: 'root'
})
export class GsbService {

    private _gsbInstance;
    private _finalAlignment: IFinalAlignment;
    private _suggestionContainer: ISuggestionContainer;

    private _entityAlignments: GSBAlignment[] = [];
    private _currentAlignment: GSBAlignment;
    private _currentIndex: number;

    private _localDatabase: ILocalDatabase;
    private _webDatabase: IApi;
    private _selectedLocalIdentifier: string;
    private _selectedInputType: string;

    private _regexApiStore = [];
    private _localKnownPathStore: Set<string>;
    private _webKnownPathStore: Set<string>;

    private _currentLocalEntity;
    private _currentWebEntity;

    private utils: Utils = new Utils();

    public showFullLocalPath = false;
    public loadingTries = 1;
    public maxLoadingTries = 50;

    public finishedLoadingLocalEntity = false;
    public finishedLoadingWebEntity = false;
    private finishedNewEntity = false;
    public suggestionsLoaded = false;
    public finishedFinalAlignment = false;

    public loadingNextEntityFailed = false;

    constructor(private connection: BackendConnectionService) {
    }

    public startNewAlignment(localDb: ILocalDatabase, webDb: IApi, identifier: string, inputType: string): void {
        this._entityAlignments = [];
        this._localDatabase = localDb;
        this._webDatabase = webDb;
        this._selectedLocalIdentifier = identifier;
        this._selectedInputType = inputType;
        this._localKnownPathStore = new Set();
        this._webKnownPathStore = new Set();
        this.nextEntity().then(r => this.saveLocalKnownPaths());
    }

    public removeMapping(mapping: GSBMapping): void {
        const i = this.currentMappings.indexOf(mapping);
        this.currentMappings.splice(i, 1);
    }

    public addMapping(mapping: GSBMapping): void {
        this.currentMappings.push(mapping);
    }

    public changeCurrentAlignment(i: number): void {
        if (i < 0 && i >= this.entityAlignments.length) {
            return;
        }
        this._currentAlignment = this.entityAlignments[i];
        this._currentLocalEntity = this._currentAlignment.localEntity;
        this._currentWebEntity = this._currentAlignment.webEntity;
        this._currentIndex = i;
    }

    public async nextEntity(): Promise<void> {
        this.saveLocalKnownPaths();
        this.finishedNewEntity = false;
        this.finishedLoadingLocalEntity = false;
        this.finishedLoadingWebEntity = false;
        this.loadingNextEntityFailed = false;
        // if (this._currentAlignment !== undefined) {
        //     this._entityAlignments.push(this._currentAlignment);
        // }
        this.loadingTries = 1;
        const list = [];
        while (this.loadingTries <= this.maxLoadingTries && !this.finishedLoadingWebEntity) {
            await this.loadLocalEntity();
            list.push(this._currentLocalEntity.valueList[0].subject);
            await this.loadWebEntity(this._currentLocalEntity.valueList[0].subject);
            this.loadingTries++;
            console
        }
        if (this.loadingTries > this.maxLoadingTries) {
            this.loadingNextEntityFailed = true;
            console.log([...new Set(list)]);
            return;
        }

        this._currentAlignment = {mappings: [], localEntity: this.currentLocalEntity, webEntity: this.currentWebEntity};
        this._entityAlignments.push(this._currentAlignment);
        this._currentIndex = this._entityAlignments.length - 1;
        this.finishedNewEntity = true;
    }

    private async loadLocalEntity(): Promise<void> {
        const identifier = this._selectedLocalIdentifier;
        const inputType = this._selectedInputType;
        this._currentLocalEntity = await this.connection.getLocalEntity(this.localDatabase.label, identifier, inputType, 1).toPromise();
        this.utils.addHashToLocalEntity(this._currentLocalEntity);
        this.finishedLoadingLocalEntity = true;
    }

    private async loadWebEntity(value: string): Promise<void> {
        await this.connection.getWebEntity(this.webDatabase.label, value, this._regexApiStore).toPromise().then(
            resp => {
                this._currentWebEntity = resp;
                this.utils.addHashToWebEntity(this._currentWebEntity);
                this.finishedLoadingWebEntity = true;
            },
            err => {
                console.log(err);
            }
        );

    }

    public debugMode() {
        this._currentWebEntity = (testWebEntity as any).default;
        this._currentLocalEntity = (testLocalEntity as any).default;
        this._localDatabase = (testLocalDB as any).default;
        this._webDatabase = (testWebDB as any).default;
        this.utils.addHashToWebEntity(this._currentWebEntity);

        this._currentAlignment = {mappings: [], localEntity: this.currentLocalEntity, webEntity: this.currentWebEntity};
        this.entityAlignments.push(this._currentAlignment);

        this._suggestionContainer = (testSuggestion as any).default;
        this.suggestionsLoaded = true;

        this.finishedLoadingLocalEntity = true;
        this.finishedLoadingWebEntity = true;
        this.finishedNewEntity = true;
    }

    async changeWebReducedResponse(value): Promise<void> {
        this._currentWebEntity.reducedResponse = value;
        this.connection.postToFlatJson(value).toPromise().then((resp) => {
            this._currentWebEntity.dictionary = resp.dictionary;
            this.utils.addHashToWebEntity(this._currentWebEntity);
        });

        const diff = this.connection.postJsonDiff(this._currentWebEntity.originalResponse, value).toPromise().then(
            (resp) => {
                this._regexApiStore = [...new Set(resp.regex)];
            }
        );
    }

    generateSuggestions(): void {
        this.suggestionsLoaded = false;
        const mappings = [];
        for (const alignment of this._entityAlignments) {
            for (const elem of alignment.mappings) {
                mappings.push(elem);
            }
        }
        this.connection.postSuggestions(mappings).toPromise().then(
            (resp) => {
                this._suggestionContainer = resp;
                this.suggestionsLoaded = true;
            }
        );
    }

    generateFinalAlignment(): void {
        this.finishedFinalAlignment = false;
        const mappings = [];
        for (const suggestion of this._suggestionContainer.suggestions) {
            const general = suggestion.general;
            if (general.selected) {
                mappings.push({localEntries: general.localEntries, webEntries: general.webEntries, type: general.type});
            }
            for (const mapping of suggestion.suggestions) {
                const template = mapping.template;
                if (template.selected) {
                    mappings.push({localEntries: template.localEntries, webEntries: template.webEntries, type: template.type});
                }
            }
        }
        this._finalAlignment = {mappings, localLabel: this._localDatabase.label, webLabel: this._webDatabase.label};
        this.finishedFinalAlignment = true;
    }

    saveFinalAlignment(): Promise<any> {
        return this.connection.postFinalAlignment(this.finalAlignment).toPromise();
    }

    private saveLocalKnownPaths(): void{
        if (this._currentLocalEntity === undefined || this._currentWebEntity === undefined ){
            return;
        }else {
            console.log(this._currentLocalEntity);
            console.log(this._currentWebEntity);
        }

        for ( const entry of this._currentLocalEntity.valueList[0].fullKnowledge){
            if (!this._localKnownPathStore.has(entry.path)){
                   this._localKnownPathStore.add(entry.path);
            }
        }

        for ( const entry of this._currentWebEntity.dictionary){
            if (!this._webKnownPathStore.has(entry.path)){
                this._webKnownPathStore.add(entry.path);
            }
        }
    }

    get currentAlignment(): GSBAlignment {
        return this._currentAlignment;
    }

    get currentMappings(): any[] {
        return this._currentAlignment.mappings;
    }

    get currentWebEntity() {
        return this._currentWebEntity;
    }

    get currentLocalEntity() {
        return this._currentLocalEntity;
    }

    get localDatabase(): ILocalDatabase {
        return this._localDatabase;
    }

    get webDatabase(): IApi {
        return this._webDatabase;
    }

    get finishedLoading(): boolean {
        return this.finishedLoadingLocalEntity && this.finishedLoadingWebEntity && this.finishedNewEntity;
    }

    get entityAlignments(): GSBAlignment[] {
        return this._entityAlignments;
    }

    get currentIndex(): number {
        return this._currentIndex;
    }

    get finalAlignment() {
        return this._finalAlignment;
    }

    get suggestionContainer(): ISuggestionContainer {
        return this._suggestionContainer;
    }

    get localKnownPathStore(): Set<string> {
        return this._localKnownPathStore;
    }

    get webKnownPathStore(): Set<string> {
        return this._webKnownPathStore;
    }
}
