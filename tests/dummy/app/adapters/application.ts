import DS from 'ember-data';

export default class Application extends DS.RESTAdapter.extend({
  // anything which *must* be merged on the prototype
}) {
    host:string = 'https://xadsfmudcl.execute-api.us-east-1.amazonaws.com/prod/gabriella-spain';
}

// DO NOT DELETE: this is how TypeScript knows how to look up your adapters.
declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'application': Application;
  }
}
