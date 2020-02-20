gavant-ember-pagination
==============================================================================

DISCLAIMER: This addon is not actively maintained for public use. Pull requests are welcome, but we do not guarantee responses to bug submissions or feature requests, so use at your own risk.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.8 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install @gavant/ember-pagination
```


Usage
------------------------------------------------------------------------------

For Native classes, you use the "mixin".
```
import Route from '@ember/routing/route';
import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';

export default class Accounts extends RoutePagination(Route) {
    model() {
        const params = this.getControllerParams();
        return this.store.query('account', params);
    }
}
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
