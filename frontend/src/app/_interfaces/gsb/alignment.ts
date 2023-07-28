import {MappingType, ViewMode} from '../../models';
import {IPathMapping} from './suggestion';

export interface GSB {
    alignments: GSBAlignment[];
    finalAlignment: IPathMapping[];
    webDb: any;
    localDb: any;
    regexApiStore: [];
    identifier: string;
}

export interface GSBAlignment {
    mappings: GSBMapping[];
    localEntity: any;
    webEntity: any;
}

export interface GSBMapping {
    type: MappingType;
    localEntries: LocalEntry[];
    webEntries: WebEntry[];
}

export interface LocalEntry {
    path: string;
    value: string;
    hash?: string;
}

export interface WebEntry {
    path: string;
    value: string;
    hash?: string;
}
