import { HtmlUtils } from './html-builder'

export namespace PuppeteerHtmlUtils {
    export class PuppeteerPageManager extends HtmlUtils.HtmlBuilder {

        //#region Attributes

        protected page : any;

        //#endregion

        /**
         * Creates a new PuppeterPageManager instance.
         * @param page Chromiun page obtained from Puppeteer.
         */
        public constructor(page: any) {
            super();

            this.page = page;
        }

        //#region Public

        /**
         * Evaluates the callable object in the page.
         * @param callable Callable object to be evaluated by the Puppeteer page.
         * @returns Promise fullfilled once the callable object is successfully evaluated by the page.
         */
        public runTest(callable : () => any) : Promise<any> {
            return this.page.evaluate(callable()) as Promise<any>;
        }

        /**
         * Set the manager content as the content of the page.
         * @returns Promise fullfilled once the content is set in the page.
         */
        public setPageContent() : Promise<void> {
            return this.page.setContent(this.buildHTML());
        }

        /**
         * Loads the content of the manager in the page. Then, evaluates the callable object.
         * @param callable Callable object to be evaluated by the Puppeteer page.
         * @returns Promise fullfilled once the content is loaded on the page and also the
         * callable object is successfully evaluated by the page.
         */
        public setPageContentAndRunTest(callable : () => any) : Promise<any> {
            var that = this;
            return new Promise<any>(function(resolve, reject) {
                that.setPageContent()
                    .then(function() {
                        (that.runTest(callable()) as Promise<any>)
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