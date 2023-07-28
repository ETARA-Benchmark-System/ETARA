import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ISuggestionEntry} from '../../../../_interfaces/gsb/suggestion';
import {GsbService} from '../../../../_services/gsb.service';
import {Utils} from '../../../../_classes/Utils';

@Component({
  selector: 'app-mapping-view',
  templateUrl: './mapping-view.component.html',
  styleUrls: ['./mapping-view.component.scss']
})
export class MappingViewComponent implements OnInit {
  public utils = new Utils();

  constructor(@Inject(MAT_DIALOG_DATA, ) public data: ISuggestionEntry, public gsbService: GsbService) {
  }

  ngOnInit(): void {
  }

}
