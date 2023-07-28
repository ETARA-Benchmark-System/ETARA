import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ILocalDatabase} from '../../../_interfaces';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-db-information',
    templateUrl: './db-information.component.html',
    styleUrls: ['./db-information.component.scss']
})
export class DbInformationComponent implements OnInit {

    dbConfiguration: ILocalDatabase;

    public editorOptionsConfig: JsonEditorOptions;

    constructor(
        private connection: BackendConnectionService,
        private _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: string)
    {

    }

    ngOnInit(): void {
        this.editorOptionsConfig = new JsonEditorOptions();
        this.editorOptionsConfig.mode = 'code';
        this.editorOptionsConfig.modes = ['code'];

        this.connection.getLocalDatabaseData(this.data).then((res: ILocalDatabase) => {
            this.dbConfiguration = res;
        });
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {duration: 2000});
    }

    save(): void {
        const dbConfigurationChanged = this.dbConfiguration;
        this.connection.updateDatabase(this.dbConfiguration, dbConfigurationChanged).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to save changes');
            }
        );
    }

    delete(): void {
        this.connection.deleteDatabase(this.dbConfiguration.label).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to delete');
            }
        );
    }
}
