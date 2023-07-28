import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonEditorOptions} from '@maaxgr/ang-jsoneditor';

@Component({
    selector: 'app-json-viewer',
    templateUrl: './json-viewer.component.html',
    styleUrls: ['./json-viewer.component.scss']
})
export class JsonViewerComponent implements OnInit {

    public editorOptionsConfig: JsonEditorOptions;
    public editorOptionsReturnTemplate: JsonEditorOptions;

    @Input() jsonData = '';

    @Output() jsonChangeEvent = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit(): void {
        this.editorOptionsConfig = new JsonEditorOptions();
        this.editorOptionsConfig.mode = 'tree';
        this.editorOptionsConfig.modes = ['code', 'tree'];
        this.editorOptionsConfig.enableTransform = false;

        // @ts-ignore
        // remove unneeded actions from context menu
        this.editorOptionsConfig.onCreateMenu = (items, node) => {
            items = items.filter((item) => {
                return item.text === 'Remove';
            });
            return items;
        };
    }

    saveChanges(e): void {
        this.jsonData = e;
        this.jsonChangeEvent.emit(e);
    }
}
