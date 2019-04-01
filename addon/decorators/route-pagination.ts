import DS from 'ember-data';
import { assert } from '@ember/debug';
import { PaginationController, buildQueryParams } from '../utils/query-params';
import { Route } from '@ember/routing';

type ConcreteSubclass<T> = new(...args: any[]) => T;
export default function routePagination<T extends ConcreteSubclass<Route>>(RouteSubclass: T) {
    class PaginationRoute extends RouteSubclass {
        setupController(controller: PaginationController, model: any) {
            assert('Model is not an instanceof DS.AdapterPopulatedRecordArray. In order to use the RoutePaginationMixin, the model returned must be an instance of DS.AdapterPopulatedRecordArray which comes from using store.query', model instanceof DS.AdapterPopulatedRecordArray);

            controller.modelName = model.type.modelName;
            controller.metadata = model.meta;
            controller.hasMore = model.length >= controller.limit;

            const modelForController = model.toArray();
            super.setupController(controller, modelForController);
        }

        getControllerParams() {
            const routeName = this.routeName as never;
            const controller = this.controllerFor(routeName);
            return buildQueryParams(controller);
        }

        resetController(controller: PaginationController, isExiting: boolean, transition: any) {
            super.resetController(controller, isExiting, transition);

            if (isExiting) {
                controller.model = null;
            }
        }

    }
    return PaginationRoute;
}
