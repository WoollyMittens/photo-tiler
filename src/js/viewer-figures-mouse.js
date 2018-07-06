// extend the class
Viewer.prototype.Figures_Mouse = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.y = null;
	this.sensitivity = null;
	this.treshold = null;
	this.flick = null;
	this.delay = null;
	// mouse wheel controls
	this.wheel = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the reading from the mouse wheel
		var distance = (window.event) ? window.event.wheelDelta / 120 : -event.detail / 3;
		// do not loop around
		if (distance < 0) {
			// increase the zoom factor
			config.status.zoom = config.status.zoom * config.magnification;
		} else if (distance > 0) {
			// decrease the zoom factor
			config.status.zoom = config.status.zoom / config.magnification;
		}
		// temporarily disable streaming for a while to avoid flooding
		config.status.stream = false;
		clearTimeout(this.delay);
		this.delay = setTimeout(function () {
			config.status.stream = true;
			parent.parent.update();
		}, 500);
		// call for a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};
	// mouse gesture controls
	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = event.pageX || event.x;
		this.y = event.pageY || event.y;
		// calculate the sensitivity
		this.treshold = config.status.cover.offsetWidth / 10;
		this.flick = config.status.cover.offsetWidth * 0.6;
		// cancel the click
		event.preventDefault();
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
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
			if (config.status.zoom > 1) {
				// calculate the drag distance into %
				config.status.pan.x -= xDelta * config.status.zoom / config.status.figures[config.status.index].offsetWidth;
				config.status.pan.y -= yDelta * config.status.zoom / config.status.figures[config.status.index].offsetHeight;
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				parent.parent.update();
			// else there was a spin gesture
			} else if (
				(Math.abs(xDelta) > this.treshold && config.spin === 'rotation') ||
				Math.abs(xDelta) > this.flick
			) {
				// increase the spin
				config.status.index += (xDelta > 0) ? 1 : -1;
				// if in spin mode
				if (config.spin === 'rotation') {
					// loop the value if needed
					if (config.status.index >= config.status.figures.length) {
						config.status.index = 1;
					}
					// loop the value if needed
					if (config.status.index <= 0) {
						config.status.index = config.status.figures.length - 1;
					}
				}
				// reset the distance
				this.x = x;
				this.y = y;
				// order a redraw
				parent.parent.update();
			}
		}
		// cancel the click
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// if there was a motion
		if (this.x !== null) {
			// order a redraw
			parent.parent.update();
		}
		// clear the positions
		this.x = null;
		this.y = null;
		// cancel the click
		event.preventDefault();
	};

	this.mirror = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// retrieve the mouse position
		var pos = useful.positions.cursor(event, config.status.cover);
		// measure the exact location of the interaction
		config.status.pos.x = pos.x;
		config.status.pos.y = pos.y;
		// order a redraw
		parent.parent.update();
		// cancel the scrolling
		event.preventDefault();
	};
};
