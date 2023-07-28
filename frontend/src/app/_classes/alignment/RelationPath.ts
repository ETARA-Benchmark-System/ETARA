export class RelationPath {
    private _paths: string[];

    constructor(paths: string[]) {
        this._paths = paths;
    }

    public addPath(path: string): void {
        this._paths.push(path);
    }

    public compareTo(b: RelationPath): number {
        return this.paths.toString().localeCompare(b.toString());
    }

    get paths(): string[] {
        return this._paths;
    }

    public toString(): string {
        return this.paths.join();
    }
}
