import Controller from '@ember/controller';
import { readOnly, or } from '@ember/object/computed';
import { math, divide, string, bool } from 'ember-awesome-macros';
import { task } from 'ember-concurrency';

type ConcreteSubclass<T> = new(...args: any[]) => T;
export default function controllerPagination<T extends ConcreteSubclass<Controller>>(ControllerSubclass: T) {
    class PaginationController extends ControllerSubclass {
        sort: [] = [];
        hasMore: boolean = true;
        limit: number = 10;

        isLoadingRoute: boolean = bool(string.match('router.currentRouteName', /loading$/));
        isLoadingModels: boolean = or('loadModelsTask.isRunning', 'isLoadingRoute');
        offset: number = readOnly('model.length');
        pagesLoaded: number = math.ceil(divide('model.length', 'limit'));

        loadModelsTask: task(function * (reset, params) {
            get(this, 'loadingBar').start();
            if(reset) {
                this.clearModels();
            }

            const offset = get(this, 'offset');
            const limit = get(this, 'limit');
            const queryParams = this.buildQueryParams(this, params, offset, limit);
            const result = yield this.fetchModels(queryParams);
            const models = result.toArray();

            setProperties(this, {
                metadata: get(result, 'meta'),
                hasMore: get(models, 'length') >= limit
            });

            tryInvoke(get(this, 'model'), 'pushObjects', [models]);
            get(this, 'loadingBar').stop();
            return models;
        }).restartable()


        fetchModels(queryParams) {
            const modelName = get(this, 'modelName');
            return get(this, 'store').query(modelName, queryParams);
        }

        loadModels(reset, params) {
            return get(this, 'loadModelsTask').perform(reset, params);
        }

        clearModels() {
            set(this, 'model', A());
        }

        reloadModels() {
            return this.loadModels(true);
        }

        loadMoreModels() {
            return this.loadModels();
        }

        async removeModel(row) {
            try {
                let model = get(row, 'content');
                let result = await tryInvoke(model, 'destroyRecord');
                get(this, 'model').removeObject(model);
                return result;
            } catch(error) {
                return reject(error);
            }
        }

        changeSorting(sort, dir, isSorted) {
            const sorting = get(this, 'sort');
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

        filterModels() {
            return this.loadModels(true);
        }

        clearFilters() {
            get(this, 'serverQueryParams').forEach((param) => set(this, param, null));
            return this.filterModels();
        }

        clearSorting() {
            set(this, 'sort', A());
        }

    }
    return PaginationController;
}
