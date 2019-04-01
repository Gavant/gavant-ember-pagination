import EmberObject from '@ember/object';
import ControllerPaginationMixin from 'gavant-pagination/mixins/controller-pagination';
import { module, test } from 'qunit';

module('Unit | Mixin | controller-pagination', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ControllerPaginationObject = EmberObject.extend(ControllerPaginationMixin);
    let subject = ControllerPaginationObject.create();
    assert.ok(subject);
  });
});
