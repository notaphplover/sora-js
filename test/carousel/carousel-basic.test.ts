import { CarouselBasic } from '../../src/carousel/carousel-basic'

const fs = require('fs');

const puppeteer = require('puppeteer');

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
        expect(children[0].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);

        for (var i = 1; i < children.length; ++i) {
            expect(children[i].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
            expect(children[i].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
        }
    });

    it('mustBeAbleToGoToSlides', async () => {

        const browser = await puppeteer.launch({
            devtools: true
        });
        const page = await browser.newPage();

        // First of all, import styles
        var parseDOMPromisse = new Promise<void>(function(resolve, reject) {
            fs.readFile(__dirname + '/../../../../dist/css/sora.css', 'utf8', function (err : any, cssData : string) {
                if (err)
                    reject(err);
                else
                    fs.readFile(__dirname + '/../../../../dist/js/bundle.dev.js', 'utf8', function (err : any, jsData : string) {
                        if (err) 
                            reject(err);
                        else 
                            page.setContent(
                                `<!DOCTYPE html>
                                <html>
                                    <head>
                                        <style>`
                                            + cssData +
                                        `</style>
                                        <script>
                                            ` + jsData + `
                                        </script>
                                    </head>
                                    <body>
                                        <div id="sora-carousel">
                                            <div class="sora-wrapper">
                                                <div class="sora-slide">
                                                    Content1
                                                </div> \
                                                <div class="sora-slide">
                                                    Content 2
                                                </div> \
                                                <div class="sora-slide">
                                                    Content 3
                                                </div>
                                            </div>
                                        </div>
                                    </body>
                                </html>`
                            ).then(function() {
                                resolve();
                            }).catch(function() {
                                reject();
                            });
                    });
            });
        });

        var testPromise = new Promise<boolean>(function(resolve, reject) {
            parseDOMPromisse.then(async function() {
                var chromeResult : boolean =
                    await page.evaluate(async function () {
                        function goNext(carousel : CarouselBasic.SingleSlideCarousel) : Promise<CarouselBasic.ISingleSlideCarouselAnimateElementOptions[]> {
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
                            return Promise.all([
                                goNextActionStatus.enterSlideStatus.elementAnimationStatus,
                                goNextActionStatus.leaveSlideStatus.elementAnimationStatus,
                            ]);
                        }
                
                        function goPrevious(carousel : CarouselBasic.SingleSlideCarousel) : Promise<CarouselBasic.ISingleSlideCarouselAnimateElementOptions[]> {
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
                            return Promise.all([
                                goNextActionStatus.enterSlideStatus.elementAnimationStatus,
                                goNextActionStatus.leaveSlideStatus.elementAnimationStatus,
                            ]);
                        }

                        try {
                            var divElement : HTMLElement = document.getElementById('sora-carousel')
                            var carousel : CarouselBasic.SingleSlideCarousel = new (window as any).sora.SingleSlideCarousel(divElement, { index: 0 });
                            var children = divElement.querySelectorAll('.' + (window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER + ' > .' + (window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE);
                            
                            var carouselPromise = await goNext(carousel);
                            
                            return carouselPromise[0].element.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        } catch (ex) {
                            return ex.message;
                        }
                    });

                    if (chromeResult === true) {
                        resolve(true)
                    } else {
                        reject(new Error('Something failed.'));
                    }
/*
                goNext(carousel)
                    .then(function(resolveObject) {
                        expect(children[0].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                        expect(children[0].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(children[1].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        expect(children[1].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                        goPrevious(carousel)
                            .then(function(resolveObject) {
                                expect(children[0].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                                expect(children[0].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                                expect(children[1].classList).toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                                expect(children[1].classList).not.toContain(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                                resolve(true);
                            })
                            .catch(function(err) {
                                reject(err);
                            })
                        ;
                    })
                    .catch(function(err) {
                        reject(err);
                    })
                ;*/
            }).catch(function(err) {
                reject(err);
            });
        });

        await expect(testPromise).resolves.toBe(true);
    }, 100000000);
    
});