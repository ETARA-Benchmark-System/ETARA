import {Component, OnInit} from '@angular/core';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ILocalDatabase, ILocalDatabaseShortInfo, ILocalDatabasesOverview} from '../../../_interfaces';
import {DbInformationComponent} from '../db-information/db-information.component';
import {DbCreateFormComponent} from '../db-create-form/db-create-form.component';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-databases-overview',
    templateUrl: './databases-overview.component.html',
    styleUrls: ['./databases-overview.component.scss']
})
export class DatabasesOverviewComponent implements OnInit {
    displayedColumns: string[] = ['index', 'label', 'path', 'identifierMap', 'actions'];
    databases: Array<ILocalDatabaseShortInfo>;

    constructor(private connection: BackendConnectionService, private _dialog: MatDialog, private _snackbar: MatSnackBar) {
        this.loadDBs();
    }

    ngOnInit(): void {
    }

    loadDBs() {
        this.connection.getDatabases().then((res: ILocalDatabasesOverview) => {
            this.databases = res.databases;
        });
    }

    openDbInformation(name: string): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = name;

        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';

        const dialogRef = this._dialog.open(DbInformationComponent, dialogConfig).afterClosed().toPromise().then(
            () => this.loadDBs()
        );
    }

    openCreateDB(): void {
        const dialogConfig = new MatDialogConfig();
        // disable closing by clicking outside of dialog window
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.maxWidth = '90vw';
        const dialogRef = this._dialog.open(DbCreateFormComponent, dialogConfig);
        dialogRef.afterClosed().toPromise().then(() => this.loadDBs());

    }

    delete(name: string): void {
        this.connection.getLocalDatabaseData(name).then((res: ILocalDatabase) => {
            this.connection.deleteDatabase(res.label).toPromise().then(
                () => {
                    this.openSnackBar('Deleted');
                    this.loadDBs();
                },
                (error) => {
                    this.openSnackBar('Unable to delete');
                }
            );
        });
    }

    openSnackBar(message: string) {
        this._snackbar.open(message, '', {duration: 2000});
    }

}
