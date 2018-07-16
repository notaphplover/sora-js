import { CarouselBase } from './carousel-base'
import { SoraAnimation } from './animation/carousel-animation'
import { EventEmitter } from 'events';
import { CollectionManager, COLLECTION_MANAGER_EVENTS, CollectionChangeEventArgs } from '../collection/collection-manager';

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
     * Arguments for the event emitted.
     */
    export interface ISingleSlideCarouselCancelAnimationEventArgs {
        activeIndex : number;
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
         * Enter slide status.
         */
        enterSlideStatus : ISingleSlideCarouselSlideAnimationStatus;
        /**
         * Leave slide status.
         */
        leaveSlideStatus : ISingleSlideCarouselSlideAnimationStatus;
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
        enterAnimation : SoraAnimation.ICarouselAnimation;
        /**
         * Index of the element to display.
         */
        index : number;
        /**
         * Custom animation for the outcoming slide.
         */
        leaveAnimation : SoraAnimation.ICarouselAnimation;
    }

    /**
     * Slide animation status
     */
    export interface ISingleSlideCarouselSlideAnimationStatus {
        /**
         * Slide element status
         */
        elementAnimationStatus : Promise<ISingleSlideCarouselAnimateElementOptions>;
        /**
         * Children element status
         */
        childrenAnimationStatus : ISingleSlideCarouselSlideChildrenAnimationOptions;
    }

    /**
     * Children animation options
     */
    export interface ISingleSlideCarouselSlideChildrenAnimationOptions {
        /**
         * Associative array. 
         * The key of an entry is the selector that matched with the element.
         * The value of an entry is the animation status of the element.
         */
        [selector: string]: Promise<ISingleSlideCarouselAnimateElementOptions>[];
    }

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
        ON_CANCEL_ANIMATION: 'car.anim.cancel',
    };

    /**
     * Carousel classes used for multiple purposes.
     */
    export const SINGLE_SLIDE_CAROUSEL_STYLES = {
        CLEAR_ANIMATION: 'sora-clear-animations',
        HIDDEN: 'sora-hidden',
        SLIDE: 'sora-slide',
        SLIDE_ACTIVE: 'sora-slide-active',
        WRAPPER: 'sora-wrapper',
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
        protected elementsManager : CollectionManager<HTMLElement>

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

            var soraWrapper = element.querySelector('.' + SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER);

            if (soraWrapper == null)
                throw new Error('The element has no child with class \'sora-wrapper\'.');

            var children : HTMLElement[] = new Array();

            for (var i = 0; i < soraWrapper.children.length; ++i) {
                if (soraWrapper.children[i].classList.contains(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE))
                    children.push(soraWrapper.children[i] as HTMLElement);
            }

            this.activeIndex = options.index || 0;
            this.currentAnimation = null;
            this.eventEmitter = new EventEmitter();
            this.elementsManager = new CollectionManager<HTMLElement>(children, this.eventEmitter);

            if (this.activeIndex < 0 || this.activeIndex >= this.elementsManager.getCollection().length)
                throw new Error('Invalid options.index. There is no element with index ' + options.index + '.');

            for (var i = 0; i < children.length; ++i) {
                if (i == this.activeIndex)
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                else
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
            }
        }

        //#region Public

        /**
         * Forces the carousel to change its active slide. Any animation will be canceled in the process.
         * @param activeIndex Index of the new active slide of the carousel.
         */
        public forceActiveSlide(activeIndex : number) {
            var eventArgs : ISingleSlideCarouselCancelAnimationEventArgs = {
                activeIndex: activeIndex,
            };

            this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, eventArgs);
            this.resetCarouselStructure(activeIndex);
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
        public getElementsManager() : CollectionManager<HTMLElement> {
            return this.elementsManager;
        }

        /**
         * Carousel handler.
         * 3. Any carousel has transitions.
         * @param action action to be handled
         * @param options options for the action.
         */
        public handle(action: string, options : {[key: string] : any}) : ISingleSlideCarouselGoToAnimationStatus {
            switch(action) {
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO:
                    if (options == null || typeof options.index !== 'number')
                        throw new Error('Invalid options for \'' + SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO + '\'.');
                    
                    return this.handleGoTo(options as ISingleSlideCarouselGotoOptions);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT:
                    options.index = (this.activeIndex + 1) % this.elementsManager.getCollection().length;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:
                    var elementsLength = this.elementsManager.getCollection().length;
                    options.index = ((this.activeIndex - 1) % elementsLength + elementsLength) % elementsLength;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
            }
        }

        //#endregion
        
        //#region Private

        /**
         * Handles the GoTo operation.
         * @param options Options with the index and the custom animation to display.
         */
        private handleGoTo(options : ISingleSlideCarouselGotoOptions) : ISingleSlideCarouselGoToAnimationStatus {
            if (options.index < 0 || options.index >= this.elementsManager.getCollection().length)
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

            var that = this;

            var onBeforeChange = function(eventArgs : CollectionChangeEventArgs<HTMLElement>) {
                var indexMap = eventArgs.getIndexMap();
                if (indexMap[that.activeIndex] == null || indexMap[newActiveIndex] == null)
                    eventArgs.setPreventDefault();
            };

            var onAfterChange = function(eventArgs : CollectionChangeEventArgs<HTMLElement>) {
                if (!eventArgs.getPreventDefault()) {
                    var indexMap = eventArgs.getIndexMap();
                    newActiveIndex = indexMap[newActiveIndex];
                    that.activeIndex = indexMap[that.activeIndex];
                }
            };

            this.eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
            this.eventEmitter.on(COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);

            var newActiveElement = this.elementsManager.getCollection()[newActiveIndex];

            newActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);

            //Animate!
            var enterAnimationStatus : ISingleSlideCarouselSlideAnimationStatus = 
                this.handleAnimationOverSlide(newActiveElement, options.enterAnimation);
                
            var leaveAnimationStatus : ISingleSlideCarouselSlideAnimationStatus = 
                this.handleAnimationOverSlide(
                    oldActiveElement, 
                    options.leaveAnimation
                );
            
            var hideLeaveSlideAfterAnimationEnds = new Promise<ISingleSlideCarouselAnimateElementOptions>(function(resolve, reject) {
                leaveAnimationStatus.elementAnimationStatus.then(function(animationOptions) {
                    oldActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                    resolve(animationOptions);
                }).catch(function(err) {
                    reject(err);
                });
            });

            var soraHandlerStatus : Promise<void> = new Promise<void>(function(resolve, reject) {
                Promise.all([
                    enterAnimationStatus.elementAnimationStatus,
                    hideLeaveSlideAfterAnimationEnds,
                ]).then(function(slidesAnimationStatus : ISingleSlideCarouselAnimateElementOptions[]) {
                    oldActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    newActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    that.activeIndex = newActiveIndex;
                    that.currentAnimation = null;

                    that.eventEmitter.removeListener(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
                    that.eventEmitter.removeListener(COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            return {
                enterSlideStatus: enterAnimationStatus,
                leaveSlideStatus: leaveAnimationStatus,
                soraHandlerStatus: soraHandlerStatus,
            };
        }

        /**
         * Handles the animation of an element.
         * @param element Element to be animated.
         * @param animation Animation options.
         * @returns Promise of handling the animation. The promise is resolved as soon as all the transitions are finished.
         */
        private handleAnimationOverSlide(element : HTMLElement, animation : SoraAnimation.ICarouselAnimation) : ISingleSlideCarouselSlideAnimationStatus {
            var childrenStatus : ISingleSlideCarouselSlideChildrenAnimationOptions = {};

            if (animation.childrenStyles) {
                for (var i = 0; i < animation.childrenStyles.length; ++i) {
                    var animationObject : SoraAnimation.ICarouselAnimationChildrenStyles = animation.childrenStyles[i];
                    if (!childrenStatus[animationObject.selector])
                        childrenStatus[animationObject.selector] = new Array();

                    var childrenElements = element.querySelectorAll(animationObject.selector);
                    for (var j = 0; j < childrenElements.length; ++j) 
                        childrenStatus[animationObject.selector].push(
                            this.handleAnimationOverElement(
                                {
                                    element: childrenElements[j] as HTMLElement, 
                                    styles: animationObject.styles,
                                }
                            )
                        );
                }
            }

            var that = this;

            return {
                elementAnimationStatus: that.handleAnimationOverElement(
                    {
                        element: element, 
                        styles: animation.slideStyles,
                    }
                ),
                childrenAnimationStatus : childrenStatus,
            }
        }

        /**
         * Handles the animation of an element
         * @param element Element to be animated.
         * @param styles Collection os styles to apply.
         */
        private handleAnimationOverElement(elementAnimation : ISingleSlideCarouselAnimateElementOptions) : Promise<ISingleSlideCarouselAnimateElementOptions> {
            var element : HTMLElement = elementAnimation.element;
            var styles : string[] = elementAnimation.styles;

            if (styles) {
                if (styles.length < 1) 
                    throw new Error('It\'s required to have at least one class to generate an animation.');
            } else
                throw new Error('It\'s required to have an array of styles to generate an animation.');

            var that = this;
            return new Promise<ISingleSlideCarouselAnimateElementOptions>(function(resolve, reject) {
                try {
                    var animationFunctions : ((event : TransitionEvent) => void)[] = new Array();
                    var currentAnimationIndex : number = null;
                    var onAnimationCancel = function(args : ISingleSlideCarouselCancelAnimationEventArgs) {
                        element.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                        
                        if (currentAnimationIndex != null)
                            element.classList.remove(styles[currentAnimationIndex]);

                        that.unregisterAnimationListener(element, animationFunctions[currentAnimationIndex]);
                        element.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);

                        that.eventEmitter.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onAnimationCancel);
                    };

                    that.eventEmitter.on(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onAnimationCancel);

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
                        element.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                        element.classList.remove(styles[styles.length - 1]);
                        element.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                        that.unregisterAnimationListener(element, animationFunctions[animationFunctions.length - 1]);
                        currentAnimationIndex = null;

                        resolve({
                            element: element,
                            styles: styles,
                        });
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

                collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE);

                if (activeIndex === i)
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                else
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
            }
        }

        //#endregion
    }
}