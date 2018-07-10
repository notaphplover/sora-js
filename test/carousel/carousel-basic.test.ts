import { CarouselBasic } from '../../src/carousel/carousel-basic'
import { SoraJsUtils } from '../util/sora-js-common-resources'
import { HtmlUtils } from '../util/html-builder';

const fs = require('fs');

const puppeteer = require('puppeteer');

var commonResourcesManager = new SoraJsUtils.SoraJsCommonresources();
var browser : any;

var expressServer : any;

beforeAll(
    () => {
        var express = require('express');
        var app = express();

        app.use('/dist', express.static(__dirname + '/../../../../dist'));

        //prepare test pages

        var htmlBuilder = new HtmlUtils.HtmlBuilder();
        htmlBuilder.loadResourcesAsUris([SoraJsUtils.SORA_JS_CSS_PATH], [SoraJsUtils.SORA_JS_JS_PATH])
        htmlBuilder.setHtmlData(
`
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
`
        );

        app.get('/test-mustBeAbleToGoToSlides', function(req : any, res : any){
            res.send(htmlBuilder.buildHTML());
        });

        let port : number = 8080;

        return Promise.all([
            new Promise<void>(function(resolve, reject) {
                app.listen(port, function () {
                    console.log('app listening on port ' + port + '...');
                    expressServer = app;
                    resolve();
                });
            }),
            commonResourcesManager.getPuppeteerBrowser()
                .then(browserResponse => browser = browserResponse)
                .catch(err => { throw new Error(err); }),
        ]);
    }
);

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
                var children = divElement.querySelectorAll('.' + (window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER + ' > .' + (window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE);

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
                            newActiveElement === children[1]
                            && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN)
                            && oldActiveElement === children[0]
                            && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                            && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN)
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
                                    newActiveElement === children[0]
                                    && newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && !newActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN)
                                    && oldActiveElement === children[1]
                                    && !oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE)
                                    && oldActiveElement.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN)
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
    }, 100000000);

});