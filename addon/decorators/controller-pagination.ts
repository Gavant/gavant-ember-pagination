import DS from 'ember-data';
import { buildQueryParams, sortDirection } from '@gavant/ember-pagination/utils/query-params';
import { tryInvoke } from '@ember/utils';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import NativeArray from '@ember/array/-private/native-array';
import { action, computed, setProperties } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Router from '@ember/routing/router-service';

/**
 * Adds functionality to `setupController` / `resetController`. Be sure to call `super` in the respective methods to ensure this runs
 * @param controller - The controller you want the functionality to be added on to
 */
export default function controllerPagination<T extends ConcreteSubclass<any>>(ControllerSubclass: T) {
    class PaginationController extends ControllerSubclass {
        @service router!: Router;
        [key: string]: any;
        sort: NativeArray<any> = A();
        hasMore: boolean = true;
        limit: number = 10;
        modelName: string = '';
        metadata: any;
        serverQueryParams: any;
        isLoadingPage = false;

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

        fetchModels(queryParams: any) {
            const modelName = this.modelName as never;
            return this.store.query(modelName, queryParams);
        }

        loadModels(reset: boolean = false) {
            if (!this.isLoadingPage) {
                return this._loadModels(reset);
            } else {
                return;
            }
        }

        filterModels() {
            return this.loadModels(true);
        }

        clearSorting() {
            this.set('sort', A());
        }

        @action
        loadMoreModels() {
            return this.loadModels();
        }

        @action
        reloadModels() {
            return this.loadModels(true);
        }

        @action
        async removeModel(model: DS.Model) {
            try {
                let result = await tryInvoke(model, 'destroyRecord');
                this.model.removeObject(model);
                return result;
            } catch(error) {
                return reject(error);
            }
        }

        @action
        clearModels() {
            this.set('model', A());
        }

        @action
        filter() {
            return this.filterModels();
        }

        @action
        changeSorting(sort: string[], dir: sortDirection, isSorted: boolean) {
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

        @action
        clearFilters() {
            this.serverQueryParams.forEach((param: string) => this.set(param, null));
            return this.filterModels();
        }
    }
    return PaginationController;
}
