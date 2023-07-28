export interface IWebserviceDetails {
    name: string;
    configuration: IWebserviceConfiguration;
    returnTemplate: string;
}

export interface IWebserviceConfiguration{
    webservice: string;
    errorType: string;
    type: string;
    latency: string;
    maxRequestsPerMinute: string;
    maxRequests: string;
    inputs: Array<string>;
    where: Array<Array<string>>;
    returnTemplate: string;
    db: string;
}
