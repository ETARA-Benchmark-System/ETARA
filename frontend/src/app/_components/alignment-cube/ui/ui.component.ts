import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UiSidebarLeftComponent} from './ui-sidebar-left/ui-sidebar-left.component';
import {UiSidebarRightComponent} from './ui-sidebar-right/ui-sidebar-right.component';
import {UiInfobarBottomComponent} from './ui-infobar-bottom/ui-infobar-bottom.component';
import {UiInfobarTopComponent} from './ui-infobar-top/ui-infobar-top.component';
import {AlignmentCubeService} from '../engine/alignment-cube.service';

@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html',
  styleUrls: [ './ui.component.scss']
})
export class UiComponent implements OnInit {

  @Input() engineService: AlignmentCubeService;

  @ViewChild(UiSidebarLeftComponent)
  private leftSidebar: UiSidebarLeftComponent;

  @ViewChild(UiSidebarRightComponent)
  private rightSidebar: UiSidebarRightComponent;

  @ViewChild(UiInfobarBottomComponent)
  private bottomInfobar: UiInfobarBottomComponent;

  @ViewChild(UiInfobarTopComponent)
  private topInfobar: UiInfobarTopComponent;

  public constructor() {
  }

  public ngOnInit(): void {
  }

}
