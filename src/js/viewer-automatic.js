// extend the class
Viewer.prototype.Automatic = function(parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.setup = function() {};
};
