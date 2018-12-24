import { AnimationEngineTests } from './test/animation/animation-engine.test';
import { SingleSlideCarouselTests } from './test/carousel/single-slide-carousel.test';
import { CollectionManagerTests } from './test/collection/collection-manager.test';

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
