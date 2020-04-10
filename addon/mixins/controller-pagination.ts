import { inject as service } from '@ember/service';
import { action, computed, setProperties } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';
import NativeArray from '@ember/array/-private/native-array';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import { buildQueryParams, PaginationController, sortDirection } from '@gavant/ember-pagination/utils/query-params';
import DS from 'ember-data';
import RouterService from '@ember/routing/router-service';

export type ConcreteSubclass<T> = new(...args: any[]) => T;

export default function ControllerPaginationClass<T extends ConcreteSubclass<any>>(ControllerSubclass: T) {
    class PaginationControllerClass extends ControllerSubclass {
        @service router!: RouterService;
        sort: NativeArray<any> = A();
        hasMore: boolean = true;
        limit: number = 10;
        isLoadingPage = false;
        pagingRootKey = 'page';
        filterRootKey = 'filter';
        includeKey = 'include';

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

        async _loadModels(this: PaginationController, reset: boolean) {
            this.set('isLoadingPage', true);
            if(reset) {
                this.clearModels();
            }

            const offset = this.offset;
            const limit = this.limit;
            const queryParams = buildQueryParams(this, offset, limit);
            let models = [];
            try {
                const result = await this.fetchModels(queryParams);
                models = result.toArray();
                setProperties(this, {
                    metadata: result.meta,
                    hasMore: models.length >= limit
                });

                tryInvoke(this.model, 'pushObjects', [models]);
            } catch(errors) {
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
        fetchModels(this: PaginationController, queryParams: any) {
            const modelName = this.modelName as never;
            return this.store.query(modelName, queryParams);
        }

        /**
         * Change the sorting and call `filterModels`. Will only load models if not currently making an API call
         * @param reset - Clear models
         * @returns - an array of models
         */
        loadModels(this: PaginationController, reset: boolean = false) {
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
        filterModels(this: PaginationController) {
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
        loadMoreModels(this: PaginationController) {
            return this.loadModels();
        }

        /**
         * Clear and Reload models
         * @returns - an array of models
         */
        @action
        reloadModels(this: PaginationController) {
            return this.loadModels(true);
        }

        /**
         * Change the sorting and call `filterModels`
         * @param model - A `DS.Model` record
         * @returns - result of api call
         */
        @action
        async removeModel(this: PaginationController, model: DS.Model) {
            try {
                let result = await tryInvoke(model, 'destroyRecord');
                this.model.removeObject(model);
                return result;
            } catch(error) {
                return reject(error);
            }
        }

        /**
         * Clear models
         */
        @action
        clearModels(this: PaginationController) {
            this.set('model', A());
        }

        @action
        filter(this: PaginationController) {
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
        changeSorting(this: PaginationController, sort: string[], dir: sortDirection, isSorted: boolean) {
            const sorting = this.sort;
            const sortedValue = `${dir === "desc" ? '-' : ''}${sort}`;
            const oppositeSortedValue = `${dir === "asc" ? '-' : ''}${sort}`;
            if(!isSorted) {
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
        clearFilters(this: PaginationController) {
            this.serverQueryParams.forEach((param: any) => this.set(param, null));
            return this.filterModels();
        }
    }

    return PaginationControllerClass;
}
