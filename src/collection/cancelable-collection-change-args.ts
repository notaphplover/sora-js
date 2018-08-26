import { CollectionChangeEventArgs } from './collection-change-args';

export class CancelableCollectionChangeEventArgs<T> extends CollectionChangeEventArgs<T> {
    /**
     * Creates a new instance.
     * @param indexMap Index map, from old indexes to new indexes.
     * @param newElements New Elements array.
     */
    public constructor(indexMap: {[oldIndex: number]: number}, newElements: T[]) {
        super(indexMap, newElements, false);
    }

    /**
     * Sets the prevent default action flag to true.
     */
    public setPreventDefault(): void {
        this.preventDefault = true;
    }
}
