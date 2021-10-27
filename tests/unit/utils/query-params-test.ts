import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { module, test } from 'qunit';

// eslint-disable-next-line no-unused-vars
module('Unit | Utility | query-params', function (_hooks) {
    // Replace this with your real tests.
    test('it works', function (assert) {
        let result = buildQueryParams({
            context: {
                test: 1
            }
        });
        assert.ok(result);
    });
});
