(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sora = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CarouselBase = exports.CarouselBase = undefined;
(function (CarouselBase_1) {
    var CarouselBase = function CarouselBase(elements) {
        _classCallCheck(this, CarouselBase);

        this.elements = elements;
    };

    CarouselBase_1.CarouselBase = CarouselBase;
})(CarouselBase || (exports.CarouselBase = CarouselBase = {}));



},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CarouselBasic = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _carouselBase = require('./carousel-base');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CarouselBasic = exports.CarouselBasic = undefined;
(function (CarouselBasic) {
    CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES = {
        CLEAR_ANIMATION: 'sora-clear-animations',
        HIDDEN: 'sora-hidden',
        SLIDE: 'sora-slide',
        SLIDE_ACTIVE: 'sora-slide-active',
        WRAPPER: 'sora-wrapper'
    };
    CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS = {
        GO_TO: 'to',
        GO_TO_NEXT: 'next',
        GO_TO_PREVIOUS: 'prev'
    };

    var SingleSlideCarousel = function (_CarouselBase$Carouse) {
        _inherits(SingleSlideCarousel, _CarouselBase$Carouse);

        function SingleSlideCarousel(element, options) {
            _classCallCheck(this, SingleSlideCarousel);

            if (element == null) throw new Error('The element must not be null.');
            var soraWrapper = element.querySelector('.' + CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.WRAPPER);
            if (soraWrapper == null) throw new Error('The element has no child with class \'sora-wrapper\'.');
            var children = new Array();
            for (var i = 0; i < soraWrapper.children.length; ++i) {
                if (soraWrapper.children[i].classList.contains(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE)) children.push(soraWrapper.children[i]);
            }

            var _this = _possibleConstructorReturn(this, (SingleSlideCarousel.__proto__ || Object.getPrototypeOf(SingleSlideCarousel)).call(this, children));

            _this.activeIndex = options.index || 0;
            _this.currentAnimation = null;
            if (_this.activeIndex < 0 || _this.activeIndex >= _this.elements.length) throw new Error('Invalid options.index. There is no element with index ' + options.index + '.');
            for (var i = 0; i < children.length; ++i) {
                if (i == _this.activeIndex) children[i].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);else children[i].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
            }
            return _this;
        }

        _createClass(SingleSlideCarousel, [{
            key: 'handle',
            value: function handle(action, options) {
                switch (action) {
                    case CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO:
                        if (options == null || typeof options.index !== 'number') throw new Error('Invalid options for \'' + CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO + '\'.');
                        return this.handleGoTo(options);
                    case CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT:
                        options.index = (this.activeIndex + 1) % this.elements.length;
                        return this.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                    case CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:
                        options.index = ((this.activeIndex - 1) % this.elements.length + this.elements.length) % this.elements.length;
                        return this.handle(CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                }
            }
        }, {
            key: 'handleGoTo',
            value: function handleGoTo(options) {
                if (options.index < 0 || options.index >= this.elements.length) throw new Error('Invalid index. There is no element with index ' + options.index + '.');
                if (options.index == this.activeIndex) throw new Error('Invalid index. It\'s not allowed to go to the current active slide');
                if (null == this.currentAnimation) this.currentAnimation = options;else {
                    throw new Error('It\'s not allowed to start an animation while an existing animation over an slide element is active');
                }
                var oldActiveIndex = this.activeIndex;
                var newActiveIndex = options.index;
                this.elements[newActiveIndex].classList.remove(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                var enterAnimationStatus = this.handleAnimationOverSlide(this.elements[oldActiveIndex], options.leaveAnimation);
                var leaveAnimationStatus = this.handleAnimationOverSlide(this.elements[newActiveIndex], options.enterAnimation);
                var that = this;
                Promise.all([enterAnimationStatus.elementAnimationStatus, leaveAnimationStatus.elementAnimationStatus]).then(function (slideAnimationStatus) {
                    that.elements[oldActiveIndex].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                    that.elements[oldActiveIndex].classList.remove(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    that.elements[newActiveIndex].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                    that.activeIndex = options.index;
                    that.currentAnimation = null;
                }).catch(function (ex) {
                    throw ex;
                });
                return {
                    enterSlideStatus: enterAnimationStatus,
                    leaveSlideStatus: leaveAnimationStatus
                };
            }
        }, {
            key: 'handleAnimationOverSlide',
            value: function handleAnimationOverSlide(element, animation) {
                var childrenStatus = {};
                if (animation.childrenStyles) {
                    for (var i = 0; i < animation.childrenStyles.length; ++i) {
                        var animationObject = animation.childrenStyles[i];
                        if (!childrenStatus[animationObject.selector]) childrenStatus[animationObject.selector] = new Array();
                        var childrenElements = element.querySelectorAll(animationObject.selector);
                        for (var j = 0; j < childrenElements.length; ++j) {
                            childrenStatus[animationObject.selector].push(this.handleAnimationOverElement({
                                element: childrenElements[j],
                                styles: animationObject.styles
                            }));
                        }
                    }
                }
                var that = this;
                return {
                    elementAnimationStatus: that.handleAnimationOverElement({
                        element: element,
                        styles: animation.slideStyles
                    }),
                    childrenAnimationStatus: childrenStatus
                };
            }
        }, {
            key: 'handleAnimationOverElement',
            value: function handleAnimationOverElement(elementAnimation) {
                var element = elementAnimation.element;
                var styles = elementAnimation.styles;
                if (styles) {
                    if (styles.length < 1) throw new Error('It\'s required to have at least one class to generate an animation.');
                } else throw new Error('It\'s required to have an array of styles to generate an animation.');
                var that = this;
                return new Promise(function (resolve, reject) {
                    try {
                        var animationFunctions = new Array();
                        for (var i = 1; i < styles.length; ++i) {
                            animationFunctions.push(function (index) {
                                return function () {
                                    that.elements[that.activeIndex].classList.remove(styles[index - 1]);
                                    that.unregisterAnimationListener(element, animationFunctions[index - 1]);
                                    if (index < styles.length - 1) {
                                        that.registerAnimationListener(element, animationFunctions[index]);
                                    } else {
                                        var clearFunction = function clearFunction() {
                                            element.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                            element.classList.remove(styles[index]);
                                            element.classList.remove(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                            that.unregisterAnimationListener(element, clearFunction);
                                            resolve({
                                                element: element,
                                                styles: styles
                                            });
                                        };
                                        that.registerAnimationListener(element, clearFunction);
                                    }
                                    that.elements[that.activeIndex].classList.add(styles[index]);
                                };
                            }(i));
                        }
                        if (animationFunctions.length > 0) {
                            that.registerAnimationListener(element, animationFunctions[0]);
                        } else {
                            var clearFunction = function clearFunction(event) {
                                element.classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                element.classList.remove(styles[0]);
                                element.classList.remove(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.CLEAR_ANIMATION);
                                that.unregisterAnimationListener(element, clearFunction);
                                resolve({
                                    element: element,
                                    styles: styles
                                });
                            };
                            that.registerAnimationListener(element, clearFunction);
                        }
                        element.classList.add(styles[0]);
                    } catch (ex) {
                        reject(ex);
                    }
                });
            }
        }, {
            key: 'registerAnimationListener',
            value: function registerAnimationListener(element, listener) {
                element.addEventListener('animationend', listener);
                element.addEventListener('webkitAnimationEnd', listener);
            }
        }, {
            key: 'unregisterAnimationListener',
            value: function unregisterAnimationListener(element, listener) {
                element.removeEventListener('animationend', listener);
                element.removeEventListener('webkitAnimationEnd', listener);
            }
        }]);

        return SingleSlideCarousel;
    }(_carouselBase.CarouselBase.CarouselBase);

    CarouselBasic.SingleSlideCarousel = SingleSlideCarousel;
})(CarouselBasic || (exports.CarouselBasic = CarouselBasic = {}));



},{"./carousel-base":1}],3:[function(require,module,exports){
'use strict';

var _carouselBasic = require('./carousel/carousel-basic');

var sora = function () {
    return {
        actions: {
            SINGLE_SLIDE_CAROUSEL_ACTIONS: _carouselBasic.CarouselBasic.SINGLE_SLIDE_CAROUSEL_ACTIONS
        },
        SingleSlideCarousel: _carouselBasic.CarouselBasic.SingleSlideCarousel,
        styles: {
            SINGLE_SLIDE_CAROUSEL_STYLES: _carouselBasic.CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES
        }
    };
}();
module.exports = sora;



},{"./carousel/carousel-basic":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2pzL3RtcC9jYXJvdXNlbC9jYXJvdXNlbC1iYXNlLmpzIiwiZGlzdC9qcy90bXAvY2Fyb3VzZWwvY2Fyb3VzZWwtYmFzaWMuanMiLCJkaXN0L2pzL3RtcC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBTyxJQUFJLCtDQUFKO0FBQ1AsQ0FBQyxVQUFVLGNBQVYsRUFBMEI7QUFBQSxRQUNqQixZQURpQixHQUVuQixzQkFBWSxRQUFaLEVBQXNCO0FBQUE7O0FBQ2xCLGFBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNILEtBSmtCOztBQU12QixtQkFBZSxZQUFmLEdBQThCLFlBQTlCO0FBQ0gsQ0FQRCxFQU9HLHlCQVJRLFlBUVIsR0FBaUIsZUFBZSxFQUFoQyxDQVBIOztBQVNBOzs7Ozs7Ozs7Ozs7QUNWQTs7Ozs7Ozs7QUFDTyxJQUFJLGlEQUFKO0FBQ1AsQ0FBQyxVQUFVLGFBQVYsRUFBeUI7QUFDdEIsa0JBQWMsNEJBQWQsR0FBNkM7QUFDekMseUJBQWlCLHVCQUR3QjtBQUV6QyxnQkFBUSxhQUZpQztBQUd6QyxlQUFPLFlBSGtDO0FBSXpDLHNCQUFjLG1CQUoyQjtBQUt6QyxpQkFBUztBQUxnQyxLQUE3QztBQU9BLGtCQUFjLDZCQUFkLEdBQThDO0FBQzFDLGVBQU8sSUFEbUM7QUFFMUMsb0JBQVksTUFGOEI7QUFHMUMsd0JBQWdCO0FBSDBCLEtBQTlDOztBQVJzQixRQWFoQixtQkFiZ0I7QUFBQTs7QUFjbEIscUNBQVksT0FBWixFQUFxQixPQUFyQixFQUE4QjtBQUFBOztBQUMxQixnQkFBSSxXQUFXLElBQWYsRUFDSSxNQUFNLElBQUksS0FBSixDQUFVLCtCQUFWLENBQU47QUFDSixnQkFBSSxjQUFjLFFBQVEsYUFBUixDQUFzQixNQUFNLGNBQWMsNEJBQWQsQ0FBMkMsT0FBdkUsQ0FBbEI7QUFDQSxnQkFBSSxlQUFlLElBQW5CLEVB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d0JBQVEsbUJBQVIsQ0FBNEIsY0FBNUIsRUFBNEMsUUFBNUM7QUFDQSx3QkFBUSxtQkFBUixDQUE0QixvQkFBNUIsRUFBa0QsUUFBbEQ7QUFDSDtBQWhMaUI7O0FBQUE7QUFBQSxNQWFZLDJCQUFhLFlBYnpCOztBQWtMdEIsa0JBQWMsbUJBQWQsR0FBb0MsbUJBQXBDO0FBQ0gsQ0FuTEQsRUFtTEcsMEJBcExRLGFBb0xSLEdBQWtCLGdCQUFnQixFQUFsQyxDQW5MSDs7QUFxTEE7Ozs7O0FDdkxBOztBQUNBLElBQUksT0FBTyxZQUFZO0FBQ25CLFdBQU87QUFDSCxpQkFBUztBQUNMLDJDQUErQiw2QkFBYztBQUR4QyxTQUROO0FBSUgsNkJBQXFCLDZCQUFjLG1CQUpoQztBQUtILGdCQUFRO0FBQ0osMENBQThCLDZCQUFjO0FBRHhDO0FBTEwsS0FBUDtBQVNILENBVlUsRUFBWDtBQVdBLE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7QUFFQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImV4cG9ydCB2YXIgQ2Fyb3VzZWxCYXNlO1xuKGZ1bmN0aW9uIChDYXJvdXNlbEJhc2VfMSkge1xuICAgIGNsYXNzIENhcm91c2VsQmFzZSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQ2Fyb3VzZWxCYXNlXzEuQ2Fyb3VzZWxCYXNlID0gQ2Fyb3VzZWxCYXNlO1xufSkoQ2Fyb3VzZWxCYXNlIHx8IChDYXJvdXNlbEJhc2UgPSB7fSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYXJvdXNlbC1iYXNlLmpzLm1hcFxuIiwiaW1wb3J0IHsgQ2Fyb3VzZWxCYXNlIH0gZnJvbSAnLi9jYXJvdXNlbC1iYXNlJztcbmV4cG9ydCB2YXIgQ2Fyb3VzZWxCYXNpYztcbihmdW5jdGlvbiAoQ2Fyb3VzZWxCYXNpYykge1xuICAgIENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUyA9IHtcbiAgICAgICAgQ0xFQVJfQU5JTUFUSU9OOiAnc29yYS1jbGVhci1hbmltYXRpb25zJyxcbiAgICAgICAgSElEREVOOiAnc29yYS1oaWRkZW4nLFxuICAgICAgICBTTElERTogJ3NvcmEtc2xpZGUnLFxuICAgICAgICBTTElERV9BQ1RJVkU6ICdzb3JhLXNsaWRlLWFjdGl2ZScsXG4gICAgICAgIFdSQVBQRVI6ICdzb3JhLXdyYXBwZXInLFxuICAgIH07XG4gICAgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUyA9IHtcbiAgICAgICAgR09fVE86ICd0bycsXG4gICAgICAgIEdPX1RPX05FWFQ6ICduZXh0JyxcbiAgICAgICAgR09fVE9fUFJFVklPVVM6ICdwcmV2JyxcbiAgICB9O1xuICAgIGNsYXNzIFNpbmdsZVNsaWRlQ2Fyb3VzZWwgZXh0ZW5kcyBDYXJvdXNlbEJhc2UuQ2Fyb3VzZWxCYXNlIHtcbiAgICAgICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBlbGVtZW50IG11c3Qgbm90IGJlIG51bGwuJyk7XG4gICAgICAgICAgICB2YXIgc29yYVdyYXBwZXIgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLldSQVBQRVIpO1xuICAgICAgICAgICAgaWYgKHNvcmFXcmFwcGVyID09IG51bGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZWxlbWVudCBoYXMgbm8gY2hpbGQgd2l0aCBjbGFzcyBcXCdzb3JhLXdyYXBwZXJcXCcuJyk7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29yYVdyYXBwZXIuY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAoc29yYVdyYXBwZXIuY2hpbGRyZW5baV0uY2xhc3NMaXN0LmNvbnRhaW5zKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5TTElERSkpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goc29yYVdyYXBwZXIuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIoY2hpbGRyZW4pO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVJbmRleCA9IG9wdGlvbnMuaW5kZXggfHwgMDtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVJbmRleCA8IDAgfHwgdGhpcy5hY3RpdmVJbmRleCA+PSB0aGlzLmVsZW1lbnRzLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgb3B0aW9ucy5pbmRleC4gVGhlcmUgaXMgbm8gZWxlbWVudCB3aXRoIGluZGV4ICcgKyBvcHRpb25zLmluZGV4ICsgJy4nKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSB0aGlzLmFjdGl2ZUluZGV4KVxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbltpXS5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5TTElERV9BQ1RJVkUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5baV0uY2xhc3NMaXN0LmFkZChDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuSElEREVOKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBoYW5kbGUoYWN0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUy5HT19UTzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5pbmRleCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgb3B0aW9ucyBmb3IgXFwnJyArIENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX0FDVElPTlMuR09fVE8gKyAnXFwnLicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVHb1RvKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNhc2UgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUy5HT19UT19ORVhUOlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmluZGV4ID0gKHRoaXMuYWN0aXZlSW5kZXggKyAxKSAlIHRoaXMuZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUy5HT19UTywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgY2FzZSBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLkdPX1RPX1BSRVZJT1VTOlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmluZGV4ID0gKCh0aGlzLmFjdGl2ZUluZGV4IC0gMSkgJSB0aGlzLmVsZW1lbnRzLmxlbmd0aCArIHRoaXMuZWxlbWVudHMubGVuZ3RoKSAlIHRoaXMuZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGUoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUy5HT19UTywgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlR29UbyhvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pbmRleCA8IDAgfHwgb3B0aW9ucy5pbmRleCA+PSB0aGlzLmVsZW1lbnRzLmxlbmd0aClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5kZXguIFRoZXJlIGlzIG5vIGVsZW1lbnQgd2l0aCBpbmRleCAnICsgb3B0aW9ucy5pbmRleCArICcuJyk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pbmRleCA9PSB0aGlzLmFjdGl2ZUluZGV4KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbmRleC4gSXRcXCdzIG5vdCBhbGxvd2VkIHRvIGdvIHRvIHRoZSBjdXJyZW50IGFjdGl2ZSBzbGlkZScpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGhpcy5jdXJyZW50QW5pbWF0aW9uKVxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFuaW1hdGlvbiA9IG9wdGlvbnM7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0XFwncyBub3QgYWxsb3dlZCB0byBzdGFydCBhbiBhbmltYXRpb24gd2hpbGUgYW4gZXhpc3RpbmcgYW5pbWF0aW9uIG92ZXIgYW4gc2xpZGUgZWxlbWVudCBpcyBhY3RpdmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvbGRBY3RpdmVJbmRleCA9IHRoaXMuYWN0aXZlSW5kZXg7XG4gICAgICAgICAgICB2YXIgbmV3QWN0aXZlSW5kZXggPSBvcHRpb25zLmluZGV4O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50c1tuZXdBY3RpdmVJbmRleF0uY2xhc3NMaXN0LnJlbW92ZShDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuSElEREVOKTtcbiAgICAgICAgICAgIHZhciBlbnRlckFuaW1hdGlvblN0YXR1cyA9IHRoaXMuaGFuZGxlQW5pbWF0aW9uT3ZlclNsaWRlKHRoaXMuZWxlbWVudHNbb2xkQWN0aXZlSW5kZXhdLCBvcHRpb25zLmxlYXZlQW5pbWF0aW9uKTtcbiAgICAgICAgICAgIHZhciBsZWF2ZUFuaW1hdGlvblN0YXR1cyA9IHRoaXMuaGFuZGxlQW5pbWF0aW9uT3ZlclNsaWRlKHRoaXMuZWxlbWVudHNbbmV3QWN0aXZlSW5kZXhdLCBvcHRpb25zLmVudGVyQW5pbWF0aW9uKTtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICBlbnRlckFuaW1hdGlvblN0YXR1cy5lbGVtZW50QW5pbWF0aW9uU3RhdHVzLFxuICAgICAgICAgICAgICAgIGxlYXZlQW5pbWF0aW9uU3RhdHVzLmVsZW1lbnRBbmltYXRpb25TdGF0dXMsXG4gICAgICAgICAgICBdKS50aGVuKGZ1bmN0aW9uIChzbGlkZUFuaW1hdGlvblN0YXR1cykge1xuICAgICAgICAgICAgICAgIHRoYXQuZWxlbWVudHNbb2xkQWN0aXZlSW5kZXhdLmNsYXNzTGlzdC5hZGQoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLkhJRERFTik7XG4gICAgICAgICAgICAgICAgdGhhdC5lbGVtZW50c1tvbGRBY3RpdmVJbmRleF0uY2xhc3NMaXN0LnJlbW92ZShDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuU0xJREVfQUNUSVZFKTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsZW1lbnRzW25ld0FjdGl2ZUluZGV4XS5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5TTElERV9BQ1RJVkUpO1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZlSW5kZXggPSBvcHRpb25zLmluZGV4O1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudEFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbnRlclNsaWRlU3RhdHVzOiBlbnRlckFuaW1hdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICBsZWF2ZVNsaWRlU3RhdHVzOiBsZWF2ZUFuaW1hdGlvblN0YXR1cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlQW5pbWF0aW9uT3ZlclNsaWRlKGVsZW1lbnQsIGFuaW1hdGlvbikge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuU3RhdHVzID0ge307XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uLmNoaWxkcmVuU3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb24uY2hpbGRyZW5TdHlsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFuaW1hdGlvbk9iamVjdCA9IGFuaW1hdGlvbi5jaGlsZHJlblN0eWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjaGlsZHJlblN0YXR1c1thbmltYXRpb25PYmplY3Quc2VsZWN0b3JdKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5TdGF0dXNbYW5pbWF0aW9uT2JqZWN0LnNlbGVjdG9yXSA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW5FbGVtZW50cyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChhbmltYXRpb25PYmplY3Quc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuRWxlbWVudHMubGVuZ3RoOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblN0YXR1c1thbmltYXRpb25PYmplY3Quc2VsZWN0b3JdLnB1c2godGhpcy5oYW5kbGVBbmltYXRpb25PdmVyRWxlbWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogY2hpbGRyZW5FbGVtZW50c1tqXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IGFuaW1hdGlvbk9iamVjdC5zdHlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50QW5pbWF0aW9uU3RhdHVzOiB0aGF0LmhhbmRsZUFuaW1hdGlvbk92ZXJFbGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBhbmltYXRpb24uc2xpZGVTdHlsZXMsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5BbmltYXRpb25TdGF0dXM6IGNoaWxkcmVuU3RhdHVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVBbmltYXRpb25PdmVyRWxlbWVudChlbGVtZW50QW5pbWF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRBbmltYXRpb24uZWxlbWVudDtcbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSBlbGVtZW50QW5pbWF0aW9uLnN0eWxlcztcbiAgICAgICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3R5bGVzLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSXRcXCdzIHJlcXVpcmVkIHRvIGhhdmUgYXQgbGVhc3Qgb25lIGNsYXNzIHRvIGdlbmVyYXRlIGFuIGFuaW1hdGlvbi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0XFwncyByZXF1aXJlZCB0byBoYXZlIGFuIGFycmF5IG9mIHN0eWxlcyB0byBnZW5lcmF0ZSBhbiBhbmltYXRpb24uJyk7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhbmltYXRpb25GdW5jdGlvbnMgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzdHlsZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkZ1bmN0aW9ucy5wdXNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuZWxlbWVudHNbdGhhdC5hY3RpdmVJbmRleF0uY2xhc3NMaXN0LnJlbW92ZShzdHlsZXNbaW5kZXggLSAxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQudW5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGFuaW1hdGlvbkZ1bmN0aW9uc1tpbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgc3R5bGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmVnaXN0ZXJBbmltYXRpb25MaXN0ZW5lcihlbGVtZW50LCBhbmltYXRpb25GdW5jdGlvbnNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuQ0xFQVJfQU5JTUFUSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc3R5bGVzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5DTEVBUl9BTklNQVRJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQudW5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGNsZWFyRnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHN0eWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgY2xlYXJGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbGVtZW50c1t0aGF0LmFjdGl2ZUluZGV4XS5jbGFzc0xpc3QuYWRkKHN0eWxlc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uRnVuY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmVnaXN0ZXJBbmltYXRpb25MaXN0ZW5lcihlbGVtZW50LCBhbmltYXRpb25GdW5jdGlvbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLkNMRUFSX0FOSU1BVElPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHN0eWxlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5DTEVBUl9BTklNQVRJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQudW5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGNsZWFyRnVuY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHN0eWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgY2xlYXJGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHN0eWxlc1swXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgbGlzdGVuZXIpO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRBbmltYXRpb25FbmQnLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgdW5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0QW5pbWF0aW9uRW5kJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIENhcm91c2VsQmFzaWMuU2luZ2xlU2xpZGVDYXJvdXNlbCA9IFNpbmdsZVNsaWRlQ2Fyb3VzZWw7XG59KShDYXJvdXNlbEJhc2ljIHx8IChDYXJvdXNlbEJhc2ljID0ge30pKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2Fyb3VzZWwtYmFzaWMuanMubWFwXG4iLCJpbXBvcnQgeyBDYXJvdXNlbEJhc2ljIH0gZnJvbSAnLi9jYXJvdXNlbC9jYXJvdXNlbC1iYXNpYyc7XG52YXIgc29yYSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICBTSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUzogQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUyxcbiAgICAgICAgfSxcbiAgICAgICAgU2luZ2xlU2xpZGVDYXJvdXNlbDogQ2Fyb3VzZWxCYXNpYy5TaW5nbGVTbGlkZUNhcm91c2VsLFxuICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgIFNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVM6IENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUyxcbiAgICAgICAgfVxuICAgIH07XG59KCk7XG5tb2R1bGUuZXhwb3J0cyA9IHNvcmE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwXG4iXX0=
