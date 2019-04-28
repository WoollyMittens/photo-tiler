/*
Source:
van Creij, Maurice (2018). "viewer.js: A simple tile based image viewer", http://www.woollymittens.nl/.

License:
This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Viewer = function (config) {
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
	for (var key in config) { this.config[key] = config[key]; }
	// bind the components
	this.main = new this.Main(this);
	// expose the public functions
	this.focus = this.main.focus.bind(this.main);
	this.previous = this.main.previous.bind(this.main);
	this.next = this.main.next.bind(this.main);
	// return the object
	return this;
};

// return as a require.js module
if (typeof define != 'undefined') define([], function () { return Viewer });
if (typeof module != 'undefined') module.exports = Viewer;
