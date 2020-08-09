import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Customer from '../models/customer';

export default class Application extends Controller {
    @tracked paginator!: Pagination<Customer>;
    @tracked paginatorTwo!: Pagination<Customer>;

    //TODO need to move these into paginator instance
    serverQueryParams = ['foo', 'bar', 'baz'];
    include = ['some-rel', 'another-rel.foo'];
    foo = 123;
    bar = true;
    baz = null;

    get totalPages() {
        return Math.ceil(this.paginator.rows.length / 9);
    }

    get totalPagesTwo() {
        return Math.ceil(this.paginatorTwo.rows.length / 9);
    }

    @action
    async customReload() {
        console.log('do something before reloading');
        await this.paginator.reloadModels();
        console.log('do something after reloading');
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'application': Application;
  }
}
