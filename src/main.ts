require('core-js/fn/promise');
import {
    SingleSlideCarousel,
    SINGLE_SLIDE_CAROUSEL_ACTIONS,
    SINGLE_SLIDE_CAROUSEL_EVENTS,
    SINGLE_SLIDE_CAROUSEL_STYLES
 } from './carousel/carousel-basic';

var sora = function () {
    return {
        actions: {
            SINGLE_SLIDE_CAROUSEL_ACTIONS : SINGLE_SLIDE_CAROUSEL_ACTIONS,
        },
        events: {
            SINGLE_SLIDE_CAROUSEL_EVENTS : SINGLE_SLIDE_CAROUSEL_EVENTS,
        },
        SingleSlideCarousel : SingleSlideCarousel,
        styles: {
            SINGLE_SLIDE_CAROUSEL_STYLES : SINGLE_SLIDE_CAROUSEL_STYLES,
        }
    }
} ();

module.exports = sora;