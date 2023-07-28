import {IAlignment} from '../../_interfaces';
import {Alignment} from './Alignment';
import {Mapping} from './Mapping';
import {Color} from 'three';
import * as d3 from 'd3';

export class AlignmentContainer {

    private _alignments: Alignment[];
    private _apiLabels: string[];
    private _relationPathLabels: string[][];
    private _metricsNames: Set<string>;

    private _colorMapping;
    private _colorScaleMapping;

    constructor() {
        this._alignments = [];
        this._relationPathLabels = [];
        this._apiLabels = [];
        this._metricsNames = new Set();
        this._colorMapping = new Map();
        this._colorScaleMapping = new Map();
    }

    public addAlignment(ac: IAlignment): boolean {
        const alignment = new Alignment();
        alignment.name = ac.name;

        alignment.addAlignment(ac);

        alignment.mappings.forEach((mapping: Mapping, index) => {
            let newApi = false;
            let newRelation = false;

            mapping.apiPaths.forEach((apiPath) => {
                mapping.relationPaths.forEach((rel) => {
                    const relationPaths = rel.paths;
                    const relationPathJoin = relationPaths.join();
                    if (!this.apiLabels.some(s => s === apiPath)) {
                        this.apiLabels.push(apiPath);
                        newApi = true;
                    }
                    if (!this._relationPathLabels.some(s => this.arrayEquals(s, relationPaths))) {
                        this._relationPathLabels.push(relationPaths);
                        newRelation = true;
                    }

                    const random = Math.random();
                    const color = d3.interpolateSinebow(random);
                    const colorScale = d3.scaleSequential(t => d3.hsl(random * 360, t, 0.5).toString());

                    if (newApi || newRelation) {
                        // obviously no mapping
                        // const color = new Color(Math.random() * 0xFFFFFF);

                        if (newApi) {
                            const newRelationMap = new Map();
                            newRelationMap.set(relationPaths.join(), new Color(color));
                            this.colorMapping.set(apiPath, newRelationMap);

                            const newRelationScaleMap = new Map();
                            newRelationScaleMap.set(relationPaths.join(), colorScale);
                            this.colorScaleMapping.set(apiPath, newRelationScaleMap);
                        } else {
                            const relationMap = this.colorMapping.get(apiPath);
                            relationMap.set(relationPaths.join(), new Color(color));

                            const relationScaleMap = this.colorScaleMapping.get(apiPath);
                            relationScaleMap.set(relationPaths.join(), colorScale);
                        }
                    } else {
                        // check if mapping exist
                        const relationPathMap = this.colorMapping.get(apiPath);
                        const relationPathScaleMap = this.colorScaleMapping.get(apiPath);
                        if (relationPathMap !== undefined) {
                            const mapColor = relationPathMap.get(relationPaths.join());
                            const mapScaleColor = relationPathMap.get(relationPaths.join());
                            if (mapColor === undefined) {
                                relationPathMap.set(relationPaths.join(), new Color(color));
                                relationPathScaleMap.set(relationPaths.join(), colorScale);
                            }
                        } else {
                            const newRelationMap = new Map();
                            const newRelationScaleMap = new Map();
                            newRelationMap.set(relationPaths.join(), new Color(color));
                            newRelationScaleMap.set(relationPaths.join(), colorScale);
                            this.colorMapping.set(apiPath, newRelationMap);
                            this.colorScaleMapping.set(apiPath, newRelationScaleMap);
                        }
                    }
                });
            });
        });

        // Add all metric keys
        for (const elem of alignment.metricsNames) {
            this._metricsNames.add(elem);
        }

        this.alignments.push(alignment);
        return true;
    }

    public sortApiLabels(): void {
        this.apiLabels.sort((a: string, b: string) => a.localeCompare(b));
    }

    public sortRelationLabels(): void {
        this.relationPathLabels.sort((a, b) => a.join().localeCompare(b.join()));
    }

    public arrayEquals(a: Array<any>, b: Array<any>): boolean {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    public getRelationPathIndex(searchPaths: string[]): number {
        let searchIndex = -1;
        this._relationPathLabels.some((relationPaths, index) => {
            if (this.arrayEquals(relationPaths, searchPaths)) {
                searchIndex = index;
                return true;
            }
        });
        return searchIndex;
    }

    public getColorForMapping(apiPath: string, relationPath: string): Color {
        const relationMap = this.colorMapping.get(apiPath);
        return relationMap.get(relationPath);
    }

    public getScaleColorForMapping(apiPath: string, relationPath: string, value: number): Color {
        const relationMap = this.colorScaleMapping.get(apiPath);
        const scale = relationMap.get(relationPath);
        const color = new Color(scale(value));

        return color;
    }

    public get alignments(): Alignment[] {
        return this._alignments;
    }

    public get apiLabels(): string[] {
        return this._apiLabels;
    }

    public get relationPathLabels(): string[][] {
        return this._relationPathLabels;
    }

    get colorScaleMapping() {
        return this._colorScaleMapping;
    }

    get colorMapping(): Map<string, Map<string, Color>> {
        return this._colorMapping;
    }

    get metricsNames(): Set<string> {
        return this._metricsNames;
    }
}
