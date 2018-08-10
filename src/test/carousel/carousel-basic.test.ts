import { CarouselBase } from '../../../src/carousel/carousel-base'
import { CarouselBasic } from '../../../src/carousel/carousel-basic'
import { ITest } from "../ITest";

export class SingleSlideCarouselTests implements ITest {

    protected longTimeLimit : number

    public constructor() {
        this.longTimeLimit = 100000000;
    }

    protected generateBasicCarousel() : HTMLElement {
        var divElement : HTMLElement = document.createElement('div');
        divElement.classList.add(CarouselBase.CAROUSEL_STYLES.CAROUSEL);
        divElement.innerHTML =
`<div class="sora-wrapper">
    <div class="sora-slide">
        <span>Content 1</span>
    </div>
    <div class="sora-slide">
        <span>Content 2</span>
    </div>
    <div class="sora-slide">
        <span>Content 3</span>
    </div>
</div>`
        ;

        return divElement;
    }

    public performTests() : void {
        describe('SingleSlideCarousel Tests', () => {
            this.itMustBeInitializable();
            this.itMustBeAbleToCancelAnimation();
            this.itMustBeAbleToGoToSlides();
            this.itMustBeAbleToGoToSlidesWhileAddingElements();
            this.itMustBeAbleToGoToSlidesWhileRemovingAnimationElements();
            this.itMustBeAbleToGoToSlidesWhileRemovingOtherElements();
            this.itMustBeAbleToHandleChildrenAnimations();
            this.itMustBeAbleToPauseAndResumeAnimation();
            this.itMustBeAbleToRunComplexAnimations();
        });
    }

    private itMustBeInitializable() : void {
        var that = this;
        it('mustBeInitializable', () => {
            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });
            expect(carousel).not.toBeNull();

            var wrapper = divElement.querySelectorAll('.' + CarouselBase.CAROUSEL_STYLES.WRAPPER);
            expect(wrapper.length).toBe(1);

            var children = divElement.querySelectorAll('.' + CarouselBase.CAROUSEL_STYLES.WRAPPER + ' > .' + CarouselBase.CAROUSEL_STYLES.SLIDE);
            expect(children.length).toBe(3);

            expect(children[0].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
            expect(children[0].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

            for (var i = 1; i < children.length; ++i) {
                expect(children[i].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                expect(children[i].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }
        });
    }

    private itMustBeAbleToCancelAnimation() : void {
        var that = this;
        it('mustBeAbleToCancelAnimation', (done) => {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);
                carousel.forceActiveSlide(2);
                var thirdElement = carousel.getElementsManager().getCollection()[2];

                expect(thirdElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                expect(thirdElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);

                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        });
    }

    private itMustBeAbleToGoToSlides() : void {
        var that = this;
        it('mustBeAbleToGoToSlides', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            function goPrevious(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goPreviousActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goPreviousActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);
                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    var animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                        expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                        expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        resolve();
                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

    private itMustBeAbleToGoToSlidesWhileAddingElements() {
        var that = this;
        it('mustBeAbleToGoToSlidesWhileAddingElements', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            function goPrevious(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goPreviousActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goPreviousActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);

                var element0 = document.createElement('div');
                element0.classList.add(CarouselBase.CAROUSEL_STYLES.SLIDE);
                element0.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element0.innerHTML = 'New Content 0';
                var element1 = document.createElement('div');
                element1.classList.add(CarouselBase.CAROUSEL_STYLES.SLIDE);
                element1.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element1.innerHTML = 'New Content 1';
                var element2 = document.createElement('div');
                element2.classList.add(CarouselBase.CAROUSEL_STYLES.SLIDE);
                element2.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element2.innerHTML = 'New Content 2';
                var element3 = document.createElement('div');
                element3.classList.add(CarouselBase.CAROUSEL_STYLES.SLIDE);
                element3.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element3.innerHTML = 'New Content 3';
                carousel.getElementsManager().insertElements({
                    0: element0,
                    1: element1,
                    2: element2,
                    3: element3,
                });

                expect(carousel.getElementsManager().getLength()).toBe(7);

                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    var animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
                        expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);
                        expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        var animationStatus = goPrevious(carousel);

                        Promise.all([
                            animationStatus.enterSlideStatus.elementAnimationStatus,
                            animationStatus.leaveSlideStatus.elementAnimationStatus,
                            animationStatus.soraHandlerStatus,
                        ]).then(function(animationStatusPromisesResponses) {
                            var oldActiveElement = animationStatusPromisesResponses[1].element;
                            var newActiveElement = animationStatusPromisesResponses[0].element;

                            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[3]);
                            expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                            expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
                            expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                            expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                            resolve();
                        }).catch(function(err) {
                            reject(err);
                        });
                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });

        }, this.longTimeLimit);
    }

    private itMustBeAbleToGoToSlidesWhileRemovingAnimationElements() {
        var that = this;
        it('mustBeAbleToGoToSlidesWhileRemovingAnimationElements', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);

                carousel.getElementsManager().removeElements([0, 1]);

                expect(carousel.getElementsManager().getCollection().length).toBe(3);

                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

    private itMustBeAbleToGoToSlidesWhileRemovingOtherElements() {
        var that = this;
        it('mustBeAbleToGoToSlidesWhileRemovingOtherElements', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);

                carousel.getElementsManager().removeElements([2]);

                expect(carousel.getElementsManager().getCollection().length).toBe(2);

                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

    private itMustBeAbleToHandleChildrenAnimations() {
        var that = this;

        it('mustBeAbleToHandleChildrenAnimations', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                        childrenStyles: [
                            {
                                selector: 'span',
                                styles: [
                                    'sora-fade-in-animation',
                                ],
                            }
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                        childrenStyles: [
                            {
                                selector: 'span',
                                styles: [
                                    'sora-fade-out-animation',
                                ],
                            }
                        ],
                    },
                });
                return goNextActionStatus;
            }

            function goPrevious(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goPreviousActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                        childrenStyles: [
                            {
                                selector: 'span',
                                styles: [
                                    'sora-fade-in-animation',
                                ],
                            }
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                        ],
                        childrenStyles: [
                            {
                                selector: 'span',
                                styles: [
                                    'sora-fade-out-animation',
                                ],
                            }
                        ],
                    },
                });
                return goPreviousActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);
                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    var animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                        expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                        expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        resolve();
                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

    private itMustBeAbleToPauseAndResumeAnimation() {
        var that = this;

        it('mustBeAbleToPauseAndResumeAnimation', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                            'sora-offset-left-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                            'sora-offset-left-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var currentIndex = carousel.getActiveIndex();
                var animationStatus = goNext(carousel);
                carousel.pause();
                expect(carousel.isPaused()).toBe(true);
                expect(carousel.getActiveIndex()).toBe(currentIndex);

                new Promise<void>(function(resolveCh, reject) {
                    setTimeout(() => {
                        expect(carousel.isPaused()).toBe(true);
                        expect(carousel.getActiveIndex()).toBe(currentIndex);
                        resolveCh();
                    }, 2000);
                }).then(function() {
                    carousel.resume();
                });

                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

    private itMustBeAbleToRunComplexAnimations() {
        var that = this;

        it('mustBeAbleToRunComplexAnimations', function(done) {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                            'sora-offset-left-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                            'sora-offset-left-out-animation',
                        ],
                    },
                });
                return goNextActionStatus;
            }

            function goPrevious(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goPreviousActionStatus = carousel.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                            'sora-offset-left-in-animation',
                        ],
                    },
                    leaveAnimation: {
                        slideStyles: [
                            'sora-fade-out-animation',
                            'sora-offset-left-out-animation',
                        ],
                    },
                });
                return goPreviousActionStatus;
            }

            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });

            document.body.appendChild(divElement);

            var executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);
                Promise.all([
                    animationStatus.enterSlideStatus.elementAnimationStatus,
                    animationStatus.leaveSlideStatus.elementAnimationStatus,
                    animationStatus.soraHandlerStatus,
                ]).then(function(animationStatusPromisesResponses) {
                    var oldActiveElement = animationStatusPromisesResponses[1].element;
                    var newActiveElement = animationStatusPromisesResponses[0].element;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    var animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                        expect(newActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(newActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                        expect(oldActiveElement.classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(oldActiveElement.classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                        resolve();
                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });

            executionPromise.then(function() {
                document.body.removeChild(divElement);
                done();
            }).catch(function(err) {
                done.fail(err);
            });
        }, this.longTimeLimit);
    }

}