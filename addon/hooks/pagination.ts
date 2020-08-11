import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import NativeArray from '@ember/array/-private/native-array';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import DS from 'ember-data';
import RouterService from '@ember/routing/router-service';

import { buildQueryParams, QueryParamsObj  } from '@gavant/ember-pagination/utils/query-params';

export type RecordArrayWithMeta<T> = DS.AdapterPopulatedRecordArray<T> & { meta: any };

export interface ResponseMetadata {
    totalCount: number;
}

export interface Sorting {
    valuePath: string;
    sortPath?: string;
    isAscending: boolean;
}

export interface PaginationConfigs {
    limit?: number;
    filterList?: string[];
    includeList?: string[];
    pagingRootKey?: string | null;
    filterRootKey?: string | null;
    includeKey?: string;
    sortKey?: string;
    serverDateFormat?: string;
    processQueryParams?: (params: QueryParamsObj) => QueryParamsObj;
    onChangeSorting?: (sorts: string[], newSorts?: Sorting[]) => Promise<string[] | undefined> | void;
}

export interface PaginationArgs<T extends DS.Model, M = ResponseMetadata>  extends PaginationConfigs {
    context: any;
    modelName: string;
    models: NativeArray<T> | T[];
    metadata?: M;
    sorts?: string[];
}

export class Pagination<T extends DS.Model, M = ResponseMetadata> {
    @service store!: DS.Store;
    @service router!: RouterService;

    config: PaginationConfigs = {
        filterList: [],
        includeList: [],
        limit: 20,
        pagingRootKey: 'page',
        filterRootKey: 'filter',
        includeKey: 'include',
        sortKey: 'sort',
        serverDateFormat: 'YYYY-MM-DDTHH:mm:ss'
    };

    context: any;
    modelName: string;
    sorts: string[] | undefined = [];
    @tracked models: NativeArray<T> | T[] = A();
    @tracked metadata: M | undefined;
    @tracked hasMore: boolean = true;
    @tracked isLoading: boolean = false;

    get isLoadingRoute() {
        return this.router.currentRouteName.match(/loading$/);
    }

    get isLoadingModels() {
        return this.isLoading || this.isLoadingRoute;
    }

    get offset() {
        return this.models.length;
    }

    /**
     * Sets the initial pagination data/configuration which at minimum, requires
     * a context, modelName, and initial models/metadata
     * @param {PaginationArgs<T, M>} args
     */
    constructor(args: PaginationArgs<T, M>) {
        //set main paginator state
        this.context = args.context;
        this.modelName = args.modelName;
        this.metadata = args.metadata;
        this.sorts = args.sorts;
        this.models = A(args.models);

        //set configs from initial args
        delete args.context;
        delete args.modelName;
        delete args.models;
        delete args.metadata;
        delete args.sorts;
        this.setConfigs(args);
    }

    /**
     * Sets various pagination configurations
     * @param {PaginationConfigs} args
     */
    @action
    setConfigs(config: PaginationConfigs) {
        this.config = { ...this.config,  ...config };
        this.hasMore = this.models.length >= this.config.limit!;
    }

    /**
     * Utility method for completely replacing the current models array/metadata
     * @param {NativeArray<T> | T[]} models
     * @param {M} metadata
     */
    @action
    setModels(models: NativeArray<T> | T[], metadata?: M) {
        this.models = models;
        this.metadata = metadata;
    }

    /**
     * Builds the query params object and makes the request for the next
     * page of results (or the first page, if reset is true)
     * @param {Boolean} reset
     * @returns {Promise<T[]>}
     */
    @action
    async loadModels(reset = false): Promise<T[]> {
        if(reset) {
            this.clearModels();
        }

        const queryParams = buildQueryParams({
            context: this.context,
            offset: this.offset,
            sorts: this.sorts,
            limit: this.config.limit,
            filterList: this.config.filterList,
            includeList: this.config.includeList,
            pagingRootKey: this.config.pagingRootKey,
            filterRootKey: this.config.filterRootKey,
            includeKey: this.config.includeKey,
            sortKey: this.config.sortKey,
            serverDateFormat: this.config.serverDateFormat,
            processQueryParams: this.config.processQueryParams
        });

        try {
            this.isLoading = true;
            const result = await this.queryModels(queryParams);
            const models = result.toArray();
            this.hasMore = models.length >= this.config.limit!;
            this.metadata = result.meta;
            this.models.pushObjects(models);
            return models;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Makes the store.query() request using the provided query params object
     * @param {any} queryParams
     * @returns {Promise<RecordArrayWithMeta<T>>}
     */
    @action
    async queryModels(queryParams: any): Promise<RecordArrayWithMeta<T>> {
        const results = await this.store.query(this.modelName, queryParams) as RecordArrayWithMeta<T>;
        return results;
    }

    /**
     * Loads the next page of models if there are more to load and is not currently loading
     * @returns {Promise<T[]> | null}
     */
    @action
    loadMoreModels(): Promise<T[]> | undefined {
        if (this.hasMore && !this.isLoadingModels) {
            return this.loadModels();
        }

        return undefined;
    }

    /**
     * Reloads the first page of models, alias for `loadModels(true)`
     * @returns {Promise<T[]>}
     */
    @action
    reloadModels() {
        return this.loadModels(true);
    }

    /**
     * Reloads the first page of models w/filters applied, alias for `loadModels(true)`
     * @returns {Promise<T[]>}
     */
    @action
    filterModels() {
        return this.loadModels(true);
    }

    /**
     * Clears all current model models array
     */
    @action
    clearModels() {
        this.models = A();
    }

    /**
     * Deletes the model and removes it from the models array
     * @param {T} model
     * @returns {Promise<void>}
     */
    @action
    async removeModel(model: T) {
        const result = await model.destroyRecord();
        this.models.removeObject(result);
        return result;
    }

    /**
     * Updates the current sorts, calls an onChangeSorting() handler if provided
     * and reloads the first page of models
     * @param {Sorting[]} newSorts
     */
    @action
    async changeSorting(newSorts: Sorting[]) {
        this.sorts = newSorts.map((col) =>
            `${!col.isAscending ? '-' : ''}${col.sortPath ?? col.valuePath}`
        );

        //allow the parent context to store and/or modify updates to sorts
        if(this.config.onChangeSorting) {
            const processedSorts = await this.config.onChangeSorting(this.sorts, newSorts);
            if(processedSorts) {
                this.sorts = processedSorts;
            }
        }

        return this.reloadModels();
    }

    /**
     * Clears the current sorts and reloads the first page of models
     */
    @action
    clearSorting() {
        return this.changeSorting([]);
    }

    /**
     * Clears all models from the models array and resets the current state
     * Sometimes useful in resetController() when the pagination may not
     * be recreated/overwritten on every transition, and you want to clear
     * it when leaving the page.
     */
    @action
    reset() {
        this.clearModels();
        this.hasMore = true;
        this.isLoading = false;
    }
}

/**
 * Creates and returns a new Pagination instance and binds its owner to be the same as
 * that of its parent "context" (e.g. Controller, Component, etc).
 * In most cases, this returned instance should be assigned to a @tracked property
 * on its parent context, so that it can be accessed on the associated template
 * @param {PaginationArgs} args
 */
const usePagination = <T extends DS.Model, M = ResponseMetadata>(args: PaginationArgs<T, M>) => {
    const owner = getOwner(args.context);
    const paginator = new Pagination<T, M>(args);
    setOwner(paginator, owner);
    return paginator;
};

export default usePagination;
