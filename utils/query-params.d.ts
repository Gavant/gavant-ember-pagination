export interface QueryParamsObj {
    [x: string]: any;
}
interface buildQueryParamsArgs {
    context: any;
    offset?: number;
    limit?: number;
    filterList?: string[];
    includeList?: string[];
    sorts?: string[];
    pagingRootKey?: string | null;
    filterRootKey?: string | null;
    includeKey?: string;
    sortKey?: string;
    serverDateFormat?: string;
    processQueryParams?: (params: QueryParamsObj) => QueryParamsObj;
}
interface getParamsObjectArgs {
    context: any;
    filterList?: string[];
    filterRootKey?: string | null;
    sorts?: string[];
    sortKey?: string;
    serverDateFormat?: string;
}
/**
 * Builds a query params object to use for paginated api requests using the "context" (e.g. Controller/Component)
 * to get filter values, along with additional passed in configuration. Optimized for JSON-API spec APIs by default.
 * @param {buildQueryParamsArgs} Config
 * @returns {QueryParamsObj} Object with query params to send to server
 */
export declare function buildQueryParams({ context, offset, limit, filterList, includeList, sorts, pagingRootKey, filterRootKey, includeKey, sortKey, serverDateFormat, processQueryParams }: buildQueryParamsArgs): QueryParamsObj;
/**
 * Gets the parameter values from the "context" (e.g. Controller/Component)
 * @param {getParamsObjectArgs} Config
 * @returns {QueryParamsObj} Object with query params to send to server
 */
export declare function getParamsObject({ context, filterList, filterRootKey, sorts, sortKey, serverDateFormat }: getParamsObjectArgs): QueryParamsObj;
/**
 * Remove empty(using [isEmpty](https://api.emberjs.com/ember/release/functions/@ember%2Futils/isEmpty))query params from the query params object thats built from `buildQueryParams`
 * @param {any} queryParams The query params object
 * @returns {QueryParamsObj} object with empty query params removed
 */
export declare function removeEmptyQueryParams(queryParams: QueryParamsObj): QueryParamsObj;
export {};
