import { HtmlUtils } from './html-builder';
import { PuppeteerHtmlUtils } from './puppeteer-page-manager';
import { resolve } from 'path';

const puppeteer = require('puppeteer');

export namespace SoraJsUtils {

    export const SORA_JS_CSS_PATH = 'http://localhost:8080/dist/css/sora.css';
    export const SORA_JS_JS_PATH = 'http://localhost:8080/dist/js/bundle.dev.js';

    export class SoraJsCommonresources {

        //#region Attributes

        /**
         * Chromiun Web browser. This will be a singleton instance
         */
        protected browser : any;

        //#endregion

        /**
         * Creates a new instance.
         */
        public constructor() { }

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
        protected initBrowser() : Promise<any> {
            var that = this;
            if (this.browser == null) {
                const browserOptions = {
                    //devtools: true
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
    }
}