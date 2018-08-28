import { EventEmitter } from 'events';
import { TokenMap } from '../collection/token-map';

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
    protected subscriptionStorage: { [alias: string]: TokenMap<(eventArgs: Args) => void> };

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
                for (const alias in that.subscriptionStorage) {
                    if (that.subscriptionStorage.hasOwnProperty(alias)) {
                        const subscribers = that.subscriptionStorage[alias];
                        if (subscribers != null) {
                            subscribers.foreach(function(value: (eventArgs: Args) => void) {
                                value(eventArgs);
                            });
                        }
                    }
                }
            } else {
                for (const alias of eventArgs.aliases) {
                    const subscribers = that.subscriptionStorage[alias];
                    if (subscribers != null) {
                        subscribers.foreach(function(value: (eventArgs: Args) => void) {
                            value(eventArgs);
                        });
                    }
                }
            }
        };

        this.eventAlias = eventAlias;
        this.eventEmitter = eventEmitter;
        this.subscriptionStorage = {};

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
    public subscribe(alias: string, handler: (eventArgs: Args) => void): number {
        if (null == this.subscriptionStorage[alias]) {
            this.subscriptionStorage[alias] = new TokenMap();
        }
        return this.subscriptionStorage[alias].add(handler);
    }

    /**
     * Unsubscribes a handler under an alias.
     * @param alias Alias of the handler.
     * @param index Index of the handler.
     */
    public unsubscribe(alias: string, index: number): boolean {
        if (null == this.subscriptionStorage[alias]) {
            return false;
        } else {
            return this.subscriptionStorage[alias].remove(index);
        }
    }
}
