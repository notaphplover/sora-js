export class TokenMap<T> {
    //#region Properties

    /**
     * Inner map.
     */
    protected innerMap: Map<number, T>;

    /**
     * List of unused indexed bellow the maximun used index.
     */
    protected unusedIndexes: number[];

    //#endregion

    public constructor() {
        this.innerMap = new Map<number, T>();
        this.unusedIndexes = new Array();
    }

    /**
     * Adds an element to the array collection.
     * @param elem Element to be added to the array.
     * @returns index in which the element is located.
     */
    public add(elem: T): number {
        if (0 === this.unusedIndexes.length) {
            const lastIndex: number = this.innerMap.size;
            this.innerMap.set(lastIndex, elem);
            return lastIndex;
        } else {
            const lastIndex: number = this.unusedIndexes[this.unusedIndexes.length - 1];
            --this.unusedIndexes.length;
            this.innerMap.set(lastIndex, elem);
            return lastIndex;
        }
    }

    /**
     * Obtains the amount of elements inside the array.
     * @returns Amount of elements inside the array.
     */
    public count(): number {
        return this.innerMap.size;
    }

    /**
     * Iterates over the array and applies a function.
     * @param consumer Function to apply to any pair of index-element found (undefined values are discarted).
     */
    public foreach(consumer: (value: T, key: number) => void): void {
        this.innerMap.forEach(function(value: T, key: number) {
            consumer(value, key);
        });
    }

    /**
     * Obtains an element at the specified index.
     * @param index Index of the element to obtaint.
     * @returns Element obtianed at the specified index.
     */
    public get(index: number): T {
        return this.innerMap.get(index);
    }

    /**
     * Removes an element at the position specified.
     * @param index Index of the element to be removed.
     * @returns Result of the operation.
     */
    public remove(index: number): boolean {
        if (this.innerMap.has(index)) {
            this.innerMap.delete(index);
            this.unusedIndexes[this.unusedIndexes.length] = index;
            return true;
        } else {
            return false;
        }
    }
}
