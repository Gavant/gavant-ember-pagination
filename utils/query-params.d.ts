export interface RouteParams {
    offset: number;
    limit: number;
    sort: string[];
}
export interface PaginationController {
    offset: number;
    limit: number;
    sort: string[];
    modelName: string;
    [key: string]: any;
}
export declare function buildQueryParams(controller: PaginationController, routeParams?: RouteParams, offset?: number, limit?: number, queryParamListName?: string): any;
export declare function getParamsObject(parameters: [], context: PaginationController): any;
export declare function removeEmptyQueryParams(queryParams: any): any;
