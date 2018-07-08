import { HtmlUtils } from './html-builder'

export namespace PuppeteerHtmlUtils {
    export class PuppeteerPageManager {

        /**
         * Creates a new PuppeterPageManager instance.
         */
        public constructor() { }

        //#region Public

        /**
         * Evaluates the callable object in the page.
         * @param page Chromiun page to use to run the test.
         * @param callable Callable object to be evaluated by the Puppeteer page.
         * @returns Promise fullfilled once the callable object is successfully evaluated by the page.
         */
        public runTest(page : any, callable : () => any) : Promise<any> {
            return page.evaluate(callable()) as Promise<any>;
        }

        /**
         * Set the manager content as the content of the page.
         * @param page Chromiun page to use to run the test.
         * @returns Promise fullfilled once the content is set in the page.
         */
        public setPageContent(page : any, htmlContent : string) : Promise<void> {
            return page.setContent(htmlContent);
        }

        /**
         * Loads the content of the manager in the page. Then, evaluates the callable object.
         * @param page Chromiun page to use to run the test.
         * @param callable Callable object to be evaluated by the Puppeteer page.
         * @returns Promise fullfilled once the content is loaded on the page and also the
         * callable object is successfully evaluated by the page.
         */
        public setPageContentAndRunTest(page : any, htmlContent : string, callable : () => any) : Promise<any> {
            var that = this;
            return new Promise<any>(function(resolve, reject) {
                that.setPageContent(page, htmlContent)
                    .then(function() {
                        that.runTest(page, callable)
                            .then(function(anyData : any) {
                                resolve(anyData);
                            }).catch(function(err) {
                                reject(err);
                            });
                    }).catch(function(err) {
                        reject(err);
                    })
                ;
            })
        }

        //#endregion
    }
}