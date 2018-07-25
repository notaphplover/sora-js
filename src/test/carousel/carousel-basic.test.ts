import { CarouselBasic } from '../../../src/carousel/carousel-basic'
import { ITest } from "../ITest";

export class SingleSlideCarouselTests implements ITest {

    protected longTimeLimit : number

    public constructor() {
        this.longTimeLimit = 100000000;
    }

    protected generateBasicCarousel() : HTMLElement {
        var divElement : HTMLElement = document.createElement('div');
        divElement.classList.add('sora-carousel');
        divElement.innerHTML =
`<div class="sora-wrapper">
    <div class="sora-slide">
        Content 1
    </div>
    <div class="sora-slide">
        Content 2
    </div>
    <div class="sora-slide">
        Content 3
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
        });
    }

    private itMustBeInitializable() : void {
        var that = this;
        it('mustBeInitializable', () => {
            var divElement : HTMLElement = that.generateBasicCarousel();

            var carousel : CarouselBasic.SingleSlideCarousel = new CarouselBasic.SingleSlideCarousel(divElement, { index: 0 });
            expect(carousel).not.toBeNull();

            var wrapper = divElement.querySelectorAll('.' + CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER);
            expect(wrapper.length).toBe(1);

            var children = divElement.querySelectorAll('.' + CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER + ' > .' + CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE);
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
}