import { AnimationPlayStateValue } from './animation-play-state';

/**
 * Aguments for the event emitter.
 */
export interface IAnimationStateChangeEventArgs {
    /**
     * Aliases of the target parts or null to target all the parts of any animation.
     */
    aliases: string[];
    /**
     * Play state value.
     */
    value: AnimationPlayStateValue;
}
