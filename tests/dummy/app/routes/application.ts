import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import ApplicationController from '../controllers/application';
import Customer from '../models/customer';
import usePagination from '@gavant/ember-pagination/hooks/pagination';

export default class Application extends Route {
    @service store!: DS.Store;

    model(this: any) {
        const controller = this.controllerFor(this.routeName);
        //TODO allow passing in a custom query param "processor" function to buildQueryParams()
        //that is given the final built params/offset/limit values and can  return a new object
        const params = buildQueryParams(controller);
        return this.store.query('customer', params);
    }

    setupController(controller: ApplicationController, model: DS.AdapterPopulatedRecordArray<Customer>) {
        //@ts-ignore TODO model.meta does exist, or is `result` typed wrong?
        controller.paginator = usePagination<Customer>(this, 'customer', model.toArray(), model.meta, 9);

        //@ts-ignore TODO model.meta does exist, or is `result` typed wrong?
        controller.paginatorTwo = usePagination<Customer>(this, 'customer', model.toArray(), model.meta, 9);

        super.setupController(controller, model);
    }
}
