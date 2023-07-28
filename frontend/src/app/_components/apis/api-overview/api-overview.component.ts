import {Component, OnInit} from '@angular/core';
import {IApi, IApisOverview, IWebserviceInformationShort, IWebservicesOverview} from '../../../_interfaces';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {WebserviceInformationComponent} from '../../webservices/webservice-information/webservice-information.component';
import {ApiInformationComponent} from '../api-information/api-information.component';
import {WebserviceCreateFormComponent} from '../../webservices/webservice-create-form/webservice-create-form.component';
import {ApiCreateFormComponent} from '../api-create-form/api-create-form.component';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-api-overview',
    templateUrl: './api-overview.component.html',
    styleUrls: ['./api-overview.component.scss']
})
export class ApiOverviewComponent implements OnInit {

    displayedColumns: string[] = ['index', 'label', 'name', 'format', 'actions'];
    apis: Array<IApi>;

    constructor(private connection: BackendConnectionService, private _dialog: MatDialog, private _snackbar: MatSnackBar) {

    }

    ngOnInit(): void {
        this.loadApis();
    }

    loadApis() {
        this.connection.getApis().then((res: IApisOverview) => {
            this.apis = res.apis;
        });
    }

    openApiInformation(api: IApi): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = api;
        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';

        const dialogRef = this._dialog.open(ApiInformationComponent, dialogConfig).afterClosed().toPromise().then(() => this.loadApis());
    }

    copy(api: IApi): void {
        api.label = api.label + '_copy';
        this.connection.addNewApi(api).toPromise().then(
            () => {
                this.openSnackBar('Settings copied');
                this.loadApis();
            },
            (error) => {
                this.openSnackBar('Unable to copy settings');
            }
        )
    }

    delete(api: IApi): void {
        this.connection.deleteApi(api.label).toPromise().then(
            () => {
                this.openSnackBar('Settings deleted');
                this.loadApis();
            },
            (error) => {
                this.openSnackBar('Unable to delete settings');
            }
        )
    }

    openCreateApi(): void {
        const dialogConfig = new MatDialogConfig();
        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';
        const dialogRef = this._dialog.open(ApiCreateFormComponent, dialogConfig);
        dialogRef.afterClosed().toPromise().then(() => this.loadApis());

    }

    openSnackBar(message: string) {
        this._snackbar.open(message, '', {duration: 2000});
    }
}
