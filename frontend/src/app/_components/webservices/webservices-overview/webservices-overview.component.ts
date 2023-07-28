import {Component, OnInit} from '@angular/core';
import {IWebservicesOverview, IWebserviceInformationShort, IWebserviceDetails} from '../../../_interfaces';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {WebserviceInformationComponent} from '../webservice-information/webservice-information.component';
import {FormGroup, Validators} from '@angular/forms';
import {WebserviceCreateFormComponent} from '../webservice-create-form/webservice-create-form.component';
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-webservices-overview',
    templateUrl: './webservices-overview.component.html',
    styleUrls: ['./webservices-overview.component.scss']
})
export class WebservicesOverviewComponent implements OnInit {
    // displayedColumns: string[] = ['index', 'endpoint', 'path', 'status', 'actions'];
    displayedColumns: string[] = ['index', 'name', 'path', 'status', 'actions'];
    webservices: Array<IWebserviceInformationShort>;

    constructor(private _connection: BackendConnectionService,
                private _dialog: MatDialog,
                private _snackBar: MatSnackBar,
                private router: Router)
    {

    }

    ngOnInit(): void {
        this.reloadData();
    }

    openWebserviceInformation(name: string): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = name;
        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';

        const dialogRef = this._dialog.open(WebserviceInformationComponent, dialogConfig);
        dialogRef.afterClosed().toPromise().then(() => this.reloadData());
    }

    copy(name: string): void {
        this._connection.getWebserviceConfiguration(name).then((res: IWebserviceDetails) => {
            res.name = res.name + "_copy";
            res.configuration.webservice = res.configuration.webservice.replace(name,res.name);
            res.configuration.returnTemplate = res.configuration.returnTemplate.replaceAll(name,res.name);

            this._connection.addNewWebservice(res.name, res.configuration, res.returnTemplate).toPromise().then(
                () => {
                    this.openSnackBar('Settings copied');
                    this.reloadData();
                },
                (error) => {
                    this.openSnackBar('Unable to copy settings');
                }
            );
        });
    }

    delete(name: string): void {
        this._connection.deleteWebservice(name).toPromise().then(
            () => {
                this.openSnackBar('Deleted settings');
                this.reloadData();
            },
            (error) => {
                this.openSnackBar('Unable to delete settings');
            }
        );
    }

    openCreateWebservice(): void {
        const dialogConfig = new MatDialogConfig();
        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';
        const dialogRef = this._dialog.open(WebserviceCreateFormComponent, dialogConfig);
        dialogRef.afterClosed().toPromise().then(() => this.reloadData());

    }

    reloadData(): void {
        this._connection.getWebservices().subscribe((res: IWebservicesOverview) => {
            this.webservices = res.webservices;
            this.webservices.sort((e1,e2) => {
                if(e1.name > e2.name) return 1;
                if(e1.name < e2.name) return -1;
                return 0;
            });
        });
    }

    restartWebServices(): void {
        this._connection.restartWebServices().subscribe(test => {});
        this.reloadData();
        this.openSnackBar('Restarted simulated APIs');
    }

    openSnackBar(message: string) {
        this._snackBar.open(message, '', {duration: 2000});
    }
}
