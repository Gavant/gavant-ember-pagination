import Controller from '@ember/controller';
import ControllerPagination from 'gavant-pagination/decorators/controller-pagination';

export default class Application extends ControllerPagination(Controller) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'application': Application;
  }
}
