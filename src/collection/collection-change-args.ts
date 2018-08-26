export class CollectionChangeEventArgs<T> {
    /**
     * Map from old indexes to new indexes
     */
    protected indexMap: {[oldIndex: number]: number};
    /**
     * new Elements array
     */
    protected newElements: T[];

    /**
     * Flag to prevent the default action (update the collection)
     */
    protected preventDefault: boolean;

    /**
     * Creates a new instance.
     * @param indexMap Index map, from old indexes to new indexes.
     * @param newElements New Elements array.
     */
    public constructor(indexMap: {[oldIndex: number]: number}, newElements: T[], preventDefault: boolean) {
        this.indexMap = indexMap;
        this.newElements = newElements;
        this.preventDefault = preventDefault;
    }

    /**
     * Returns a clone copy of the index map.
     * The index map keys are the old indexes of the collection.
     * The index map values are the new indexes for the old ones.
     */
    public getIndexMap(): {[oldIndex: number]: number} {
        return Object.assign({}, this.indexMap);
    }

    /**
     * Returns a clone copy of the collection that could be the new collection.
     */
    public getNewElements(): {[index: number]: T} {
        return Object.assign({}, this.newElements);
    }

    /**
     * Returns the prevent default action flag.
     */
    public getPreventDefault(): boolean {
        return this.preventDefault;
    }
}
