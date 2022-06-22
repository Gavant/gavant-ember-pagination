import { get } from '@ember/object';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';

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
    serializeDate?: (value: Date) => string | null;
    processQueryParams?: (params: QueryParamsObj) => QueryParamsObj;
}

interface getParamsObjectArgs {
    context: any;
    filterList?: string[];
    filterRootKey?: string | null;
    sorts?: string[];
    sortKey?: string;
    serializeDate: (value: Date) => string | null;
}

/**
 * Builds a query params object to use for paginated api requests using the "context" (e.g. Controller/Component)
 * to get filter values, along with additional passed in configuration. Optimized for JSON-API spec APIs by default.
 * @param {buildQueryParamsArgs} Config
 * @returns {QueryParamsObj} Object with query params to send to server
 */
export function buildQueryParams({
    context,
    offset = 0,
    limit = 20,
    filterList = [],
    includeList = [],
    sorts = [],
    pagingRootKey = 'page',
    filterRootKey = 'filter',
    includeKey = 'include',
    sortKey = 'sort',
    serializeDate = (val: Date) => val.toISOString(),
    processQueryParams = (params: QueryParamsObj) => params
}: buildQueryParamsArgs): QueryParamsObj {
    let queryParams = getParamsObject({
        context,
        filterList,
        filterRootKey,
        sorts,
        sortKey,
        serializeDate
    });

    let pagingRoot = queryParams;

    if (pagingRootKey) {
        queryParams[pagingRootKey] = {};
        pagingRoot = queryParams[pagingRootKey];
    }

    pagingRoot.offset = offset;
    pagingRoot.limit = limit;

    if (isArray(includeList) && !isEmpty(includeList)) {
        queryParams[includeKey] = includeList.join(',');
    }

    const compactQueryParams = removeEmptyQueryParams(queryParams);
    const processedQueryParams = processQueryParams(compactQueryParams);
    return processedQueryParams;
}

/**
 * Gets the parameter values from the "context" (e.g. Controller/Component)
 * @param {getParamsObjectArgs} Config
 * @returns {QueryParamsObj} Object with query params to send to server
 */
export function getParamsObject({
    context,
    filterList,
    filterRootKey,
    sorts = [],
    sortKey = 'sort',
    serializeDate
}: getParamsObjectArgs): QueryParamsObj {
    let params: QueryParamsObj = {};
    let filterRoot = params;

    if (filterRootKey) {
        params[filterRootKey] = {};
        filterRoot = params[filterRootKey];
    }

    if (isArray(filterList)) {
        filterList.forEach((param: string) => {
            let key = param;
            let valueKey = param;
            let paramArray: string[];

            if (param.indexOf(':') !== -1) {
                paramArray = param.split(':');
                key = paramArray[0];
                valueKey = paramArray[1];
            }

            let value = get(context, valueKey);
            if (value instanceof Date) {
                value = serializeDate(value);
            }

            filterRoot[key] = value;
        });

        filterRoot = removeEmptyQueryParams(filterRoot);
    }

    if (!isEmpty(sorts)) {
        params[sortKey] = sorts.join(',');
    }

    return params;
}

/**
 * Remove empty(using [isEmpty](https://api.emberjs.com/ember/release/functions/@ember%2Futils/isEmpty))query params from the query params object thats built from `buildQueryParams`
 * @param {any} queryParams The query params object
 * @returns {QueryParamsObj} object with empty query params removed
 */
export function removeEmptyQueryParams(queryParams: QueryParamsObj): QueryParamsObj {
    for (let i in queryParams) {
        if (isEmpty(queryParams[i])) {
            delete queryParams[i];
        }
    }

    return queryParams;
}
