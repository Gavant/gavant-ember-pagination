# gavant-ember-pagination

DISCLAIMER: This addon is not actively maintained for public use. Pull requests are welcome, but we do not guarantee responses to bug submissions or feature requests, so use at your own risk.

## Compatibility

-   Ember.js v3.15 or above
-   Ember CLI v3.15 or above
-   Node.js v8 or above

## Installation

```
ember install @gavant/ember-pagination
```

## Usage

This addon employs a "hook" type pattern in which you create and bind a "paginator" instance to a parent context (most commonly a `Controller`, but could be a `Component`, etc). In the case of a Controller context, this usually should be done in the associated Route's `setupController()`, where you also pass in the initial page of results/metadata, which will most often come from the `model()` hook (but could come from `afterModel()` or anywhere else). The addon also provides several utilitly functions for helping with generating the query param objects for those initial requests.

### Basic Example

Below is an example of the most common Route/Controller-based pagination flow, used in conjunction with the @gavant/ember-table addon.

**Route**

```ts
// my-page/route.ts
import Route from '@ember/routing/route';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import MyPageController from './controller';
import User from '../user/model';

export default class MyPageRoute extends Route {
    model(this: any) {
        const controller = this.controllerFor(this.routeName) as MyPageController;
        // builds the query param object using the current filter/sort/etc values
        const params = buildQueryParams({
            context: controller,
            sorts: controller.sorts,
            filterList: ['foo', 'bar'],
            includeList: ['someRel', 'anotherRel.foo']
        });

        return this.store.query('user', params);
    }

    setupController(controller: MyPageController, model: RecordArrayWithMeta<User>) {
        // creates the paginator instance and binds it to the controller
        controller.paginator = usePagination<User>({
            context: controller,
            modelName: 'user',
            models: model.toArray(),
            metadata: model.meta,
            sorts: controller.sorts,
            filterList: ['foo', 'bar', 'baz'],
            includeList: ['someRel', 'anotherRel.foo'],
            onChangeSorting: controller.onChangeSorting
        });

        super.setupController(controller, model);
    }
}
```

**Controller**

```ts
// my-page/controller.ts
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import User from '../user/model';

export default class MyPageController extends Controller {
    // paginator instance
    @tracked paginator!: Pagination<User>;
    // filters
    @tracked foo = 123;
    @tracked bar = true;
    // sorts
    @tracked sorts = ['lastName', 'firstName'];
    // columns
    columns = [
        /* ... */
    ];

    // updates the controller's sorts on change,
    //  so they are "sticky" on transition
    @action
    onChangeSorting(sorts: string[]) {
        this.sorts = sorts;
    }
}
```

**Template**

```hbs
{{!-- my-page/template.hbs --}}
<p>{{this.paginator.metadata.totalCount}} results</p>
<div class="form-inline">
    <Input @value={{this.foo}} />
    <Input @value={{this.baz}} />
    <ButtonSpinner @action={{this.paginator.filterModels}}} @label="Filter" />
</div>
<Table
    @columns={{this.columns}}
    @rows={{this.paginator.models}}
    @hasMoreRows={{this.paginator.hasMore}}
    @loadMoreRows={{this.paginator.loadMoreModels}}
    @isLoading={{this.paginator.isLoadingModels}}
    @updateSorts={{this.paginator.changeSorting}}
    @sorts={{this.paginator.sorts}}
    @enableSort={{true}}
/>
```

### Advanced Usage

#### Multiple paginators on a single page

Because the paginator logic and state is completely self contained in its own instance, it is trivial to do things like bind multiple paginators to a single controller. This is useful in more complex UIs where you may have multiple secondary content areas that also have paginated data.

Doing this in the Route/Controller-based flow is almost exactly the same as the above basic example, just multiplied by the number of paginators you need:

**Route**

```ts
// my-page/route.ts
export default class MyPageRoute extends Route {
    secondaryData: OtherModel[] = [];

    model(this: any) {
        const controller = this.controllerFor(this.routeName) as MyPageController;
        const params = buildQueryParams({
            /* ... */
        });
        return this.store.query('user', params);
    }

    async afterModel(model: RecordArrayWithMeta<User>, transition: Transition) {
        super.afterModel(model, transition);
        // fetch the intitial page of results for the second paginator
        // (this doesnt necessarily need to come from `afterModel()`)
        const controller = this.controllerFor(this.routeName) as MyPageController;
        const params = buildQueryParams({
            /* ... */
        });
        this.secondaryData = await this.store.query('other-model', params);
    }

    setupController(controller: MyPageController, model: RecordArrayWithMeta<User>) {
        controller.paginator = usePagination<User>({
            /* ... */
        });
        // bind the second paginator instance
        controller.paginatorTwo = usePagination<OtherModel>({
            context: controller,
            modelName: 'other-model',
            models: this.secondaryData.toArray(),
            metadata: this.secondaryData.meta,
            sorts: controller.sortsTwo
            // ...
        });

        super.setupController(controller, model);
    }
}
```

**Controller**

```ts
// my-page/controller.ts
export default class MyPageController extends Controller {
    // two paginator instances
    @tracked paginator!: Pagination<User>;
    @tracked paginatorTwo!: Pagination<OtherModel>;
    // filters for both paginators
    // (or they might share the same filters, depending on your needs)
    @tracked foo = 123;
    @tracked bar = true;
    @tracked otherFilter = 'abc';
    // sorts for both paginators
    @tracked sorts = ['lastName', 'firstName'];
    @tracked sortsTwo = ['someProp'];

    // rest of controller implementation...
}
```

**Template**

```hbs
{{!-- my-page/template.hbs --}}
<p>{{this.paginator.metadata.totalCount}} results</p>
<Table
    @columns={{this.columns}}
    @rows={{this.paginator.models}}
    @hasMoreRows={{this.paginator.hasMore}}
    @loadMoreRows={{this.paginator.loadMoreModels}}
    @isLoading={{this.paginator.isLoadingModels}}
    @updateSorts={{this.paginator.changeSorting}}
    @sorts={{this.paginator.sorts}}
    @enableSort={{true}}
/>

<p>{{this.paginatorTwo.metadata.totalCount}} results</p>
<Table
    @columns={{this.columns}}
    @rows={{this.paginatorTwo.models}}
    @hasMoreRows={{this.paginatorTwo.hasMore}}
    @loadMoreRows={{this.paginatorTwo.loadMoreModels}}
    @isLoading={{this.paginatorTwo.isLoadingModels}}
    @updateSorts={{this.paginatorTwo.changeSorting}}
    @sorts={{this.paginatorTwo.sorts}}
    @enableSort={{true}}
/>
```

#### Component-based paginators

Because the paginator "hook" is agnostic about what its parent context is (as long as that parent is bound to/owned by the main ember application instance), it doesn't necessarily need to live on a Controller. For example, you could just as easily create and bind a paginator to a Glimmer Component:

```ts
// components/paginated-user-list/component.ts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import usePagination, { Pagination, RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import User from '../user/model';

interface PaginatedUserListArgs {
    /* ... */
}

const filterList = ['foo', 'bar'];
const includeList = ['someRel', 'anotherRel.foo'];

export default class PaginatedUserList extends Component<PaginatedUserListArgs> {
    @service store!: DS.Store;
    // paginator instance
    @tracked paginator: Pagination<User>;
    // filters
    @tracked foo = 123;
    @tracked bar = true;
    // columns
    columns = [
        /* ... */
    ];

    constructor(owner: unknown, args: PaginatedUserListArgs) {
        super(owner, args);
        this.setupPaginator();
    }

    async setupPaginator() {
        const params = buildQueryParams({
            context: this,
            filterList: filterList,
            includeList: includeList
        });
        const initialPage = await this.store.query('user', params);

        this.paginator = usePagination<User>({
            context: this,
            modelName: 'user',
            models: initialPage.toArray(),
            metadata: initialPage.meta,
            filterList: filterList,
            includeList: includeList
        });
    }
}
```

```hbs
{{!-- components/paginated-user-list/template.hbs --}}
<p>{{this.paginator.metadata.totalCount}} results</p>
<div class="form-inline">
    <Input @value={{this.foo}} />
    <Input @value={{this.baz}} />
    <ButtonSpinner @action={{this.paginator.filterModels}}} @label="Filter" />
</div>
<Table
    @columns={{this.columns}}
    @rows={{this.paginator.models}}
    @hasMoreRows={{this.paginator.hasMore}}
    @loadMoreRows={{this.paginator.loadMoreModels}}
    @isLoading={{this.paginator.isLoadingModels}}
    @updateSorts={{this.paginator.changeSorting}}
    @sorts={{this.paginator.sorts}}
    @enableSort={{true}}
/>
```

### Available Configuration

You may configure the paginator instances via the arguments object that is passed in to the `usePagination({ ... })` hook, as well as after it is created via the `paginator.setConfigs({ ... })` method it exposes.

**Initial Arguments**

(NOTE: These args can only be set in the initial paginator instantiation, NOT via `setConfigs()`)

-   `context: any` The "parent" context of the paginator instance, this will usually be a `Controller` or `Component`.
-   `modelName: string` The name of the ember-data `DS.Model` to use in pagination `store.query()`'s.
-   `models: DS.Model[]` A native array of models to use as the initial page of results (usually you must call `.toArray()` on the result set before passing it to this arg.)
-   `metadata: Object` (optional) A metadata object to use as the initial page's meta information (usually this will come from the initial result set's `meta` property.)
-   `sorts: string[]` (optional) An array of initial sort properties to use for pagination requests (if using the Route/Controller pagination flow, usually you'll store these on the controller and pass them in like `controller.sorts`)

**Additional Arguments**

All the arguments below are optional, and may be updated later on the paginator instance using `setConfigs()`.

-   `limit: number` (default: `20`) The number of results to return per page
-   `filterList: string[]` A list of query param filter fields which will be included in requests, mapped to their associated value in the parent context. (You can customize the param <=> field mapping by passing in strings in the form of `'paramName:propertyName'`).
-   `includeList: string[]` A list of JSON-API include fields to send in the request, which will be joined in a comma separated list in the request.
-   `pagingRootKey: string | null` (default: `'page'`) The root query param key for limit/offset params, JSON-API compatible by default.
-   `filterRootKey: string | null` (default: `'filter'`) The root query param key for filter params, JSON-API compatible by default.
-   `includeKey: string` (default: `'include'`) The query param key for "include" values. JSON-API compatible by default.
-   `sortKey: string` (default: `'sort'`) The query param key for "sort" values. JSON-API compatible by default
-   `serverDateFormat: string` (default: `'YYYY-MM-DDTHH:mm:ss'`) The string format to use to serialize filter values that are `Date` or `moment` objects.
-   `processQueryParams: (params: QueryParamsObj) => QueryParamsObj` A handler function that allows custom logic to be used to modify or update the final query params object anytime one is generated, before it is sent in the request. (for an example, see `tests/dummy/controllers/list.ts`)
-   `onChangeSorting: (sorts: string[], newSorts?: Sorting[]) => Promise<string[] | undefined> | void` A handler function that allows the parent context to listen for/react to changes to the current sorting. For example, for a Controller to store the current sorting value to make it "sticky" on page transitions.

### Paginator API

The paginator instance exposes an extensive API of properties and methods which can be used in the parent class and template (and passed down into child templates/components as needed). Check the types on the `addon/hooks/pagination.ts` file for more details.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
