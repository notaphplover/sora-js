const puppeteer = require('puppeteer');

export namespace PuppeterManagement {

    export class PuppeteerManager {

        //#region Attributes

        /**
         * Chromiun Web browser. This will be a singleton instance
         */
        protected browser : any;

        //#endregion

        /**
         * Creates a new instance.
         */
        protected constructor() { }

        /**
         * Returns the chromiun browser.
         * @returns Chromiun browser.
         */
        public getPuppeteerBrowser() : Promise<any> {
            return this.initBrowser();
        }

        /**
         * Initializes the browser managed by this instance.
         * @returns Promise fullfilled once the browser is loaded.
         */
        public initBrowser() : Promise<any> {
            var that = this;
            if (this.browser == null) {
                const browserOptions = {
                    //devtools: true,
                };
                return this.launchBrowser(browserOptions);
            } else
                return new Promise<any>(function(resolve, reject){ resolve(that.browser); });
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
        protected launchBrowser(options : any) : Promise<any> {
            var that = this;
            return new Promise<void>(function(resolve, reject) {
                (puppeteer.launch(options) as Promise<any>)
                    .then(function(browser) {
                        that.browser = browser;
                        resolve(browser);
                    }).catch(function(err) {
                        reject(err);
                    });
            })
        }

        //#region SINGLETON

        /**
         * Singleton instance
         */
        protected static instance : PuppeteerManager = new PuppeteerManager();

        public static getInstance() : PuppeteerManager {
            return this.instance;
        }

        //#endregion
    }
}