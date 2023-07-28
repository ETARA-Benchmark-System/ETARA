import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {IMappingSuggestion, ISuggestionEntry} from '../../../../_interfaces/gsb/suggestion';
import {GsbService} from '../../../../_services/gsb.service';

@Component({
  selector: 'app-mapping-editor',
  templateUrl: './mapping-editor.component.html',
  styleUrls: ['./mapping-editor.component.scss']
})
export class MappingEditorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA, ) public data: any, public gsbService: GsbService) { }

  ngOnInit(): void {
  }

  deleteSuggestion() {
    this.gsbService.suggestionContainer.suggestions.splice(this.data.index, 1);
  }
}
