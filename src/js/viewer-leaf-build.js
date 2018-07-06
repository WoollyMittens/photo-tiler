// extend the class
Viewer.prototype.Leaf_Build = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.indicator = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the page indicator
		config.status.menus.leafPage = document.createElement('form');
		config.status.menus.leafPageInput = document.createElement('input');
		config.status.menus.leafPageInput.setAttribute('type', 'text');
		config.status.menus.leafPageCount = document.createElement('span');
		config.status.menus.leafPageCount.className = 'count';
		config.status.menus.leafPageSubmit = document.createElement('button');
		config.status.menus.leafPageSubmit.setAttribute('type', 'submit');
		config.status.menus.leafPageSubmit.style.position = 'absolute';
		config.status.menus.leafPageSubmit.style.left = '-999em';
		config.status.menus.leafPage.appendChild(config.status.menus.leafPageInput);
		config.status.menus.leafPage.appendChild(config.status.menus.leafPageCount);
		element.appendChild(config.status.menus.leafPage);
		config.status.menus.leafPageInput.addEventListener('change', function (event) {
			parent.typed(event);
		}, false);
		config.status.menus.leafPage.addEventListener('submit', function (event) {
			parent.typed(event);
			event.preventDefault();
		}, false);
	};

	this.resetter = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the reset button
		config.status.menus.leafReset = document.createElement('button');
		config.status.menus.leafReset.className = 'reset';
		config.status.menus.leafResetIcon = document.createElement('span');
		config.status.menus.leafResetIcon.innerHTML = 'Reset view';
		config.status.menus.leafReset.appendChild(config.status.menus.leafResetIcon);
		element.appendChild(config.status.menus.leafReset);
		config.status.menus.leafReset.addEventListener('click', function (event) {
			parent.reset(event);
		}, false);
	};

	this.increaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the next button
		config.status.menus.leafIn = document.createElement('button');
		config.status.menus.leafIn.className = 'increase';
		config.status.menus.leafInIcon = document.createElement('span');
		config.status.menus.leafInIcon.innerHTML = 'Leaf forward';
		config.status.menus.leafIn.appendChild(config.status.menus.leafInIcon);
		element.appendChild(config.status.menus.leafIn);
		config.status.menus.leafIn.addEventListener('click', function (event) {
			parent.increase(event);
		}, false);
	};

	this.decreaser = function (element) {
		var context = this.context, parent = this.parent, config = this.config;
		// create the previous button
		config.status.menus.leafOut = document.createElement('button');
		config.status.menus.leafOut.className = 'decrease';
		config.status.menus.leafOutIcon = document.createElement('span');
		config.status.menus.leafOutIcon.innerHTML = 'Leaf back';
		config.status.menus.leafOut.appendChild(config.status.menus.leafOutIcon);
		element.appendChild(config.status.menus.leafOut);
		config.status.menus.leafOut.addEventListener('click', function (event) {
			parent.decrease(event);
		}, false);
	};
};
