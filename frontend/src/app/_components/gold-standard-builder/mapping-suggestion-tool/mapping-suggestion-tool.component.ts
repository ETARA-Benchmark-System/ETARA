import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {GsbService} from '../../../_services/gsb.service';
import {MatStepper} from '@angular/material/stepper';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MappingTableComponent} from '../builder/mapping-table/mapping-table.component';
import {LeaderLineAlignment} from '../../../_classes/gsb/lines';
import {MappingViewComponent} from './mapping-view/mapping-view.component';
import {ISuggestionEntry} from '../../../_interfaces/gsb/suggestion';

@Component({
    selector: 'app-mapping-suggestion-tool',
    templateUrl: './mapping-suggestion-tool.component.html',
    styleUrls: ['./mapping-suggestion-tool.component.scss']
})
export class MappingSuggestionToolComponent implements OnInit {

    @ViewChild('stepper') stepper: MatStepper;

    @Output() finishedEvent = new EventEmitter<any>();

    constructor(public gsbService: GsbService, public cdr: ChangeDetectorRef, private _dialog: MatDialog) {
    }

    ngOnInit(): void {}

    log() {
        console.log(this.gsbService.suggestionContainer);
    }

    deleteSuggestion(index: number) {
        this.gsbService.suggestionContainer.suggestions.splice(index, 1);
    }

}
