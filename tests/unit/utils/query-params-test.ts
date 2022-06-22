import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { module, test } from 'qunit';

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

    test('Default date serialization returns an ISO string', function (assert) {
        const date = new Date();
        const context = {
            date
        };
        const builtParams = buildQueryParams({ context, filterList: ['date'] });
        assert.equal(date.toISOString(), builtParams.filter.date);
    });

    test('Custom serializeDate() function works', function (assert) {
        const date = new Date();
        const context = {
            date
        };
        const serializeDate = (date: Date) => {
            return date.getUTCMinutes().toString();
        };
        const builtParams = buildQueryParams({ context, filterList: ['date'], serializeDate });
        assert.equal(date.getUTCMinutes().toString(), builtParams.filter.date);
    });
});
