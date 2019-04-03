import { PaginationController } from 'gavant-pagination/utils/query-params';
/**
 * @param Route  Pass in the route that you want to add here.
 */
export default function routePagination<T extends ConcreteSubclass<any>>(RouteSubclass: T): {
    new (...args: any[]): {
        [x: string]: any;
        setupController(controller: PaginationController, model: any): void;
        getControllerParams(): any;
        resetController(controller: PaginationController, isExiting: boolean, transition: any): void;
    };
} & T;
