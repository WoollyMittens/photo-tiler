/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var polyfills = polyfills || {};

	// enabled the use of HTML5 elements in Internet Explorer
	polyfills.html5 = function () {
		var a, b, elementsList;
		elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
		if (navigator.userAgent.match(/msie/gi)) {
			for (a = 0 , b = elementsList.length; a < b; a += 1) {
				document.createElement(elementsList[a]);
			}
		}
	};

	// allow array.indexOf in older browsers
	polyfills.arrayIndexOf = function () {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
	};

	// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
	polyfills.querySelectorAll = function () {
		if (!document.querySelectorAll) {
			document.querySelectorAll = function (a) {
				var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
				return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
			};
		}
	};

	// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
	polyfills.addEventListener = function () {
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
	};

	// allow console.log
	polyfills.consoleLog = function () {
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
	};

	// allows Object.create (https://gist.github.com/rxgx/1597825)
	polyfills.objectCreate = function () {
		if (typeof Object.create !== "function") {
			Object.create = function (original) {
				function Clone() {}
				Clone.prototype = original;
				return new Clone();
			};
		}
	};

	// allows String.trim (https://gist.github.com/eliperelman/1035982)
	polyfills.stringTrim = function () {
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
	};

	// for immediate use
	polyfills.html5();
	polyfills.arrayIndexOf();
	polyfills.querySelectorAll();
	polyfills.addEventListener();
	polyfills.consoleLog();
	polyfills.objectCreate();
	polyfills.stringTrim();

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.positions.js: A library of useful functions to ease working with screen positions.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var positions = positions || {};

	// find the dimensions of the window
	positions.window = function (parent) {
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
	};

	// find the scroll position of an element
	positions.document = function (parent) {
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
	};

	// finds the position of the element, relative to the document
	positions.object = function (node) {
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
	};

	// find the position of the mouse cursor relative to an element
	positions.cursor = function (event, parent) {
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
			var offsets = positions.object(parent);
			// adjust the coordinates to fit the parent
			position.x -= offsets.x;
			position.y -= offsets.y;
		}
		// return the object
		return position;
	};

	// public functions
	useful.positions = useful.positions || {};
	useful.positions.window = positions.window;
	useful.positions.document = positions.document;
	useful.positions.object = positions.object;
	useful.positions.cursor = positions.cursor;

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.transitions.js: A library of useful functions to ease working with CSS3 transitions.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Fallbacks:
	<!--[if IE]>
		<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var transitions = transitions || {};

	// applies functionality to node that conform to a given CSS rule, or returns them
	transitions.select = function (input, parent) {
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
	};

	// checks the compatibility of CSS3 transitions for this browser
	transitions.compatibility = function () {
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
	};

	// performs a transition between two classnames
	transitions.byClass = function (element, removedClass, addedClass, endEventHandler, jQueryDuration, jQueryEasing) {
		var replaceThis, replaceWith, endEventName, endEventFunction;
		// validate the input
		endEventHandler = endEventHandler || function () {};
		endEventName = transitions.compatibility();
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
	};

	// adds the relevant browser prefix to a style property
	transitions.prefix = function (property) {
		// pick the prefix that goes with the browser
		return (navigator.userAgent.match(/webkit/gi)) ? 'webkit' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/firefox/gi)) ? 'Moz' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/microsoft/gi)) ? 'ms' + property.substr(0, 1).toUpperCase() + property.substr(1):
			(navigator.userAgent.match(/opera/gi)) ? 'O' + property.substr(0, 1).toUpperCase() + property.substr(1):
			property;
	};

	// applies a list of rules
	transitions.byRules = function (element, rules, endEventHandler) {
		var rule, endEventName, endEventFunction;
		// validate the input
		rules.transitionProperty = rules.transitionProperty || 'all';
		rules.transitionDuration = rules.transitionDuration || '300ms';
		rules.transitionTimingFunction = rules.transitionTimingFunction || 'ease';
		endEventHandler = endEventHandler || function () {};
		endEventName = transitions.compatibility();
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
					element.style[transitions.compatibility(rule)] = rules[rule];
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
					element.style[transitions.compatibility(rule)] = rules[rule];
					// implement the value
					element.style[rule] = rules[rule];
				}
			}
			// call the onComplete handler
			endEventHandler();
		}
	};

	// public functions
	useful.transitions = useful.transitions || {};
	useful.transitions.select = transitions.select;
	useful.transitions.byClass = transitions.byClass;
	useful.transitions.byRules = transitions.byRules;

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.context.js: A simple tile based image viewer", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Prerequisites:
	<script src="./js/useful.js"></script>
	<!--[if IE]>
		<script src="./js/html5.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	useful.Viewer = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		// methods
		this.start = function () {
			var context = this;
			// wait until the page has loaded
			window.addEventListener('load', function () {
				// gather the input
				context.gatherInput(context);
				// validate the input
				context.validateInput(context);
				// set the start parameters
				context.startingStatus(context);
				// apply the custom styles
				context.styling(context);
				// run the viewer
				context.run(context);
			});
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		// set the start parameters
		this.startingStatus = function (context) {
			// create the object to hold all the running variables
			context.cfg.status = {};
			// pick the initial active slide
			context.cfg.status.index = 1;
			// pick the initial zoom level
			context.cfg.status.zoom = 1;
			// pick the initial pan position
			context.cfg.status.pan = {x : 0.5, y : 0.5};
			// pick the initial canvas position
			context.cfg.status.pos = {x : 0, y : 0};
			// establish the replacement regular expressions
			context.cfg.regSrc = new RegExp('{src}', 'gi');
			context.cfg.regWidth = new RegExp('{width}', 'gi');
			context.cfg.regHeight = new RegExp('{height}', 'gi');
			context.cfg.regLeft = new RegExp('{left}', 'gi');
			context.cfg.regTop = new RegExp('{top}', 'gi');
			context.cfg.regRight = new RegExp('{right}', 'gi');
			context.cfg.regBottom = new RegExp('{bottom}', 'gi');
		};
		// gather all the configuration and DOM elements
		this.gatherInput = function (context) {
			// get the assets from the html
			context.cfg.thumbnails = [0];
			context.cfg.figures = [0];
			context.cfg.titles = [0];
			context.cfg.descriptions = [0];
			context.cfg.widths = [0];
			context.cfg.heights = [0];
			context.cfg.lefts = [0];
			context.cfg.tops = [0];
			context.cfg.rights = [0];
			context.cfg.bottoms = [0];
			var allLinks = context.obj.getElementsByTagName('a');
			var allImages = context.obj.getElementsByTagName('img');
			for (var a = 0, b = allLinks.length; a < b; a += 1) {
				// create a list of thumbnail urls and full urls
				context.cfg.thumbnails.push(allImages[a].getAttribute('src'));
				context.cfg.figures.push(context.cfg.urlprefix + allLinks[a].getAttribute('href'));
				context.cfg.titles.push(allImages[a].getAttribute('title'));
				context.cfg.descriptions.push(allImages[a].getAttribute('alt'));
				context.cfg.widths.push(parseInt(allImages[a].getAttribute('width'), 10));
				context.cfg.heights.push(parseInt(allImages[a].getAttribute('height'), 10));
				context.cfg.lefts.push(parseFloat(allImages[a].getAttribute('data-left') || context.cfg.left || 0));
				context.cfg.tops.push(parseFloat(allImages[a].getAttribute('data-top') || context.cfg.top || 0));
				context.cfg.rights.push(parseFloat(allImages[a].getAttribute('data-right') || context.cfg.right || 1));
				context.cfg.bottoms.push(parseFloat(allImages[a].getAttribute('data-bottom') || context.cfg.bottom || 1));
			}
		};
		// fix some numbers in the context.cfg
		this.validateInput = function (context) {
			context.cfg.grid = parseInt(context.cfg.grid, 10);
			context.cfg.cache = parseInt(context.cfg.cache, 10);
			context.cfg.lens = parseFloat(context.cfg.lens);
			context.cfg.magnification = parseFloat(context.cfg.magnification);
			context.cfg.max = parseFloat(context.cfg.max);
			context.cfg.navigation = 'thumbnails';
			context.cfg.divide = (context.cfg.spin === 'rotation') ? 1 : parseInt(context.cfg.divide, 10) / 100;
			context.cfg.retry = null;
		};
		// implement customised styles
		this.styling = function (context) {
			// create a custom stylesheet
			var style = document.createElement("style");
			var isWebkit = new RegExp('webkit', 'gi');
			if (isWebkit.test(navigator.UserAgent)) { style.appendChild(document.createTextNode("")); }
			document.body.appendChild(style);
			var sheet = style.sheet || style.styleSheet;
			// add the custom styles
			if (sheet.insertRule) {
				sheet.insertRule(".viewer button {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer button:hover {background-color : " + context.cfg.colorHover + " !important;}", 0);
				sheet.insertRule(".viewer button.disabled {background-color : " + context.cfg.colorDisabled + " !important;}", 0);
				sheet.insertRule(".viewer .thumbnails_active {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider {background-color : " + context.cfg.colorPassive + " !important;}", 0);
				sheet.insertRule(".viewer menu.slider meter div {background-color : " + context.cfg.colorPassive + " !important;}", 0);
			} else {
				sheet.addRule(".viewer button", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer button:hover", "background-color : " + context.cfg.colorHover + " !important;", 0);
				sheet.addRule(".viewer button.disabled", "background-color : " + context.cfg.colorDisabled + " !important;", 0);
				sheet.addRule(".viewer .thumbnails_active", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider", "background-color : " + context.cfg.colorPassive + " !important;", 0);
				sheet.addRule(".viewer menu.slider meter div", "background-color : " + context.cfg.colorPassive + " !important;", 0);
			}
		};
		// run the slideshow
		this.run = function (context) {
			// hide the component
			context.obj.style.visibility = 'hidden';
			setTimeout(function () {
				// start the components
				context.setup(context);
				// start the redraw
				setTimeout(function () {
					// draw the component
					context.update(context);
					// reveal the component
					context.obj.style.visibility = 'visible';
				}, 400);
			}, 100);
		};
		// build the app html
		this.setup = function (context) {
			// shortcut pointers
			var sip = context.obj;
			// clear the parent node
			sip.innerHTML = '';
			// apply optional dimensions
			if (context.cfg.width) {
				sip.style.width = context.cfg.width + context.cfg.widthUnit;
			}
			if (context.cfg.height) {
				sip.style.height = context.cfg.height + context.cfg.heightUnit;
			}
			// apply any context.cfg classes
			sip.className += ' spin_' + context.cfg.spin;
			// setup the sub components
			context.automatic.setup(context);
			context.figures.setup(context);
			// choose what type of toolbars to setup
			switch (context.cfg.toolbars) {
			// setup the slider toolbars
			case 'sliders' :
				context.zoom.setup(context);
				if (context.cfg.spin === 'rotation') {
					context.spin.setup(context);
				}
				if (context.cfg.spin === 'catalogue') {
					context.leaf.setup(context);
				}
				break;
			// setup the floating buttons
			case 'buttons' :
				context.toolbar.setup(context);
				break;
			// setup the default toolbar
			default :
				context.toolbar.setup(context);
			}
			// setup the thumbnails
			if (context.cfg.spin !== 'rotation') {
				context.thumbnails.setup(context);
			}
		};
		// update the whole app
		this.update = function (context) {
			// if the slideshow has been disabled
			if (context.obj.offsetHeight === 0) {
				// stop updating and try again later
				clearTimeout(context.cfg.retry);
				context.cfg.retry = setTimeout(function () {
					context.update(context);
				}, 1000);
			// else
			} else {
				// update the sub components
				context.figures.update(context);
				// choose what type of toolbars to update
				switch (context.cfg.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					context.zoom.update(context);
					if (context.cfg.spin === 'rotation') {
						context.spin.update(context);
					}
					if (context.cfg.spin === 'catalogue') {
						context.leaf.update(context);
					}
					break;
				// update the floating buttons
				case 'buttons' :
					context.toolbar.update(context);
					break;
				// update the default toolbar
				default :
					context.toolbar.update(context);
				}
				// update the thumbnails
				if (context.cfg.spin !== 'rotation') {
					context.thumbnails.update(context);
				}
			}
		};
		// automatic idle slideshow
		this.automatic = {};
		this.automatic.setup = function () {};
		// manages the main view
		this.figures = {};
		// builds the figure
		this.figures.setup = function (context) {
			// enable the streaming of images
			context.cfg.status.stream = true;
			// set up a counter for the amount of images streamed
			context.cfg.status.count = 0;
			// create a storage place for the transition timeouts
			context.cfg.status.transitions = [];
			// create a wrapper for overflow management
			context.cfg.status.wrapper = document.createElement('div');
			context.cfg.status.wrapper.className = 'wrapper';
			// force the height of the wrapper if desired
			context.cfg.status.wrapper.style.height = (context.cfg.divide * 100) + '%';
			// create a canvas layer to contain the images
			context.cfg.status.canvas = document.createElement('div');
			context.cfg.status.canvas.className = 'canvas';
			// add the canvas to the parent
			context.cfg.status.wrapper.appendChild(context.cfg.status.canvas);
			// add the figures to the construct
			context.figures.addFigures(context);
			// add the cover layer to the construct
			context.figures.addCover(context);
			// add the lens to the construct
			context.figures.addLens(context);
			// add the wrapper to the parent
			context.obj.appendChild(context.cfg.status.wrapper);
			// add a place to contain the tiles
			context.cfg.status.tiles = {};
		};
		// add the figures to the construct
		this.figures.addFigures = function (context) {
			// for all figures in the context.cfg
			context.cfg.status.figures = [0];
			var newImage, newWidth, newHeight, croppedWidth, croppedHeight;
			for (var a = 1, b = context.cfg.figures.length; a < b; a += 1) {
				// calculate the cropped dimensions
				croppedWidth = context.cfg.widths[a] * (context.cfg.rights[a] - context.cfg.lefts[a]);
				croppedHeight = context.cfg.heights[a] * (context.cfg.bottoms[a] - context.cfg.tops[a]);
				// calculate the starting dimensions
				newHeight = context.obj.offsetHeight * context.cfg.divide;
				newWidth = newHeight / croppedHeight * croppedWidth;
				// create a new slide
				context.cfg.status.figures[a] = document.createElement('figure');
				context.cfg.status.figures[a].className = (a === 1) ? 'figure_active' : 'figure_passive';
				context.cfg.status.figures[a].style.width = parseInt(newWidth, 10) + 'px';
				context.cfg.status.figures[a].style.height = parseInt(newHeight, 10) + 'px';
				context.cfg.status.figures[a].style.left = (context.cfg.status.pan.x * 100) + '%';
				context.cfg.status.figures[a].style.top = (context.cfg.status.pan.y * 100) + '%';
				context.cfg.status.figures[a].style.marginLeft = parseInt(newWidth / -2, 10) + 'px';
				context.cfg.status.figures[a].style.marginTop = parseInt(newHeight / -2, 10) + 'px';
				// add the default image to the slide
				newImage = document.createElement('img');
				// load starting images
				newImage.src = context.cfg.imageslice
					.replace(context.cfg.regSrc, context.cfg.figures[a])
					.replace(context.cfg.regWidth, parseInt(newWidth, 10))
					.replace(context.cfg.regHeight, parseInt(newHeight, 10))
					.replace(context.cfg.regLeft, context.cfg.lefts[a])
					.replace(context.cfg.regTop, context.cfg.tops[a])
					.replace(context.cfg.regRight, context.cfg.rights[a])
					.replace(context.cfg.regBottom, context.cfg.bottoms[a]);
				// set the image properties
				newImage.style.width = '100%';
				newImage.style.height = '100%';
				newImage.className = 'zoom_0';
				if (context.cfg.descriptions) {
					newImage.setAttribute('alt', context.cfg.descriptions[a]);
				} else {
					newImage.setAttribute('alt', '');
				}
				if (context.cfg.titles) {
					newImage.setAttribute('title', context.cfg.titles[a]);
				} else {
					newImage.setAttribute('title', '');
				}
				context.cfg.status.figures[a].appendChild(newImage);
				// insert the new nodes
				context.cfg.status.canvas.appendChild(context.cfg.status.figures[a]);
			}
		};
		// add the lens to the construct
		this.figures.addLens = function (context) {
			// clone the initial figure into a background layer on non-static zooms
			if (context.cfg.zoom !== 'static') {
				// create a background layer to contain all the low res backgrounds
				context.cfg.status.background = context.cfg.status.canvas.cloneNode(true);
				context.cfg.status.background.className = 'background';
				// insert the background into the parent
				context.cfg.status.wrapper.insertBefore(context.cfg.status.background, context.cfg.status.canvas);
				// apply a lens style to the canvas
				context.cfg.status.canvas.className += ' canvas_lens canvas_hidden';
				// set a starting zoom factor
				context.cfg.status.zoom = context.cfg.max;
				// set the lens dimensions
				if (context.cfg.zoom === 'lens') {
					var lensSize = context.obj.offsetWidth * context.cfg.lens;
					context.cfg.status.canvas.style.width = lensSize + 'px';
					context.cfg.status.canvas.style.height = lensSize + 'px';
					if (navigator.userAgent.match(/firefox|webkit/gi)) {
						context.cfg.status.canvas.style.borderRadius = '50%';	//(lensSize / 2) + 'px';
					}
				}
				// store the backgrounds
				var backgroundFigures = context.cfg.status.background.getElementsByTagName('figure');
				context.cfg.status.backgrounds = [];
				for (var a = 0, b = backgroundFigures.length; a < b; a += 1) {
					context.cfg.status.backgrounds[a + 1] = backgroundFigures[a];
					context.cfg.status.backgrounds[a + 1].style.display = 'block';
					context.cfg.status.backgrounds[a + 1].style.position = 'absolute';
				}
			}
		};
		// add the cover to the construct
		this.figures.addCover = function (context) {
			// add a top layer for uninterrupted touch events
			context.cfg.status.cover = document.createElement('div');
			context.cfg.status.cover.className = 'cover';
			context.cfg.status.wrapper.appendChild(context.cfg.status.cover);
			// add the mouse events for the cover layer
			context.figures.onCoverScroll(context.cfg.status.cover, context);
			context.figures.onCoverMouse(context.cfg.status.cover, context);
			context.figures.onCoverTouch(context.cfg.status.cover, context);
		};
		// set the mouse wheel events
		this.figures.onCoverScroll = function (cover, context) {
			cover.addEventListener('mousewheel', function (event) {
				context.figures.mouse.wheel(event, context);
			}, false);
			cover.addEventListener('DOMMouseScroll', function (event) {
				context.figures.mouse.wheel(event, context);
			}, false);
		};
		// add the mouse events
		this.figures.onCoverMouse = function (cover, context) {
			// set the right interactions for the zoom mode
			if (context.cfg.zoom !== 'static') {
				cover.addEventListener('mousemove', function (event) {
					context.figures.mouse.mirror(event, context);
				}, false);
			} else {
				cover.addEventListener('mousedown', function (event) {
					context.figures.mouse.start(event, context);
				}, false);
				cover.addEventListener('mousemove', function (event) {
					context.figures.mouse.move(event, context);
				}, false);
				cover.addEventListener('mouseup', function (event) {
					context.figures.mouse.end(event, context);
				}, false);
				cover.addEventListener('mouseout', function (event) {
					context.figures.mouse.end(event, context);
				}, false);
			}
		};
		// add the touch events
		this.figures.onCoverTouch = function (cover, context) {
			// set the right interactions for the zoom mode
			if (context.cfg.zoom !== 'static') {
				cover.addEventListener('move', function (event) {
					context.figures.touch.mirror(event, context);
				}, false);
			} else {
				cover.addEventListener('touchstart', function (event) {
					context.figures.touch.start(event, context);
				}, false);
				cover.addEventListener('touchmove', function (event) {
					context.figures.touch.move(event, context);
				}, false);
				cover.addEventListener('touchend', function (event) {
					context.figures.touch.end(event, context);
				}, false);
			}
		};
		// redraws the figure
		this.figures.update = function (context) {
			// validate the input
			context.figures.redraw.validate(context);
			// calculate the values
			context.figures.redraw.calculate(context);
			// normalise the values
			context.figures.redraw.normalise(context);
			// move the canvas around
			context.figures.redraw.canvas(context);
			// move the figure around
			context.figures.redraw.figures(context);
			// create new tiles
			context.figures.redraw.create(context);
			// display existing tiles
			context.figures.redraw.display(context);
			// spin the correct figure into view
			context.figures.redraw.spin(context);
		};
		this.figures.redraw = {};
		this.figures.redraw.validate = function (context) {
			// reset the stored limits
			context.cfg.status.atMinZoom = false;
			context.cfg.status.atMaxZoom = false;
			context.cfg.status.atMinLeaf = false;
			context.cfg.status.atMaxLeaf = false;
			// check the zoom level
			var minZoom = (context.cfg.zoom !== 'static') ? (1 / context.cfg.lens) : 1;
			if (context.cfg.status.zoom <= minZoom) {
				context.cfg.status.zoom = minZoom;
				context.cfg.status.atMinZoom = true;
			}
			if (context.cfg.status.index <= 1) {
				context.cfg.status.index = 1;
				context.cfg.status.atMinLeaf = true;
			}
			if (context.cfg.status.index >= context.cfg.status.figures.length) {
				context.cfg.status.index = context.cfg.status.figures.length - 1;
				context.cfg.status.atMaxLeaf = true;
			}
		};
		this.figures.redraw.calculate = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// calculate dimensions for a given zoom level
			vfr.canvasWidth = context.cfg.status.canvas.offsetWidth;
			vfr.canvasHeight = context.cfg.status.canvas.offsetHeight;
			vfr.canvasLeft = context.cfg.status.pos.x - vfr.canvasWidth / 2;
			vfr.canvasTop = context.cfg.status.pos.y - vfr.canvasHeight / 2;
			vfr.maxWidth = context.cfg.widths[context.cfg.status.index] * (context.cfg.rights[context.cfg.status.index] - context.cfg.lefts[context.cfg.status.index]);
			vfr.maxHeight = context.cfg.heights[context.cfg.status.index] * (context.cfg.bottoms[context.cfg.status.index] - context.cfg.tops[context.cfg.status.index]);
			vfr.figureAspect = vfr.maxWidth / vfr.maxHeight;
			vfr.figureWidth = vfr.canvasHeight * vfr.figureAspect * context.cfg.status.zoom;
			vfr.figureHeight = vfr.canvasHeight * context.cfg.status.zoom;
			vfr.figureLeft = (context.cfg.status.pan.x - 0.5) * vfr.canvasWidth;
			vfr.figureTop = (context.cfg.status.pan.y - 0.5) * vfr.canvasHeight;
			vfr.overscanLeft = (vfr.figureWidth - vfr.canvasWidth) / 2;
			vfr.overscanTop = (vfr.figureHeight - vfr.canvasHeight) / 2;
			vfr.offsetLeft = vfr.overscanLeft - vfr.figureLeft;
			vfr.offsetTop = vfr.overscanTop - vfr.figureTop;
			vfr.minPanLeft = -vfr.overscanLeft / vfr.canvasWidth + 0.5;
			vfr.maxPanLeft = vfr.overscanLeft / vfr.canvasWidth + 0.5;
			vfr.minPanTop = -vfr.overscanTop / vfr.canvasHeight + 0.5;
			vfr.maxPanTop = vfr.overscanTop / vfr.canvasHeight + 0.5;
			vfr.maxZoom = vfr.maxHeight / vfr.canvasHeight;
			// extra dimensions for non static zooms
			if (context.cfg.zoom !== 'static') {
				vfr.backgroundWidth = context.cfg.status.background.offsetWidth;
				vfr.backgroundHeight = context.cfg.status.background.offsetHeight;
				vfr.backgroundLeft = (vfr.backgroundHeight * vfr.figureAspect - vfr.backgroundWidth) / 2;
				vfr.backgroundTop = 0;
			}
		};
		this.figures.redraw.normalise = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// normalise the canvas position

			// normalise the figure position
			if (vfr.figureWidth >= vfr.maxWidth || vfr.figureHeight >= vfr.maxHeight) {
				vfr.figureWidth = vfr.maxWidth;
				vfr.figureHeight = vfr.maxHeight;
				context.cfg.status.zoom = vfr.maxZoom;
				context.cfg.status.atMaxZoom = true;
			}
			if (vfr.figureLeft > vfr.overscanLeft) {
				vfr.figureLeft = vfr.overscanLeft;
				context.cfg.status.pan.x = vfr.maxPanLeft;
			}
			if (vfr.figureLeft < -vfr.overscanLeft) {
				vfr.figureLeft = -vfr.overscanLeft;
				context.cfg.status.pan.x = vfr.minPanLeft;
			}
			if (vfr.figureTop > vfr.overscanTop) {
				vfr.figureTop = vfr.overscanTop;
				context.cfg.status.pan.y = vfr.maxPanTop;
			}
			if (vfr.figureTop < -vfr.overscanTop) {
				vfr.figureTop = -vfr.overscanTop;
				context.cfg.status.pan.y = vfr.minPanTop;
			}
			if (vfr.figureHeight < vfr.canvasHeight) {
				vfr.figureWidth = vfr.canvasHeight / vfr.maxHeight * vfr.maxWidth;
				vfr.figureHeight = vfr.canvasHeight;
				context.cfg.status.zoom = 1;
				context.cfg.status.pan.y = 0.5;
			}
			if (vfr.figureWidth < vfr.canvasWidth) {
				vfr.figureLeft = 0;
				context.cfg.status.pan.x = 0.5;
			}
		};
		this.figures.redraw.canvas = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// figure out the relevant movement
			switch (context.cfg.zoom) {
			case 'lens' :
				var fraction, extra, range, offset;
				// set the horizontal shift
				fraction = (1 - (context.cfg.status.pos.x + vfr.backgroundLeft) / (vfr.backgroundHeight * vfr.figureAspect));
				extra = vfr.canvasWidth / vfr.figureWidth;
				range = vfr.maxPanLeft - vfr.minPanLeft + extra * 2;
				offset = vfr.minPanLeft - extra;
				context.cfg.status.pan.x = fraction * range + offset;
				// set the vertical shift
				fraction = (1 - (context.cfg.status.pos.y + vfr.backgroundTop) / vfr.backgroundHeight);
				extra = vfr.canvasHeight / vfr.figureHeight;
				range = vfr.maxPanTop - vfr.minPanTop + extra * 2;
				offset = vfr.minPanTop - extra;
				context.cfg.status.pan.y = fraction * range + offset;
				// set the positions
				context.cfg.status.canvas.style.left = parseInt(vfr.canvasLeft, 10) + 'px';
				context.cfg.status.canvas.style.top = parseInt(vfr.canvasTop, 10) + 'px';
				break;
			case 'top' :
				context.cfg.status.canvas.style.left = '0px';
				context.cfg.status.canvas.style.top = '-' + context.cfg.status.canvas.offsetHeight + 'px';
				break;
			case 'right' :
				context.cfg.status.canvas.style.left = context.cfg.status.canvas.offsetWidth + 'px';
				context.cfg.status.canvas.style.top = '0px';
				break;
			case 'bottom' :
				context.cfg.status.canvas.style.left = '0px';
				context.cfg.status.canvas.style.top = context.cfg.status.canvas.offsetHeight + 'px';
				break;
			case 'left' :
				context.cfg.status.canvas.style.left = '-' + context.cfg.status.canvas.offsetHeight + 'px';
				context.cfg.status.canvas.style.top = '0px';
				break;
			}
			// show the appropriate cursor
			if (context.cfg.zoom === 'lens') {
				context.cfg.status.cover.style.cursor = 'crosshair';
			} else if (context.cfg.status.zoom > 1 || context.cfg.spin === 'rotation') {
				context.cfg.status.cover.style.cursor = 'move';
			} else {
				context.cfg.status.cover.style.cursor = 'auto';
			}
		};
		this.figures.redraw.figures = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// set the zoomed figure dimensions
			context.cfg.status.figures[context.cfg.status.index].style.left = (context.cfg.status.pan.x * 100) + '%';
			context.cfg.status.figures[context.cfg.status.index].style.top = (context.cfg.status.pan.y * 100) + '%';
			context.cfg.status.figures[context.cfg.status.index].style.marginLeft = parseInt(vfr.figureWidth / -2, 10) + 'px';
			context.cfg.status.figures[context.cfg.status.index].style.marginTop = parseInt(vfr.figureHeight / -2, 10) + 'px';
			context.cfg.status.figures[context.cfg.status.index].style.width = parseInt(vfr.figureWidth, 10) + 'px';
			context.cfg.status.figures[context.cfg.status.index].style.height = parseInt(vfr.figureHeight, 10) + 'px';
		};
		this.figures.redraw.create = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// if streaming new tiles is allowed
			if (
				// allow/disallow streaming switch
				context.cfg.status.stream &&
				// don't stream at the initial zoom in the rotation (the initial images will be of high enough resolution)
				context.cfg.status.zoom > 1
			) {
				// divide the dimension into tiles
				var horizontalTiles = Math.ceil(vfr.figureWidth / context.cfg.grid);
				var verticalTiles = Math.ceil(vfr.figureHeight / context.cfg.grid);
				var tileName, tileWidth, tileHeight, tileTop, tileRight, tileBottom, tileLeft,
					tileId = context.cfg.figures[context.cfg.status.index],
					tileZoom = context.cfg.status.zoom.toString().replace('.', 'D'),
					cropLeft = context.cfg.lefts[context.cfg.status.index],
					cropTop = context.cfg.tops[context.cfg.status.index],
					cropWidth = context.cfg.rights[context.cfg.status.index] - cropLeft,
					cropHeight = context.cfg.bottoms[context.cfg.status.index] - cropTop;
				// for all columns
				for (var x = 0; x < horizontalTiles; x += 1) {
					// for all rows
					for (var y = 0; y < verticalTiles; y += 1) {
						// formulate the tile name
						tileName = 'fig_' + tileId + '_zoom_' + tileZoom + '_x_' + x + '_y_' + y;
						// if the tile is within the bounds of the canvas
						if (
							(x + 1) * context.cfg.grid >= vfr.offsetLeft &&
							(x) * context.cfg.grid <= vfr.offsetLeft + vfr.canvasWidth &&
							(y + 1) * context.cfg.grid >= vfr.offsetTop &&
							(y) * context.cfg.grid <= vfr.offsetTop + vfr.canvasHeight
						) {
							// if this tile doesn't exist (naming convention: tiles['fig_1_zoom_1_x_1_y_1'] = {})
							if (!context.cfg.status.tiles[tileName]) {
								// count the new tile
								context.cfg.status.count += 1;
								// create a tile at this zoom level
								context.cfg.status.tiles[tileName] = {
									'object' : document.createElement('img'),
									'figure' : context.cfg.status.index,
									'zoom' : context.cfg.status.zoom,
									'x' : x,
									'y' : y,
									'index' : context.cfg.status.count
								};
								// reveal it onload
								context.cfg.status.tiles[tileName].object.className = 'tile_hidden';
								context.figures.redraw.onTileLoad(context.cfg.status.tiles[tileName].object, context);
								// calculate the positions
								tileWidth = context.cfg.grid;
								tileHeight = context.cfg.grid;
								tileTop = (y * tileHeight / vfr.figureHeight);
								tileRight = ((x + 1) * tileWidth / vfr.figureWidth);
								tileBottom = ((y + 1) * tileHeight / vfr.figureHeight);
								tileLeft = (x * tileWidth / vfr.figureWidth);
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
								context.cfg.status.tiles[tileName].object.className = 'tile_hidden';
								context.cfg.status.tiles[tileName].object.src = context.cfg.imageslice
									.replace(context.cfg.regSrc, context.cfg.figures[context.cfg.status.index])
									.replace(context.cfg.regWidth, tileWidth)
									.replace(context.cfg.regHeight, tileHeight)
									.replace(context.cfg.regLeft, tileLeft * cropWidth + cropLeft)
									.replace(context.cfg.regTop, tileTop * cropHeight + cropTop)
									.replace(context.cfg.regRight, tileRight * cropWidth + cropLeft)
									.replace(context.cfg.regBottom, tileBottom * cropHeight + cropTop);
								// position it on the grid
								context.cfg.status.tiles[tileName].object.style.position = 'absolute';
								context.cfg.status.tiles[tileName].object.style.left = (tileLeft * 100) + '%';
								context.cfg.status.tiles[tileName].object.style.top = (tileTop * 100) + '%';
								context.cfg.status.tiles[tileName].object.style.width = (tileWidth / vfr.figureWidth * 100) + '%';
								context.cfg.status.tiles[tileName].object.style.height = (tileHeight / vfr.figureHeight * 100) + '%';
								context.cfg.status.tiles[tileName].object.style.zIndex = parseInt(context.cfg.status.zoom * 100, 10);
								// add it to the figure
								context.cfg.status.figures[context.cfg.status.index].appendChild(context.cfg.status.tiles[tileName].object);
							}
						}
					}
				}
			}
		};
		this.figures.redraw.display = function (context) {
			// shortcut pointer
			var vfr = context.figures.redraw;
			// for all tiles
			var tile = '', checkedTile;
			for (tile in context.cfg.status.tiles) {
				// validate
				if (context.cfg.status.tiles.hasOwnProperty(tile)) {
					// get the target tile
					checkedTile = context.cfg.status.tiles[tile];
					// if this is a surplus tile
					if (context.cfg.status.tiles[tile].index < context.cfg.status.count - context.cfg.cache) {
						// remove it
						context.cfg.status.tiles[tile].object.parentNode.removeChild(context.cfg.status.tiles[tile].object);
						delete context.cfg.status.tiles[tile];
					// if the tile is within the bounds of the canvas
					} else if (
						(checkedTile.x + 1) * context.cfg.grid >= vfr.offsetLeft &&
						(checkedTile.x) * context.cfg.grid <= vfr.offsetLeft + vfr.canvasWidth &&
						(checkedTile.y + 1) * context.cfg.grid >= vfr.offsetTop &&
						(checkedTile.y) * context.cfg.grid <= vfr.offsetTop + vfr.canvasHeight &&
						checkedTile.zoom <= context.cfg.status.zoom
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
		this.figures.redraw.spin = function (context) {
			// decide on the transition effect
			switch (context.cfg.spin) {
			// in case of a catalogue
			case 'catalogue' :
				// for all figures
				var clipWidth;
				for (var a = 1, b = context.cfg.status.figures.length; a < b; a += 1) {
					// clear any transition that may be in effect on this figure
					clearTimeout(context.cfg.status.transitions[a]);
					// measure the slide width
					clipWidth = context.cfg.status.figures[a].offsetWidth;
					// if this is an active slide
					if (a === context.cfg.status.index) {
						// if there is a zoom factor, disable the clipping
						if (context.cfg.status.zoom > 1) {
							context.cfg.status.figures[a].style.clip = 'rect(auto 10000px auto 0px)';
						}
						// else if the figure wasn't revealed yet
						else if (context.cfg.status.figures[a].className !== 'figure_leafin') {
							// force the clip's start situation
							context.cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
							// apply the figure class
							context.cfg.status.figures[a].className = 'figure_leafin';
							// apply the figure style
							useful.transitions.byRules(
								context.cfg.status.figures[a],
								{'clip' : 'rect(auto ' + clipWidth + 'px auto 0px)', 'transform' : 'translate(0%,0%) rotate(0deg)'},
								null,
								600
							);
						}
					}
					// else if this is a passive slide, but not unrevealed yet
					else if (context.cfg.status.figures[a].className !== 'figure_leafout') {
						// delay its return
						context.figures.redraw.onFigureUnreveal(context.cfg, a, clipWidth);
						// apply the figure class
						context.cfg.status.figures[a].className = 'figure_leafout';
					}
				}
				break;
			// in case of a slideshow
			case 'slideshow' :
				// for all figures
				for (a = 1, b = context.cfg.status.figures.length; a < b; a += 1) {
					// apply the figure class
					context.cfg.status.figures[a].className = (a === context.cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
					if (context.cfg.zoom !== 'static') {
						context.cfg.status.backgrounds[a].className = (a === context.cfg.status.index) ? 'figure_fadein' : 'figure_fadeout';
					}
				}
				break;
			// for a generic transition
			default :
				// for all figures
				for (a = 1, b = context.cfg.status.figures.length; a < b; a += 1) {
					// apply the figure class
					context.cfg.status.figures[a].className = (a === context.cfg.status.index) ? 'figure_active' : 'figure_passive';
					if (context.cfg.zoom !== 'static') {
						context.cfg.status.backgrounds[a].className = (a === context.cfg.status.index) ? 'figure_active' : 'figure_passive';
					}
				}
			}
		};
		// handlers for the events
		this.figures.redraw.onTileLoad = function (element) {
			element.addEventListener('load', function () {
				element.className = 'tile_visible';
			}, false);
		};
		this.figures.redraw.onFigureUnreveal = function (context, a, clipWidth) {
			setTimeout(function () {
				// apply the figure style
				context.cfg.status.figures[a].style.clip = 'rect(auto ' + clipWidth + 'px auto ' + clipWidth + 'px)';
				context.cfg.status.figures[a].style.webkitTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.status.figures[a].style.MozTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.status.figures[a].style.msTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.status.figures[a].style.oTransform = 'translate(25%,25%) rotate(45deg)';
				context.cfg.status.figures[a].style.transform = 'translate(25%,25%) rotate(45deg)';
			}, 750);
		};
		// mouse controls
		this.figures.mouse = {};
		this.figures.mouse.x = null;
		this.figures.mouse.y = null;
		this.figures.mouse.sensitivity = null;
		this.figures.mouse.treshold = null;
		this.figures.mouse.flick = null;
		this.figures.mouse.delay = null;
		// mouse wheel controls
		this.figures.mouse.wheel = function (event, context) {
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				context.cfg.status.zoom = context.cfg.status.zoom * context.cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				context.cfg.status.zoom = context.cfg.status.zoom / context.cfg.magnification;
			}
			// temporarily disable streaming for a while to avoid flooding
			context.cfg.status.stream = false;
			clearTimeout(uvfm.delay);
			uvfm.delay = setTimeout(function () {
				context.cfg.status.stream = true;
				context.update(context);
			}, 500);
			// call for a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.figures.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// store the touch positions
			uvfm.x = event.pageX || event.x;
			uvfm.y = event.pageY || event.y;
			// calculate the sensitivity
			uvfm.treshold = context.cfg.status.cover.offsetWidth / 10;
			uvfm.flick = context.cfg.status.cover.offsetWidth * 0.6;
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// if there is a touch in progress
			if (uvfm.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var y = event.pageY || event.y;
				var xDelta = uvfm.x - x;
				var yDelta = uvfm.y - y;
				// if the image was zoomed in
				if (context.cfg.status.zoom > 1) {
					// calculate the drag distance into %
					context.cfg.status.pan.x -= xDelta * context.cfg.status.zoom / context.cfg.status.figures[context.cfg.status.index].offsetWidth;
					context.cfg.status.pan.y -= yDelta * context.cfg.status.zoom / context.cfg.status.figures[context.cfg.status.index].offsetHeight;
					// reset the distance
					uvfm.x = x;
					uvfm.y = y;
					// order a redraw
					context.update(context);
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > uvfm.treshold && context.cfg.spin === 'rotation') ||
					Math.abs(xDelta) > uvfm.flick
				) {
					// increase the spin
					context.cfg.status.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (context.cfg.spin === 'rotation') {
						// loop the value if needed
						if (context.cfg.status.index >= context.cfg.status.figures.length) {
							context.cfg.status.index = 1;
						}
						// loop the value if needed
						if (context.cfg.status.index <= 0) {
							context.cfg.status.index = context.cfg.status.figures.length - 1;
						}
					}
					// reset the distance
					uvfm.x = x;
					uvfm.y = y;
					// order a redraw
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvfm = context.figures.mouse;
			// if there was a motion
			if (uvfm.x !== null) {
				// order a redraw
				context.update(context);
			}
			// clear the positions
			uvfm.x = null;
			uvfm.y = null;
			// cancel the click
			event.preventDefault();
		};
		this.figures.mouse.mirror = function (event, context) {
			// retrieve the mouse position
			var pos = useful.positions.cursor(event, context.cfg.status.cover);
			// measure the exact location of the interaction
			context.cfg.status.pos.x = pos.x;
			context.cfg.status.pos.y = pos.y;
			// order a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// touch screen controls
		this.figures.touch = {};
		this.figures.touch.x = null;
		this.figures.touch.y = null;
		this.figures.touch.sensitivity = null;
		this.figures.touch.treshold = null;
		this.figures.touch.flick = null;
		this.figures.touch.delay = null;
		this.figures.touch.start = function (event, context) {
			// shortcut pointer
			var uvft = context.figures.touch;
			// store the touch positions
			uvft.x = [];
			uvft.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvft.x.push(event.touches[a].pageX);
				uvft.y.push(event.touches[a].pageY);
			}
			// adjust the sensitivity
			uvft.sensitivity = (context.cfg.magnification - 1) / 5 + 1;
			uvft.treshold = context.cfg.status.cover.offsetWidth / 10;
			uvft.flick = context.cfg.status.cover.offsetWidth * 0.6;
		};
		this.figures.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// shortcut pointer
			var uvft = context.figures.touch;
			// if there is a touch in progress
			if (uvft.x !== null) {
				// store the touch positions
				var x = [];
				var y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
					y.push(event.touches[a].pageY);
				}
				var xDelta = uvft.x[0] - x[0];
				var yDelta = uvft.y[0] - y[0];
				// if there was a pinch motion
				if (x.length > 1 && uvft.x.length > 1) {
					// if the distances decreased
					if (
						Math.abs(x[0] - x[1]) + Math.abs(y[0] - y[1]) <
						Math.abs(uvft.x[0] - uvft.x[1]) + Math.abs(uvft.y[0] - uvft.y[1])
					) {
						// zoom out
						context.cfg.status.zoom = context.cfg.status.zoom / uvft.sensitivity;
					// else
					} else {
						// zoom in
						context.cfg.status.zoom = context.cfg.status.zoom * uvft.sensitivity;
					}
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
					uvft.x[1] = x[1];
					uvft.y[1] = y[1];
					// temporarily disable streaming for a while to avoid flooding
					context.cfg.status.stream = false;
					clearTimeout(uvft.delay);
					uvft.delay = setTimeout(function () {
						context.cfg.status.stream = true;
						context.update(context);
					}, 500);
				// else if there was a drag motion
				} else if (context.cfg.status.zoom > 1 || context.cfg.spin === 'slideshow') {
					// calculate the drag distance into %
					context.cfg.status.pan.x -= xDelta * context.cfg.status.zoom / context.cfg.status.figures[context.cfg.status.index].offsetWidth;
					context.cfg.status.pan.y -= yDelta * context.cfg.status.zoom / context.cfg.status.figures[context.cfg.status.index].offsetHeight;
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
				// else there was a spin gesture
				} else if (
					(Math.abs(xDelta) > uvft.treshold && context.cfg.spin === 'rotation') ||
					Math.abs(xDelta) > uvft.flick
				) {
					// increase the spin
					context.cfg.status.index += (xDelta > 0) ? 1 : -1;
					// if in spin mode
					if (context.cfg.spin === 'rotation') {
						// loop the value if needed
						if (context.cfg.status.index >= context.cfg.status.figures.length) {
							context.cfg.status.index = 1;
						}
						// loop the value if needed
						if (context.cfg.status.index <= 0) {
							context.cfg.status.index = context.cfg.status.figures.length - 1;
						}
					}
					// reset the distance
					uvft.x[0] = x[0];
					uvft.y[0] = y[0];
					// order a redraw
					context.update(context);
				}
				// order a redraw
				context.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.figures.touch.end = function (event, context) {
			// shortcut pointer
			var uvft = context.figures.touch;
			// clear the positions
			uvft.x = null;
			uvft.y = null;
			// order a redraw
			context.update(context);
		};
		this.figures.touch.mirror = function (event, context) {
			// retrieve the touch position
			var pos = useful.positions.touch(event, context.cfg.status.cover);
			// measure the exact location of the interaction
			context.cfg.status.pos.x = pos.x;
			context.cfg.status.pos.y = pos.y;
			// order a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// zoom slider
		this.zoom = {};
		this.zoom.setup = function (context) {
			// create the menu
			context.cfg.status.menus = context.cfg.status.menus || {};
			context.cfg.status.menus.zoomMenu = document.createElement('menu');
			context.cfg.status.menus.zoomMenu.className = 'slider zoom';
			context.cfg.status.menus.zoomMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the slider to the menu
			context.zoom.build.slider(context.cfg.status.menus.zoomMenu, context);
			// add a touch cover to the menu
			context.zoom.build.cover(context.cfg.status.menus.zoomMenu, context);
			// add the increase button
			context.zoom.build.increaser(context.cfg.status.menus.zoomMenu, context);
			// add the decrease button
			context.zoom.build.decreaser(context.cfg.status.menus.zoomMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.status.menus.zoomMenu);
		};
		this.zoom.build = {};
		this.zoom.build.slider = function (parent, context) {
			// add the slider to the menu
			context.cfg.status.menus.zoomIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			context.cfg.status.menus.zoomIndicator.className = 'meter';
			context.cfg.status.menus.zoomIndicator.setAttribute('min', 1);
			context.cfg.status.menus.zoomIndicator.setAttribute('max', context.cfg.heights[context.cfg.status.index] / context.cfg.status.canvas.offsetHeight);
			context.cfg.status.menus.zoomIndicator.setAttribute('value', context.cfg.status.zoom);
			context.cfg.status.menus.zoomSlider = document.createElement('div');
			context.cfg.status.menus.zoomSliderIcon = document.createElement('span');
			context.cfg.status.menus.zoomSliderIcon.innerHTML = context.cfg.status.zoom;
			context.cfg.status.menus.zoomSlider.appendChild(context.cfg.status.menus.zoomSliderIcon);
			context.cfg.status.menus.zoomIndicator.appendChild(context.cfg.status.menus.zoomSlider);
			parent.appendChild(context.cfg.status.menus.zoomIndicator);
		};
		this.zoom.build.cover = function (parent, context) {
			// add a touch cover to the menu
			context.cfg.status.menus.zoomCover = document.createElement('div');
			context.cfg.status.menus.zoomCover.className = 'cover';
			parent.appendChild(context.cfg.status.menus.zoomCover);
			// add the event handler
			var simz = context.cfg.status.menus.zoomCover;
			simz.addEventListener('mousewheel', function (event) {
				context.zoom.mouse.wheel(event, context);
			}, false);
			simz.addEventListener('DOMMouseScroll', function (event) {
				context.zoom.mouse.wheel(event, context);
			}, false);
			simz.addEventListener('mousedown', function (event) {
				context.zoom.mouse.start(event, context);
			}, false);
			simz.addEventListener('mousemove', function (event) {
				context.zoom.mouse.move(event, context);
			}, false);
			simz.addEventListener('mouseup', function (event) {
				context.zoom.mouse.end(event, context);
			}, false);
			simz.addEventListener('mouseout', function (event) {
				context.zoom.mouse.end(event, context);
			}, false);
			// add the touch events
			simz.addEventListener('touchstart', function (event) {
				context.zoom.touch.start(event, context);
			}, false);
			simz.addEventListener('touchmove', function (event) {
				context.zoom.touch.move(event, context);
			}, false);
			simz.addEventListener('touchend', function (event) {
				context.zoom.touch.end(event, context);
			}, false);
		};
		this.zoom.build.increaser = function (parent, context) {
			// add the increase button
			context.cfg.status.menus.zoomIn = document.createElement('button');
			context.cfg.status.menus.zoomIn.className = 'increase';
			context.cfg.status.menus.zoomInIcon = document.createElement('span');
			context.cfg.status.menus.zoomInIcon.innerHTML = 'Zoom in';
			context.cfg.status.menus.zoomIn.appendChild(context.cfg.status.menus.zoomInIcon);
			parent.appendChild(context.cfg.status.menus.zoomIn);
			// add the event handlers
			context.cfg.status.menus.zoomIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.zoom.increase(context);
				// cancel streaming
				context.cfg.status.stream = false;
				// repeat
				context.cfg.status.menus.zoomInRepeat = setInterval(function () { context.zoom.increase(context); }, 300);
				// cancel this event
				event.preventDefault();
			}, false);
			context.cfg.status.menus.zoomIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.status.menus.zoomInRepeat);
				// allow streaming
				context.cfg.status.stream = true;
				// redraw
				context.update(context);
			}, false);
			context.cfg.status.menus.zoomIn.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
		this.zoom.build.decreaser = function (parent, context) {
			// add the decrease button
			context.cfg.status.menus.zoomOut = document.createElement('button');
			context.cfg.status.menus.zoomOut.className = 'decrease';
			context.cfg.status.menus.zoomOutIcon = document.createElement('span');
			context.cfg.status.menus.zoomOutIcon.innerHTML = 'Zoom out';
			context.cfg.status.menus.zoomOut.appendChild(context.cfg.status.menus.zoomOutIcon);
			parent.appendChild(context.cfg.status.menus.zoomOut);
			context.cfg.status.menus.zoomOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.zoom.decrease(context);
				// cancel streaming
				context.cfg.status.stream = false;
				// repeat
				context.cfg.status.menus.zoomOutRepeat = setInterval(function () { context.zoom.decrease(context); }, 300);
				// cancel this event
				event.preventDefault();
			}, false);
			context.cfg.status.menus.zoomOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.status.menus.zoomOutRepeat);
				// allow streaming
				context.cfg.status.stream = true;
				// redraw
				context.update(context);
			}, false);
			context.cfg.status.menus.zoomOut.addEventListener('click', function (event) {
				// cancel this event
				event.preventDefault();
			}, false);
		};
		this.zoom.update = function (context) {
			// gather the constants
			var minZoom = 1,
				maxZoom = context.cfg.heights[context.cfg.status.index] / context.cfg.status.canvas.offsetHeight,
				curZoom = context.cfg.status.zoom;
			// update the value
			context.cfg.status.menus.zoomIndicator.setAttribute('value', curZoom);
			context.cfg.status.menus.zoomSliderIcon.innerHTML = curZoom;
			// reposition the slider
			context.cfg.status.menus.zoomSlider.style.top = (100 - (curZoom - minZoom) / (maxZoom - minZoom) * 100) + '%';
		};
		this.zoom.increase = function (context) {
			// increase the zoom factor
			context.cfg.status.zoom = context.cfg.status.zoom * context.cfg.magnification;
			// order a redraw
			context.update(context);
		};
		this.zoom.decrease = function (context) {
			// decrease the zoom factor
			context.cfg.status.zoom = context.cfg.status.zoom / context.cfg.magnification;
			// order a redraw
			context.update(context);
		};
		// mouse controls
		this.zoom.mouse = {};
		this.zoom.mouse.y = null;
		this.zoom.mouse.distance = null;
		this.zoom.mouse.sensitivity = null;
		this.zoom.mouse.fudge = 1.1;
		// mouse wheel controls
		this.zoom.mouse.wheel = function (event, context) {
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the zoom factor
				context.cfg.status.zoom = context.cfg.status.zoom * context.cfg.magnification;
			} else if (distance > 0) {
				// decrease the zoom factor
				context.cfg.status.zoom = context.cfg.status.zoom / context.cfg.magnification;
			}
			// call for a redraw
			context.update(context);
			// cancel the scrolling
			event.preventDefault();
		};
		// mouse gesture controls
		this.zoom.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// store the touch positions
			uvzm.y = event.pageY || event.y;
			uvzm.distance = context.cfg.status.menus.zoomCover.offsetHeight - context.cfg.status.menus.zoomIn.offsetHeight - context.cfg.status.menus.zoomOut.offsetHeight;
			uvzm.sensitivity = context.cfg.heights[context.cfg.status.index] / context.cfg.status.canvas.offsetHeight - 1;
			// cancel the click
			event.preventDefault();
		};
		this.zoom.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// if there is a touch in progress
			if (uvzm.y !== null) {
				// store the touch positions
				var y = event.pageY || event.y;
				// calculate the drag distance into %
				context.cfg.status.zoom += (uvzm.y - y) / uvzm.distance * uvzm.sensitivity * uvzm.fudge;
				// reset the distance
				uvzm.y = y;
				// disable streaming new images
				context.cfg.status.stream = false;
				// order a redraw
				context.update(context);
			}
			// cancel the click
			event.preventDefault();
		};
		this.zoom.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvzm = context.zoom.mouse;
			// clear the positions
			uvzm.y = null;
			// enable streaming new images
			context.cfg.status.stream = true;
			// order a redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// touch screen controls
		this.zoom.touch = {};
		this.zoom.touch.y = null;
		this.zoom.touch.distance = null;
		this.zoom.touch.sensitivity = null;
		this.zoom.touch.fudge = 1.1;
		this.zoom.touch.start = function (event, context) {
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// store the touch positions
			uvzt.y = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvzt.y.push(event.touches[a].pageY);
			}
			// calculate the sensitivity
			uvzt.distance = context.cfg.status.menus.zoomCover.offsetHeight - context.cfg.status.menus.zoomIn.offsetHeight - context.cfg.status.menus.zoomOut.offsetHeight;
			uvzt.sensitivity = context.cfg.heights[context.cfg.status.index] / context.cfg.status.canvas.offsetHeight - 1;
		};
		this.zoom.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// if there is a touch in progress
			if (uvzt.y !== null) {
				// store the touch positions
				var y;
				y = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					y.push(event.touches[a].pageY);
				}
				// calculate the drag distance into %
				context.cfg.status.zoom += (uvzt.y[0] - y[0]) / uvzt.distance * uvzt.sensitivity * uvzt.fudge;
				// reset the distance
				uvzt.y[0] = y[0];
				// disable streaming new images
				context.cfg.status.stream = false;
				// order a redraw
				context.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.zoom.touch.end = function (event, context) {
			// shortcut pointer
			var uvzt = context.zoom.touch;
			// clear the positions
			uvzt.y = null;
			// enable streaming new images
			context.cfg.status.stream = true;
			// order a redraw
			context.update(context);
		};
		// spin slider
		this.spin = {};
		this.spin.setup = function (context) {
			// create the menu
			context.cfg.status.menus = context.cfg.status.menus || {};
			context.cfg.status.menus.spinMenu = document.createElement('menu');
			context.cfg.status.menus.spinMenu.className = 'slider spin';
			context.cfg.status.menus.spinMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the slider to the menu
			context.spin.build.slider(context.cfg.status.menus.spinMenu, context);
			// add a touch cover to the menu
			context.spin.build.cover(context.cfg.status.menus.spinMenu, context);
			// add the increase button
			context.spin.build.increaser(context.cfg.status.menus.spinMenu, context);
			// add the decrease button
			context.spin.build.decreaser(context.cfg.status.menus.spinMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.status.menus.spinMenu);
		};
		this.spin.build = {};
		this.spin.build.slider = function (parent, context) {
			// add the slider to the menu
			context.cfg.status.menus.spinIndicator = (navigator.userAgent.match(/WebKit/) || true) ? document.createElement('div') : document.createElement('meter');
			context.cfg.status.menus.spinIndicator.className = 'meter';
			context.cfg.status.menus.spinIndicator.setAttribute('min', 1);
			context.cfg.status.menus.spinIndicator.setAttribute('max', context.cfg.figures.length);
			context.cfg.status.menus.spinIndicator.setAttribute('value', context.cfg.status.index);
			context.cfg.status.menus.spinSlider = document.createElement('div');
			context.cfg.status.menus.spinSliderIcon = document.createElement('span');
			context.cfg.status.menus.spinSliderIcon.innerHTML = context.cfg.status.index;
			context.cfg.status.menus.spinSlider.appendChild(context.cfg.status.menus.spinSliderIcon);
			context.cfg.status.menus.spinIndicator.appendChild(context.cfg.status.menus.spinSlider);
			parent.appendChild(context.cfg.status.menus.spinIndicator);
		};
		this.spin.build.cover = function (parent, context) {
			// add a touch cover to the menu
			context.cfg.status.menus.spinCover = document.createElement('div');
			context.cfg.status.menus.spinCover.className = 'cover';
			parent.appendChild(context.cfg.status.menus.spinCover);
			var sims = context.cfg.status.menus.spinCover;
			// add the event handler
			sims.addEventListener('mousewheel', function (event) {
				context.spin.mouse.wheel(event, context);
			}, false);
			sims.addEventListener('DOMMouseScroll', function (event) {
				context.spin.mouse.wheel(event, context);
			}, false);
			sims.addEventListener('mousedown', function (event) {
				context.spin.mouse.start(event, context);
			}, false);
			sims.addEventListener('mousemove', function (event) {
				context.spin.mouse.move(event, context);
			}, false);
			sims.addEventListener('mouseup', function (event) {
				context.spin.mouse.end(event, context);
			}, false);
			sims.addEventListener('mouseout', function (event) {
				context.spin.mouse.end(event, context);
			}, false);
			// add the touch events
			sims.addEventListener('touchstart', function (event) {
				context.spin.touch.start(event, context);
			}, false);
			sims.addEventListener('touchmove', function (event) {
				context.spin.touch.move(event, context);
			}, false);
			sims.addEventListener('touchend', function (event) {
				context.spin.touch.end(event, context);
			}, false);
		};
		this.spin.build.increaser = function (parent, context) {
			// add the increase button
			context.cfg.status.menus.spinIn = document.createElement('button');
			context.cfg.status.menus.spinIn.className = 'increase';
			context.cfg.status.menus.spinInIcon = document.createElement('span');
			context.cfg.status.menus.spinInIcon.innerHTML = 'Spin left';
			context.cfg.status.menus.spinIn.appendChild(context.cfg.status.menus.spinInIcon);
			parent.appendChild(context.cfg.status.menus.spinIn);
			context.cfg.status.menus.spinIn.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.spin.increase(context);
				// cancel streaming
				context.cfg.status.stream = false;
				// repeat
				context.cfg.status.menus.spinInRepeat = setInterval(function () { context.spin.increase(context); }, 100);
				// cancel this event
				event.preventDefault();
			}, false);
			context.cfg.status.menus.spinIn.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.status.menus.spinInRepeat);
				// allow streaming
				context.cfg.status.stream = true;
				// redraw
				context.update(context);
			}, false);
		};
		this.spin.build.decreaser = function (parent, context) {
			// add the decrease button
			context.cfg.status.menus.spinOut = document.createElement('button');
			context.cfg.status.menus.spinOut.className = 'decrease';
			context.cfg.status.menus.spinOutIcon = document.createElement('span');
			context.cfg.status.menus.spinOutIcon.innerHTML = 'Spin right';
			context.cfg.status.menus.spinOut.appendChild(context.cfg.status.menus.spinOutIcon);
			parent.appendChild(context.cfg.status.menus.spinOut);
			context.cfg.status.menus.spinOut.addEventListener('mousedown', function (event) {
				// increase the zoom
				context.spin.decrease(context);
				// cancel streaming
				context.cfg.status.stream = false;
				// repeat
				context.cfg.status.menus.spinOutRepeat = setInterval(function () { context.spin.decrease(context); }, 100);
				// cancel this event
				event.preventDefault();
			}, false);
			context.cfg.status.menus.spinOut.addEventListener('mouseup', function () {
				// stop repeating
				clearInterval(context.cfg.status.menus.spinOutRepeat);
				// allow streaming
				context.cfg.status.stream = true;
				// redraw
				context.update(context);
			}, false);
		};
		this.spin.update = function (context) {
			// reposition the slider
			context.cfg.status.menus.spinSlider.style.left = ((context.cfg.status.index - 1) / (context.cfg.status.figures.length - 2) * 100) + '%';
			// update the value
			context.cfg.status.menus.spinIndicator.setAttribute('value', context.cfg.status.index);
			context.cfg.status.menus.spinSliderIcon.innerHTML = context.cfg.status.index;
		};
		this.spin.increase = function (context) {
			// decrease the spin index
			context.cfg.status.index -= 1;
			// loop the value if needed
			if (context.cfg.status.index <= 0) {
				context.cfg.status.index = context.cfg.status.figures.length - 1;
			}
			// order a redraw
			context.update(context);
		};
		this.spin.decrease = function (context) {
			// increase the spin index
			context.cfg.status.index += 1;
			// loop the value if needed
			if (context.cfg.status.index >= context.cfg.status.figures.length) {
				context.cfg.status.index = 1;
			}
			// order a redraw
			context.update(context);
		};
		// mouse wheel controls
		this.spin.mouse = {};
		this.spin.mouse.x = null;
		this.spin.mouse.sensitivity = null;
		this.spin.mouse.fudge = 0.7;
		// mouse wheel controls
		this.spin.mouse.wheel = function (event, context) {
			// shortcut pointer
			var uvs = context.spin;
			// get the reading from the mouse wheel
			var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
			// do not loop around
			if (distance < 0) {
				// increase the spin index
				uvs.increase(event, context);
			} else if (distance > 0) {
				// decrease the spin index
				uvs.decrease(event, context);
			}
		};
		// mouse gesture controls
		this.spin.mouse.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// store the touch positions
			uvsm.x = event.pageX || event.x;
			// calculate the sensitivity
			uvsm.sensitivity = (context.cfg.status.menus.spinCover.offsetWidth - context.cfg.status.menus.spinIn.offsetWidth - context.cfg.status.menus.spinOut.offsetWidth) / context.cfg.status.figures.length * uvsm.fudge;
			// cancel the click
			event.preventDefault();
		};
		this.spin.mouse.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// if there is a touch in progress
			if (uvsm.x !== null) {
				// store the touch positions
				var x = event.pageX || event.x;
				var distance = uvsm.x - x;
				// if the draw was to the left
				if (distance < -uvsm.sensitivity) {
					// increase the spin index
					context.cfg.status.index += 1;
					// reset the distance
					uvsm.x = x;
					// order a redraw
					context.update(context);
				// else if the drag was to the right
				} else if (distance > uvsm.sensitivity) {
					// decrease the spin index
					context.cfg.status.index -= 1;
					// reset the distance
					uvsm.x = x;
					// order a redraw
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		this.spin.mouse.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvsm = context.spin.mouse;
			// clear the positions
			uvsm.x = null;
			// cancel the click
			event.preventDefault();
		};
		// touch screen controls
		this.spin.touch = {};
		this.spin.touch.x = null;
		this.spin.touch.sensitivity = null;
		// mouse gesture controls
		this.spin.touch.start = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// store the touch positions
			uvst.x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				uvst.x.push(event.touches[a].pageX);
			}
			// calculate the sensitivity
			uvst.sensitivity = (context.cfg.status.menus.spinCover.offsetWidth - context.cfg.status.menus.spinIn.offsetWidth - context.cfg.status.menus.spinOut.offsetWidth) / context.cfg.status.figures.length;
			// cancel the click
			event.preventDefault();
		};
		this.spin.touch.move = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// if there is a touch in progress
			if (uvst.x !== null) {
				// store the touch positions
				var x = [];
				for (var a = 0, b = event.touches.length; a < b; a += 1) {
					x.push(event.touches[a].pageX);
				}
				var distance = uvst.x[0] - x[0];
				// if the draw was to the left
				if (distance < -uvst.sensitivity) {
					// increase the spin index
					context.cfg.status.index += 1;
					// loop the value if needed
					if (context.cfg.status.index >= context.cfg.status.figures.length) {
						context.cfg.status.index = 1;
					}
					// reset the distance
					uvst.x[0] = x[0];
					// order a redraw
					context.update(context);
				// else if the drag was to the right
				} else if (distance > uvst.sensitivity) {
					// decrease the spin index
					context.cfg.status.index -= 1;
					// loop the value if needed
					if (context.cfg.status.index <= 0) {
						context.cfg.status.index = context.cfg.status.figures.length - 1;
					}
					// reset the distance
					uvst.x[0] = x[0];
					// order a redraw
					context.update(context);
				}
			}
		};
		this.spin.touch.end = function (event, context) {
			// get the event properties
			event = event || window.event;
			// shortcut pointer
			var uvst = context.spin.touch;
			// clear the positions
			uvst.x = null;
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnails
		this.thumbnails = {};
		// build the thumbnail list
		this.thumbnails.setup = function (context) {
			// create the navigation bar
			context.cfg.status.slideNav = document.createElement('nav');
			context.cfg.status.slideNav.className = 'thumbnails';
			context.cfg.status.slideDiv = document.createElement('div');
			context.cfg.status.slideUl = document.createElement('ul');
			// force the height of the nav if desired
			if (context.cfg.divide !== '100%') {
				context.cfg.status.slideNav.style.height = (100 - context.cfg.divide * 100 - parseInt(context.cfg.margin, 10)) + '%';
			}
			if (context.cfg.margin) {
				context.cfg.pixelMargin = parseInt(context.obj.offsetWidth * parseInt(context.cfg.margin, 10) / 100, 10);
			}
			// for all thumbnails in the context.cfg
			context.cfg.status.thumbnails = [0];
			for (var a = 1; a < context.cfg.thumbnails.length; a += 1) {
				// create a new thumbnail
				var newLi = document.createElement('li');
				var newA = document.createElement('a');
				newA.className = (a === 1) ? context.cfg.navigation + '_active' : context.cfg.navigation + '_passive';
				var newImage = document.createElement('img');
				newImage.alt = '';
				newImage.src = context.cfg.thumbnails[a];
				newA.appendChild(newImage);
				newLi.appendChild(newA);
				// insert the new nodes
				context.cfg.status.slideUl.appendChild(newLi);
				// store the dom pointers to the images
				context.cfg.status.thumbnails[a] = newA;
			}
			// insert the navigation bar
			context.cfg.status.slideDiv.appendChild(context.cfg.status.slideUl);
			context.cfg.status.slideNav.appendChild(context.cfg.status.slideDiv);
			context.obj.appendChild(context.cfg.status.slideNav);
			// for all thumbnails in the context.cfg
			for (a = 1; a < context.cfg.thumbnails.length; a += 1) {
				// assign the event handler
				context.thumbnails.onThumbnailClick(context.cfg.status.thumbnails[a], context);
			}
			// start the menu
			context.thumbnails.menu.setup(context);
		};
		// event handlers
		this.thumbnails.onThumbnailClick = function (element, context) {
			element.addEventListener('click', function (event) {
				context.thumbnails.set(event, element, context);
			}, false);
		};
		// redraw/recentre the thumbnails according to the context.cfg
		this.thumbnails.update = function (context) {
			// update the thumbnails menu
			context.thumbnails.menu.update(context);
			/// highlight the icons
			context.thumbnails.hightlightIcons(context);
			// centre the icons
			context.thumbnails.centreIcons(context);
			// centre the slider
			context.thumbnails.centreSlider(context);
		};
		// highlight active icon
		this.thumbnails.hightlightIcons = function (context) {
			// for all thumbnails
			for (var a = 1, b = context.cfg.thumbnails.length; a < b; a += 1) {
				// highlight the active slide
				context.cfg.status.thumbnails[a].className = (context.cfg.status.index === a) ? context.cfg.navigation + '_active' : context.cfg.navigation + '_passive';
			}
		};
		// centre the icons in containers
		this.thumbnails.centreIcons = function (context) {
			var imageObject, imageWidth, imageHeight, rowHeight;
			// measure the available space
			rowHeight = context.cfg.status.slideNav.offsetHeight;
			// for all thumbnails
			for (var a = 1, b = context.cfg.thumbnails.length; a < b; a += 1) {
				// centre the image in its surroundings
				context.cfg.status.thumbnails[a].style.width =  rowHeight + 'px';
				imageObject = context.cfg.status.thumbnails[a].getElementsByTagName('img')[0];
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
		this.thumbnails.centreSlider = function (context) {
			// scroll the slider enough to center the active slide
			var activeThumbnail = context.cfg.status.thumbnails[context.cfg.status.index];
			var activePosition = activeThumbnail.offsetLeft;
			var activeWidth = activeThumbnail.offsetWidth;
			var scrollDistance = context.cfg.status.slideDiv.offsetWidth;
			var centeredPosition = -activePosition + scrollDistance / 2 - activeWidth / 2;
			centeredPosition = (centeredPosition > 0) ? 0 : centeredPosition;
			centeredPosition = (centeredPosition < context.cfg.scrollMax && context.cfg.scrollMax < 0) ? context.cfg.scrollMax : centeredPosition;
			// transition to the new position
			useful.transitions.byRules(
				context.cfg.status.slideUl,
				{'marginLeft' : centeredPosition + 'px'}
			);
		};
		// activate a corresponding figure
		this.thumbnails.set = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			// count which thumbnail this is
			for (var a = 1; a < context.cfg.status.thumbnails.length; a += 1) {
				if (context.cfg.status.thumbnails[a] === node) {
					// change the index to this slide
					context.cfg.status.index = a;
					// reset the zoom
					context.cfg.status.zoom = (context.cfg.zoom !== 'static') ? context.cfg.max : 1;
					// redraw all
					context.update(context);
				}
			}
			// cancel the click
			event.preventDefault();
		};
		// manages the thumbnail controls
		this.thumbnails.menu = {};
		// build the menu options
		this.thumbnails.menu.setup = function (context) {
			// create the thumbnail controls
			context.cfg.status.pageMenu = document.createElement('menu');
			context.cfg.status.pageMenu.className = 'scroller';
			context.cfg.status.nextPage = document.createElement('button');
			context.cfg.status.nextPage.className = 'next';
			context.cfg.status.nextPageIcon = document.createElement('span');
			context.cfg.status.nextPageIcon.innerHTML = '&gt';
			context.cfg.status.prevPage = document.createElement('button');
			context.cfg.status.prevPage.className = 'previous';
			context.cfg.status.prevPageIcon = document.createElement('span');
			context.cfg.status.prevPageIcon.innerHTML = '&lt';
			context.cfg.status.nextPage.appendChild(context.cfg.status.nextPageIcon);
			context.cfg.status.pageMenu.appendChild(context.cfg.status.nextPage);
			context.cfg.status.prevPage.appendChild(context.cfg.status.prevPageIcon);
			context.cfg.status.pageMenu.appendChild(context.cfg.status.prevPage);
			context.cfg.status.slideNav.appendChild(context.cfg.status.pageMenu);
			// apply clicks to the thumbnail controls
			context.cfg.status.nextPage.addEventListener('click', function (event) {
				context.thumbnails.menu.next(event, context.cfg.status.nextSlide, context);
			}, false);
			context.cfg.status.prevPage.addEventListener('click', function (event) {
				context.thumbnails.menu.prev(event, context.cfg.status.prevSlide, context);
			}, false);
		};
		// show or hide the previous and next buttons
		this.thumbnails.menu.update = function (context) {
			// calculate the current position
			context.cfg.scrollPosition = (context.cfg.status.slideUl.style.marginLeft) ? parseInt(context.cfg.status.slideUl.style.marginLeft, 10) : 0;
			context.cfg.scrollDistance = context.cfg.status.slideDiv.offsetWidth;
			// calculate the minimum position
			context.cfg.scrollMin = 0;
			// calculate the maximum position
			var lastThumbnail = context.cfg.status.thumbnails[context.cfg.status.thumbnails.length - 1];
			context.cfg.scrollStep = lastThumbnail.offsetWidth;
			context.cfg.scrollMax = -1 * (lastThumbnail.offsetLeft + lastThumbnail.offsetWidth) + context.cfg.scrollDistance;
			// show or hide the prev button
			context.cfg.status.prevPage.className = context.cfg.status.prevPage.className.replace(/ disabled/gi, '');
			context.cfg.status.prevPage.className += (context.cfg.scrollPosition >= context.cfg.scrollMin) ? ' disabled' : '';
			// show or hide the next button
			context.cfg.status.nextPage.className = context.cfg.status.nextPage.className.replace(/ disabled/gi, '');
			context.cfg.status.nextPage.className += (context.cfg.scrollPosition <= context.cfg.scrollMax && context.cfg.scrollMax < 0) ? ' disabled' : '';
		};
		// show the next page of thumbnails
		this.thumbnails.menu.next = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = context.cfg.scrollPosition - context.cfg.scrollDistance + context.cfg.scrollStep;
				// limit the scroll distance
				if (newPosition < context.cfg.scrollMax) {
					newPosition = context.cfg.scrollMax;
				}
				// transition to the new position
				useful.transitions.byRules(context.cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				context.thumbnails.menu.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		// show the previous page of thumbnails
		this.thumbnails.menu.prev = function (event, node, context) {
			// get the event properties
			event = event || window.event;
			var target = event.target || event.srcElement;
			// if the button is not disabled
			if (!target.className.match(/disabled/)) {
				// scroll one page's width of thumbnails
				var newPosition = context.cfg.scrollPosition + context.cfg.scrollDistance - context.cfg.scrollStep;
				// limit the scroll distance
				if (newPosition > 0) {
					newPosition = 0;
				}
				// transition to the new position
				useful.transitions.byRules(context.cfg.status.slideUl, {'marginLeft' : newPosition + 'px'});
				// redraw the menu buttons
				context.thumbnails.menu.update(context);
			}
			// cancel the click
			target.blur();
			event.preventDefault();
		};
		this.leaf = {};
		// build the leafing toolbar
		this.leaf.setup = function (context) {
			// create the menu
			context.cfg.status.menus = context.cfg.status.menus || {};
			context.cfg.status.menus.leafMenu = document.createElement('menu');
			context.cfg.status.menus.leafMenu.className = 'slider leaf';
			context.cfg.status.menus.leafMenu.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// create the page indicator
			context.leaf.build.indicator(context.cfg.status.menus.leafMenu, context);
			// create the reset button
			context.leaf.build.resetter(context.cfg.status.menus.leafMenu, context);
			// create the next button
			context.leaf.build.increaser(context.cfg.status.menus.leafMenu, context);
			// create the previous button
			context.leaf.build.decreaser(context.cfg.status.menus.leafMenu, context);
			// add the menu to the interface
			context.obj.appendChild(context.cfg.status.menus.leafMenu);
		};
		this.leaf.build = {};
		this.leaf.build.indicator = function (parent, context) {
			// create the page indicator
			context.cfg.status.menus.leafPage = document.createElement('form');
			context.cfg.status.menus.leafPageInput = document.createElement('input');
			context.cfg.status.menus.leafPageInput.setAttribute('type', 'text');
			context.cfg.status.menus.leafPageCount = document.createElement('span');
			context.cfg.status.menus.leafPageCount.className = 'count';
			context.cfg.status.menus.leafPageSubmit = document.createElement('button');
			context.cfg.status.menus.leafPageSubmit.setAttribute('type', 'submit');
			context.cfg.status.menus.leafPageSubmit.style.position = 'absolute';
			context.cfg.status.menus.leafPageSubmit.style.left = '-999em';
			context.cfg.status.menus.leafPage.appendChild(context.cfg.status.menus.leafPageInput);
			context.cfg.status.menus.leafPage.appendChild(context.cfg.status.menus.leafPageCount);
			parent.appendChild(context.cfg.status.menus.leafPage);
			context.cfg.status.menus.leafPageInput.addEventListener('change', function (event) {
				context.leaf.typed(event, context);
			}, false);
			context.cfg.status.menus.leafPage.addEventListener('submit', function (event) {
				context.leaf.typed(event, context);
				event.preventDefault();
			}, false);
		};
		this.leaf.build.resetter = function (parent, context) {
			// create the reset button
			context.cfg.status.menus.leafReset = document.createElement('button');
			context.cfg.status.menus.leafReset.className = 'reset';
			context.cfg.status.menus.leafResetIcon = document.createElement('span');
			context.cfg.status.menus.leafResetIcon.innerHTML = 'Reset view';
			context.cfg.status.menus.leafReset.appendChild(context.cfg.status.menus.leafResetIcon);
			parent.appendChild(context.cfg.status.menus.leafReset);
			context.cfg.status.menus.leafReset.addEventListener('click', function (event) {
				context.leaf.reset(event, context);
			}, false);
		};
		this.leaf.build.increaser = function (parent, context) {
			// create the next button
			context.cfg.status.menus.leafIn = document.createElement('button');
			context.cfg.status.menus.leafIn.className = 'increase';
			context.cfg.status.menus.leafInIcon = document.createElement('span');
			context.cfg.status.menus.leafInIcon.innerHTML = 'Leaf forward';
			context.cfg.status.menus.leafIn.appendChild(context.cfg.status.menus.leafInIcon);
			parent.appendChild(context.cfg.status.menus.leafIn);
			context.cfg.status.menus.leafIn.addEventListener('click', function (event) {
				context.leaf.increase(event, context);
			}, false);
		};
		this.leaf.build.decreaser = function (parent, context) {
			// create the previous button
			context.cfg.status.menus.leafOut = document.createElement('button');
			context.cfg.status.menus.leafOut.className = 'decrease';
			context.cfg.status.menus.leafOutIcon = document.createElement('span');
			context.cfg.status.menus.leafOutIcon.innerHTML = 'Leaf back';
			context.cfg.status.menus.leafOut.appendChild(context.cfg.status.menus.leafOutIcon);
			parent.appendChild(context.cfg.status.menus.leafOut);
			context.cfg.status.menus.leafOut.addEventListener('click', function (event) {
				context.leaf.decrease(event, context);
			}, false);
		};
		// updates the leafing toolbar
		this.leaf.update = function (context) {
			// fill in the current page
			context.cfg.status.menus.leafPageInput.value = context.cfg.status.index;
			// fill in the page total
			context.cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(context.cfg.status.figures.length - 1);
		};
		this.leaf.increase = function (event, context) {
			// decrease the spin index
			context.cfg.status.index += 1;
			// look if needed
			if (context.cfg.toolbars === 'buttons') {
				// loop the value if needed
				if (context.cfg.status.index >= context.cfg.status.figures.length) {
					context.cfg.status.index = 1;
				}
				// loop the value if needed
				if (context.cfg.status.index <= 0) {
					context.cfg.status.index = context.cfg.status.figures.length - 1;
				}
			}
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.leaf.decrease = function (event, context) {
			// decrease the spin index
			context.cfg.status.index -= 1;
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		this.leaf.typed = function (event, context) {
			// get the typed number
			var number = parseInt(context.cfg.status.menus.leafPageInput.value, 10);
			// if the typed number is acceptable
			if (!isNaN(number)) {
				// accept the value
				context.cfg.status.index = number;
			}
			// update the interface
			context.update(context);
		};
		this.leaf.reset = function (event, context) {
			// reset the zoom level
			context.cfg.status.zoom = (context.cfg.zoom !== 'static') ? context.cfg.max : 1;
			// redraw
			context.update(context);
			// cancel the click
			event.preventDefault();
		};
		// minimal superset of controls
		this.toolbar = {};
		this.toolbar.setup = function (context) {
			// create the menu
			context.cfg.status.menus = context.cfg.status.menus || {};
			context.cfg.status.menus.toolbarNav = document.createElement('nav');
			context.cfg.status.menus.toolbarNav.className = context.cfg.toolbars + ' ' + context.cfg.spin;
			context.cfg.status.menus.toolbarNav.style.bottom = ((1 - context.cfg.divide) * 100) + '%';
			// add the zoom buttons
			context.cfg.status.menus.toolbarZoom = document.createElement('menu');
			context.cfg.status.menus.toolbarZoom.className = 'zoom';
			context.zoom.build.increaser(context.cfg.status.menus.toolbarZoom, context);
			context.zoom.build.decreaser(context.cfg.status.menus.toolbarZoom, context);
			context.cfg.status.menus.toolbarNav.appendChild(context.cfg.status.menus.toolbarZoom);
			// setup the right toolbar
			switch (context.cfg.spin) {
			case 'rotation' :
				// create the menu
				context.cfg.status.menus.toolbarSpin = document.createElement('menu');
				context.cfg.status.menus.toolbarSpin.className = 'spin';
				// add the spin buttons
				context.spin.build.decreaser(context.cfg.status.menus.toolbarSpin, context);
				context.spin.build.increaser(context.cfg.status.menus.toolbarSpin, context);
				// add the menu to the toolbar
				context.cfg.status.menus.toolbarNav.appendChild(context.cfg.status.menus.toolbarSpin);
				break;
			case 'slideshow' :
				// create the menu
				context.cfg.status.menus.toolbarLeaf = document.createElement('menu');
				context.cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the previous button
				context.leaf.build.decreaser(context.cfg.status.menus.toolbarLeaf, context);
				// add the next button
				context.leaf.build.increaser(context.cfg.status.menus.toolbarLeaf, context);
				// add the menu to the toolbar
				context.cfg.status.menus.toolbarNav.appendChild(context.cfg.status.menus.toolbarLeaf);
				break;
			case 'catalogue' :
				// create the menu
				context.cfg.status.menus.toolbarLeaf = document.createElement('menu');
				context.cfg.status.menus.toolbarLeaf.className = 'leaf';
				// add the reset button
				context.leaf.build.resetter(context.cfg.status.menus.toolbarLeaf, context);
				// add the indicator display
				context.leaf.build.indicator(context.cfg.status.menus.toolbarLeaf, context);
				// add the previous button
				context.leaf.build.decreaser(context.cfg.status.menus.toolbarLeaf, context);
				// add the next button
				context.leaf.build.increaser(context.cfg.status.menus.toolbarLeaf, context);
				// add the reset button
				//context.leaf.build.resetter(context.cfg.status.menus.toolbarLeaf, context);
				// add the menu to the toolbar
				context.cfg.status.menus.toolbarNav.appendChild(context.cfg.status.menus.toolbarLeaf);
				break;
			}
			// add the menu to the interface
			context.obj.appendChild(context.cfg.status.menus.toolbarNav);
		};
		this.toolbar.update = function (context) {
			// hide/show the zoom out button
			context.cfg.status.menus.zoomIn.className = context.cfg.status.menus.zoomIn.className.replace(/ disabled/gi, '');
			context.cfg.status.menus.zoomIn.className += (context.cfg.status.atMaxZoom) ? ' disabled' : '';
			// hide/show the zoom in button
			context.cfg.status.menus.zoomOut.className = context.cfg.status.menus.zoomOut.className.replace(/ disabled/gi, '');
			context.cfg.status.menus.zoomOut.className += (context.cfg.status.atMinZoom) ? ' disabled' : '';
			// update the right toolbar
			switch (context.cfg.spin) {
			case 'rotation' :
				break;
			case 'slideshow' :
				// hide/show the previous button
				context.cfg.status.menus.leafIn.className = context.cfg.status.menus.leafIn.className.replace(/ disabled/gi, '');
				context.cfg.status.menus.leafIn.className += (context.cfg.status.atMaxLeaf) ? ' disabled' : '';
				// hide/show the next button
				context.cfg.status.menus.leafOut.className = context.cfg.status.menus.leafOut.className.replace(/ disabled/gi, '');
				context.cfg.status.menus.leafOut.className += (context.cfg.status.atMinLeaf) ? ' disabled' : '';
				break;
			case 'catalogue' :
				// fill in the current page
				context.cfg.status.menus.leafPageInput.value = context.cfg.status.index;
				// fill in the page total
				context.cfg.status.menus.leafPageCount.innerHTML = 'of ' +	(context.cfg.status.figures.length - 1);
				break;
			}
		};
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

}(window.useful = window.useful || {}));
