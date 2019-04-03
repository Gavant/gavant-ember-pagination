import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Post extends DS.Model.extend({
    title: attr('string'),
    body: attr('string')
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'post': Post;
  }
}
