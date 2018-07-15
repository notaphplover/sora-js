import { CollectionManager, COLLECTION_MANAGER_EVENTS, CollectionChangeEventArgs } from '../../src/collection/collection-manager'
import { EventEmitter } from 'events';

describe('Collection Manager Tests', () => {

    it('mustBeInitializable', () => {
        var collection : number[] = new Array();
        var eventEmitter = new EventEmitter();
        
        var collectionManager = new CollectionManager(collection, eventEmitter);

        expect(collectionManager).not.toBeNull()
        expect(collectionManager.getCollection()).toBe(collection);
    });

    it('mustBeAbleToAddElements', () => {
        var collection : number[] = [2, 5, 7];
        var eventEmitter = new EventEmitter();

        var beforeIsEmitted = false;
        var afterIsEmitted = false;

        var expected = [2, 10, 5, 8, 7];
        
        var collectionManager = new CollectionManager<number>(collection, eventEmitter);

        eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function(eventArgs : CollectionChangeEventArgs<number>) {
            var indexMap = eventArgs.getIndexMap();
            for(var i = 0; i < collection.length; ++i)
                expect(indexMap[i]).not.toBeNull();

            beforeIsEmitted = true;
        });

        eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionAfterChange, function(eventArgs : CollectionChangeEventArgs<number>) {
            afterIsEmitted = true;
        });

        collectionManager.insertElements({
            1: 10,
            3: 8,
        });

        expect(beforeIsEmitted && afterIsEmitted).toBe(true);

        var actual = collectionManager.getCollection();

        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) 
            expect(actual[i]).toBe(expected[i]);
    });

    it('mustBeAbleToPreventDefaultAction', () => {
        var collection : number[] = [2, 5, 7];
        var eventEmitter = new EventEmitter();

        var beforeIsEmitted = false;
        var afterIsEmitted = false;

        var expected = [2, 5, 7];
        
        var collectionManager = new CollectionManager<number>(collection, eventEmitter);

        eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function(eventArgs : CollectionChangeEventArgs<number>) {
            beforeIsEmitted = true;
            eventArgs.setPreventDefault();
        });

        eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionAfterChange, function(eventArgs : CollectionChangeEventArgs<number>) {
            afterIsEmitted = true;
            expect(eventArgs.getPreventDefault()).toBe(true);
        });

        collectionManager.insertElements({
            1: 10,
            3: 8,
        });

        expect(beforeIsEmitted && afterIsEmitted).toBe(true);

        var actual = collectionManager.getCollection();

        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) 
            expect(actual[i]).toBe(expected[i]);
    });
});