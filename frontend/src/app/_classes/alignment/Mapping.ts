import {RelationPath} from './RelationPath';
import {Metric} from './Metric';


export class Mapping {
    private _apiPaths: string[];
    private _relationPaths: RelationPath[];
    private _metrics: Metric[];

    constructor(apiPath: string[], relationPaths: RelationPath[], metrics: Metric[]) {
        this._apiPaths = apiPath;

        this._relationPaths = relationPaths;

        this._metrics = metrics;
    }

    get apiPaths(): string[] {
        return this._apiPaths;
    }

    get relationPaths(): RelationPath[] {
        return this._relationPaths;
    }

    get metrics(): Metric[] {
        return this._metrics;
    }

    private addRelationPath(relationPaths: RelationPath | RelationPath[] | string[]): void {
        if (Array.isArray(relationPaths)) {
            if (relationPaths.length === 0) {
                return;
            }
            if (relationPaths[0] instanceof RelationPath) {
                for (const relationPath of relationPaths) {
                    this._relationPaths.push(relationPath as RelationPath);
                }
            } else {
                const rel = new RelationPath(relationPaths as string[]);
                this._relationPaths.push(rel);
            }
        } else {
            this._relationPaths.push(relationPaths);
        }
    }

    private addApiPath(apiPath: string | string[]): void {
        if (Array.isArray(apiPath)) {
            for (const path of apiPath) {
                this._apiPaths.push(path);
            }
        } else {
            this._apiPaths.push(apiPath);
        }
    }
}
