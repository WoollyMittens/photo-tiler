// extend the class
Viewer.prototype.Spin_Touch = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.x = null;
	this.sensitivity = null;
	// mouse gesture controls
	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// store the touch positions
		this.x = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.x.push(event.touches[a].pageX);
		}
		// calculate the sensitivity
		this.sensitivity = (config.status.menus.spinCover.offsetWidth - config.status.menus.spinIn.offsetWidth - config.status.menus.spinOut.offsetWidth) / config.status.figures.length;
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
			var x = [];
			for (var a = 0, b = event.touches.length; a < b; a += 1) {
				x.push(event.touches[a].pageX);
			}
			var distance = this.x[0] - x[0];
			// if the draw was to the left
			if (distance < -this.sensitivity) {
				// increase the spin index
				config.status.index += 1;
				// loop the value if needed
				if (config.status.index >= config.status.figures.length) {
					config.status.index = 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				parent.parent.update();
			// else if the drag was to the right
			} else if (distance > this.sensitivity) {
				// decrease the spin index
				config.status.index -= 1;
				// loop the value if needed
				if (config.status.index <= 0) {
					config.status.index = config.status.figures.length - 1;
				}
				// reset the distance
				this.x[0] = x[0];
				// order a redraw
				parent.parent.update();
			}
		}
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// get the event properties
		event = event || window.event;
		// clear the positions
		this.x = null;
		// cancel the click
		event.preventDefault();
	};
};
