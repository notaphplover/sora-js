import { IOperationArgs } from './operation-manager';

export interface IOperationManagerAccess<Args extends IOperationArgs> {

    /**
     * Substribes a handler under an alias.
     * @param alias Alias of the handler.
     * @param handler Handler to be subscribed.
     */
    subscribe(alias: string, handler: (eventArgs: Args) => void): number;

    /**
     * Unsubscribes a handler under an alias.
     * @param alias Alias of the handler.
     * @param index Index of the handler.
     */
    unsubscribe(alias: string, index: number): boolean;
}
