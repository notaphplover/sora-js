import { CarouselBasic } from '../../src/carousel/carousel-basic'
import { SoraJsUtils } from '../util/sora-js-common-resources'
import { HtmlUtils } from '../util/html-builder';
import { PuppeteerHtmlUtils } from '../util/puppeteer-page-manager';

const fs = require('fs');

const puppeteer = require('puppeteer');

var commonResourcesManager = new SoraJsUtils.SoraJsCommonresources();
var browser : any;

beforeAll(
    () =>
        commonResourcesManager.getPuppeteerBrowser()
            .then(browserResponse => browser = browserResponse)
            .catch(err => { throw new Error(err); })
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
        var htmlBuilder = new HtmlUtils.HtmlBuilder();
        htmlBuilder.loadResourcesFromPaths([SoraJsUtils.SORA_JS_CSS_PATH], [SoraJsUtils.SORA_JS_JS_PATH])
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

        var page = await browser.newPage();

        var pageManager = new PuppeteerHtmlUtils.PuppeteerPageManager();
        await pageManager.setPageContent(page, htmlBuilder.buildHTML());

        var evaluationResult : any = await page.evaluate(function () {
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

                return new Promise<boolean>(function(resolve, reject) {
                    goNext(carousel).then(function(carouselAnimations) {
                        resolve(carouselAnimations[0].element.classList.contains((window as any).sora.styles.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE));
                    }).catch(function(err) {
                        reject(err);
                    });
                });

                return
            } catch (ex) {
                return ex.message;
            }
        });

        await expect(evaluationResult).resolves.toBe(true);
    }, 100000000);

});