(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.soraTest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleAnimationEngine = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _carouselBase = require("../carousel/carousel-base");

var _operationManager = require("../task/operation/operation-manager");

var _taskEngine = require("../task/task-engine");

var _animationOperationEvents = require("./animation-operation-events");

var _animationPlayState = require("./animation-play-state");

var SingleAnimationEngine =
/*#__PURE__*/
function (_TaskEngine) {
  (0, _inherits2.default)(SingleAnimationEngine, _TaskEngine);

  function SingleAnimationEngine() {
    var _this;

    (0, _classCallCheck2.default)(this, SingleAnimationEngine);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SingleAnimationEngine).call(this));
    _this.animationCancelManager = new _operationManager.OperationManager(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, _this.eventEmitter);
    _this.animationStateChangeManager = new _operationManager.OperationManager(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, _this.eventEmitter);
    return _this;
  }

  (0, _createClass2.default)(SingleAnimationEngine, [{
    key: "dispose",
    value: function dispose() {
      this.animationCancelManager.dispose();
      this.animationStateChangeManager.dispose();
    }
  }, {
    key: "cancelAnimation",
    value: function cancelAnimation(aliases) {
      this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_CANCEL, {
        aliases: aliases
      });
    }
  }, {
    key: "pause",
    value: function pause(aliases) {
      this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, {
        aliases: aliases,
        value: _animationPlayState.AnimationPlayStateValue.paused
      });
    }
  }, {
    key: "resume",
    value: function resume(aliases) {
      this.eventEmitter.emit(_animationOperationEvents.ANIMATION_OPERATION_EVENTS.ANIMATION_STATE_CHANGE, {
        aliases: aliases,
        value: _animationPlayState.AnimationPlayStateValue.running
      });
    }
  }, {
    key: "handleTaskPart",
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
      return (0, _get2.default)((0, _getPrototypeOf2.default)(SingleAnimationEngine.prototype), "handleTaskPart", this).call(this, part);
    }
  }, {
    key: "performTask",
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

      return Promise.all(promises);
    }
  }, {
    key: "handleAnimationOverElement",
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
      return new Promise(function (resolve, reject) {
        try {
          var currentAnimationIndex;
          var i;

          (function () {
            var animationFunctions = new Array();
            currentAnimationIndex = null;

            var onAnimationCancel = function onAnimationCancel(args) {
              onAnimationPlayStateChange({
                aliases: args.aliases,
                value: _animationPlayState.AnimationPlayStateValue.running
              });
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
    key: "registerAnimationListener",
    value: function registerAnimationListener(element, listener) {
      element.addEventListener('animationend', listener);
      element.addEventListener('webkitAnimationEnd', listener);
    }
  }, {
    key: "unregisterAnimationListener",
    value: function unregisterAnimationListener(element, listener) {
      element.removeEventListener('animationend', listener);
      element.removeEventListener('webkitAnimationEnd', listener);
    }
  }]);
  return SingleAnimationEngine;
}(_taskEngine.TaskEngine);

exports.SingleAnimationEngine = SingleAnimationEngine;

},{"../carousel/carousel-base":4,"../task/operation/operation-manager":17,"../task/task-engine":18,"./animation-operation-events":2,"./animation-play-state":3,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ANIMATION_OPERATION_EVENTS = void 0;
var ANIMATION_OPERATION_EVENTS = {
  ANIMATION_CANCEL: 'anim.cancel',
  ANIMATION_STATE_CHANGE: 'anim.state.change'
};
exports.ANIMATION_OPERATION_EVENTS = ANIMATION_OPERATION_EVENTS;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationPlayStateValue = void 0;
var AnimationPlayStateValue;
exports.AnimationPlayStateValue = AnimationPlayStateValue;

(function (AnimationPlayStateValue) {
  AnimationPlayStateValue[AnimationPlayStateValue["paused"] = 0] = "paused";
  AnimationPlayStateValue[AnimationPlayStateValue["running"] = 1] = "running";
})(AnimationPlayStateValue || (exports.AnimationPlayStateValue = AnimationPlayStateValue = {}));

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CarouselBase = exports.CAROUSEL_STYLES = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var CAROUSEL_STYLES = {
  ANIMATION_PAUSED: 'sora-animation-paused',
  CAROUSEL: 'sora-carousel',
  CLEAR_ANIMATION: 'sora-clear-animations',
  SLIDE: 'sora-slide',
  WRAPPER: 'sora-wrapper'
};
exports.CAROUSEL_STYLES = CAROUSEL_STYLES;

var CarouselBase = function CarouselBase() {
  (0, _classCallCheck2.default)(this, CarouselBase);
};

exports.CarouselBase = CarouselBase;

},{"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/interopRequireDefault":31}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleSlideCarousel = exports.SINGLE_SLIDE_CAROUSEL_STYLES = exports.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = exports.SINGLE_SLIDE_CAROUSEL_EVENTS = exports.SINGLE_SLIDE_CAROUSEL_ACTIONS = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _events = require("events");

var _animationEngine = require("../../animation/animation-engine");

var _animationPlayState = require("../../animation/animation-play-state");

var _collectionManager = require("../../collection/collection-manager");

var _htmlChildrenManager = require("../../collection/html-children-manager");

var _carouselBase = require("../carousel-base");

var SINGLE_SLIDE_CAROUSEL_ACTIONS = {
  GO_TO: 'to',
  GO_TO_NEXT: 'next',
  GO_TO_PREVIOUS: 'prev'
};
exports.SINGLE_SLIDE_CAROUSEL_ACTIONS = SINGLE_SLIDE_CAROUSEL_ACTIONS;
var SINGLE_SLIDE_CAROUSEL_EVENTS = {
  ON_ANIMATION_END: 'car.anim.out',
  ON_ANIMATION_PLAY_STATE_CHANGE: 'car.anim.state.ch',
  ON_ANIMATION_START: 'car.anim.in',
  ON_CANCEL_ANIMATION: 'car.anim.cancel'
};
exports.SINGLE_SLIDE_CAROUSEL_EVENTS = SINGLE_SLIDE_CAROUSEL_EVENTS;
var SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = {
  ENTER: 'enter-part',
  LEAVE: 'leave-part'
};
exports.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES = SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES;
var SINGLE_SLIDE_CAROUSEL_STYLES = {
  SLIDE_HIDDEN: 'sora-hidden',
  SORA_RELATIVE: 'sora-relative'
};
exports.SINGLE_SLIDE_CAROUSEL_STYLES = SINGLE_SLIDE_CAROUSEL_STYLES;

var SingleSlideCarousel =
/*#__PURE__*/
function (_CarouselBase) {
  (0, _inherits2.default)(SingleSlideCarousel, _CarouselBase);

  function SingleSlideCarousel(element, options) {
    var _this;

    (0, _classCallCheck2.default)(this, SingleSlideCarousel);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(SingleSlideCarousel).call(this));

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

    var that = (0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this));

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

  (0, _createClass2.default)(SingleSlideCarousel, [{
    key: "addListener",
    value: function addListener(event, listener) {
      this.eventEmitter.addListener(event, listener);
    }
  }, {
    key: "createWaitPromise",
    value: function createWaitPromise(options) {
      var that = this;
      return new Promise(function (resolve, reject) {
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
    key: "forceActiveSlide",
    value: function forceActiveSlide(activeIndex) {
      var eventArgs = {
        activeIndex: activeIndex
      };
      this.engineAnimation.cancelAnimation(null);
      this.paused = false;
      this.activeIndex = activeIndex;
      this.resetCarouselStructure(activeIndex);
      this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_CANCEL_ANIMATION, eventArgs);
    }
  }, {
    key: "getActiveElement",
    value: function getActiveElement() {
      return this.elementsManager.getCollection()[this.activeIndex];
    }
  }, {
    key: "getActiveIndex",
    value: function getActiveIndex() {
      return this.activeIndex;
    }
  }, {
    key: "getElementsManager",
    value: function getElementsManager() {
      return this.elementsManager;
    }
  }, {
    key: "hasActiveAnimation",
    value: function hasActiveAnimation() {
      return null != this.currentAnimation;
    }
  }, {
    key: "handle",
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
    key: "isPaused",
    value: function isPaused() {
      return this.paused;
    }
  }, {
    key: "pause",
    value: function pause() {
      if (!this.paused) {
        this.engineAnimation.pause(null);
        this.paused = true;
        this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, {
          value: _animationPlayState.AnimationPlayStateValue.paused
        });
      }
    }
  }, {
    key: "removeListener",
    value: function removeListener(event, listener) {
      this.eventEmitter.removeListener(event, listener);
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this.paused) {
        this.engineAnimation.resume(null);
        this.paused = false;
        this.eventEmitter.emit(SINGLE_SLIDE_CAROUSEL_EVENTS.ON_ANIMATION_PLAY_STATE_CHANGE, {
          value: _animationPlayState.AnimationPlayStateValue.running
        });
      }
    }
  }, {
    key: "generateGoToAnimationFlow",
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
                  for (var _iterator = childrenElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var childrenElement = _step.value;
                    elements.push(childrenElement);
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
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

      for (var _i = 0; _i < innerParts.length; _i++) {
        var innerPart = innerParts[_i];
        innerPartsMap[innerPart.alias] = innerPart;
      }

      var animationFlow = {
        parts: innerParts
      };
      return animationFlow;
    }
  }, {
    key: "resetCarouselStructure",
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
    key: "handleGoTo",
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
      var hideLeaveSlideAfterAnimationEnds = new Promise(function (resolve, reject) {
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
      var soraHandlerStatus = new Promise(function (resolve, reject) {
        Promise.all([animationPromises[ANIMATION_ENTER_INDEX], hideLeaveSlideAfterAnimationEnds]).then(function () {
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

exports.SingleSlideCarousel = SingleSlideCarousel;

},{"../../animation/animation-engine":1,"../../animation/animation-play-state":3,"../../collection/collection-manager":8,"../../collection/html-children-manager":9,"../carousel-base":4,"@babel/runtime/helpers/assertThisInitialized":25,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32,"events":36}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CancelableCollectionChangeEventArgs = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _collectionChangeArgs = require("./collection-change-args");

var CancelableCollectionChangeEventArgs =
/*#__PURE__*/
function (_CollectionChangeEven) {
  (0, _inherits2.default)(CancelableCollectionChangeEventArgs, _CollectionChangeEven);

  function CancelableCollectionChangeEventArgs(indexMap, newElements) {
    (0, _classCallCheck2.default)(this, CancelableCollectionChangeEventArgs);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(CancelableCollectionChangeEventArgs).call(this, indexMap, newElements, false));
  }

  (0, _createClass2.default)(CancelableCollectionChangeEventArgs, [{
    key: "setPreventDefault",
    value: function setPreventDefault() {
      this.preventDefault = true;
    }
  }]);
  return CancelableCollectionChangeEventArgs;
}(_collectionChangeArgs.CollectionChangeEventArgs);

exports.CancelableCollectionChangeEventArgs = CancelableCollectionChangeEventArgs;

},{"./collection-change-args":7,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionChangeEventArgs = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var CollectionChangeEventArgs =
/*#__PURE__*/
function () {
  function CollectionChangeEventArgs(indexMap, newElements, preventDefault) {
    (0, _classCallCheck2.default)(this, CollectionChangeEventArgs);
    this.indexMap = indexMap;
    this.newElements = newElements;
    this.preventDefault = preventDefault;
  }

  (0, _createClass2.default)(CollectionChangeEventArgs, [{
    key: "getIndexMap",
    value: function getIndexMap() {
      return Object.assign({}, this.indexMap);
    }
  }, {
    key: "getNewElements",
    value: function getNewElements() {
      return Object.assign({}, this.newElements);
    }
  }, {
    key: "getPreventDefault",
    value: function getPreventDefault() {
      return this.preventDefault;
    }
  }]);
  return CollectionChangeEventArgs;
}();

exports.CollectionChangeEventArgs = CollectionChangeEventArgs;

},{"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionManager = exports.COLLECTION_MANAGER_EVENTS = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _cancelableCollectionChangeArgs = require("./cancelable-collection-change-args");

var _collectionChangeArgs = require("./collection-change-args");

var COLLECTION_MANAGER_EVENTS = {
  collectionAfterChange: 'coll.ch.a',
  collectionBeforeChange: 'coll.ch.b'
};
exports.COLLECTION_MANAGER_EVENTS = COLLECTION_MANAGER_EVENTS;

var CollectionManager =
/*#__PURE__*/
function () {
  function CollectionManager(collection, eventEmitter) {
    (0, _classCallCheck2.default)(this, CollectionManager);
    this.collection = collection;
    this.eventEmitter = eventEmitter;
  }

  (0, _createClass2.default)(CollectionManager, [{
    key: "getCollection",
    value: function getCollection() {
      return this.collection;
    }
  }, {
    key: "getLength",
    value: function getLength() {
      return this.collection.length;
    }
  }, {
    key: "insertElements",
    value: function insertElements(elements) {
      this.internalInsertElements(elements);
    }
  }, {
    key: "removeElements",
    value: function removeElements(indexes) {
      this.internalRemoveElements(indexes);
    }
  }, {
    key: "internalInsertElements",
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
    key: "internalRemoveElements",
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
    key: "internalTryToChangeCollection",
    value: function internalTryToChangeCollection() {
      var indexMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newElements = arguments.length > 1 ? arguments[1] : undefined;
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

exports.CollectionManager = CollectionManager;

},{"./cancelable-collection-change-args":6,"./collection-change-args":7,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],9:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HtmlChildrenManager = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _collectionManager = require("./collection-manager");

var HtmlChildrenManager =
/*#__PURE__*/
function (_CollectionManager) {
  (0, _inherits2.default)(HtmlChildrenManager, _CollectionManager);

  function HtmlChildrenManager(collection, eventEmitter, parentElement) {
    var _this;

    (0, _classCallCheck2.default)(this, HtmlChildrenManager);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(HtmlChildrenManager).call(this, collection, eventEmitter));
    _this.parentElement = parentElement;
    return _this;
  }

  (0, _createClass2.default)(HtmlChildrenManager, [{
    key: "internalTryToChangeCollection",
    value: function internalTryToChangeCollection() {
      var indexMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newElements = arguments.length > 1 ? arguments[1] : undefined;
      var eventArgs = (0, _get2.default)((0, _getPrototypeOf2.default)(HtmlChildrenManager.prototype), "internalTryToChangeCollection", this).call(this, indexMap, newElements);

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

exports.HtmlChildrenManager = HtmlChildrenManager;

},{"./collection-manager":8,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],10:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenMap = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var TokenMap =
/*#__PURE__*/
function () {
  function TokenMap() {
    (0, _classCallCheck2.default)(this, TokenMap);
    this.innerMap = new Map();
    this.unusedIndexes = new Array();
  }

  (0, _createClass2.default)(TokenMap, [{
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

exports.TokenMap = TokenMap;

},{"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],11:[function(require,module,exports){
"use strict";

var _animationEngine = require("./test/animation/animation-engine.test");

var _singleSlideCarousel = require("./test/carousel/single-slide-carousel.test");

var _collectionManager = require("./test/collection/collection-manager.test");

var _tokenMap = require("./test/collection/token-map.test");

var soraTest = function () {
  return {
    performTests: function performTests() {
      new _animationEngine.AnimationEngineTests().performTests();
      new _collectionManager.CollectionManagerTests().performTests();
      new _singleSlideCarousel.SingleSlideCarouselTests().performTests();
      new _tokenMap.TokenMapTests().performTests();
    }
  };
}();

module.exports = soraTest;

},{"./test/animation/animation-engine.test":21,"./test/carousel/single-slide-carousel.test":22,"./test/collection/collection-manager.test":23,"./test/collection/token-map.test":24}],12:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPartWhenConstraint = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var TaskPartWhenConstraint = function TaskPartWhenConstraint(after, constraintType) {
  (0, _classCallCheck2.default)(this, TaskPartWhenConstraint);
  this.after = after;
  this.constraintType = constraintType;
};

exports.TaskPartWhenConstraint = TaskPartWhenConstraint;

},{"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/interopRequireDefault":31}],13:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPartBeginConstraint = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _taskPartConstraint = require("./task-part-constraint");

var TaskPartBeginConstraint =
/*#__PURE__*/
function (_TaskPartConstraint) {
  (0, _inherits2.default)(TaskPartBeginConstraint, _TaskPartConstraint);

  function TaskPartBeginConstraint(after, alias) {
    (0, _classCallCheck2.default)(this, TaskPartBeginConstraint);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TaskPartBeginConstraint).call(this, after, alias, _taskPartConstraint.TASK_CONSTRAINT_TYPES.START));
  }

  return TaskPartBeginConstraint;
}(_taskPartConstraint.TaskPartConstraint);

exports.TaskPartBeginConstraint = TaskPartBeginConstraint;

},{"./task-part-constraint":14,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],14:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPartConstraint = exports.TASK_CONSTRAINT_TYPES = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _taskFlowWhen = require("./task-flow-when");

var TASK_CONSTRAINT_TYPES = {
  END: 'anim.end',
  GROUP: 'group',
  START: 'anim.start',
  WAIT_FOR: 'wait'
};
exports.TASK_CONSTRAINT_TYPES = TASK_CONSTRAINT_TYPES;

var TaskPartConstraint =
/*#__PURE__*/
function (_TaskPartWhenConstrai) {
  (0, _inherits2.default)(TaskPartConstraint, _TaskPartWhenConstrai);

  function TaskPartConstraint(after, alias, constraintType) {
    var _this;

    (0, _classCallCheck2.default)(this, TaskPartConstraint);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TaskPartConstraint).call(this, after, constraintType));
    _this.alias = alias;
    return _this;
  }

  return TaskPartConstraint;
}(_taskFlowWhen.TaskPartWhenConstraint);

exports.TaskPartConstraint = TaskPartConstraint;

},{"./task-flow-when":12,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],15:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPartEndConstraint = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _taskPartConstraint = require("./task-part-constraint");

var TaskPartEndConstraint =
/*#__PURE__*/
function (_TaskPartConstraint) {
  (0, _inherits2.default)(TaskPartEndConstraint, _TaskPartConstraint);

  function TaskPartEndConstraint(after, alias) {
    (0, _classCallCheck2.default)(this, TaskPartEndConstraint);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TaskPartEndConstraint).call(this, after, alias, _taskPartConstraint.TASK_CONSTRAINT_TYPES.END));
  }

  return TaskPartEndConstraint;
}(_taskPartConstraint.TaskPartConstraint);

exports.TaskPartEndConstraint = TaskPartEndConstraint;

},{"./task-part-constraint":14,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],16:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskTimeConstraint = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _taskFlowWhen = require("./task-flow-when");

var _taskPartConstraint = require("./task-part-constraint");

var TaskTimeConstraint =
/*#__PURE__*/
function (_TaskPartWhenConstrai) {
  (0, _inherits2.default)(TaskTimeConstraint, _TaskPartWhenConstrai);

  function TaskTimeConstraint(after, millis) {
    var _this;

    (0, _classCallCheck2.default)(this, TaskTimeConstraint);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TaskTimeConstraint).call(this, after, _taskPartConstraint.TASK_CONSTRAINT_TYPES.WAIT_FOR));
    _this.millis = millis;
    return _this;
  }

  return TaskTimeConstraint;
}(_taskFlowWhen.TaskPartWhenConstraint);

exports.TaskTimeConstraint = TaskTimeConstraint;

},{"./task-flow-when":12,"./task-part-constraint":14,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":32}],17:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OperationManager = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _tokenMap = require("../../collection/token-map");

var OperationManager =
/*#__PURE__*/
function () {
  function OperationManager(eventAlias, eventEmitter) {
    (0, _classCallCheck2.default)(this, OperationManager);
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
          for (var _iterator = eventArgs.aliases[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
            if (!_iteratorNormalCompletion && _iterator.return != null) {
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

  (0, _createClass2.default)(OperationManager, [{
    key: "dispose",
    value: function dispose() {
      this.eventEmitter.removeListener(this.eventAlias, this.callFunction);
    }
  }, {
    key: "subscribe",
    value: function subscribe(alias, handler) {
      if (null == this.subscriptionStorage[alias]) {
        this.subscriptionStorage[alias] = new _tokenMap.TokenMap();
      }

      return this.subscriptionStorage[alias].add(handler);
    }
  }, {
    key: "unsubscribe",
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

exports.OperationManager = OperationManager;

},{"../../collection/token-map":10,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],18:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskEngine = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _events = require("events");

var _taskPartConstraint = require("./flow/task-part-constraint");

var _operationManager = require("./operation/operation-manager");

var _taskPartWhenEvents = require("./task-part-when-events");

var _taskPartWhenOperator = require("./task-part-when-operator");

var TaskEngine =
/*#__PURE__*/
function () {
  function TaskEngine() {
    (0, _classCallCheck2.default)(this, TaskEngine);
    this.eventEmitter = new _events.EventEmitter();
    this.partEndManager = new _operationManager.OperationManager(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.END, this.eventEmitter);
    this.partStartManager = new _operationManager.OperationManager(_taskPartWhenEvents.TASK_PART_WHEN_EVENTS.START, this.eventEmitter);
  }

  (0, _createClass2.default)(TaskEngine, [{
    key: "getPartEndListenerAccess",
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
    key: "getPartStartListenerAccess",
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
    key: "handle",
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
    key: "handleTaskPart",
    value: function handleTaskPart(part) {
      var that = this;
      return new Promise(function (resolve, reject) {
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
    key: "handleTaskPartWhen",
    value: function handleTaskPartWhen(whenEntity) {
      var that = this;
      return new Promise(function (resolve, reject) {
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
    key: "handleTaskPartWhenPartBegins",
    value: function handleTaskPartWhenPartBegins(whenEntity) {
      var that = this;
      return new Promise(function (resolve, reject) {
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
    key: "handleTaskPartWhenPartEnds",
    value: function handleTaskPartWhenPartEnds(whenEntity) {
      var that = this;
      return new Promise(function (resolve, reject) {
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
    key: "handleTaskPartWhenPartGroup",
    value: function handleTaskPartWhenPartGroup(whenEntity) {
      var that = this;
      return new Promise(function (resolve, reject) {
        var childPromises = new Array(whenEntity.constraints.length);

        for (var i = 0; i < whenEntity.constraints.length; ++i) {
          childPromises[i] = new Promise(function (resolve, reject) {
            that.handleTaskPartWhen(whenEntity.constraints[i]).then(resolve);
          });
        }

        if (_taskPartWhenOperator.TaskPartWhenOperator.AND === whenEntity.operator) {
          Promise.all(childPromises).then(function () {
            resolve();
          });
        } else if (_taskPartWhenOperator.TaskPartWhenOperator.OR === whenEntity.operator) {
          Promise.race(childPromises).then(function () {
            resolve();
          });
        } else {
          reject('Unexpected operator.');
        }
      });
    }
  }, {
    key: "handleTaskPartWhenWaitFor",
    value: function handleTaskPartWhenWaitFor(whenEntity) {
      var that = this;
      return new Promise(function (resolve, reject) {
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

exports.TaskEngine = TaskEngine;

},{"./flow/task-part-constraint":14,"./operation/operation-manager":17,"./task-part-when-events":19,"./task-part-when-operator":20,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31,"events":36}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TASK_PART_WHEN_EVENTS = void 0;
var TASK_PART_WHEN_EVENTS = {
  END: 'part.end',
  START: 'part.start'
};
exports.TASK_PART_WHEN_EVENTS = TASK_PART_WHEN_EVENTS;

},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskPartWhenOperator = void 0;
var TaskPartWhenOperator;
exports.TaskPartWhenOperator = TaskPartWhenOperator;

(function (TaskPartWhenOperator) {
  TaskPartWhenOperator[TaskPartWhenOperator["AND"] = 0] = "AND";
  TaskPartWhenOperator[TaskPartWhenOperator["OR"] = 1] = "OR";
})(TaskPartWhenOperator || (exports.TaskPartWhenOperator = TaskPartWhenOperator = {}));

},{}],21:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationEngineTests = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _animationEngine = require("../../animation/animation-engine");

var _taskPartBeginConstraint = require("../../task/flow/task-part-begin-constraint");

var _taskPartEndConstraint = require("../../task/flow/task-part-end-constraint");

var _taskPartTimeConstraint = require("../../task/flow/task-part-time-constraint");

var AnimationEngineTests =
/*#__PURE__*/
function () {
  function AnimationEngineTests() {
    (0, _classCallCheck2.default)(this, AnimationEngineTests);
  }

  (0, _createClass2.default)(AnimationEngineTests, [{
    key: "performTests",
    value: function performTests() {
      var _this = this;

      describe('Animation Engine Tests', function () {
        _this.itMustBeInitializable();

        _this.itMustBeAbleToPerformASimpleAnimation();

        _this.itMustBeAbleToPerformMultipleAnimations();

        _this.itMustBeAbleToPerformAnimationsWhenAnimationEnds();

        _this.itMustBeAbleToPerformAnimationsWhenAnimationStarts();

        _this.itMustBeAbleToPerformAnimationAfterMillis();
      });
    }
  }, {
    key: "checkAnimation",
    value: function checkAnimation(additionalOperations, operationManagerAccess, part) {
      var eventRaised = false;

      var eventHandler = function eventHandler(eventArgs) {
        eventRaised = true;
        eventArgs.part.styles.forEach(function (style) {
          expect(part.styles).toContain(style);
        });
        expect(operationManagerAccess.unsubscribe(part.alias, handlerToken)).toBe(true);

        if (null != additionalOperations) {
          additionalOperations(eventArgs);
        }
      };

      var handlerToken = operationManagerAccess.subscribe(part.alias, eventHandler);
      return function () {
        return eventRaised;
      };
    }
  }, {
    key: "generateDivElement",
    value: function generateDivElement() {
      var r = Math.ceil(Math.random() * 256);
      var g = Math.ceil(Math.random() * 256);
      var b = Math.ceil(Math.random() * 256);
      var element = document.createElement('div');
      element.style.backgroundColor = 'rgb(' + r.toString() + ', ' + g.toString() + ', ' + b.toString() + ')';
      var height = 100;
      element.style.height = height + 'px';
      return element;
    }
  }, {
    key: "itMustBeInitializable",
    value: function itMustBeInitializable() {
      it('mustBeInitializable', function () {
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        expect(animationEngine).not.toBeNull();
      });
    }
  }, {
    key: "itMustBeAbleToPerformASimpleAnimation",
    value: function itMustBeAbleToPerformASimpleAnimation() {
      var _this2 = this;

      it('mustBeAbleToPerformASimpleAnimation', function (done) {
        var element = _this2.generateDivElement();

        document.body.appendChild(element);
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        var taskFlow = {
          parts: [{
            alias: 'elem',
            elements: [element],
            styles: ['sora-fade-out-animation'],
            when: null
          }]
        };
        var partStartAccess = animationEngine.getPartStartListenerAccess();
        var partEndAccess = animationEngine.getPartEndListenerAccess();

        var partEndToken = _this2.checkAnimation(null, partEndAccess, taskFlow.parts[0]);

        var partStartToken = _this2.checkAnimation(null, partStartAccess, taskFlow.parts[0]);

        var promises = animationEngine.handle(taskFlow);
        Promise.all(promises).then(function () {
          expect(partEndToken()).toBe(true);
          expect(partStartToken()).toBe(true);
          document.body.removeChild(element);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }, {
    key: "itMustBeAbleToPerformMultipleAnimations",
    value: function itMustBeAbleToPerformMultipleAnimations() {
      var _this3 = this;

      it('mustBeAbleToPerformMultipleAnimations', function (done) {
        var element1 = _this3.generateDivElement();

        var element2 = _this3.generateDivElement();

        document.body.appendChild(element1);
        document.body.appendChild(element2);
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        var taskFlow = {
          parts: [{
            alias: 'elem0',
            elements: [element1],
            styles: ['sora-fade-out-animation'],
            when: null
          }, {
            alias: 'elem1',
            elements: [element2],
            styles: ['sora-fade-out-animation'],
            when: null
          }]
        };
        var partStartAccess = animationEngine.getPartStartListenerAccess();
        var partEndAccess = animationEngine.getPartEndListenerAccess();

        var partEndToken1 = _this3.checkAnimation(null, partEndAccess, taskFlow.parts[0]);

        var partEndToken2 = _this3.checkAnimation(null, partEndAccess, taskFlow.parts[1]);

        var partStartToken1 = _this3.checkAnimation(null, partStartAccess, taskFlow.parts[0]);

        var partStartToken2 = _this3.checkAnimation(null, partStartAccess, taskFlow.parts[1]);

        var promises = animationEngine.handle(taskFlow);
        Promise.all(promises).then(function () {
          expect(partEndToken1()).toBe(true);
          expect(partEndToken2()).toBe(true);
          expect(partStartToken1()).toBe(true);
          expect(partStartToken2()).toBe(true);
          document.body.removeChild(element1);
          document.body.removeChild(element2);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }, {
    key: "itMustBeAbleToPerformAnimationsWhenAnimationEnds",
    value: function itMustBeAbleToPerformAnimationsWhenAnimationEnds() {
      var _this4 = this;

      it('mustBeAbleToPerformAnimationsWhenAnimationEnds', function (done) {
        var element0 = _this4.generateDivElement();

        var element1 = _this4.generateDivElement();

        document.body.appendChild(element0);
        document.body.appendChild(element1);
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        var taskFlow = {
          parts: [{
            alias: 'elem0',
            elements: [element0],
            styles: ['sora-fade-out-animation'],
            when: new _taskPartEndConstraint.TaskPartEndConstraint(null, 'elem1')
          }, {
            alias: 'elem1',
            elements: [element1],
            styles: ['sora-fade-out-animation'],
            when: null
          }]
        };
        var partStartAccess = animationEngine.getPartStartListenerAccess();
        var partEndAccess = animationEngine.getPartEndListenerAccess();

        var partEndToken0 = _this4.checkAnimation(null, partEndAccess, taskFlow.parts[0]);

        var partEndToken1 = _this4.checkAnimation(null, partEndAccess, taskFlow.parts[1]);

        var partStartToken0 = _this4.checkAnimation(function (eventArgs) {
          expect(partEndToken1()).toBe(true);
        }, partStartAccess, taskFlow.parts[0]);

        var partStartToken1 = _this4.checkAnimation(null, partStartAccess, taskFlow.parts[1]);

        var promises = animationEngine.handle(taskFlow);
        Promise.all(promises).then(function () {
          expect(partEndToken0()).toBe(true);
          expect(partEndToken1()).toBe(true);
          expect(partStartToken0()).toBe(true);
          expect(partStartToken1()).toBe(true);
          document.body.removeChild(element0);
          document.body.removeChild(element1);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }, {
    key: "itMustBeAbleToPerformAnimationsWhenAnimationStarts",
    value: function itMustBeAbleToPerformAnimationsWhenAnimationStarts() {
      var _this5 = this;

      it('mustBeAbleToPerformAnimationsWhenAnimationStarts', function (done) {
        var element0 = _this5.generateDivElement();

        var element1 = _this5.generateDivElement();

        document.body.appendChild(element0);
        document.body.appendChild(element1);
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        var taskFlow = {
          parts: [{
            alias: 'elem0',
            elements: [element0],
            styles: ['sora-fade-out-animation'],
            when: new _taskPartBeginConstraint.TaskPartBeginConstraint(null, 'elem1')
          }, {
            alias: 'elem1',
            elements: [element1],
            styles: ['sora-fade-out-animation'],
            when: null
          }]
        };
        var partStartAccess = animationEngine.getPartStartListenerAccess();
        var partEndAccess = animationEngine.getPartEndListenerAccess();

        var partEndToken0 = _this5.checkAnimation(null, partEndAccess, taskFlow.parts[0]);

        var partEndToken1 = _this5.checkAnimation(null, partEndAccess, taskFlow.parts[1]);

        var partStartToken0 = _this5.checkAnimation(function (eventArgs) {
          expect(partStartToken1()).toBe(true);
        }, partStartAccess, taskFlow.parts[0]);

        var partStartToken1 = _this5.checkAnimation(null, partStartAccess, taskFlow.parts[1]);

        var promises = animationEngine.handle(taskFlow);
        Promise.all(promises).then(function () {
          expect(partEndToken0()).toBe(true);
          expect(partEndToken1()).toBe(true);
          expect(partStartToken0()).toBe(true);
          expect(partStartToken1()).toBe(true);
          document.body.removeChild(element0);
          document.body.removeChild(element1);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }, {
    key: "itMustBeAbleToPerformAnimationAfterMillis",
    value: function itMustBeAbleToPerformAnimationAfterMillis() {
      var _this6 = this;

      it('mustBeAbleToPerformAnimationAfterMillis', function (done) {
        var element = _this6.generateDivElement();

        document.body.appendChild(element);
        var animationEngine = new _animationEngine.SingleAnimationEngine();
        var timeToWait = 1000;
        var taskFlow = {
          parts: [{
            alias: 'elem',
            elements: [element],
            styles: ['sora-fade-out-animation'],
            when: new _taskPartTimeConstraint.TaskTimeConstraint(null, timeToWait)
          }]
        };
        var partStartAccess = animationEngine.getPartStartListenerAccess();
        var partEndAccess = animationEngine.getPartEndListenerAccess();

        var partEndToken = _this6.checkAnimation(null, partEndAccess, taskFlow.parts[0]);

        var partStartToken = _this6.checkAnimation(null, partStartAccess, taskFlow.parts[0]);

        var now = new Date();
        var promises = animationEngine.handle(taskFlow);
        Promise.all(promises).then(function () {
          expect(new Date().getTime() - now.getTime()).toBeGreaterThanOrEqual(timeToWait);
          expect(partEndToken()).toBe(true);
          expect(partStartToken()).toBe(true);
          document.body.removeChild(element);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }]);
  return AnimationEngineTests;
}();

exports.AnimationEngineTests = AnimationEngineTests;

},{"../../animation/animation-engine":1,"../../task/flow/task-part-begin-constraint":13,"../../task/flow/task-part-end-constraint":15,"../../task/flow/task-part-time-constraint":16,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleSlideCarouselTests = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _carouselBase = require("../../carousel/carousel-base");

var _singleSlideCarousel = require("../../carousel/single-slide/single-slide-carousel");

var SingleSlideCarouselTests =
/*#__PURE__*/
function () {
  function SingleSlideCarouselTests() {
    (0, _classCallCheck2.default)(this, SingleSlideCarouselTests);
    this.longTimeLimit = 100000000;
  }

  (0, _createClass2.default)(SingleSlideCarouselTests, [{
    key: "performTests",
    value: function performTests() {
      var _this = this;

      describe('SingleSlideCarousel Tests', function () {
        _this.itMustBeInitializable();

        _this.itMustBeAbleToCancelAnimation();

        _this.itMustBeAbleToGoToSlides();

        _this.itMustBeAbleToGoToSlidesWhileAddingElements();

        _this.itMustBeAbleToGoToSlidesWhileRemovingAnimationElements();

        _this.itMustBeAbleToGoToSlidesWhileRemovingOtherElements();

        _this.itMustBeAbleToHandleChildrenAnimations();

        _this.itMustBeAbleToPauseAndResumeAnimation();

        _this.itMustBeAbleToRunComplexAnimations();
      });
    }
  }, {
    key: "generateBasicCarousel",
    value: function generateBasicCarousel() {
      var divElement = document.createElement('div');
      divElement.classList.add(_carouselBase.CAROUSEL_STYLES.CAROUSEL);
      divElement.innerHTML = "<div class=\"sora-wrapper\">\n    <div class=\"sora-slide\">\n        <span>Content 1</span>\n    </div>\n    <div class=\"sora-slide\">\n        <span>Content 2</span>\n    </div>\n    <div class=\"sora-slide\">\n        <span>Content 3</span>\n    </div>\n</div>";
      return divElement;
    }
  }, {
    key: "performGoAndCheck",
    value: function performGoAndCheck(action, carousel, enterAnimation, leaveAnimation) {
      var shouldCheck = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      expect([_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, _singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS]).toContain(action);
      var currentActiveElement = carousel.getActiveElement();
      var activeIndex = carousel.getActiveIndex();
      var indexes = carousel.getElementsManager().getLength();

      var nextIndex = function (action) {
        if (_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT === action) {
          return (activeIndex + 1) % indexes;
        } else if (_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS === action) {
          return (activeIndex - 1 + indexes) % indexes;
        } else {
          throw new Error('Unexpected action');
        }
      }(action);

      var nextElement = carousel.getElementsManager().getCollection()[nextIndex];
      var goActionStatus = carousel.handle(action, {
        enterAnimation: enterAnimation,
        leaveAnimation: leaveAnimation
      });

      var checkFunction = function checkFunction(partAlias, animation, operationManagerAccess) {
        var eventRaised = false;

        var eventHandler = function eventHandler(eventArgs) {
          eventRaised = true;
          eventArgs.part.styles.forEach(function (style) {
            expect(animation.slideStyles).toContain(style);
          });
          expect(operationManagerAccess.unsubscribe(partAlias, handlerToken)).toBe(true);
        };

        var handlerToken = operationManagerAccess.subscribe(partAlias, eventHandler);
        return function () {
          return eventRaised;
        };
      };

      var enterAnimationEndStatus = checkFunction(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER, enterAnimation, goActionStatus.partEndEventAccess);
      var leaveAnimationEndStatus = checkFunction(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE, leaveAnimation, goActionStatus.partEndEventAccess);
      var enterAnimationStartStatus = checkFunction(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.ENTER, enterAnimation, goActionStatus.partStartEventAccess);
      var leaveAnimationStartStatus = checkFunction(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_PARTS_ALIASES.LEAVE, leaveAnimation, goActionStatus.partStartEventAccess);
      goActionStatus.soraHandlerStatus.then(function () {
        expect(enterAnimationEndStatus()).toBe(true);
        expect(leaveAnimationEndStatus()).toBe(true);
        expect(enterAnimationStartStatus()).toBe(true);
        expect(leaveAnimationStartStatus()).toBe(true);

        if (shouldCheck) {
          expect(currentActiveElement.classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
          expect(currentActiveElement.classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          expect(nextElement.classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
          expect(nextElement.classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
        }
      });
      return {
        goActionStatus: goActionStatus,
        newElement: nextElement,
        oldElement: currentActiveElement
      };
    }
  }, {
    key: "performGoNext",
    value: function performGoNext(carousel, enterAnimation, leaveAnimation) {
      var shouldCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      return this.performGoAndCheck(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_NEXT, carousel, enterAnimation, leaveAnimation, shouldCheck);
    }
  }, {
    key: "performGoPrevious",
    value: function performGoPrevious(carousel, enterAnimation, leaveAnimation) {
      var shouldCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      return this.performGoAndCheck(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_ACTIONS.GO_TO_PREVIOUS, carousel, enterAnimation, leaveAnimation, shouldCheck);
    }
  }, {
    key: "itMustBeInitializable",
    value: function itMustBeInitializable() {
      var that = this;
      it('mustBeInitializable', function () {
        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        expect(carousel).not.toBeNull();
        var wrapper = divElement.querySelectorAll('.' + _carouselBase.CAROUSEL_STYLES.WRAPPER);
        expect(wrapper.length).toBe(1);
        var children = divElement.querySelectorAll('.' + _carouselBase.CAROUSEL_STYLES.WRAPPER + ' > .' + _carouselBase.CAROUSEL_STYLES.SLIDE);
        expect(children.length).toBe(3);
        expect(children[0].classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
        expect(children[0].classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);

        for (var i = 1; i < children.length; ++i) {
          expect(children[i].classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
          expect(children[i].classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
        }
      });
    }
  }, {
    key: "itMustBeAbleToCancelAnimation",
    value: function itMustBeAbleToCancelAnimation() {
      var that = this;
      it('mustBeAbleToCancelAnimation', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          }, false);
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          carousel.forceActiveSlide(2);
          var thirdElement = carousel.getElementsManager().getCollection()[2];
          expect(thirdElement.classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          expect(thirdElement.classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            expect(newActiveElement.classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
            expect(newActiveElement.classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            expect(oldActiveElement.classList).not.toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SORA_RELATIVE);
            expect(oldActiveElement.classList).toContain(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
            resolve();
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      });
    }
  }, {
    key: "itMustBeAbleToGoToSlides",
    value: function itMustBeAbleToGoToSlides() {
      var that = this;
      it('mustBeAbleToGoToSlides', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        function goPrevious(carousel) {
          return that.performGoPrevious(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          var oldActiveElement = animationStatus.oldElement;
          var newActiveElement = animationStatus.newElement;
          expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
          expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var animationStatus = goPrevious(carousel);
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
              resolve();
            }).catch(function (err) {
              reject(err);
            });
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToGoToSlidesWhileAddingElements",
    value: function itMustBeAbleToGoToSlidesWhileAddingElements() {
      var that = this;
      it('mustBeAbleToGoToSlidesWhileAddingElements', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        function goPrevious(carousel) {
          return that.performGoPrevious(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          var element0 = document.createElement('div');
          element0.classList.add(_carouselBase.CAROUSEL_STYLES.SLIDE);
          element0.classList.add(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          element0.innerHTML = 'New Content 0';
          var element1 = document.createElement('div');
          element1.classList.add(_carouselBase.CAROUSEL_STYLES.SLIDE);
          element1.classList.add(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          element1.innerHTML = 'New Content 1';
          var element2 = document.createElement('div');
          element2.classList.add(_carouselBase.CAROUSEL_STYLES.SLIDE);
          element2.classList.add(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          element2.innerHTML = 'New Content 2';
          var element3 = document.createElement('div');
          element3.classList.add(_carouselBase.CAROUSEL_STYLES.SLIDE);
          element3.classList.add(_singleSlideCarousel.SINGLE_SLIDE_CAROUSEL_STYLES.SLIDE_HIDDEN);
          element3.innerHTML = 'New Content 3';
          carousel.getElementsManager().insertElements({
            0: element0,
            1: element1,
            2: element2,
            3: element3
          });
          expect(carousel.getElementsManager().getLength()).toBe(7);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
            animationStatus = goPrevious(carousel);
            Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
              var oldActiveElement = animationStatus.oldElement;
              var newActiveElement = animationStatus.newElement;
              expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
              expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[5]);
              animationStatus = goPrevious(carousel);
              Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
                var oldActiveElement = animationStatus.oldElement;
                var newActiveElement = animationStatus.newElement;
                expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[3]);
                expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[4]);
                resolve();
              }).catch(function (err) {
                reject(err);
              });
            }).catch(function (err) {
              reject(err);
            });
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToGoToSlidesWhileRemovingAnimationElements",
    value: function itMustBeAbleToGoToSlidesWhileRemovingAnimationElements() {
      var that = this;
      it('mustBeAbleToGoToSlidesWhileRemovingAnimationElements', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          carousel.getElementsManager().removeElements([0, 1]);
          expect(carousel.getElementsManager().getCollection().length).toBe(3);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            resolve();
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToGoToSlidesWhileRemovingOtherElements",
    value: function itMustBeAbleToGoToSlidesWhileRemovingOtherElements() {
      var that = this;
      it('mustBeAbleToGoToSlidesWhileRemovingOtherElements', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          carousel.getElementsManager().removeElements([2]);
          expect(carousel.getElementsManager().getCollection().length).toBe(2);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            resolve();
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToHandleChildrenAnimations",
    value: function itMustBeAbleToHandleChildrenAnimations() {
      var that = this;
      it('mustBeAbleToHandleChildrenAnimations', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            childrenStyles: [{
              selector: 'span',
              styles: ['sora-fade-in-animation']
            }],
            slideStyles: ['sora-fade-in-animation']
          }, {
            childrenStyles: [{
              selector: 'span',
              styles: ['sora-fade-out-animation']
            }],
            slideStyles: ['sora-fade-out-animation']
          });
        }

        function goPrevious(carousel) {
          return that.performGoPrevious(carousel, {
            childrenStyles: [{
              selector: 'span',
              styles: ['sora-fade-in-animation']
            }],
            slideStyles: ['sora-fade-in-animation']
          }, {
            childrenStyles: [{
              selector: 'span',
              styles: ['sora-fade-out-animation']
            }],
            slideStyles: ['sora-fade-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            animationStatus = goPrevious(carousel);
            Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
              var oldActiveElement = animationStatus.oldElement;
              var newActiveElement = animationStatus.newElement;
              expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
              expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
              resolve();
            }).catch(function (err) {
              reject(err);
            });
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToPauseAndResumeAnimation",
    value: function itMustBeAbleToPauseAndResumeAnimation() {
      var that = this;
      it('mustBeAbleToPauseAndResumeAnimation', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var currentIndex = carousel.getActiveIndex();
          var animationStatus = goNext(carousel);
          var oldActiveElement = animationStatus.oldElement;
          var newActiveElement = animationStatus.newElement;
          expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
          expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
          carousel.pause();
          expect(carousel.isPaused()).toBe(true);
          expect(carousel.getActiveIndex()).toBe(currentIndex);
          new Promise(function (resolveCh, reject) {
            setTimeout(function () {
              expect(carousel.isPaused()).toBe(true);
              expect(carousel.getActiveIndex()).toBe(currentIndex);
              resolveCh();
            }, 2000);
          }).then(function () {
            carousel.resume();
          });
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            resolve();
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }, {
    key: "itMustBeAbleToRunComplexAnimations",
    value: function itMustBeAbleToRunComplexAnimations() {
      var that = this;
      it('mustBeAbleToRunComplexAnimations', function (done) {
        function goNext(carousel) {
          return that.performGoNext(carousel, {
            slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation']
          });
        }

        function goPrevious(carousel) {
          return that.performGoPrevious(carousel, {
            slideStyles: ['sora-fade-in-animation', 'sora-offset-left-in-animation']
          }, {
            slideStyles: ['sora-fade-out-animation', 'sora-offset-left-out-animation']
          });
        }

        var divElement = that.generateBasicCarousel();
        var carousel = new _singleSlideCarousel.SingleSlideCarousel(divElement, {
          index: 0
        });
        document.body.appendChild(divElement);
        var executionPromise = new Promise(function (resolve, reject) {
          var animationStatus = goNext(carousel);
          var oldActiveElement = animationStatus.oldElement;
          var newActiveElement = animationStatus.newElement;
          expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
          expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
          Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
            var animationStatus = goPrevious(carousel);
            var oldActiveElement = animationStatus.oldElement;
            var newActiveElement = animationStatus.newElement;
            expect(oldActiveElement).toBe(carousel.getElementsManager().getCollection()[1]);
            expect(newActiveElement).toBe(carousel.getElementsManager().getCollection()[0]);
            Promise.all([animationStatus.goActionStatus.soraHandlerStatus]).then(function () {
              resolve();
            }).catch(function (err) {
              reject(err);
            });
          }).catch(function (err) {
            reject(err);
          });
        });
        executionPromise.then(function () {
          document.body.removeChild(divElement);
          done();
        }).catch(function (err) {
          done.fail(err);
        });
      }, this.longTimeLimit);
    }
  }]);
  return SingleSlideCarouselTests;
}();

exports.SingleSlideCarouselTests = SingleSlideCarouselTests;

},{"../../carousel/carousel-base":4,"../../carousel/single-slide/single-slide-carousel":5,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionManagerTests = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _events = require("events");

var _collectionManager = require("../../collection/collection-manager");

var CollectionManagerTests =
/*#__PURE__*/
function () {
  function CollectionManagerTests() {
    (0, _classCallCheck2.default)(this, CollectionManagerTests);
  }

  (0, _createClass2.default)(CollectionManagerTests, [{
    key: "performTests",
    value: function performTests() {
      var _this = this;

      describe('Collection Manager Tests', function () {
        _this.itMustBeInitializable();

        _this.itMustBeAbleToAddElements();

        _this.itMustBeAbleToPreventDefaultActionWhenAddingElements();

        _this.itMustBeAbleToPreventDefaultActionWhenRemovingElements();

        _this.itMustBeAbleToRemoveElements();
      });
    }
  }, {
    key: "itMustBeInitializable",
    value: function itMustBeInitializable() {
      it('mustBeInitializable', function () {
        var collection = new Array();
        var eventEmitter = new _events.EventEmitter();
        var collectionManager = new _collectionManager.CollectionManager(collection, eventEmitter);
        expect(collectionManager).not.toBeNull();
        expect(collectionManager.getCollection()).toBe(collection);
      });
    }
  }, {
    key: "itMustBeAbleToAddElements",
    value: function itMustBeAbleToAddElements() {
      it('mustBeAbleToAddElements', function () {
        var collection = [2, 5, 7];
        var eventEmitter = new _events.EventEmitter();
        var expected = [2, 10, 5, 8, 7];
        var collectionManager = new _collectionManager.CollectionManager(collection, eventEmitter);
        var beforeIsEmitted = false;
        var afterIsEmitted = false;
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function (eventArgs) {
          var indexMap = eventArgs.getIndexMap();

          for (var i = 0; i < collection.length; ++i) {
            expect(indexMap[i]).not.toBeNull();
          }

          beforeIsEmitted = true;
        });
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, function (eventArgs) {
          afterIsEmitted = true;
        });
        collectionManager.insertElements({
          1: 10,
          3: 8
        });
        expect(beforeIsEmitted && afterIsEmitted).toBe(true);
        var actual = collectionManager.getCollection();
        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) {
          expect(actual[i]).toBe(expected[i]);
        }
      });
    }
  }, {
    key: "itMustBeAbleToPreventDefaultActionWhenAddingElements",
    value: function itMustBeAbleToPreventDefaultActionWhenAddingElements() {
      it('mustBeAbleToPreventDefaultActionWhenAddingElements', function () {
        var collection = [2, 5, 7];
        var eventEmitter = new _events.EventEmitter();
        var collectionManager = new _collectionManager.CollectionManager(collection, eventEmitter);
        var expected = [2, 5, 7];
        var beforeIsEmitted = false;
        var afterIsEmitted = false;
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function (eventArgs) {
          beforeIsEmitted = true;
          eventArgs.setPreventDefault();
        });
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, function (eventArgs) {
          afterIsEmitted = true;
          expect(eventArgs.getPreventDefault()).toBe(true);
        });
        collectionManager.insertElements({
          1: 10,
          3: 8
        });
        expect(beforeIsEmitted && afterIsEmitted).toBe(true);
        var actual = collectionManager.getCollection();
        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) {
          expect(actual[i]).toBe(expected[i]);
        }
      });
    }
  }, {
    key: "itMustBeAbleToPreventDefaultActionWhenRemovingElements",
    value: function itMustBeAbleToPreventDefaultActionWhenRemovingElements() {
      it('mustBeAbleToPreventDefaultActionWhenRemovingElements', function () {
        var collection = [2, 10, 5, 8, 7];
        var indexesToBeRemoved = [1, 3];
        var expected = [2, 10, 5, 8, 7];
        var eventEmitter = new _events.EventEmitter();
        var collectionManager = new _collectionManager.CollectionManager(collection, eventEmitter);
        var beforeIsEmitted = false;
        var afterIsEmitted = false;
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function (eventArgs) {
          eventArgs.setPreventDefault();
          beforeIsEmitted = true;
        });
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, function (eventArgs) {
          expect(eventArgs.getPreventDefault()).toBe(true);
          afterIsEmitted = true;
        });
        collectionManager.removeElements(indexesToBeRemoved);
        expect(beforeIsEmitted && afterIsEmitted).toBe(true);
        var actual = collectionManager.getCollection();
        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) {
          expect(actual[i]).toBe(expected[i]);
        }
      });
    }
  }, {
    key: "itMustBeAbleToRemoveElements",
    value: function itMustBeAbleToRemoveElements() {
      it('mustBeAbleToRemoveElements', function () {
        var collection = [2, 10, 5, 8, 7];
        var eventEmitter = new _events.EventEmitter();
        var collectionManager = new _collectionManager.CollectionManager(collection, eventEmitter);
        var beforeIsEmitted = false;
        var afterIsEmitted = false;
        var indexesToBeRemoved = [1, 3];
        var expected = [2, 5, 7];
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionBeforeChange, function (eventArgs) {
          var indexMap = eventArgs.getIndexMap();

          for (var _i = 0; _i < indexesToBeRemoved.length; _i++) {
            var indexToBeRemoved = indexesToBeRemoved[_i];
            expect(indexMap[indexToBeRemoved]).toBeUndefined();
          }

          beforeIsEmitted = true;
        });
        eventEmitter.on(_collectionManager.COLLECTION_MANAGER_EVENTS.collectionAfterChange, function (eventArgs) {
          afterIsEmitted = true;
        });
        collectionManager.removeElements(indexesToBeRemoved);
        expect(beforeIsEmitted && afterIsEmitted).toBe(true);
        var actual = collectionManager.getCollection();
        expect(actual.length).toBe(expected.length);

        for (var i = 0; i < expected.length; ++i) {
          expect(actual[i]).toBe(expected[i]);
        }
      });
    }
  }]);
  return CollectionManagerTests;
}();

exports.CollectionManagerTests = CollectionManagerTests;

},{"../../collection/collection-manager":8,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31,"events":36}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenMapTests = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _tokenMap = require("../../collection/token-map");

var TokenMapTests =
/*#__PURE__*/
function () {
  function TokenMapTests() {
    (0, _classCallCheck2.default)(this, TokenMapTests);
  }

  (0, _createClass2.default)(TokenMapTests, [{
    key: "performTests",
    value: function performTests() {
      var _this = this;

      describe('Token Map Tests', function () {
        _this.itMustBeInitializable();

        _this.itMustBeAbleToAddElements();

        _this.itMustBeAbleToAddAndRemoveElements();

        _this.itMustBeAbleToReuseUnusedIndexes();
      });
    }
  }, {
    key: "itMustBeInitializable",
    value: function itMustBeInitializable() {
      it('mustBeInitializable', function () {
        var map = new _tokenMap.TokenMap();
        expect(map).not.toBe(null);
        expect(map.count()).toBe(0);
      });
    }
  }, {
    key: "itMustBeAbleToAddElements",
    value: function itMustBeAbleToAddElements() {
      it('mustBeAbleToAddElements', function () {
        var map = new _tokenMap.TokenMap();
        var elementsToAdd = 64;

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.add(i)).toBe(i);
        }

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.get(i)).toBe(i);
        }

        expect(map.count()).toBe(elementsToAdd);
      });
    }
  }, {
    key: "itMustBeAbleToAddAndRemoveElements",
    value: function itMustBeAbleToAddAndRemoveElements() {
      it('mustBeAbleToAddAndRemoveElements', function () {
        var map = new _tokenMap.TokenMap();
        var elementsToAdd = 64;
        var elementsToRemove = 32;

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.add(i)).toBe(i);
        }

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.get(i)).toBe(i);
        }

        for (var i = 0; i < elementsToRemove; ++i) {
          expect(map.remove(i)).toBe(true);
        }

        expect(map.count()).toBe(elementsToAdd - elementsToRemove);
      });
    }
  }, {
    key: "itMustBeAbleToReuseUnusedIndexes",
    value: function itMustBeAbleToReuseUnusedIndexes() {
      it('mustBeAbleToReuseUnusedIndexes', function () {
        var map = new _tokenMap.TokenMap();
        var elementsToAdd = 64;
        var elementsToRemove = 32;

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.add(i)).toBe(i);
        }

        for (var i = 0; i < elementsToAdd; ++i) {
          expect(map.get(i)).toBe(i);
        }

        for (var i = 0; i < elementsToRemove; ++i) {
          expect(map.remove(i)).toBe(true);
        }

        for (var i = 0; i < elementsToRemove; ++i) {
          expect(map.add(i)).toBeLessThan(elementsToRemove);
        }

        expect(map.count()).toBe(elementsToAdd);
      });
    }
  }]);
  return TokenMapTests;
}();

exports.TokenMapTests = TokenMapTests;

},{"../../collection/token-map":10,"@babel/runtime/helpers/classCallCheck":26,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],25:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],26:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],27:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],28:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf");

var superPropBase = require("./superPropBase");

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

module.exports = _get;
},{"./getPrototypeOf":29,"./superPropBase":34}],29:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],30:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
},{"./setPrototypeOf":33}],31:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

module.exports = _interopRequireDefault;
},{}],32:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"../helpers/typeof":35,"./assertThisInitialized":25}],33:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],34:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf");

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

module.exports = _superPropBase;
},{"./getPrototypeOf":29}],35:[function(require,module,exports){
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],36:[function(require,module,exports){
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

//# sourceMappingURL=bundle.test.js.map
