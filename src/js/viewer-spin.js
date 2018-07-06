// extend the class
Viewer.prototype.Spin = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// create the menu
		config.status.menus = config.status.menus || {};
		config.status.menus.spinMenu = document.createElement('menu');
		config.status.menus.spinMenu.className = 'slider spin';
		config.status.menus.spinMenu.style.bottom = ((1 - config.divide) * 100) + '%';
		// add the slider to the menu
		this.build.slider(config.status.menus.spinMenu);
		// add a touch cover to the menu
		this.build.cover(config.status.menus.spinMenu);
		// add the increase button
		this.build.increaser(config.status.menus.spinMenu);
		// add the decrease button
		this.build.decreaser(config.status.menus.spinMenu);
		// add the menu to the interface
		config.element.appendChild(config.status.menus.spinMenu);
	};

	this.update = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// reposition the slider
		config.status.menus.spinSlider.style.left = ((config.status.index - 1) / (config.status.figures.length - 2) * 100) + '%';
		// update the value
		config.status.menus.spinIndicator.setAttribute('value', config.status.index);
		config.status.menus.spinSliderIcon.innerHTML = config.status.index;
	};

	this.increase = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// decrease the spin index
		config.status.index -= 1;
		// loop the value if needed
		if (config.status.index <= 0) {
			config.status.index = config.status.figures.length - 1;
		}
		// order a redraw
		parent.update();
	};

	this.decrease = function () {
		var context = this.context, parent = this.parent, config = this.config;
		// increase the spin index
		config.status.index += 1;
		// loop the value if needed
		if (config.status.index >= config.status.figures.length) {
			config.status.index = 1;
		}
		// order a redraw
		parent.update();
	};
	// build functionality
	this.build = new this.context.Spin_Build(this);
	// mouse wheel controls
	this.mouse = new this.context.Spin_Mouse(this);
	// touch screen controls
	this.touch = new this.context.Spin_Touch(this);
};
