import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, set, setProperties, computed } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import { buildQueryParams, PaginationController, RouteParams, sortDirection } from 'gavant-pagination/utils/query-params';

export default Mixin.create({
    router: service(),
    loadingBar: service(),
    sort: A(),
    hasMore: true,
    limit: 10,
    isLoadingPage: false,

    isLoadingRoute: computed('router.currentRouteName', function() {
         return get(this, 'router.currentRouteName').match(/loading$/);
    }),
    isLoadingModels: or('isLoadingPage', 'isLoadingRoute'),
    offset: readOnly('model.length'),
    pagesLoaded: computed('model.length', 'limit', function() {
         return Math.ceil(get(this, 'model.length') / get(this, 'limit'));
    }),

    async _loadModels(this: PaginationController, reset: boolean, params: RouteParams | undefined) {
        set(this, 'isLoadingPage', true);
        if(reset) {
            this.clearModels();
        }

        const offset = get(this, 'offset');
        const limit = get(this, 'limit');
        const queryParams = buildQueryParams(this, params, offset, limit);
        let models = [];
        try {
            const result = await this.fetchModels(queryParams);
            models = result.toArray();

            setProperties(this, {
                metadata: get(result, 'meta'),
                hasMore: get(models, 'length') >= limit
            });

            tryInvoke(get(this, 'model'), 'pushObjects', [models]);
        } catch(errors) {
            reject(errors);
        }
        set(this, 'isLoadingPage', false);
        return models;
    },

    // loadModelsTask: task(function * (reset, params) {
    //     get(this, 'loadingBar').start();
    //     if(reset) {
    //         this.clearModels();
    //     }
    //
    //     const offset = get(this, 'offset');
    //     const limit = get(this, 'limit');
    //     const queryParams = this.buildQueryParams(this, params, offset, limit);
    //     const result = yield this.fetchModels(queryParams);
    //     const models = result.toArray();
    //
    //     setProperties(this, {
    //         metadata: get(result, 'meta'),
    //         hasMore: get(models, 'length') >= limit
    //     });
    //
    //     tryInvoke(get(this, 'model'), 'pushObjects', [models]);
    //     get(this, 'loadingBar').stop();
    //     return models;
    // }).restartable(),

    //override this method if more complex logic is necessary to retrieve the records
    //it should return a promise, which resolves to an array-like object (such as a DS.RecordArray)
    fetchModels(this: PaginationController, queryParams: any) {
        const modelName = get(this, 'modelName');
        return get(this, 'store').query(modelName, queryParams);
    },

    loadModels(this: PaginationController, reset: boolean, params: RouteParams) {
        if (!get(this, 'isLoadingPage')) {
            return this._loadModels(reset, params);
        } else {
            return;
        }
    },

    clearModels(this: PaginationController) {
        set(this, 'model', A());
    },

    reloadModels(this: PaginationController) {
        return this.loadModels(true);
    },

    loadMoreModels(this: PaginationController) {
        return this.loadModels();
    },

    async removeModel(this: PaginationController, row: any) {
        try {
            let model = get(row, 'content');
            let result = await tryInvoke(model, 'destroyRecord');
            get(this, 'model').removeObject(model);
            return result;
        } catch(error) {
            return reject(error);
        }
    },

    changeSorting(this: PaginationController, sort: string[], dir: sortDirection, isSorted: boolean) {
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
    },

    filterModels(this: PaginationController) {
        return this.loadModels(true);
    },

    clearFilters(this: PaginationController) {
        get(this, 'serverQueryParams').forEach((param: any) => set(this, param, null));
        return this.filterModels();
    },

    clearSorting() {
        set(this, 'sort', A());
    },

    actions: {
        loadMoreModels(this: PaginationController) {
            return this.loadMoreModels();
        },

        reloadModels(this: PaginationController) {
            return this.reloadModels();
        },

        removeModel(this: PaginationController, row: any) {
            return this.removeModel(row);
        },

        clearModels(this: PaginationController) {
            this.clearModels();
        },

        filter(this: PaginationController) {
            return this.filterModels();
        },

        changeSorting(this: PaginationController, sort: string[], dir: sortDirection, isSorted: boolean) {
            return this.changeSorting(sort, dir, isSorted);
        },
        clearFilters(this: PaginationController) {
            return this.clearFilters();
        }
    }
});
