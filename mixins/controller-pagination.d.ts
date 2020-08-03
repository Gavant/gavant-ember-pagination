import DS from 'ember-data';
import Controller from '@ember/controller';
export declare type ConcreteSubclass<T> = new (...args: any[]) => T;
export declare type PaginationControllerClass = ConcreteSubclass<PaginationController>;
export interface PaginationController extends Controller {
    offset: number | undefined;
    limit: number;
    sort: string[];
    hasMore: boolean;
    modelName: string;
    isLoadingPage: boolean;
    pagingRootKey: string | null;
    filterRootKey: string | null;
    includeKey: string;
    fetchModels(queryParams: any): DS.AdapterPopulatedRecordArray<any> & DS.PromiseArray<any>;
    clearModels(): void;
    _loadModels(reset: boolean): Promise<any[]>;
    loadModels(reset: boolean): Promise<any[]> | undefined;
    filterModels(): Promise<any[]> | undefined;
    reloadModels(): Promise<any[]> | undefined;
    metadata?: {
        [key: string]: any;
    };
    serverQueryParams?: any[];
    serverDateFormat?: string;
}
interface ArrayMeta {
    meta: any;
}
export declare type SearchQuery = DS.AdapterPopulatedRecordArray<any> & DS.RecordArray<any> & DS.PromiseArray<any> & ArrayMeta;
export declare function ControllerPagination<U extends ConcreteSubclass<Controller>>(ControllerSubclass: U): PaginationControllerClass;
export {};
