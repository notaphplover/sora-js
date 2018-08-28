import { EventEmitter } from 'events';
import { CancelableCollectionChangeEventArgs } from '../../collection/cancelable-collection-change-args';
import { CollectionChangeEventArgs } from '../../collection/collection-change-args';
import {
    COLLECTION_MANAGER_EVENTS,
    CollectionManager,
} from '../../collection/collection-manager';
import { ITest } from '../ITest';

export class CollectionManagerTests implements ITest {

    public performTests(): void {
        describe('Collection Manager Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToAddElements();
            this.itMustBeAbleToPreventDefaultActionWhenAddingElements();
            this.itMustBeAbleToPreventDefaultActionWhenRemovingElements();
            this.itMustBeAbleToRemoveElements();
        });
    }

    private itMustBeInitializable(): void {
        it('mustBeInitializable', () => {
            const collection: number[] = new Array();
            const eventEmitter = new EventEmitter();
            const collectionManager = new CollectionManager(collection, eventEmitter);

            expect(collectionManager).not.toBeNull();
            expect(collectionManager.getCollection()).toBe(collection);
        });
    }

    private itMustBeAbleToAddElements() {
        it('mustBeAbleToAddElements', () => {
            const collection: number[] = [2, 5, 7];
            const eventEmitter = new EventEmitter();
            const expected: number[] = [2, 10, 5, 8, 7];
            const collectionManager = new CollectionManager<number>(collection, eventEmitter);

            var beforeIsEmitted = false;
            var afterIsEmitted = false;

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionBeforeChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    const indexMap = eventArgs.getIndexMap();
                    for (var i = 0; i < collection.length; ++i) {
                        expect(indexMap[i]).not.toBeNull();
                    }
                    beforeIsEmitted = true;
                },
            );

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionAfterChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    afterIsEmitted = true;
                },
            );

            collectionManager.insertElements({
                1: 10,
                3: 8,
            });

            expect(beforeIsEmitted && afterIsEmitted).toBe(true);
            const actual = collectionManager.getCollection();
            expect(actual.length).toBe(expected.length);

            for (var i = 0; i < expected.length; ++i) {
                expect(actual[i]).toBe(expected[i]);
            }
        });
    }

    private itMustBeAbleToPreventDefaultActionWhenAddingElements() {
        it('mustBeAbleToPreventDefaultActionWhenAddingElements', () => {
            const collection: number[] = [2, 5, 7];
            const eventEmitter = new EventEmitter();
            const collectionManager = new CollectionManager<number>(collection, eventEmitter);
            const expected = [2, 5, 7];

            var beforeIsEmitted = false;
            var afterIsEmitted = false;

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionBeforeChange,
                    function(eventArgs: CancelableCollectionChangeEventArgs<number>) {
                    beforeIsEmitted = true;
                    eventArgs.setPreventDefault();
                },
            );

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionAfterChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    afterIsEmitted = true;
                    expect(eventArgs.getPreventDefault()).toBe(true);
                },
            );

            collectionManager.insertElements({
                1: 10,
                3: 8,
            });

            expect(beforeIsEmitted && afterIsEmitted).toBe(true);

            const actual = collectionManager.getCollection();
            expect(actual.length).toBe(expected.length);

            for (var i = 0; i < expected.length; ++i) {
                expect(actual[i]).toBe(expected[i]);
            }
        });
    }

    private itMustBeAbleToPreventDefaultActionWhenRemovingElements() {
        it('mustBeAbleToPreventDefaultActionWhenRemovingElements', () => {
            const collection: number[] = [2, 10, 5, 8, 7];
            const indexesToBeRemoved = [1, 3];
            const expected = [2, 10, 5, 8, 7];
            const eventEmitter = new EventEmitter();
            const collectionManager = new CollectionManager<number>(collection, eventEmitter);

            var beforeIsEmitted = false;
            var afterIsEmitted = false;

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionBeforeChange,
                function(eventArgs: CancelableCollectionChangeEventArgs<number>) {
                    eventArgs.setPreventDefault();
                    beforeIsEmitted = true;
                },
            );

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionAfterChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    expect(eventArgs.getPreventDefault()).toBe(true);
                    afterIsEmitted = true;
                },
            );

            collectionManager.removeElements(indexesToBeRemoved);

            expect(beforeIsEmitted && afterIsEmitted).toBe(true);

            const actual = collectionManager.getCollection();
            expect(actual.length).toBe(expected.length);

            for (var i = 0; i < expected.length; ++i) {
                expect(actual[i]).toBe(expected[i]);
            }
        });
    }

    private itMustBeAbleToRemoveElements() {
        it('mustBeAbleToRemoveElements', () => {
            const collection: number[] = [2, 10, 5, 8, 7];
            const eventEmitter = new EventEmitter();
            const collectionManager = new CollectionManager<number>(collection, eventEmitter);
            var beforeIsEmitted = false;
            var afterIsEmitted = false;

            const indexesToBeRemoved = [1, 3];
            const expected = [2, 5, 7];

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionBeforeChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    const indexMap = eventArgs.getIndexMap();
                    for (const indexToBeRemoved of indexesToBeRemoved) {
                        expect(indexMap[indexToBeRemoved]).toBeUndefined();
                    }
                    beforeIsEmitted = true;
                });

            eventEmitter.on(
                COLLECTION_MANAGER_EVENTS.collectionAfterChange,
                function(eventArgs: CollectionChangeEventArgs<number>) {
                    afterIsEmitted = true;
                },
            );

            collectionManager.removeElements(indexesToBeRemoved);
            expect(beforeIsEmitted && afterIsEmitted).toBe(true);
            const actual = collectionManager.getCollection();
            expect(actual.length).toBe(expected.length);

            for (var i = 0; i < expected.length; ++i) {
                expect(actual[i]).toBe(expected[i]);
            }
        });
    }
}
