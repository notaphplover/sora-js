import { ITaskFlowPartArgs } from 'jovellanos/src/task/flow/task-flow-part-event-args';
import { IOperationManagerAccess } from 'jovellanos/src/task/operation/operation-manager-access';
import { IAnimationFlowPart } from '../../animation/animation-flow-part';
import { CAROUSEL_STYLES } from '../../carousel/carousel-base';
import { ICarouselAnimation } from '../../carousel/single-slide/carousel-animation';
import { ISingleSlideCarouselGoToAnimationStatus } from '../../carousel/single-slide/go-to-animation-status';
import {
    SINGLE_SLIDE_CAROUSEL_ACTIONS,
    SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES,
    SINGLE_SLIDE_CAROUSEL_STYLES,
    SingleSlideCarousel,
} from '../../carousel/single-slide/single-slide-carousel';
import { ITest } from '../ITest';

interface IGoToAndCheckData {
    goActionStatus: ISingleSlideCarouselGoToAnimationStatus;
    newElement: HTMLElement;
    oldElement: HTMLElement;
}

export class SingleSlideCarouselTests implements ITest {

    protected longTimeLimit: number;

    public constructor() {
        this.longTimeLimit = 100000000;
    }

    public performTests(): void {
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

    protected generateBasicCarousel(): HTMLElement {
        const divElement: HTMLElement = document.createElement('div');
        divElement.classList.add(CAROUSEL_STYLES.CAROUSEL);
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

    private performGoAndCheck(
        action: string,
        carousel: SingleSlideCarousel,
        enterAnimation: ICarouselAnimation,
        leaveAnimation: ICarouselAnimation,
        shouldCheck: boolean = true,
    ): IGoToAndCheckData {

        expect([
            SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT,
            SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS,
        ]).toContain(action);

        const currentActiveElement = carousel.getActiveElement();
        const activeIndex = carousel.getActiveIndex();
        const indexes = carousel.getElementsManager().getLength();
        const nextIndex = function(action): number {
            if (SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT === action) {
                return (activeIndex + 1) % indexes;
            } else if (SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS === action) {
                return ((activeIndex - 1) + indexes) % indexes;
            } else {
                throw new Error('Unexpected action');
            }
        } (action);

        const nextElement = carousel.getElementsManager().getCollection()[nextIndex];

        const goActionStatus = carousel.handle(
            action,
            {
                enterAnimation: enterAnimation,
                leaveAnimation: leaveAnimation,
            },
        );

        const checkFunction = function<
            TArgs extends ITaskFlowPartArgs<TPart>,
            TPart extends IAnimationFlowPart,
        >(
            partAlias: string,
            animation: ICarouselAnimation,
            operationManagerAccess: IOperationManagerAccess<TArgs>,
        ): () => boolean {
            var eventRaised: boolean = false;
            const eventHandler = function(eventArgs: TArgs) {
                eventRaised = true;
                eventArgs.part.styles.forEach(function(style: string) {
                    expect(animation.slideStyles).toContain(style);
                });
                expect(operationManagerAccess.unsubscribe(
                    partAlias,
                    handlerToken,
                )).toBe(true);
            };
            const handlerToken: number =
                operationManagerAccess.subscribe(
                    partAlias,
                    eventHandler,
                );
            return function() { return eventRaised; };
        };

        // Check the end of the enter animation.
        const enterAnimationEndStatus = checkFunction(
            SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER,
            enterAnimation,
            goActionStatus.partEndEventAccess,
        );

        // Check the end of the leave animation
        const leaveAnimationEndStatus = checkFunction(
            SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE,
            leaveAnimation,
            goActionStatus.partEndEventAccess,
        );

        // Check the start of the enter animation.
        const enterAnimationStartStatus = checkFunction(
            SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER,
            enterAnimation,
            goActionStatus.partStartEventAccess,
        );

        // Check the start of the leave animation.
        const leaveAnimationStartStatus = checkFunction(
            SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE,
            leaveAnimation,
            goActionStatus.partStartEventAccess,
        );

        goActionStatus.soraHandlerStatus.then(function() {
            expect(enterAnimationEndStatus()).toBe(true);
            expect(leaveAnimationEndStatus()).toBe(true);
            expect(enterAnimationStartStatus()).toBe(true);
            expect(leaveAnimationStartStatus()).toBe(true);
            if (shouldCheck) {
                expect(currentActiveElement.classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                expect(currentActiveElement.classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                expect(nextElement.classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                expect(nextElement.classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }
        });

        return {
            goActionStatus: goActionStatus,
            newElement: nextElement,
            oldElement : currentActiveElement,
        };
    }

    private performGoNext(
        carousel: SingleSlideCarousel,
        enterAnimation: ICarouselAnimation,
        leaveAnimation: ICarouselAnimation,
        shouldCheck: boolean = true,
    ): IGoToAndCheckData {
        return this.performGoAndCheck(
            SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT,
            carousel,
            enterAnimation,
            leaveAnimation,
            shouldCheck,
        );
    }

    private performGoPrevious(
        carousel: SingleSlideCarousel,
        enterAnimation: ICarouselAnimation,
        leaveAnimation: ICarouselAnimation,
        shouldCheck: boolean = true,
    ): IGoToAndCheckData {
        return this.performGoAndCheck(
            SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS,
            carousel,
            enterAnimation,
            leaveAnimation,
            shouldCheck,
        );
    }

    private itMustBeInitializable(): void {
        const that = this;
        it('mustBeInitializable', () => {
            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            expect(carousel).not.toBeNull();
            const wrapper = divElement.querySelectorAll('.' + CAROUSEL_STYLES.WRAPPER);
            expect(wrapper.length).toBe(1);
            const children = divElement.querySelectorAll(
                '.' + CAROUSEL_STYLES.WRAPPER + ' > .' + CAROUSEL_STYLES.SLIDE,
            );
            expect(children.length).toBe(3);
            expect(children[0].classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
            expect(children[0].classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

            for (var i = 1; i < children.length; ++i) {
                expect(children[i].classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                expect(children[i].classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }
        });
    }

    private itMustBeAbleToCancelAnimation(): void {
        const that = this;
        it('mustBeAbleToCancelAnimation', (done) => {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                    false,
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const animationStatus = goNext(carousel);
                carousel.forceActiveSlide(2);
                const thirdElement = carousel.getElementsManager().getCollection()[2];

                expect(thirdElement.classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                expect(thirdElement.classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement.classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                    expect(newActiveElement.classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(oldActiveElement.classList).not.toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                    expect(oldActiveElement.classList).toContain(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

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

    private itMustBeAbleToGoToSlides(): void {
        const that = this;
        it('mustBeAbleToGoToSlides', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }
            function goPrevious(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoPrevious(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const animationStatus = goNext(carousel);

                const oldActiveElement = animationStatus.oldElement;
                const newActiveElement = animationStatus.newElement;

                expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const animationStatus = goPrevious(carousel);

                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);

                    Promise.all([
                        animationStatus.goActionStatus.soraHandlerStatus,
                    ]).then(function() {
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
        const that = this;
        it('mustBeAbleToGoToSlidesWhileAddingElements', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }
            function goPrevious(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoPrevious(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);

                const element0 = document.createElement('div');
                element0.classList.add(CAROUSEL_STYLES.SLIDE);
                element0.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element0.innerHTML = 'New Content 0';
                const element1 = document.createElement('div');
                element1.classList.add(CAROUSEL_STYLES.SLIDE);
                element1.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element1.innerHTML = 'New Content 1';
                const element2 = document.createElement('div');
                element2.classList.add(CAROUSEL_STYLES.SLIDE);
                element2.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element2.innerHTML = 'New Content 2';
                const element3 = document.createElement('div');
                element3.classList.add(CAROUSEL_STYLES.SLIDE);
                element3.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                element3.innerHTML = 'New Content 3';
                carousel.getElementsManager().insertElements({
                    0: element0,
                    1: element1,
                    2: element2,
                    3: element3,
                });

                expect(carousel.getElementsManager().getLength()).toBe(7);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;

                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);
                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);

                    animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.goActionStatus.soraHandlerStatus,
                    ]).then(function() {
                        const oldActiveElement = animationStatus.oldElement;
                        const newActiveElement = animationStatus.newElement;

                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);

                        animationStatus = goPrevious(carousel);

                        Promise.all([
                            animationStatus.goActionStatus.soraHandlerStatus,
                        ]).then(function() {
                            const oldActiveElement = animationStatus.oldElement;
                            const newActiveElement = animationStatus.newElement;

                            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[3]);
                            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);

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
        const that = this;
        it('mustBeAbleToGoToSlidesWhileRemovingAnimationElements', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const animationStatus = goNext(carousel);
                carousel.getElementsManager().removeElements([0, 1]);
                expect(carousel.getElementsManager().getCollection().length).toBe(3);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

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
        const that = this;
        it('mustBeAbleToGoToSlidesWhileRemovingOtherElements', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation'] },
                    { slideStyles: ['sora-fade-out-animation'] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const animationStatus = goNext(carousel);
                carousel.getElementsManager().removeElements([2]);
                expect(carousel.getElementsManager().getCollection().length).toBe(2);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;

                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

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
        const that = this;

        it('mustBeAbleToHandleChildrenAnimations', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(carousel,
                    {
                        childrenStyles: [ {
                            selector: 'span',
                            styles: [ 'sora-fade-in-animation' ],
                        } ],
                        slideStyles: [ 'sora-fade-in-animation' ],
                    },
                    {
                        childrenStyles: [ {
                            selector: 'span',
                            styles: [ 'sora-fade-out-animation' ],
                        } ],
                        slideStyles: [ 'sora-fade-out-animation' ],
                    },
                );
            }

            function goPrevious(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoPrevious(carousel,
                    {
                        childrenStyles: [ {
                            selector: 'span',
                            styles: [ 'sora-fade-in-animation' ],
                        } ],
                        slideStyles: [ 'sora-fade-in-animation' ],
                    },
                    {
                        childrenStyles: [ {
                            selector: 'span',
                            styles: [ 'sora-fade-out-animation' ],
                        } ],
                        slideStyles: [ 'sora-fade-out-animation' ],
                    },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                var animationStatus = goNext(carousel);
                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;
                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

                    animationStatus = goPrevious(carousel);

                    Promise.all([
                        animationStatus.goActionStatus.soraHandlerStatus,
                    ]).then(function() {
                        const oldActiveElement = animationStatus.oldElement;
                        const newActiveElement = animationStatus.newElement;
                        expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                        expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);

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
        const that = this;

        it('mustBeAbleToPauseAndResumeAnimation', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation' ]},
                    { slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation' ] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const currentIndex = carousel.getActiveIndex();
                const animationStatus = goNext(carousel);

                const oldActiveElement = animationStatus.oldElement;
                const newActiveElement = animationStatus.newElement;
                expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

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
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
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
        const that = this;

        it('mustBeAbleToRunComplexAnimations', function(done) {
            function goNext(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoNext(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation' ]},
                    { slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation' ] },
                );
            }

            function goPrevious(carousel: SingleSlideCarousel): IGoToAndCheckData {
                return that.performGoPrevious(
                    carousel,
                    { slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation' ]},
                    { slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation' ] },
                );
            }

            const divElement: HTMLElement = that.generateBasicCarousel();
            const carousel: SingleSlideCarousel = new SingleSlideCarousel(divElement, { index: 0 });
            document.body.appendChild(divElement);

            const executionPromise = new Promise<void>(function(resolve, reject) {
                const animationStatus = goNext(carousel);
                const oldActiveElement = animationStatus.oldElement;
                const newActiveElement = animationStatus.newElement;
                expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
                expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);

                Promise.all([
                    animationStatus.goActionStatus.soraHandlerStatus,
                ]).then(function() {
                    const animationStatus = goPrevious(carousel);

                    const oldActiveElement = animationStatus.oldElement;
                    const newActiveElement = animationStatus.newElement;
                    expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
                    expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);

                    Promise.all([
                        animationStatus.goActionStatus.soraHandlerStatus,
                    ]).then(function() {
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
