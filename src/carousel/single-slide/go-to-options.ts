import { ICarouselAnimation } from '../animation/carousel-animation';

/**
 * Options for the handleGoTo method.
 */
export interface ISingleSlideCarouselGotoOptions {
    /**
     * Custom animation for the incoming slide.
     */
    enterAnimation: ICarouselAnimation;
    /**
     * Index of the element to display.
     */
    index: number;
    /**
     * Custom animation for the outcoming slide.
     */
    leaveAnimation: ICarouselAnimation;
}
