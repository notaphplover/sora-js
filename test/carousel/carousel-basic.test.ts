import { CarouselBasic } from '../../src/carousel/carousel-basic'
import { PuppeterManagement } from '../util/puppeteer-manager'

var longTimeLimit : number = 100000000;

describe('SingleSlideCarousel Tests', () => {
    it('mustBeInitializable', () => {
        var divElement : HTMLElement = document.createElement('div');
        divElement.innerHTML =
            '<div class="sora-wrapper"> \
                <div class="sora-slide"> \
                    Content1 \
                </div> \
                <div class="sora-slide"> \
                    Content 2 \
                </div> \
                <div class="sora-slide"> \
                    Content 3 \
                </div> \
            </div>';

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

    it('mustBeAbleToCancelAnimation', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToCancelAnimation');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);
                    carousel.forceActiveSlide(2);
                    var secondElement = carousel.getElementsManager().getCollection()[2];
                    var isSecondActive : boolean =
                        !secondElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        && secondElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && isSecondActive
                        ;

                        resolve(conditions);
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToGoToSlides', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToGoToSlides');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);
                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToGoToSlidesWhileAddingElements', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToGoToSlidesWhileAddingElements');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);

                    var element0 = document.createElement('div');
                    element0.innerHTML = 'New Content 0';
                    var element1 = document.createElement('div');
                    element1.innerHTML = 'New Content 1';
                    var element2 = document.createElement('div');
                    element2.innerHTML = 'New Content 2';
                    var element3 = document.createElement('div');
                    element3.innerHTML = 'New Content 3';
                    carousel.getElementsManager().insertElements({
                        0: element0,
                        1: element1,
                        2: element2,
                        3: element3,
                    });

                    if (carousel.getElementsManager().getCollection().length != 7)
                        resolve(false);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[5]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[4]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[4]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[5]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToGoToSlidesWhileRemovingAnimationElements', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToGoToSlidesWhileRemovingAnimationElements');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);

                    carousel.getElementsManager().removeElements([0, 1]);

                    if (carousel.getElementsManager().getCollection().length != 3)
                        resolve(false);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToGoToSlidesWhileRemovingOtherElements', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToGoToSlidesWhileRemovingOtherElements');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);

                    carousel.getElementsManager().removeElements([2]);

                    if (carousel.getElementsManager().getCollection().length != 2)
                        resolve(false);

                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToHandleChildrenAnimations', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToHandleChildrenAnimations');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation',
                        ],
                        childrenStyles: [
                            {
                                selector: '.slide-text',
                                styles: [
                                    'sora-color-to-blue-animation-test',
                                ],
                            }
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);
                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);

    it('mustBeAbleToRunComplexAnimations', async () => {
        var browser = await PuppeterManagement.PuppeteerManager.getInstance().getPuppeteerBrowser();
        var page = await browser.newPage();

        await page.goto('http://localhost:8080/test-mustBeAbleToRunComplexAnimations');

        var evaluationResult : any = page.evaluate(function () {
            function goNext(carousel : CarouselBasic.SingleSlideCarousel) : CarouselBasic.ISingleSlideCarouselGoToAnimationStatus {
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation-test-1',
                            'sora-fade-in-animation-test-2',
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
                var goNextActionStatus = carousel.handle((window as any).sora.actions.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, {
                    enterAnimation: {
                        slideStyles: [
                            'sora-fade-in-animation-test-1',
                            'sora-fade-in-animation-test-2',
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

            try {
                var divElement : HTMLElement = document.getElementById('sora-carousel')
                var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });

                return new Promise<boolean>(function(resolve, reject) {
                    var animationStatus = goNext(carousel);
                    Promise.all([
                        animationStatus.enterSlideStatus.elementAnimationStatus,
                        animationStatus.leaveSlideStatus.elementAnimationStatus,
                        animationStatus.soraHandlerStatus,
                    ]).then(function(animationStatusPromisesResponses) {
                        var oldActiveElement = animationStatusPromisesResponses[1].element;
                        var newActiveElement = animationStatusPromisesResponses[0].element;

                        var conditions : boolean =
                            newActiveElement === carousel.getElementsManager().getCollection()[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                            && oldActiveElement === carousel.getElementsManager().getCollection()[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                        ;

                        if (conditions) {
                            var animationStatus = goPrevious(carousel);

                            Promise.all([
                                animationStatus.enterSlideStatus.elementAnimationStatus,
                                animationStatus.leaveSlideStatus.elementAnimationStatus,
                                animationStatus.soraHandlerStatus,
                            ]).then(function(animationStatusPromisesResponses) {
                                var oldActiveElement = animationStatusPromisesResponses[1].element;
                                var newActiveElement = animationStatusPromisesResponses[0].element;

                                var conditions : boolean =
                                    newActiveElement === carousel.getElementsManager().getCollection()[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                    && oldActiveElement === carousel.getElementsManager().getCollection()[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN)
                                ;

                                resolve(
                                    conditions
                                );
                            }).catch(function(err) {
                                reject(err);
                            });
                        } else
                            resolve(
                                false
                            );
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);

        //await page.goto('about:blank');
        await page.close();
    }, longTimeLimit);
});