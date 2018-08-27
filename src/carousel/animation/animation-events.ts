import { ISingleSlideCarouselGotoOptions } from '../carousel-basic';
import { AnimationPlayStateValue } from './animation-play-state';

/**
 * Arguments for the event emitter.
 */
export interface ISingleSlideCarouselAnimationEndEventArgs { }

/**
 * Aguments for the event emitter.
 */
export interface ISingleSlideCarouselAnimationPlayStateChangeEventArgs {
    /**
     * New play state value.
     */
    value: AnimationPlayStateValue;
}

/**
 * Arguments for the event emitter.
 */
export interface ISingleSlideCarouselAnimationStartEventArgs {
    /**
     * Animation options.
     */
    options: ISingleSlideCarouselGotoOptions;
}

/**
 * Arguments for the event emitted.
 */
export interface ISingleSlideCarouselCancelAnimationEventArgs {
    /**
     * New active index once the animation is canceled.
     */
    activeIndex: number;
}
