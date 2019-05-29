import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, set, setProperties, computed } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import { buildQueryParams, PaginationController, sortDirection } from '@gavant/ember-pagination/utils/query-params';
import DS from 'ember-data';

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

    async _loadModels(this: PaginationController, reset: boolean) {
        set(this, 'isLoadingPage', true);
        if(reset) {
            this.clearModels();
        }

        const offset = get(this, 'offset');
        const limit = get(this, 'limit');
        const queryParams = buildQueryParams(this, offset, limit);
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

    /**
     * Override this method if more complex logic is necessary to retrieve the records
     * It should return a promise, which resolves to an array-like object (such as a DS.RecordArray)
     * @returns - the result of `store.query`
     */
    fetchModels(this: PaginationController, queryParams: any) {
        const modelName = get(this, 'modelName');
        return get(this, 'store').query(modelName, queryParams);
    },

    /**
     * Change the sorting and call `filterModels`. Will only load models if not currently making an API call
     * @param reset - Clear models
     * @returns - an array of models
     */
    loadModels(this: PaginationController, reset: boolean) {
        if (!get(this, 'isLoadingPage')) {
            return this._loadModels(reset);
        } else {
            return [];
        }
    },

    /**
     * Clear models
     */
    clearModels(this: PaginationController) {
        set(this, 'model', A());
    },

    /**
     * Clear and Reload models
     * @returns - an array of models
     */
    reloadModels(this: PaginationController) {
        return this.loadModels(true);
    },

    /**
     * Load another page of models
     * @returns - an array of models
     */
    loadMoreModels(this: PaginationController) {
        return this.loadModels();
    },

    /**
     * Change the sorting and call `filterModels`
     * @param model - A `DS.Model` record
     * @returns - result of api call
     */
    async removeModel(this: PaginationController, model: DS.Model) {
        try {
            let result = await tryInvoke(model, 'destroyRecord');
            get(this, 'model').removeObject(model);
            return result;
        } catch(error) {
            return reject(error);
        }
    },

    /**
     * Change the sorting and call `filterModels`
     * @param sort - Array of strings
     * @param dir - The direction of the sort i.e `asc` or `desc`
     * @param isSorted - Is sorted
     * @returns - an array of models
     */
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

    /**
     * Filter models
     * @returns - an array of models
     */
    filterModels(this: PaginationController) {
        return this.loadModels(true);
    },

    /**
     * Clears the filters and returns the updated model array
     * @returns - an array of models
     */
    clearFilters(this: PaginationController) {
        get(this, 'serverQueryParams').forEach((param: any) => set(this, param, null));
        return this.filterModels();
    },

    /**
     * Clears the sort array
     */
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
