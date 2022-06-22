import usePagination from '@gavant/ember-pagination/hooks/pagination';
import { module, test } from 'qunit';

module('Unit | Hook | pagination', function (_hooks) {
    test('Pagination accepts serializeFilterValue() method.', function (assert) {
        const myFilter = 'Some Value';
        const serializeFilterValue = (_key: string, _value: any) => {
            return 'Not the value';
        };
        const pagination = usePagination({
            context: {
                myFilter
            },
            filterList: ['myFilter'],
            models: [],
            modelName: '',
            serializeFilterValue
        });
        assert.notStrictEqual(myFilter, pagination.config.serializeFilterValue?.('myFilter', myFilter));
    });
});
