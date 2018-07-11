import { CarouselBase } from './carousel-base'
import { SoraAnimation } from './animation/carousel-animation'

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
     * Carousel classes used for multiple purposes.
     */
    export const SINGLE_SLIDE_CAROUSEL_STYLES = {
        CLEAR_ANIMATION: 'sora-clear-animations',
        HIDDEN: 'sora-hidden',
        SLIDE: 'sora-slide',
        SLIDE_ACTIVE: 'sora-slide-active',
        WRAPPER: 'sora-wrapper',
    };

    /**
     * Actions avaiable for the SingleSlideCarousel.
     */
    export const SINGLE_SLIDE_CAROUSEL_ACTIONS = {
        GO_TO: 'to',
        GO_TO_NEXT: 'next',
        GO_TO_PREVIOUS: 'prev',
    };

    /* #endregion */

    /**
     * Represents a carousel with a single active slide at a time.
     */
    export class SingleSlideCarousel extends CarouselBase.CarouselBase<HTMLElement[]> {

        /* #region Attributes */

        /**
         * Active index of the elements of the carousel.
         */
        protected activeIndex : number;

        /**
         * Current active animation
         */
        protected currentAnimation : ISingleSlideCarouselGotoOptions;

        /* #endregion */

        /**
         * Creates a new instance of this class.
         * @param element DOM element associated to the carousel.
         */
        public constructor(element : HTMLElement, options: ISingleSlideCarouselCreationOptions) {
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

            super(children);

            this.activeIndex = options.index || 0;
            this.currentAnimation = null;

            if (this.activeIndex < 0 || this.activeIndex >= this.elements.length)
                throw new Error('Invalid options.index. There is no element with index ' + options.index + '.');

            for (var i = 0; i < children.length; ++i) {
                if (i == this.activeIndex)
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                else
                    children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
            }
        }

        /* #region Public */

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
                    options.index = (this.activeIndex + 1) % this.elements.length;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:
                    options.index = ((this.activeIndex - 1) % this.elements.length + this.elements.length) % this.elements.length;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
            }
        }

        /* #endregion */

        /* #region Private */

        /**
         * Handles the GoTo operation.
         * @param options Options with the index and the custom animation to display.
         */
        private handleGoTo(options : ISingleSlideCarouselGotoOptions) : ISingleSlideCarouselGoToAnimationStatus {
            if (options.index < 0 || options.index >= this.elements.length)
                throw new Error('Invalid index. There is no element with index ' + options.index + '.');

            if (options.index == this.activeIndex)
                throw new Error('Invalid index. It\'s not allowed to go to the current active slide');
            
            if (null == this.currentAnimation)
                this.currentAnimation = options;
            else {
                throw new Error('It\'s not allowed to start an animation while an existing animation over an slide element is active');
            }

            var oldActiveIndex : number = this.activeIndex;
            var newActiveIndex : number = options.index;

            this.elements[newActiveIndex].classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);

            var that = this;

            //Animate!
            var enterAnimationStatus : ISingleSlideCarouselSlideAnimationStatus = this.handleAnimationOverSlide(this.elements[newActiveIndex], options.enterAnimation, null);
            var leaveAnimationStatus : ISingleSlideCarouselSlideAnimationStatus = 
                this.handleAnimationOverSlide(
                    this.elements[oldActiveIndex], 
                    options.leaveAnimation,
                    function() {
                        /*
                         * Hide the slide as soon as it leaves.
                         */
                        that.elements[oldActiveIndex].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                    }
                );

            var soraHandlerStatus : Promise<void> = new Promise<void>(function(resolve, reject) {
                Promise.all([
                    enterAnimationStatus.elementAnimationStatus,
                    leaveAnimationStatus.elementAnimationStatus,
                ]).then(function(slidesAnimationStatus : ISingleSlideCarouselAnimateElementOptions[]) {
                    that.elements[oldActiveIndex].classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    that.elements[newActiveIndex].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    that.activeIndex = options.index;
                    that.currentAnimation = null;
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
        private handleAnimationOverSlide(element : HTMLElement, animation : SoraAnimation.ICarouselAnimation, callBackOnClear : () => void) : ISingleSlideCarouselSlideAnimationStatus {
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
                                },
                                null
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
                    },
                    callBackOnClear
                ),
                childrenAnimationStatus : childrenStatus,
            }
        }

        /**
         * Handles the animation of an element
         * @param element Element to be animated.
         * @param styles Collection os styles to apply.
         */
        private handleAnimationOverElement(elementAnimation : ISingleSlideCarouselAnimateElementOptions, callBackOnClear : () => void) : Promise<ISingleSlideCarouselAnimateElementOptions> {
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
                    var animationFunctions : (() => void)[] = new Array();

                    for (var i = 1; i < styles.length; ++i) {
                        animationFunctions.push(function(index) {
                            return function() {
                                that.elements[that.activeIndex].classList.remove(styles[index - 1]);
                                
                                that.unregisterAnimationListener(element, animationFunctions[index - 1]);
                                
                                if (index < styles.length - 1) {
                                    that.registerAnimationListener(element, animationFunctions[index]);
                                } else {
                                    var clearFunction = function() {
                                        element.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                        element.classList.remove(styles[index]);
                                        element.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                        that.unregisterAnimationListener(element, clearFunction);

                                        if (callBackOnClear != null)
                                            callBackOnClear();

                                        resolve({
                                            element: element,
                                            styles: styles,
                                        });
                                    };
                                    //add the clear listener
                                    that.registerAnimationListener(element, clearFunction);
                                }

                                that.elements[that.activeIndex].classList.add(styles[index]);
                            }
                        } (i));
                    }

                    if (animationFunctions.length > 0) {
                        that.registerAnimationListener(element, animationFunctions[0]);
                    } else {
                        var clearFunction = function(event : TransitionEvent) {
                            element.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                            element.classList.remove(styles[0]);
                            element.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                            that.unregisterAnimationListener(element, clearFunction);
                            
                            if (callBackOnClear != null)
                                callBackOnClear();

                            resolve({
                                element: element,
                                styles: styles,
                            });
                        };
                        //add the clear listener
                        that.registerAnimationListener(element, clearFunction);
                    }

                    element.classList.add(styles[0]);
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

        /* #endregion */
    }
}