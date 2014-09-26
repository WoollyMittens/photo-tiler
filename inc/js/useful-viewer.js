/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.polyfills = {

		// enabled the use of HTML5 elements in Internet Explorer
		html5 : function () {
			var a, b, elementsList;
			elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
			if (navigator.userAgent.match(/msie/gi)) {
				for (a = 0 , b = elementsList.length; a < b; a += 1) {
					document.createElement(elementsList[a]);
				}
			}
		},

		// allow array.indexOf in older browsers
		arrayIndexOf : function () {
			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0), j = this.length; i < j; i += 1) {
						if (this[i] === obj) { return i; }
					}
					return -1;
				};
			}
		},

		// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
		querySelectorAll : function () {
			if (!document.querySelectorAll) {
				document.querySelectorAll = function (a) {
					var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
					return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
				};
			}
		},

		// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
		addEventListener : function () {
			!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
				WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
					var target = this;
					registry.unshift([target, type, listener, function (event) {
						event.currentTarget = target;
						event.preventDefault = function () { event.returnValue = false; };
						event.stopPropagation = function () { event.cancelBubble = true; };
						event.target = event.srcElement || target;
						listener.call(target, event);
					}]);
					this.attachEvent("on" + type, registry[0][3]);
				};
				WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
					for (var index = 0, register; register = registry[index]; ++index) {
						if (register[0] == this && register[1] == type && register[2] == listener) {
							return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
						}
					}
				};
				WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
					return this.fireEvent("on" + eventObject.type, eventObject);
				};
			})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
		},

		// allow console.log
		consoleLog : function () {
			var overrideTest = new RegExp('console-log', 'i');
			if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
				window.console = {};
				window.console.log = function () {
					// if the reporting panel doesn't exist
					var a, b, messages = '', reportPanel = document.getElementById('reportPanel');
					if (!reportPanel) {
						// create the panel
						reportPanel = document.createElement('DIV');
						reportPanel.id = 'reportPanel';
						reportPanel.style.background = '#fff none';
						reportPanel.style.border = 'solid 1px #000';
						reportPanel.style.color = '#000';
						reportPanel.style.fontSize = '12px';
						reportPanel.style.padding = '10px';
						reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
						reportPanel.style.right = '10px';
						reportPanel.style.bottom = '10px';
						reportPanel.style.width = '180px';
						reportPanel.style.height = '320px';
						reportPanel.style.overflow = 'auto';
						reportPanel.style.zIndex = '100000';
						reportPanel.innerHTML = '&nbsp;';
						// store a copy of this node in the move buffer
						document.body.appendChild(reportPanel);
					}
					// truncate the queue
					var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
					// process the arguments
					for (a = 0, b = arguments.length; a < b; a += 1) {
						messages += arguments[a] + '<br/>';
					}
					// add a break after the message
					messages += '<hr/>';
					// output the queue to the panel
					reportPanel.innerHTML = messages + reportString;
				};
			}
		},

		// allows Object.create (https://gist.github.com/rxgx/1597825)
		objectCreate : function () {
			if (typeof Object.create !== "function") {
				Object.create = function (original) {
					function Clone() {}
					Clone.prototype = original;
					return new Clone();
				};
			}
		},

		// allows String.trim (https://gist.github.com/eliperelman/1035982)
		stringTrim : function () {
			if (!String.prototype.trim) {
				String.prototype.trim = function () { return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, ''); };
			}
			if (!String.prototype.ltrim) {
				String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
			}
			if (!String.prototype.rtrim) {
				String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
			}
			if (!String.prototype.fulltrim) {
				String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
			}
		},

		// allows localStorage support
		localStorage : function () {
			if (!window.localStorage) {
				if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)){
					window.localStorage = {
						getItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return null;
							}
							return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
						},
						key: function(nKeyId) {
							return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
						},
						setItem: function(sKey, sValue) {
							if (!sKey) {
								return;
							}
							document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
							this.length = document.cookie.match(/\=/g).length;
						},
						length: 0,
						removeItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return;
							}
							document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
							this.length--;
						},
						hasOwnProperty: function(sKey) {
							return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
						}
					};
					window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
				} else {
				    Object.defineProperty(window, "localStorage", new(function() {
				        var aKeys = [],
				            oStorage = {};
				        Object.defineProperty(oStorage, "getItem", {
				            value: function(sKey) {
				                return sKey ? this[sKey] : null;
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "key", {
				            value: function(nKeyId) {
				                return aKeys[nKeyId];
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "setItem", {
				            value: function(sKey, sValue) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "length", {
				            get: function() {
				                return aKeys.length;
				            },
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "removeItem", {
				            value: function(sKey) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        this.get = function() {
				            var iThisIndx;
				            for (var sKey in oStorage) {
				                iThisIndx = aKeys.indexOf(sKey);
				                if (iThisIndx === -1) {
				                    oStorage.setItem(sKey, oStorage[sKey]);
				                } else {
				                    aKeys.splice(iThisIndx, 1);
				                }
				                delete oStorage[sKey];
				            }
				            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
				                oStorage.removeItem(aKeys[0]);
				            }
				            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
				                aCouple = aCouples[nIdx].split(/\s*=\s*/);
				                if (aCouple.length > 1) {
				                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
				                    aKeys.push(iKey);
				                }
				            }
				            return oStorage;
				        };
				        this.configurable = false;
				        this.enumerable = true;
				    })());
				}
			}
		}

	};

	// startup
	useful.polyfills.html5();
	useful.polyfills.arrayIndexOf();
	useful.polyfills.querySelectorAll();
	useful.polyfills.addEventListener();
	useful.polyfills.consoleLog();
	useful.polyfills.objectCreate();
	useful.polyfills.stringTrim();
	useful.polyfills.localStorage();

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.polyfills;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.positions.js: A library of useful functions to ease working with screen positions.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.positions = {

		// find the dimensions of the window
		window : function (parent) {
			// define a position object
			var dimensions = {x : 0, y : 0};
			// if an alternative was given to use as a window
			if (parent && parent !== window) {
				// find the current dimensions of surrogate window
				dimensions.x = parent.offsetWidth;
				dimensions.y = parent.offsetHeight;
			} else {
				// find the current dimensions of the window
				dimensions.x = window.innerWidth || document.body.clientWidth;
				dimensions.y = window.innerHeight || document.body.clientHeight;
			}
			// return the object
			return dimensions;
		},

		// find the scroll position of an element
		document : function (parent) {
			// define a position object
			var position = {x : 0, y : 0};
			// find the current position in the document
			if (parent && parent !== window) {
				position.x = parent.scrollLeft;
				position.y = parent.scrollTop;
			} else {
				position.x = (window.pageXOffset) ?
					window.pageXOffset :
					(document.documentElement) ?
						document.documentElement.scrollLeft :
						document.body.scrollLeft;
				position.y = (window.pageYOffset) ?
					window.pageYOffset :
					(document.documentElement) ?
						document.documentElement.scrollTop :
						document.body.scrollTop;
			}
			// return the object
			return position;
		},

		// finds the position of the element, relative to the document
		object : function (node) {
			// define a position object
			var position = {x : 0, y : 0};
			// if offsetparent exists
			if (node.offsetParent) {
				// add every parent's offset
				while (node.offsetParent) {
					position.x += node.offsetLeft;
					position.y += node.offsetTop;
					node = node.offsetParent;
				}
			}
			// return the object
			return position;
		},

		// find the position of the mouse cursor relative to an element
		cursor : function (event, parent) {
			// get the event properties
			event = event || window.event;
			// define a position object
			var position = {x : 0, y : 0};
			// find the current position on the document
			position.x = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			position.y = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			// if a parent was given
			if (parent) {
				// retrieve the position of the parent
				var offsets = this.object(parent);
				// adjust the coordinates to fit the parent
				position.x -= offsets.x;
				position.y -= offsets.y;
			}
			// return the object
			return position;
		}

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.positions;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.transitions.js: A library of useful functions to ease working with CSS3 transitions.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.transitions = {

		// applies functionality to node that conform to a given CSS rule, or returns them
		select : function (input, parent) {
			var a, b, elements;
			// validate the input
			parent = parent || document;
			input = (typeof input === 'string') ? {'rule' : input, 'parent' : parent} : input;
			input.parent = input.parent || document;
			input.data = input.data || {};
			// use querySelectorAll to select elements, or defer to jQuery
			elements = (typeof(document.querySelectorAll) !== 'undefined') ?
				input.parent.querySelectorAll(input.rule) :
				(typeof(jQuery) !== 'undefined') ? jQuery(input.parent).find(input.rule).get() : [];
			// if there was a handler
			if (typeof(input.handler) !== 'undefined') {
				// for each element
				for (a = 0, b = elements.length; a < b; a += 1) {
					// run the handler and pass a unique copy of the data (in case it's a model)
					input.handler(elements[a], input.data.create());
				}
			// else assume the function was called for a list of elements
			} else {
				// return the selected elements
				return elements;
			}
		},

		// checks the compatibility of CSS3 transitions for this browser
		compatibility : function () {
			var eventName, newDiv, empty;
			// create a test div
			newDiv = document.createElement('div');
			// use various tests for transition support
			if (typeof(newDiv.style.MozTransition) !== 'undefined') { eventName = 'transitionend'; }
			try { document.createEvent('OTransitionEvent'); eventName = 'oTransitionEnd'; } catch (e) { empty = null; }
			try { document.createEvent('WebKitTransitionEvent'); eventName = 'webkitTransitionEnd'; } catch (e) { empty = null; }
			try { document.createEvent('transitionEvent'); eventName = 'transitionend'; } catch (e) { empty = null; }
			// remove the test div
			newDiv = empty;
			// pass back working event name
			return eventName;
		},

		// performs a transition between two classnames
		byClass : function (element, removedClass, addedClass, endEventHandler, jQueryDuration, jQueryEasing) {
			var replaceThis, replaceWith, endEventName, endEventFunction;
			// validate the input
			endEventHandler = endEventHandler || function () {};
			endEventName = this.compatibility();
			// turn the classnames into regular expressions
			replaceThis = new RegExp(removedClass.trim().replace(/ {2,}/g, ' ').split(' ').join('|'), 'g');
			replaceWith = new RegExp(addedClass, 'g');
			// if CSS3 transitions are available
			if (typeof endEventName !== 'undefined') {
				// set the onComplete handler and immediately remove it afterwards
				element.addEventListener(endEventName, endEventFunction = function () {
					endEventHandler();
					element.removeEventListener(endEventName, endEventFunction, true);
				}, true);
				// replace the class name
				element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
			// else if jQuery UI is available
			} else if (typeof jQuery !== 'undefined' && typeof jQuery.ui !== 'undefined') {
				// retrieve any extra information for jQuery
				jQueryDuration = jQueryDuration || 500;
				jQueryEasing = jQueryEasing || 'swing';
				// use switchClass from jQuery UI to approximate CSS3 transitions
				jQuery(element).switchClass(removedClass.replace(replaceWith, ''), addedClass, jQueryDuration, jQueryEasing, endEventHandler);
			// if all else fails
			} else {
				// just replace the class name
				element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
				// and call the onComplete handler
				endEventHandler();
			}
		},

		// adds the relevant browser prefix to a style property
		prefix : function (property) {
			// pick the prefix that goes with the browser
			return (navigator.userAgent.match(/webkit/gi)) ? 'webkit' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/firefox/gi)) ? 'Moz' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/microsoft/gi)) ? 'ms' + property.substr(0, 1).toUpperCase() + property.substr(1):
				(navigator.userAgent.match(/opera/gi)) ? 'O' + property.substr(0, 1).toUpperCase() + property.substr(1):
				property;
		},

		// applies a list of rules
		byRules : function (element, rules, endEventHandler) {
			var rule, endEventName, endEventFunction;
			// validate the input
			rules.transitionProperty = rules.transitionProperty || 'all';
			rules.transitionDuration = rules.transitionDuration || '300ms';
			rules.transitionTimingFunction = rules.transitionTimingFunction || 'ease';
			endEventHandler = endEventHandler || function () {};
			endEventName = this.compatibility();
			// if CSS3 transitions are available
			if (typeof endEventName !== 'undefined') {
				// set the onComplete handler and immediately remove it afterwards
				element.addEventListener(endEventName, endEventFunction = function () {
					endEventHandler();
					element.removeEventListener(endEventName, endEventFunction, true);
				}, true);
				// for all rules
				for (rule in rules) {
					if (rules.hasOwnProperty(rule)) {
						// implement the prefixed value
						element.style[this.compatibility(rule)] = rules[rule];
						// implement the value
						element.style[rule] = rules[rule];
					}
				}
			// else if jQuery is available
			} else if (typeof jQuery !== 'undefined') {
				var jQueryEasing, jQueryDuration;
				// pick the equivalent jQuery animation function
				jQueryEasing = (rules.transitionTimingFunction.match(/ease/gi)) ? 'swing' : 'linear';
				jQueryDuration = parseInt(rules.transitionDuration.replace(/s/g, '000').replace(/ms/g, ''), 10);
				// remove rules that will make Internet Explorer complain
				delete rules.transitionProperty;
				delete rules.transitionDuration;
				delete rules.transitionTimingFunction;
				// use animate from jQuery
				jQuery(element).animate(
					rules,
					jQueryDuration,
					jQueryEasing,
					endEventHandler
				);
			// else
			} else {
				// for all rules
				for (rule in rules) {
					if (rules.hasOwnProperty(rule)) {
						// implement the prefixed value
						element.style[this.compatibility(rule)] = rules[rule];
						// implement the value
						element.style[rule] = rules[rule];
					}
				}
				// call the onComplete handler
				endEventHandler();
			}
		}

	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.transitions;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Automatic = function (parent) {
		this.root = parent;
		this.parent = parent;
		this.setup = function () {};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Automatic;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Figures_Mouse = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.x = null;
		this.y = null;
		this.sensitivity = null;
		this.treshold = null;
		this.flick = null;
		this.delay = null;
		// mouse wheel controls
		this.wheel = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				cfg.status.zoom = cfg.status.zoom * cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				cfg.status.zoom = cfg.status.zoom / cfg.magnification;
			}
			// temporarily disable streaming for a while to avoid flooding
			cfg.status.stream = false;
			clearTimeout(this.delay);
			this.delay = setTimeout(function () {
				cfg.status.stream = true;
				root.update();
			}, 500);
			// call for a redraw
			root.update();
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// store the touch positions
			this.x = event.pageX || event.x;
			this.y = event.pageY || event.y;
			// calculate the sensitivity
			this.treshold = cfg.status.cover.offsetWidth / 10;
			this.flick = cfg.status.cover.offsetWidth * 0.6;
			// cancel the click
			event.preventDefault();
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (this.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var y = event.pageY || event.y;
				var xDelta = this.x - x;
				var yDelta = this.y - y;
				// if the image was zoomed in
				if (cfg.status.zoom > 1) {
					// calculate the drag distance into %
					cfg.status.pan.x -= xDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetWidth;
					cfg.status.pan.y -= yDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetHeight;
					// reset the distance
					this.x = x;
					this.y = y;
					// order a redraw
					root.update();
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > this.treshold && cfg.spin === 'rotation') ||
					Math.abs(xDelta) > this.flick
				) {
					// increase the spin
					cfg.status.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (cfg.spin === 'rotation') {
						// loop the value if needed
						if (cfg.status.index >= cfg.status.figures.length) {
							cfg.status.index = 1;
						}
						// loop the value if needed
						if (cfg.status.index <= 0) {
							cfg.status.index = cfg.status.figures.length - 1;
						}
					}
					// reset the distance
					this.x = x;
					this.y = y;
					// order a redraw
					root.update();
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there was a motion
			if (this.x !== null) {
				// order a redraw
				root.update();
			}
			// clear the positions
			this.x = null;
			this.y = null;
			// cancel the click
			event.preventDefault();
		};
		this.mirror = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// retrieve the mouse position
			var pos = useful.positions.cursor(event, cfg.status.cover);
			// measure the exact location of the interaction
			cfg.status.pos.x = pos.x;
			cfg.status.pos.y = pos.y;
			// order a redraw
			root.update();
			// cancel the scrolling
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Figures_Mouse;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Figures_Redraw = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.validate = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// reset the stored limits
			cfg.status.atMinZoom = false;
			cfg.status.atMaxZoom = false;
			cfg.status.atMinLeaf = false;
			cfg.status.atMaxLeaf = false;
			// check the zoom level
			var minZoom = (cfg.zoom !== 'static') ? (1 / cfg.lens) : 1;
			if (cfg.status.zoom <= minZoom) {
				cfg.status.zoom = minZoom;
				cfg.status.atMinZoom = true;
			}
			if (cfg.status.index <= 1) {
				cfg.status.index = 1;
				cfg.status.atMinLeaf = true;
			}
			if (cfg.status.index >= cfg.status.figures.length) {
				cfg.status.index = cfg.status.figures.length - 1;
				cfg.status.atMaxLeaf = true;
			}
		};
		this.calculate = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// calculate dimensions for a given zoom level
			this.canvasWidth = cfg.status.canvas.offsetWidth;
			this.canvasHeight = cfg.status.canvas.offsetHeight;
			this.canvasLeft = cfg.status.pos.x - this.canvasWidth / 2;
			this.canvasTop = cfg.status.pos.y - this.canvasHeight / 2;
			this.maxWidth = cfg.widths[cfg.status.index] * (cfg.rights[cfg.status.index] - cfg.lefts[cfg.status.index]);
			this.maxHeight = cfg.heights[cfg.status.index] * (cfg.bottoms[cfg.status.index] - cfg.tops[cfg.status.index]);
			this.figureAspect = this.maxWidth / this.maxHeight;
			this.figureWidth = this.canvasHeight * this.figureAspect * cfg.status.zoom;
			this.figureHeight = this.canvasHeight * cfg.status.zoom;
			this.figureLeft = (cfg.status.pan.x - 0.5) * this.canvasWidth;
			this.figureTop = (cfg.status.pan.y - 0.5) * this.canvasHeight;
			this.overscanLeft = (this.figureWidth - this.canvasWidth) / 2;
			this.overscanTop = (this.figureHeight - this.canvasHeight) / 2;
			this.offsetLeft = this.overscanLeft - this.figureLeft;
			this.offsetTop = this.overscanTop - this.figureTop;
			this.minPanLeft = -this.overscanLeft / this.canvasWidth + 0.5;
			this.maxPanLeft = this.overscanLeft / this.canvasWidth + 0.5;
			this.minPanTop = -this.overscanTop / this.canvasHeight + 0.5;
			this.maxPanTop = this.overscanTop / this.canvasHeight + 0.5;
			this.maxZoom = this.maxHeight / this.canvasHeight;
			// extra dimensions for non static zooms
			if (cfg.zoom !== 'static') {
				this.backgroundWidth = cfg.status.background.offsetWidth;
				this.backgroundHeight = cfg.status.background.offsetHeight;
				this.backgroundLeft = (this.backgroundHeight * this.figureAspect - this.backgroundWidth) / 2;
				this.backgroundTop = 0;
			}
		};
		this.normalise = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// normalise the figure position
			if (this.figureWidth >= this.maxWidth || this.figureHeight >= this.maxHeight) {
				this.figureWidth = this.maxWidth;
				this.figureHeight = this.maxHeight;
				cfg.status.zoom = this.maxZoom;
				cfg.status.atMaxZoom = true;
			}
			if (this.figureLeft > this.overscanLeft) {
				this.figureLeft = this.overscanLeft;
				cfg.status.pan.x = this.maxPanLeft;
			}
			if (this.figureLeft < -this.overscanLeft) {
				this.figureLeft = -this.overscanLeft;
				cfg.status.pan.x = this.minPanLeft;
			}
			if (this.figureTop > this.overscanTop) {
				this.figureTop = this.overscanTop;
				cfg.status.pan.y = this.maxPanTop;
			}
			if (this.figureTop < -this.overscanTop) {
				this.figureTop = -this.overscanTop;
				cfg.status.pan.y = this.minPanTop;
			}
			if (this.figureHeight < this.canvasHeight) {
				this.figureWidth = this.canvasHeight / this.maxHeight * this.maxWidth;
				this.figureHeight = this.canvasHeight;
				cfg.status.zoom = 1;
				cfg.status.pan.y = 0.5;
			}
			if (this.figureWidth < this.canvasWidth) {
				this.figureLeft = 0;
				cfg.status.pan.x = 0.5;
			}
		};
		this.canvas = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// figure out the relevant movement
			switch (cfg.zoom) {
			case 'lens' :
				var fraction, extra, range, offset;
				// set the horizontal shift
				fraction = (1 - (cfg.status.pos.x + this.backgroundLeft) / (this.backgroundHeight * this.figureAspect));
				extra = this.canvasWidth / this.figureWidth;
				range = this.maxPanLeft - this.minPanLeft + extra * 2;
				offset = this.minPanLeft - extra;
				cfg.status.pan.x = fraction * range + offset;
				// set the vertical shift
				fraction = (1 - (cfg.status.pos.y + this.backgroundTop) / this.backgroundHeight);
				extra = this.canvasHeight / this.figureHeight;
				range = this.maxPanTop - this.minPanTop + extra * 2;
				offset = this.minPanTop - extra;
				cfg.status.pan.y = fraction * range + offset;
				// set the positions
				cfg.status.canvas.style.left = parseInt(this.canvasLeft, 10) + 'px';
				cfg.status.canvas.style.top = parseInt(this.canvasTop, 10) + 'px';
				break;
			case 'top' :
				cfg.status.canvas.style.left = '0px';
				cfg.status.canvas.style.top = '-' + cfg.status.canvas.offsetHeight + 'px';
				break;
			case 'right' :
				cfg.status.canvas.style.left = cfg.status.canvas.offsetWidth + 'px';
				cfg.status.canvas.style.top = '0px';
				break;
			case 'bottom' :
				cfg.status.canvas.style.left = '0px';
				cfg.status.canvas.style.top = cfg.status.canvas.offsetHeight + 'px';
				break;
			case 'left' :
				cfg.status.canvas.style.left = '-' + cfg.status.canvas.offsetHeight + 'px';
				cfg.status.canvas.style.top = '0px';
				break;
			}
			// show the appropriate cursor
			if (cfg.zoom === 'lens') {
				cfg.status.cover.style.cursor = 'crosshair';
			} else if (cfg.status.zoom > 1 || cfg.spin === 'rotation') {
				cfg.status.cover.style.cursor = 'move';
			} else {
				cfg.status.cover.style.cursor = 'auto';
			}
		};
		this.figures = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// use CSS3 transforms if allowed
			if (root.cfg.transforms) {
				// calculate the transformation properties
				var x = (cfg.status.pan.x * 100 - 50) / this.figureAspect,
					y = cfg.status.pan.y * 100 - 50,
					z =	cfg.status.zoom;
				// formulate the css rule
				var transformation = 'translate(' + x + '%, ' + y + '%) scale(' + z + ', ' + z + ')';
				// set the transformation styles
				cfg.status.figures[cfg.status.index].style.msTransform = transformation;
				cfg.status.figures[cfg.status.index].style.webkitTransform = transformation;
				cfg.status.figures[cfg.status.index].style.transform = transformation;
			// else use CSS2
			} else {
				// set the zoomed figure dimensions
				cfg.status.figures[cfg.status.index].style.left = (cfg.status.pan.x * 100) + '%';
				cfg.status.figures[cfg.status.index].style.top = (cfg.status.pan.y * 100) + '%';
				cfg.status.figures[cfg.status.index].style.marginLeft = parseInt(this.figureWidth / -2, 10) + 'px';
				cfg.status.figures[cfg.status.index].style.marginTop = parseInt(this.figureHeight / -2, 10) + 'px';
				cfg.status.figures[cfg.status.index].style.width = parseInt(this.figureWidth, 10) + 'px';
				cfg.status.figures[cfg.status.index].style.height = parseInt(this.figureHeight, 10) + 'px';
			}
		};
		this.create = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// if streaming new tiles is allowed
			if (
				// allow/disallow streaming switch
				cfg.status.stream &&
				// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
				cfg.status.zoom > 1
			) {
				// divide the dimension into tiles
				var horizontalTiles = Math.ceil(this.figureWidth / cfg.grid);
				var verticalTiles = Math.ceil(this.figureHeight / cfg.grid);
				var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
					tileId = cfg.figures[cfg.status.index],
					tileZoom = cfg.status.zoom.toString().replace('.', 'D'),
					cropLeft = cfg.lefts[cfg.status.index],
					cropTop = cfg.tops[cfg.status.index],
					cropWidth = cfg.rights[cfg.status.index] - cropLeft,
					cropHeight = cfg.bottoms[cfg.status.index] - cropTop;
				// for all columns
				for (var x = 0; x < horizontalTiles; x += 1) {
					// for all rows
					for (var y = 0; y < verticalTiles; y += 1) {
						// formulate the tile name
						tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
						// if the tile is within the bounds of the canvas
						if (
							(x + 1) * cfg.grid >= this.offsetLeft &&
							(x) * cfg.grid <= this.offsetLeft + this.canvasWidth &&
							(y + 1) * cfg.grid >= this.offsetTop &&
							(y) * cfg.grid <= this.offsetTop + this.canvasHeight
						) {
							// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
							if (!cfg.status.tiles[tileName]) {
								// count the new tile
								cfg.status.count += 1;
								// create a tile at this zoom level
								cfg.status.tiles[tileName] = {
									'object' : document.createElement('img'),
									'figure' : cfg.status.index,
									'zoom' : cfg.status.zoom,
									'x' : x,
									'y' : y,
									'index' : cfg.status.count
								};
								// reveal it onload
								cfg.status.tiles[tileName].object.className = 'tile_hidden';
								this.onTileLoad(cfg.status.tiles[tileName].object);
								// calculate the positions
								tileWidth = cfg.grid;
								tileHeight = cfg.grid;
								tileTop = (y * tileHeight / this.figureHeight);
								tileRight = ((x + 1) * tileWidth / this.figureWidth);
								tileBottom = ((y + 1) * tileHeight / this.figureHeight);
								tileLeft = (x * tileWidth / this.figureWidth);
								// normalise the sizes
								if (tileRight > 1) {
									tileWidth = Math.round((1 - tileLeft) / (tileRight - tileLeft) * tileWidth);
									tileRight = 1;
								}
								if (tileBottom > 1) {
									tileHeight = Math.round((1 - tileTop) / (tileBottom - tileTop) * tileHeight);
									tileBottom = 1;
								}
								// costruct the tile url
								cfg.status.tiles[tileName].object.className = 'tile_hidden';
								cfg.status.tiles[tileName].object.src = cfg.imageslice
									.replace(cfg.regSrc, cfg.figures[cfg.status.index])
									.replace(cfg.regWidth, tileWidth)
									.replace(cfg.regHeight, tileHeight)
									.replace(cfg.regLeft, tileLeft * cropWidth + cropLeft)
									.replace(cfg.regTop, tileTop * cropHeight + cropTop)
									.replace(cfg.regRight, tileRight * cropWidth + cropLeft)
									.replace(cfg.regBottom, tileBottom * cropHeight + cropTop);
								// position it on the grid
								cfg.status.tiles[tileName].object.style.position = 'absolute';
								cfg.status.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
								cfg.status.tiles[tileName].object.style.top = (tileTop * 100) + '%';
								cfg.status.tiles[tileName].object.style.width = (tileWidth / this.figureWidth * 100) + '%';
								cfg.status.tiles[tileName].object.style.height = (tileHeight / this.figureHeight * 100) + '%';
								cfg.status.tiles[tileName].object.style.zIndex = parseInt(cfg.status.zoom * 100, 10);
								// add it to the figure
								cfg.status.figures[cfg.status.index].appendChild(cfg.status.tiles[tileName].object);
							}
						}
					}
				}
			}
		};
		this.display = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// for all tiles
			var tile = '', checkedTile;
			for (tile in cfg.status.tiles) {
				// validate
				if (cfg.status.tiles.hasOwnProperty(tile)) {
					// get the target tile
					checkedTile = cfg.status.tiles[tile];
					// if this is a surplus tile
					if (cfg.status.tiles[tile].index < cfg.status.count - cfg.cache) {
						// remove it
						cfg.status.tiles[tile].object.parentNode.removeChild(cfg.status.tiles[tile].object);
						delete cfg.status.tiles[tile];
					// if the tile is within the bounds of the canvas
					} else if (
						(checkedTile.x + 1) * cfg.grid >= this.offsetLeft &&
						(checkedTile.x) * cfg.grid <= this.offsetLeft + this.canvasWidth &&
						(checkedTile.y + 1) * cfg.grid >= this.offsetTop &&
						(checkedTile.y) * cfg.grid <= this.offsetTop + this.canvasHeight &&
						checkedTile.zoom <= cfg.status.zoom
					) {
						// display the tile
						checkedTile.object.style.display = 'block';
					// else
					} else {
						// undisplay the tile
						checkedTile.object.style.display = 'none';
					}
				}
			}
		};
		this.spin = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// decide on the transition effect
			switch (cfg.spin) {
			// in case of a catalogue
			case 'catalogue' :
				// for all figures
				var clipWidth;
				for (var a = 1, b = cfg.status.figures.length; a < b; a += 1) {
					// clear any transition that may be in effect on this figure
					clearTimeout(cfg.status.transitions[a]);
					// measure the slide width
					clipWidth = cfg.status.figures[a].offsetWidth;
					// if this is an active slide
					if (a === cfg.status.index) {
						// if there is a zoom factor, disable the clipping
						if (cfg.status.zoom > 1) {
							cfg.status.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
						}
						// else if the figure wasn't revealed yet
						else if (cfg.status.figures[a].className !== 'figure_leafin') {
							// force the clip's start situation
							cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
							// apply the figure class
							cfg.status.figures[a].className = 'figure_leafin';
							// apply the figure style
							useful.transitions.byRules(
								cfg.status.figures[a],
								{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
								null,
								600
							);
						}
					}
					// else if this is a passive slide, but not unrevealed yet
					else if (cfg.status.figures[a].className !== 'figure_leafout') {
						// delay its return
						this.onFigureUnreveal(a, clipWidth);
						// apply the figure class
						cfg.status.figures[a].className = 'figure_leafout';
					}
				}
				break;
			// in case of a slideshow
			case 'slideshow' :
				// for all figures
				for (a = 1, b = cfg.status.figures.length; a < b; a += 1) {
					// apply the figure class
					cfg.status.figures[a].className = (a === cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
					if (cfg.zoom !== 'static') {
						cfg.status.backgrounds[a].className = (a === cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
					}
				}
				break;
			// for a generic transition
			default :
				// for all figures
				for (a = 1, b = cfg.status.figures.length; a < b; a += 1) {
					// apply the figure class
					cfg.status.figures[a].className = (a === cfg.status.index) ? 'figure_active' : 'figure_passive';
					if (cfg.zoom !== 'static') {
						cfg.status.backgrounds[a].className = (a === cfg.status.index) ? 'figure_active' : 'figure_passive';
					}
				}
			}
		};
		// handlers for the events
		this.onTileLoad = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			element.addEventListener('load', function () {
				element.className = 'tile_visible';
			}, false);
		};
		this.onFigureUnreveal = function (a, clipWidth) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			setTimeout(function () {
				// apply the figure style
				cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
				cfg.status.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
				cfg.status.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
				cfg.status.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
				cfg.status.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
				cfg.status.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
			}, 750);
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Figures_Redraw;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Figures_Touch = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.x = null;
		this.y = null;
		this.sensitivity = null;
		this.treshold = null;
		this.flick = null;
		this.delay = null;
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// store the touch positions
			this.x = [];
			this.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				this.x.push(event.touches[a].pageX);
				this.y.push(event.touches[a].pageY);
			}
			// adjust the sensitivity
			this.sensitivity = (cfg.magnification - 1) / 2 + 1;
			this.treshold = cfg.status.cover.offsetWidth / 10;
			this.flick = cfg.status.cover.offsetWidth * 0.6;
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if there is a touch in progress
			if (this.x !== null) {
				// store the touch positions
				var x = [];
				var y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
					y.push(event.touches[a].pageY);
				}
				var xDelta = this.x[0] - x[0];
				var yDelta = this.y[0] - y[0];
				// if there was a pinch motion
				if (x.length > 1 && this.x.length > 1) {
					// if the distances decreased
					if (
						Math.abs(x[0] - x[1]) + Math.abs(y[0] - y[1]) <
						Math.abs(this.x[0] - this.x[1]) + Math.abs(this.y[0] - this.y[1])
					) {
						// zoom out
						cfg.status.zoom = cfg.status.zoom / this.sensitivity;
					// else
					} else {
						// zoom in
						cfg.status.zoom = cfg.status.zoom * this.sensitivity;
					}
					// reset the distance
					this.x[0] = x[0];
					this.y[0] = y[0];
					this.x[1] = x[1];
					this.y[1] = y[1];
					// temporarily disable streaming for a while to avoid flooding
					cfg.status.stream = false;
					clearTimeout(this.delay);
					this.delay = setTimeout(function () {
						cfg.status.stream = true;
						root.update();
					}, 500);
				// else if there was a drag motion
				} else if (cfg.status.zoom > 1 || cfg.spin === 'slideshow') {
					// calculate the drag distance into %
					cfg.status.pan.x -= xDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetWidth;
					cfg.status.pan.y -= yDelta * cfg.status.zoom / cfg.status.figures[cfg.status.index].offsetHeight;
					// reset the distance
					this.x[0] = x[0];
					this.y[0] = y[0];
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > this.treshold && cfg.spin === 'rotation') ||
					Math.abs(xDelta) > this.flick
				) {
					// increase the spin
					cfg.status.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (cfg.spin === 'rotation') {
						// loop the value if needed
						if (cfg.status.index >= cfg.status.figures.length) {
							cfg.status.index = 1;
						}
						// loop the value if needed
						if (cfg.status.index <= 0) {
							cfg.status.index = cfg.status.figures.length - 1;
						}
					}
					// reset the distance
					this.x[0] = x[0];
					this.y[0] = y[0];
					// order a redraw
					root.update();
				}
				// order a redraw
				root.update();
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// clear the positions
			this.x = null;
			this.y = null;
			// order a redraw
			root.update();
		};
		this.mirror = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// retrieve the touch position
			var pos = useful.positions.touch(event, cfg.status.cover);
			// measure the exact location of the interaction
			cfg.status.pos.x = pos.x;
			cfg.status.pos.y = pos.y;
			// order a redraw
			root.update();
			// cancel the scrolling
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Figures_Touch;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Figures = function (parent) {
		this.root = parent;
		this.parent = parent;
		// builds the figure
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// enable the streaming of images
			cfg.status.stream = true;
			// set up a counter for the amount of images streamed
			cfg.status.count = 0;
			// create a storage place for the transition timeouts
			cfg.status.transitions = [];
			// create a wrapper for overflow management
			cfg.status.wrapper = document.createElement('div');
			cfg.status.wrapper.className = 'wrapper';
			// force the height of the wrapper if desired
			cfg.status.wrapper.style.height = (cfg.divide * 100) + '%';
			// create a canvas layer to contain the images
			cfg.status.canvas = document.createElement('div');
			cfg.status.canvas.className = 'canvas';
			// add the canvas to the parent
			cfg.status.wrapper.appendChild(cfg.status.canvas);
			// add the figures to the construct
			this.addFigures();
			// add the cover layer to the construct
			this.addCover();
			// add the lens to the construct
			this.addLens();
			// add the wrapper to the parent
			root.obj.appendChild(cfg.status.wrapper);
			// add a place to contain the tiles
			cfg.status.tiles = {};
		};
		// add the figures to the construct
		this.addFigures = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// for all figures in the root.cfg
			cfg.status.figures = [0];
			var newImage, newWidth, newHeight, croppedWidth, croppedHeight;
			for (var a = 1, b = cfg.figures.length; a < b; a += 1) {
				// calculate the cropped dimensions
				croppedWidth = cfg.widths[a] * (cfg.rights[a] - cfg.lefts[a]);
				croppedHeight = cfg.heights[a] * (cfg.bottoms[a] - cfg.tops[a]);
				// calculate the starting dimensions
				newHeight = root.obj.offsetHeight * cfg.divide;
				newWidth = newHeight / croppedHeight * croppedWidth;
				// create a new slide
				cfg.status.figures[a] = document.createElement('figure');
				cfg.status.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
				cfg.status.figures[a].style.width = parseInt(newWidth, 10) + 'px';
				cfg.status.figures[a].style.height = parseInt(newHeight, 10) + 'px';
				cfg.status.figures[a].style.left = (cfg.status.pan.x * 100) + '%';
				cfg.status.figures[a].style.top = (cfg.status.pan.y * 100) + '%';
				cfg.status.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
				cfg.status.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
				// add the default image to the slide
				newImage = document.createElement('img');
				// load starting images
				newImage.src = cfg.imageslice
					.replace(cfg.regSrc, cfg.figures[a])
					.replace(cfg.regWidth, parseInt(newWidth, 10))
					.replace(cfg.regHeight, parseInt(newHeight, 10))
					.replace(cfg.regLeft, cfg.lefts[a])
					.replace(cfg.regTop, cfg.tops[a])
					.replace(cfg.regRight, cfg.rights[a])
					.replace(cfg.regBottom, cfg.bottoms[a]);
				// set the image properties
				newImage.style.width = '100%';
				newImage.style.height = '100%';
				newImage.className = 'zoom_0';
				if (cfg.descriptions) {
					newImage.setAttribute('alt', cfg.descriptions[a]);
				} else {
					newImage.setAttribute('alt', '');
				}
				if (cfg.titles) {
					newImage.setAttribute('title', cfg.titles[a]);
				} else {
					newImage.setAttribute('title', '');
				}
				cfg.status.figures[a].appendChild(newImage);
				// insert the new nodes
				cfg.status.canvas.appendChild(cfg.status.figures[a]);
			}
		};
		// add the lens to the construct
		this.addLens = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// clone the initial figure into a background layer on non-static zooms
			if (cfg.zoom !== 'static') {
				// create a background layer to contain all the low res backgrounds
				cfg.status.background = cfg.status.canvas.cloneNode(true);
				cfg.status.background.className = 'background';
				// insert the background into the parent
				cfg.status.wrapper.insertBefore(cfg.status.background, cfg.status.canvas);
				// apply a lens style to the canvas
				cfg.status.canvas.className += ' canvas_lens canvas_hidden';
				// set a starting zoom factor
				cfg.status.zoom = cfg.max;
				// set the lens dimensions
				if (cfg.zoom === 'lens') {
					var lensSize = root.obj.offsetWidth * cfg.lens;
					cfg.status.canvas.style.width = lensSize + 'px';
					cfg.status.canvas.style.height = lensSize + 'px';
					if (navigator.userAgent.match(/firefox|webkit/gi)) {
						cfg.status.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
					}
				}
				// store the backgrounds
				var backgroundFigures = cfg.status.background.getElementsByTagName('figure');
				cfg.status.backgrounds = [];
				for (var a = 0, b = backgroundFigures.length; a < b; a += 1) {
					cfg.status.backgrounds[a + 1] = backgroundFigures[a];
					cfg.status.backgrounds[a + 1].style.display = 'block';
					cfg.status.backgrounds[a + 1].style.position = 'absolute';
				}
			}
		};
		// add the cover to the construct
		this.addCover = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add a top layer for uninterrupted touch events
			cfg.status.cover = document.createElement('div');
			cfg.status.cover.className = 'cover';
			cfg.status.wrapper.appendChild(cfg.status.cover);
			// add the mouse events for the cover layer
			this.onCoverScroll(cfg.status.cover);
			this.onCoverMouse(cfg.status.cover);
			this.onCoverTouch(cfg.status.cover);
		};
		// set the mouse wheel events
		this.onCoverScroll = function (cover) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var _this = this;
			cover.addEventListener('mousewheel', function (event) {
				_this.mouse.wheel(event);
			}, false);
			cover.addEventListener('DOMMouseScroll', function (event) {
				_this.mouse.wheel(event);
			}, false);
		};
		// add the mouse events
		this.onCoverMouse = function (cover) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// set the right interactions for the zoom mode
			var _this = this;
			if (cfg.zoom !== 'static') {
				cover.addEventListener('mousemove', function (event) {
					_this.mouse.mirror(event);
				}, false);
			} else {
				cover.addEventListener('mousedown', function (event) {
					_this.mouse.start(event);
				}, false);
				cover.addEventListener('mousemove', function (event) {
					_this.mouse.move(event);
				}, false);
				cover.addEventListener('mouseup', function (event) {
					_this.mouse.end(event);
				}, false);
				cover.addEventListener('mouseout', function (event) {
					_this.mouse.end(event);
				}, false);
			}
		};
		// add the touch events
		this.onCoverTouch = function (cover) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var _this = this;
			// set the right interactions for the zoom mode
			if (cfg.zoom !== 'static') {
				cover.addEventListener('move', function (event) {
					_this.touch.mirror(event);
				}, false);
			} else {
				cover.addEventListener('touchstart', function (event) {
					_this.touch.start(event);
				}, false);
				cover.addEventListener('touchmove', function (event) {
					_this.touch.move(event);
				}, false);
				cover.addEventListener('touchend', function (event) {
					_this.touch.end(event);
				}, false);
			}
		};
		// redraws the figure
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// validate the input
			this.redraw.validate();
			// calculate the values
			this.redraw.calculate();
			// normalise the values
			this.redraw.normalise();
			// move the canvas around
			this.redraw.canvas();
			// move the figure around
			this.redraw.figures();
			// create new tiles
			this.redraw.create();
			// display existing tiles
			this.redraw.display();
			// spin the correct figure into view
			this.redraw.spin();
		};
		// redrawing functionality
		this.redraw = new useful.Viewer_Figures_Redraw(this);
		// mouse controls
		this.mouse = new useful.Viewer_Figures_Mouse(this);
		// touch screen controls
		this.touch = new useful.Viewer_Figures_Touch(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Figures;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Leaf_Build = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.indicator = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the page indicator
			cfg.status.menus.leafPage = document.createElement('form');
			cfg.status.menus.leafPageInput = document.createElement('input');
			cfg.status.menus.leafPageInput.setAttribute('type', 'text');
			cfg.status.menus.leafPageCount = document.createElement('span');
			cfg.status.menus.leafPageCount.className = 'count';
			cfg.status.menus.leafPageSubmit = document.createElement('button');
			cfg.status.menus.leafPageSubmit.setAttribute('type', 'submit');
			cfg.status.menus.leafPageSubmit.style.position = 'absolute';
			cfg.status.menus.leafPageSubmit.style.left = '-999em';
			cfg.status.menus.leafPage.appendChild(cfg.status.menus.leafPageInput);
			cfg.status.menus.leafPage.appendChild(cfg.status.menus.leafPageCount);
			element.appendChild(cfg.status.menus.leafPage);
			cfg.status.menus.leafPageInput.addEventListener('change', function (event) {
				parent.typed(event);
			}, false);
			cfg.status.menus.leafPage.addEventListener('submit', function (event) {
				parent.typed(event);
				event.preventDefault();
			}, false);
		};
		this.resetter = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the reset button
			cfg.status.menus.leafReset = document.createElement('button');
			cfg.status.menus.leafReset.className = 'reset';
			cfg.status.menus.leafResetIcon = document.createElement('span');
			cfg.status.menus.leafResetIcon.innerHTML = 'Reset view';
			cfg.status.menus.leafReset.appendChild(cfg.status.menus.leafResetIcon);
			element.appendChild(cfg.status.menus.leafReset);
			cfg.status.menus.leafReset.addEventListener('click', function (event) {
				parent.reset(event);
			}, false);
		};
		this.increaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the next button
			cfg.status.menus.leafIn = document.createElement('button');
			cfg.status.menus.leafIn.className = 'increase';
			cfg.status.menus.leafInIcon = document.createElement('span');
			cfg.status.menus.leafInIcon.innerHTML = 'Leaf forward';
			cfg.status.menus.leafIn.appendChild(cfg.status.menus.leafInIcon);
			element.appendChild(cfg.status.menus.leafIn);
			cfg.status.menus.leafIn.addEventListener('click', function (event) {
				parent.increase(event);
			}, false);
		};
		this.decreaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the previous button
			cfg.status.menus.leafOut = document.createElement('button');
			cfg.status.menus.leafOut.className = 'decrease';
			cfg.status.menus.leafOutIcon = document.createElement('span');
			cfg.status.menus.leafOutIcon.innerHTML = 'Leaf back';
			cfg.status.menus.leafOut.appendChild(cfg.status.menus.leafOutIcon);
			element.appendChild(cfg.status.menus.leafOut);
			cfg.status.menus.leafOut.addEventListener('click', function (event) {
				parent.decrease(event);
			}, false);
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Leaf_Build;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Leaf = function (parent) {
		this.root = parent;
		this.parent = parent;
		// build the leafing toolbar
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the menu
			cfg.status.menus = cfg.status.menus || {};
			cfg.status.menus.leafMenu = document.createElement('menu');
			cfg.status.menus.leafMenu.className = 'slider leaf';
			cfg.status.menus.leafMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
			// create the page indicator
			this.build.indicator(cfg.status.menus.leafMenu);
			// create the reset button
			this.build.resetter(cfg.status.menus.leafMenu);
			// create the next button
			this.build.increaser(cfg.status.menus.leafMenu);
			// create the previous button
			this.build.decreaser(cfg.status.menus.leafMenu);
			// add the menu to the interface
			root.obj.appendChild(cfg.status.menus.leafMenu);
		};
		// updates the leafing toolbar
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// fill in the current page
			cfg.status.menus.leafPageInput.value = cfg.status.index;
			// fill in the page total
			cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(cfg.status.figures.length - 1);
		};
		this.increase = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// decrease the spin index
			cfg.status.index += 1;
			// look if needed
			if (cfg.toolbars === 'buttons') {
				// loop the value if needed
				if (cfg.status.index >= cfg.status.figures.length) {
					cfg.status.index = 1;
				}
				// loop the value if needed
				if (cfg.status.index <= 0) {
					cfg.status.index = cfg.status.figures.length - 1;
				}
			}
			// redraw
			root.update();
			// cancel the click
			event.preventDefault();
		};
		this.decrease = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// decrease the spin index
			cfg.status.index -= 1;
			// redraw
			root.update();
			// cancel the click
			event.preventDefault();
		};
		this.typed = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the typed number
			var number = parseInt(cfg.status.menus.leafPageInput.value, 10);
			// if the typed number is acceptable
			if (!isNaN(number)) {
				// accept the value
				cfg.status.index = number;
			}
			// update the interface
			root.update();
		};
		this.reset = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// reset the zoom level
			cfg.status.zoom = (cfg.zoom !== 'static') ? cfg.max : 1;
			// redraw
			root.update();
			// cancel the click
			event.preventDefault();
		};
		// build functionality
		this.build = new useful.Viewer_Leaf_Build(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Leaf;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Spin_Build = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.slider = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the slider to the menu
			cfg.status.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			cfg.status.menus.spinIndicator.className = 'meter';
			cfg.status.menus.spinIndicator.setAttribute('min', 1);
			cfg.status.menus.spinIndicator.setAttribute('max', cfg.figures.length);
			cfg.status.menus.spinIndicator.setAttribute('value', cfg.status.index);
			cfg.status.menus.spinSlider = document.createElement('div');
			cfg.status.menus.spinSliderIcon = document.createElement('span');
			cfg.status.menus.spinSliderIcon.innerHTML = cfg.status.index;
			cfg.status.menus.spinSlider.appendChild(cfg.status.menus.spinSliderIcon);
			cfg.status.menus.spinIndicator.appendChild(cfg.status.menus.spinSlider);
			element.appendChild(cfg.status.menus.spinIndicator);
		};
		this.cover = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add a touch cover to the menu
			cfg.status.menus.spinCover = document.createElement('div');
			cfg.status.menus.spinCover.className = 'cover';
			element.appendChild(cfg.status.menus.spinCover);
			var sims = cfg.status.menus.spinCover;
			// add the event handler
			sims.addEventListener('mousewheel', function (event) {
				parent.mouse.wheel(event);
			}, false);
			sims.addEventListener('DOMMouseScroll', function (event) {
				parent.mouse.wheel(event);
			}, false);
			sims.addEventListener('mousedown', function (event) {
				parent.mouse.start(event);
			}, false);
			sims.addEventListener('mousemove', function (event) {
				parent.mouse.move(event);
			}, false);
			sims.addEventListener('mouseup', function (event) {
				parent.mouse.end(event);
			}, false);
			sims.addEventListener('mouseout', function (event) {
				parent.mouse.end(event);
			}, false);
			// add the touch events
			sims.addEventListener('touchstart', function (event) {
				parent.touch.start(event);
			}, false);
			sims.addEventListener('touchmove', function (event) {
				parent.touch.move(event);
			}, false);
			sims.addEventListener('touchend', function (event) {
				parent.touch.end(event);
			}, false);
		};
		this.increaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the increase button
			cfg.status.menus.spinIn = document.createElement('button');
			cfg.status.menus.spinIn.className = 'increase';
			cfg.status.menus.spinInIcon = document.createElement('span');
			cfg.status.menus.spinInIcon.innerHTML = 'Spin left';
			cfg.status.menus.spinIn.appendChild(cfg.status.menus.spinInIcon);
			element.appendChild(cfg.status.menus.spinIn);
			cfg.status.menus.spinIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				parent.increase();
				// cancel streaming
				cfg.status.stream = false;
				// repeat
				cfg.status.menus.spinInRepeat = setInterval(function () { parent.increase(); }, 100);
				// cancel this event
				event.preventDefault();
			}, false);
			cfg.status.menus.spinIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(cfg.status.menus.spinInRepeat);
				// allow streaming
				cfg.status.stream = true;
				// redraw
				root.update();
			}, false);
		};
		this.decreaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the decrease button
			cfg.status.menus.spinOut = document.createElement('button');
			cfg.status.menus.spinOut.className = 'decrease';
			cfg.status.menus.spinOutIcon = document.createElement('span');
			cfg.status.menus.spinOutIcon.innerHTML = 'Spin right';
			cfg.status.menus.spinOut.appendChild(cfg.status.menus.spinOutIcon);
			element.appendChild(cfg.status.menus.spinOut);
			cfg.status.menus.spinOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				parent.decrease();
				// cancel streaming
				cfg.status.stream = false;
				// repeat
				cfg.status.menus.spinOutRepeat = setInterval(function () { parent.decrease(); }, 100);
				// cancel this event
				event.preventDefault();
			}, false);
			cfg.status.menus.spinOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(cfg.status.menus.spinOutRepeat);
				// allow streaming
				cfg.status.stream = true;
				// redraw
				root.update();
			}, false);
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Spin_Build;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Spin_Mouse = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.x = null;
		this.sensitivity = null;
		this.fudge = 0.7;
		// mouse wheel controls
		this.wheel = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the spin index
				parent.increase(event);
			} else if (distance > 0) {
				// decrease the spin index
				parent.decrease(event);
			}
		};
		// mouse gesture controls
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// store the touch positions
			this.x = event.pageX || event.x;
			// calculate the sensitivity
			this.sensitivity = (cfg.status.menus.spinCover.offsetWidth - cfg.status.menus.spinIn.offsetWidth - cfg.status.menus.spinOut.offsetWidth) / cfg.status.figures.length * this.fudge;
			// cancel the click
			event.preventDefault();
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (this.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var distance = this.x - x;
				// if the draw was to the left
				if (distance < -this.sensitivity) {
					// increase the spin index
					cfg.status.index += 1;
					// reset the distance
					this.x = x;
					// order a redraw
					root.update();
				// else if the drag was to the right
				} else if (distance > this.sensitivity) {
					// decrease the spin index
					cfg.status.index -= 1;
					// reset the distance
					this.x = x;
					// order a redraw
					root.update();
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// clear the positions
			this.x = null;
			// cancel the click
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Spin_Mouse;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Spin_Touch = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.x = null;
		this.sensitivity = null;
		// mouse gesture controls
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// store the touch positions
			this.x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				this.x.push(event.touches[a].pageX);
			}
			// calculate the sensitivity
			this.sensitivity = (cfg.status.menus.spinCover.offsetWidth - cfg.status.menus.spinIn.offsetWidth - cfg.status.menus.spinOut.offsetWidth) / cfg.status.figures.length;
			// cancel the click
			event.preventDefault();
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (this.x !== null) {
				// store the touch positions
				var x = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
				}
				var distance = this.x[0] - x[0];
				// if the draw was to the left
				if (distance < -this.sensitivity) {
					// increase the spin index
					cfg.status.index += 1;
					// loop the value if needed
					if (cfg.status.index >= cfg.status.figures.length) {
						cfg.status.index = 1;
					}
					// reset the distance
					this.x[0] = x[0];
					// order a redraw
					root.update();
				// else if the drag was to the right
				} else if (distance > this.sensitivity) {
					// decrease the spin index
					cfg.status.index -= 1;
					// loop the value if needed
					if (cfg.status.index <= 0) {
						cfg.status.index = cfg.status.figures.length - 1;
					}
					// reset the distance
					this.x[0] = x[0];
					// order a redraw
					root.update();
				}
			}
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// clear the positions
			this.x = null;
			// cancel the click
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Spin_Touch;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Spin = function (parent) {
		this.root = parent;
		this.parent = parent;
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the menu
			cfg.status.menus = cfg.status.menus || {};
			cfg.status.menus.spinMenu = document.createElement('menu');
			cfg.status.menus.spinMenu.className = 'slider spin';
			cfg.status.menus.spinMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
			// add the slider to the menu
			this.build.slider(cfg.status.menus.spinMenu);
			// add a touch cover to the menu
			this.build.cover(cfg.status.menus.spinMenu);
			// add the increase button
			this.build.increaser(cfg.status.menus.spinMenu);
			// add the decrease button
			this.build.decreaser(cfg.status.menus.spinMenu);
			// add the menu to the interface
			root.obj.appendChild(cfg.status.menus.spinMenu);
		};
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// reposition the slider
			cfg.status.menus.spinSlider.style.left = ((cfg.status.index - 1) / (cfg.status.figures.length - 2) * 100) + '%';
			// update the value
			cfg.status.menus.spinIndicator.setAttribute('value', cfg.status.index);
			cfg.status.menus.spinSliderIcon.innerHTML = cfg.status.index;
		};
		this.increase = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// decrease the spin index
			cfg.status.index -= 1;
			// loop the value if needed
			if (cfg.status.index <= 0) {
				cfg.status.index = cfg.status.figures.length - 1;
			}
			// order a redraw
			root.update();
		};
		this.decrease = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// increase the spin index
			cfg.status.index += 1;
			// loop the value if needed
			if (cfg.status.index >= cfg.status.figures.length) {
				cfg.status.index = 1;
			}
			// order a redraw
			root.update();
		};
		// build functionality
		this.build = new useful.Viewer_Spin_Build(this);
		// mouse wheel controls
		this.mouse = new useful.Viewer_Spin_Mouse(this);
		// touch screen controls
		this.touch = new useful.Viewer_Spin_Touch(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Spin;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Thumbnails_Menu = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		// build the menu options
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the thumbnail controls
			cfg.status.pageMenu = document.createElement('menu');
			cfg.status.pageMenu.className = 'scroller';
			cfg.status.nextPage = document.createElement('button');
			cfg.status.nextPage.className = 'next';
			cfg.status.nextPageIcon = document.createElement('span');
			cfg.status.nextPageIcon.innerHTML = '&gt';
			cfg.status.prevPage = document.createElement('button');
			cfg.status.prevPage.className = 'previous';
			cfg.status.prevPageIcon = document.createElement('span');
			cfg.status.prevPageIcon.innerHTML = '&lt';
			cfg.status.nextPage.appendChild(cfg.status.nextPageIcon);
			cfg.status.pageMenu.appendChild(cfg.status.nextPage);
			cfg.status.prevPage.appendChild(cfg.status.prevPageIcon);
			cfg.status.pageMenu.appendChild(cfg.status.prevPage);
			cfg.status.slideNav.appendChild(cfg.status.pageMenu);
			// apply clicks to the thumbnail controls
			var _this = this;
			cfg.status.nextPage.addEventListener('click', function (event) {
				_this.next(event, cfg.status.nextSlide);
			}, false);
			cfg.status.prevPage.addEventListener('click', function (event) {
				_this.prev(event, cfg.status.prevSlide);
			}, false);
		};
		// show or hide the previous and next buttons
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// calculate the current position
			cfg.scrollPosition = (cfg.status.slideUl.style.marginLeft) ? parseInt(cfg.status.slideUl.style.marginLeft, 10) : 0;
			cfg.scrollDistance = cfg.status.slideDiv.offsetWidth;
			// calculate the minimum position
			cfg.scrollMin = 0;
			// calculate the maximum position
			var lastThumbnail = cfg.status.thumbnails[cfg.status.thumbnails.length - 1];
			cfg.scrollStep = lastThumbnail.offsetWidth;
			cfg.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + cfg.scrollDistance;
			// show or hide the prev button
			cfg.status.prevPage.className = cfg.status.prevPage.className.replace(/ disabled/gi, '');
			cfg.status.prevPage.className += (cfg.scrollPosition >= cfg.scrollMin) ? ' disabled' : '';
			// show or hide the next button
			cfg.status.nextPage.className = cfg.status.nextPage.className.replace(/ disabled/gi, '');
			cfg.status.nextPage.className += (cfg.scrollPosition <= cfg.scrollMax && cfg.scrollMax < 0) ? ' disabled' : '';
		};
		// show the next page of thumbnails
		this.next = function (event, node) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = cfg.scrollPosition - cfg.scrollDistance + cfg.scrollStep;
				// limit the scroll distance
				if (newPosition < cfg.scrollMax) {
					newPosition = cfg.scrollMax;
				}
				// transition to the new position
				useful.transitions.byRules(cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				this.update();
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		// show the previous page of thumbnails
		this.prev = function (event, node) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = cfg.scrollPosition + cfg.scrollDistance - cfg.scrollStep;
				// limit the scroll distance
				if (newPosition > 0) {
					newPosition = 0;
				}
				// transition to the new position
				useful.transitions.byRules(cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				this.update();
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Thumbnails_Menu;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Thumbnails = function (parent) {
		this.root = parent;
		this.parent = parent;
		// build the thumbnail list
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the navigation bar
			cfg.status.slideNav = document.createElement('nav');
			cfg.status.slideNav.className = 'thumbnails';
			cfg.status.slideDiv = document.createElement('div');
			cfg.status.slideUl = document.createElement('ul');
			// force the height of the nav if desired
			if (cfg.divide !== '100%') {
				cfg.status.slideNav.style.height = (100 - cfg.divide * 100 - parseInt(cfg.margin, 10)) + '%';
			}
			if (cfg.margin) {
				cfg.pixelMargin = parseInt(root.obj.offsetWidth * parseInt(cfg.margin, 10) / 100, 10);
			}
			// for all thumbnails in the root.cfg
			cfg.status.thumbnails = [0];
			for (var a = 1; a < cfg.thumbnails.length; a += 1) {
				// create a new thumbnail
				var newLi = document.createElement('li');
				var newA = document.createElement('a');
				newA.className = (a === 1) ? cfg.navigation + '_active' : cfg.navigation + '_passive';
				var newImage = document.createElement('img');
				newImage.alt = '';
				newImage.src = cfg.thumbnails[a];
				newA.appendChild(newImage);
				newLi.appendChild(newA);
				// insert the new nodes
				cfg.status.slideUl.appendChild(newLi);
				// store the dom pointers to the images
				cfg.status.thumbnails[a] = newA;
			}
			// insert the navigation bar
			cfg.status.slideDiv.appendChild(cfg.status.slideUl);
			cfg.status.slideNav.appendChild(cfg.status.slideDiv);
			root.obj.appendChild(cfg.status.slideNav);
			// for all thumbnails in the root.cfg
			for (a = 1; a < cfg.thumbnails.length; a += 1) {
				// assign the event handler
				this.onThumbnailClick(cfg.status.thumbnails[a]);
			}
			// start the menu
			this.menu.setup();
		};
		// event handlers
		this.onThumbnailClick = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var _this = this;
			element.addEventListener('click', function (event) {
				_this.set(event, element);
			}, false);
		};
		// redraw/recentre the thumbnails according to the root.cfg
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// update the thumbnails menu
			this.menu.update();
			/// highlight the icons
			this.hightlightIcons();
			// centre the icons
			this.centreIcons();
			// centre the slider
			this.centreSlider();
		};
		// highlight active icon
		this.hightlightIcons = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// for all thumbnails
			for (var a = 1, b = cfg.thumbnails.length; a < b; a += 1) {
				// highlight the active slide
				cfg.status.thumbnails[a].className = (cfg.status.index === a) ? cfg.navigation + '_active' : cfg.navigation + '_passive';
			}
		};
		// centre the icons in containers
		this.centreIcons = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			var imageObject, imageWidth, imageHeight, rowHeight;
			// measure the available space
			rowHeight = cfg.status.slideNav.offsetHeight;
			// for all thumbnails
			for (var a = 1, b = cfg.thumbnails.length; a < b; a += 1) {
				// centre the image in its surroundings
				cfg.status.thumbnails[a].style.width =  rowHeight + 'px';
				imageObject = cfg.status.thumbnails[a].getElementsByTagName('img')[0];
				imageWidth = imageObject.offsetWidth;
				imageHeight = imageObject.offsetHeight;
				if (imageWidth > imageHeight) {
					imageWidth = imageWidth / imageHeight * rowHeight;
					imageHeight = rowHeight;
				} else {
					imageHeight = imageHeight /  imageWidth * rowHeight;
					imageWidth = rowHeight;
				}
				imageObject.style.width = Math.round(imageWidth) + 'px';
				imageObject.style.height = Math.round(imageHeight) + 'px';
				imageObject.style.left = '50%';
				imageObject.style.top = '50%';
				imageObject.style.marginLeft = Math.round(-imageWidth / 2) + 'px';
				imageObject.style.marginTop = Math.round(-imageHeight / 2) + 'px';
			}
		};
		// centre the container around the active one
		this.centreSlider = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// scroll the slider enough to center the active slide
			var activeThumbnail = cfg.status.thumbnails[cfg.status.index];
			var activePosition = activeThumbnail.offsetLeft;
			var activeWidth = activeThumbnail.offsetWidth;
			var scrollDistance = cfg.status.slideDiv.offsetWidth;
			var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
			centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
			centeredPosition = (centeredPosition < cfg.scrollMax && cfg.scrollMax < 0) ? cfg.scrollMax : centeredPosition;
			// transition to the new position
			useful.transitions.byRules(
				cfg.status.slideUl,
				{'marginLeft' : centeredPosition + 'px'}
			);
		};
		// activate a corresponding figure
		this.set = function (event, node) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// count which thumbnail this is
			for (var a = 1; a < cfg.status.thumbnails.length; a += 1) {
				if (cfg.status.thumbnails[a] === node) {
					// change the index to this slide
					cfg.status.index = a;
					// reset the zoom
					cfg.status.zoom = (cfg.zoom !== 'static') ? cfg.max : 1;
					// redraw all
					root.update();
				}
			}
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnail controls
		this.menu = new useful.Viewer_Thumbnails_Menu(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Thumbnails;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Toolbar = function (parent) {
		this.root = parent;
		this.parent = parent;
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the menu
			cfg.status.menus = cfg.status.menus || {};
			cfg.status.menus.toolbarNav = document.createElement('nav');
			cfg.status.menus.toolbarNav.className = cfg.toolbars + ' ' + cfg.spin;
			cfg.status.menus.toolbarNav.style.bottom = ((1 - cfg.divide) * 100) + '%';
			// add the zoom buttons
			cfg.status.menus.toolbarZoom = document.createElement('menu');
			cfg.status.menus.toolbarZoom.className = 'zoom';
			root.zoom.build.increaser(cfg.status.menus.toolbarZoom);
			root.zoom.build.decreaser(cfg.status.menus.toolbarZoom);
			cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarZoom);
			// setup the right toolbar
			switch (cfg.spin) {
			case 'rotation' :
				// create the menu
				cfg.status.menus.toolbarSpin = document.createElement('menu');
				cfg.status.menus.toolbarSpin.className = 'spin';
				// add the spin buttons
				root.spin.build.decreaser(cfg.status.menus.toolbarSpin);
				root.spin.build.increaser(cfg.status.menus.toolbarSpin);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarSpin);
				break;
			case 'slideshow' :
				// create the menu
				cfg.status.menus.toolbarLeaf = document.createElement('menu');
				cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the previous button
				root.leaf.build.decreaser(cfg.status.menus.toolbarLeaf);
				// add the next button
				root.leaf.build.increaser(cfg.status.menus.toolbarLeaf);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarLeaf);
				break;
			case 'catalogue' :
				// create the menu
				cfg.status.menus.toolbarLeaf = document.createElement('menu');
				cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the reset button
				root.leaf.build.resetter(cfg.status.menus.toolbarLeaf);
				// add the indicator display
				root.leaf.build.indicator(cfg.status.menus.toolbarLeaf);
				// add the previous button
				root.leaf.build.decreaser(cfg.status.menus.toolbarLeaf);
				// add the next button
				root.leaf.build.increaser(cfg.status.menus.toolbarLeaf);
				// add the reset button
				//root.leaf.build.resetter(cfg.status.menus.toolbarLeaf);
				// add the menu to the toolbar
				cfg.status.menus.toolbarNav.appendChild(cfg.status.menus.toolbarLeaf);
				break;
			}
			// add the menu to the interface
			root.obj.appendChild(cfg.status.menus.toolbarNav);
		};
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// hide/show the zoom out button
			cfg.status.menus.zoomIn.className = cfg.status.menus.zoomIn.className.replace(/ disabled/gi, '');
			cfg.status.menus.zoomIn.className += (cfg.status.atMaxZoom) ? ' disabled' : '';
			// hide/show the zoom in button
			cfg.status.menus.zoomOut.className = cfg.status.menus.zoomOut.className.replace(/ disabled/gi, '');
			cfg.status.menus.zoomOut.className += (cfg.status.atMinZoom) ? ' disabled' : '';
			// update the right toolbar
			switch (cfg.spin) {
				case 'rotation' :
					break;
				case 'slideshow' :
					// hide/show the previous button
					cfg.status.menus.leafIn.className = cfg.status.menus.leafIn.className.replace(/ disabled/gi, '');
					cfg.status.menus.leafIn.className += (cfg.status.atMaxLeaf) ? ' disabled' : '';
					// hide/show the next button
					cfg.status.menus.leafOut.className = cfg.status.menus.leafOut.className.replace(/ disabled/gi, '');
					cfg.status.menus.leafOut.className += (cfg.status.atMinLeaf) ? ' disabled' : '';
					break;
				case 'catalogue' :
					// fill in the current page
					cfg.status.menus.leafPageInput.value = cfg.status.index;
					// fill in the page total
					cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(cfg.status.figures.length - 1);
					break;
			}
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Toolbar;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Zoom_Build = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.slider = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the slider to the menu
			cfg.status.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			cfg.status.menus.zoomIndicator.className = 'meter';
			cfg.status.menus.zoomIndicator.setAttribute('min', 1);
			cfg.status.menus.zoomIndicator.setAttribute('max', cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight);
			cfg.status.menus.zoomIndicator.setAttribute('value', cfg.status.zoom);
			cfg.status.menus.zoomSlider = document.createElement('div');
			cfg.status.menus.zoomSliderIcon = document.createElement('span');
			cfg.status.menus.zoomSliderIcon.innerHTML = cfg.status.zoom;
			cfg.status.menus.zoomSlider.appendChild(cfg.status.menus.zoomSliderIcon);
			cfg.status.menus.zoomIndicator.appendChild(cfg.status.menus.zoomSlider);
			element.appendChild(cfg.status.menus.zoomIndicator);
		};
		this.cover = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add a touch cover to the menu
			cfg.status.menus.zoomCover = document.createElement('div');
			cfg.status.menus.zoomCover.className = 'cover';
			element.appendChild(cfg.status.menus.zoomCover);
			// add the event handler
			var simz = cfg.status.menus.zoomCover;
			simz.addEventListener('mousewheel', function (event) {
				parent.mouse.wheel(event);
			}, false);
			simz.addEventListener('DOMMouseScroll', function (event) {
				parent.mouse.wheel(event);
			}, false);
			simz.addEventListener('mousedown', function (event) {
				parent.mouse.start(event);
			}, false);
			simz.addEventListener('mousemove', function (event) {
				parent.mouse.move(event);
			}, false);
			simz.addEventListener('mouseup', function (event) {
				parent.mouse.end(event);
			}, false);
			simz.addEventListener('mouseout', function (event) {
				parent.mouse.end(event);
			}, false);
			// add the touch events
			simz.addEventListener('touchstart', function (event) {
				parent.touch.start(event);
			}, false);
			simz.addEventListener('touchmove', function (event) {
				parent.touch.move(event);
			}, false);
			simz.addEventListener('touchend', function (event) {
				parent.touch.end(event);
			}, false);
		};
		this.increaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the increase button
			cfg.status.menus.zoomIn = document.createElement('button');
			cfg.status.menus.zoomIn.className = 'increase';
			cfg.status.menus.zoomInIcon = document.createElement('span');
			cfg.status.menus.zoomInIcon.innerHTML = 'Zoom in';
			cfg.status.menus.zoomIn.appendChild(cfg.status.menus.zoomInIcon);
			element.appendChild(cfg.status.menus.zoomIn);
			// add the event handlers
			cfg.status.menus.zoomIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				parent.increase();
				// cancel streaming
				cfg.status.stream = false;
				// repeat
				cfg.status.menus.zoomInRepeat = setInterval(function () { parent.increase(); }, 300);
				// cancel this event
				event.preventDefault();
			}, false);
			cfg.status.menus.zoomIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(cfg.status.menus.zoomInRepeat);
				// allow streaming
				cfg.status.stream = true;
				// redraw
				root.update();
			}, false);
			cfg.status.menus.zoomIn.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
		this.decreaser = function (element) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// add the decrease button
			cfg.status.menus.zoomOut = document.createElement('button');
			cfg.status.menus.zoomOut.className = 'decrease';
			cfg.status.menus.zoomOutIcon = document.createElement('span');
			cfg.status.menus.zoomOutIcon.innerHTML = 'Zoom out';
			cfg.status.menus.zoomOut.appendChild(cfg.status.menus.zoomOutIcon);
			element.appendChild(cfg.status.menus.zoomOut);
			cfg.status.menus.zoomOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				parent.decrease();
				// cancel streaming
				cfg.status.stream = false;
				// repeat
				cfg.status.menus.zoomOutRepeat = setInterval(function () { parent.decrease(); }, 300);
				// cancel this event
				event.preventDefault();
			}, false);
			cfg.status.menus.zoomOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(cfg.status.menus.zoomOutRepeat);
				// allow streaming
				cfg.status.stream = true;
				// redraw
				root.update();
			}, false);
			cfg.status.menus.zoomOut.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom_Build;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Zoom_Mouse = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.y = null;
		this.distance = null;
		this.sensitivity = null;
		this.fudge = 1.1;
		// mouse wheel controls
		this.wheel = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				cfg.status.zoom = cfg.status.zoom * cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				cfg.status.zoom = cfg.status.zoom / cfg.magnification;
			}
			// call for a redraw
			root.update();
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// store the touch positions
			this.y = event.pageY || event.y;
			this.distance = cfg.status.menus.zoomCover.offsetHeight - cfg.status.menus.zoomIn.offsetHeight - cfg.status.menus.zoomOut.offsetHeight;
			this.sensitivity = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight - 1;
			// cancel the click
			event.preventDefault();
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (this.y !== null) {
				// store the touch positions
				var y = event.pageY || event.y;
				// calculate the drag distance into %
				cfg.status.zoom += (this.y - y) / this.distance * this.sensitivity * this.fudge;
				// reset the distance
				this.y = y;
				// disable streaming new images
				cfg.status.stream = false;
				// order a redraw
				root.update();
			}
			// cancel the click
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			// clear the positions
			this.y = null;
			// enable streaming new images
			cfg.status.stream = true;
			// order a redraw
			root.update();
			// cancel the click
			event.preventDefault();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom_Mouse;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Zoom_Touch = function (parent) {
		this.root = parent.parent;
		this.parent = parent;
		this.y = null;
		this.distance = null;
		this.sensitivity = null;
		this.fudge = 1.1;
		this.start = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// store the touch positions
			this.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				this.y.push(event.touches[a].pageY);
			}
			// calculate the sensitivity
			this.distance = cfg.status.menus.zoomCover.offsetHeight - cfg.status.menus.zoomIn.offsetHeight - cfg.status.menus.zoomOut.offsetHeight;
			this.sensitivity = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight - 1;
		};
		this.move = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if there is a touch in progress
			if (this.y !== null) {
				// store the touch positions
				var y;
				y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					y.push(event.touches[a].pageY);
				}
				// calculate the drag distance into %
				cfg.status.zoom += (this.y[0] - y[0]) / this.distance * this.sensitivity * this.fudge;
				// reset the distance
				this.y[0] = y[0];
				// disable streaming new images
				cfg.status.stream = false;
				// order a redraw
				root.update();
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.end = function (event) {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// clear the positions
			this.y = null;
			// enable streaming new images
			cfg.status.stream = true;
			// order a redraw
			root.update();
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom_Touch;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer_Zoom = function (parent) {
		this.root = parent;
		this.parent = parent;
		this.setup = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// create the menu
			cfg.status.menus = cfg.status.menus || {};
			cfg.status.menus.zoomMenu = document.createElement('menu');
			cfg.status.menus.zoomMenu.className = 'slider zoom';
			cfg.status.menus.zoomMenu.style.bottom = ((1 - cfg.divide) * 100) + '%';
			// add the slider to the menu
			this.build.slider(cfg.status.menus.zoomMenu);
			// add a touch cover to the menu
			this.build.cover(cfg.status.menus.zoomMenu);
			// add the increase button
			this.build.increaser(cfg.status.menus.zoomMenu);
			// add the decrease button
			this.build.decreaser(cfg.status.menus.zoomMenu);
			// add the menu to the interface
			parent.obj.appendChild(cfg.status.menus.zoomMenu);
		};
		this.update = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// gather the constants
			var minZoom = 1,
				maxZoom = cfg.heights[cfg.status.index] / cfg.status.canvas.offsetHeight,
				curZoom = cfg.status.zoom;
			// update the value
			cfg.status.menus.zoomIndicator.setAttribute('value', curZoom);
			cfg.status.menus.zoomSliderIcon.innerHTML = curZoom;
			// reposition the slider
			cfg.status.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
		};
		this.increase = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// increase the zoom factor
			cfg.status.zoom = cfg.status.zoom * cfg.magnification;
			// order a redraw
			parent.update();
		};
		this.decrease = function () {
			var root = this.root, parent = this.parent, cfg = root.cfg;
			// decrease the zoom factor
			cfg.status.zoom = cfg.status.zoom / cfg.magnification;
			// order a redraw
			parent.update();
		};
		// build functionality
		this.build = new useful.Viewer_Zoom_Build(this);
		// mouse controls
		this.mouse = new useful.Viewer_Zoom_Mouse(this);
		// touch screen controls
		this.touch = new useful.Viewer_Zoom_Touch(this);
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer_Zoom;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20140923, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		// methods
		this.start = function () {
			var _this = this;
			// wait until the page has loaded
			window.addEventListener('load', function () {
				// gather the input
				_this.gatherInput();
				// validate the input
				_this.validateInput();
				// set the start parameters
				_this.startingStatus();
				// apply the custom styles
				_this.styling();
				// run the viewer
				_this.run();
			});
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		// set the start parameters
		this.startingStatus = function () {
			// create the object to hold all the running variables
			this.cfg.status = {};
			// pick the initial active slide
			this.cfg.status.index = 1;
			// pick the initial zoom level
			this.cfg.status.zoom = 1;
			// pick the initial pan position
			this.cfg.status.pan = {x : 0.5, y : 0.5};
			// pick the initial canvas position
			this.cfg.status.pos = {x : 0, y : 0};
			// establish the replacement regular expressions
			this.cfg.regSrc = new RegExp('{src}', 'gi');
			this.cfg.regWidth = new RegExp('{width}', 'gi');
			this.cfg.regHeight = new RegExp('{height}', 'gi');
			this.cfg.regLeft = new RegExp('{left}', 'gi');
			this.cfg.regTop = new RegExp('{top}', 'gi');
			this.cfg.regRight = new RegExp('{right}', 'gi');
			this.cfg.regBottom = new RegExp('{bottom}', 'gi');
		};
		// gather all the configuration and DOM elements
		this.gatherInput = function () {
			// get the assets from the html
			this.cfg.thumbnails = [0];
			this.cfg.figures = [0];
			this.cfg.titles = [0];
			this.cfg.descriptions = [0];
			this.cfg.widths = [0];
			this.cfg.heights = [0];
			this.cfg.lefts = [0];
			this.cfg.tops = [0];
			this.cfg.rights = [0];
			this.cfg.bottoms = [0];
			var allLinks = this.obj.getElementsByTagName('a');
			var allImages = this.obj.getElementsByTagName('img');
			for (var a = 0, b = allLinks.length; a < b; a += 1) {
				// create a list of thumbnail urls and full urls
				this.cfg.thumbnails.push(allImages[a].getAttribute('src'));
				this.cfg.figures.push(this.cfg.urlprefix + allLinks[a].getAttribute('href'));
				this.cfg.titles.push(allImages[a].getAttribute('title'));
				this.cfg.descriptions.push(allImages[a].getAttribute('alt'));
				this.cfg.widths.push(parseInt(allImages[a].getAttribute('width'), 10));
				this.cfg.heights.push(parseInt(allImages[a].getAttribute('height'), 10));
				this.cfg.lefts.push(parseFloat(allImages[a].getAttribute('data-left') || this.cfg.left || 0));
				this.cfg.tops.push(parseFloat(allImages[a].getAttribute('data-top') || this.cfg.top || 0));
				this.cfg.rights.push(parseFloat(allImages[a].getAttribute('data-right') || this.cfg.right || 1));
				this.cfg.bottoms.push(parseFloat(allImages[a].getAttribute('data-bottom') || this.cfg.bottom || 1));
			}
		};
		// fix some numbers in the context.cfg
		this.validateInput = function () {
			this.cfg.grid = parseInt(this.cfg.grid, 10);
			this.cfg.cache = parseInt(this.cfg.cache, 10);
			this.cfg.lens = parseFloat(this.cfg.lens);
			this.cfg.magnification = parseFloat(this.cfg.magnification);
			this.cfg.max = parseFloat(this.cfg.max);
			this.cfg.navigation = 'thumbnails';
			this.cfg.divide = (this.cfg.spin === 'rotation') ? 1 : parseInt(this.cfg.divide, 10) / 100;
			this.cfg.retry = null;
		};
		// implement customised styles
		this.styling = function () {
			// create a custom stylesheet
			var style = document.createElement("style");
			var isWebkit = new RegExp('webkit', 'gi');
			if (isWebkit.test(navigator.UserAgent)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				sheet.insertRule(".viewer button {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer button:hover {background-color : " + this.cfg.colorHover + " !important;}", 0);
				sheet.insertRule(".viewer button.disabled {background-color : " + this.cfg.colorDisabled + " !important;}", 0);
				sheet.insertRule(".viewer .thumbnails_active {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider {background-color : " + this.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider meter div {background-color : " + this.cfg.colorPassive + " !important;}", 0);
			} else {
				sheet.addRule(".viewer button", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer button:hover", "background-color : " + this.cfg.colorHover + " !important;", 0);
				sheet.addRule(".viewer button.disabled", "background-color : " + this.cfg.colorDisabled + " !important;", 0);
				sheet.addRule(".viewer .thumbnails_active", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider", "background-color : " + this.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider meter div", "background-color : " + this.cfg.colorPassive + " !important;", 0);
			}
		};
		// run the slideshow
		this.run = function () {
			var _this = this;
			// hide the component
			this.obj.style.visibility = 'hidden';
			setTimeout(function () {
				// start the components
				_this.setup();
				// start the redraw
				setTimeout(function () {
					// draw the component
					_this.update();
					// reveal the component
					_this.obj.style.visibility = 'visible';
				}, 400);
			}, 100);
		};
		// build the app html
		this.setup = function () {
			// shortcut pointers
			var sip = this.obj;
			// clear the parent node
			sip.innerHTML = '';
			// apply optional dimensions
			if (this.cfg.width) {
				sip.style.width = this.cfg.width + this.cfg.widthUnit;
			}
			if (this.cfg.height) {
				sip.style.height = this.cfg.height + this.cfg.heightUnit;
			}
			// apply any context.cfg classes
			sip.className += ' spin_' + this.cfg.spin;
			// setup the sub components
			this.automatic.setup();
			this.figures.setup();
			// choose what type of toolbars to setup
			switch (this.cfg.toolbars) {
			// setup the slider toolbars
			case 'sliders' :
				this.zoom.setup(this);
				if (this.cfg.spin === 'rotation') {
					this.spin.setup();
				}
				if (this.cfg.spin === 'catalogue') {
					this.leaf.setup();
				}
				break;
			// setup the floating buttons
			case 'buttons' :
				this.toolbar.setup();
				break;
			// setup the default toolbar
			default :
				this.toolbar.setup();
			}
			// setup the thumbnails
			if (this.cfg.spin !== 'rotation') {
				this.thumbnails.setup();
			}
		};
		// update the whole app
		this.update = function () {
			// if the slideshow has been disabled
			if (this.obj.offsetHeight === 0) {
				// stop updating and try again later
				clearTimeout(this.cfg.retry);
				var _this = this;
				this.cfg.retry = setTimeout(function () {
					_this.update();
				}, 1000);
			// else
			} else {
				// update the sub components
				this.figures.update();
				// choose what type of toolbars to update
				switch (this.cfg.toolbars) {
					// update the slider toolbars
					case 'sliders' :
						this.zoom.update();
						if (this.cfg.spin === 'rotation') {
							this.spin.update();
						}
						if (this.cfg.spin === 'catalogue') {
							this.leaf.update();
						}
						break;
					// update the floating buttons
					case 'buttons' :
						this.toolbar.update();
						break;
					// update the default toolbar
					default :
						this.toolbar.update();
				}
				// update the thumbnails
				if (this.cfg.spin !== 'rotation') {
					this.thumbnails.update();
				}
			}
		};
		// automatic idle slideshow
		this.automatic = new useful.Viewer_Automatic(this);
		// manages the main view
		this.figures = new useful.Viewer_Figures(this);
		// zoom slider
		this.zoom = new useful.Viewer_Zoom(this);
		// spin slider
		this.spin = new useful.Viewer_Spin(this);
		// manages the thumbnails
		this.thumbnails = new useful.Viewer_Thumbnails(this);
		// manages leafing through pages
		this.leaf = new useful.Viewer_Leaf(this);
		// minimal superset of controls
		this.toolbar = new useful.Viewer_Toolbar(this);
		// external API
		this.focus = function (index) {
			this.cfg.status.index = index;
			this.update(this);
		};
		this.previous = function () {
			this.cfg.status.index -= 1;
			this.update(this);
		};
		this.next = function () {
			this.cfg.status.index += 1;
			this.update(this);
		};
		// go
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Viewer;
	}

})();
