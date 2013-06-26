# useful.viewer.js: Tile Based Image Viewer

This tile-based image viewer loads only the parts of the image that are visible. Not unlike how Google Maps loads map tiles. This demo comes with a web service to divide large images into tiles using PHP, but the concept is easily replicated in other languages.

## How to use the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/viewer.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful.viewer.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* in Internet Explorer 8 and lower, include *jQuery*. To enable CSS3 transition animations in Internet Explorer 9 and lower, include *jQuery UI* as well.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
<![endif]-->
```

### Using vanilla JavaScript

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var parent = documentGetElementById('id');
useful.viewer.start(parent, {
	'urlprefix' : '../',
	'imagesize' : './php/imagesize.php',
	'imageslice' : './php/imageslice.php',
	'width' : '100',
	'widthUnit' : '%',
	'height' : '512',
	'heightUnit' : 'px',
	'divide' : '80%',
	'margin' : '2%',
	'highlight' : 'Grey',
	'lens' : '0.5',
	'toolbars' : 'toolbar',
	'zoom' : 'static',
	'spin' : 'slideshow',
	'pan' : 'drag',
	'magnification' : '1.1',
	'grid' : '256px',
	'cache' : '32'
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**parent : {DOM node}** - The DOM element around which the functionality is centred.

**links : {string}** - A CSS Rule that describes the toggle buttons within *parent*.

**urlprefix : {string}** - A prefix that gets added to all web-service calls.

**imagesize : {string}** - A web-service that returns the dimensions of an image on the server. An example is provided as *./php/imagesize.php*.

**imageslice : {string}** - A web-service for requesting cropped tiles of an image on the server. An example is provided as *./php/imageslice.php*.

**width : {integer}** - The width of the slideshow.

**widthUnit : {string}**
+ *'px* - The width would be applied in pixels.
+ *'%* - The width would be applied as a percentage of the available space.
+ *'em* - The width would be applied relative to the text size.

**height : {integer}** - The height of the slideshow.

**heightUnit : {string}**
+ *'px* - The height would be applied in pixels.
+ *'%* - The height would be applied as a percentage of the available space. The parent element needs to have a defined height.
+ *'em* - The height would be applied relative to the text size.

**divide : {string}** - The percentage of the height devoted to the slides. The rest is reserved for the thumbnails.

**margin : {string}** - The space separating the slides and the thumbnails.

**highlight : {color}** - A color name, hex or rgba value  used to highlight the active thumbnail.

**lens : {float}** - The radius of the lens overlay as a fraction of the width of the viewer.

**toolbars : {string}**
+ *buttons* - Show a minimal set of buttons.
+ *toolbar* - Show a toolbar instead of separate buttons.
+ *sliders* - Use sliders to control the zoom and rotation.

**zoom : {string}**
+ *static* - The main image zooms in.
+ *lens* - A separate lens overlays a zoomed in view.

**spin : {string}**
+ *rotation* - The left/right controls assume the images form a 360 degree rotation of a subject in separate frames.
+ *slideshow* - The left/right controls cycle through slides.
+ *catalogue* - The left/right controls emulate turning a page.

**pan : {string}**
+ *drag* - Adjust the view by dragging the mouse or touch.
+ *hover* - Adjust the view by hovering the mouse.

**magnification : {float}** - The factor by which the magnification increases.

**grid : {string}** - The size of the tiles that make up the zoomed image.

**cache : {integer}** - How many tiles to keep track of at a time. More slows down the display, but reduces downloads.

### Using document.querySelectorAll

This method allows CSS Rules to be used to apply the script to one or more nodes at the same time.

```javascript
useful.css.select({
	rule : 'div.viewer',
	handler : useful.viewer.start,
	data : {
		'urlprefix' : '../',
		'imagesize' : './php/imagesize.php',
		'imageslice' : './php/imageslice.php',
		'width' : '100',
		'widthUnit' : '%',
		'height' : '512',
		'heightUnit' : 'px',
		'divide' : '80%',
		'margin' : '2%',
		'highlight' : 'Grey',
		'lens' : '0.5',
		'toolbars' : 'toolbar',
		'zoom' : 'static',
		'spin' : 'slideshow',
		'pan' : 'drag',
		'magnification' : '1.1',
		'grid' : '256px',
		'cache' : '32'
	}
});
```

**rule : {string}** - The CSS Rule for the intended target(s) of the script.

**handler : {function}** - The public function that starts the script.

**data : {object}** - Name-value pairs with configuration data.

### Using jQuery

This method is similar to the previous one, but uses jQuery for processing the CSS rule.

```javascript
$('div.viewer').each(function (index, element) {
	useful.viewer.start(element, {
		'urlprefix' : '../',
		'imagesize' : './php/imagesize.php',
		'imageslice' : './php/imageslice.php',
		'width' : '100',
		'widthUnit' : '%',
		'height' : '512',
		'heightUnit' : 'px',
		'divide' : '80%',
		'margin' : '2%',
		'highlight' : 'Grey',
		'lens' : '0.5',
		'toolbars' : 'toolbar',
		'zoom' : 'static',
		'spin' : 'slideshow',
		'pan' : 'drag',
		'magnification' : '1.1',
		'grid' : '256px',
		'cache' : '32'
	});
});
```

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
