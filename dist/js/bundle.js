!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).sora=e()}}(function(){return function s(o,a,l){function u(n,e){if(!a[n]){if(!o[n]){var t="function"==typeof require&&require;if(!e&&t)return t(n,!0);if(c)return c(n,!0);var i=new Error("Cannot find module '"+n+"'");throw i.code="MODULE_NOT_FOUND",i}var r=a[n]={exports:{}};o[n][0].call(r.exports,function(e){return u(o[n][1][e]||e)},r,r.exports,s,o,a,l)}return a[n].exports}for(var c="function"==typeof require&&require,e=0;e<l.length;e++)u(l[e]);return u}({1:[function(e,n,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=t.CarouselBase=void 0;(i||(t.CarouselBase=i={})).CarouselBase=function e(n){!function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,e),this.elements=n}},{}],2:[function(e,n,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.CarouselBasic=void 0;var i=function(){function i(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(e,n,t){return n&&i(e.prototype,n),t&&i(e,t),e}}(),r=e("./carousel-base");var s=t.CarouselBasic=void 0;!function(l){l.SINGLE_SLIDE_CAROUSEL_STYLES={CLEAR_ANIMATION:"sora-clear-animations",HIDDEN:"sora-hidden",SLIDE:"sora-slide",SLIDE_ACTIVE:"sora-slide-active",WRAPPER:"sora-wrapper"},l.SINGLE_SLIDE_CAROUSEL_ACTIONS={GO_TO:"to",GO_TO_NEXT:"next",GO_TO_PREVIOUS:"prev"};var e=function(e){function o(e,n){if(function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,o),null==e)throw new Error("The element must not be null.");var t=e.querySelector("."+l.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER);if(null==t)throw new Error("The element has no child with class 'sora-wrapper'.");for(var i=new Array,r=0;r<t.children.length;++r)t.children[r].classList.contains(l.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE)&&i.push(t.children[r]);var s=function(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}(this,(o.__proto__||Object.getPrototypeOf(o)).call(this,i));if(s.activeIndex=n.index||0,s.currentAnimation=null,s.activeIndex<0||s.activeIndex>=s.elements.length)throw new Error("Invalid options.index. There is no element with index "+n.index+".");for(r=0;r<i.length;++r)r==s.activeIndex?i[r].classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE):i[r].classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);return s}return function(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}(o,r.CarouselBase.CarouselBase),i(o,[{key:"handle",value:function(e,n){switch(e){case l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO:if(null==n||"number"!=typeof n.index)throw new Error("Invalid options for '"+l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO+"'.");return this.handleGoTo(n);case l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT:return n.index=(this.activeIndex+1)%this.elements.length,this.handle(l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO,n);case l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:return n.index=((this.activeIndex-1)%this.elements.length+this.elements.length)%this.elements.length,this.handle(l.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO,n)}}},{key:"handleGoTo",value:function(i){if(i.index<0||i.index>=this.elements.length)throw new Error("Invalid index. There is no element with index "+i.index+".");if(i.index==this.activeIndex)throw new Error("Invalid index. It's not allowed to go to the current active slide");if(null!=this.currentAnimation)throw new Error("It's not allowed to start an animation while an existing animation over an slide element is active");this.currentAnimation=i;var r=this.activeIndex,s=i.index;this.elements[s].classList.remove(l.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);var e=this.handleAnimationOverSlide(this.elements[s],i.enterAnimation),o=this.handleAnimationOverSlide(this.elements[r],i.leaveAnimation),a=this,n=new Promise(function(n,t){Promise.all([e.elementAnimationStatus,o.elementAnimationStatus]).then(function(e){a.elements[r].classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN),a.elements[r].classList.remove(l.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE),a.elements[s].classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE),a.activeIndex=i.index,a.currentAnimation=null,n()}).catch(function(e){t(e)})});return{enterSlideStatus:e,leaveSlideStatus:o,soraHandlerStatus:n}}},{key:"handleAnimationOverSlide",value:function(e,n){var t={};if(n.childrenStyles)for(var i=0;i<n.childrenStyles.length;++i){var r=n.childrenStyles[i];t[r.selector]||(t[r.selector]=new Array);for(var s=e.querySelectorAll(r.selector),o=0;o<s.length;++o)t[r.selector].push(this.handleAnimationOverElement({element:s[o],styles:r.styles}))}return{elementAnimationStatus:this.handleAnimationOverElement({element:e,styles:n.slideStyles}),childrenAnimationStatus:t}}},{key:"handleAnimationOverElement",value:function(e){var r=e.element,s=e.styles;if(!s)throw new Error("It's required to have an array of styles to generate an animation.");if(s.length<1)throw new Error("It's required to have at least one class to generate an animation.");var o=this;return new Promise(function(t,n){try{for(var e=new Array,i=1;i<s.length;++i)e.push(function(n){return function(){if(o.elements[o.activeIndex].classList.remove(s[n-1]),o.unregisterAnimationListener(r,e[n-1]),n<s.length-1)o.registerAnimationListener(r,e[n]);else{o.registerAnimationListener(r,function e(){r.classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION),r.classList.remove(s[n]),r.classList.remove(l.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION),o.unregisterAnimationListener(r,e),t({element:r,styles:s})})}o.elements[o.activeIndex].classList.add(s[n])}}(i));if(0<e.length)o.registerAnimationListener(r,e[0]);else{o.registerAnimationListener(r,function e(n){r.classList.add(l.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION),r.classList.remove(s[0]),r.classList.remove(l.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION),o.unregisterAnimationListener(r,e),t({element:r,styles:s})})}r.classList.add(s[0])}catch(e){n(e)}})}},{key:"registerAnimationListener",value:function(e,n){e.addEventListener("animationend",n),e.addEventListener("webkitAnimationEnd",n)}},{key:"unregisterAnimationListener",value:function(e,n){e.removeEventListener("animationend",n),e.removeEventListener("webkitAnimationEnd",n)}}]),o}();l.SingleSlideCarousel=e}(s||(t.CarouselBasic=s={}))},{"./carousel-base":1}],3:[function(e,n,t){"use strict";var i=e("./carousel/carousel-basic"),r={actions:{SINGLE_SLIDE_CAROUSEL_ACTIONS:i.CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS},SingleSlideCarousel:i.CarouselBasic.SingleSlideCarousel,styles:{SINGLE_SLIDE_CAROUSEL_STYLES:i.CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES}};n.exports=r},{"./carousel/carousel-basic":2}]},{},[3])(3)});