import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {ILocalDatabaseShortInfo, ILocalDatabasesOverview, IWebserviceConfiguration, IWebserviceDetails} from '../../../_interfaces';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';

import * as ace from 'ace-builds';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-webservice-information',
    templateUrl: './webservice-information.component.html',
    styleUrls: ['./webservice-information.component.scss']
})
export class WebserviceInformationComponent implements OnInit {

    webserviceConfiguration: IWebserviceDetails;
    webserviceLabel: string;
    whereString: string;

    @ViewChild('editor') private editor: ElementRef<HTMLElement>;
    private aceEditor;

    @ViewChild(JsonEditorComponent)
    configEditor: JsonEditorComponent;
    public editorOptionsConfig: JsonEditorOptions;
    public editorOptionsReturnTemplate: JsonEditorOptions;

    viewAsString = false;

    databases: Array<ILocalDatabaseShortInfo>;

    constructor(
        private connection: BackendConnectionService,
        private _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: string) {

        this.connection.getDatabases().then((res: ILocalDatabasesOverview) => {
            this.databases = res.databases;
        });
    }

    ngOnInit(): void {
        this.webserviceLabel = this.data;

        this.editorOptionsConfig = new JsonEditorOptions();
        this.editorOptionsConfig.mode = 'code';
        this.editorOptionsConfig.modes = ['code'];
        this.editorOptionsReturnTemplate = new JsonEditorOptions();
        this.editorOptionsReturnTemplate.mode = 'text';
        this.editorOptionsReturnTemplate.modes = ['text'];

        this.connection.getWebserviceConfiguration(this.data).then((res: IWebserviceDetails) => {
            this.webserviceConfiguration = res;

            this.whereString = "";
            res.configuration.where.forEach( (triple) => {
                triple.forEach((element) => {
                    this.whereString += element + " ";
                })
                this.whereString += "\n";
            });

            ace.config.set('fontSize', '14px');
            ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.13/src-noconflict');

            this.aceEditor = ace.edit(this.editor.nativeElement);
            // aceEditor.setTheme('ace/theme/twilight');
            this.aceEditor.session.setMode('ace/mode/ftl');
            this.aceEditor.session.setValue(this.webserviceConfiguration.returnTemplate);
        });
    }

    onValueChange(): void {
        // this.configEditor.data = this.webserviceConfiguration.configuration;
        // this.webserviceConfiguration.configuration = this.configEditor.get() as any;
    }

    onJSONChange(): void {
        // this.webserviceConfiguration.configuration = this.configEditor.get() as any;
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {duration: 2000});
    }

    save(): void {
        // Convert input string to array
        const inputArray = [];
        if(!Array.isArray(this.webserviceConfiguration.configuration.inputs)){
            inputArray.push(this.webserviceConfiguration.configuration.inputs);
            this.webserviceConfiguration.configuration.inputs = inputArray;
        }

        // Convert where string to array
        const whereArray = []
        this.whereString.split("\n").forEach(item =>{
            let entry = item.trim().split(" ");
            if(entry.length == 3) whereArray.push(entry);
        })
        this.webserviceConfiguration.configuration.where = whereArray;

        const returnTemplate = this.aceEditor.session.getValue();
        this.connection.updateWebservice(this.webserviceLabel, this.webserviceConfiguration.configuration, returnTemplate).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to save changes');
            }
        );
    }

    delete(): void {
        this.connection.deleteWebservice(this.webserviceLabel).toPromise().then(
            () => {
                this.openSnackBar('Deleted settings');
            },
            (error) => {
                this.openSnackBar('Unable to delete settings');
            }
        );
    }

}
