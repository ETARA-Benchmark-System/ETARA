export interface IApisOverview {
    apis: Array<IApi>;
}

export interface IApi {
    name: string;
    format: string;
    label: string;
    parameters: IParameter[];
    url: string;
}
export interface IParameter {
    name: string;
    filter: string[];
    type: string;
    status: string;
}
