import DS from 'ember-data';
import { RouteParams } from 'gavant-pagination/utils/query-params';
import NativeArray from '@ember/array/-private/native-array';
export declare enum sortDirection {
    ascending = "asc",
    descending = "desc"
}
export default function controllerPagination<T extends ConcreteSubclass<any>>(ControllerSubclass: T): {
    new (...args: any[]): {
        [key: string]: any;
        sort: NativeArray<any>;
        hasMore: boolean;
        limit: number;
        modelName: string;
        metadata: any;
        serverQueryParams: any;
        isLoadingRoute: boolean;
        isLoadingModels: any;
        offset: any;
        pagesLoaded: any;
        loadModelsTask: any;
        fetchModels(queryParams: any): any;
        loadModels(reset?: boolean | undefined, params?: RouteParams | undefined): any;
        filterModels(): any;
        clearSorting(): void;
        loadMoreModels(): any;
        reloadModels(): any;
        removeModel(model: DS.Model): Promise<DS.Model>;
        clearModels(): void;
        filter(): any;
        changeSorting(sort: string[], dir: sortDirection, isSorted: boolean): any;
        clearFilters(): any;
    };
} & T;
