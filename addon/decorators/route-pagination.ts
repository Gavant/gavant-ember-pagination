import DS from 'ember-data';
import { assert } from '@ember/debug';
import { PaginationController, buildQueryParams } from 'gavant-pagination/utils/query-params';

/**
 * Adds functionality to `setupController` / `resetController`. Be sure to call `super` in the respective methods to ensure this runs
 * @param Route The route you want the functionality to be added on to
 */
export default function routePagination<T extends ConcreteSubclass<any>>(RouteSubclass: T) {
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
            // const routeName = this.routeName as never;
            // Use `any` here because we aren't actually able to check that the
            // `routeName` here is a valid controller name against a registry:
            // we only know that it is a string.
            const controller = this.controllerFor(this.routeName as never);
            // const controller = this.controllerFor(routeName);
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
