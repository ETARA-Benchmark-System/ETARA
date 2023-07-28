import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {IAlignment, IAlignmentCollection} from '../../../_interfaces';
import Ajv from 'ajv';
import * as alignmentSchema from '../../../../assets/jsonSchema/alignment.schema.json';
import {AlignmentCubeConnectionService} from "../../../_services/alignment_cube.service";

@Component({
    selector: 'app-data-selector',
    templateUrl: './alignment-selector.component.html',
    styleUrls: ['./alignment-selector.component.scss']
})
export class AlignmentSelectorComponent implements OnInit {
    @Output() newAlignmentAdded = new EventEmitter<IAlignment>();

    alignments: IAlignment[];
    selectedAlignments: IAlignment[];
    selection: IAlignment;
    private ajv;

    @ViewChild('fileSelector', {static: false}) fileSelector: ElementRef;

    constructor(private connection: AlignmentCubeConnectionService) {
        this.alignments = [];
        this.selectedAlignments = [];
    }

    ngOnInit(): void {
        this.ajv = new Ajv({allErrors: true});
        this.ajv.addSchema((alignmentSchema as any).default, 'mySchema');

        this.connection.getAlignmentsOverview().then((res: IAlignmentCollection) => {
            this.alignments = res.files;
        });
    }

    readFiles(): void {
        const fileSelector = this.fileSelector.nativeElement;
        fileSelector.onchange = () => {
            for (const file of fileSelector.files) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const fileJson = JSON.parse(reader.result.toString());
                        const check = this.parseAndLog(fileJson);
                        if (!check) {
                            let errorMessage = 'JSONSchemaError \n';
                            for (const error of this.ajv.errors) {
                                errorMessage += error.message + '\n';
                            }
                            alert(errorMessage);
                        } else {
                            const alignment: IAlignment = JSON.parse(reader.result.toString());
                            this.alignments.push(alignment);
                            this.addAlignment(alignment);
                        }
                    } catch (e) {
                        alert(e);
                    }
                };
                reader.readAsText(file);
            }
        };
        fileSelector.click();
    }

    addAlignment(alignment: IAlignment): void {
        this.newAlignmentAdded.emit(alignment);
        this.selectedAlignments.push(alignment);
    }

    private parseAndLog(json): boolean {
        return this.ajv.validate('mySchema', json);
    }
}
