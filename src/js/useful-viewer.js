/*
Source:
van Creij, Maurice (2014). "useful.viewer.js: A simple tile based image viewer", version 20141127, http://www.woollymittens.nl/.

License:
This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Viewer = useful.Viewer || function () {};

// extend the prototype with the init function
useful.Viewer.prototype.init = function (config) {
	// turn on strict mode
	"use strict";
	// default config
	this.config = {
		'urlprefix' : '',
		'imageslice' : 'php/imageslice.php?src=../{src}&left={left}&top={top}&right={right}&bottom={bottom}&width={width}&height={height}',
		'transforms' : true,
		'width' : '100',
		'widthUnit' : '%',
		'height' : '512',
		'heightUnit' : 'px',
		'divide' : '80%',
		'margin' : '0%',
		'colorPassive' : '#ff6a00',
		'colorActive' : '#d45800',
		'colorHover' : '#ff9800',
		'colorDisabled' : '#7f7f7f',
		'lens' : '0.5',
		'toolbars' : 'buttons', 	// buttons | toolbar | sliders | none
		'zoom' : 'static', 			// static | lens
		'spin' : 'slideshow', 		// rotation | slideshow | catalogue
		'pan' : 'drag', 			// drag | hover
		'magnification' : '1.1',
		'max' : '4',
		'grid' : '256px',
		'cache' : '32',
		'left' : 0,
		'top' : 0,
		'right' : 1,
		'bottom' : 1
	};
	// store the config
	for (var name in config) { this.config[name] = config[name]; }
	// bind the components
	this.main = new this.Main().init(this);
	// expose the public functions
	this.focus = this.main.focus.bind(this.main);
	this.previous = this.main.previous.bind(this.main);
	this.next = this.main.next.bind(this.main);
	// return the object
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Viewer;
}
