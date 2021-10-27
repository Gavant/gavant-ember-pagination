import NativeArray from '@ember/array/-private/native-array';
import RouterService from '@ember/routing/router-service';
import DS from 'ember-data';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
export declare type RecordArrayWithMeta<T> = DS.AdapterPopulatedRecordArray<T> & {
    meta: any;
};
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
export interface PaginationArgs<T extends DS.Model, M = ResponseMetadata> extends PaginationConfigs {
    context: any;
    modelName: string;
    models: NativeArray<T> | T[];
    metadata?: M;
    sorts?: string[];
}
export declare class Pagination<T extends DS.Model, M = ResponseMetadata> {
    store: DS.Store;
    router: RouterService;
    /**
     * Configuration properties used to customize request parameters
     * @type {PaginationConfigs}
     * @memberof Pagination
     */
    config: PaginationConfigs;
    /**
     * The parent context object, usually a Controller or Component
     * @type {*}
     * @memberof Pagination
     */
    context: any;
    /**
     * The name of Ember Data model being paginated
     * @type {String}
     * @memberof Pagination
     */
    modelName: string;
    /**
     * An array of sort property names sent on requests to sort the results
     * @type {(String[] | undefined)}
     * @memberof Pagination
     */
    sorts: string[] | undefined;
    /**
     * The array of all the models currently loaded from pagination requests
     * @type {(NativeArray<T> | T[])}
     * @memberof Pagination
     */
    models: NativeArray<T> | T[];
    /**
     * The current metadata returned by the most recent pagination request
     * @type {(M | undefined)}
     * @memberof Pagination
     */
    metadata: M | undefined;
    /**
     * Whether or not the API may have more results, based on the defined limit
     * and the number of results returned by the last request
     * @type {Boolean}
     * @memberof Pagination
     */
    hasMore: boolean;
    /**
     * Tracks when a pagination request is currently in progress
     * Templates and application code should use `isLoadingModels` instead
     * @private
     * @type {Boolean}
     * @memberof Pagination
     */
    private isLoading;
    /**
     * Whether or not a loading substate route is currently rendered
     * @readonly
     * @type {Boolean}
     * @memberof Pagination
     */
    get isLoadingRoute(): boolean;
    /**
     * Returns true if a pagination request is currently in progress
     * or a loading substate route is rendered. This should be used
     * in templates/app code to check if the paginator is "loading"
     * @readonly
     * @type {Boolean}
     * @memberof Pagination
     */
    get isLoadingModels(): boolean;
    /**
     * The current offset to send in pagination requests,
     * based on the number of already loaded models
     * @readonly
     * @type {Number}
     * @memberof Pagination
     */
    get offset(): number;
    /**
     * Sets the initial pagination data/configuration which at minimum, requires
     * a context, modelName, and initial models/metadata
     * @param {PaginationArgs<T, M>} args
     */
    constructor(args: PaginationArgs<T, M>);
    /**
     * Sets various pagination configurations
     * @param {PaginationConfigs} args
     * @memberof Pagination
     */
    setConfigs(config: PaginationConfigs): void;
    /**
     * Utility method for completely replacing the current models array/metadata
     * @param {NativeArray<T> | T[]} models
     * @param {M} metadata
     * @memberof Pagination
     */
    setModels(models: NativeArray<T> | T[], metadata?: M): void;
    /**
     * Builds the query params object and makes the request for the next
     * page of results (or the first page, if reset is true)
     * @param {Boolean} reset
     * @param {Boolean} clearAfterRequest
     * @returns {Promise<T[]>}
     * @memberof Pagination
     */
    loadModels(reset?: boolean, clearAfterRequest?: boolean): Promise<T[]>;
    /**
     * Makes the store.query() request using the provided query params object
     * @param {any} queryParams
     * @returns {Promise<RecordArrayWithMeta<T>>}
     * @memberof Pagination
     */
    queryModels(queryParams: any): Promise<RecordArrayWithMeta<T>>;
    /**
     * Loads the next page of models if there are more to load and is not currently loading
     * @returns {Promise<T[]> | null}
     * @memberof Pagination
     */
    loadMoreModels(): Promise<T[]>;
    /**
     * Reloads the first page of models, alias for `loadModels(true)`
     * @param {Boolean} clearAfterRequest
     * @returns {Promise<T[]>}
     * @memberof Pagination
     */
    reloadModels(clearAfterRequest?: boolean): Promise<T[]>;
    /**
     * Reloads the first page of models w/filters applied, alias for `loadModels(true)`
     * @param {Boolean} clearAfterRequest
     * @returns {Promise<T[]>}
     * @memberof Pagination
     */
    filterModels(clearAfterRequest?: boolean): Promise<T[]>;
    /**
     * Clears all current model models array
     * @memberof Pagination
     */
    clearModels(): void;
    /**
     * Deletes the model and removes it from the models array
     * @param {T} model
     * @returns {Promise<void>}
     * @memberof Pagination
     */
    removeModel(model: T): Promise<T>;
    /**
     * Updates the current sorts, calls an onChangeSorting() handler if provided
     * and reloads the first page of models
     * @param {Sorting[]} newSorts
     * @memberof Pagination
     */
    changeSorting(newSorts: Sorting[]): Promise<T[]>;
    /**
     * Clears the current sorts and reloads the first page of models
     * @memberof Pagination
     */
    clearSorting(): Promise<T[]>;
    /**
     * Clears all models from the models array and resets the current state
     * Sometimes useful in resetController() when the pagination may not
     * be recreated/overwritten on every transition, and you want to clear
     * it when leaving the page.
     * @memberof Pagination
     */
    reset(): void;
}
/**
 * Creates and returns a new Pagination instance and binds its owner to be the same as
 * that of its parent "context" (e.g. Controller, Component, etc).
 * In most cases, this returned instance should be assigned to a @tracked property
 * on its parent context, so that it can be accessed on the associated template
 * @param {PaginationArgs} args
 */
declare const usePagination: <T extends DS.Model, M = ResponseMetadata>(args: PaginationArgs<T, M>) => Pagination<T, M>;
export default usePagination;
