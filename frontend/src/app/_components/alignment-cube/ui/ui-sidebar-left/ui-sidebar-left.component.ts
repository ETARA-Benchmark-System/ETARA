import {Component, Input, OnInit} from '@angular/core';
import {AlignmentCubeService} from '../../engine/alignment-cube.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {ViewMode} from '../../../../models';

@Component({
    selector: 'app-ui-sidebar-left',
    templateUrl: './ui-sidebar-left.component.html',
    styleUrls: [ './ui-sidebar-left.component.scss']
})

export class UiSidebarLeftComponent implements OnInit {

    public ViewModeEnum = ViewMode;

    visible = true;

    selectedAlignmentControl: FormControl;
    selectedApiControl: FormControl;
    selectedRelationControl: FormControl;

    public constructor(
        private fb: FormBuilder,
        public engineService: AlignmentCubeService) {
    }

    public ngOnInit(): void {
        this.selectedAlignmentControl = new FormControl(0);
        this.selectedApiControl = new FormControl(0);
        this.selectedRelationControl = new FormControl(0);
    }

    public changeSelectedAlignment() {
        this.engineService.setSelectedDataSet(this.selectedAlignmentControl.value);
    }

    public changeSelectedApi() {
        this.engineService.setSelectedApiLabel(this.selectedApiControl.value);
    }

    public changeSelectedRelationPath() {
        this.engineService.setSelectedRelationPathLabel(this.selectedRelationControl.value);
    }
}
