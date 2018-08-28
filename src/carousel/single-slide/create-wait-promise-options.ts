/**
 * Options for creating a promise that waits for an amount of time.
 *
 * If the carousel is paused, the amount of time in this state will be ignored by the promise.
 */
export interface ISingleSlideCarouselCreateWaitPromiseOptions {
    /**
     * Amount of milliseconds to wait
     */
    millis: number;
    /**
     * If set to true, the promise will be resolved if the animation is canceled.
     */
    stopOnCancelAnimation: boolean;
}
