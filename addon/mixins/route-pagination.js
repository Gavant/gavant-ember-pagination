import Mixin from '@ember/object/mixin';
import { get, set, setProperties } from '@ember/object';
import { assert } from '@ember/debug';
import DS from 'ember-data';

export default Mixin.create({
    shoeboxRouteEnabled: false,

    setupController(controller, model) {
        assert('Model is not an instanceof DS.AdapterPopulatedRecordArray. In order to use the RoutePaginationMixin, the model returned must be an instance of DS.AdapterPopulatedRecordArray which comes from using store.query', model instanceof DS.AdapterPopulatedRecordArray);
        setProperties(controller, {
            modelName: get(model, 'type.modelName'),
            metadata: get(model, 'meta'),
            hasMore: get(model, 'length') >= get(controller, 'limit')
        });

        model = model.toArray();
        this._super(controller, model);
    },

    getControllerParams() {
        const routeName = this.routeName;
        const controller = this.controllerFor(routeName);
        return this.buildQueryParams(controller);
    },

    resetController(controller, isExiting) {
        this._super.apply(this, arguments);

        if (isExiting) {
            set(controller, 'model', null);
        }
    }
});
