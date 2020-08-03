import { set, setProperties } from '@ember/object';
import { assert } from '@ember/debug';
import DS from 'ember-data';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import Route from '@ember/routing/route';
import { PaginationControllerClass, SearchQuery } from './controller-pagination';

export type ConcreteSubclass<T> = new (...args: any[]) => T;
export type PaginationRoute = ConcreteSubclass<Route>;
export default function RoutePaginationClass<T extends ConcreteSubclass<Route>>(RouteSubclass: T) {
    class PaginationRouteClass extends RouteSubclass {
        /**
         * Adds functionality `modelName`, `metadata`, and `hasMore` to the controller
         * @param controller - The controller you want the functionality to be added on to
         * @param model - The result returned from a `store.query`
         */
        setupController(controller: InstanceType<PaginationControllerClass>, model: any) {
            assert(
                'Model is not an instanceof DS.AdapterPopulatedRecordArray. In order to use the RoutePaginationMixin, the model returned must be an instance of DS.AdapterPopulatedRecordArray or DS.RecordArray which comes from using store.query',
                model instanceof DS.AdapterPopulatedRecordArray || model instanceof DS.RecordArray
            );

            setProperties(controller, {
                modelName: model.type.modelName,
                metadata: model.meta,
                hasMore: model.length >= controller.limit
            });

            const modelForController = model.toArray();
            super.setupController(controller, modelForController);
        }

        /**
         * Get the controller params
         * @param routeName The name of the route you want to get the controller parameters for.
         * Defaults to current route if nothing is passed in
         * Should be passed in using `/` separators i.e. `accounts/index`
         * @returns - Controller query params
         */
        getControllerParams(this: InstanceType<PaginationRoute>, routeName: string = this.routeName): any {
            const controller = this.controllerFor<any>(routeName) as InstanceType<PaginationControllerClass>;
            return buildQueryParams(controller);
        }

        /**
         * Resets the controller by setting the model to be null
         * @param controller - The controller you want the functionality to be added on to
         * @param isExiting - Is the controller exiting
         */
        resetController(controller: InstanceType<PaginationControllerClass>, isExiting: boolean, transition: any) {
            super.resetController(controller, isExiting, transition);

            if (isExiting) {
                set(controller, 'model', null);
            }
        }
    }

    return PaginationRouteClass;
}
