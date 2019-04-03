import { get, set, getWithDefault } from '@ember/object';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { merge } from '@ember/polyfills';
// import Controller from '@ember/controller';
import moment from 'moment';

export interface RouteParams {
    offset: number | undefined;
    limit: number;
    sort: string[];
}

export interface PaginationController {
    offset: number | undefined;
    limit: number;
    sort: string[];
    modelName: string;
    [key: string]: any;
}

/**
 * Builds the query params to send to the server by taking the controller, route params, and paging data(`offset` & `limit`)
 * @param controller The pagination controller instance
 * @param routeParams Route Params (`offset`, `limit`, `sort`)
 * @param offset Offset provides a starting point for paging. i.e. offset of 0 and limit of 10 gives you the first 10 records. offset of 10 and limit of 10 gives the next 10
 * @param limit How many records to ruturn for one api call
 * @param queryParamListName The name of the query params you want to use to page on the server
 * @returns Object with query params to send to server
 */
export function buildQueryParams(
    controller: PaginationController,
    routeParams: RouteParams = { offset: 0, limit: 10, sort: [] },
    offset: number = 0,
    limit: number = 10,
    queryParamListName: string = 'serverQueryParams'
) {
    let params = routeParams || {};
    let list: any = controller[queryParamListName];
    let queryParams = getParamsObject(list, controller);
    params = merge(queryParams, params);
    params.offset = getWithDefault(controller, 'offset', offset);
    params.limit =  getWithDefault(controller, 'limit', limit);
    return removeEmptyQueryParams(params);
}

/**
 * Gets the parameter values from the controller
 * @param parameters The array of string names to go get from the controller
 * @param context The pagination controller instance
 * @returns Object with query params to send to server
 */
export function getParamsObject(parameters: [], context: PaginationController) {
    let params: any = {};

    if(isArray(parameters)) {
        parameters.forEach((param: string) => {
            let key = param;
            let valueKey = param;
            let paramArray: string[];
            if(param.indexOf(':') !== -1) {
                paramArray = param.split(':');
                key = paramArray[0];
                valueKey = paramArray[1];
            }
            let value = get(context, valueKey);
            if (moment.isMoment(value)) {
                value = value.format('YYYY-MM-DDTHH:mm:ss');
            }
            params[key] = value;
        });
    }

    if(!isEmpty(get(context, 'sort'))) {
        let sortProperty = get(context, 'sort').join(',')
        set(params, 'sort', sortProperty);
    }

    return params;
}

/**
 * Remove empty(using [isEmpty](https://api.emberjs.com/ember/release/functions/@ember%2Futils/isEmpty))query params from the query params object thats built from `buildQueryParams`
 * @param queryParams The query params object
 * @returns Object with no empty query params
 */
export function removeEmptyQueryParams(queryParams: any) {
    for(let i in queryParams) {
        if(isEmpty(queryParams[i])) {
            delete queryParams[i];
        }
    }

    return queryParams;
}
