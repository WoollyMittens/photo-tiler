// extend the class
Viewer.prototype.Zoom_Touch = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;
	this.y = null;
	this.distance = null;
	this.sensitivity = null;
	this.fudge = 1.1;

	// METHODS

	this.start = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// store the touch positions
		this.y = [];
		for (var a = 0, b = event.touches.length; a < b; a += 1) {
			this.y.push(event.touches[a].pageY);
		}
		// calculate the sensitivity
		this.distance = config.status.menus.zoomCover.offsetHeight - config.status.menus.zoomIn.offsetHeight - config.status.menus.zoomOut.offsetHeight;
		this.sensitivity = config.heights[config.status.index] / config.status.canvas.offsetHeight - 1;
	};

	this.move = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
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
			config.status.zoom += (this.y[0] - y[0]) / this.distance * this.sensitivity * this.fudge;
			// reset the distance
			this.y[0] = y[0];
			// disable streaming new images
			config.status.stream = false;
			// order a redraw
			parent.parent.update();
		}
		// cancel the click
		target.blur();
		event.preventDefault();
	};

	this.end = function (event) {
		var context = this.context, parent = this.parent, config = this.config;
		// clear the positions
		this.y = null;
		// enable streaming new images
		config.status.stream = true;
		// order a redraw
		parent.parent.update();
	};
};
