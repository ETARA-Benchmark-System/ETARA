import {ILocalDatabaseShortInfo} from "../settings/IDatabase";

export interface IAlignmentOverview {
  alignments: Array<IAlignmentShort>;
}

export interface IAlignmentCollection {
  files: Array<IAlignment>;
}


export interface IAlignment {
  alignments: IMapping[];
  description?: string;
  system?: string;
  name: string;
}

export interface IAlignmentShort {
  name: string;
}

export interface IMapping {
  api_path: string[];
  relation_path: IRelationPath[];
  metrics: IMetric;
}

export interface IMetric {
  confidence: number;
}

export interface IRelationPath {
  path: string[];
}






