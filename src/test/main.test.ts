import { SingleSlideCarouselTests } from './carousel/carousel-basic.test';
import { CollectionManagerTests } from './collection/collection-manager.test';

var soraTest = function() {
    return {
        performTests: function() {
            new SingleSlideCarouselTests().performTests();
            new CollectionManagerTests().performTests();
        },
    }
} ();

module.exports = soraTest;