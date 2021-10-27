import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class Customer extends DS.Model.extend({
    firstName: attr('string'),
    lastName: attr('string'),
    emailAddress: attr('string'),
    phoneNumber: attr('string'),
    company: attr('string'),
    project: attr('string'),
    budget: attr('string')
}) {
    // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        customer: Customer;
    }
}
