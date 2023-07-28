export interface IWebserviceInformationShort {
    path: string;
    name: string;
    status: string;
}

export interface IWebservicesOverview {
    webservices: Array<IWebserviceInformationShort>;
    endpoint: string;
}
