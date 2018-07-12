import { handleCarouselBasicPages } from './express-pages/carousel-basic';

export namespace ExpressUtils {

    /**
     * Port used to listen HTTP request
     */
    export const EXPRESS_PORT = 8080;

    /**
     * Sora.js CSS resource uri
     */
    export const SORA_JS_CSS_URI = 'http://localhost:' + EXPRESS_PORT + '/dist/css/sora.css';

    /**
     * Sora.js JS resource uri
     */
    export const SORA_JS_JS_URI = 'http://localhost:' + EXPRESS_PORT + '/dist/js/bundle.dev.js';

    /**
     * Instance where the HTTP server managed by Express is returned
     */
    var expressServer : any;

    /**
     * Sockets store. These sockets will be stored each time a connection is started.
     * These sockets will be destroyed when stopping the server.
     */
    var sockets : { [key : number] : any } = { };

    /**
     * Socket id counter
     */
    var nextSocketId : number = 0;

    /**
     * Starts Express.
     */
    export function startExpress() : Promise<void> {
        var express = require('express');
        var app = express();

        app.use('/dist', express.static(__dirname + '/../../../../dist'));

        //prepare test pages

        handleCarouselBasicPages(app);

        return new Promise<void>(function(resolve, reject) {
            expressServer = app.listen(EXPRESS_PORT, function () {
                console.log('Express listening on port ' + EXPRESS_PORT + '...');
                resolve();
            });

            expressServer.on('connection', function (socket : any) {
                // Add a newly connected socket
                var socketId = nextSocketId++;
                sockets[socketId] = socket;
                console.log('socket', socketId, 'opened');
              
                // Remove the socket when it closes
                socket.once('close', function () {
                  console.log('socket', socketId, 'closed');
                  delete sockets[socketId];
                });
            });
        })
    }

    /**
     * Stops Express
     */
    export function stopExpress() : void{
        if (expressServer != null) {
            expressServer.close(() => {
                console.log('Stopping Express.');
            });

            for (var socketId in sockets) {
                console.log('socket', socketId, 'destroyed');
                sockets[socketId].destroy();
            }
        }
    }
}