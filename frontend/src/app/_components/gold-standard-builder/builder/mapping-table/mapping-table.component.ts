import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LeaderLineAlignment} from '../../../../_classes/gsb/lines';
import {GsbService} from '../../../../_services/gsb.service';
import {Utils} from '../../../../_classes/Utils';

@Component({
    selector: 'app-mapping-table',
    templateUrl: './mapping-table.component.html',
    styleUrls: ['./mapping-table.component.scss']
})
export class MappingTableComponent {

    showFullPathLocal = false;
    utils: Utils = new Utils();

    constructor(public gsbService: GsbService, public cdr: ChangeDetectorRef) {

    }

    log(): void {
        console.log(this.gsbService.currentMappings);
    }
}
