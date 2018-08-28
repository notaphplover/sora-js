import { AnimationPlayStateValue } from '../carousel/animation/animation-play-state';
import { CAROUSEL_STYLES } from '../carousel/carousel-base';
import { ITaskFlowPart } from './flow/task-flow-part';
import { OperationManager } from './operation-manager';
import { TaskEngine } from './task-engine';

//#region Operation Events

export const ANIMATION_OPERATION_EVENTS = {
    /**
     * Forces the cancelation of the current animation.
     */
    ANIMATION_CANCEL: 'anim.cancel',
    /**
     * Changes the animation play state of the elements of the animation.
     */
    ANIMATION_STATE_CHANGE: 'anim.state.change',
};

/**
 * Arguments for the event emitter.
 */
export interface IAnimationCancelEventArgs {
    /**
     * Aliases of the target parts or null to target all the parts of any animation.
     */
    aliases: string[];
}

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

//#endregion

/**
 * Animation flow part.
 */
export interface IAnimationFlowPart extends ITaskFlowPart {
    /**
     * Elements targeted by the part.
     */
    elements: HTMLElement[];
    /**
     * Pending operations.
     */
    pendingOperations?: IAnimationFlowPartPendingOperations;
    /**
     * Animation styles to apply.
     */
    styles: string[];
}

export interface IAnimationFlowPartPendingOperations {
    /**
     * True if the part must be cancelled.
     */
    cancel: IAnimationFlowPartPendingOperation;
    /**
     * True if the part must be paused.
     */
    pause: IAnimationFlowPartPendingOperation;
}

export interface IAnimationFlowPartPendingOperation {
    /**
     * Token of the subscriber of the operation;
     */
    operationToken: number;
    /**
     * True if the operation is pending.
     */
    isPending: boolean;
}

/**
 * Represenrts a single animation engine.
 */
export class SingleAnimationEngine extends TaskEngine<IAnimationFlowPart> {

    //#region Attributes

    //#region Operators

    /**
     * Animation cancel operation manager.
     */
    protected animationCancelManager: OperationManager<IAnimationCancelEventArgs>;

    /**
     * Animation state change operation manager.
     */
    protected animationStateChangeManager: OperationManager<IAnimationStateChangeEventArgs>;

    /**
     * Creates a new instance.
     */
    public constructor() {
        super();

        this.animationCancelManager =
            new OperationManager<IAnimationCancelEventArgs>(
                ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL,
                this.eventEmitter,
            );
        this.animationStateChangeManager =
            new OperationManager<IAnimationStateChangeEventArgs>(
                ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE,
                this.eventEmitter,
            );
    }

    //#region Public

    /**
     * Disposes the instance.
     */
    public dispose() {
        this.animationCancelManager.dispose();
        this.animationStateChangeManager.dispose();
    }

        //#region Operations

    /**
     * Cancels the animation.
     * @param aliases Aliases of the parts to cancel or null to cancel all the parts.
     */
    public cancelAnimation(aliases: string[]): void {
        this.eventEmitter.emit(
            ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL,
            { aliases : aliases } as IAnimationCancelEventArgs,
        );
    }

    /**
     * Pauses the engine animation.
     * @param aliases Aliases of the animation parts to pause or null to pause all the parts.
     */
    public pause(aliases: string[]): void {
        this.eventEmitter.emit(
            ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE,
            {
                aliases: aliases,
                value: AnimationPlayStateValue.paused,
            } as IAnimationStateChangeEventArgs,
        );
    }

    /**
     * Resumes the engine animation.
     * @param aliases Aliases of the animation parts to resume or null to resume all the parts.
     */
    public resume(aliases: string[]): void {
        this.eventEmitter.emit(
            ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE,
            {
                aliases: aliases,
                value: AnimationPlayStateValue.running,
            } as IAnimationStateChangeEventArgs,
        );
    }

    //#endregion

    //#endregion

    /**
     * Handles an animation part.
     *
     * @param animationFlow Animation flow that contains the anmation part to handle.
     * @param part Animation part to handle.
     * @param eventEmitter Event emitter for the animation.
     *
     * @returns Promise resolved once the animation of the part is finished.
     */
    protected handleTaskPart(part: IAnimationFlowPart): Promise<void> {
        const that = this;
        part.pendingOperations = {
            cancel: {
                isPending: false,
                operationToken: this.animationCancelManager.subscribe(
                    part.alias,
                    function(eventArgs: IAnimationCancelEventArgs) {
                        part.pendingOperations.cancel.isPending = true;
                        that.animationCancelManager.unsubscribe(
                            part.alias, part.pendingOperations.cancel.operationToken,
                        );
                    },
                ),
            },
            pause: {
                isPending: false,
                operationToken: this.animationStateChangeManager.subscribe(
                    part.alias,
                    function(eventArgs: IAnimationStateChangeEventArgs) {
                        part.pendingOperations.pause.isPending =
                            eventArgs.value === AnimationPlayStateValue.paused;
                    },
                ),
            },
        };

        return super.handleTaskPart(part);
    }

    /**
     * Performs a task part.
     * @param part Task part to be performed.
     * @returns Promise resolved once the part task is performed.
     */
    protected performTask(part: IAnimationFlowPart): PromiseLike<{} | void> {

        this.animationCancelManager.unsubscribe(part.alias, part.pendingOperations.cancel.operationToken);
        this.animationStateChangeManager.unsubscribe(part.alias, part.pendingOperations.pause.operationToken);

        const promises: Array<Promise<void>> = new Array(part.elements.length);

        // 2. Perform the animation.
        for (var i = 0; i < part.elements.length; ++i) {
            promises[i] = this.handleAnimationOverElement(part.elements[i], part);
        }

        if (part.pendingOperations) {
            if (part.pendingOperations.pause.isPending) {
                this.pause([part.alias]);
            }

            if (part.pendingOperations.cancel.isPending) {
                this.cancelAnimation([part.alias]);
            }
        }

        return Promise.all(promises);
    }

    //#region Element animation

    /**
     * Handles the animation over an element.
     *
     * @param element element to be animated.
     * @param part Part that contains the element to be animated.
     *
     * @returns Promise resolved once the animation over the element is finished.
     */
    protected handleAnimationOverElement(element: HTMLElement, part: IAnimationFlowPart): Promise<void> {
        const styles: string[] = part.styles;

        if (styles) {
            if (styles.length < 1) {
                throw new Error('It\'s required to have at least one class to generate an animation.');
            }
        } else {
            throw new Error('It\'s required to have an array of styles to generate an animation.');
        }

        const that = this;

        return new Promise<void>(function(resolve, reject) {
            try {
                const animationFunctions: Array<((event: TransitionEvent) => void)> = new Array();
                var currentAnimationIndex: number = null;

                const onAnimationCancel = function(args: IAnimationCancelEventArgs) {
                    // Resume the animation if it is paused.
                    onAnimationPlayStateChange({aliases: args.aliases, value: AnimationPlayStateValue.running});

                    element.classList.add(CAROUSEL_STYLES.CLEAR_ANIMATION);

                    if (null != currentAnimationIndex) {
                        element.classList.remove(styles[currentAnimationIndex]);
                    }

                    that.unregisterAnimationListener(element, animationFunctions[currentAnimationIndex]);
                    element.classList.remove(CAROUSEL_STYLES.CLEAR_ANIMATION);

                    that.animationCancelManager.unsubscribe(part.alias, cancelToken);
                    that.animationStateChangeManager.unsubscribe(part.alias, playStateChangetoken);

                    resolve();
                };

                const cancelToken = that.animationCancelManager.subscribe(part.alias, onAnimationCancel);

                const onAnimationPlayStateChange = function(args: IAnimationStateChangeEventArgs) {
                    if (AnimationPlayStateValue.paused === args.value) {
                        if (!element.classList.contains(CAROUSEL_STYLES.ANIMATION_PAUSED)) {
                            element.classList.add(CAROUSEL_STYLES.ANIMATION_PAUSED);
                        }
                    } else if (AnimationPlayStateValue.running === args.value) {
                        if (element.classList.contains(CAROUSEL_STYLES.ANIMATION_PAUSED)) {
                            element.classList.remove(CAROUSEL_STYLES.ANIMATION_PAUSED);
                        }
                    }
                };

                const playStateChangetoken =
                    that.animationStateChangeManager.subscribe(part.alias, onAnimationPlayStateChange);

                for (var i = 1; i < styles.length; ++i) {
                    animationFunctions.push(function(index) {
                        return function(event: TransitionEvent) {
                            element.classList.remove(styles[index - 1]);
                            that.unregisterAnimationListener(element, animationFunctions[index - 1]);
                            that.registerAnimationListener(element, animationFunctions[index]);
                            element.classList.add(styles[index]);
                            currentAnimationIndex = index;
                        };
                    } (i));
                }

                // Add the clear function
                animationFunctions.push(function(event: TransitionEvent) {
                    element.classList.add(CAROUSEL_STYLES.CLEAR_ANIMATION);
                    element.classList.remove(styles[styles.length - 1]);
                    element.classList.remove(CAROUSEL_STYLES.CLEAR_ANIMATION);
                    that.unregisterAnimationListener(element, animationFunctions[animationFunctions.length - 1]);
                    currentAnimationIndex = null;
                    that.animationCancelManager.unsubscribe(part.alias, cancelToken);
                    that.animationStateChangeManager.unsubscribe(part.alias, playStateChangetoken);
                    resolve();
                });

                that.registerAnimationListener(element, animationFunctions[0]);
                element.classList.add(styles[0]);
                currentAnimationIndex = 0;
            } catch (ex) {
                reject(ex);
            }
        });
    }

    /**
     * Handles the end of a transition over an element.
     * @param element Element whose event will be handled.
     * @param listener Event listener.
     */
    private registerAnimationListener(element: HTMLElement, listener: (element: TransitionEvent) => void): void {
        element.addEventListener('animationend', listener);
        element.addEventListener('webkitAnimationEnd', listener);
    }

    /**
     * Unsubscribes an event handler from the list of listeners of an element
     * @param element Target element.
     * @param listener Listener to be unsubscribed.
     */
    private unregisterAnimationListener(element: HTMLElement, listener: (element: TransitionEvent) => void): void {
        element.removeEventListener('animationend', listener);
        element.removeEventListener('webkitAnimationEnd', listener);
    }

    //#endregion
}
