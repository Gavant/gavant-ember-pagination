import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { module, test } from 'qunit';

module('Unit | Utility | query-params', function (_hooks) {
    test('Default filter serializer returns ISO string date for JS dates.', function (assert) {
        const date = new Date();
        const context = {
            date
        };
        const builtParams = buildQueryParams({ context, filterList: ['date'] });
        assert.equal(date.toISOString(), builtParams.filter.date);
    });

    test('Default serializer returns initial value for non JS dates.', function (assert) {
        const str = 'I was born in the darkness';
        const bool = true;
        const obj = {
            item: 'milkshake',
            flavor: 'chocolate'
        };
        const context = {
            str,
            bool,
            obj
        };
        const builtParams = buildQueryParams({ context, filterList: ['str', 'bool', 'obj'] });
        assert.strictEqual(str, builtParams.filter.str);
        assert.strictEqual(bool, builtParams.filter.bool);
        assert.strictEqual(obj, builtParams.filter.obj);
    });

    test('Custom serializeFilterValue() argument works as intended.', function (assert) {
        const date = new Date();
        const starburst = 'red';
        const druthers = 'Tacos';
        const context = {
            date,
            druthers,
            starburst
        };
        const customSerializeFilterValue = (key: string, value: any) => {
            if (value instanceof Date) {
                return value.getUTCMilliseconds();
            } else if (key === 'druthers') {
                return 'Pretzels';
            }
            return value;
        };
        const builtParams = buildQueryParams({
            context,
            filterList: ['date', 'druthers', 'starburst'],
            serializeFilterValue: customSerializeFilterValue
        });
        assert.strictEqual(date.getUTCMilliseconds(), builtParams.filter.date);
        assert.notStrictEqual(druthers, builtParams.filter.druthers);
        assert.strictEqual(starburst, builtParams.filter.starburst);
    });
});
