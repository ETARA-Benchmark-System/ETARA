import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as apiTemplateFile from '../../../../assets/templates/api_template.json';

@Component({
  selector: 'app-api-create-form',
  templateUrl: './api-create-form.component.html',
  styleUrls: ['./api-create-form.component.scss']
})
export class ApiCreateFormComponent implements OnInit {

  apiLabel: string;
  apiTemplate: any;

  constructor(private connection: BackendConnectionService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.apiLabel = '';
    this.apiTemplate = (apiTemplateFile as any).default;
  }

  save(): void {
    const apiConfig = this.apiTemplate;
    this.connection.addNewApi(apiConfig).toPromise().then(
        () => {
          this.openSnackBar('Saved');
        },
        (error) => {
          this.openSnackBar('Unable to add new service');
        }
    );
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {duration: 2000});
  }

}
