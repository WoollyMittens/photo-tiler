// extend the class
Viewer.prototype.Leaf = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	// build the leafing toolbar
	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.leafMenu = document.createElement('menu');
		config.status.menus.leafMenu.className = 'slider leaf';
		config.status.menus.leafMenu.style.bottom = ((1 - config.divide) * 100) + '%';
		// create the page indicator
		this.build.indicator(config.status.menus.leafMenu);
		// create the reset button
		this.build.resetter(config.status.menus.leafMenu);
		// create the next button
		this.build.increaser(config.status.menus.leafMenu);
		// create the previous button
		this.build.decreaser(config.status.menus.leafMenu);
		// add the menu to the interface
		config.element.appendChild(config.status.menus.leafMenu);
	};
	// updates the leafing toolbar
	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// fill in the current page
		config.status.menus.leafPageInput.value = config.status.index;
		// fill in the page total
		config.status.menus.leafPageCount.innerHTML = 'of ' +	(config.status.figures.length - 1);
	};

	this.increase = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index += 1;
		// look if needed
		if (config.toolbars === 'buttons') {
			// loop the value if needed
			if (config.status.index >= config.status.figures.length) {
				config.status.index = 1;
			}
			// loop the value if needed
			if (config.status.index <= 0) {
				config.status.index = config.status.figures.length - 1;
			}
		}
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};

	this.decrease = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index -= 1;
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};

	this.typed = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the typed number
		var number = parseInt(config.status.menus.leafPageInput.value, 10);
		// if the typed number is acceptable
		if (!isNaN(number)) {
			// accept the value
			config.status.index = number;
		}
		// update the interface
		parent.update();
	};

	this.reset = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// reset the zoom level
		config.status.zoom = (config.zoom !== 'static') ? config.max : 1;
		// redraw
		parent.update();
		// cancel the click
		event.preventDefault();
	};
	// build functionality
	this.build = new this.context.Leaf_Build(this);
};
