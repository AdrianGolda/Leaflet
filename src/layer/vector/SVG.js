import {Renderer} from './Renderer';
import * as DomUtil from '../../dom/DomUtil';
import * as DomEvent from '../../dom/DomEvent';
import * as Browser from '../../core/Browser';
import {stamp} from '../../core/Util';
import {svgCreate, pointsToPath} from './SVG.Util';
export {pointsToPath};
import {vmlMixin, vmlCreate} from './SVG.VML';

export var create = Browser.vml ? vmlCreate : svgCreate;

/*
 * @class SVG
 * @inherits Renderer
 * @aka L.SVG
 *
 * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
 * available in all web browsers, notably Android 2.x and 3.x.
 *
 * Although SVG is not available on IE7 and IE8, these browsers support
 * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
 * (a now deprecated technology), and the SVG renderer will fall back to VML in
 * this case.
 *
 * @example
 *
 * Use SVG by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.svg()
 * });
 * ```
 *
 * Use a SVG renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.svg({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

export var SVG = Renderer.extend({

	getEvents: function () {
		var events = Renderer.prototype.getEvents.call(this);
		events.zoomstart = this._onZoomStart;
		return events;
	},

	_initContainer: function () {
		this._container = create('svg');

		// makes it possible to click through svg root; we'll reset it back in individual paths
		this._container.setAttribute('pointer-events', 'none');

		this._rootGroup = create('g');
		this._container.appendChild(this._rootGroup);
	},

	_destroyContainer: function () {
		DomUtil.remove(this._container);
		DomEvent.off(this._container);
		delete this._container;
		delete this._rootGroup;
		delete this._svgSize;
	},

	_onZoomStart: function () {
		// Drag-then-pinch interactions might mess up the center and zoom.
		// In this case, the easiest way to prevent this is re-do the renderer
		//   bounds and padding when the zooming starts.
		this._update();
	},

	_update: function () {
		if (this._map._animatingZoom && this._bounds) { return; }

		Renderer.prototype._update.call(this);

		var b = this._bounds,
		    size = b.getSize(),
		    container = this._container;

		// set size of svg-container if changed
		if (!this._svgSize || !this._svgSize.equals(size)) {
			this._svgSize = size;
			container.setAttribute('width', size.x);
			container.setAttribute('height', size.y);
		}

		// movement: update container viewBox so that we don't have to change coordinates of individual layers
		DomUtil.setPosition(container, b.min);
		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

		this.fire('update');
	},

	// methods below are called by vector layers implementations

	_initPath: function (layer) {
		var path = layer._path = create('path');

		// @namespace Path
		// @option className: String = null
		// Custom class name set on an element. Only for SVG renderer.
		if (layer.options.className) {
			DomUtil.addClass(path, layer.options.className);
		}

		if (layer.options.interactive) {
			DomUtil.addClass(path, 'leaflet-interactive');
		}

		this._updateStyle(layer);
		this._layers[stamp(layer)] = layer;
	},

	_addPath: function (layer) {
		if (!this._rootGroup) { this._initContainer(); }
		this._rootGroup.appendChild(layer._path);
		layer.addInteractiveTarget(layer._path);
	},

	_removePath: function (layer) {
		DomUtil.remove(layer._path);
		layer.removeInteractiveTarget(layer._path);
		delete this._layers[stamp(layer)];
	},

	_updatePath: function (layer) {
		layer._project();
		layer._update();
	},

	_updateStyle: function (layer) {
		var path = layer._path,
		    options = layer.options;

		if (!path) { return; }

		if (options.stroke) {
			path.setAttribute('stroke', options.color);
			path.setAttribute('stroke-opacity', options.opacity);
			path.setAttribute('stroke-width', options.weight);
			path.setAttribute('stroke-linecap', options.lineCap);
			path.setAttribute('stroke-linejoin', options.lineJoin);

			if (options.dashArray) {
				path.setAttribute('stroke-dasharray', options.dashArray);
			} else {
				path.removeAttribute('stroke-dasharray');
			}

			if (options.dashOffset) {
				path.setAttribute('stroke-dashoffset', options.dashOffset);
			} else {
				path.removeAttribute('stroke-dashoffset');
			}
		} else {
			path.setAttribute('stroke', 'none');
		}

		if (options.fill) {
			path.setAttribute('fill', options.fillColor || options.color);
			path.setAttribute('fill-opacity', options.fillOpacity);
			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
		} else {
			path.setAttribute('fill', 'none');
		}
	},

	_prepareArrowLine: function(layer, closed, weight)  {
		const {cos, sin, PI, atan2} = Math;
		const {x: endX, y: endY} = layer._parts[0].slice(-1)[0];
		const {x: startX, y: startY} = layer._parts[0].slice(-2)[0];
		let path = pointsToPath(layer._parts, closed);
		const canvasWeight = weight// * zoom
		const x = canvasWeight;

		console.log('endX, endY', endX, endY);
		const alfa = atan2(endY-startY,endX-startX)
		const beta = 30/180*PI-(alfa)
			// path += `M${endX} ${endY}L${endX+30} ${endY+30}`
			path += `M${endX} ${endY}L${endX+(-x * cos(beta))} ${endY+(x * sin(beta))} 
			l ${(-x * cos(beta - 0.5 * PI - 0.166 * PI))} ${(x * sin(beta - 0.5 * PI - 0.166 * PI))} z `
			this._setPath(layer, path)
		// layer._path.setAttribute('fill', layer.options.fillColor ||layer.options.color )
		},



	 _prepareLadderLine: function(startX, startY, endX, endY, weight) {
		 const realStart = this._map.layerPointToLatLng([startX, startY])
		 const realEnd = this._map.layerPointToLatLng([endX, endY]);

		 const dx = endX - startX;
		 const dy = endY - startY;
		 const alfa = Math.atan2(dy, dx)
		 const PI = Math.PI;
		 const beta = PI - alfa
		 const zoom = 2 ** this._map.getZoom();
		 const canvasWeight = weight //* zoom
		 const x = canvasWeight;
		 const cos = Math.cos;
		 const sin = Math.sin;
		 const oneLadder = ` l ${x * cos(beta-0.5*PI)} ${-x * sin(beta-0.5*PI)}  l ${-x * cos(beta)} ${x * sin(beta)}
		   l ${-x * cos(beta-0.5*PI)} ${x * sin(beta-0.5*PI)} l ${x * cos(beta)} ${-x * sin(beta)} m ${-x * cos(beta)} ${x * sin(beta)} `
		 const realLength = Math.sqrt((realEnd.lng - realStart.lng) ** 2 + (realEnd.lat - realStart.lat) ** 2)
		 const L = realLength * zoom;
		 const howManyLadders = L / x;
		 let path = ` m ${startX} ${startY}  `
		 for (let i = 0; i < howManyLadders; i++) {
			 path += oneLadder
		 }
		 return path;

	 },

	_prepareZigZagLine: function(startX,startY,endX,endY, weight) {
		console.log('lol?')
		const realStart = this._map.layerPointToLatLng([startX, startY]);
		const realEnd = this._map.layerPointToLatLng([endX, endY]);
		 console.log('realStart', realStart)
		console.log('startX,Y', startX, startY)
		const zoom = 2**this._map.getZoom();
		 // startX = zoom * startX;
		 // startY = zoom * startY;
		const canvasWeight = weight;
		const canvasDx = endX-startX;
		const canvasDy = endY - startY;
		const canvasLength = Math.sqrt((canvasDx)**2+(canvasDy)**2)
		const realDx = realEnd.lng-realStart.lng;
		const realDy = realEnd.lat-realStart.lat;
		const alpha = Math.atan2(realDy, realDx)
		const x = canvasWeight;
		const L = canvasLength;
		const PI = Math.PI
		const beta = (alpha - 0.25*PI);
		const sin = Math.sin;
		const cos = Math.cos;

	    const howManyZigZags = L/(2*x*Math.sqrt(2))
		const oneZigZag = `
		l ${x*cos(beta)} ${-x*sin(beta)} 
		l ${-2*x*sin(beta)} ${-2*x*cos(beta)} 
		 l ${x*cos(beta)} ${-x*sin(beta)} 
		`;
		let path = `m ${startX} ${startY}`
		for (let i=0; i < howManyZigZags;i++) {
			path += oneZigZag
		}
		return path
	},

	_updatePoly: function (layer, closed) {

		var i, j, len2,
			parts = layer._parts,
			len = parts.length

		if (!len) {
			// When zooming outside of the path the _parts get set to empty array and we have
			// to update the view by setting the path to M0 0. Setting Path to '' is not possible because of SVG specification
			console.log('clear')
			return this._setPath(layer, 'M0 0 ')
		}

		if (!layer.options.lineType || layer.options.lineType === 'normal') {
			return this._setPath(layer, pointsToPath(layer._parts, closed));
		}
		else if (layer.options.lineType === 'arrow' ) {
			return this._prepareArrowLine(layer, closed, 10)
		}

		// console.log(len);

			let path = '';
			for (i = 0; i < len; i++) {
				for (j = 0, len2 = parts[i].length; j + 1 < len2; j++) {
				const start = parts[i][j];
				const end = parts[i][j + 1];

				switch (layer.options.lineType) {
					case 'ladder':
						path += this._prepareLadderLine(start.x, start.y, end.x, end.y, 5);
						//this._setPath(layer, path)
						break
					case 'zigzag':
						path += this._prepareZigZagLine(start.x, start.y, end.x, end.y, 2);
						//this._setPath(layer, path)
						break;
					default:
						path += `m ${start.x} ${start.y} l ${end.x} ${end.y} `
						//this._setPath(layer, path)
						break;
				}
			}
		}
			this._setPath(layer, path)
			console.log(path)
	},

	_updateCircle: function (layer) {
		var p = layer._point,
		    r = Math.max(Math.round(layer._radius), 1),
		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

		// drawing a circle with two half-arcs
		var d = layer._empty() ? 'M0 0' :
			'M' + (p.x - r) + ',' + p.y +
			arc + (r * 2) + ',0 ' +
			arc + (-r * 2) + ',0 ';

		this._setPath(layer, d);
	},

	_setPath: function (layer, path) {
		layer._path.setAttribute('d', path);
	},

	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
	_bringToFront: function (layer) {
		DomUtil.toFront(layer._path);
	},

	_bringToBack: function (layer) {
		DomUtil.toBack(layer._path);
	}
});

if (Browser.vml) {
	SVG.include(vmlMixin);
}

// @namespace SVG
// @factory L.svg(options?: Renderer options)
// Creates a SVG renderer with the given options.
export function svg(options) {
	return Browser.svg || Browser.vml ? new SVG(options) : null;
}
