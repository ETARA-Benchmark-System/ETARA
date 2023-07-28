import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {IApi, IWebserviceDetails} from '../../../_interfaces';
import {MatSnackBar} from '@angular/material/snack-bar';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';

@Component({
    selector: 'app-api-information',
    templateUrl: './api-information.component.html',
    styleUrls: ['./api-information.component.scss']
})
export class ApiInformationComponent implements OnInit {

    apiLabel: string;
    apiConfiguration: IApi;

    constructor(
        private connection: BackendConnectionService,
        private _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: IApi) {
        this.apiConfiguration = data;
        this.apiLabel = data.label;
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {duration: 2000});
    }

    ngOnInit(): void {

    }

    save(): void {
         this.connection.updateApi(this.apiLabel, this.apiConfiguration).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to save changes');
            }
        );
    }

    delete(): void {
        this.connection.deleteApi(this.apiConfiguration.label).toPromise().then(
            () => {
                this.openSnackBar('Saved');
            },
            (error) => {
                this.openSnackBar('Unable to delete');
            }
        );
    }

}
