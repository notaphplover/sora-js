import { EventEmitter } from "events";
import { CarouselBase } from "../carousel-base";
import { AnimationPlayStateValue } from "./animation-play-state";
import { OperationManager } from "./operation-manager";

/**
 * Animation constraint types
 */
export const ANIMATION_CONSTRAINT_TYPES = {
    /**
     * Requires the start of an animation part.
     */
    ANIMATION_BEGIN : 'anim.begin',
    /**
     * Requires the end of an animation part.
     */
    ANIMATION_END: 'anim.end',
    /**
     * Requires a group of constraints.
     */
    GROUP: 'group',
    /**
     * Requires an amount of time.
     */
    WAIT_FOR: 'wait',
};

//#region Operation Events

export const ANIMATION_OPERATION_EVENTS = {
    /**
     * Forces the cancelation of the current animation
     */
    ANIMATION_CANCEL: 'anim.cancel',
    /**
     * Changes the animation play state of the elements of the animation.
     */
    ANIMATION_STATE_CHANGE: 'anim.state.change',
}

/**
 * Arguments for the event emitter
 */
export interface IAnimationCancelEventArgs {
    /**
     * Aliases of the target parts or null to target all the parts of any animation.
     */
    aliases : string[],
}

/**
 * Aguments for the event emitter.
 */
export interface IAnimationStateChangeEventArgs {
    /**
     * Aliases of the target parts or null to target all the parts of any animation.
     */
    aliases: string[],
    /**
     * Play state value.
     */
    value : AnimationPlayStateValue,
}

//#endregion

/**
 * Prixes used to ganerate alias for events over single animation parts.
 */
const ANIMATION_PART_WHEN_EVENT_PREFIXES = {
    /**
     * Prefix for any event raised one an animation part has started.
     */
    ANIMATION_BEGIN: 'anim.begin.',
    /**
     * Prefix for any event raised one an animation part has ended.
     */
    ANIMATION_END: 'anim.end.',
};

//#region Enum

/**
 * Logical operator to apply.
 */
export enum AnimationPartWhenOperator {
    /**
     * And operator.
     */
    AND,
    /**
     * Or operator.
     */
    OR,
}

//#endregion

/**
 * Animation flow.
 *
 * The flow is composed by parts.
 * Each part represents the animation of a set of elements.
 */
export interface IAnimationFlow {
    /**
     * Animation parts.
     */
    parts : IAnimationFlowPart[],

    /**
     * Search an animation part by its alias.
     * @param alias Alias of the part to search.
     */
    getPartByAlias(alias : string) : IAnimationFlowPart,
}

/**
 * Animation flow part.
 */
export interface IAnimationFlowPart {
    /**
     * Alias of the part
     */
    alias: string,
    /**
     * Elements targeted by the part
     */
    elements: HTMLElement[],
    /**
     * Animation styles to apply.
     */
    styles: string[],
    /**
     * Constraints to ensure before applying the styles.
     */
    when: IAnimationPartWhenConstraint,
}

/**
 * Animation part constraint that determines the start of the animation.
 */
export interface IAnimationPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    after: IAnimationPartWhenConstraint,
    /**
     * Type of this constraint.
     */
    constraintType: string,
}

/**
 * Animation part constraint that determines the start of the animation.
 */
export abstract class AnimationPartWhenConstraint implements IAnimationPartWhenConstraint {
    /**
     * When entity to check once this constraint is ensured.
     */
    public after : IAnimationPartWhenConstraint;
    /**
     * Type of this constraint.
     */
    public constraintType : string;

    /**
     * Creates a new animation part constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param constraintType Constraint type.
     */
    public constructor(after : IAnimationPartWhenConstraint, constraintType : string) {
        this.after = after;
        this.constraintType = constraintType;
    }
}

export abstract class AnimationPartConstraint extends AnimationPartWhenConstraint {
    /**
     * Aliases of the parts affected by this constraint.
     */
    public alias : string;

    /**
     * Creates a new animation parts constraint.
     * @param after Constraint to apply after this constraint is checked.
     * @param alias Aliases of the parts affected by this constraint.
     * @param constraintType Constraint type.
     */
    public constructor(after : IAnimationPartWhenConstraint, alias : string, constraintType : string) {
        super(after, constraintType);

        this.alias = alias;
    }
}

/**
 * Represents a when constraint that is checked once an animation part starts.
 */
export class AnimationPartBeginConstraint extends AnimationPartConstraint {
    public constructor(after : IAnimationPartWhenConstraint, alias : string) {
        super(after, alias, ANIMATION_CONSTRAINT_TYPES.ANIMATION_BEGIN)
    }
}

/**
 * Represents a when constraint that is checked once an animation part ends.
 */
export class AnimationPartEndConstraint extends AnimationPartConstraint {
    public constructor(after : IAnimationPartWhenConstraint, alias : string) {
        super(after, alias, ANIMATION_CONSTRAINT_TYPES.ANIMATION_END)
    }
}

/**
 * Represents a when constraint that is checked once an amount of time passes.
 */
export class AnimationTimeConstraint extends AnimationPartWhenConstraint {
    /**
     * Milliseconds to wait.
     */
    public millis : number;

    public constructor(after : IAnimationPartWhenConstraint, millis : number) {
        super(after, ANIMATION_CONSTRAINT_TYPES.WAIT_FOR);

        this.millis = millis;
    }
}

/**
 * Represents a when constraint that is checked once a group of constraints is checked.
 */
export class AnimationGroupConstraint extends AnimationPartWhenConstraint {
    /**
     * Constraints to ensure
     */
    public constraints: IAnimationPartWhenConstraint[];
    /**
     * Logical operator
     */
    public operator: AnimationPartWhenOperator;

    /**
     * Creates a new instance.
     *
     * @param after Constraint to check after all the constraitns of the group have successfully checked.
     * @param constraints Group of constraints to check.
     * @param operator Logical operator to apply.
     */
    public constructor(after : IAnimationPartWhenConstraint, constraints: IAnimationPartWhenConstraint[], operator: AnimationPartWhenOperator) {
        super(after, ANIMATION_CONSTRAINT_TYPES.GROUP);

        this.constraints = constraints;
        this.operator = operator;
    }
}

/**
 * Represenrts a single animation engine.
 */
export class SingleAnimationEngine {

    //#region Attributes

    //#region Operators

    protected animationCancelManager : OperationManager<IAnimationCancelEventArgs>;

    protected animationStateChangeManager : OperationManager<IAnimationStateChangeEventArgs>

    //#endregion

    /**
     * Animation currently managed.
     */
    protected animation : IAnimationFlow;

    /**
     * Event emitter to use
     */
    protected eventEmitter : EventEmitter;

    //#endregion

    /**
     * Creates a new instance.
     */
    public constructor() {
        this.eventEmitter = new EventEmitter();

        this.animationCancelManager = new OperationManager<IAnimationCancelEventArgs>(ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, this.eventEmitter);
        this.animationStateChangeManager = new OperationManager<IAnimationStateChangeEventArgs>(ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, this.eventEmitter);
    }

    /**
     * Disposes the instance.
     */
    public dispose() {
        this.animationCancelManager.dispose();
        this.animationStateChangeManager.dispose();
    }

    /**
     * Handles an animation flow.
     * @param animationFlow Animation flow to be managed.
     * @returns Animation part promises.
     */
    public handle(animationFlow : IAnimationFlow) : Promise<void>[] {

        if (animationFlow == null)
            throw new Error('It\'s required an animation flow.');

        if (animationFlow.parts == null)
            throw new Error('It\'s required an animation flow with parts.');

        this.animation = animationFlow;
        var partPromises : Promise<void>[] = new Array(animationFlow.parts.length);

        for (var i = 0; i < animationFlow.parts.length; ++i)
            partPromises[i] = this.handleAnimationPart(animationFlow.parts[i]);

        return partPromises;
    }

    /**
     * Handles an animation part.
     *
     * @param animationFlow Animation flow that contains the anmation part to handle.
     * @param part Animation part to handle.
     * @param eventEmitter Event emitter for the animation.
     *
     * @returns Promise resolved once the animation of the part is finished.
     */
    protected handleAnimationPart(part : IAnimationFlowPart) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            that.handleAnimationPartWhen(part.when).then(function() {
                //1. Emit the start of animation of the part.
                that.eventEmitter.emit(ANIMATION_PART_WHEN_EVENT_PREFIXES.ANIMATION_BEGIN + part.alias, {});

                var promises : Promise<void>[] = new Array(part.elements.length);

                //2. Perform the animation.
                for (var i = 0; i < part.elements.length; ++i)
                    promises[i] = that.handleAnimationOverElement(part.elements[i], part);

                Promise.all(promises).then(function() {
                    //3. Emit the end of the animation of the part.
                    that.eventEmitter.emit(ANIMATION_PART_WHEN_EVENT_PREFIXES.ANIMATION_END + part.alias, {});
                    resolve();
                });
            }).catch(function(err : any) {
                reject(err);
            });
        });
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
    protected handleAnimationOverElement(element : HTMLElement, part : IAnimationFlowPart) : Promise<void> {
        var styles : string[] = part.styles;

        if (styles) {
            if (styles.length < 1)
                throw new Error('It\'s required to have at least one class to generate an animation.');
        } else
            throw new Error('It\'s required to have an array of styles to generate an animation.');

        var that = this;

        return new Promise<void>(function(resolve, reject) {
            try {
                var animationFunctions : ((event : TransitionEvent) => void)[] = new Array();
                var currentAnimationIndex : number = null;

                var onAnimationCancel = function(args : IAnimationCancelEventArgs) {
                    element.classList.add(CarouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);

                    if (currentAnimationIndex != null)
                        element.classList.remove(styles[currentAnimationIndex]);

                    that.unregisterAnimationListener(element, animationFunctions[currentAnimationIndex]);
                    element.classList.remove(CarouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);

                    that.animationCancelManager.unsubscribe(part.alias);
                    that.animationStateChangeManager.unsubscribe(part.alias);

                    resolve();
                };

                that.animationCancelManager.subscribe(part.alias, onAnimationCancel);

                var onAnimationPlayStateChange = function(args : IAnimationStateChangeEventArgs) {
                    if (AnimationPlayStateValue.paused == args.value) {
                        if (!element.classList.contains(CarouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED))
                            element.classList.add(CarouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED);
                    } else if (AnimationPlayStateValue.running == args.value) {
                        if (element.classList.contains(CarouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED))
                            element.classList.remove(CarouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED);
                    }
                };

                that.animationStateChangeManager.subscribe(part.alias, onAnimationPlayStateChange);

                for (var i = 1; i < styles.length; ++i) {
                    animationFunctions.push(function(index) {
                        return function(event : TransitionEvent) {
                            element.classList.remove(styles[index - 1]);
                            that.unregisterAnimationListener(element, animationFunctions[index - 1]);
                            that.registerAnimationListener(element, animationFunctions[index]);
                            element.classList.add(styles[index]);
                            currentAnimationIndex = index;
                        }
                    } (i));
                }

                //add the clear function
                animationFunctions.push(function(event : TransitionEvent) {
                    element.classList.add(CarouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                    element.classList.remove(styles[styles.length - 1]);
                    element.classList.remove(CarouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                    that.unregisterAnimationListener(element, animationFunctions[animationFunctions.length - 1]);
                    currentAnimationIndex = null;
                    that.eventEmitter.removeListener(ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, onAnimationCancel);
                    that.eventEmitter.removeListener(ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, onAnimationPlayStateChange);

                    resolve();
                });

                that.registerAnimationListener(element, animationFunctions[0]);
                element.classList.add(styles[0]);
                currentAnimationIndex = 0;
            } catch(ex) {
                reject(ex);
            }
        });
    }

    /**
     * Handles the end of a transition over an element.
     * @param element Element whose event will be handled.
     * @param listener Event listener.
     */
    private registerAnimationListener(element : HTMLElement, listener : (element : TransitionEvent) => void) : void {
        element.addEventListener('animationend', listener);
        element.addEventListener('webkitAnimationEnd', listener);
    }

    /**
     * Unsubscribes an event handler from the list of listeners of an element
     * @param element Target element
     * @param listener Listener to be unsubscribed.
     */
    private unregisterAnimationListener(element : HTMLElement, listener : (element : TransitionEvent) => void) : void {
        element.removeEventListener('animationend', listener);
        element.removeEventListener('webkitAnimationEnd', listener);
    }

    //#endregion

    //#region AnimationPartWhenconstraint

    /**
     * Handles the when entity of an animation part.
     *
     * @param animationFlow Animation flow that contains the animation part that contains the when entity.
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleAnimationPartWhen(whenEntity : IAnimationPartWhenConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            if (whenEntity == null)
            resolve();

            switch(whenEntity.constraintType) {
                case ANIMATION_CONSTRAINT_TYPES.ANIMATION_BEGIN:
                    that.handleAnimationPartWhenAnimationBegin(whenEntity as AnimationPartBeginConstraint)
                        .then(resolve);
                    break;
                case ANIMATION_CONSTRAINT_TYPES.ANIMATION_END:
                    that.handleAnimationPartWhenAnimationEnd(whenEntity as AnimationPartEndConstraint)
                        .then(resolve);
                    break;
                case ANIMATION_CONSTRAINT_TYPES.GROUP:
                    that.handleAnimationPartWhenAnimationGroup(whenEntity as AnimationGroupConstraint)
                        .then(resolve);
                    break;
                case ANIMATION_CONSTRAINT_TYPES.WAIT_FOR:
                    that.handleAnimationPartWhenWaitFor(whenEntity as AnimationTimeConstraint)
                        .then(resolve);
                    break;
                default:
                    throw new Error('Unexpected when entity type.');
            }
        });
    }

    /**
     * Handles the when entity (AnimationPartBeginConstraint) of an animation part.
     *
     * @param animationFlow Animation flow that contains the animation part that contains the when entity.
     * @param whenEntity When entity to handle.
     * @param eventEmitter Event emmiter of the animation flow.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleAnimationPartWhenAnimationBegin(whenEntity : AnimationPartBeginConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var eventName = ANIMATION_PART_WHEN_EVENT_PREFIXES.ANIMATION_BEGIN + whenEntity.alias;
            var eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (whenEntity.after == null)
                    resolve();
                else
                    that.handleAnimationPartWhen(whenEntity.after)
                        .then(resolve);
            };
            that.eventEmitter.addListener(eventName, eventHandler);
        });
    }

    /**
     * Handles the when entity (AnimationPartEndConstraint) of an animation part.
     *
     * @param animationFlow Animation flow that contains the animation part that contains the when entity.
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleAnimationPartWhenAnimationEnd(whenEntity : AnimationPartEndConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var eventName = ANIMATION_PART_WHEN_EVENT_PREFIXES.ANIMATION_END + whenEntity.alias;
            var eventHandler = function() {
                that.eventEmitter.removeListener(eventName, eventHandler);
                if (whenEntity.after == null)
                    resolve();
                else
                    that.handleAnimationPartWhen(whenEntity.after)
                        .then(resolve);
            };
            that.eventEmitter.addListener(eventName, eventHandler);
        });
    }

    /**
     * Handles the when entity (AnimationGroupConstraint) of an animation part.
     *
     * @param animationFlow Animation flow that contains the animation part that contains the when entity.
     * @param whenEntity When entity to handle.
     * @param eventEmitter Event emmiter of the animation flow.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleAnimationPartWhenAnimationGroup(whenEntity : AnimationGroupConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            var childPromises : Promise<void>[] = new Array(whenEntity.constraints.length);

            for (var i = 0; i < whenEntity.constraints.length; ++i) {
                childPromises[i] = new Promise<void>(function(resolve, reject) {
                    that.handleAnimationPartWhen(whenEntity.constraints[i])
                        .then(resolve);
                });
            }

            if (AnimationPartWhenOperator.AND == whenEntity.operator)
                Promise.all(childPromises)
                    .then(function() {
                        resolve();
                    });
            else if (AnimationPartWhenOperator.OR == whenEntity.operator)
                Promise.race(childPromises)
                .then(function() {
                    resolve();
                });
            else
                reject('Unexpected operator.')
        });
    }

    /**
     * Handles the when entity (AnimationTimeConstraint) of an animation part.
     *
     * @param animationFlow Animation flow that contains the animation part that contains the when entity.
     * @param whenEntity When entity to handle.
     *
     * @returns Promise resolved once the when entity is checked.
     */
    protected handleAnimationPartWhenWaitFor(whenEntity : AnimationTimeConstraint) : Promise<void> {
        var that = this;
        return new Promise<void>(function(resolve, reject) {
            setTimeout(function() {
                if (whenEntity.after == null) {
                    resolve();
                } else {
                    that.handleAnimationPartWhen(whenEntity.after)
                        .then(resolve);
                }
            }, whenEntity.millis);
        });
    }

    //#endregion
}