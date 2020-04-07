import Controller from '@ember/controller';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';

export default class Application extends ControllerPagination(Controller) {
    serverQueryParams = ['foo', 'bar', 'baz'];
    foo = 123;
    bar = true;
    baz = null;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'application': Application;
  }
}
