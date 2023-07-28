import {Component, Input, OnInit} from '@angular/core';
import {AlignmentCubeService} from '../../engine/alignment-cube.service';

@Component({
    selector: 'app-ui-infobar-bottom',
    templateUrl: './ui-infobar-bottom.component.html'
})
export class UiInfobarBottomComponent implements OnInit {

    public constructor(public engineService: AlignmentCubeService) {
    }

    public ngOnInit(): void {
    }

}
