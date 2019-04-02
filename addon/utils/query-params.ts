import { get, set, getWithDefault } from '@ember/object';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { merge } from '@ember/polyfills';
// import Controller from '@ember/controller';
import moment from 'moment';

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

export function removeEmptyQueryParams(queryParams: any) {
    for(let i in queryParams) {
        if(isEmpty(queryParams[i])) {
            delete queryParams[i];
        }
    }

    return queryParams;
}
