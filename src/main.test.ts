import { SingleSlideCarouselTests } from './test/carousel/carousel-basic.test';
import { CollectionManagerTests } from './test/collection/collection-manager.test';

var soraTest = function() {
    return {
        performTests: function() {
            new SingleSlideCarouselTests().performTests();
            new CollectionManagerTests().performTests();
        },
    }
} ();

module.exports = soraTest;