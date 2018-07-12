import { ExpressUtils } from './util/express-server-manager';
import { PuppeterManagement } from './util/puppeteer-manager';

module.exports = function() {
    var puppeteerManager = PuppeterManagement.PuppeteerManager.getInstance();

    return Promise.all([
        puppeteerManager.dispose(),
        new Promise<void>(function(resolve, reject) { 
            ExpressUtils.stopExpress(); 
            resolve();
        })
    ]);
}