import { CollectionManager, CollectionChangeEventArgs } from "./collection-manager";
import { EventEmitter } from "events";

export class HtmlChildrenManager extends CollectionManager<HTMLElement> {
    /**
     * Parent element of the members of the collection
     */
    protected parentElement : HTMLElement;

    public constructor(collection : HTMLElement[], eventEmitter : EventEmitter, parentElement : HTMLElement) {
        super(collection, eventEmitter);

        this.parentElement = parentElement;
    }

    /**
     * Attemps to change the collection managed by this instance.
     * @param indexMap Map from old indexes to new indexes.
     * @param newElements New elements to manage if the change is not prevented.
     */
    protected internalTryToChangeCollection(indexMap : {[oldIndex : number] : number} = {}, newElements : HTMLElement[]) : CollectionChangeEventArgs<HTMLElement> {
        var eventArgs = super.internalTryToChangeCollection(indexMap, newElements);

        if (!eventArgs.getPreventDefault()) {
            //Perform DOM modifications.
            var deletionPivot = 0;
            var insertionPivot = 0;
            var oldIndexesCounter = 0;
            var newIndexesCounter = 0;

            //Important: Keys must be guaranteed to be ordered!
            for (var key in indexMap) {
                var keyNumber : number = Number(key)
                for (var i = oldIndexesCounter; i < keyNumber; ++i) {
                    //Delete old elements
                    this.parentElement.removeChild(this.parentElement.children[i + insertionPivot - deletionPivot]);
                    ++deletionPivot;
                }

                var newIndex : number = indexMap[key];
                for (var i = newIndexesCounter; i < newIndex; ++i) {
                    //Insert new elements.
                    this.parentElement.insertBefore(newElements[i], this.parentElement.children[i]);
                    ++insertionPivot;
                }

                oldIndexesCounter = keyNumber + 1;
                newIndexesCounter = newIndex + 1;
            }

            for (var i = newIndexesCounter; i < newElements.length; ++i) 
                this.parentElement.appendChild(newElements[i]);
        }

        return eventArgs;
    }
}