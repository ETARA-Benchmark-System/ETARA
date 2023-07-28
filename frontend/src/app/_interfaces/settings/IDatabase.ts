export interface ILocalDatabasesOverview {
    databases: Array<ILocalDatabaseShortInfo>;
}

export interface ILocalDatabaseShortInfo {
    label: string;
    path: string;
    identifierMap: string;
}

export interface ILocalDatabase {
    label: string;
    path: string;
    identifierMap: string;
    identifierMapContent: any;
    source: string;
}

export interface ILocalDatabaseSchema {
    identifier: IFunctionality[];
    classes: IClass[];
    functionality: IFunctionality[];
    structure: IRelation[];
}

export interface IPredicate{
    predicate: string;
    functionality: number;
    type?: string;
    occurrence?: number;
}

export interface IFunctionality{
    predicate: string;
    functionality: number;
    type?: string;
}

export interface IClass{
    class: string;
    occurrence: number;
    type?: string;
}

export interface IRelation{
    predicate: string;
    subject: string;
    occurrence: number;
    object?: string;
}


