import { HtmlUtils } from './html-builder';
import { PuppeteerHtmlUtils } from './puppeteer-page-manager';

const puppeteer = require('puppeteer');

export namespace SoraPuppeteerHtmlUtils {

    const SORA_JS_CSS_PATH = __dirname + '/../../../../dist/css/sora.css';
    const SORA_JS_JS_PATH = __dirname + '/../../../../dist/js/bundle.dev.js';

    export class SoraJsPuppeteerManager {

        //#region Attributes

        /**
         * Chromiun Web browser.
         */
        protected browser : any;

        /**
         * sora-js css resource.
         */
        protected soraJsCssResource : string;

        /**
         * sora-js js resource.
         */
        protected soraJsJsResource : string;

        //#endregion

        /**
         * Creates a new instance.
         */
        public constructor() { }

        /**
         * Creates a page from the current browser and the current html, css and js resources.
         * @returns Promise fullfilled once the page is created.
         */
        public createPageFromContent() : Promise<any> {
            return new Promise<any>(function(resolve, reject) {
                var that = this;
                (this.browser.newPage() as Promise<any>)
                    .then(function(anyData) {
                        var page = anyData;
                        var puppeteerPageManager = new PuppeteerHtmlUtils.PuppeteerPageManager(page);
                        puppeteerPageManager.loadResourcesFromText([that.soraJsCssResource], [that.soraJsJsResource]);
                        puppeteerPageManager.setHtmlData(that.htmlData);
                        puppeteerPageManager.setPageContent()
                            .then(function() {
                                resolve(page);
                            }).catch(function(err) {
                                reject(err);
                            });
                    }).catch(function(err) {
                        reject(err);
                    });
            });

        }

        /**
         * Returns the chromiun browser.
         * @returns Chromiun browser.
         */
        public getPuppeteerBrowser() : any {
            return this.browser;
        }

        /**
         * Initializes the resources managed by this instance.
         * @param browserOptions Puppeteer options for launching a Chromiun browser.
         * @returns Promise fullfilled once all the resources needed are loaded.
         */
        public init(browserOptions : any) : Promise<void> {
            var that = this;
            return new Promise<void>(function(resolve, reject) {
                Promise.all([
                    that.launchBrowser(browserOptions),
                    new Promise<void>(function(resolve, reject){
                        HtmlUtils.loadResourceFromPathAsData(SORA_JS_CSS_PATH)
                            .then(function(resource) {
                                that.soraJsCssResource = resource.content;
                                resolve();
                            }).catch(function(err) {
                                reject(err);
                            });
                    }),
                    new Promise<void>(function(resolve, reject){
                        HtmlUtils.loadResourceFromPathAsData(SORA_JS_JS_PATH)
                            .then(function(resource) {
                                that.soraJsJsResource = resource.content;
                                resolve();
                            }).catch(function(err) {
                                reject(err);
                            });
                    }),
                ]).then(function(resolveObject) {
                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            });
        }

        /**
         * Frees all the resources that would persist even if this instance is deleted.
         * @returns Promise fullfilled once all the problematic resources are disposed.
         */
        public dispose() : Promise<void> {
            if (this.browser == null)
                return new Promise<void>(function(resolve) { resolve(); });
            else
                return this.browser.close() as Promise<void>;
        }

        /**
         * Launch a new browser.
         * @param options Puppeteer options for launching a Cromiun browser.
         * @returns Promise fullfilled once the browser is loaded.
         */
        protected launchBrowser(options : any) : Promise<void> {
            var that = this;
            return new Promise<void>(function(resolve, reject) {
                (puppeteer.launch(options) as Promise<any>)
                    .then(function(browser) {
                        that.browser = browser;
                        resolve();
                    }).catch(function(err) {
                        reject(err);
                    });
            })
        }

        /**
         * Runs a test in a page generated using the current browser.
         * 
         * @param htmlData Html data of the page to create.
         * @param callable Callable object to be evaluated.
         * @param return Promise fullfilled once the page is created and the object is evaluated inside the page.
         */
        public runTest(htmlData : string, callable : () => any) : Promise<any> {
            if (this.browser == null)
                throw new Error('The browser is not launched.');

            var that = this;

            return new Promise<any>(function(resolve, reject) {
                (that.browser.newPage() as Promise<any>)
                    .then(function(anyData) {
                        var page = anyData;
                        var puppeteerPageManager = new PuppeteerHtmlUtils.PuppeteerPageManager(page);
                        puppeteerPageManager.loadResourcesFromText([that.soraJsCssResource], [that.soraJsJsResource]);
                        puppeteerPageManager.setHtmlData(htmlData);
                        puppeteerPageManager.setPageContentAndRunTest(callable)
                            .then(function(anyData) {
                                resolve(anyData);
                            }).catch(function(err) {
                                reject(err);
                            });
                    }).catch(function(err) {
                        reject(err);
                    });
            })
        }

        /**
         * Runs a test in a page.
         * 
         * @param page Page to use in order to run the test.
         * @param callable Callable object to be evaluated.
         * @returns Promise fullfilled once the callable object is evaluated.
         */
        public runTestInPage(page : any, callable: () => any) : Promise<any> {
            var puppeteerPageManager = new PuppeteerHtmlUtils.PuppeteerPageManager(page);
            return puppeteerPageManager.runTest(callable);
        }

    }
}