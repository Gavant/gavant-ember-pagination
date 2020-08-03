import Route from '@ember/routing/route';
export declare type ConcreteSubclass<T> = new (...args: any[]) => T;
export declare type PaginationRoute = ConcreteSubclass<Route>;
export declare function RoutePagination<T extends PaginationRoute>(RouteSubclass: T): ConcreteSubclass<Route>;
