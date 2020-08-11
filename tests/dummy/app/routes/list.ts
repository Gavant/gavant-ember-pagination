import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import ListController from '../controllers/list';
import Customer from '../models/customer';

const filters = ['foo', 'bar', 'baz'];
const includes = ['someRel', 'anotherRel.foo'];

export default class List extends Route {
    @service store!: DS.Store;

    model(this: any) {
        const controller = this.controllerFor(this.routeName) as ListController;
        const params = buildQueryParams({
            context: controller,
            sorts: controller.sorts,
            filterList: filters,
            includeList: includes,
            processQueryParams: controller.processQueryParams
        });

        return this.store.query('customer', params);
    }

    setupController(controller: ListController, model: RecordArrayWithMeta<Customer>) {
        controller.paginator = usePagination<Customer>({
            context: controller,
            modelName: 'customer',
            models: model.toArray(),
            metadata: model.meta,
            limit: 9,
            sorts: controller.sorts,
            filterList: filters,
            includeList: includes,
            onChangeSorting: controller.onChangeSorting,
            processQueryParams: controller.processQueryParams
        });

        controller.paginatorTwo = usePagination<Customer>({
            context: controller,
            modelName: 'customer',
            models: model.toArray(),
            metadata: model.meta,
            limit: 9,
            sorts: controller.sortsTwo,
            filterList: ['foo', 'bar', 'baz', 'customFilter:mappedFilter'],
            includeList: ['yetAnotherRel', 'imSomethingElse'],
            processQueryParams: controller.processQueryParams
        });

        super.setupController(controller, model);
    }

    resetController(controller: ListController, isExiting: boolean, transition: any) {
        super.resetController(controller, isExiting, transition);
        controller.paginator.reset();
        controller.paginatorTwo.reset();
    }
}
