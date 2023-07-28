import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {IMappingSuggestion, ISuggestionEntry} from '../../../../_interfaces/gsb/suggestion';
import {GsbService} from '../../../../_services/gsb.service';
import {Utils} from '../../../../_classes/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MappingViewComponent} from '../mapping-view/mapping-view.component';

@Component({
    selector: 'app-mapping-suggestion',
    templateUrl: './mapping-suggestion.component.html',
    styleUrls: ['./mapping-suggestion.component.scss']
})
export class MappingSuggestionComponent implements OnInit {

    utils: Utils = new Utils();

    @Input() suggestionMapping: IMappingSuggestion;

    useGeneral = true;
    useIndividual = false;

    constructor(public gsbService: GsbService, public cdr: ChangeDetectorRef, private _dialog: MatDialog) {
    }

    ngOnInit(): void {
    }

    toggleUseGeneral(): void {
        this.useGeneral = !this.useGeneral;
        this.useIndividual = !this.useGeneral;

    }

    toggleUseIndividual(): void {
        this.useIndividual = !this.useIndividual;
        this.useGeneral = !this.useGeneral;

    }

    openMappingTable(entry: ISuggestionEntry): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.data = entry;
        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.minHeight = '70vh';
        dialogConfig.maxWidth = '90vw';
        dialogConfig.minWidth = '70vw';
        const dialogRef = this._dialog.open(MappingViewComponent, dialogConfig).afterClosed().toPromise().then(() => {
            this.cdr.detectChanges();
        });
    }

}
