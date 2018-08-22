import { CarouselBase } from './carousel-base'
import { ICarouselAnimation, ICarouselAnimationChildrenStyles } from './animation/carousel-animation'
import { AnimationPlayStateValue } from './animation/animation-play-state'
import { EventEmitter } from 'events';
import {
    CancelableCollectionChangeEventArgs,
    CollectionChangeEventArgs,
    COLLECTION_MANAGER_EVENTS,
} from '../collection/collection-manager';
import { HtmlChildrenManager } from '../collection/html-children-manager';
import { SingleAnimationEngine, IAnimationFlow, IAnimationFlowPart } from './animation/animation-engine';

export namespace CarouselBasic {

    /* #region Interfaces */

    /**
     * Options for animating an element
     */
    export interface ISingleSlideCarouselAnimateElementOptions {
        /**
         * Element to be animated
         */
        element : HTMLElement;
        /**
         * Styles too be applied.
         */
        styles: string[];
    }

    /**
     * Arguments for the event emitter.
     */
    export interface ISingleSlideCarouselAnimationEndEventArgs {

    }

    /**
     * Aguments for the event emitter.
     */
    export interface ISingleSlideCarouselAnimationPlayStateChangeEventArgs {
        value : AnimationPlayStateValue,
    }

    /**
     * Arguments for the event emitter.
     */
    export interface ISingleSlideCarouselAnimationStartEventArgs {
        options : ISingleSlideCarouselGotoOptions,
    }

    /**
     * Arguments for the event emitted.
     */
    export interface ISingleSlideCarouselCancelAnimationEventArgs {
        activeIndex : number;
    }

    /**
     * Options for creating a promise that waits for an amount of time.
     *
     * If the carousel is paused, the amount of time in this state will be ignored by the promise.
     */
    export interface ISingleSlideCarouselCreateWaitPromiseOptions {
        /**
         * Amount of milliseconds to wait
         */
        millis : number,
        /**
         * If set to true, the promise will be resolved if the animation is canceled.
         */
        stopOnCancelAnimation : boolean,
    }

    /**
     * Options for creating a carousel.
     */
    export interface ISingleSlideCarouselCreationOptions {
        /**
         * First slide to be displayed.
         */
        index? : number;
    }

    /**
     * Status of a GoTo animation
     */
    export interface ISingleSlideCarouselGoToAnimationStatus {
        /**
         * Animation promises
         */
        animationPromises : Promise<void>[],
        /**
         * Promise resolved once Sora has ended the handling of the animation.
         */
        soraHandlerStatus : Promise<void>;
    }

    /**
     * Options for the handleGoTo method.
     */
    export interface ISingleSlideCarouselGotoOptions {
        /**
         * Custom animation for the incoming slide.
         */
        enterAnimation : ICarouselAnimation;
        /**
         * Index of the element to display.
         */
        index : number;
        /**
         * Custom animation for the outcoming slide.
         */
        leaveAnimation : ICarouselAnimation;
    }

    /**
     * Options for the event
     */
    export interface ISingleSlideCarouselSlideEnterEventArgs extends ISingleSlideCarouselAnimateElementOptions { }

    /**
     * Options for the event
     */
    export interface ISingleSlideCarouselSlideLeaveEventArgs extends ISingleSlideCarouselAnimateElementOptions { }

    /* #endregion */

    /* #region Constants */

    /**
     * Actions avaiable for the SingleSlideCarousel.
     */
    export const SINGLE_SLIDE_CAROUSEL_ACTIONS = {
        GO_TO: 'to',
        GO_TO_NEXT: 'next',
        GO_TO_PREVIOUS: 'prev',
    };

    /**
     * Events directly handled by the carousel.
     */
    export const SINGLE_SLIDE_CAROUSEL_EVENTS = {
        ON_ANIMATION_END: 'car.anim.out',
        ON_ANIMATION_PLAY_STATE_CHANGE: 'car.anim.state.ch',
        ON_ANIMATION_START: 'car.anim.in',
        ON_CANCEL_ANIMATION: 'car.anim.cancel',
        ON_SLIDE_ENTER: 'car.sl.in',
        ON_SLIDE_LEAVE: 'car.sl.out',
    };

    const SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = {
        ENTER: 'enter-part',
        LEAVE: 'leave-part',
    }

    /**
     * Carousel classes used for multiple purposes.
     */
    export const SINGLE_SLIDE_CAROUSEL_STYLES = {
        SLIDE_HIDDEN: 'sora-hidden',
        SLIDE_ACTIVE: 'sora-slide-active',
    };

    /* #endregion */

    /**
     * Represents a carousel with a single active slide at a time.
     */
    export class SingleSlideCarousel extends CarouselBase.CarouselBase {

        //#region Attributes

        /**
         * Active index of the elements of the carousel.
         */
        protected activeIndex : number;

        /**
         * Current active animation
         */
        protected currentAnimation : ISingleSlideCarouselGotoOptions;

        /**
         * collection manager
         */
        protected elementsManager : HtmlChildrenManager;

        /**
         * Engine animation.
         */
        protected engineAnimation : SingleAnimationEngine;

        /**
         * Flag to determine if the carousel animation is paused.
         */
        protected paused : boolean;

        //#endregion

        //#region Events

        /**
         * Event emitter for this instance
         */
        protected eventEmitter : EventEmitter;

        //#endregion

        /**
         * Creates a new instance of this class.
         * @param element DOM element associated to the carousel.
         */
        public constructor(element : HTMLElement, options: ISingleSlideCarouselCreationOptions) {
            super();

            if (element == null)
                throw new Error('The element must not be null.');

            if (!element.classList.contains(CarouselBase.CAROUSEL_STYLES.CAROUSEL))
                throw new Error('The carousel element must contain the class "' + CarouselBase.CAROUSEL_STYLES.CAROUSEL + '".');

            var soraWrapper = element.querySelector('.' + CarouselBase.CAROUSEL_STYLES.WRAPPER);

            if (soraWrapper == null)
                throw new Error('The element has no child with class \'sora-wrapper\'.');

            var children : HTMLElement[] = new Array();

            for (var i = 0; i < soraWrapper.children.length; ++i) {
                if (soraWrapper.children[i].classList.contains(CarouselBase.CAROUSEL_STYLES.SLIDE))
                    children.push(soraWrapper.children[i] as HTMLElement);
            }

            this.activeIndex = options.index || 0;
            this.currentAnimation = null;
            this.eventEmitter = new EventEmitter();
            this.elementsManager = new HtmlChildrenManager(children, this.eventEmitter, soraWrapper as HTMLElement);

            if (this.activeIndex < 0 || this.activeIndex >= this.elementsManager.getLength())
                throw new Error('Invalid options.index. There is no element with index ' + options.index + '.');

            for (var i = 0; i < children.length; ++i) {
                if (i == this.activeIndex)
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                else
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }

            var that = this;

            //Add listeners
            var onBeforeChange = function(eventArgs : CancelableCollectionChangeEventArgs<HTMLElement>) {
                var indexMap = eventArgs.getIndexMap();
                if (indexMap[that.activeIndex] == null)
                    eventArgs.setPreventDefault();
            };

            var onAfterChange = function(eventArgs : CollectionChangeEventArgs<HTMLElement>) {
                if (!eventArgs.getPreventDefault()) {
                    var indexMap = eventArgs.getIndexMap();
                    that.activeIndex = indexMap[that.activeIndex];
                }
            };

            this.addListener(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
            this.addListener(COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);

            this.engineAnimation = new SingleAnimationEngine();
        }

        //#region Public

        /**
         * Subscribes a listener to an event of the carousel.
         * @param event Event to listen.
         * @param listener Listener to subscribe.
         */
        public addListener(event : string | symbol, listener : (... args : any[]) => void) : void {
            this.eventEmitter.addListener(event, listener);
        }

        /**
         * Creates a promise that waits for a time. The amount of time
         * @param options ISingleSlideCarouselCreateWaitPromiseOptions.
         */
        public createWaitPromise(options : ISingleSlideCarouselCreateWaitPromiseOptions) : Promise<void> {
            var that = this;
            return new Promise<void>(function(resolve, reject) {
                var lastTimeRun : number;
                var timeToWait = options.millis;

                if (that.paused) {
                    lastTimeRun = null;
                } else {
                    var waitInterval = setInterval(function() {
                        removeListeners();
                        resolve();
                    }, timeToWait);
                    lastTimeRun = new Date().getTime();
                }

                var onCancelAnimation : () => void = null;

                if (options.stopOnCancelAnimation) {
                    onCancelAnimation = function() {
                        removeListeners();
                        resolve();
                    };
                    that.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                }

                var onPlayStateChange = function(args : ISingleSlideCarouselAnimationPlayStateChangeEventArgs) {
                    if (AnimationPlayStateValue.paused == args.value) {
                        //pause
                        timeToWait = timeToWait - (new Date().getTime() - lastTimeRun);
                        clearInterval(waitInterval);
                    } else if (AnimationPlayStateValue.running == args.value) {
                        //resume
                        lastTimeRun = new Date().getTime();

                        if (timeToWait > 0)
                            waitInterval = setInterval(function() {
                                that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
                                if (onCancelAnimation != null)
                                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                                resolve();
                            }, timeToWait);
                        else {
                            removeListeners();
                            resolve();
                        }
                    }
                };

                var removeListeners = function() {
                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
                    if (onCancelAnimation != null)
                        that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                };

                that.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
            });
        }

        /**
         * Forces the carousel to change its active slide. Any animation will be canceled in the process.
         * @param activeIndex Index of the new active slide of the carousel.
         */
        public forceActiveSlide(activeIndex : number) {
            var eventArgs : ISingleSlideCarouselCancelAnimationEventArgs = {
                activeIndex: activeIndex,
            };

            /*
             * In the initial state, the carousel is not paused. This must be true even if there are
             * no active animations. We need to request this in order to clean children elements correctly.
             */
            if (this.isPaused())
                this.resume();

            this.engineAnimation.cancelAnimation(null);
            this.activeIndex = activeIndex;
            this.resetCarouselStructure(activeIndex);

            this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, eventArgs);
        }

        /**
         * Creates an animation flow based on animation options.
         *
         * @param enterElement Element to apply the enter animation.
         * @param leaveElement Element to apply the leave animation.
         * @param options Animation options.
         *
         * @returns Animation flow from the animation options.
         */
        protected generateGoToAnimationFlow(enterElement : HTMLElement, leaveElement : HTMLElement, options : ISingleSlideCarouselGotoOptions) : IAnimationFlow {
            var innerParts : IAnimationFlowPart[] = [
                {
                    alias: SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER,
                    elements: [ enterElement, ],
                    styles: options.enterAnimation.slideStyles,
                    when: null,
                },
                {
                    alias: SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE,
                    elements: [ leaveElement, ],
                    styles: options.leaveAnimation.slideStyles,
                    when: null,
                },
            ];

            var generateChildrenParts = function(parentElement : HTMLElement, childrenStyles : ICarouselAnimationChildrenStyles[], aliasBase : string) {
                if (childrenStyles) {
                    for (var i = 0; i < childrenStyles.length; ++i) {
                        innerParts.push({
                            alias: aliasBase + i.toString(),
                            elements: function() : HTMLElement[] {
                                var elements : HTMLElement[] = new Array();

                                var animationObject : ICarouselAnimationChildrenStyles = childrenStyles[i];

                                var childrenElements = parentElement.querySelectorAll(animationObject.selector);
                                for (var j = 0; j < childrenElements.length; ++j)
                                    elements.push(childrenElements[j] as HTMLElement);

                                return elements;
                            } (),
                            styles: childrenStyles[i].styles,
                            when: null,
                        });
                    }
                }
            };

            generateChildrenParts(
                enterElement,
                options.enterAnimation.childrenStyles,
                SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER
            );
            generateChildrenParts(
                leaveElement,
                options.leaveAnimation.childrenStyles,
                SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE
            );

            var innerPartsMap : { [key : string] : IAnimationFlowPart } = { };

            for (var i = 0; i < innerParts.length; ++i)
                innerPartsMap[innerParts[i].alias] = innerParts[i];

            var innerGetPartByAlias = function(alias : string) : IAnimationFlowPart {
                return innerPartsMap[alias];
            };
            var animationFlow : IAnimationFlow = {
                parts: innerParts,
                getPartByAlias: innerGetPartByAlias,
            };

            return animationFlow;
        }

        /**
         * Obtains the active slide of the carousel
         */
        public getActiveElement() : HTMLElement {
            return this.elementsManager.getCollection()[this.activeIndex];
        }

        /**
         * Obtains the active index in the elements array of the carousel
         */
        public getActiveIndex() : number {
            return this.activeIndex;
        }

        /**
         * Returns the collection manager of the instance.
         * @returns Collection manager of the slide elements.
         */
        public getElementsManager() : HtmlChildrenManager {
            return this.elementsManager;
        }

        /**
         * Determines if the carousel has an active animation, even if the animation is Paused.
         * @returns True if the carousel has an active animation.
         */
        public hasActiveAnimation() : boolean {
            return this.currentAnimation != null
        }

        /**
         * Returns true if the carousel animation is paused.
         * @returns True if the carousel is paused and false in any other case.
         */
        public isPaused() {
            return this.paused;
        }

        public handle(action: string, options : {[key: string] : any}) : ISingleSlideCarouselGoToAnimationStatus {
            switch(action) {
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO:
                    if (options == null || typeof options.index !== 'number')
                        throw new Error('Invalid options for \'' + SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO + '\'.');

                    return this.handleGoTo(options as ISingleSlideCarouselGotoOptions);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT:
                    options.index = (this.activeIndex + 1) % this.elementsManager.getLength();
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:
                    var elementsLength = this.elementsManager.getLength();
                    options.index = ((this.activeIndex - 1) % elementsLength + elementsLength) % elementsLength;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
            }
        }

        /**
         * Pauses the animations currently handled by the carousel.
         */
        public pause() : void {
            if (!this.paused) {
                this.engineAnimation.pause(null);
                this.paused = true;
                this.eventEmitter.emit(
                    SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE,
                    { value : AnimationPlayStateValue.paused, } as ISingleSlideCarouselAnimationPlayStateChangeEventArgs
                );
            }
        }

        /**
         * Unsubscribes a listener to an event of the carousel.
         * @param event Event associated.
         * @param listener Listener to unsubscribe.
         */
        public removeListener(event : string | symbol, listener : (... args : any[]) => void) : void {
            this.eventEmitter.removeListener(event, listener);
        }

        /**
         * Resumes the animations currently handled by the carousel.
         */
        public resume() : void {
            if (this.paused) {
                this.engineAnimation.resume(null);
                this.paused = false;
                this.eventEmitter.emit(
                    SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE,
                    { value: AnimationPlayStateValue.running, } as ISingleSlideCarouselAnimationPlayStateChangeEventArgs
                );
            }
        }

        //#endregion

        //#region Private

        /**
         * Handles the GoTo operation.
         * @param options Options with the index and the custom animation to display.
         */
        private handleGoTo(options : ISingleSlideCarouselGotoOptions) : ISingleSlideCarouselGoToAnimationStatus {
            if (options.index < 0 || options.index >= this.elementsManager.getLength())
                throw new Error('Invalid index. There is no element with index ' + options.index + '.');

            if (options.index == this.activeIndex)
                throw new Error('Invalid index. It\'s not allowed to go to the current active slide');

            if (null == this.currentAnimation)
                this.currentAnimation = options;
            else {
                throw new Error('It\'s not allowed to start an animation while an existing animation over an slide element is active');
            }

            var oldActiveElement = this.elementsManager.getCollection()[this.activeIndex];
            var newActiveIndex : number = options.index;

            this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_START, {
                options : options
            } as ISingleSlideCarouselAnimationStartEventArgs);

            var that = this;

            var onBeforeChange = function(eventArgs : CancelableCollectionChangeEventArgs<HTMLElement>) {
                var indexMap = eventArgs.getIndexMap();
                if (indexMap[newActiveIndex] == null)
                    eventArgs.setPreventDefault();
            };

            var onAfterChange = function(eventArgs : CollectionChangeEventArgs<HTMLElement>) {
                if (!eventArgs.getPreventDefault()) {
                    var indexMap = eventArgs.getIndexMap();
                    newActiveIndex = indexMap[newActiveIndex];
                }
            };

            this.addListener(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
            this.addListener(COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);

            var newActiveElement = this.elementsManager.getCollection()[newActiveIndex];

            newActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

            var animationCanceled = false;

            var cancelAnimationHandler = function() {
                animationCanceled = true;
                that.currentAnimation = null;
            };

            var animationFlow = this.generateGoToAnimationFlow(newActiveElement, oldActiveElement, options);
            var animationPromises : Promise<void>[] = this.engineAnimation.handle(animationFlow);

            const ANIMATION_LEAVE_INDEX : number = 1;

            var hideLeaveSlideAfterAnimationEnds = new Promise<void>(function(resolve, reject) {
                animationPromises[ANIMATION_LEAVE_INDEX].then(function(animationOptions) {
                    if (!animationCanceled)
                        oldActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            this.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, cancelAnimationHandler);

            var soraHandlerStatus : Promise<void> = new Promise<void>(function(resolve, reject) {
                Promise.all([
                    animationPromises[0],
                    hideLeaveSlideAfterAnimationEnds,
                ]).then(function() {
                    if (!animationCanceled) {
                        oldActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        newActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        that.activeIndex = newActiveIndex;
                        that.currentAnimation = null;
                    }

                    that.removeListener(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
                    that.removeListener(COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);
                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, cancelAnimationHandler);

                    that.eventEmitter.emit(
                        SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_END,
                        {} as ISingleSlideCarouselAnimationEndEventArgs
                    );

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            return {
                animationPromises: animationPromises,
                soraHandlerStatus: soraHandlerStatus,
            };
        }

        //#region Protected

        /**
         * Resets the carousel structure. Sets a new active element for the carousel.
         * @param activeIndex Current active index.
         */
        protected resetCarouselStructure(activeIndex : number) {
            //This operation is atomic in a single-thread environment, so we can store the collection.
            var collection = this.elementsManager.getCollection();
            for (var i = 0; i < collection.length; ++i) {
                while(collection[i].classList.length > 0)
                    collection[i].classList.remove(collection[i].classList.item(0));

                collection[i].classList.add(CarouselBase.CAROUSEL_STYLES.SLIDE);

                if (activeIndex === i)
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                else
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }
        }

        //#endregion
    }
}