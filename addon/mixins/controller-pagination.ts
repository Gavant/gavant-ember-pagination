import { inject as service } from '@ember/service';
import { action, computed, setProperties } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';
import NativeArray from '@ember/array/-private/native-array';
import { reject } from 'rsvp';
import { A } from '@ember/array';

import DS from 'ember-data';
import RouterService from '@ember/routing/router-service';
import Controller from '@ember/controller';
import { buildQueryParams, sortDirection } from '../utils/query-params';


export type ConcreteSubclass<T> = new (...args: any[]) => T;
export type PaginationControllerClass = ConcreteSubclass<PaginationController>;

export interface PaginationController extends Controller {
    offset: number | undefined;
    limit: number;
    sort: string[];
    hasMore: boolean;
    modelName: string;
    isLoadingPage: boolean;
    pagingRootKey: string | null;
    filterRootKey: string | null;
    includeKey: string;
    fetchModels(queryParams: any): DS.AdapterPopulatedRecordArray<any> & DS.PromiseArray<any>;
    clearModels(): void;
    _loadModels(reset: boolean): Promise<any[]>;
    loadModels(reset: boolean): Promise<any[]> | undefined;
    filterModels(): Promise<any[]> | undefined;
    reloadModels(): Promise<any[]> | undefined;
    metadata?: {
        [key: string]: any;
    };
    serverQueryParams?: any[];
    serverDateFormat?: string;
}

interface ArrayMeta {
    meta: any;
}

export type SearchQuery = DS.AdapterPopulatedRecordArray<any> & DS.RecordArray<any> & DS.PromiseArray<any> & ArrayMeta;

export function ControllerPagination<U extends ConcreteSubclass<Controller>>(
    ControllerSubclass: U
): {
    new (...args: any[]): PaginationController;
    prototype: PaginationController;
} {
    class PaginationClass extends ControllerSubclass implements PaginationController {
        @service router!: RouterService;
        sort: NativeArray<any> = A();
        hasMore: boolean = true;
        limit: number = 10;
        isLoadingPage: boolean = false;
        pagingRootKey: string | null = 'page';
        filterRootKey: string | null = 'filter';
        includeKey: string = 'include';
        modelName = '';
        metadata?: {
            [key: string]: any;
        } = {};

        serverQueryParams = <any>[];
        serverDateFormat = undefined;

        @or('isLoadingPage', 'isLoadingRoute') isLoadingModels!: boolean;
        @readOnly('model.length') offset: number | undefined;

        @computed('router.currentRouteName')
        get isLoadingRoute() {
            return this.router.currentRouteName.match(/loading$/);
        }

        @computed('model.length', 'limit')
        get pagesLoaded() {
            return Math.ceil(this.model.length / this.limit);
        }

        async _loadModels(reset: boolean) {
            this.set('isLoadingPage', true);
            if (reset) {
                this.clearModels();
            }

            const offset = this.offset;
            const limit = this.limit;
            const queryParams = buildQueryParams(this, offset, limit);
            let models = [];
            try {
                const result = (await this.fetchModels(queryParams)) as SearchQuery;
                models = result.toArray();
                setProperties(this, {
                    metadata: result.meta,
                    hasMore: models.length >= limit
                });

                tryInvoke(this.model, 'pushObjects', [models]);
            } catch (errors) {
                reject(errors);
            }

            this.set('isLoadingPage', false);
            return models;
        }

        /**
         * Override this method if more complex logic is necessary to retrieve the records
         * It should return a promise, which resolves to an array-like object (such as a DS.RecordArray)
         * @returns - the result of `store.query`
         */
        fetchModels(queryParams: any): SearchQuery {
            const modelName = this.modelName;
            return this.store.query(modelName, queryParams) as SearchQuery;
        }

        /**
         * Change the sorting and call `filterModels`. Will only load models if not currently making an API call
         * @param reset - Clear models
         * @returns - an array of models
         */
        loadModels(reset: boolean = false): Promise<any[]> | undefined {
            if (!this.isLoadingPage) {
                return this._loadModels(reset);
            } else {
                return;
            }
        }

        /**
         * Filter models
         * @returns - an array of models
         */
        filterModels() {
            return this.loadModels(true);
        }

        /**
         * Clears the sort array
         */
        clearSorting() {
            this.set('sort', A());
        }

        /**
         * Load another page of models
         * @returns - an array of models
         */
        @action
        loadMoreModels() {
            return this.loadModels();
        }

        /**
         * Clear and Reload models
         * @returns - an array of models
         */
        @action
        reloadModels() {
            return this.loadModels(true);
        }

        /**
         * Change the sorting and call `filterModels`
         * @param model - A `DS.Model` record
         * @returns - result of api call
         */
        @action
        async removeModel(model: DS.Model) {
            try {
                let result = await tryInvoke(model, 'destroyRecord');
                this.model.removeObject(model);
                return result;
            } catch (error) {
                return reject(error);
            }
        }

        /**
         * Clear models
         */
        @action
        clearModels() {
            this.set('model', A());
        }

        @action
        filter() {
            return this.filterModels();
        }

        /**
         * Change the sorting and call `filterModels`
         * @param sort - Array of strings
         * @param dir - The direction of the sort i.e `asc` or `desc`
         * @param isSorted - Is sorted
         * @returns - an array of models
         */
        @action
        changeSorting(sort: string[], dir: sortDirection, isSorted: boolean) {
            const sorting = this.sort;
            const sortedValue = `${dir === 'desc' ? '-' : ''}${sort}`;
            const oppositeSortedValue = `${dir === 'asc' ? '-' : ''}${sort}`;
            if (!isSorted) {
                sorting.removeObject(sortedValue);
                sorting.removeObject(oppositeSortedValue);
            } else if (!sorting.includes(oppositeSortedValue) && !sorting.includes(sortedValue)) {
                sorting.unshift(sortedValue);
            } else {
                //make the new sort column the first one in the list
                //so that its sent to the server as the primary sort
                sorting.removeObject(oppositeSortedValue);
                sorting.unshift(sortedValue);
            }
            return this.filterModels();
        }

        /**
         * Clears the filters and returns the updated model array
         * @returns - an array of models
         */
        @action
        clearFilters() {
            this.serverQueryParams.forEach((param: any) => this.set(param, null));
            return this.filterModels();
        }
    }

    return PaginationClass;
}
