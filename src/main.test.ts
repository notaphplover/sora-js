import { SingleSlideCarouselTests } from './test/carousel/carousel-basic.test';
import { CollectionManagerTests } from './test/collection/collection-manager.test';
import { AnimationEngineTests } from './test/task/animation-engine.test';

const soraTest = function() {
    return {
        performTests: function() {
            new AnimationEngineTests().performTests();
            new CollectionManagerTests().performTests();
            new SingleSlideCarouselTests().performTests();
        },
    };
} ();

module.exports = soraTest;
