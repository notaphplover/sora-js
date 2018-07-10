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
                var enterAnimationStatus = this.handleAnimationOverSlide(this.elements[newActiveIndex], options.enterAnimation);
                var leaveAnimationStatus = this.handleAnimationOverSlide(this.elements[oldActiveIndex], options.leaveAnimation);
                var that = this;
                var soraHandlerStatus = new Promise(function (resolve, reject) {
                    Promise.all([enterAnimationStatus.elementAnimationStatus, leaveAnimationStatus.elementAnimationStatus]).then(function (slideAnimationStatus) {
                        that.elements[oldActiveIndex].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.HIDDEN);
                        that.elements[oldActiveIndex].classList.remove(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        that.elements[newActiveIndex].classList.add(CarouselBasic.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_ACTIVE);
                        that.activeIndex = options.index;
                        that.currentAnimation = null;
                        resolve();
                    }).catch(function (err) {
                        reject(err);
                    });
                });
                return {
                    enterSlideStatus: enterAnimationStatus,
                    leaveSlideStatus: leaveAnimationStatus,
                    soraHandlerStatus: soraHandlerStatus
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2pzL3RtcC9jYXJvdXNlbC9jYXJvdXNlbC1iYXNlLmpzIiwiZGlzdC9qcy90bXAvY2Fyb3VzZWwvY2Fyb3VzZWwtYmFzaWMuanMiLCJkaXN0L2pzL3RtcC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBTyxJQUFJLCtDQUFKO0FBQ1AsQ0FBQyxVQUFVLGNBQVYsRUFBMEI7QUFBQSxRQUNqQixZQURpQixHQUVuQixzQkFBWSxRQUFaLEVBQXNCO0FBQUE7O0FBQ2xCLGFBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNILEtBSmtCOztBQU12QixtQkFBZSxZQUFmLEdBQThCLFlBQTlCO0FBQ0gsQ0FQRCxFQU9HLHlCQVJRLFlBUVIsR0FBaUIsZUFBZSxFQUFoQyxDQVBIOztBQVNBOzs7Ozs7Ozs7Ozs7QUNWQTs7Ozs7Ozs7QUFDTyxJQUFJLGlEQUFKO0FBQ1AsQ0FBQyxVQUFVLGFBQVYsRUFBeUI7QUFDdEIsa0JBQWMsNEJBQWQsR0FBNkM7QUFDekMseUJBQWlCLHVCQUR3QjtBQUV6QyxnQkFBUSxhQUZpQztBQUd6QyxlQUFPLFlBSGtDO0FBSXpDLHNCQUFjLG1CQUoyQjtBQUt6QyxpQkFBUztBQUxnQyxLQUE3QztBQU9BLGtCQUFjLDZCQUFkLEdBQThDO0FBQzFDLGVBQU8sSUFEbUM7QUFFMUMsb0JBQVksTUFGOEI7QUFHMUMsd0JBQWdCO0FBSDBCLEtBQTlDOztBQVJzQixRQWFoQixtQkFiZ0I7QUFBQTs7QUFjbEIscUNBQVksT0FBWixFQUFxQixPQUFyQixFQUE4QjtBQUFBOztBQUMxQixnQkFBSSxXQUFXLElBQWYsRUFDSSxNQUFNLElBQUksS0FBSixDQUFVLCtCQUFWLENBQU47QUFDSixnQkFBSSxjQUFjLFFBQVEsYUFBUixDQUFzQixNQUFNLGNBQWMsNEJBQWQsQ0FBMkMsT0FBdkUsQ0FBbEI7QUFDQSxnQkFBSSxlQUFlLElBQW5CLEVB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QUFDQSx3QkFBUSxnQkFBUixDQUF5QixvQkFBekIsRUFBK0MsUUFBL0M7QUFDSDtBQWhMaUI7QUFBQTtBQUFBLHdEQWlMVSxPQWpMVixFQWlMbUIsUUFqTG5CLEVBaUw2QjtBQUMzQyx3QkFBUSxtQkFBUixDQUE0QixjQUE1QixFQUE0QyxRQUE1QztBQUNBLHdCQUFRLG1CQUFSLENBQTRCLG9CQUE1QixFQUFrRCxRQUFsRDtBQUNIO0FBcExpQjs7QUFBQTtBQUFBLE1BYVksMkJBQWEsWUFiekI7O0FBc0x0QixrQkFBYyxtQkFBZCxHQUFvQyxtQkFBcEM7QUFDSCxDQXZMRCxFQXVMRywwQkF4TFEsYUF3TFIsR0FBa0IsZ0JBQWdCLEVBQWxDLENBdkxIOztBQXlMQTs7Ozs7QUMzTEE7O0FBQ0EsSUFBSSxPQUFPLFlBQVk7QUFDbkIsV0FBTztBQUNILGlCQUFTO0FBQ0wsMkNBQStCLDZCQUFjO0FBRHhDLFNBRE47QUFJSCw2QkFBcUIsNkJBQWMsbUJBSmhDO0FBS0gsZ0JBQVE7QUFDSiwwQ0FBOEIsNkJBQWM7QUFEeEM7QUFMTCxLQUFQO0FBU0gsQ0FWVSxFQUFYO0FBV0EsT0FBTyxPQUFQLEdBQWlCLElBQWpCOztBQUVBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IHZhciBDYXJvdXNlbEJhc2U7XG4oZnVuY3Rpb24gKENhcm91c2VsQmFzZV8xKSB7XG4gICAgY2xhc3MgQ2Fyb3VzZWxCYXNlIHtcbiAgICAgICAgY29uc3RydWN0b3IoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgICAgICAgfVxuICAgIH1cbiAgICBDYXJvdXNlbEJhc2VfMS5DYXJvdXNlbEJhc2UgPSBDYXJvdXNlbEJhc2U7XG59KShDYXJvdXNlbEJhc2UgfHwgKENhcm91c2VsQmFzZSA9IHt9KSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhcm91c2VsLWJhc2UuanMubWFwXG4iLCJpbXBvcnQgeyBDYXJvdXNlbEJhc2UgfSBmcm9tICcuL2Nhcm91c2VsLWJhc2UnO1xuZXhwb3J0IHZhciBDYXJvdXNlbEJhc2ljO1xuKGZ1bmN0aW9uIChDYXJvdXNlbEJhc2ljKSB7XG4gICAgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTID0ge1xuICAgICAgICBDTEVBUl9BTklNQVRJT046ICdzb3JhLWNsZWFyLWFuaW1hdGlvbnMnLFxuICAgICAgICBISURERU46ICdzb3JhLWhpZGRlbicsXG4gICAgICAgIFNMSURFOiAnc29yYS1zbGlkZScsXG4gICAgICAgIFNMSURFX0FDVElWRTogJ3NvcmEtc2xpZGUtYWN0aXZlJyxcbiAgICAgICAgV1JBUFBFUjogJ3NvcmEtd3JhcHBlcicsXG4gICAgfTtcbiAgICBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TID0ge1xuICAgICAgICBHT19UTzogJ3RvJyxcbiAgICAgICAgR09fVE9fTkVYVDogJ25leHQnLFxuICAgICAgICBHT19UT19QUkVWSU9VUzogJ3ByZXYnLFxuICAgIH07XG4gICAgY2xhc3MgU2luZ2xlU2xpZGVDYXJvdXNlbCBleHRlbmRzIENhcm91c2VsQmFzZS5DYXJvdXNlbEJhc2Uge1xuICAgICAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGVsZW1lbnQgbXVzdCBub3QgYmUgbnVsbC4nKTtcbiAgICAgICAgICAgIHZhciBzb3JhV3JhcHBlciA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuV1JBUFBFUik7XG4gICAgICAgICAgICBpZiAoc29yYVdyYXBwZXIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBlbGVtZW50IGhhcyBubyBjaGlsZCB3aXRoIGNsYXNzIFxcJ3NvcmEtd3JhcHBlclxcJy4nKTtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3JhV3JhcHBlci5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChzb3JhV3JhcHBlci5jaGlsZHJlbltpXS5jbGFzc0xpc3QuY29udGFpbnMoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLlNMSURFKSlcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChzb3JhV3JhcHBlci5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlcihjaGlsZHJlbik7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gb3B0aW9ucy5pbmRleCB8fCAwO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZUluZGV4IDwgMCB8fCB0aGlzLmFjdGl2ZUluZGV4ID49IHRoaXMuZWxlbWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvcHRpb25zLmluZGV4LiBUaGVyZSBpcyBubyBlbGVtZW50IHdpdGggaW5kZXggJyArIG9wdGlvbnMuaW5kZXggKyAnLicpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09IHRoaXMuYWN0aXZlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldLmNsYXNzTGlzdC5hZGQoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLlNMSURFX0FDVElWRSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbltpXS5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5ISURERU4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhhbmRsZShhY3Rpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLkdPX1RPOlxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsIHx8IHR5cGVvZiBvcHRpb25zLmluZGV4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvcHRpb25zIGZvciBcXCcnICsgQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfQUNUSU9OUy5HT19UTyArICdcXCcuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUdvVG8ob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgY2FzZSBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLkdPX1RPX05FWFQ6XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaW5kZXggPSAodGhpcy5hY3RpdmVJbmRleCArIDEpICUgdGhpcy5lbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZShDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLkdPX1RPLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBjYXNlIENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX0FDVElPTlMuR09fVE9fUFJFVklPVVM6XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuaW5kZXggPSAoKHRoaXMuYWN0aXZlSW5kZXggLSAxKSAlIHRoaXMuZWxlbWVudHMubGVuZ3RoICsgdGhpcy5lbGVtZW50cy5sZW5ndGgpICUgdGhpcy5lbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZShDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLkdPX1RPLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVHb1RvKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmluZGV4IDwgMCB8fCBvcHRpb25zLmluZGV4ID49IHRoaXMuZWxlbWVudHMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbmRleC4gVGhlcmUgaXMgbm8gZWxlbWVudCB3aXRoIGluZGV4ICcgKyBvcHRpb25zLmluZGV4ICsgJy4nKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmluZGV4ID09IHRoaXMuYWN0aXZlSW5kZXgpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGluZGV4LiBJdFxcJ3Mgbm90IGFsbG93ZWQgdG8gZ28gdG8gdGhlIGN1cnJlbnQgYWN0aXZlIHNsaWRlJyk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aGlzLmN1cnJlbnRBbmltYXRpb24pXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QW5pbWF0aW9uID0gb3B0aW9ucztcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSXRcXCdzIG5vdCBhbGxvd2VkIHRvIHN0YXJ0IGFuIGFuaW1hdGlvbiB3aGlsZSBhbiBleGlzdGluZyBhbmltYXRpb24gb3ZlciBhbiBzbGlkZSBlbGVtZW50IGlzIGFjdGl2ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9sZEFjdGl2ZUluZGV4ID0gdGhpcy5hY3RpdmVJbmRleDtcbiAgICAgICAgICAgIHZhciBuZXdBY3RpdmVJbmRleCA9IG9wdGlvbnMuaW5kZXg7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzW25ld0FjdGl2ZUluZGV4XS5jbGFzc0xpc3QucmVtb3ZlKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5ISURERU4pO1xuICAgICAgICAgICAgdmFyIGVudGVyQW5pbWF0aW9uU3RhdHVzID0gdGhpcy5oYW5kbGVBbmltYXRpb25PdmVyU2xpZGUodGhpcy5lbGVtZW50c1tuZXdBY3RpdmVJbmRleF0sIG9wdGlvbnMuZW50ZXJBbmltYXRpb24pO1xuICAgICAgICAgICAgdmFyIGxlYXZlQW5pbWF0aW9uU3RhdHVzID0gdGhpcy5oYW5kbGVBbmltYXRpb25PdmVyU2xpZGUodGhpcy5lbGVtZW50c1tvbGRBY3RpdmVJbmRleF0sIG9wdGlvbnMubGVhdmVBbmltYXRpb24pO1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHNvcmFIYW5kbGVyU3RhdHVzID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgZW50ZXJBbmltYXRpb25TdGF0dXMuZWxlbWVudEFuaW1hdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgbGVhdmVBbmltYXRpb25TdGF0dXMuZWxlbWVudEFuaW1hdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICBdKS50aGVuKGZ1bmN0aW9uIChzbGlkZUFuaW1hdGlvblN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsZW1lbnRzW29sZEFjdGl2ZUluZGV4XS5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5ISURERU4pO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsZW1lbnRzW29sZEFjdGl2ZUluZGV4XS5jbGFzc0xpc3QucmVtb3ZlKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5TTElERV9BQ1RJVkUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsZW1lbnRzW25ld0FjdGl2ZUluZGV4XS5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5TTElERV9BQ1RJVkUpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmFjdGl2ZUluZGV4ID0gb3B0aW9ucy5pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50QW5pbWF0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW50ZXJTbGlkZVN0YXR1czogZW50ZXJBbmltYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgbGVhdmVTbGlkZVN0YXR1czogbGVhdmVBbmltYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgc29yYUhhbmRsZXJTdGF0dXM6IHNvcmFIYW5kbGVyU3RhdHVzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVBbmltYXRpb25PdmVyU2xpZGUoZWxlbWVudCwgYW5pbWF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW5TdGF0dXMgPSB7fTtcbiAgICAgICAgICAgIGlmIChhbmltYXRpb24uY2hpbGRyZW5TdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbi5jaGlsZHJlblN0eWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYW5pbWF0aW9uT2JqZWN0ID0gYW5pbWF0aW9uLmNoaWxkcmVuU3R5bGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuU3RhdHVzW2FuaW1hdGlvbk9iamVjdC5zZWxlY3Rvcl0pXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlblN0YXR1c1thbmltYXRpb25PYmplY3Quc2VsZWN0b3JdID0gbmV3IEFycmF5KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbkVsZW1lbnRzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKGFuaW1hdGlvbk9iamVjdC5zZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY2hpbGRyZW5FbGVtZW50cy5sZW5ndGg7ICsrailcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuU3RhdHVzW2FuaW1hdGlvbk9iamVjdC5zZWxlY3Rvcl0ucHVzaCh0aGlzLmhhbmRsZUFuaW1hdGlvbk92ZXJFbGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBjaGlsZHJlbkVsZW1lbnRzW2pdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogYW5pbWF0aW9uT2JqZWN0LnN0eWxlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRBbmltYXRpb25TdGF0dXM6IHRoYXQuaGFuZGxlQW5pbWF0aW9uT3ZlckVsZW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IGFuaW1hdGlvbi5zbGlkZVN0eWxlcyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbkFuaW1hdGlvblN0YXR1czogY2hpbGRyZW5TdGF0dXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZUFuaW1hdGlvbk92ZXJFbGVtZW50KGVsZW1lbnRBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudEFuaW1hdGlvbi5lbGVtZW50O1xuICAgICAgICAgICAgdmFyIHN0eWxlcyA9IGVsZW1lbnRBbmltYXRpb24uc3R5bGVzO1xuICAgICAgICAgICAgaWYgKHN0eWxlcykge1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZXMubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdFxcJ3MgcmVxdWlyZWQgdG8gaGF2ZSBhdCBsZWFzdCBvbmUgY2xhc3MgdG8gZ2VuZXJhdGUgYW4gYW5pbWF0aW9uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSXRcXCdzIHJlcXVpcmVkIHRvIGhhdmUgYW4gYXJyYXkgb2Ygc3R5bGVzIHRvIGdlbmVyYXRlIGFuIGFuaW1hdGlvbi4nKTtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFuaW1hdGlvbkZ1bmN0aW9ucyA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHN0eWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRnVuY3Rpb25zLnB1c2goZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbGVtZW50c1t0aGF0LmFjdGl2ZUluZGV4XS5jbGFzc0xpc3QucmVtb3ZlKHN0eWxlc1tpbmRleCAtIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC51bnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgYW5pbWF0aW9uRnVuY3Rpb25zW2luZGV4IC0gMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBzdHlsZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGFuaW1hdGlvbkZ1bmN0aW9uc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKENhcm91c2VsQmFzaWMuU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUy5DTEVBUl9BTklNQVRJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzdHlsZXNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLkNMRUFSX0FOSU1BVElPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC51bnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgY2xlYXJGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogc3R5bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmVnaXN0ZXJBbmltYXRpb25MaXN0ZW5lcihlbGVtZW50LCBjbGVhckZ1bmN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVsZW1lbnRzW3RoYXQuYWN0aXZlSW5kZXhdLmNsYXNzTGlzdC5hZGQoc3R5bGVzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0oaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25GdW5jdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5yZWdpc3RlckFuaW1hdGlvbkxpc3RlbmVyKGVsZW1lbnQsIGFuaW1hdGlvbkZ1bmN0aW9uc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9TVFlMRVMuQ0xFQVJfQU5JTUFUSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc3R5bGVzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLkNMRUFSX0FOSU1BVElPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC51bnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgY2xlYXJGdW5jdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlczogc3R5bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQucmVnaXN0ZXJBbmltYXRpb25MaXN0ZW5lcihlbGVtZW50LCBjbGVhckZ1bmN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc3R5bGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVnaXN0ZXJBbmltYXRpb25MaXN0ZW5lcihlbGVtZW50LCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdhbmltYXRpb25lbmQnLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdEFuaW1hdGlvbkVuZCcsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB1bnJlZ2lzdGVyQW5pbWF0aW9uTGlzdGVuZXIoZWxlbWVudCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uZW5kJywgbGlzdGVuZXIpO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRBbmltYXRpb25FbmQnLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQ2Fyb3VzZWxCYXNpYy5TaW5nbGVTbGlkZUNhcm91c2VsID0gU2luZ2xlU2xpZGVDYXJvdXNlbDtcbn0pKENhcm91c2VsQmFzaWMgfHwgKENhcm91c2VsQmFzaWMgPSB7fSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYXJvdXNlbC1iYXNpYy5qcy5tYXBcbiIsImltcG9ydCB7IENhcm91c2VsQmFzaWMgfSBmcm9tICcuL2Nhcm91c2VsL2Nhcm91c2VsLWJhc2ljJztcbnZhciBzb3JhID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgICAgIFNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TOiBDYXJvdXNlbEJhc2ljLlNJTkdMRV9TTElERV9DQVJPVVNFTF9BQ1RJT05TLFxuICAgICAgICB9LFxuICAgICAgICBTaW5nbGVTbGlkZUNhcm91c2VsOiBDYXJvdXNlbEJhc2ljLlNpbmdsZVNsaWRlQ2Fyb3VzZWwsXG4gICAgICAgIHN0eWxlczoge1xuICAgICAgICAgICAgU0lOR0xFX1NMSURFX0NBUk9VU0VMX1NUWUxFUzogQ2Fyb3VzZWxCYXNpYy5TSU5HTEVfU0xJREVfQ0FST1VTRUxfU1RZTEVTLFxuICAgICAgICB9XG4gICAgfTtcbn0oKTtcbm1vZHVsZS5leHBvcnRzID0gc29yYTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXBcbiJdfQ==
