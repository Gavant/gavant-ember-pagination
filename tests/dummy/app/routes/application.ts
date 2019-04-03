import Route from '@ember/routing/route';
import RoutePagination from 'gavant-pagination/decorators/route-pagination';

export default class Application extends RoutePagination(Route) {
    model() {
        return this.store.query('post', { limit: 100 });
    }

    setupController(controller: any, model: any) {
        console.log('This is a test');
        super.setupController(controller, model);
    }
}
