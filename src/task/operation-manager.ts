import { EventEmitter } from 'events';

/**
 * Operation arguments
 */
export interface IOperationArgs {
    aliases: string[];
}

/**
 * Represents an operation manager. The operation is propagated using an event.
 * All the subscribers
 */
export class OperationManager<Args extends IOperationArgs> {

    //#region Attributes

    /**
     * Function to be called to handle the event.
     */
    protected callFunction: (eventArgs: Args) => void;

    /**
     * Alias of the event.
     */
    protected eventAlias: string;

    /**
     * Event emmitter of the event.
     */
    protected eventEmitter: EventEmitter;

    /**
     * Object to storage all the functions subscribed.
     */
    protected suscriptionStorage: { [alias: string]: (eventArgs: Args) => void };

    //#endregion

    /**
     * Creates a new operation manager
     * @param eventAlias Event alias.
     * @param eventEmitter Event emitter.
     */
    public constructor(eventAlias: string, eventEmitter: EventEmitter) {
        const that = this;
        this.callFunction = function(eventArgs: Args): void {
            if (eventArgs.aliases == null) {
                for (const alias in that.suscriptionStorage) {
                    if (that.suscriptionStorage.hasOwnProperty(alias)) {
                        const subscriber = that.suscriptionStorage[alias];
                        if (subscriber != null) {
                            subscriber(eventArgs);
                        }
                    }
                }
            } else {
                for (const alias of eventArgs.aliases) {
                    const subscriber = that.suscriptionStorage[alias];
                    if (null != subscriber) {
                        subscriber(eventArgs);
                    }
                }
            }
        };

        this.eventAlias = eventAlias;
        this.eventEmitter = eventEmitter;
        this.suscriptionStorage = {};

        this.eventEmitter.addListener(this.eventAlias, this.callFunction);
    }

    /**
     * Disposes the instance.
     */
    public dispose(): void {
        this.eventEmitter.removeListener(this.eventAlias, this.callFunction);
    }

    /**
     * Substribes a handler under an alias.
     * @param alias Alias of the handler.
     * @param handler Handler to be subscribed.
     */
    public subscribe(alias: string, handler: (eventArgs: Args) => void): void {
        this.suscriptionStorage[alias] = handler;
    }

    /**
     * Unsubstribes a handler under an alias.
     * @param alias Alias of the handler.
     */
    public unsubscribe(alias: string) {
        delete this.suscriptionStorage[alias];
    }
}
