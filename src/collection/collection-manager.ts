import { EventEmitter } from 'events';
import { CancelableCollectionChangeEventArgs } from './cancelable-collection-change-args';
import { CollectionChangeEventArgs } from './collection-change-args';

export const COLLECTION_MANAGER_EVENTS = {
    collectionAfterChange: 'coll.ch.a',
    collectionBeforeChange: 'coll.ch.b',
};

/**
 * Collection manager.
 * Handles a collection of items and emits events on modifications of the managed collection.
 */
export class CollectionManager<T> {

    /**
     * Collection to manage
     */
    protected collection: T[];

    /**
     * Event emitter used to emit events
     */
    protected eventEmitter: EventEmitter;

    /**
     * Creates a new instance of the class.
     * @param collection Collection to manage.
     * @param eventEmitter Event emitter used to emit events.
     */
    public constructor(collection: T[], eventEmitter: EventEmitter) {
        this.collection = collection;
        this.eventEmitter = eventEmitter;
    }

    //#region Public

    /**
     * Returns the collection of elements managed.
     * This is the real collection managed by the instance.
     * Only read operations should be performed directly in the collection.
     */
    public getCollection(): T[] {
        return this.collection;
    }

    /**
     * Obtains the length of the collection.
     * @returns Length of the collection managed.
     */
    public getLength(): number {
        return this.collection.length;
    }

    /**
     * Inserts a collection of elements at the selected indexes.
     * @param elements Collection of index-element pairs representing the elements to be inserted.
     */
    public insertElements(elements: {[index: number]: T}): void {
        this.internalInsertElements(elements);
    }

    /**
     * Removes elements of the collection.
     * @param indexes Indexes of the collection to be removed.
     */
    public removeElements(indexes: number[]): void {
        this.internalRemoveElements(indexes);
    }

    //#endregion

    /**
     * Inserts a collection of elements at the selected indexes.
     * @param elements Collection of index-element pairs representing the elements to be inserted.
     */
    protected internalInsertElements(elements: {[index: number]: T}): void {
        var keys: number[] = new Array();
        for (const elemIndex in elements) {
            if (elements.hasOwnProperty(elemIndex)) {
                const numberElemIndex = Number(elemIndex);
                if (numberElemIndex < 0) {
                    throw new Error('The index param should be greater or equals zero.');
                }

                if (numberElemIndex > this.collection.length) {
                    throw new Error(
                        'The index param should be less or equals the number of elements of the collection.',
                    );
                }
                keys.push(numberElemIndex);
            }
        }

        keys = keys.sort(function(number1, number2) {
            return number1 - number2;
        });

        if (0 === keys.length) {
            return;
        }

        const newElements: T[] = new Array(this.collection.length + keys.length);
        const indexMap: {[oldIndex: number]: number} = {};

        if (1 === keys.length) {
            const index = keys[0];
            const element = elements[index];

            for (var i = 0; i < index; ++i) {
                newElements[i] = this.collection[i];
                indexMap[i] = i;
            }

            newElements[index] = element;

            for (var i = index + 1; i < newElements.length; ++i) {
                newElements[i] = this.collection[i - 1];
                indexMap[i - 1] = i;
            }
        } else {
            for (var i = 0; i < keys[0]; ++i) {
                newElements[i] = this.collection[i];
                indexMap[i] = i;
            }

            newElements[keys[0]] = elements[keys[0]];

            for (var i = 1; i < keys.length; ++i) {
                const indexPrevious = keys[i - 1];
                const index = keys[i];
                for (var j = indexPrevious + 1; j < index; ++j) {
                    newElements[j] = this.collection[j - i];
                    indexMap[j - i] = j;
                }

                newElements[index] = elements[index];
            }

            for (var i = keys[keys.length - 1] + 1; i < newElements.length; ++i) {
                newElements[i] = this.collection[i - keys.length];
                indexMap[i - keys.length] = i;
            }
        }

        this.internalTryToChangeCollection(indexMap, newElements);
    }

    /**
     * Removes elements of the collection.
     * @param indexes Indexes of the collection to be removed.
     */
    protected internalRemoveElements(indexes: number[]): void {
        // Sort indexes.
        indexes = indexes.sort(function(number1, number2) {
            return number1 - number2;
        });

        const indexMap: {[oldIndex: number]: number} = {};
        const newElements: T[] = new Array();
        var counter = 0;
        for (var i = 0; i < this.collection.length; ++i) {
            if (i === indexes[counter]) {
                ++counter;
            } else {
                newElements[i - counter] = this.collection[i];
                indexMap[i] = i - counter;
            }
        }

        this.internalTryToChangeCollection(indexMap, newElements);
    }

    /**
     * Attemps to change the collection managed by this instance.
     * @param indexMap Map from old indexes to new indexes.
     * @param newElements New elements to manage if the change is not prevented.
     */
    protected internalTryToChangeCollection(
        indexMap: {[oldIndex: number]: number} = {},
        newElements: T[],
    ): CollectionChangeEventArgs<T> {
        const cancelableChangeEventArgs = new CancelableCollectionChangeEventArgs(indexMap, newElements);
        this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, cancelableChangeEventArgs);

        if (!cancelableChangeEventArgs.getPreventDefault()) {
            this.collection = newElements;
        }

        const changeEventArgs = new CollectionChangeEventArgs<T>(
            indexMap,
            newElements,
            cancelableChangeEventArgs.getPreventDefault(),
        );
        this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionAfterChange, changeEventArgs);
        return changeEventArgs;
    }
}
