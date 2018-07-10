require('core-js/fn/promise');
import { CarouselBasic } from './carousel/carousel-basic';

var sora = function () {
    return {
        actions: {
            SINGLE_SLIDE_CAROUSEL_ACTIONS : CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS,
        },
        SingleSlideCarousel : CarouselBasic.SingleSlideCarousel,
        styles: {
            SINGLE_SLIDE_CAROUSEL_STYLES : CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES,
        }
    }
} ();

module.exports = sora;