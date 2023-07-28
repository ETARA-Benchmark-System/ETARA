import {Component, Input, OnInit} from '@angular/core';
import {AlignmentCubeService} from '../../engine/alignment-cube.service';
import {FormBuilder, FormControl} from '@angular/forms';

@Component({
    selector: 'app-ui-sidebar-right',
    templateUrl: './ui-sidebar-right.component.html'
})
export class UiSidebarRightComponent implements OnInit {
    fullRelationPathControl: FormControl;
    fullApiPathControl: FormControl;
    metricChoiceControl: FormControl;
    advancedModeControl: FormControl;

    public constructor(
        private fb: FormBuilder,
        public engineService: AlignmentCubeService) {
    }

    public ngOnInit(): void {
        this.fullRelationPathControl = new FormControl(this.engineService.showFullRelationPath);
        this.fullApiPathControl = new FormControl(this.engineService.showFullApiPath);
        this.metricChoiceControl = new FormControl('');
        this.advancedModeControl = new FormControl(this.engineService.helper);
    }

    changeMetric(): void {
        this.engineService.setMetric(this.metricChoiceControl.value);
    }

    changeRelationPath(): void {
        this.engineService.setShowRelationFullPath(this.fullRelationPathControl.value);
    }

    changeApiPath(): void {
        this.engineService.setShowApiFullPath(this.fullApiPathControl.value);
    }

    changeAdvancedMode(): void {
        this.engineService.setShowAdvancedMode(this.advancedModeControl.value);
    }

}
