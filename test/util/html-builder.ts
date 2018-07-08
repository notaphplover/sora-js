export namespace HtmlUtils {

    const fs = require('fs');

    /**
     * Represents different data types
     */
    export enum ResourceType {
        /**
         * The data is stored directly in the instance.
         */
        DATA,
        /**
         * The data is stored in a path pointed by this instance.
         */
        PATH,
        /**
         * The data is stored in a URI pointed by this instance
         */
        URI,
    }

    /**
     * Represents a data resource
     */
    export interface IDataResource {
        content : string;
        type : ResourceType;
    }

    /**
     * Loads a resource.
     * @param path Path to the resource.
     * @returns Promise with the resource.
     */
    export function loadResourceFromPathAsData(path : string, encoding : string = 'utf8') : Promise<string> {
        return new Promise<string>(function(resolve, reject) {
            fs.readFile(path, encoding, function (err : any, data : string) {
                if (err != null)
                    reject(err);
                else
                    resolve(data);
           });
       });
    }

    export class HtmlBuilder {

        //#region Attributes

        /**
         * Css data.
         */
        protected cssData : IDataResource[];

        /**
         * html data.
         */
        protected htmlData : string;

        /**
         * Js data.
         */
        protected jsData : IDataResource[];

        //#endregion

        /**
         * Creates a new PupeeterPageManager
         */
        public constructor() {
            this.cssData = new Array();
            this.htmlData = '';
            this.jsData = new Array();
        }

        /* #region Public */

        public buildHTML() : string {
            /*
             * Note: Concatenating strings using the '+' operator is the fastest choice
             * (yeah, it's efficient, there must be some magic in the javascript engines
             * that acts as a StringBuilder).
             */
            var htmlText =
`<!DOCTYPE html>
<html>
    <head>`
            ;

            //I won't sanitize inputs, sorry.
            for (var i = 0; i < this.cssData.length; ++i)
                htmlText = htmlText + this.buildCssResource(this.cssData[i]);

            for (var i = 0; i < this.jsData.length; ++i)
                htmlText = htmlText + this.buildJsResource(this.jsData[i]);

            htmlText = htmlText +
`   </head>
    <body>`
            ;

            htmlText = htmlText + this.htmlData;

            htmlText = htmlText +
`   </body>
</html>`
            ;

            return htmlText;
        }

        /**
         * Loads resources from paths.
         *
         * @param cssResourcesPaths Paths to css resources.
         * @param jsResourcesPaths Paths to js resources.
         * @returns Promise resolved when all the resources are loaded.
         */
        public loadResourcesFromPathsAsData(cssResourcesPaths : string[], jsResourcesPaths : string[]) : Promise<[void, void]>{
            var cssPromises : Promise<IDataResource>[] = new Array();
            var jsPromises : Promise<IDataResource>[] = new Array();

            for (var i = 0; i < cssResourcesPaths.length; ++i)
                cssPromises.push(this.stringPromiseToResourcePromise(loadResourceFromPathAsData(cssResourcesPaths[i])));
            for (var i = 0; i < jsResourcesPaths.length; ++i)
                jsPromises.push(this.stringPromiseToResourcePromise(loadResourceFromPathAsData(cssResourcesPaths[i])))

            var that = this;
            return Promise.all(
                [
                    new Promise<void>(function(resolve, reject) {
                        Promise.all(cssPromises).then(function(cssTexts) {
                            for(var i = 0; i < cssPromises.length; ++i)
                                that.cssData.push(cssTexts[i]);
                            resolve();
                        }).catch(function(err) {
                            reject(err);
                        })
                    }),
                    new Promise<void>(function(resolve, reject) {
                        Promise.all(jsPromises).then(function(jsTexts) {
                            for(var i = 0; i < jsPromises.length; ++i)
                                that.jsData.push(jsTexts[i]);
                            resolve();
                        }).catch(function(err) {
                            reject(err);
                        })
                    }),
                ]
            );
        }

        /**
         * Loads Resources from paths.
         *
         * @param cssResourcesPaths Css resource paths.
         * @param jsResourcesPaths Js Resource paths.
         */
        public loadResourcesFromPaths(cssResourcesPaths : string[], jsResourcesPaths : string[]) : void {
            for(var i = 0; i < cssResourcesPaths.length; ++i)
                this.cssData.push({
                    content : cssResourcesPaths[i],
                    type: ResourceType.PATH,
                });

            for(var i = 0; i < jsResourcesPaths.length; ++i)
                this.jsData.push({
                    content : jsResourcesPaths[i],
                    type: ResourceType.PATH,
                });
        }

        /**
         * Loads resources into the manager.
         *
         * @param cssResources Css resources.
         * @param jsResources Js resources.
         */
        public loadResourcesFromText(cssResources : string[], jsResources : string[]) : void {
            for (var i = 0; i < cssResources.length; ++i)
                this.cssData.push({
                    content : cssResources[i],
                    type : ResourceType.DATA,
                });
            for (var i = 0; i < jsResources.length; ++i)
                this.jsData.push({
                    content : jsResources[i],
                    type : ResourceType.DATA,
                });
        }

        /**
         * Sets the html resource.
         * @param htmlResource Html resource.
         */
        public setHtmlData(htmlResource : string) : void {
            this.htmlData = htmlResource;
        }

        /**
         * Sets the Html resource from a path.
         * @param htmlResourcePath Path to the Html resource.
         * @returns Promise resolved once the resource is loaded.
         */
        public setHtmlDataFromPath(htmlResourcePath : string) : Promise<void> {
            var that = this;
            return new Promise<void>(function(resolve, reject) {
                loadResourceFromPathAsData(htmlResourcePath).then(function(resourceData) {
                    that.setHtmlData(resourceData);
                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            })
        }

        /**
         * Converts a string promise into a data resource promise.
         * @param promise String promise
         * @returns Data resource promise.
         */
        public stringPromiseToResourcePromise(promise : Promise<string>) : Promise<IDataResource> {
            return new Promise<IDataResource>(function(resolve, reject) {
                promise.then(function(data) {
                    resolve({
                        content: data,
                        type: ResourceType.DATA,
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });
        }

        //#endregion

        //#region Protected

        /**
         * Bilds html code to include a CSS resource in the head element of the page.
         * @param resource Css resource to be loaded.
         * @returns Html code that represents the inclusion of the resource.
         */
        protected buildCssResource(resource : IDataResource) : string {
            switch(resource.type) {
                case ResourceType.DATA:
                    return `<style>` + resource.content + `</style>`;
                case ResourceType.URI:
                    return `<link rel="stylesheet" href="` + resource.content + `">`;
                case ResourceType.PATH:
                    return `<link rel="stylesheet" href="file:///` + resource.content + `">`
                default:
                    throw new Error('Unexpected resource type ' + resource.type);
            }
        }

        /**
         * Bilds html code to include a JS resource in the head element of the page.
         * @param resource Js resource to be loaded.
         * @returns Html code that represents the inclusion of the resource.
         */
        protected buildJsResource(resource : IDataResource) : string {
            switch(resource.type) {
                case ResourceType.DATA:
                    return `<script>` + resource.content + `</script>`;
                case ResourceType.URI:
                    return `<script src="` + resource.content + `"></script>`;
                case ResourceType.PATH:
                    return `<script src="file:///` + resource.content + `"></script>`
                default:
                    throw new Error('Unexpected resource type ' + resource.type);
            }
        }

        //#endregion
    }
}