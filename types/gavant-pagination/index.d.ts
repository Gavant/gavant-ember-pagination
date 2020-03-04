import MutableArray from '@ember/array/mutable';
import Copyable from '@ember/object/-private/copyable';

declare global {
    interface Array<T> extends MutableArray<T>, Copyable {}
}
export {};
