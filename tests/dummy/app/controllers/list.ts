import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Customer from '../models/customer';

export default class List extends Controller {
    @tracked paginator!: Pagination<Customer>;
    @tracked paginatorTwo!: Pagination<Customer>;

    //filters
    @tracked foo = 123;
    @tracked bar = true;
    @tracked baz = null;
    @tracked mappedFilter = 'abc';

    //sorts
    @tracked sorts = ['sortA', '-sortB'];
    @tracked sortsTwo = ['-sortC', 'sortD'];

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

    @action
    onChangeSorting(sorts: string[]) {
        this.sorts = sorts;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'list': List;
  }
}
