gavant-pagination
==============================================================================

DISCLAIMER: This addon is not actively maintained for public use. Pull requests are welcome, but we do not guarantee responses to bug submissions or feature requests, so use at your own risk.

Compatibility
------------------------------------------------------------------------------

* Ember.js v2.18 or above
* Ember CLI v2.13 or above


Installation
------------------------------------------------------------------------------

```
ember install gavant-pagination
```


Usage
------------------------------------------------------------------------------

There are two ways to use this addon.

For classic classes, you use the mixin.

```
import Route from '@ember/routing/route';
import RoutePagination from 'gavant-pagination/mixins/route-pagination';

export default Route.extend(RoutePagination, {
    model() {
        const params = this.getControllerParams();
        return get(this, 'store').query('account', params);
    }
});
```

For Native classes, you use the "decorator".
```
import Route from '@ember/routing/route';
import RoutePagination from 'gavant-pagination/decorators/route-pagination';

export default class Accounts extends RoutePagination(Route) {
    model() {
        const params = this.getControllerParams();
        return this.store.query('account', params);
    }
}
```

Technically speaking you can actually use the route-pagination as a decorator..
```
import Route from '@ember/routing/route';
import RoutePagination from 'gavant-pagination/decorators/route-pagination';

@RoutePagination
export default class Accounts extends Route {
    model() {
        const params = this.getControllerParams();
        return this.store.query('account', params);
    }
}
```
but the main issue with that is RoutePagination will be the extend the `Accounts` Route, and generally you want the order of that to be reversed.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
