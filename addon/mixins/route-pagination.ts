import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import { assert } from '@ember/debug';
import DS from 'ember-data';
import { PaginationController, buildQueryParams } from 'gavant-pagination/utils/query-params';

export default Mixin.create({
    /**
     * Adds functionality `modelName`, `metadata`, and `hasMore` to the controller
     * @param controller - The controller you want the functionality to be added on to
     * @param model - The result returned from a `store.query`
     */
    setupController(controller: PaginationController, model: any) {
        assert('Model is not an instanceof DS.AdapterPopulatedRecordArray. In order to use the RoutePaginationMixin, the model returned must be an instance of DS.AdapterPopulatedRecordArray which comes from using store.query', model instanceof DS.AdapterPopulatedRecordArray);
        setProperties(controller, {
            modelName: get(model, 'type.modelName'),
            metadata: get(model, 'meta'),
            hasMore: get(model, 'length') >= get(controller, 'limit')
        });

        model = model.toArray();
        this._super(controller, model);
    },

    /**
     * Get the controller params
     * @param routeName The name of the route you want to get the controller parameters for.
     * Defaults to current route if nothing is passed in
     * Should be passed in using `/` seperators i.e. `accounts/index`
     * @returns - Controller query params
     */
    getControllerParams(this: PaginationController, routeName: string = this.routeName): any {
        const controller = this.controllerFor(routeName);
        return buildQueryParams(controller);
    },

    /**
     * Resets the controller by setting the model to be null
     * @param controller - The controller you want the functionality to be added on to
     * @param isExiting - Is the controller exiting
     */
    resetController(controller: PaginationController, isExiting: boolean) {
        this._super.apply(this, arguments);

        if (isExiting) {
            set(controller, 'model', null);
        }
    }
});
