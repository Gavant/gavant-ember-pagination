import Route from '@ember/routing/route';
import RoutePagination from '@gavant/ember-pagination/decorators/route-pagination';

export default class Application extends RoutePagination(Route) {
    model() {
        const params = this.getControllerParams();
        return this.store.query('post', params);
    }

    setupController(controller: any, model: any) {
        console.log('This is a test');
        super.setupController(controller, model);
    }
}
