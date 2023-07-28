import {Component, Input, OnInit} from '@angular/core';
import {AlignmentCubeService} from '../../engine/alignment-cube.service';
import {ViewMode} from '../../../../models';

@Component({
  selector: 'app-ui-infobar-top',
  templateUrl: './ui-infobar-top.component.html'
})
export class UiInfobarTopComponent implements OnInit {

  // @Input() engineService: AlignmentCubeService;

  public constructor(public engineService: AlignmentCubeService) {
  }

  public ngOnInit(): void {
  }

  changeViewMode(): void{
    switch (this.engineService.viewMode) {
      case ViewMode.View2DAlignment:
        this.engineService.changeViewMode(ViewMode.View2DApi);
        break;

      case ViewMode.View2DApi:
        this.engineService.changeViewMode(ViewMode.View2DRelation);
        break;

      case ViewMode.View2DRelation:
        this.engineService.changeViewMode(ViewMode.View3D);
        break;

      case ViewMode.View3D:
        this.engineService.changeViewMode(ViewMode.View2DAlignment);
        break;

    }
  }

}
