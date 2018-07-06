// extend the class
Viewer.prototype.Main = function (context) {

	// PROPERTIES

	this.context = null;
	this.config = null;

	// METHODS

	this.init = function (context) {
		// store the context
		this.context = context;
		this.config = context.config;
		// automatic idle slideshow
		this.automatic = new this.context.Automatic(this);
		// manages the main view
		this.figures = new this.context.Figures(this);
		// zoom slider
		this.zoom = new this.context.Zoom(this);
		// spin slider
		this.spin = new this.context.Spin(this);
		// manages the thumbnails
		this.thumbnails = new this.context.Thumbnails(this);
		// manages leafing through pages
		this.leaf = new this.context.Leaf(this);
		// minimal superset of controls
		this.toolbar = new this.context.Toolbar(this);
		// wait until the page has loaded
		window.addEventListener('load', this.onPageLoaded.bind(this));
		// return the object
		return this;
	};
	// start the script
	this.onPageLoaded = function () {
		// gather the input
		this.gatherInput();
		// validate the input
		this.validateInput();
		// set the start parameters
		this.startingStatus();
		// apply the custom styles
		this.styling();
		// run the viewer
		this.run();
	};
	// set the start parameters
	this.startingStatus = function () {
		// create the object to hold all the running variables
		this.config.status = {};
		// pick the initial active slide
		this.config.status.index = 1;
		// pick the initial zoom level
		this.config.status.zoom = 1;
		// pick the initial pan position
		this.config.status.pan = {x : 0.5, y : 0.5};
		// pick the initial canvas position
		this.config.status.pos = {x : 0, y : 0};
		// establish the replacement regular expressions
		this.config.regSrc = new RegExp('{src}', 'gi');
		this.config.regWidth = new RegExp('{width}', 'gi');
		this.config.regHeight = new RegExp('{height}', 'gi');
		this.config.regLeft = new RegExp('{left}', 'gi');
		this.config.regTop = new RegExp('{top}', 'gi');
		this.config.regRight = new RegExp('{right}', 'gi');
		this.config.regBottom = new RegExp('{bottom}', 'gi');
	};
	// gather all the configuration and DOM elements
	this.gatherInput = function () {
		// get the assets from the html
		this.config.thumbnails = [0];
		this.config.figures = [0];
		this.config.titles = [0];
		this.config.descriptions = [0];
		this.config.widths = [0];
		this.config.heights = [0];
		this.config.lefts = [0];
		this.config.tops = [0];
		this.config.rights = [0];
		this.config.bottoms = [0];
		var allLinks = this.config.element.getElementsByTagName('a');
		var allImages = this.config.element.getElementsByTagName('img');
		for (var a = 0, b = allLinks.length; a < b; a += 1) {
			// create a list of thumbnail urls and full urls
			this.config.thumbnails.push(allImages[a].getAttribute('src'));
			this.config.figures.push(this.config.urlprefix + allLinks[a].getAttribute('href'));
			this.config.titles.push(allImages[a].getAttribute('title'));
			this.config.descriptions.push(allImages[a].getAttribute('alt'));
			this.config.widths.push(parseInt(allImages[a].getAttribute('width'), 10));
			this.config.heights.push(parseInt(allImages[a].getAttribute('height'), 10));
			this.config.lefts.push(parseFloat(allImages[a].getAttribute('data-left') || this.config.left || 0));
			this.config.tops.push(parseFloat(allImages[a].getAttribute('data-top') || this.config.top || 0));
			this.config.rights.push(parseFloat(allImages[a].getAttribute('data-right') || this.config.right || 1));
			this.config.bottoms.push(parseFloat(allImages[a].getAttribute('data-bottom') || this.config.bottom || 1));
		}
	};
	// fix some numbers in the context.config
	this.validateInput = function () {
		this.config.grid = parseInt(this.config.grid, 10);
		this.config.cache = parseInt(this.config.cache, 10);
		this.config.lens = parseFloat(this.config.lens);
		this.config.magnification = parseFloat(this.config.magnification);
		this.config.max = parseFloat(this.config.max);
		this.config.navigation = 'thumbnails';
		this.config.divide = (this.config.spin === 'rotation') ? 1 : parseInt(this.config.divide, 10) / 100;
		this.config.retry = null;
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
			sheet.insertRule(".viewer button {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer button:hover {background-color : " + this.config.colorHover + " !important;}", 0);
			sheet.insertRule(".viewer button.disabled {background-color : " + this.config.colorDisabled + " !important;}", 0);
			sheet.insertRule(".viewer .thumbnails_active {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider {background-color : " + this.config.colorPassive + " !important;}", 0);
			sheet.insertRule(".viewer menu.slider meter div {background-color : " + this.config.colorPassive + " !important;}", 0);
		} else {
			sheet.addRule(".viewer button", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer button:hover", "background-color : " + this.config.colorHover + " !important;", 0);
			sheet.addRule(".viewer button.disabled", "background-color : " + this.config.colorDisabled + " !important;", 0);
			sheet.addRule(".viewer .thumbnails_active", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider", "background-color : " + this.config.colorPassive + " !important;", 0);
			sheet.addRule(".viewer menu.slider meter div", "background-color : " + this.config.colorPassive + " !important;", 0);
		}
	};
	// run the slideshow
	this.run = function () {
		var _this = this;
		// hide the component
		this.config.element.style.visibility = 'hidden';
		setTimeout(function () {
			// start the components
			_this.setup();
			// start the redraw
			setTimeout(function () {
				// draw the component
				_this.update();
				// reveal the component
				_this.config.element.style.visibility = 'visible';
			}, 400);
		}, 100);
	};
	// build the app html
	this.setup = function () {
		// shortcut pointers
		var element = this.config.element;
		// clear the parent node
		element.innerHTML = '';
		// apply optional dimensions
		if (this.config.width) {
			element.style.width = this.config.width + this.config.widthUnit;
		}
		if (this.config.height) {
			element.style.height = this.config.height + this.config.heightUnit;
		}
		// apply any context.config classes
		element.className += ' spin_' + this.config.spin;
		// setup the sub components
		this.automatic.setup();
		this.figures.setup();
		// choose what type of toolbars to setup
		switch (this.config.toolbars) {
		// setup the slider toolbars
		case 'sliders' :
			this.zoom.setup(this);
			if (this.config.spin === 'rotation') {
				this.spin.setup();
			}
			if (this.config.spin === 'catalogue') {
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
		if (this.config.spin !== 'rotation') {
			this.thumbnails.setup();
		}
	};
	// update the whole app
	this.update = function () {
		// if the slideshow has been disabled
		if (this.config.element.offsetHeight === 0) {
			// stop updating and try again later
			clearTimeout(this.config.retry);
			var _this = this;
			this.config.retry = setTimeout(function () {
				_this.update();
			}, 1000);
		// else
		} else {
			// update the sub components
			this.figures.update();
			// choose what type of toolbars to update
			switch (this.config.toolbars) {
				// update the slider toolbars
				case 'sliders' :
					this.zoom.update();
					if (this.config.spin === 'rotation') {
						this.spin.update();
					}
					if (this.config.spin === 'catalogue') {
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
			if (this.config.spin !== 'rotation') {
				this.thumbnails.update();
			}
		}
	};
	// public functions
	this.focus = function (index) {
		this.config.status.index = index;
		this.update(this);
	};

	this.previous = function () {
		this.config.status.index -= 1;
		this.update(this);
	};

	this.next = function () {
		this.config.status.index += 1;
		this.update(this);
	};

	// EVENTS

	this.init(context);
};
