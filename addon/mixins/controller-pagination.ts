import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { readOnly, or } from '@ember/object/computed';
import { tryInvoke } from '@ember/utils';
import { reject } from 'rsvp';
import { A } from '@ember/array';
import { task } from 'ember-concurrency';
import { math, divide, string, bool } from 'ember-awesome-macros';
import QueryParams from 'glasses/mixins/query-params';

export default Mixin.create(QueryParams, {
    router: service(),
    loadingBar: service(),
    sort: A(),
    hasMore: true,
    limit: 10,

    isLoadingRoute: bool(string.match('router.currentRouteName', /loading$/)),
    isLoadingModels: or('loadModelsTask.isRunning', 'isLoadingRoute'),
    offset: readOnly('model.length'),
    pagesLoaded: math.ceil(divide('model.length', 'limit')),

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
    }).restartable(),

    //override this method if more complex logic is necessary to retrieve the records
    //it should return a promise, which resolves to an array-like object (such as a DS.RecordArray)
    fetchModels(queryParams) {
        const modelName = get(this, 'modelName');
        return get(this, 'store').query(modelName, queryParams);
    },

    loadModels(reset, params) {
        return get(this, 'loadModelsTask').perform(reset, params);
    },

    clearModels() {
        set(this, 'model', A());
    },

    reloadModels() {
        return this.loadModels(true);
    },

    loadMoreModels() {
        return this.loadModels();
    },

    async removeModel(row) {
        try {
            let model = get(row, 'content');
            let result = await tryInvoke(model, 'destroyRecord');
            get(this, 'model').removeObject(model);
            return result;
        } catch(error) {
            return reject(error);
        }
    },

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
    },

    filterModels() {
        return this.loadModels(true);
    },

    clearFilters() {
        get(this, 'serverQueryParams').forEach((param) => set(this, param, null));
        return this.filterModels();
    },

    clearSorting() {
        set(this, 'sort', A());
    },

    actions: {
        loadMoreModels() {
            return this.loadMoreModels();
        },

        reloadModels() {
            return this.reloadModels();
        },

        removeModel(row) {
            return this.removeModel(row);
        },

        clearModels() {
            this.clearModels();
        },

        filter() {
            return this.filterModels();
        },

        changeSorting(sort, dir, isSorted) {
            return this.changeSorting(sort, dir, isSorted);
        },
        clearFilters() {
            return this.clearFilters();
        }
    }
});
