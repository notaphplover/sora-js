import { EventEmitter } from 'events';

export const COLLECTION_MANAGER_EVENTS = {
    collectionAfterChange: 'coll.ch.a',
    collectionBeforeChange: 'coll.ch.b',
}

export class CollectionChangeEventArgs<T> {
    /**
     * Map from old indexes to new indexes
     */
    protected indexMap : {[oldIndex : number] : number};
    /**
     * new Elements array
     */
    protected newElements : T[];

    /**
     * Flag to prevent the default action (update the collection)
     */
    protected preventDefault : boolean;

    /**
     * Creates a new instance.
     * @param indexMap Index map, from old indexes to new indexes.
     * @param newElements New Elements array.
     */
    public constructor(indexMap : {[oldIndex : number] : number}, newElements : T[], preventDefault : boolean) {
        this.indexMap = indexMap;
        this.newElements = newElements;
        this.preventDefault = preventDefault;
    }

    /**
     * Returns a clone copy of the index map.
     * The index map keys are the old indexes of the collection.
     * The index map values are the new indexes for the old ones.
     */
    public getIndexMap() : {[oldIndex : number] : number} {
        return Object.assign({}, this.indexMap);
    }

    /**
     * Returns a clone copy of the collection that could be the new collection.
     */
    public getNewElements() : {[index : number] : T} {
        return Object.assign({}, this.newElements);
    }

    /**
     * Returns the prevent default action flag.
     */
    public getPreventDefault() : boolean {
        return this.preventDefault;
    }
}

export class CancelableCollectionChangeEventArgs<T> extends CollectionChangeEventArgs<T> {

    /**
     * Creates a new instance.
     * @param indexMap Index map, from old indexes to new indexes.
     * @param newElements New Elements array.
     */
    public constructor(indexMap : {[oldIndex : number] : number}, newElements : T[]) {
        super(indexMap, newElements, false);
    }

    /**
     * Sets the prevent default action flag to true.
     */
    public setPreventDefault() : void {
        this.preventDefault = true;
    }
}

/**
 * Collection manager.
 * Handles a collection of items and emits events on modifications of the managed collection.
 */
export class CollectionManager<T> {

    /**
     * Collection to manage
     */
    protected collection : T[];

    /**
     * Event emitter used to emit events
     */
    protected eventEmitter : EventEmitter;

    /**
     * Creates a new instance of the class.
     * @param collection Collection to manage.
     * @param eventEmitter Event emitter used to emit events.
     */
    public constructor(collection : T[], eventEmitter : EventEmitter) {
        this.collection = collection;
        this.eventEmitter = eventEmitter;
    }

    /**
     * Returns the collection of elements managed.
     * This is the real collection managed by the instance.
     * Only read operations should be performed directly in the collection.
     */
    public getCollection() : T[] {
        return this.collection;
    }

    /**
     * Obtains the length of the collection.
     * @returns Length of the collection managed.
     */
    public getLength() : number {
        return this.collection.length;
    }

    /**
     * Inserts a collection of elements at the selected indexes.
     * @param elements Collection of index-element pairs representing the elements to be inserted.
     */
    public insertElements(elements : {[index : number] : T}) : void {
        this.internalInsertElements(elements);
    }

    /**
     * Inserts a collection of elements at the selected indexes.
     * @param elements Collection of index-element pairs representing the elements to be inserted.
     */
    protected internalInsertElements(elements : {[index : number] : T}) : void {
        var keys : number[] = new Array();
        for (var elemIndex in elements) {
            var numberElemIndex = Number(elemIndex);
            if (numberElemIndex < 0)
            throw new Error('The index param should be greater or equals zero.');

            if (numberElemIndex > this.collection.length)
                throw new Error('The index param should be less or equals the number of elements of the collection.');

            keys.push(numberElemIndex);
        }

        keys = keys.sort(function(number1, number2) {
            return number1 - number2;
        });

        if (keys.length == 0)
            return;

        var newElements : T[] = new Array(this.collection.length + keys.length);

        var indexMap : {[oldIndex : number] : number} = {};

        if (keys.length == 1) {
            var index = keys[0];
            var element = elements[index];

            for (var i = 0; i < index; ++i) {
                newElements[i] = this.collection[i];
                indexMap[i] = i;
            }

            newElements[index] = element

            for(var i = index + 1; i < newElements.length; ++i) {
                newElements[i] = this.collection[i - 1];
                indexMap[i - 1] = i;
            }
        } else {
            for (var i = 0; i < keys[0]; ++i) {
                newElements[i] = this.collection[i];
                indexMap[i] = i;
            }

            newElements[keys[0]] = elements[keys[0]]

            for (var i = 1; i < keys.length; ++i) {
                var indexPrevious = keys[i - 1];
                var index = keys[i];
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
    protected internalRemoveElements(indexes : number[]) : void {
        //Sort indexes.
        indexes = indexes.sort(function(number1, number2) {
            return number1 - number2;
        });

        var indexMap : {[oldIndex : number] : number} = {};
        var newElements : T[] = new Array();
        var counter = 0;
        for (var i = 0; i < this.collection.length; ++i) {
            if (indexes[counter] == i)
                ++counter;
            else {
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
    protected internalTryToChangeCollection(indexMap : {[oldIndex : number] : number} = {}, newElements : T[]) : CollectionChangeEventArgs<T> {
        var cancelableChangeEventArgs = new CancelableCollectionChangeEventArgs(indexMap, newElements);
        this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, cancelableChangeEventArgs);

        if (!cancelableChangeEventArgs.getPreventDefault())
            this.collection = newElements;

        var changeEventArgs = new CollectionChangeEventArgs<T>(indexMap, newElements, cancelableChangeEventArgs.getPreventDefault());
        this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionAfterChange, changeEventArgs);
        return changeEventArgs;
    }

    /**
     * Removes elements of the collection.
     * @param indexes Indexes of the collection to be removed.
     */
    public removeElements(indexes : number[]) : void {
        this.internalRemoveElements(indexes);
    }
}