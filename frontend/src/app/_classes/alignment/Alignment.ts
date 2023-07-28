import {IAlignment} from '../../_interfaces';
import {Mapping} from './Mapping';
import {Metric} from './Metric';
import {RelationPath} from './RelationPath';

export class Alignment {
    private readonly _mappings: Mapping[];
    private _name: string;
    private _metricsNames: Set<string>;

    constructor() {
        this._mappings = [];
        this._metricsNames = new Set();
    }

    public addMapping(mapping: Mapping): void {
        this._mappings.push(mapping);
    }

    public addAlignment(iAlginment: IAlignment) {
        iAlginment.alignments.forEach(mapping => {
            const newMetrics: Metric[] = [];
            // tslint:disable-next-line:forin
            for (const metricsKey in mapping.metrics) {
                newMetrics.push(new Metric(metricsKey, mapping.metrics[metricsKey]));
                this._metricsNames.add(metricsKey);
            }
            const relationPath: RelationPath[] = [];
            mapping.relation_path.forEach(paths => {
                relationPath.push(new RelationPath(paths.path));
            });

            const newMapping = new Mapping(mapping.api_path, relationPath, newMetrics);
            this._mappings.push(newMapping);
        });
    }

    public compareTo(a: Alignment): number{
        return this.name.localeCompare(a.name);
    }

    get mappings(): Mapping[] {
        return this._mappings;
    }

    get name(): string {
        return this._name;
    }

    get metricsNames(): Set<string> {
        return this._metricsNames;
    }

    set name(value: string) {
        this._name = value;
    }
}
