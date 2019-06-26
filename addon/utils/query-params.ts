import { get, set, getWithDefault } from '@ember/object';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export interface PaginationController {
    offset: number | undefined;
    limit: number;
    sort: string[];
    modelName: string;
    [key: string]: any;
}

export enum sortDirection {
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
export function buildQueryParams(
    controller: PaginationController,
    offset: number = 0,
    limit: number = 10,
    queryParamListName: string = 'serverQueryParams'
) {
    let list: any = controller[queryParamListName];
    let queryParams = getParamsObject(list, controller);
    queryParams.offset = getWithDefault(controller, 'offset', offset);
    queryParams.limit =  getWithDefault(controller, 'limit', limit);
    queryParams.sort = getWithDefault(controller, 'sort', []);
    return removeEmptyQueryParams(queryParams);
}

/**
 * Gets the parameter values from the controller
 * @param parameters - The array of string names to go get from the controller
 * @param context - The pagination controller instance
 * @returns - Object with query params to send to server
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
            if (moment.isMoment(value) || moment.isDate(value)) {
                let serverDateFormat = getWithDefault(context, 'serverDateFormat', 'YYYY-MM-DDTHH:mm:ss');
                value = moment(value).format(serverDateFormat);
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
 * @param queryParams - The query params object
 * @returns - Object with no empty query params
 */
export function removeEmptyQueryParams(queryParams: any) {
    for(let i in queryParams) {
        if(isEmpty(queryParams[i])) {
            delete queryParams[i];
        }
    }

    return queryParams;
}
