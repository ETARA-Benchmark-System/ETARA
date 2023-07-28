import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {ILocalDatabaseShortInfo, ILocalDatabasesOverview, IWebserviceDetails} from '../../../_interfaces';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';
import * as ace from 'ace-builds';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as webserviceTemplateFile from '../../../../assets/templates/webservice_template.json';

@Component({
    selector: 'app-webservice-create-form',
    templateUrl: './webservice-create-form.component.html',
    styleUrls: ['./webservice-create-form.component.scss']
})
export class WebserviceCreateFormComponent implements OnInit, AfterViewInit {

    webserviceConfiguration: IWebserviceDetails;
    webserviceTemplate: any;
    webserviceLabel: string;
    whereString: string;

    @ViewChild('editor') private editor: ElementRef<HTMLElement>;
    private aceEditor;

    @ViewChild(JsonEditorComponent)
    configEditor: JsonEditorComponent;

    public editorOptionsConfig: JsonEditorOptions;
    public editorOptionsReturnTemplate: JsonEditorOptions;
    public returnTemplate = '';

    databases: Array<ILocalDatabaseShortInfo>;

    constructor(private connection: BackendConnectionService, private _snackBar: MatSnackBar) {
        this.connection.getDatabases().then((res: ILocalDatabasesOverview) => {
            this.databases = res.databases;
        });
    }

    ngOnInit(): void {
        // Init jsonEditor for configuration file
        this.editorOptionsConfig = new JsonEditorOptions();
        this.editorOptionsConfig.mode = 'code';
        this.editorOptionsConfig.modes = ['code'];
        this.editorOptionsReturnTemplate = new JsonEditorOptions();
        this.editorOptionsReturnTemplate.mode = 'text';
        this.editorOptionsReturnTemplate.modes = ['text'];

        this.webserviceTemplate = (webserviceTemplateFile as any).default;
        this.webserviceLabel = "";
        this.whereString = "";

        this.webserviceConfiguration = {
            name: this.webserviceLabel,
            configuration: this.webserviceTemplate,
            returnTemplate: "{}"
        }
    }

    ngAfterViewInit(): void {
        // Init ace editor for return template
        ace.config.set('fontSize', '14px');
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.13/src-noconflict');

        this.aceEditor = ace.edit(this.editor.nativeElement);
        this.aceEditor.session.setMode('ace/mode/ftl');
        this.aceEditor.session.setValue('{}');
        this.aceEditor.on('change', () => {
            this.onReturnTemplateChange();
        });
    }

    onReturnTemplateChange(): void {
        this.returnTemplate = this.aceEditor.session.getValue();
    }

    onWebserviceNameChange(): void {
        this.webserviceTemplate.webservice = '/' + this.webserviceLabel + '/{pathname}';
        this.webserviceTemplate.returnTemplate = '/' + this.webserviceLabel + '/' + this.webserviceLabel + '.json.ftl';
    }

    onJSONChange(): void {
        // this.webserviceTemplate = this.configEditor.get() as any;
    }

    onValueChange(): void {
        // this.configEditor.data = this.webserviceConfiguration.configuration;
        // this.webserviceConfiguration.configuration = this.configEditor.get() as any;
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

        // Save return template
        this.webserviceConfiguration.returnTemplate = this.returnTemplate;

        this.connection.addNewWebservice(this.webserviceLabel, this.webserviceConfiguration.configuration, this.webserviceConfiguration.returnTemplate).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to add new service');
            }
        );
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {duration: 2000});
    }
}
