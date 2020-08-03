import { PaginationControllerClass } from '../mixins/controller-pagination';
export declare enum sortDirection {
    ascending = "asc",
    descending = "desc"
}
/**
 * Builds the query params to send to the server by taking the controller, route params, and paging data(`offset` & `limit`)
 * @param controller - The pagination controller instance
 * @param offset - Offset provides a starting point for paging. i.e. offset of 0 and limit of 10 gives you the first 10 records. offset of 10 and limit of 10 gives the next 10
 * @param limit - How many records to ruturn for one api call
 * @param queryParamListName - The name of the query params you want to use to page on the server
 * @returns - Object with query params to send to server
 */
export declare function buildQueryParams(controller: InstanceType<PaginationControllerClass>, offset?: number, limit?: number, queryParamListName?: string, includeListName?: string): any;
/**
 * Gets the parameter values from the controller
 * @param parameters - The array of string names to go get from the controller
 * @param context - The pagination controller instance
 * @returns - Object with query params to send to server
 */
export declare function getParamsObject(parameters: string[] | undefined, context: InstanceType<PaginationControllerClass>): any;
/**
 * Remove empty(using [isEmpty](https://api.emberjs.com/ember/release/functions/@ember%2Futils/isEmpty))query params from the query params object thats built from `buildQueryParams`
 * @param queryParams - The query params object
 * @returns - Object with no empty query params
 */
export declare function removeEmptyQueryParams(queryParams: any): any;
