import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import NativeArray from '@ember/array/-private/native-array';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import DS from 'ember-data';

import { buildQueryParams  } from '@gavant/ember-pagination/utils/query-params';

export class Pagination<T extends DS.Model> {
    @service store!: DS.Store;

    modelName: string;
    limit: number;
    serverQueryParams: string[] = [];
    include: string[] = [];
    sort: string[] = [];

    pagingRootKey: string | null = 'page';
    filterRootKey: string | null = 'filter';
    includeKey: string = 'include';
    serverDateFormat: string = 'YYYY-MM-DDTHH:mm:ss';

    @tracked rows: NativeArray<T> = A();
    //TODO better default typing for metadata, allow passing in custom metadata interface type arg
    @tracked metadata: any = {};
    @tracked hasMore: boolean = true;
    @tracked isLoading: boolean = false;

    get offset() {
        return this.rows.length;
    }

    constructor(modelName: string, initialRows: NativeArray<T> | T[], initialMetadata: any, limit: number) {
        this.modelName = modelName;
        this.rows = A(initialRows);
        this.metadata = initialMetadata;
        this.limit = limit;
        this.hasMore = this.rows.length >= this.limit;
    }

    @action
    async loadModels(reset = false) {
        if(reset) {
            this.clearModels();
        }

        const offset = this.offset;
        const limit = this.limit;
        //TODO allow passing in a custom query param "processor" function to buildQueryParams()
        //that is given the final built params/offset/limit values and can  return a new object

        //TODO need to handle grabbing current controller queryParam values and other serverQueryParam filters
        const queryParams = buildQueryParams<T>(this, offset, limit);

        try {
            this.isLoading = true;
            //TODO beforeLoad/afterLoad hooks
            const result = await this.queryModels(queryParams);
            const rows = result.toArray();
            this.hasMore = rows.length >= limit;
            //@ts-ignore TODO meta does exist, or is `result` typed wrong?
            this.metadata = result.meta ?? {};
            this.rows.pushObjects(rows);
            return rows;
        } finally {
            this.isLoading = false;
        }
    }

    @action
    queryModels(queryParams: any): DS.AdapterPopulatedRecordArray<T> {
        //TODO if provided, call method that provides custom query records logic instead
        return this.store.query(this.modelName, queryParams);
    }

    @action
    loadMoreModels() {
        if (this.hasMore && !this.isLoading) {
            return this.loadModels();
        }

        return null;
    }

    @action
    reloadModels() {
        return this.loadModels(true);
    }

    @action
    filterModels() {
        return this.loadModels(true);
    }

    @action
    clearModels() {
        this.rows = A();
    }

    @action
    changeSorting() {
        //TODO ember-table compatible update action
    }
}

//TODO additional hooks/customization properties (convert args to a single object?)
const usePagination = <T extends DS.Model>(
    parent: any,
    modelName: string,
    rows: NativeArray<T> | T[],
    metadata: any,
    limit: number = 20,
) => {
    const owner = getOwner(parent);
    const paginator = new Pagination<T>(modelName, rows, metadata, limit)
    setOwner(paginator, owner)
    return paginator;
};

export default usePagination;
