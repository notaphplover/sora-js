(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sora = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SingleAnimationEngine = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _carouselBase = require('../carousel/carousel-base');

var _operationManager = require('../task/operation/operation-manager');

var _taskEngine = require('../task/task-engine');

var _animationOperationEvents = require('./animation-operation-events');

var _animationPlayState = require('./animation-play-state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SingleAnimationEngine = exports.SingleAnimationEngine = function (_TaskEngine) {
    (0, _inherits3.default)(SingleAnimationEngine, _TaskEngine);

    function SingleAnimationEngine() {
        (0, _classCallCheck3.default)(this, SingleAnimationEngine);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SingleAnimationEngine.__proto__ || (0, _getPrototypeOf2.default)(SingleAnimationEngine)).call(this));

        _this.animationCancelManager = new _operationManager.OperationManager(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, _this.eventEmitter);
        _this.animationStateChangeManager = new _operationManager.OperationManager(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, _this.eventEmitter);
        return _this;
    }

    (0, _createClass3.default)(SingleAnimationEngine, [{
        key: 'dispose',
        value: function dispose() {
            this.animationCancelManager.dispose();
            this.animationStateChangeManager.dispose();
        }
    }, {
        key: 'cancelAnimation',
        value: function cancelAnimation(aliases) {
            this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, { aliases: aliases });
        }
    }, {
        key: 'pause',
        value: function pause(aliases) {
            this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, {
                aliases: aliases,
                value: _animationPlayState.AnimationPlayStateValue.paused
            });
        }
    }, {
        key: 'resume',
        value: function resume(aliases) {
            this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, {
                aliases: aliases,
                value: _animationPlayState.AnimationPlayStateValue.running
            });
        }
    }, {
        key: 'handleTaskPart',
        value: function handleTaskPart(part) {
            var that = this;
            part.pendingOperations = {
                cancel: {
                    isPending: false,
                    operationToken: this.animationCancelManager.subscribe(part.alias, function (eventArgs) {
                        part.pendingOperations.cancel.isPending = true;
                        that.animationCancelManager.unsubscribe(part.alias, part.pendingOperations.cancel.operationToken);
                    })
                },
                pause: {
                    isPending: false,
                    operationToken: this.animationStateChangeManager.subscribe(part.alias, function (eventArgs) {
                        part.pendingOperations.pause.isPending = eventArgs.value === _animationPlayState.AnimationPlayStateValue.paused;
                    })
                }
            };
            return (0, _get3.default)(SingleAnimationEngine.prototype.__proto__ || (0, _getPrototypeOf2.default)(SingleAnimationEngine.prototype), 'handleTaskPart', this).call(this, part);
        }
    }, {
        key: 'performTask',
        value: function performTask(part) {
            if (part.pendingOperations) {
                this.animationCancelManager.unsubscribe(part.alias, part.pendingOperations.cancel.operationToken);
                this.animationStateChangeManager.unsubscribe(part.alias, part.pendingOperations.pause.operationToken);
            }
            var promises = new Array(part.elements.length);
            for (var i = 0; i < part.elements.length; ++i) {
                promises[i] = this.handleAnimationOverElement(part.elements[i], part);
            }
            if (part.pendingOperations) {
                if (part.pendingOperations.pause.isPending) {
                    this.pause([part.alias]);
                    part.pendingOperations.pause.isPending = false;
                }
                if (part.pendingOperations.cancel.isPending) {
                    this.cancelAnimation([part.alias]);
                    part.pendingOperations.cancel.isPending = false;
                }
            }
            return _promise2.default.all(promises);
        }
    }, {
        key: 'handleAnimationOverElement',
        value: function handleAnimationOverElement(element, part) {
            var styles = part.styles;
            if (styles) {
                if (styles.length < 1) {
                    throw new Error('It\'s required to have at least one class to generate an animation.');
                }
            } else {
                throw new Error('It\'s required to have an array of styles to generate an animation.');
            }
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                try {
                    var currentAnimationIndex;
                    var i;

                    (function () {
                        var animationFunctions = new Array();
                        currentAnimationIndex = null;

                        var onAnimationCancel = function onAnimationCancel(args) {
                            onAnimationPlayStateChange({ aliases: args.aliases, value: _animationPlayState.AnimationPlayStateValue.running });
                            element.classList.add(_carouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                            if (null != currentAnimationIndex) {
                                element.classList.remove(styles[currentAnimationIndex]);
                            }
                            that.unregisterAnimationListener(element, animationFunctions[currentAnimationIndex]);
                            element.classList.remove(_carouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                            that.animationCancelManager.unsubscribe(part.alias, cancelToken);
                            that.animationStateChangeManager.unsubscribe(part.alias, playStateChangetoken);
                            resolve();
                        };
                        var cancelToken = that.animationCancelManager.subscribe(part.alias, onAnimationCancel);
                        var onAnimationPlayStateChange = function onAnimationPlayStateChange(args) {
                            if (_animationPlayState.AnimationPlayStateValue.paused === args.value) {
                                if (!element.classList.contains(_carouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED)) {
                                    element.classList.add(_carouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED);
                                }
                            } else if (_animationPlayState.AnimationPlayStateValue.running === args.value) {
                                if (element.classList.contains(_carouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED)) {
                                    element.classList.remove(_carouselBase.CAROUSEL_STYLES.ANIMATION_PAUSED);
                                }
                            }
                        };
                        var playStateChangetoken = that.animationStateChangeManager.subscribe(part.alias, onAnimationPlayStateChange);
                        for (i = 1; i < styles.length; ++i) {
                            animationFunctions.push(function (index) {
                                return function (event) {
                                    element.classList.remove(styles[index - 1]);
                                    that.unregisterAnimationListener(element, animationFunctions[index - 1]);
                                    that.registerAnimationListener(element, animationFunctions[index]);
                                    element.classList.add(styles[index]);
                                    currentAnimationIndex = index;
                                };
                            }(i));
                        }
                        animationFunctions.push(function (event) {
                            element.classList.add(_carouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                            element.classList.remove(styles[styles.length - 1]);
                            element.classList.remove(_carouselBase.CAROUSEL_STYLES.CLEAR_ANIMATION);
                            that.unregisterAnimationListener(element, animationFunctions[animationFunctions.length - 1]);
                            currentAnimationIndex = null;
                            that.animationCancelManager.unsubscribe(part.alias, cancelToken);
                            that.animationStateChangeManager.unsubscribe(part.alias, playStateChangetoken);
                            resolve();
                        });
                        that.registerAnimationListener(element, animationFunctions[0]);
                        element.classList.add(styles[0]);
                        currentAnimationIndex = 0;
                    })();
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
    return SingleAnimationEngine;
}(_taskEngine.TaskEngine);



},{"../carousel/carousel-base":4,"../task/operation/operation-manager":14,"../task/task-engine":15,"./animation-operation-events":2,"./animation-play-state":3,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/core-js/promise":26,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30,"babel-runtime/helpers/get":31,"babel-runtime/helpers/inherits":32,"babel-runtime/helpers/possibleConstructorReturn":33}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ANIMATION_OPERATION_EVENTS = exports.ANIMATION_OPERATION_EVENTS = {
    ANIMATION_CANCEL: 'anim.cancel',
    ANIMATION_STATE_CHANGE: 'anim.state.change'
};



},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var AnimationPlayStateValue = exports.AnimationPlayStateValue = undefined;
(function (AnimationPlayStateValue) {
    AnimationPlayStateValue[AnimationPlayStateValue["paused"] = 0] = "paused";
    AnimationPlayStateValue[AnimationPlayStateValue["running"] = 1] = "running";
})(AnimationPlayStateValue || (exports.AnimationPlayStateValue = AnimationPlayStateValue = {}));



},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CarouselBase = exports.CAROUSEL_STYLES = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CAROUSEL_STYLES = exports.CAROUSEL_STYLES = {
    ANIMATION_PAUSED: 'sora-animation-paused',
    CAROUSEL: 'sora-carousel',
    CLEAR_ANIMATION: 'sora-clear-animations',
    SLIDE: 'sora-slide',
    WRAPPER: 'sora-wrapper'
};

var CarouselBase = exports.CarouselBase = function CarouselBase() {
    (0, _classCallCheck3.default)(this, CarouselBase);
};



},{"babel-runtime/helpers/classCallCheck":29}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SingleSlideCarousel = exports.SINGLE_SLIDE_CAROUSEL_STYLES = exports.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = exports.SINGLE_SLIDE_CAROUSEL_EVENTS = exports.SINGLE_SLIDE_CAROUSEL_ACTIONS = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _animationEngine = require('../../animation/animation-engine');

var _animationPlayState = require('../../animation/animation-play-state');

var _collectionManager = require('../../collection/collection-manager');

var _htmlChildrenManager = require('../../collection/html-children-manager');

var _carouselBase = require('../carousel-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SINGLE_SLIDE_CAROUSEL_ACTIONS = exports.SINGLE_SLIDE_CAROUSEL_ACTIONS = {
    GO_TO: 'to',
    GO_TO_NEXT: 'next',
    GO_TO_PREVIOUS: 'prev'
};
var SINGLE_SLIDE_CAROUSEL_EVENTS = exports.SINGLE_SLIDE_CAROUSEL_EVENTS = {
    ON_ANIMATION_END: 'car.anim.out',
    ON_ANIMATION_PLAY_STATE_CHANGE: 'car.anim.state.ch',
    ON_ANIMATION_START: 'car.anim.in',
    ON_CANCEL_ANIMATION: 'car.anim.cancel'
};
var SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = exports.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = {
    ENTER: 'enter-part',
    LEAVE: 'leave-part'
};
var SINGLE_SLIDE_CAROUSEL_STYLES = exports.SINGLE_SLIDE_CAROUSEL_STYLES = {
    SLIDE_HIDDEN: 'sora-hidden',
    SORA_RELATIVE: 'sora-relative'
};

var SingleSlideCarousel = exports.SingleSlideCarousel = function (_CarouselBase) {
    (0, _inherits3.default)(SingleSlideCarousel, _CarouselBase);

    function SingleSlideCarousel(element, options) {
        (0, _classCallCheck3.default)(this, SingleSlideCarousel);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SingleSlideCarousel.__proto__ || (0, _getPrototypeOf2.default)(SingleSlideCarousel)).call(this));

        if (element == null) {
            throw new Error('The element must not be null.');
        }
        if (!element.classList.contains(_carouselBase.CAROUSEL_STYLES.CAROUSEL)) {
            throw new Error('The carousel element must contain the class "' + _carouselBase.CAROUSEL_STYLES.CAROUSEL + '".');
        }
        var soraWrapper = element.querySelector('.' + _carouselBase.CAROUSEL_STYLES.WRAPPER);
        if (soraWrapper == null) {
            throw new Error('The element has no child with class \'sora-wrapper\'.');
        }
        var children = new Array();
        for (var i = 0; i < soraWrapper.children.length; ++i) {
            if (soraWrapper.children[i].classList.contains(_carouselBase.CAROUSEL_STYLES.SLIDE)) {
                children.push(soraWrapper.children[i]);
            }
        }
        _this.activeIndex = options.index || 0;
        _this.currentAnimation = null;
        _this.eventEmitter = new _events.EventEmitter();
        _this.elementsManager = new _htmlChildrenManager.HtmlChildrenManager(children, _this.eventEmitter, soraWrapper);
        if (_this.activeIndex < 0 || _this.activeIndex >= _this.elementsManager.getLength()) {
            throw new Error('Invalid options.index. There is no element with index ' + options.index + '.');
        }
        for (var i = 0; i < children.length; ++i) {
            if (i === _this.activeIndex) {
                children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
            } else {
                children[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            }
        }
        var that = _this;
        var onBeforeChange = function onBeforeChange(eventArgs) {
            var indexMap = eventArgs.getIndexMap();
            if (null == indexMap[that.activeIndex]) {
                eventArgs.setPreventDefault();
            }
        };
        var onAfterChange = function onAfterChange(eventArgs) {
            if (!eventArgs.getPreventDefault()) {
                var indexMap = eventArgs.getIndexMap();
                that.activeIndex = indexMap[that.activeIndex];
            }
        };
        _this.addListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
        _this.addListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);
        _this.engineAnimation = new _animationEngine.SingleAnimationEngine();
        return _this;
    }

    (0, _createClass3.default)(SingleSlideCarousel, [{
        key: 'addListener',
        value: function addListener(event, listener) {
            this.eventEmitter.addListener(event, listener);
        }
    }, {
        key: 'createWaitPromise',
        value: function createWaitPromise(options) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                var lastTimeRun;
                var timeToWait = options.millis;
                if (that.paused) {
                    lastTimeRun = null;
                } else {
                    var waitInterval = setInterval(function () {
                        removeListeners();
                        resolve();
                    }, timeToWait);
                    lastTimeRun = new Date().getTime();
                }
                var onCancelAnimation = null;
                if (options.stopOnCancelAnimation) {
                    onCancelAnimation = function onCancelAnimation() {
                        removeListeners();
                        resolve();
                    };
                    that.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                }
                var onPlayStateChange = function onPlayStateChange(args) {
                    if (_animationPlayState.AnimationPlayStateValue.paused === args.value) {
                        timeToWait = timeToWait - (new Date().getTime() - lastTimeRun);
                        clearInterval(waitInterval);
                    } else if (_animationPlayState.AnimationPlayStateValue.running === args.value) {
                        lastTimeRun = new Date().getTime();
                        if (0 < timeToWait) {
                            waitInterval = setInterval(function () {
                                that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
                                if (null != onCancelAnimation) {
                                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                                }
                                resolve();
                            }, timeToWait);
                        } else {
                            removeListeners();
                            resolve();
                        }
                    }
                };
                var removeListeners = function removeListeners() {
                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
                    if (null != onCancelAnimation) {
                        that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, onCancelAnimation);
                    }
                };
                that.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, onPlayStateChange);
            });
        }
    }, {
        key: 'forceActiveSlide',
        value: function forceActiveSlide(activeIndex) {
            var eventArgs = { activeIndex: activeIndex };
            this.engineAnimation.cancelAnimation(null);
            this.paused = false;
            this.activeIndex = activeIndex;
            this.resetCarouselStructure(activeIndex);
            this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, eventArgs);
        }
    }, {
        key: 'getActiveElement',
        value: function getActiveElement() {
            return this.elementsManager.getCollection()[this.activeIndex];
        }
    }, {
        key: 'getActiveIndex',
        value: function getActiveIndex() {
            return this.activeIndex;
        }
    }, {
        key: 'getElementsManager',
        value: function getElementsManager() {
            return this.elementsManager;
        }
    }, {
        key: 'hasActiveAnimation',
        value: function hasActiveAnimation() {
            return null != this.currentAnimation;
        }
    }, {
        key: 'handle',
        value: function handle(action, options) {
            switch (action) {
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO:
                    if (options == null || typeof options.index !== 'number') {
                        throw new Error('Invalid options for \'' + SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO + '\'.');
                    }
                    return this.handleGoTo(options);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT:
                    options.index = (this.activeIndex + 1) % this.elementsManager.getLength();
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
                case SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS:
                    var elementsLength = this.elementsManager.getLength();
                    options.index = ((this.activeIndex - 1) % elementsLength + elementsLength) % elementsLength;
                    return this.handle(SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO, options);
            }
        }
    }, {
        key: 'isPaused',
        value: function isPaused() {
            return this.paused;
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (!this.paused) {
                this.engineAnimation.pause(null);
                this.paused = true;
                this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, { value: _animationPlayState.AnimationPlayStateValue.paused });
            }
        }
    }, {
        key: 'removeListener',
        value: function removeListener(event, listener) {
            this.eventEmitter.removeListener(event, listener);
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (this.paused) {
                this.engineAnimation.resume(null);
                this.paused = false;
                this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, { value: _animationPlayState.AnimationPlayStateValue.running });
            }
        }
    }, {
        key: 'generateGoToAnimationFlow',
        value: function generateGoToAnimationFlow(enterElement, leaveElement, options) {
            var innerParts = [{
                alias: SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER,
                elements: [enterElement],
                styles: options.enterAnimation.slideStyles,
                when: null
            }, {
                alias: SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE,
                elements: [leaveElement],
                styles: options.leaveAnimation.slideStyles,
                when: null
            }];
            var generateChildrenParts = function generateChildrenParts(parentElement, childrenStyles, aliasBase) {
                if (childrenStyles) {
                    for (var i = 0; i < childrenStyles.length; ++i) {
                        innerParts.push({
                            alias: aliasBase + i.toString(),
                            elements: function () {
                                var elements = new Array();
                                var animationObject = childrenStyles[i];
                                var childrenElements = parentElement.querySelectorAll(animationObject.selector);
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = (0, _getIterator3.default)(childrenElements), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var childrenElement = _step.value;

                                        elements.push(childrenElement);
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                            _iterator.return();
                                        }
                                    } finally {
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }

                                return elements;
                            }(),
                            styles: childrenStyles[i].styles,
                            when: null
                        });
                    }
                }
            };
            generateChildrenParts(enterElement, options.enterAnimation.childrenStyles, SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER);
            generateChildrenParts(leaveElement, options.leaveAnimation.childrenStyles, SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE);
            var innerPartsMap = {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(innerParts), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var innerPart = _step2.value;

                    innerPartsMap[innerPart.alias] = innerPart;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var animationFlow = {
                parts: innerParts
            };
            return animationFlow;
        }
    }, {
        key: 'resetCarouselStructure',
        value: function resetCarouselStructure(activeIndex) {
            var collection = this.elementsManager.getCollection();
            for (var i = 0; i < collection.length; ++i) {
                while (collection[i].classList.length > 0) {
                    collection[i].classList.remove(collection[i].classList.item(0));
                }
                collection[i].classList.add(_carouselBase.CAROUSEL_STYLES.SLIDE);
                if (i === activeIndex) {
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                } else {
                    collection[i].classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                }
            }
        }
    }, {
        key: 'handleGoTo',
        value: function handleGoTo(options) {
            if (options.index < 0 || options.index >= this.elementsManager.getLength()) {
                throw new Error('Invalid index. There is no element with index ' + options.index + '.');
            }
            if (options.index === this.activeIndex) {
                throw new Error('Invalid index. It\'s not allowed to go to the current active slide');
            }
            if (null == this.currentAnimation) {
                this.currentAnimation = options;
            } else {
                throw new Error('It\'s not allowed to start an animation while an existing animation over an slide element is active');
            }
            var oldActiveElement = this.elementsManager.getCollection()[this.activeIndex];
            var newActiveIndex = options.index;
            this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_START, {
                options: options
            });
            var that = this;
            var onBeforeChange = function onBeforeChange(eventArgs) {
                var indexMap = eventArgs.getIndexMap();
                if (null == indexMap[newActiveIndex]) {
                    eventArgs.setPreventDefault();
                }
            };
            var onAfterChange = function onAfterChange(eventArgs) {
                if (!eventArgs.getPreventDefault()) {
                    var indexMap = eventArgs.getIndexMap();
                    newActiveIndex = indexMap[newActiveIndex];
                }
            };
            this.addListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
            this.addListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);
            var newActiveElement = this.elementsManager.getCollection()[newActiveIndex];
            newActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            var animationCanceled = false;
            var cancelAnimationHandler = function cancelAnimationHandler() {
                animationCanceled = true;
                that.currentAnimation = null;
            };
            var animationFlow = this.generateGoToAnimationFlow(newActiveElement, oldActiveElement, options);
            var animationPromises = this.engineAnimation.handle(animationFlow);
            var ANIMATION_ENTER_INDEX = 0;
            var ANIMATION_LEAVE_INDEX = 1;
            var hideLeaveSlideAfterAnimationEnds = new _promise2.default(function (resolve, reject) {
                animationPromises[ANIMATION_LEAVE_INDEX].then(function (animationOptions) {
                    if (!animationCanceled) {
                        oldActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
                        oldActiveElement.classList.remove(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                        newActiveElement.classList.add(SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
                    }
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
            this.addListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, cancelAnimationHandler);
            var soraHandlerStatus = new _promise2.default(function (resolve, reject) {
                _promise2.default.all([animationPromises[ANIMATION_ENTER_INDEX], hideLeaveSlideAfterAnimationEnds]).then(function () {
                    if (!animationCanceled) {
                        that.activeIndex = newActiveIndex;
                        that.currentAnimation = null;
                    }
                    that.removeListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, onBeforeChange);
                    that.removeListener(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, onAfterChange);
                    that.removeListener(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, cancelAnimationHandler);
                    that.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_END, {});
                    resolve();
                }).catch(function (err) {
                    reject(err);
                });
            });
            return {
                animationPromises: animationPromises,
                partEndEventAccess: that.engineAnimation.getPartEndListenerAccess(),
                partStartEventAccess: that.engineAnimation.getPartStartListenerAccess(),
                soraHandlerStatus: soraHandlerStatus
            };
        }
    }]);
    return SingleSlideCarousel;
}(_carouselBase.CarouselBase);



},{"../../animation/animation-engine":1,"../../animation/animation-play-state":3,"../../collection/collection-manager":8,"../../collection/html-children-manager":9,"../carousel-base":4,"babel-runtime/core-js/get-iterator":18,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/core-js/promise":26,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30,"babel-runtime/helpers/inherits":32,"babel-runtime/helpers/possibleConstructorReturn":33,"events":222}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CancelableCollectionChangeEventArgs = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _collectionChangeArgs = require('./collection-change-args');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CancelableCollectionChangeEventArgs = exports.CancelableCollectionChangeEventArgs = function (_CollectionChangeEven) {
    (0, _inherits3.default)(CancelableCollectionChangeEventArgs, _CollectionChangeEven);

    function CancelableCollectionChangeEventArgs(indexMap, newElements) {
        (0, _classCallCheck3.default)(this, CancelableCollectionChangeEventArgs);
        return (0, _possibleConstructorReturn3.default)(this, (CancelableCollectionChangeEventArgs.__proto__ || (0, _getPrototypeOf2.default)(CancelableCollectionChangeEventArgs)).call(this, indexMap, newElements, false));
    }

    (0, _createClass3.default)(CancelableCollectionChangeEventArgs, [{
        key: 'setPreventDefault',
        value: function setPreventDefault() {
            this.preventDefault = true;
        }
    }]);
    return CancelableCollectionChangeEventArgs;
}(_collectionChangeArgs.CollectionChangeEventArgs);



},{"./collection-change-args":7,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30,"babel-runtime/helpers/inherits":32,"babel-runtime/helpers/possibleConstructorReturn":33}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CollectionChangeEventArgs = undefined;

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CollectionChangeEventArgs = exports.CollectionChangeEventArgs = function () {
    function CollectionChangeEventArgs(indexMap, newElements, preventDefault) {
        (0, _classCallCheck3.default)(this, CollectionChangeEventArgs);

        this.indexMap = indexMap;
        this.newElements = newElements;
        this.preventDefault = preventDefault;
    }

    (0, _createClass3.default)(CollectionChangeEventArgs, [{
        key: "getIndexMap",
        value: function getIndexMap() {
            return (0, _assign2.default)({}, this.indexMap);
        }
    }, {
        key: "getNewElements",
        value: function getNewElements() {
            return (0, _assign2.default)({}, this.newElements);
        }
    }, {
        key: "getPreventDefault",
        value: function getPreventDefault() {
            return this.preventDefault;
        }
    }]);
    return CollectionChangeEventArgs;
}();



},{"babel-runtime/core-js/object/assign":20,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CollectionManager = exports.COLLECTION_MANAGER_EVENTS = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _cancelableCollectionChangeArgs = require('./cancelable-collection-change-args');

var _collectionChangeArgs = require('./collection-change-args');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COLLECTION_MANAGER_EVENTS = exports.COLLECTION_MANAGER_EVENTS = {
    collectionAfterChange: 'coll.ch.a',
    collectionBeforeChange: 'coll.ch.b'
};

var CollectionManager = exports.CollectionManager = function () {
    function CollectionManager(collection, eventEmitter) {
        (0, _classCallCheck3.default)(this, CollectionManager);

        this.collection = collection;
        this.eventEmitter = eventEmitter;
    }

    (0, _createClass3.default)(CollectionManager, [{
        key: 'getCollection',
        value: function getCollection() {
            return this.collection;
        }
    }, {
        key: 'getLength',
        value: function getLength() {
            return this.collection.length;
        }
    }, {
        key: 'insertElements',
        value: function insertElements(elements) {
            this.internalInsertElements(elements);
        }
    }, {
        key: 'removeElements',
        value: function removeElements(indexes) {
            this.internalRemoveElements(indexes);
        }
    }, {
        key: 'internalInsertElements',
        value: function internalInsertElements(elements) {
            var keys = new Array();
            for (var elemIndex in elements) {
                if (elements.hasOwnProperty(elemIndex)) {
                    var numberElemIndex = Number(elemIndex);
                    if (numberElemIndex < 0) {
                        throw new Error('The index param should be greater or equals zero.');
                    }
                    if (numberElemIndex > this.collection.length) {
                        throw new Error('The index param should be less or equals the number of elements of the collection.');
                    }
                    keys.push(numberElemIndex);
                }
            }
            keys = keys.sort(function (number1, number2) {
                return number1 - number2;
            });
            if (0 === keys.length) {
                return;
            }
            var newElements = new Array(this.collection.length + keys.length);
            var indexMap = {};
            if (1 === keys.length) {
                var index = keys[0];
                var element = elements[index];
                for (var i = 0; i < index; ++i) {
                    newElements[i] = this.collection[i];
                    indexMap[i] = i;
                }
                newElements[index] = element;
                for (var i = index + 1; i < newElements.length; ++i) {
                    newElements[i] = this.collection[i - 1];
                    indexMap[i - 1] = i;
                }
            } else {
                for (var i = 0; i < keys[0]; ++i) {
                    newElements[i] = this.collection[i];
                    indexMap[i] = i;
                }
                newElements[keys[0]] = elements[keys[0]];
                for (var i = 1; i < keys.length; ++i) {
                    var indexPrevious = keys[i - 1];
                    var _index = keys[i];
                    for (var j = indexPrevious + 1; j < _index; ++j) {
                        newElements[j] = this.collection[j - i];
                        indexMap[j - i] = j;
                    }
                    newElements[_index] = elements[_index];
                }
                for (var i = keys[keys.length - 1] + 1; i < newElements.length; ++i) {
                    newElements[i] = this.collection[i - keys.length];
                    indexMap[i - keys.length] = i;
                }
            }
            this.internalTryToChangeCollection(indexMap, newElements);
        }
    }, {
        key: 'internalRemoveElements',
        value: function internalRemoveElements(indexes) {
            indexes = indexes.sort(function (number1, number2) {
                return number1 - number2;
            });
            var indexMap = {};
            var newElements = new Array();
            var counter = 0;
            for (var i = 0; i < this.collection.length; ++i) {
                if (i === indexes[counter]) {
                    ++counter;
                } else {
                    newElements[i - counter] = this.collection[i];
                    indexMap[i] = i - counter;
                }
            }
            this.internalTryToChangeCollection(indexMap, newElements);
        }
    }, {
        key: 'internalTryToChangeCollection',
        value: function internalTryToChangeCollection() {
            var indexMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var newElements = arguments[1];

            var cancelableChangeEventArgs = new _cancelableCollectionChangeArgs.CancelableCollectionChangeEventArgs(indexMap, newElements);
            this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionBeforeChange, cancelableChangeEventArgs);
            if (!cancelableChangeEventArgs.getPreventDefault()) {
                this.collection = newElements;
            }
            var changeEventArgs = new _collectionChangeArgs.CollectionChangeEventArgs(indexMap, newElements, cancelableChangeEventArgs.getPreventDefault());
            this.eventEmitter.emit(COLLECTION_MANAGER_EVENTS.collectionAfterChange, changeEventArgs);
            return changeEventArgs;
        }
    }]);
    return CollectionManager;
}();



},{"./cancelable-collection-change-args":6,"./collection-change-args":7,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HtmlChildrenManager = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _collectionManager = require('./collection-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HtmlChildrenManager = exports.HtmlChildrenManager = function (_CollectionManager) {
    (0, _inherits3.default)(HtmlChildrenManager, _CollectionManager);

    function HtmlChildrenManager(collection, eventEmitter, parentElement) {
        (0, _classCallCheck3.default)(this, HtmlChildrenManager);

        var _this = (0, _possibleConstructorReturn3.default)(this, (HtmlChildrenManager.__proto__ || (0, _getPrototypeOf2.default)(HtmlChildrenManager)).call(this, collection, eventEmitter));

        _this.parentElement = parentElement;
        return _this;
    }

    (0, _createClass3.default)(HtmlChildrenManager, [{
        key: 'internalTryToChangeCollection',
        value: function internalTryToChangeCollection() {
            var indexMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var newElements = arguments[1];

            var eventArgs = (0, _get3.default)(HtmlChildrenManager.prototype.__proto__ || (0, _getPrototypeOf2.default)(HtmlChildrenManager.prototype), 'internalTryToChangeCollection', this).call(this, indexMap, newElements);
            if (!eventArgs.getPreventDefault()) {
                var deletionPivot = 0;
                var insertionPivot = 0;
                var oldIndexesCounter = 0;
                var newIndexesCounter = 0;
                for (var key in indexMap) {
                    if (indexMap.hasOwnProperty(key)) {
                        var keyNumber = Number(key);
                        for (var i = oldIndexesCounter; i < keyNumber; ++i) {
                            this.parentElement.removeChild(this.parentElement.children[i + insertionPivot - deletionPivot]);
                            ++deletionPivot;
                        }
                        var newIndex = indexMap[key];
                        for (var i = newIndexesCounter; i < newIndex; ++i) {
                            this.parentElement.insertBefore(newElements[i], this.parentElement.children[i]);
                            ++insertionPivot;
                        }
                        oldIndexesCounter = keyNumber + 1;
                        newIndexesCounter = newIndex + 1;
                    }
                }
                for (var i = newIndexesCounter; i < newElements.length; ++i) {
                    this.parentElement.appendChild(newElements[i]);
                }
            }
            return eventArgs;
        }
    }]);
    return HtmlChildrenManager;
}(_collectionManager.CollectionManager);



},{"./collection-manager":8,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30,"babel-runtime/helpers/get":31,"babel-runtime/helpers/inherits":32,"babel-runtime/helpers/possibleConstructorReturn":33}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TokenMap = undefined;

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TokenMap = exports.TokenMap = function () {
    function TokenMap() {
        (0, _classCallCheck3.default)(this, TokenMap);

        this.innerMap = new _map2.default();
        this.unusedIndexes = new Array();
    }

    (0, _createClass3.default)(TokenMap, [{
        key: "add",
        value: function add(elem) {
            if (0 === this.unusedIndexes.length) {
                var lastIndex = this.innerMap.size;
                this.innerMap.set(lastIndex, elem);
                return lastIndex;
            } else {
                var _lastIndex = this.unusedIndexes[this.unusedIndexes.length - 1];
                --this.unusedIndexes.length;
                this.innerMap.set(_lastIndex, elem);
                return _lastIndex;
            }
        }
    }, {
        key: "count",
        value: function count() {
            return this.innerMap.size;
        }
    }, {
        key: "foreach",
        value: function foreach(consumer) {
            this.innerMap.forEach(function (value, key) {
                consumer(value, key);
            });
        }
    }, {
        key: "get",
        value: function get(index) {
            return this.innerMap.get(index);
        }
    }, {
        key: "remove",
        value: function remove(index) {
            if (this.innerMap.has(index)) {
                this.innerMap.delete(index);
                this.unusedIndexes[this.unusedIndexes.length] = index;
                return true;
            } else {
                return false;
            }
        }
    }]);
    return TokenMap;
}();



},{"babel-runtime/core-js/map":19,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30}],11:[function(require,module,exports){
'use strict';

var _singleSlideCarousel = require('./carousel/single-slide/single-slide-carousel');

require('core-js/fn/promise');

var sora = function () {
    return {
        SingleSlideCarousel: _singleSlideCarousel.SingleSlideCarousel,
        actions: {
            SINGLE_SLIDE_CAROUSEL_ACTIONS: _singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS
        },
        events: {
            SINGLE_SLIDE_CAROUSEL_EVENTS: _singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_EVENTS
        },
        styles: {
            SINGLE_SLIDE_CAROUSEL_STYLES: _singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES
        }
    };
}();
module.exports = sora;



},{"./carousel/single-slide/single-slide-carousel":5,"core-js/fn/promise":35}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TaskPartWhenConstraint = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TaskPartWhenConstraint = exports.TaskPartWhenConstraint = function TaskPartWhenConstraint(after, constraintType) {
    (0, _classCallCheck3.default)(this, TaskPartWhenConstraint);

    this.after = after;
    this.constraintType = constraintType;
};



},{"babel-runtime/helpers/classCallCheck":29}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TaskPartConstraint = exports.TASK_CONSTRAINT_TYPES = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _taskFlowWhen = require('./task-flow-when');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TASK_CONSTRAINT_TYPES = exports.TASK_CONSTRAINT_TYPES = {
    END: 'anim.end',
    GROUP: 'group',
    START: 'anim.start',
    WAIT_FOR: 'wait'
};

var TaskPartConstraint = exports.TaskPartConstraint = function (_TaskPartWhenConstrai) {
    (0, _inherits3.default)(TaskPartConstraint, _TaskPartWhenConstrai);

    function TaskPartConstraint(after, alias, constraintType) {
        (0, _classCallCheck3.default)(this, TaskPartConstraint);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TaskPartConstraint.__proto__ || (0, _getPrototypeOf2.default)(TaskPartConstraint)).call(this, after, constraintType));

        _this.alias = alias;
        return _this;
    }

    return TaskPartConstraint;
}(_taskFlowWhen.TaskPartWhenConstraint);



},{"./task-flow-when":12,"babel-runtime/core-js/object/get-prototype-of":24,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/inherits":32,"babel-runtime/helpers/possibleConstructorReturn":33}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OperationManager = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _tokenMap = require('../../collection/token-map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OperationManager = exports.OperationManager = function () {
    function OperationManager(eventAlias, eventEmitter) {
        (0, _classCallCheck3.default)(this, OperationManager);

        var that = this;
        this.callFunction = function (eventArgs) {
            if (eventArgs.aliases == null) {
                for (var alias in that.subscriptionStorage) {
                    if (that.subscriptionStorage.hasOwnProperty(alias)) {
                        var subscribers = that.subscriptionStorage[alias];
                        if (subscribers != null) {
                            subscribers.foreach(function (value) {
                                value(eventArgs);
                            });
                        }
                    }
                }
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(eventArgs.aliases), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _alias = _step.value;

                        var _subscribers = that.subscriptionStorage[_alias];
                        if (_subscribers != null) {
                            _subscribers.foreach(function (value) {
                                value(eventArgs);
                            });
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        };
        this.eventAlias = eventAlias;
        this.eventEmitter = eventEmitter;
        this.subscriptionStorage = {};
        this.eventEmitter.addListener(this.eventAlias, this.callFunction);
    }

    (0, _createClass3.default)(OperationManager, [{
        key: 'dispose',
        value: function dispose() {
            this.eventEmitter.removeListener(this.eventAlias, this.callFunction);
        }
    }, {
        key: 'subscribe',
        value: function subscribe(alias, handler) {
            if (null == this.subscriptionStorage[alias]) {
                this.subscriptionStorage[alias] = new _tokenMap.TokenMap();
            }
            return this.subscriptionStorage[alias].add(handler);
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe(alias, index) {
            if (null == this.subscriptionStorage[alias]) {
                return false;
            } else {
                return this.subscriptionStorage[alias].remove(index);
            }
        }
    }]);
    return OperationManager;
}();



},{"../../collection/token-map":10,"babel-runtime/core-js/get-iterator":18,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TaskEngine = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _events = require('events');

var _taskPartConstraint = require('./flow/task-part-constraint');

var _operationManager = require('./operation/operation-manager');

var _taskPartWhenEvents = require('./task-part-when-events');

var _taskPartWhenOperator = require('./task-part-when-operator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TaskEngine = exports.TaskEngine = function () {
    function TaskEngine() {
        (0, _classCallCheck3.default)(this, TaskEngine);

        this.eventEmitter = new _events.EventEmitter();
        this.partEndManager = new _operationManager.OperationManager(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.END, this.eventEmitter);
        this.partStartManager = new _operationManager.OperationManager(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.START, this.eventEmitter);
    }

    (0, _createClass3.default)(TaskEngine, [{
        key: 'getPartEndListenerAccess',
        value: function getPartEndListenerAccess() {
            var that = this;
            return {
                subscribe: function subscribe(alias, handler) {
                    return that.partEndManager.subscribe(alias, handler);
                },
                unsubscribe: function unsubscribe(alias, index) {
                    return that.partEndManager.unsubscribe(alias, index);
                }
            };
        }
    }, {
        key: 'getPartStartListenerAccess',
        value: function getPartStartListenerAccess() {
            var that = this;
            return {
                subscribe: function subscribe(alias, handler) {
                    return that.partStartManager.subscribe(alias, handler);
                },
                unsubscribe: function unsubscribe(alias, index) {
                    return that.partStartManager.unsubscribe(alias, index);
                }
            };
        }
    }, {
        key: 'handle',
        value: function handle(taskFlow) {
            if (taskFlow == null) {
                throw new Error('It\'s required a task flow.');
            }
            if (taskFlow.parts == null) {
                throw new Error('It\'s required a task flow with parts.');
            }
            this.currentTask = taskFlow;
            var partPromises = new Array(taskFlow.parts.length);
            for (var i = 0; i < taskFlow.parts.length; ++i) {
                partPromises[i] = this.handleTaskPart(taskFlow.parts[i]);
            }
            return partPromises;
        }
    }, {
        key: 'handleTaskPart',
        value: function handleTaskPart(part) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                that.handleTaskPartWhen(part.when).then(function () {
                    that.eventEmitter.emit(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.START, {
                        aliases: [part.alias],
                        part: part
                    });
                    var promise = that.performTask(part);
                    promise.then(function () {
                        that.eventEmitter.emit(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.END, {
                            aliases: [part.alias],
                            part: part
                        });
                        resolve();
                    });
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'handleTaskPartWhen',
        value: function handleTaskPartWhen(whenEntity) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                if (null == whenEntity) {
                    resolve();
                } else {
                    switch (whenEntity.constraintType) {
                        case _taskPartConstraint.TASK_CONSTRAINT_TYPES.START:
                            that.handleTaskPartWhenPartBegins(whenEntity).then(resolve);
                            break;
                        case _taskPartConstraint.TASK_CONSTRAINT_TYPES.END:
                            that.handleTaskPartWhenPartEnds(whenEntity).then(resolve);
                            break;
                        case _taskPartConstraint.TASK_CONSTRAINT_TYPES.GROUP:
                            that.handleTaskPartWhenPartGroup(whenEntity).then(resolve);
                            break;
                        case _taskPartConstraint.TASK_CONSTRAINT_TYPES.WAIT_FOR:
                            that.handleTaskPartWhenWaitFor(whenEntity).then(resolve);
                            break;
                        default:
                            throw new Error('Unexpected when entity type.');
                    }
                }
            });
        }
    }, {
        key: 'handleTaskPartWhenPartBegins',
        value: function handleTaskPartWhenPartBegins(whenEntity) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                var eventHandler = function eventHandler() {
                    that.partStartManager.unsubscribe(whenEntity.alias, token);
                    if (null == whenEntity.after) {
                        resolve();
                    } else {
                        that.handleTaskPartWhen(whenEntity.after).then(resolve);
                    }
                };
                var token = that.partStartManager.subscribe(whenEntity.alias, eventHandler);
            });
        }
    }, {
        key: 'handleTaskPartWhenPartEnds',
        value: function handleTaskPartWhenPartEnds(whenEntity) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                var eventHandler = function eventHandler() {
                    that.partEndManager.unsubscribe(whenEntity.alias, token);
                    if (null == whenEntity.after) {
                        resolve();
                    } else {
                        that.handleTaskPartWhen(whenEntity.after).then(resolve);
                    }
                };
                var token = that.partEndManager.subscribe(whenEntity.alias, eventHandler);
            });
        }
    }, {
        key: 'handleTaskPartWhenPartGroup',
        value: function handleTaskPartWhenPartGroup(whenEntity) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                var childPromises = new Array(whenEntity.constraints.length);
                for (var i = 0; i < whenEntity.constraints.length; ++i) {
                    childPromises[i] = new _promise2.default(function (resolve, reject) {
                        that.handleTaskPartWhen(whenEntity.constraints[i]).then(resolve);
                    });
                }
                if (_taskPartWhenOperator.TaskPartWhenOperator.AND === whenEntity.operator) {
                    _promise2.default.all(childPromises).then(function () {
                        resolve();
                    });
                } else if (_taskPartWhenOperator.TaskPartWhenOperator.OR === whenEntity.operator) {
                    _promise2.default.race(childPromises).then(function () {
                        resolve();
                    });
                } else {
                    reject('Unexpected operator.');
                }
            });
        }
    }, {
        key: 'handleTaskPartWhenWaitFor',
        value: function handleTaskPartWhenWaitFor(whenEntity) {
            var that = this;
            return new _promise2.default(function (resolve, reject) {
                setTimeout(function () {
                    if (whenEntity.after == null) {
                        resolve();
                    } else {
                        that.handleTaskPartWhen(whenEntity.after).then(resolve);
                    }
                }, whenEntity.millis);
            });
        }
    }]);
    return TaskEngine;
}();



},{"./flow/task-part-constraint":13,"./operation/operation-manager":14,"./task-part-when-events":16,"./task-part-when-operator":17,"babel-runtime/core-js/promise":26,"babel-runtime/helpers/classCallCheck":29,"babel-runtime/helpers/createClass":30,"events":222}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var TASK_PART_WHEN_EVENTS = exports.TASK_PART_WHEN_EVENTS = {
    END: 'part.end',
    START: 'part.start'
};



},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var TaskPartWhenOperator = exports.TaskPartWhenOperator = undefined;
(function (TaskPartWhenOperator) {
    TaskPartWhenOperator[TaskPartWhenOperator["AND"] = 0] = "AND";
    TaskPartWhenOperator[TaskPartWhenOperator["OR"] = 1] = "OR";
})(TaskPartWhenOperator || (exports.TaskPartWhenOperator = TaskPartWhenOperator = {}));



},{}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":36}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":37}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":38}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":39}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":40}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":41}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":42}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":43}],26:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":44}],27:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":45}],28:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":46}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":22}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":23,"../core-js/object/get-prototype-of":24}],32:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":21,"../core-js/object/set-prototype-of":25,"../helpers/typeof":34}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":34}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":27,"../core-js/symbol/iterator":28}],35:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":160,"../modules/es6.object.to-string":216,"../modules/es6.promise":217,"../modules/es6.string.iterator":218,"../modules/es7.promise.finally":219,"../modules/es7.promise.try":220,"../modules/web.dom.iterable":221}],36:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');

},{"../modules/core.get-iterator":132,"../modules/es6.string.iterator":143,"../modules/web.dom.iterable":152}],37:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
require('../modules/es7.map.of');
require('../modules/es7.map.from');
module.exports = require('../modules/_core').Map;

},{"../modules/_core":61,"../modules/es6.map":134,"../modules/es6.object.to-string":141,"../modules/es6.string.iterator":143,"../modules/es7.map.from":145,"../modules/es7.map.of":146,"../modules/es7.map.to-json":147,"../modules/web.dom.iterable":152}],38:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;

},{"../../modules/_core":61,"../../modules/es6.object.assign":135}],39:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":61,"../../modules/es6.object.create":136}],40:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":61,"../../modules/es6.object.define-property":137}],41:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":61,"../../modules/es6.object.get-own-property-descriptor":138}],42:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":61,"../../modules/es6.object.get-prototype-of":139}],43:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":61,"../../modules/es6.object.set-prototype-of":140}],44:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"../modules/_core":61,"../modules/es6.object.to-string":141,"../modules/es6.promise":142,"../modules/es6.string.iterator":143,"../modules/es7.promise.finally":148,"../modules/es7.promise.try":149,"../modules/web.dom.iterable":152,"dup":35}],45:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":61,"../../modules/es6.object.to-string":141,"../../modules/es6.symbol":144,"../../modules/es7.symbol.async-iterator":150,"../../modules/es7.symbol.observable":151}],46:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":129,"../../modules/es6.string.iterator":143,"../../modules/web.dom.iterable":152}],47:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],48:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],49:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],50:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":80}],51:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":70}],52:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":119,"./_to-iobject":121,"./_to-length":122}],53:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":55,"./_ctx":62,"./_iobject":77,"./_to-length":122,"./_to-object":123}],54:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":79,"./_is-object":80,"./_wks":130}],55:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":54}],56:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":57,"./_wks":130}],57:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],58:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":49,"./_ctx":62,"./_descriptors":64,"./_for-of":70,"./_iter-define":83,"./_iter-step":85,"./_meta":88,"./_object-create":92,"./_object-dp":93,"./_redefine-all":107,"./_set-species":112,"./_validate-collection":127}],59:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":51,"./_classof":56}],60:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var meta = require('./_meta');
var fails = require('./_fails');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var setToStringTag = require('./_set-to-string-tag');
var dP = require('./_object-dp').f;
var each = require('./_array-methods')(0);
var DESCRIPTORS = require('./_descriptors');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":49,"./_array-methods":53,"./_descriptors":64,"./_export":68,"./_fails":69,"./_for-of":70,"./_global":71,"./_hide":73,"./_is-object":80,"./_meta":88,"./_object-dp":93,"./_redefine-all":107,"./_set-to-string-tag":113}],61:[function(require,module,exports){
var core = module.exports = { version: '2.6.0' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],62:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":47}],63:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],64:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":69}],65:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":71,"./_is-object":80}],66:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],67:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":98,"./_object-keys":101,"./_object-pie":102}],68:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":61,"./_ctx":62,"./_global":71,"./_has":72,"./_hide":73}],69:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],70:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":50,"./_ctx":62,"./_is-array-iter":78,"./_iter-call":81,"./_to-length":122,"./core.get-iterator-method":131}],71:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],72:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],73:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":64,"./_object-dp":93,"./_property-desc":106}],74:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":71}],75:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":64,"./_dom-create":65,"./_fails":69}],76:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],77:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":57}],78:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":86,"./_wks":130}],79:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":57}],80:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],81:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":50}],82:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":73,"./_object-create":92,"./_property-desc":106,"./_set-to-string-tag":113,"./_wks":130}],83:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":68,"./_hide":73,"./_iter-create":82,"./_iterators":86,"./_library":87,"./_object-gpo":99,"./_redefine":108,"./_set-to-string-tag":113,"./_wks":130}],84:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":130}],85:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],86:[function(require,module,exports){
module.exports = {};

},{}],87:[function(require,module,exports){
module.exports = true;

},{}],88:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":69,"./_has":72,"./_is-object":80,"./_object-dp":93,"./_uid":125}],89:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":57,"./_global":71,"./_task":118}],90:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":47}],91:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":69,"./_iobject":77,"./_object-gops":98,"./_object-keys":101,"./_object-pie":102,"./_to-object":123}],92:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":50,"./_dom-create":65,"./_enum-bug-keys":66,"./_html":74,"./_object-dps":94,"./_shared-key":114}],93:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":50,"./_descriptors":64,"./_ie8-dom-define":75,"./_to-primitive":124}],94:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":50,"./_descriptors":64,"./_object-dp":93,"./_object-keys":101}],95:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":64,"./_has":72,"./_ie8-dom-define":75,"./_object-pie":102,"./_property-desc":106,"./_to-iobject":121,"./_to-primitive":124}],96:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":97,"./_to-iobject":121}],97:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":66,"./_object-keys-internal":100}],98:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],99:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":72,"./_shared-key":114,"./_to-object":123}],100:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":52,"./_has":72,"./_shared-key":114,"./_to-iobject":121}],101:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":66,"./_object-keys-internal":100}],102:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],103:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":61,"./_export":68,"./_fails":69}],104:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],105:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":50,"./_is-object":80,"./_new-promise-capability":90}],106:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],107:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":73}],108:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":73}],109:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');
var aFunction = require('./_a-function');
var ctx = require('./_ctx');
var forOf = require('./_for-of');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

},{"./_a-function":47,"./_ctx":62,"./_export":68,"./_for-of":70}],110:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

},{"./_export":68}],111:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":50,"./_ctx":62,"./_is-object":80,"./_object-gopd":95}],112:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":61,"./_descriptors":64,"./_global":71,"./_object-dp":93,"./_wks":130}],113:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":72,"./_object-dp":93,"./_wks":130}],114:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":115,"./_uid":125}],115:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":61,"./_global":71,"./_library":87}],116:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":47,"./_an-object":50,"./_wks":130}],117:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":63,"./_to-integer":120}],118:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":57,"./_ctx":62,"./_dom-create":65,"./_global":71,"./_html":74,"./_invoke":76}],119:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":120}],120:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],121:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":63,"./_iobject":77}],122:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":120}],123:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":63}],124:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":80}],125:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],126:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":71}],127:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":80}],128:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":61,"./_global":71,"./_library":87,"./_object-dp":93,"./_wks-ext":129}],129:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":130}],130:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":71,"./_shared":115,"./_uid":125}],131:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":56,"./_core":61,"./_iterators":86,"./_wks":130}],132:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":50,"./_core":61,"./core.get-iterator-method":131}],133:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":48,"./_iter-define":83,"./_iter-step":85,"./_iterators":86,"./_to-iobject":121}],134:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = require('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":60,"./_collection-strong":58,"./_validate-collection":127}],135:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":68,"./_object-assign":91}],136:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":68,"./_object-create":92}],137:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":64,"./_export":68,"./_object-dp":93}],138:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":95,"./_object-sap":103,"./_to-iobject":121}],139:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":99,"./_object-sap":103,"./_to-object":123}],140:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":68,"./_set-proto":111}],141:[function(require,module,exports){

},{}],142:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":47,"./_an-instance":49,"./_classof":56,"./_core":61,"./_ctx":62,"./_export":68,"./_for-of":70,"./_global":71,"./_is-object":80,"./_iter-detect":84,"./_library":87,"./_microtask":89,"./_new-promise-capability":90,"./_perform":104,"./_promise-resolve":105,"./_redefine-all":107,"./_set-species":112,"./_set-to-string-tag":113,"./_species-constructor":116,"./_task":118,"./_user-agent":126,"./_wks":130}],143:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":83,"./_string-at":117}],144:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":50,"./_descriptors":64,"./_enum-keys":67,"./_export":68,"./_fails":69,"./_global":71,"./_has":72,"./_hide":73,"./_is-array":79,"./_is-object":80,"./_library":87,"./_meta":88,"./_object-create":92,"./_object-dp":93,"./_object-gopd":95,"./_object-gopn":97,"./_object-gopn-ext":96,"./_object-gops":98,"./_object-keys":101,"./_object-pie":102,"./_property-desc":106,"./_redefine":108,"./_set-to-string-tag":113,"./_shared":115,"./_to-iobject":121,"./_to-primitive":124,"./_uid":125,"./_wks":130,"./_wks-define":128,"./_wks-ext":129}],145:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('./_set-collection-from')('Map');

},{"./_set-collection-from":109}],146:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('./_set-collection-of')('Map');

},{"./_set-collection-of":110}],147:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });

},{"./_collection-to-json":59,"./_export":68}],148:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":61,"./_export":68,"./_global":71,"./_promise-resolve":105,"./_species-constructor":116}],149:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":68,"./_new-promise-capability":90,"./_perform":104}],150:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":128}],151:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":128}],152:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":71,"./_hide":73,"./_iterators":86,"./_wks":130,"./es6.array.iterator":133}],153:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"dup":47}],154:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":171,"./_wks":213}],155:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"dup":49}],156:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"./_is-object":177,"dup":50}],157:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"./_to-absolute-index":205,"./_to-iobject":207,"./_to-length":208,"dup":52}],158:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"./_cof":159,"./_wks":213,"dup":56}],159:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"dup":57}],160:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"dup":61}],161:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"./_a-function":153,"dup":62}],162:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"dup":63}],163:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"./_fails":167,"dup":64}],164:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"./_global":169,"./_is-object":177,"dup":65}],165:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],166:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":160,"./_ctx":161,"./_global":169,"./_hide":171,"./_redefine":197}],167:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"dup":69}],168:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"./_an-object":156,"./_ctx":161,"./_is-array-iter":176,"./_iter-call":178,"./_to-length":208,"./core.get-iterator-method":214,"dup":70}],169:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"dup":71}],170:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"dup":72}],171:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"./_descriptors":163,"./_object-dp":188,"./_property-desc":195,"dup":73}],172:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"./_global":169,"dup":74}],173:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./_descriptors":163,"./_dom-create":164,"./_fails":167,"dup":75}],174:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"dup":76}],175:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./_cof":159,"dup":77}],176:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"./_iterators":183,"./_wks":213,"dup":78}],177:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],178:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"./_an-object":156,"dup":81}],179:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./_hide":171,"./_object-create":187,"./_property-desc":195,"./_set-to-string-tag":199,"./_wks":213,"dup":82}],180:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./_export":166,"./_hide":171,"./_iter-create":179,"./_iterators":183,"./_library":184,"./_object-gpo":190,"./_redefine":197,"./_set-to-string-tag":199,"./_wks":213,"dup":83}],181:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"./_wks":213,"dup":84}],182:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"dup":85}],183:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"dup":86}],184:[function(require,module,exports){
module.exports = false;

},{}],185:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"./_cof":159,"./_global":169,"./_task":204,"dup":89}],186:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"./_a-function":153,"dup":90}],187:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"./_an-object":156,"./_dom-create":164,"./_enum-bug-keys":165,"./_html":172,"./_object-dps":189,"./_shared-key":200,"dup":92}],188:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./_an-object":156,"./_descriptors":163,"./_ie8-dom-define":173,"./_to-primitive":210,"dup":93}],189:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"./_an-object":156,"./_descriptors":163,"./_object-dp":188,"./_object-keys":192,"dup":94}],190:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"./_has":170,"./_shared-key":200,"./_to-object":209,"dup":99}],191:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"./_array-includes":157,"./_has":170,"./_shared-key":200,"./_to-iobject":207,"dup":100}],192:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"./_enum-bug-keys":165,"./_object-keys-internal":191,"dup":101}],193:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"dup":104}],194:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"./_an-object":156,"./_is-object":177,"./_new-promise-capability":186,"dup":105}],195:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"dup":106}],196:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};

},{"./_redefine":197}],197:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":160,"./_global":169,"./_has":170,"./_hide":171,"./_uid":211}],198:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":163,"./_global":169,"./_object-dp":188,"./_wks":213}],199:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"./_has":170,"./_object-dp":188,"./_wks":213,"dup":113}],200:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"./_shared":201,"./_uid":211,"dup":114}],201:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"./_core":160,"./_global":169,"./_library":184,"dup":115}],202:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"./_a-function":153,"./_an-object":156,"./_wks":213,"dup":116}],203:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"./_defined":162,"./_to-integer":206,"dup":117}],204:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"./_cof":159,"./_ctx":161,"./_dom-create":164,"./_global":169,"./_html":172,"./_invoke":174,"dup":118}],205:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"./_to-integer":206,"dup":119}],206:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"dup":120}],207:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"./_defined":162,"./_iobject":175,"dup":121}],208:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"./_to-integer":206,"dup":122}],209:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"./_defined":162,"dup":123}],210:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"./_is-object":177,"dup":124}],211:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"dup":125}],212:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"./_global":169,"dup":126}],213:[function(require,module,exports){
arguments[4][130][0].apply(exports,arguments)
},{"./_global":169,"./_shared":201,"./_uid":211,"dup":130}],214:[function(require,module,exports){
arguments[4][131][0].apply(exports,arguments)
},{"./_classof":158,"./_core":160,"./_iterators":183,"./_wks":213,"dup":131}],215:[function(require,module,exports){
arguments[4][133][0].apply(exports,arguments)
},{"./_add-to-unscopables":154,"./_iter-define":180,"./_iter-step":182,"./_iterators":183,"./_to-iobject":207,"dup":133}],216:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof');
var test = {};
test[require('./_wks')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}

},{"./_classof":158,"./_redefine":197,"./_wks":213}],217:[function(require,module,exports){
arguments[4][142][0].apply(exports,arguments)
},{"./_a-function":153,"./_an-instance":155,"./_classof":158,"./_core":160,"./_ctx":161,"./_export":166,"./_for-of":168,"./_global":169,"./_is-object":177,"./_iter-detect":181,"./_library":184,"./_microtask":185,"./_new-promise-capability":186,"./_perform":193,"./_promise-resolve":194,"./_redefine-all":196,"./_set-species":198,"./_set-to-string-tag":199,"./_species-constructor":202,"./_task":204,"./_user-agent":212,"./_wks":213,"dup":142}],218:[function(require,module,exports){
arguments[4][143][0].apply(exports,arguments)
},{"./_iter-define":180,"./_string-at":203,"dup":143}],219:[function(require,module,exports){
arguments[4][148][0].apply(exports,arguments)
},{"./_core":160,"./_export":166,"./_global":169,"./_promise-resolve":194,"./_species-constructor":202,"dup":148}],220:[function(require,module,exports){
arguments[4][149][0].apply(exports,arguments)
},{"./_export":166,"./_new-promise-capability":186,"./_perform":193,"dup":149}],221:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":169,"./_hide":171,"./_iterators":183,"./_object-keys":192,"./_redefine":197,"./_wks":213,"./es6.array.iterator":215}],222:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}]},{},[11])(11)
});

//# sourceMappingURL=bundle.dev.js.map
