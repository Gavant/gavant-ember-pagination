import Route from '@ember/routing/route';
import { RoutePagination } from '@gavant/ember-pagination/mixins/route-pagination';

export default class Application extends RoutePagination(Route) {
    model(this: any) {
        const params = this.getControllerParams();
        return this.store.query('customer', params);
    }
}
