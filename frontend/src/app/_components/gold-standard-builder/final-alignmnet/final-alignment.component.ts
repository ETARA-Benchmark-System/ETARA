import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Utils} from '../../../_classes/Utils';
import {GsbService} from '../../../_services/gsb.service';
import {IAlignment} from '../../../_interfaces';
import {IFinalAlignment, IMappingSuggestion} from '../../../_interfaces/gsb/suggestion';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MappingTableComponent} from '../builder/mapping-table/mapping-table.component';
import {LeaderLineAlignment} from '../../../_classes/gsb/lines';
import {MappingEditorComponent} from '../mapping-suggestion-tool/mapping-editor/mapping-editor.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-final-alignmnet',
    templateUrl: './final-alignment.component.html',
    styleUrls: ['./final-alignment.component.scss']
})
export class FinalAlignmentComponent implements OnInit {

    utils: Utils = new Utils();

    @Input() finalAlignment: IFinalAlignment;

    constructor(public gsbService: GsbService, public cdr: ChangeDetectorRef, private _dialog: MatDialog, private _snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
    }

    openMappingEditor(entry: IMappingSuggestion, index: number): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = {entry, index};

        dialogConfig.autoFocus = true;
        dialogConfig.maxHeight = '100vh';
        dialogConfig.minHeight = '70vh';
        dialogConfig.maxWidth = '90vw';
        dialogConfig.minWidth = '70vw';
        const dialogRef = this._dialog.open(MappingEditorComponent, dialogConfig);
    }

    saveFinalAlignment(): void {
        this.gsbService.generateFinalAlignment();
        this.gsbService.saveFinalAlignment().then((resp) => {
                this._snackBar.open('Saved!!!', 'Close');
            },
            (err) => {
                this._snackBar.open('Failed to save!!!', 'Close');
            }
        );
    }

}
