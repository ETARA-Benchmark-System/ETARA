import {GSBMapping} from './alignment';
import {IApi} from '../settings/IApis';
import {ILocalDatabase} from '../settings/IDatabase';

export interface ISuggestionContainer{
    suggestions: IMappingSuggestion[];
}

export interface IMappingSuggestion {
    general: IGeneralPathMapping;
    suggestions: ISuggestionEntry[];
}

export interface IPathMapping{
    selected?: boolean;
    type: number;
    localEntries: string[];
    webEntries: string[];
}

export interface IGeneralPathMapping{
    selected: boolean;
    counter: number;
    type: number;
    localEntries: string[];
    webEntries: string[];
}

export interface ISuggestionEntry {
    counter: number;
    selected: boolean;
    template: IPathMapping;
    mappings: GSBMapping[];
}

export interface IFinalAlignment {
    mappings: IPathMapping[];
    localLabel: string;
    webLabel: string;
}

