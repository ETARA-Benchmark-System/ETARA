import {Component, OnInit, ViewChild} from '@angular/core';
import {JsonEditorComponent, JsonEditorOptions} from '@maaxgr/ang-jsoneditor';
import {BackendConnectionService} from '../../../_services/backend-connection.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as dbTemplateFile from '../../../../assets/templates/db_template.json';

@Component({
  selector: 'app-db-create-form',
  templateUrl: './db-create-form.component.html',
  styleUrls: ['./db-create-form.component.scss']
})
export class DbCreateFormComponent implements OnInit {

  dbLabel: string;
  dbTemplate: any;

  @ViewChild(JsonEditorComponent)
  configEditor: JsonEditorComponent;
  public editorOptionsConfig: JsonEditorOptions;

  constructor(private connection: BackendConnectionService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Init jsonEditor for configuration file
    this.editorOptionsConfig = new JsonEditorOptions();
    this.editorOptionsConfig.mode = 'code';
    this.editorOptionsConfig.modes = ['code'];

    this.dbTemplate = (dbTemplateFile as any).default;
  }

  onDBNameChange(): void {
    this.dbTemplate.label = this.dbTemplate.label;
    this.dbTemplate.identifierMap = "configs\\identifierMaps\\" + this.dbTemplate.label + ".json"
  }

  save(): void {
    const config = this.dbTemplate;
    this.connection.addNewDatabase(config).toPromise().then(
        () => {
          this.openSnackBar('Saved');
        },
        (error) => {
          this.openSnackBar('Unable to add new service');
        }
    );
  }

  onJSONChange(): void {
    this.dbTemplate = this.configEditor.get() as any;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {duration: 2000});
  }

}
