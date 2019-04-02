import Controller from '@ember/controller';
import DS from 'ember-data';
import { readOnly, or } from '@ember/object/computed';
import { divide, bool } from 'ember-awesome-macros';
import match from 'ember-awesome-macros/string/match';
import ceil from 'ember-awesome-macros/math/ceil';
import { task } from 'ember-concurrency';
import { RouteParams, buildQueryParams } from '../utils/query-params';
import { tryInvoke } from '@ember/utils';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import NativeArray from '@ember/array/-private/native-array';
import { action } from '@ember/object';

enum sortDirection {
    ascending = "asc",
    descending = "desc"
}

type ConcreteSubclass<T> = new(...args: any[]) => T;

export default function controllerPagination<T extends ConcreteSubclass<Controller>>(ControllerSubclass: T) {
    class PaginationController extends ControllerSubclass {
        [key: string]: any;
        sort: NativeArray<any> = A();
        hasMore: boolean = true;
        limit: number = 10;
        modelName: string = '';
        metadata: any;
        serverQueryParams: any;

        isLoadingRoute: boolean = bool(match('router.currentRouteName', /loading$/));
        isLoadingModels: any = or('loadModelsTask.isRunning', 'isLoadingRoute');
        offset: any = readOnly('model.length');
        pagesLoaded: any = ceil(divide('model.length', 'limit'));

        @task(function * (this: PaginationController, reset: boolean, params: RouteParams) {
            // get(this, 'loadingBar').start();
            if(reset) {
                this.clearModels();
            }

            const offset = this.offset;
            const limit = this.limit;
            const queryParams = buildQueryParams(this, params, offset, limit);
            const result = yield this.fetchModels(queryParams);
            const models = result.toArray();

            this.metadata = result.meta;
            this.hasMore = models.length >= limit;

            tryInvoke(this.model, 'pushObjects', [models]);
            // get(this, 'loadingBar').stop();
            return models;
        }).restartable() loadModelsTask: any;

        fetchModels(queryParams: any) {
            const modelName = this.modelName as never;
            return this.store.query(modelName, queryParams);
        }

        loadModels(reset?: boolean, params?: RouteParams) {
            return this.loadModelsTask.perform(reset, params);
        }

        filterModels() {
            return this.loadModels(true);
        }

        clearSorting() {
            this.sort = A();
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
            this.model = A();
            // set(this, 'model', A());
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
            this.serverQueryParams.forEach((param: string) => this[param] = null);
            // get(this, 'serverQueryParams').forEach((param) => set(this, param, null));
            return this.filterModels();
        }
    }
    return PaginationController;
}
