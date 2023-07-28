import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {BackendConnectionService} from '../../_services/backend-connection.service';
import {
    IApi,
    IApisOverview,
    ILocalDatabase,
    ILocalDatabaseSchema,
    ILocalDatabaseShortInfo,
    ILocalDatabasesOverview,
    IRelation
} from '../../_interfaces';
import {MatDialog} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IErrorMessage} from '../../_interfaces/settings/IErrorMessage';
import {Utils} from '../../_classes/Utils';
import {GsbService} from '../../_services/gsb.service';
import {MatStepper} from '@angular/material/stepper';
import {BuilderComponent} from './builder/builder.component';

@Component({
    selector: 'app-gold-standard-builder',
    templateUrl: './gold-standard-builder.component.html',
    styleUrls: ['./gold-standard-builder.component.scss']
})
export class GoldStandardBuilderComponent implements OnInit {
    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('builder') builder: BuilderComponent;

    utils: Utils = new Utils();
    selectedIndex: number;

    webDbSelected = false;
    localDbSelected = false;
    localSchemaLoaded = false;
    localSchemaError = false;
    useIdentifierMap = true;
    showFullPathLocal = true;
    showFullPathWeb = false;

    currentLocalDatabase: ILocalDatabase;
    currentWebDatabase: IApi;

    currentLocalDatabaseSchema: ILocalDatabaseSchema;
    errorMsg: IErrorMessage;

    localEntityFiltered: any;
    localSortMethod = '';
    localEntity: any;
    localEntityLoaded = false;
    localPathSearchValue = '';
    localValueSearchValue = '';

    weblEntityFiltered: any;
    webSortMethod = '';
    webEntity: any;
    weblEntityLoaded = false;
    webPathSearchValue = '';
    webValueSearchValue = '';

    databases: Array<ILocalDatabaseShortInfo>;
    apis: Array<IApi>;

    identifiers: string[];
    predicates: string[];


    localHashIds: Set<string> = new Set<string>();
    localMappingEntries: Set<any> = new Set<any>();
    webHashIds: Set<string> = new Set<string>();
    webMappingEntries: Set<any> = new Set<any>();
    startId: string;
    endId: string;

    public dbSelectionForm: FormGroup;

    webEntityModFinished = false;

    constructor(private connection: BackendConnectionService,
                private dialog: MatDialog,
                private _fb: FormBuilder,
                public cdr: ChangeDetectorRef,
                private _dialog: MatDialog,
                public gsbService: GsbService) {

        this.dbSelectionForm = _fb.group({
            localDatabase: ['', Validators.required],
            webDatabase: ['', Validators.required],
            identifier: [{value: '', disabled: !this.localSchemaLoaded}, Validators.required],
            inputType: [{value: '', disabled: !this.localSchemaLoaded}, Validators.required],
        });
    }

    ngOnInit(): void {
        this.connection.getDatabases().then((res: ILocalDatabasesOverview) => {
            this.databases = res.databases;
        });
        this.connection.getApis().then((res: IApisOverview) => {
            this.apis = res.apis;
        });
    }

    changeLocalDatabase(dbName: string): void {
        this.localDbSelected = false;
        this.localSchemaLoaded = false;
        this.localSchemaError = false;
        this.dbSelectionForm.get('identifier').setValue('');
        this.dbSelectionForm.get('identifier').disable();
        this.dbSelectionForm.get('inputType').setValue('');
        this.dbSelectionForm.get('inputType').disable();


        this.loadLocalDatabasesData(dbName);
        this.loadLocalDatabasesSchema(dbName);
    }

    changeInputType(inputType: string): void {
        this.identifiers = this.getIdentifier(inputType);
        this.predicates = this.getPredicates(inputType);
        this.dbSelectionForm.get('identifier').enable();
    }

    loadLocalDatabasesData(dbName: string): void {
        this.connection.getLocalDatabaseData(dbName).then((res: ILocalDatabase) => {
            this.currentLocalDatabase = res;
            this.localDbSelected = true;

            if (this.currentLocalDatabase.identifierMapContent !== '') {
                this.useIdentifierMap = false;
            }
        });
    }

    loadLocalDatabasesSchema(dbName: string): void {
        this.connection.getLocalDatabaseSchema(dbName).subscribe(
            (schema: ILocalDatabaseSchema) => {
                this.currentLocalDatabaseSchema = schema;
                this.localSchemaLoaded = true;
                this.dbSelectionForm.get('inputType').enable();
            },
            (error) => {
                this.errorMsg = (error.error as IErrorMessage);
                this.localSchemaError = true;
            }
        );
    }

    loadWebDatabasesData(dbName: string): void {
        this.connection.getWebDatabaseData(dbName).then((res: IApi) => {
            this.currentWebDatabase = res;
            this.webDbSelected = true;
        });
    }

    debugMode() {
        this.selectedIndex = 1;
        this.gsbService.debugMode();
    }

    mappingSelectionFinished(): void {
        this.gsbService.generateFinalAlignment();
        this.stepper.next();
    }

    changeApiResponse(e): void {
        this.gsbService.changeWebReducedResponse(e);
    }

    respChangeFinished(): void {
        this.webEntityModFinished = true;
        this.builder.init();
        this.cdr.detectChanges();
        this.builder.showLines();
        this.builder.markNewPaths();
    }

    selectionChange(index): void {
        if (!this.gsbService.finishedLoading) {
            return;
        }
        if (index === 1) {
            Utils.delay(500).then(() => {
                this.builder.showLines();
            });
        } else {
            this.builder.hideLines();
        }
    }

    startGSB() {
        this.stepper.steps.get(0).completed = true;
        this.stepper.steps.get(0).editable = false;
        const identifier = this.dbSelectionForm.get('identifier').value;
        const inputType = this.dbSelectionForm.get('inputType').value;
        this.gsbService.startNewAlignment(this.currentLocalDatabase, this.currentWebDatabase, identifier, inputType);
    }

    nextEntity(): void {
        this.builder.clearLines();
        this.webEntityModFinished = false;
        this.gsbService.nextEntity();
    }

    getIdentifier(inputType: string): string[] {
        const identifier = [];
        for (const value of this.currentLocalDatabaseSchema.identifier) {
            const predicate = value.predicate;
            const contains = this.currentLocalDatabaseSchema.structure.some(
                (entry: IRelation) => (entry.subject === inputType && entry.predicate === predicate)
            );
            if (contains) {
                identifier.push(predicate);
            }
        }

        return identifier;
    }

    getPredicates(inputType: string): string[] {
        const predicates = [];
        for (const value of this.currentLocalDatabaseSchema.functionality) {
            const predicate = value.predicate;
            const contains = this.currentLocalDatabaseSchema.structure.some(
                (entry: IRelation) => (entry.subject === inputType && entry.predicate === predicate)
            );
            if (contains) {
                predicates.push(predicate);
            }
        }

        return predicates;
    }


}
