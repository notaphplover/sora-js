import { HtmlUtils } from '../../util/html-builder';
import { ExpressUtils } from '../express-server-manager';

export function handleCarouselBasicPages(app : any) {
    mustBeAbleToGoToSlidesPage(app);
    mustBeAbleToRunComplexAnimations(app);
}

function mustBeAbleToGoToSlidesPage(app : any) {
    var htmlBuilder = new HtmlUtils.HtmlBuilder();
    htmlBuilder.loadResourcesAsUris([ExpressUtils.SORA_JS_CSS_URI], [ExpressUtils.SORA_JS_JS_URI])
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
}

function mustBeAbleToRunComplexAnimations(app : any) {
    var htmlBuilder = new HtmlUtils.HtmlBuilder();
    htmlBuilder.loadResourcesAsUris([ExpressUtils.SORA_JS_CSS_URI], [ExpressUtils.SORA_JS_JS_URI])
    htmlBuilder.loadResourcesFromText([
`<style>
    @keyframes sora-fade-in-test {
        from {
            opacity: 0; }
        to {
            opacity: 1; } }
    
    @keyframes sora-size-in-test {
        from {
            width: 25%; }
        to {
            width: 100%; }
    }
  
    @keyframes sora-fade-out-test {
        from {
            opacity: 1; }
        to {
            opacity: 0; } }
  
    .sora-fade-in-animation-test-1 {
        animation-duration: 500ms;
        animation-name: sora-fade-in-test;
        animation-timing-function: ease-in;
        animation-fill-mode: both; }

    .sora-wrapper .sora-slide.sora-fade-in-animation-test-1 {
        width: 25%; }

    .sora-fade-in-animation-test-2 {
        animation-duration: 500ms;
        animation-name: sora-size-in-test;
        animation-timing-function: ease-in;
        animation-fill-mode: both;
        opacity: 1; }
  
    .sora-fade-out-animation-test {
        animation-duration: 1000ms;
        animation-name: sora-fade-out-test;
        animation-timing-function: ease-out;
        animation-fill-mode: both; }
</style>`
    ],[]);
    
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

    app.get('/test-mustBeAbleToRunComplexAnimations', function(req : any, res : any){
        res.send(htmlBuilder.buildHTML());
    });
}