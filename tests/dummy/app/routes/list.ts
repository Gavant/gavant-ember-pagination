import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import ListController from '../controllers/list';
import Customer from '../models/customer';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

export default class List extends Route {
    @service store!: DS.Store;

    model(this: any) {
        const controller = this.controllerFor(this.routeName) as ListController;
        const params = buildQueryParams({
            context: controller,
            sorts: controller.sortsOne,
            filterList: ['foo', 'bar', 'baz'],
            includeList: ['someRel', 'anotherRel.foo'],
        });

        return this.store.query('customer', params);
    }

    setupController(controller: ListController, model: RecordArrayWithMeta<Customer>) {
        controller.paginator = usePagination<Customer>({
            context: controller,
            modelName: 'customer',
            rows: model.toArray(),
            metadata: model.meta,
            limit: 9,
            sorts: controller.sortsOne,
            filterList: ['foo', 'bar', 'baz'],
            includeList: ['someRel', 'anotherRel.foo'],
            onChangeSorting: controller.onChangeSortingOne
        });

        controller.paginatorTwo = usePagination<Customer>({
            context: controller,
            modelName: 'customer',
            rows: model.toArray(),
            metadata: model.meta,
            limit: 9,
            sorts: controller.sortsTwo,
            filterList: ['foo', 'bar', 'baz', 'customFilter:mappedFilter'],
            includeList: ['yetAnotherRel', 'imSomethingElse']
        });

        super.setupController(controller, model);
    }

    resetController(controller: ListController, isExiting: boolean, transition: any) {
        super.resetController(controller, isExiting, transition);
        controller.paginator.reset();
        controller.paginatorTwo.reset();
    }
}
