require('core-js/fn/promise');

import {
    SINGLE_SLIDE_CAROUSEL_ACTIONS,
    SINGLE_SLIDE_CAROUSEL_EVENTS,
    SINGLE_SLIDE_CAROUSEL_STYLES,
    SingleSlideCarousel,
 } from './carousel/carousel-basic';

const sora = function() {
    return {
        SingleSlideCarousel: SingleSlideCarousel,
        actions: {
            SINGLE_SLIDE_CAROUSEL_ACTIONS : SINGLE_SLIDE_CAROUSEL_ACTIONS,
        },
        events: {
            SINGLE_SLIDE_CAROUSEL_EVENTS : SINGLE_SLIDE_CAROUSEL_EVENTS,
        },
        styles: {
            SINGLE_SLIDE_CAROUSEL_STYLES : SINGLE_SLIDE_CAROUSEL_STYLES,
        },
    };
} ();

module.exports = sora;
