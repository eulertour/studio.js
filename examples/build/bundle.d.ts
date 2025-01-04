import * as THREE$1 from 'three';
import { Loader, FileLoader, Matrix3, Vector2, Vector3, ShapeUtils, Box2, Shape as Shape$1, Path, BufferGeometry, Float32BufferAttribute, ShapePath, SRGBColorSpace } from 'three';
export { THREE$1 as THREE };

const COLOR_SPACE_SVG = SRGBColorSpace;

class SVGLoader extends Loader {
	constructor(manager) {
		super(manager);

		// Default dots per inch
		this.defaultDPI = 90;

		// Accepted units: 'mm', 'cm', 'in', 'pt', 'pc', 'px'
		this.defaultUnit = 'px';
	}

	load(url, onLoad, onProgress, onError) {
		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(
			url,
			(text) => {
				try {
					onLoad(this.parse(text));
				} catch (e) {
					if (onError) {
						onError(e);
					} else {
						console.error(e);
					}

					this.manager.itemError(url);
				}
			},
			onProgress,
			onError,
		);
	}

	parse(text) {
		const scope = this;

		function parseNode(node, style) {
			if (node.nodeType !== 1) return;

			const transform = getNodeTransform(node);

			let isDefsNode = false;

			let path = null;

			switch (node.nodeName) {
				case 'svg':
					style = parseStyle(node, style);
					break;

				case 'style':
					parseCSSStylesheet(node);
					break;

				case 'g':
					style = parseStyle(node, style);
					break;

				case 'path':
					style = parseStyle(node, style);
					if (node.hasAttribute('d')) path = parsePathNode(node);
					break;

				case 'rect':
					style = parseStyle(node, style);
					path = parseRectNode(node);
					break;

				case 'polygon':
					style = parseStyle(node, style);
					path = parsePolygonNode(node);
					break;

				case 'polyline':
					style = parseStyle(node, style);
					path = parsePolylineNode(node);
					break;

				case 'circle':
					style = parseStyle(node, style);
					path = parseCircleNode(node);
					break;

				case 'ellipse':
					style = parseStyle(node, style);
					path = parseEllipseNode(node);
					break;

				case 'line':
					style = parseStyle(node, style);
					path = parseLineNode(node);
					break;

				case 'defs':
					isDefsNode = true;
					break;

				case 'use': {
					style = parseStyle(node, style);

					const href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
					const usedNodeId = href.substring(1);
					const usedNode = node.viewportElement.getElementById(usedNodeId);
					if (usedNode) {
						parseNode(usedNode, style);
					} else {
						console.warn(`SVGLoader: 'use node' references non-existent node id: ${usedNodeId}`);
					}

					break;
				}
				// console.log( node );
			}

			if (path) {
				if (style.fill !== undefined && style.fill !== 'none') {
					path.color.setStyle(style.fill, COLOR_SPACE_SVG);
				}

				transformPath(path, currentTransform);

				paths.push(path);

				path.userData = { node: node, style: style };
			}

			const childNodes = node.childNodes;

			for (let i = 0; i < childNodes.length; i++) {
				const node = childNodes[i];

				if (isDefsNode && node.nodeName !== 'style' && node.nodeName !== 'defs') {
					// Ignore everything in defs except CSS style definitions
					// and nested defs, because it is OK by the standard to have
					// <style/> there.
					continue;
				}

				parseNode(node, style);
			}

			if (transform) {
				transformStack.pop();

				if (transformStack.length > 0) {
					currentTransform.copy(transformStack[transformStack.length - 1]);
				} else {
					currentTransform.identity();
				}
			}
		}

		function parsePathNode(node) {
			const path = new ShapePath();

			const point = new Vector2();
			const control = new Vector2();

			const firstPoint = new Vector2();
			let isFirstPoint = true;
			let doSetFirstPoint = false;

			const d = node.getAttribute('d');

			if (d === '' || d === 'none') return null;

			// console.log( d );

			const commands = d.match(/[a-df-z][^a-df-z]*/gi);

			for (let i = 0, l = commands.length; i < l; i++) {
				const command = commands[i];

				const type = command.charAt(0);
				const data = command.slice(1).trim();

				if (isFirstPoint === true) {
					doSetFirstPoint = true;
					isFirstPoint = false;
				}

				let numbers;

				switch (type) {
					case 'M':
						numbers = parseFloats(data);
						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							point.x = numbers[j + 0];
							point.y = numbers[j + 1];
							control.x = point.x;
							control.y = point.y;

							if (j === 0) {
								path.moveTo(point.x, point.y);
							} else {
								path.lineTo(point.x, point.y);
							}

							if (j === 0) firstPoint.copy(point);
						}

						break;

					case 'H':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j++) {
							point.x = numbers[j];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'V':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j++) {
							point.y = numbers[j];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'L':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							point.x = numbers[j + 0];
							point.y = numbers[j + 1];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'C':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 6) {
							path.bezierCurveTo(
								numbers[j + 0],
								numbers[j + 1],
								numbers[j + 2],
								numbers[j + 3],
								numbers[j + 4],
								numbers[j + 5],
							);
							control.x = numbers[j + 2];
							control.y = numbers[j + 3];
							point.x = numbers[j + 4];
							point.y = numbers[j + 5];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'S':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 4) {
							path.bezierCurveTo(
								getReflection(point.x, control.x),
								getReflection(point.y, control.y),
								numbers[j + 0],
								numbers[j + 1],
								numbers[j + 2],
								numbers[j + 3],
							);
							control.x = numbers[j + 0];
							control.y = numbers[j + 1];
							point.x = numbers[j + 2];
							point.y = numbers[j + 3];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'Q':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 4) {
							path.quadraticCurveTo(numbers[j + 0], numbers[j + 1], numbers[j + 2], numbers[j + 3]);
							control.x = numbers[j + 0];
							control.y = numbers[j + 1];
							point.x = numbers[j + 2];
							point.y = numbers[j + 3];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'T':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							const rx = getReflection(point.x, control.x);
							const ry = getReflection(point.y, control.y);
							path.quadraticCurveTo(rx, ry, numbers[j + 0], numbers[j + 1]);
							control.x = rx;
							control.y = ry;
							point.x = numbers[j + 0];
							point.y = numbers[j + 1];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'A':
						numbers = parseFloats(data, [3, 4], 7);

						for (let j = 0, jl = numbers.length; j < jl; j += 7) {
							// skip command if start point == end point
							if (numbers[j + 5] === point.x && numbers[j + 6] === point.y) continue;

							const start = point.clone();
							point.x = numbers[j + 5];
							point.y = numbers[j + 6];
							control.x = point.x;
							control.y = point.y;
							parseArcCommand(
								path,
								numbers[j],
								numbers[j + 1],
								numbers[j + 2],
								numbers[j + 3],
								numbers[j + 4],
								start,
								point,
							);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'm':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							point.x += numbers[j + 0];
							point.y += numbers[j + 1];
							control.x = point.x;
							control.y = point.y;

							if (j === 0) {
								path.moveTo(point.x, point.y);
							} else {
								path.lineTo(point.x, point.y);
							}

							if (j === 0) firstPoint.copy(point);
						}

						break;

					case 'h':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j++) {
							point.x += numbers[j];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'v':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j++) {
							point.y += numbers[j];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'l':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							point.x += numbers[j + 0];
							point.y += numbers[j + 1];
							control.x = point.x;
							control.y = point.y;
							path.lineTo(point.x, point.y);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'c':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 6) {
							path.bezierCurveTo(
								point.x + numbers[j + 0],
								point.y + numbers[j + 1],
								point.x + numbers[j + 2],
								point.y + numbers[j + 3],
								point.x + numbers[j + 4],
								point.y + numbers[j + 5],
							);
							control.x = point.x + numbers[j + 2];
							control.y = point.y + numbers[j + 3];
							point.x += numbers[j + 4];
							point.y += numbers[j + 5];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 's':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 4) {
							path.bezierCurveTo(
								getReflection(point.x, control.x),
								getReflection(point.y, control.y),
								point.x + numbers[j + 0],
								point.y + numbers[j + 1],
								point.x + numbers[j + 2],
								point.y + numbers[j + 3],
							);
							control.x = point.x + numbers[j + 0];
							control.y = point.y + numbers[j + 1];
							point.x += numbers[j + 2];
							point.y += numbers[j + 3];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'q':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 4) {
							path.quadraticCurveTo(
								point.x + numbers[j + 0],
								point.y + numbers[j + 1],
								point.x + numbers[j + 2],
								point.y + numbers[j + 3],
							);
							control.x = point.x + numbers[j + 0];
							control.y = point.y + numbers[j + 1];
							point.x += numbers[j + 2];
							point.y += numbers[j + 3];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 't':
						numbers = parseFloats(data);

						for (let j = 0, jl = numbers.length; j < jl; j += 2) {
							const rx = getReflection(point.x, control.x);
							const ry = getReflection(point.y, control.y);
							path.quadraticCurveTo(rx, ry, point.x + numbers[j + 0], point.y + numbers[j + 1]);
							control.x = rx;
							control.y = ry;
							point.x = point.x + numbers[j + 0];
							point.y = point.y + numbers[j + 1];

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'a':
						numbers = parseFloats(data, [3, 4], 7);

						for (let j = 0, jl = numbers.length; j < jl; j += 7) {
							// skip command if no displacement
							if (numbers[j + 5] === 0 && numbers[j + 6] === 0) continue;

							const start = point.clone();
							point.x += numbers[j + 5];
							point.y += numbers[j + 6];
							control.x = point.x;
							control.y = point.y;
							parseArcCommand(
								path,
								numbers[j],
								numbers[j + 1],
								numbers[j + 2],
								numbers[j + 3],
								numbers[j + 4],
								start,
								point,
							);

							if (j === 0 && doSetFirstPoint === true) firstPoint.copy(point);
						}

						break;

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;

						if (path.currentPath.curves.length > 0) {
							// Reset point to beginning of Path
							point.copy(firstPoint);
							path.currentPath.currentPoint.copy(point);
							isFirstPoint = true;
						}

						break;

					default:
						console.warn(command);
				}

				// console.log( type, parseFloats( data ), parseFloats( data ).length  )

				doSetFirstPoint = false;
			}

			return path;
		}

		function parseCSSStylesheet(node) {
			if (!node.sheet || !node.sheet.cssRules || !node.sheet.cssRules.length) return;

			for (let i = 0; i < node.sheet.cssRules.length; i++) {
				const stylesheet = node.sheet.cssRules[i];

				if (stylesheet.type !== 1) continue;

				const selectorList = stylesheet.selectorText
					.split(/,/gm)
					.filter(Boolean)
					.map((i) => i.trim());

				for (let j = 0; j < selectorList.length; j++) {
					// Remove empty rules
					const definitions = Object.fromEntries(
						Object.entries(stylesheet.style).filter(([, v]) => v !== ''),
					);

					stylesheets[selectorList[j]] = Object.assign(
						stylesheets[selectorList[j]] || {},
						definitions,
					);
				}
			}
		}

		/**
		 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
		 * https://mortoray.com/2017/02/16/rendering-an-svg-elliptical-arc-as-bezier-curves/ Appendix: Endpoint to center arc conversion
		 * From
		 * rx ry x-axis-rotation large-arc-flag sweep-flag x y
		 * To
		 * aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation
		 */

		function parseArcCommand(
			path,
			rx,
			ry,
			x_axis_rotation,
			large_arc_flag,
			sweep_flag,
			start,
			end,
		) {
			if (rx === 0 || ry === 0) {
				// draw a line if either of the radii == 0
				path.lineTo(end.x, end.y);
				return;
			}

			x_axis_rotation = (x_axis_rotation * Math.PI) / 180;

			// Ensure radii are positive
			rx = Math.abs(rx);
			ry = Math.abs(ry);

			// Compute (x1', y1')
			const dx2 = (start.x - end.x) / 2.0;
			const dy2 = (start.y - end.y) / 2.0;
			const x1p = Math.cos(x_axis_rotation) * dx2 + Math.sin(x_axis_rotation) * dy2;
			const y1p = -Math.sin(x_axis_rotation) * dx2 + Math.cos(x_axis_rotation) * dy2;

			// Compute (cx', cy')
			let rxs = rx * rx;
			let rys = ry * ry;
			const x1ps = x1p * x1p;
			const y1ps = y1p * y1p;

			// Ensure radii are large enough
			const cr = x1ps / rxs + y1ps / rys;

			if (cr > 1) {
				// scale up rx,ry equally so cr == 1
				const s = Math.sqrt(cr);
				rx = s * rx;
				ry = s * ry;
				rxs = rx * rx;
				rys = ry * ry;
			}

			const dq = rxs * y1ps + rys * x1ps;
			const pq = (rxs * rys - dq) / dq;
			let q = Math.sqrt(Math.max(0, pq));
			if (large_arc_flag === sweep_flag) q = -q;
			const cxp = (q * rx * y1p) / ry;
			const cyp = (-q * ry * x1p) / rx;

			// Step 3: Compute (cx, cy) from (cx', cy')
			const cx =
				Math.cos(x_axis_rotation) * cxp - Math.sin(x_axis_rotation) * cyp + (start.x + end.x) / 2;
			const cy =
				Math.sin(x_axis_rotation) * cxp + Math.cos(x_axis_rotation) * cyp + (start.y + end.y) / 2;

			// Step 4: Compute θ1 and Δθ
			const theta = svgAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
			const delta =
				svgAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry) %
				(Math.PI * 2);

			path.currentPath.absellipse(
				cx,
				cy,
				rx,
				ry,
				theta,
				theta + delta,
				sweep_flag === 0,
				x_axis_rotation,
			);
		}

		function svgAngle(ux, uy, vx, vy) {
			const dot = ux * vx + uy * vy;
			const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
			let ang = Math.acos(Math.max(-1, Math.min(1, dot / len))); // floating point precision, slightly over values appear
			if (ux * vy - uy * vx < 0) ang = -ang;
			return ang;
		}

		/*
		 * According to https://www.w3.org/TR/SVG/shapes.html#RectElementRXAttribute
		 * rounded corner should be rendered to elliptical arc, but bezier curve does the job well enough
		 */
		function parseRectNode(node) {
			const x = parseFloatWithUnits(node.getAttribute('x') || 0);
			const y = parseFloatWithUnits(node.getAttribute('y') || 0);
			const rx = parseFloatWithUnits(node.getAttribute('rx') || node.getAttribute('ry') || 0);
			const ry = parseFloatWithUnits(node.getAttribute('ry') || node.getAttribute('rx') || 0);
			const w = parseFloatWithUnits(node.getAttribute('width'));
			const h = parseFloatWithUnits(node.getAttribute('height'));

			// Ellipse arc to Bezier approximation Coefficient (Inversed). See:
			// https://spencermortensen.com/articles/bezier-circle/
			const bci = 1 - 0.551915024494;

			const path = new ShapePath();

			// top left
			path.moveTo(x + rx, y);

			// top right
			path.lineTo(x + w - rx, y);
			if (rx !== 0 || ry !== 0) {
				path.bezierCurveTo(x + w - rx * bci, y, x + w, y + ry * bci, x + w, y + ry);
			}

			// bottom right
			path.lineTo(x + w, y + h - ry);
			if (rx !== 0 || ry !== 0) {
				path.bezierCurveTo(x + w, y + h - ry * bci, x + w - rx * bci, y + h, x + w - rx, y + h);
			}

			// bottom left
			path.lineTo(x + rx, y + h);
			if (rx !== 0 || ry !== 0) {
				path.bezierCurveTo(x + rx * bci, y + h, x, y + h - ry * bci, x, y + h - ry);
			}

			// back to top left
			path.lineTo(x, y + ry);
			if (rx !== 0 || ry !== 0) {
				path.bezierCurveTo(x, y + ry * bci, x + rx * bci, y, x + rx, y);
			}

			return path;
		}

		function parsePolygonNode(node) {
			function iterator(match, a, b) {
				const x = parseFloatWithUnits(a);
				const y = parseFloatWithUnits(b);

				if (index === 0) {
					path.moveTo(x, y);
				} else {
					path.lineTo(x, y);
				}

				index++;
			}

			const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

			const path = new ShapePath();

			let index = 0;

			node.getAttribute('points').replace(regex, iterator);

			path.currentPath.autoClose = true;

			return path;
		}

		function parsePolylineNode(node) {
			function iterator(match, a, b) {
				const x = parseFloatWithUnits(a);
				const y = parseFloatWithUnits(b);

				if (index === 0) {
					path.moveTo(x, y);
				} else {
					path.lineTo(x, y);
				}

				index++;
			}

			const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

			const path = new ShapePath();

			let index = 0;

			node.getAttribute('points').replace(regex, iterator);

			path.currentPath.autoClose = false;

			return path;
		}

		function parseCircleNode(node) {
			const x = parseFloatWithUnits(node.getAttribute('cx') || 0);
			const y = parseFloatWithUnits(node.getAttribute('cy') || 0);
			const r = parseFloatWithUnits(node.getAttribute('r') || 0);

			const subpath = new Path();
			subpath.absarc(x, y, r, 0, Math.PI * 2);

			const path = new ShapePath();
			path.subPaths.push(subpath);

			return path;
		}

		function parseEllipseNode(node) {
			const x = parseFloatWithUnits(node.getAttribute('cx') || 0);
			const y = parseFloatWithUnits(node.getAttribute('cy') || 0);
			const rx = parseFloatWithUnits(node.getAttribute('rx') || 0);
			const ry = parseFloatWithUnits(node.getAttribute('ry') || 0);

			const subpath = new Path();
			subpath.absellipse(x, y, rx, ry, 0, Math.PI * 2);

			const path = new ShapePath();
			path.subPaths.push(subpath);

			return path;
		}

		function parseLineNode(node) {
			const x1 = parseFloatWithUnits(node.getAttribute('x1') || 0);
			const y1 = parseFloatWithUnits(node.getAttribute('y1') || 0);
			const x2 = parseFloatWithUnits(node.getAttribute('x2') || 0);
			const y2 = parseFloatWithUnits(node.getAttribute('y2') || 0);

			const path = new ShapePath();
			path.moveTo(x1, y1);
			path.lineTo(x2, y2);
			path.currentPath.autoClose = false;

			return path;
		}

		//

		function parseStyle(node, style) {
			style = Object.assign({}, style); // clone style

			let stylesheetStyles = {};

			if (node.hasAttribute('class')) {
				const classSelectors = node
					.getAttribute('class')
					.split(/\s/)
					.filter(Boolean)
					.map((i) => i.trim());

				for (let i = 0; i < classSelectors.length; i++) {
					stylesheetStyles = Object.assign(stylesheetStyles, stylesheets[`.${classSelectors[i]}`]);
				}
			}

			if (node.hasAttribute('id')) {
				stylesheetStyles = Object.assign(
					stylesheetStyles,
					stylesheets[`#${node.getAttribute('id')}`],
				);
			}

			function addStyle(svgName, jsName, adjustFunction) {
				if (adjustFunction === undefined)
					adjustFunction = function copy(v) {
						if (v.startsWith('url'))
							console.warn('SVGLoader: url access in attributes is not implemented.');

						return v;
					};

				if (node.hasAttribute(svgName)) style[jsName] = adjustFunction(node.getAttribute(svgName));
				if (stylesheetStyles[svgName]) style[jsName] = adjustFunction(stylesheetStyles[svgName]);
				if (node.style?.[svgName]) style[jsName] = adjustFunction(node.style[svgName]);
			}

			function clamp(v) {
				return Math.max(0, Math.min(1, parseFloatWithUnits(v)));
			}

			function positive(v) {
				return Math.max(0, parseFloatWithUnits(v));
			}

			addStyle('fill', 'fill');
			addStyle('fill-opacity', 'fillOpacity', clamp);
			addStyle('fill-rule', 'fillRule');
			addStyle('opacity', 'opacity', clamp);
			addStyle('stroke', 'stroke');
			addStyle('stroke-opacity', 'strokeOpacity', clamp);
			addStyle('stroke-width', 'strokeWidth', positive);
			addStyle('stroke-linejoin', 'strokeLineJoin');
			addStyle('stroke-linecap', 'strokeLineCap');
			addStyle('stroke-miterlimit', 'strokeMiterLimit', positive);
			addStyle('visibility', 'visibility');

			return style;
		}

		// http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes

		function getReflection(a, b) {
			return a - (b - a);
		}

		// from https://github.com/ppvg/svg-numbers (MIT License)

		function parseFloats(input, flags, stride) {
			if (typeof input !== 'string') {
				throw new TypeError(`Invalid input: ${typeof input}`);
			}

			// Character groups
			const RE = {
				SEPARATOR: /[ \t\r\n\,.\-+]/,
				WHITESPACE: /[ \t\r\n]/,
				DIGIT: /[\d]/,
				SIGN: /[-+]/,
				POINT: /\./,
				COMMA: /,/,
				EXP: /e/i,
				FLAGS: /[01]/,
			};

			// States
			const SEP = 0;
			const INT = 1;
			const FLOAT = 2;
			const EXP = 3;

			let state = SEP;
			let seenComma = true;
			let number = '';
			let exponent = '';
			const result = [];

			function throwSyntaxError(current, i, partial) {
				const error = new SyntaxError(`Unexpected character "${current}" at index ${i}.`);
				error.partial = partial;
				throw error;
			}

			function newNumber() {
				if (number !== '') {
					if (exponent === '') result.push(Number(number));
					else result.push(Number(number) * 10 ** Number(exponent));
				}

				number = '';
				exponent = '';
			}

			let current;
			const length = input.length;

			for (let i = 0; i < length; i++) {
				current = input[i];

				// check for flags
				if (
					Array.isArray(flags) &&
					flags.includes(result.length % stride) &&
					RE.FLAGS.test(current)
				) {
					state = INT;
					number = current;
					newNumber();
					continue;
				}

				// parse until next number
				if (state === SEP) {
					// eat whitespace
					if (RE.WHITESPACE.test(current)) {
						continue;
					}

					// start new number
					if (RE.DIGIT.test(current) || RE.SIGN.test(current)) {
						state = INT;
						number = current;
						continue;
					}

					if (RE.POINT.test(current)) {
						state = FLOAT;
						number = current;
						continue;
					}

					// throw on double commas (e.g. "1, , 2")
					if (RE.COMMA.test(current)) {
						if (seenComma) {
							throwSyntaxError(current, i, result);
						}

						seenComma = true;
					}
				}

				// parse integer part
				if (state === INT) {
					if (RE.DIGIT.test(current)) {
						number += current;
						continue;
					}

					if (RE.POINT.test(current)) {
						number += current;
						state = FLOAT;
						continue;
					}

					if (RE.EXP.test(current)) {
						state = EXP;
						continue;
					}

					// throw on double signs ("-+1"), but not on sign as separator ("-1-2")
					if (RE.SIGN.test(current) && number.length === 1 && RE.SIGN.test(number[0])) {
						throwSyntaxError(current, i, result);
					}
				}

				// parse decimal part
				if (state === FLOAT) {
					if (RE.DIGIT.test(current)) {
						number += current;
						continue;
					}

					if (RE.EXP.test(current)) {
						state = EXP;
						continue;
					}

					// throw on double decimal points (e.g. "1..2")
					if (RE.POINT.test(current) && number[number.length - 1] === '.') {
						throwSyntaxError(current, i, result);
					}
				}

				// parse exponent part
				if (state === EXP) {
					if (RE.DIGIT.test(current)) {
						exponent += current;
						continue;
					}

					if (RE.SIGN.test(current)) {
						if (exponent === '') {
							exponent += current;
							continue;
						}

						if (exponent.length === 1 && RE.SIGN.test(exponent)) {
							throwSyntaxError(current, i, result);
						}
					}
				}

				// end of number
				if (RE.WHITESPACE.test(current)) {
					newNumber();
					state = SEP;
					seenComma = false;
				} else if (RE.COMMA.test(current)) {
					newNumber();
					state = SEP;
					seenComma = true;
				} else if (RE.SIGN.test(current)) {
					newNumber();
					state = INT;
					number = current;
				} else if (RE.POINT.test(current)) {
					newNumber();
					state = FLOAT;
					number = current;
				} else {
					throwSyntaxError(current, i, result);
				}
			}

			// add the last number found (if any)
			newNumber();

			return result;
		}

		// Units

		const units = ['mm', 'cm', 'in', 'pt', 'pc', 'px'];

		// Conversion: [ fromUnit ][ toUnit ] (-1 means dpi dependent)
		const unitConversion = {
			mm: {
				mm: 1,
				cm: 0.1,
				in: 1 / 25.4,
				pt: 72 / 25.4,
				pc: 6 / 25.4,
				px: -1,
			},
			cm: {
				mm: 10,
				cm: 1,
				in: 1 / 2.54,
				pt: 72 / 2.54,
				pc: 6 / 2.54,
				px: -1,
			},
			in: {
				mm: 25.4,
				cm: 2.54,
				in: 1,
				pt: 72,
				pc: 6,
				px: -1,
			},
			pt: {
				mm: 25.4 / 72,
				cm: 2.54 / 72,
				in: 1 / 72,
				pt: 1,
				pc: 6 / 72,
				px: -1,
			},
			pc: {
				mm: 25.4 / 6,
				cm: 2.54 / 6,
				in: 1 / 6,
				pt: 72 / 6,
				pc: 1,
				px: -1,
			},
			px: {
				px: 1,
			},
		};

		function parseFloatWithUnits(string) {
			let theUnit = 'px';

			if (typeof string === 'string' || string instanceof String) {
				for (let i = 0, n = units.length; i < n; i++) {
					const u = units[i];

					if (string.endsWith(u)) {
						theUnit = u;
						string = string.substring(0, string.length - u.length);
						break;
					}
				}
			}

			let scale = undefined;

			if (theUnit === 'px' && scope.defaultUnit !== 'px') {
				// Conversion scale from  pixels to inches, then to default units

				scale = unitConversion.in[scope.defaultUnit] / scope.defaultDPI;
			} else {
				scale = unitConversion[theUnit][scope.defaultUnit];

				if (scale < 0) {
					// Conversion scale to pixels

					scale = unitConversion[theUnit].in * scope.defaultDPI;
				}
			}

			return scale * Number.parseFloat(string);
		}

		// Transforms

		function getNodeTransform(node) {
			if (
				!(
					node.hasAttribute('transform') ||
					(node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y')))
				)
			) {
				return null;
			}

			const transform = parseNodeTransform(node);

			if (transformStack.length > 0) {
				transform.premultiply(transformStack[transformStack.length - 1]);
			}

			currentTransform.copy(transform);
			transformStack.push(transform);

			return transform;
		}

		function parseNodeTransform(node) {
			const transform = new Matrix3();
			const currentTransform = tempTransform0;

			if (node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y'))) {
				const tx = parseFloatWithUnits(node.getAttribute('x'));
				const ty = parseFloatWithUnits(node.getAttribute('y'));

				transform.translate(tx, ty);
			}

			if (node.hasAttribute('transform')) {
				const transformsTexts = node.getAttribute('transform').split(')');

				for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {
					const transformText = transformsTexts[tIndex].trim();

					if (transformText === '') continue;

					const openParPos = transformText.indexOf('(');
					const closeParPos = transformText.length;

					if (openParPos > 0 && openParPos < closeParPos) {
						const transformType = transformText.slice(0, openParPos);

						const array = parseFloats(transformText.slice(openParPos + 1));

						currentTransform.identity();

						switch (transformType) {
							case 'translate':
								if (array.length >= 1) {
									const tx = array[0];
									let ty = 0;

									if (array.length >= 2) {
										ty = array[1];
									}

									currentTransform.translate(tx, ty);
								}

								break;

							case 'rotate':
								if (array.length >= 1) {
									let angle = 0;
									let cx = 0;
									let cy = 0;

									// Angle
									angle = (array[0] * Math.PI) / 180;

									if (array.length >= 3) {
										// Center x, y
										cx = array[1];
										cy = array[2];
									}

									// Rotate around center (cx, cy)
									tempTransform1.makeTranslation(-cx, -cy);
									tempTransform2.makeRotation(angle);
									tempTransform3.multiplyMatrices(tempTransform2, tempTransform1);
									tempTransform1.makeTranslation(cx, cy);
									currentTransform.multiplyMatrices(tempTransform1, tempTransform3);
								}

								break;

							case 'scale':
								if (array.length >= 1) {
									const scaleX = array[0];
									let scaleY = scaleX;

									if (array.length >= 2) {
										scaleY = array[1];
									}

									currentTransform.scale(scaleX, scaleY);
								}

								break;

							case 'skewX':
								if (array.length === 1) {
									currentTransform.set(
										1,
										Math.tan((array[0] * Math.PI) / 180),
										0,
										0,
										1,
										0,
										0,
										0,
										1,
									);
								}

								break;

							case 'skewY':
								if (array.length === 1) {
									currentTransform.set(
										1,
										0,
										0,
										Math.tan((array[0] * Math.PI) / 180),
										1,
										0,
										0,
										0,
										1,
									);
								}

								break;

							case 'matrix':
								if (array.length === 6) {
									currentTransform.set(
										array[0],
										array[2],
										array[4],
										array[1],
										array[3],
										array[5],
										0,
										0,
										1,
									);
								}

								break;
						}
					}

					transform.premultiply(currentTransform);
				}
			}

			return transform;
		}

		function transformPath(path, m) {
			function transfVec2(v2) {
				tempV3.set(v2.x, v2.y, 1).applyMatrix3(m);

				v2.set(tempV3.x, tempV3.y);
			}

			function transfEllipseGeneric(curve) {
				// For math description see:
				// https://math.stackexchange.com/questions/4544164

				const a = curve.xRadius;
				const b = curve.yRadius;

				const cosTheta = Math.cos(curve.aRotation);
				const sinTheta = Math.sin(curve.aRotation);

				const v1 = new Vector3(a * cosTheta, a * sinTheta, 0);
				const v2 = new Vector3(-b * sinTheta, b * cosTheta, 0);

				const f1 = v1.applyMatrix3(m);
				const f2 = v2.applyMatrix3(m);

				const mF = tempTransform0.set(f1.x, f2.x, 0, f1.y, f2.y, 0, 0, 0, 1);

				const mFInv = tempTransform1.copy(mF).invert();
				const mFInvT = tempTransform2.copy(mFInv).transpose();
				const mQ = mFInvT.multiply(mFInv);
				const mQe = mQ.elements;

				const ed = eigenDecomposition(mQe[0], mQe[1], mQe[4]);
				const rt1sqrt = Math.sqrt(ed.rt1);
				const rt2sqrt = Math.sqrt(ed.rt2);

				curve.xRadius = 1 / rt1sqrt;
				curve.yRadius = 1 / rt2sqrt;
				curve.aRotation = Math.atan2(ed.sn, ed.cs);

				const isFullEllipse =
					(curve.aEndAngle - curve.aStartAngle) % (2 * Math.PI) < Number.EPSILON;

				// Do not touch angles of a full ellipse because after transformation they
				// would converge to a sinle value effectively removing the whole curve

				if (!isFullEllipse) {
					const mDsqrt = tempTransform1.set(rt1sqrt, 0, 0, 0, rt2sqrt, 0, 0, 0, 1);

					const mRT = tempTransform2.set(ed.cs, ed.sn, 0, -ed.sn, ed.cs, 0, 0, 0, 1);

					const mDRF = mDsqrt.multiply(mRT).multiply(mF);

					const transformAngle = (phi) => {
						const { x: cosR, y: sinR } = new Vector3(Math.cos(phi), Math.sin(phi), 0).applyMatrix3(
							mDRF,
						);

						return Math.atan2(sinR, cosR);
					};

					curve.aStartAngle = transformAngle(curve.aStartAngle);
					curve.aEndAngle = transformAngle(curve.aEndAngle);

					if (isTransformFlipped(m)) {
						curve.aClockwise = !curve.aClockwise;
					}
				}
			}

			function transfEllipseNoSkew(curve) {
				// Faster shortcut if no skew is applied
				// (e.g, a euclidean transform of a group containing the ellipse)

				const sx = getTransformScaleX(m);
				const sy = getTransformScaleY(m);

				curve.xRadius *= sx;
				curve.yRadius *= sy;

				// Extract rotation angle from the matrix of form:
				//
				//  | cosθ sx   -sinθ sy |
				//  | sinθ sx    cosθ sy |
				//
				// Remembering that tanθ = sinθ / cosθ; and that
				// `sx`, `sy`, or both might be zero.
				const theta =
					sx > Number.EPSILON
						? Math.atan2(m.elements[1], m.elements[0])
						: Math.atan2(-m.elements[3], m.elements[4]);

				curve.aRotation += theta;

				if (isTransformFlipped(m)) {
					curve.aStartAngle *= -1;
					curve.aEndAngle *= -1;
					curve.aClockwise = !curve.aClockwise;
				}
			}

			const subPaths = path.subPaths;

			for (let i = 0, n = subPaths.length; i < n; i++) {
				const subPath = subPaths[i];
				const curves = subPath.curves;

				for (let j = 0; j < curves.length; j++) {
					const curve = curves[j];

					if (curve.isLineCurve) {
						transfVec2(curve.v1);
						transfVec2(curve.v2);
					} else if (curve.isCubicBezierCurve) {
						transfVec2(curve.v0);
						transfVec2(curve.v1);
						transfVec2(curve.v2);
						transfVec2(curve.v3);
					} else if (curve.isQuadraticBezierCurve) {
						transfVec2(curve.v0);
						transfVec2(curve.v1);
						transfVec2(curve.v2);
					} else if (curve.isEllipseCurve) {
						// Transform ellipse center point

						tempV2.set(curve.aX, curve.aY);
						transfVec2(tempV2);
						curve.aX = tempV2.x;
						curve.aY = tempV2.y;

						// Transform ellipse shape parameters

						if (isTransformSkewed(m)) {
							transfEllipseGeneric(curve);
						} else {
							transfEllipseNoSkew(curve);
						}
					}
				}
			}
		}

		function isTransformFlipped(m) {
			const te = m.elements;
			return te[0] * te[4] - te[1] * te[3] < 0;
		}

		function isTransformSkewed(m) {
			const te = m.elements;
			const basisDot = te[0] * te[3] + te[1] * te[4];

			// Shortcut for trivial rotations and transformations
			if (basisDot === 0) return false;

			const sx = getTransformScaleX(m);
			const sy = getTransformScaleY(m);

			return Math.abs(basisDot / (sx * sy)) > Number.EPSILON;
		}

		function getTransformScaleX(m) {
			const te = m.elements;
			return Math.sqrt(te[0] * te[0] + te[1] * te[1]);
		}

		function getTransformScaleY(m) {
			const te = m.elements;
			return Math.sqrt(te[3] * te[3] + te[4] * te[4]);
		}

		// Calculates the eigensystem of a real symmetric 2x2 matrix
		//    [ A  B ]
		//    [ B  C ]
		// in the form
		//    [ A  B ]  =  [ cs  -sn ] [ rt1   0  ] [  cs  sn ]
		//    [ B  C ]     [ sn   cs ] [  0   rt2 ] [ -sn  cs ]
		// where rt1 >= rt2.
		//
		// Adapted from: https://www.mpi-hd.mpg.de/personalhomes/globes/3x3/index.html
		// -> Algorithms for real symmetric matrices -> Analytical (2x2 symmetric)
		function eigenDecomposition(A, B, C) {
			let rt1;
			let rt2;
			let cs;
			let sn;
			let t;
			const sm = A + C;
			const df = A - C;
			const rt = Math.sqrt(df * df + 4 * B * B);

			if (sm > 0) {
				rt1 = 0.5 * (sm + rt);
				t = 1 / rt1;
				rt2 = A * t * C - B * t * B;
			} else if (sm < 0) {
				rt2 = 0.5 * (sm - rt);
			} else {
				// This case needs to be treated separately to avoid div by 0

				rt1 = 0.5 * rt;
				rt2 = -0.5 * rt;
			}

			// Calculate eigenvectors

			if (df > 0) {
				cs = df + rt;
			} else {
				cs = df - rt;
			}

			if (Math.abs(cs) > 2 * Math.abs(B)) {
				t = (-2 * B) / cs;
				sn = 1 / Math.sqrt(1 + t * t);
				cs = t * sn;
			} else if (Math.abs(B) === 0) {
				cs = 1;
				sn = 0;
			} else {
				t = (-0.5 * cs) / B;
				cs = 1 / Math.sqrt(1 + t * t);
				sn = t * cs;
			}

			if (df > 0) {
				t = cs;
				cs = -sn;
				sn = t;
			}

			return { rt1, rt2, cs, sn };
		}

		//

		const paths = [];
		const stylesheets = {};

		const transformStack = [];

		const tempTransform0 = new Matrix3();
		const tempTransform1 = new Matrix3();
		const tempTransform2 = new Matrix3();
		const tempTransform3 = new Matrix3();
		const tempV2 = new Vector2();
		const tempV3 = new Vector3();

		const currentTransform = new Matrix3();

		const xml = new DOMParser().parseFromString(text, 'image/svg+xml'); // application/xml

		parseNode(xml.documentElement, {
			fill: '#000',
			fillOpacity: 1,
			strokeOpacity: 1,
			strokeWidth: 1,
			strokeLineJoin: 'miter',
			strokeLineCap: 'butt',
			strokeMiterLimit: 4,
		});

		const data = { paths: paths, xml: xml.documentElement };

		// console.log( paths );
		return data;
	}

	static createShapes(shapePath) {
		// Param shapePath: a shapepath as returned by the parse function of this class
		// Returns Shape object

		const BIGNUMBER = 999999999;

		const IntersectionLocationType = {
			ORIGIN: 0,
			DESTINATION: 1,
			BETWEEN: 2,
			LEFT: 3,
			RIGHT: 4,
			BEHIND: 5,
			BEYOND: 6,
		};

		const classifyResult = {
			loc: IntersectionLocationType.ORIGIN,
			t: 0,
		};

		function findEdgeIntersection(a0, a1, b0, b1) {
			const x1 = a0.x;
			const x2 = a1.x;
			const x3 = b0.x;
			const x4 = b1.x;
			const y1 = a0.y;
			const y2 = a1.y;
			const y3 = b0.y;
			const y4 = b1.y;
			const nom1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
			const nom2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
			const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
			const t1 = nom1 / denom;
			const t2 = nom2 / denom;

			if ((denom === 0 && nom1 !== 0) || t1 <= 0 || t1 >= 1 || t2 < 0 || t2 > 1) {
				//1. lines are parallel or edges don't intersect

				return null;
			}
			if (nom1 === 0 && denom === 0) {
				//2. lines are colinear

				//check if endpoints of edge2 (b0-b1) lies on edge1 (a0-a1)
				for (let i = 0; i < 2; i++) {
					classifyPoint(i === 0 ? b0 : b1, a0, a1);
					//find position of this endpoints relatively to edge1
					if (classifyResult.loc === IntersectionLocationType.ORIGIN) {
						const point = i === 0 ? b0 : b1;
						return { x: point.x, y: point.y, t: classifyResult.t };
					}
					if (classifyResult.loc === IntersectionLocationType.BETWEEN) {
						const x = +(x1 + classifyResult.t * (x2 - x1)).toPrecision(10);
						const y = +(y1 + classifyResult.t * (y2 - y1)).toPrecision(10);
						return { x: x, y: y, t: classifyResult.t };
					}
				}

				return null;
			}
			//3. edges intersect

			for (let i = 0; i < 2; i++) {
				classifyPoint(i === 0 ? b0 : b1, a0, a1);

				if (classifyResult.loc === IntersectionLocationType.ORIGIN) {
					const point = i === 0 ? b0 : b1;
					return { x: point.x, y: point.y, t: classifyResult.t };
				}
			}

			const x = +(x1 + t1 * (x2 - x1)).toPrecision(10);
			const y = +(y1 + t1 * (y2 - y1)).toPrecision(10);
			return { x: x, y: y, t: t1 };
		}

		function classifyPoint(p, edgeStart, edgeEnd) {
			const ax = edgeEnd.x - edgeStart.x;
			const ay = edgeEnd.y - edgeStart.y;
			const bx = p.x - edgeStart.x;
			const by = p.y - edgeStart.y;
			const sa = ax * by - bx * ay;

			if (p.x === edgeStart.x && p.y === edgeStart.y) {
				classifyResult.loc = IntersectionLocationType.ORIGIN;
				classifyResult.t = 0;
				return;
			}

			if (p.x === edgeEnd.x && p.y === edgeEnd.y) {
				classifyResult.loc = IntersectionLocationType.DESTINATION;
				classifyResult.t = 1;
				return;
			}

			if (sa < -Number.EPSILON) {
				classifyResult.loc = IntersectionLocationType.LEFT;
				return;
			}

			if (sa > Number.EPSILON) {
				classifyResult.loc = IntersectionLocationType.RIGHT;
				return;
			}

			if (ax * bx < 0 || ay * by < 0) {
				classifyResult.loc = IntersectionLocationType.BEHIND;
				return;
			}

			if (Math.sqrt(ax * ax + ay * ay) < Math.sqrt(bx * bx + by * by)) {
				classifyResult.loc = IntersectionLocationType.BEYOND;
				return;
			}

			let t;

			if (ax !== 0) {
				t = bx / ax;
			} else {
				t = by / ay;
			}

			classifyResult.loc = IntersectionLocationType.BETWEEN;
			classifyResult.t = t;
		}

		function getIntersections(path1, path2) {
			const intersectionsRaw = [];
			const intersections = [];

			for (let index = 1; index < path1.length; index++) {
				const path1EdgeStart = path1[index - 1];
				const path1EdgeEnd = path1[index];

				for (let index2 = 1; index2 < path2.length; index2++) {
					const path2EdgeStart = path2[index2 - 1];
					const path2EdgeEnd = path2[index2];

					const intersection = findEdgeIntersection(
						path1EdgeStart,
						path1EdgeEnd,
						path2EdgeStart,
						path2EdgeEnd,
					);

					if (
						intersection !== null &&
						intersectionsRaw.find(
							(i) =>
								i.t <= intersection.t + Number.EPSILON && i.t >= intersection.t - Number.EPSILON,
						) === undefined
					) {
						intersectionsRaw.push(intersection);
						intersections.push(new Vector2(intersection.x, intersection.y));
					}
				}
			}

			return intersections;
		}

		function getScanlineIntersections(scanline, boundingBox, paths) {
			const center = new Vector2();
			boundingBox.getCenter(center);

			const allIntersections = [];

			paths.forEach((path) => {
				// check if the center of the bounding box is in the bounding box of the paths.
				// this is a pruning method to limit the search of intersections in paths that can't envelop of the current path.
				// if a path envelops another path. The center of that oter path, has to be inside the bounding box of the enveloping path.
				if (path.boundingBox.containsPoint(center)) {
					const intersections = getIntersections(scanline, path.points);

					intersections.forEach((p) => {
						allIntersections.push({ identifier: path.identifier, isCW: path.isCW, point: p });
					});
				}
			});

			allIntersections.sort((i1, i2) => {
				return i1.point.x - i2.point.x;
			});

			return allIntersections;
		}

		function isHoleTo(simplePath, allPaths, scanlineMinX, scanlineMaxX, _fillRule) {
			if (_fillRule === null || _fillRule === undefined || _fillRule === '') {
				_fillRule = 'nonzero';
			}

			const centerBoundingBox = new Vector2();
			simplePath.boundingBox.getCenter(centerBoundingBox);

			const scanline = [
				new Vector2(scanlineMinX, centerBoundingBox.y),
				new Vector2(scanlineMaxX, centerBoundingBox.y),
			];

			const scanlineIntersections = getScanlineIntersections(
				scanline,
				simplePath.boundingBox,
				allPaths,
			);

			scanlineIntersections.sort((i1, i2) => {
				return i1.point.x - i2.point.x;
			});

			const baseIntersections = [];
			const otherIntersections = [];

			scanlineIntersections.forEach((i) => {
				if (i.identifier === simplePath.identifier) {
					baseIntersections.push(i);
				} else {
					otherIntersections.push(i);
				}
			});

			const firstXOfPath = baseIntersections[0].point.x;

			// build up the path hierarchy
			const stack = [];
			let i = 0;

			while (i < otherIntersections.length && otherIntersections[i].point.x < firstXOfPath) {
				if (stack.length > 0 && stack[stack.length - 1] === otherIntersections[i].identifier) {
					stack.pop();
				} else {
					stack.push(otherIntersections[i].identifier);
				}

				i++;
			}

			stack.push(simplePath.identifier);

			if (_fillRule === 'evenodd') {
				const isHole = stack.length % 2 === 0;
				const isHoleFor = stack[stack.length - 2];

				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };
			}
			if (_fillRule === 'nonzero') {
				// check if path is a hole by counting the amount of paths with alternating rotations it has to cross.
				let isHole = true;
				let isHoleFor = null;
				let lastCWValue = null;

				for (let i = 0; i < stack.length; i++) {
					const identifier = stack[i];
					if (isHole) {
						lastCWValue = allPaths[identifier].isCW;
						isHole = false;
						isHoleFor = identifier;
					} else if (lastCWValue !== allPaths[identifier].isCW) {
						lastCWValue = allPaths[identifier].isCW;
						isHole = true;
					}
				}

				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };
			}
			console.warn(`fill-rule: "${_fillRule}" is currently not implemented.`);
		}

		// check for self intersecting paths
		// TODO

		// check intersecting paths
		// TODO

		// prepare paths for hole detection
		let scanlineMinX = BIGNUMBER;
		let scanlineMaxX = -BIGNUMBER;

		let simplePaths = shapePath.subPaths.map((p) => {
			const points = p.getPoints();
			let maxY = -BIGNUMBER;
			let minY = BIGNUMBER;
			let maxX = -BIGNUMBER;
			let minX = BIGNUMBER;

			//points.forEach(p => p.y *= -1);

			for (let i = 0; i < points.length; i++) {
				const p = points[i];

				if (p.y > maxY) {
					maxY = p.y;
				}

				if (p.y < minY) {
					minY = p.y;
				}

				if (p.x > maxX) {
					maxX = p.x;
				}

				if (p.x < minX) {
					minX = p.x;
				}
			}

			//
			if (scanlineMaxX <= maxX) {
				scanlineMaxX = maxX + 1;
			}

			if (scanlineMinX >= minX) {
				scanlineMinX = minX - 1;
			}

			return {
				curves: p.curves,
				points: points,
				isCW: ShapeUtils.isClockWise(points),
				identifier: -1,
				boundingBox: new Box2(new Vector2(minX, minY), new Vector2(maxX, maxY)),
			};
		});

		simplePaths = simplePaths.filter((sp) => sp.points.length > 1);

		for (let identifier = 0; identifier < simplePaths.length; identifier++) {
			simplePaths[identifier].identifier = identifier;
		}

		// check if path is solid or a hole
		const isAHole = simplePaths.map((p) =>
			isHoleTo(
				p,
				simplePaths,
				scanlineMinX,
				scanlineMaxX,
				shapePath.userData ? shapePath.userData.style.fillRule : undefined,
			),
		);

		const shapesToReturn = [];
		simplePaths.forEach((p) => {
			const amIAHole = isAHole[p.identifier];

			if (!amIAHole.isHole) {
				const shape = new Shape$1();
				shape.curves = p.curves;
				const holes = isAHole.filter((h) => h.isHole && h.for === p.identifier);
				holes.forEach((h) => {
					const hole = simplePaths[h.identifier];
					const path = new Path();
					path.curves = hole.curves;
					shape.holes.push(path);
				});
				shapesToReturn.push(shape);
			}
		});

		return shapesToReturn;
	}

	static getStrokeStyle(width, color, lineJoin, lineCap, miterLimit) {
		// Param width: Stroke width
		// Param color: As returned by THREE.Color.getStyle()
		// Param lineJoin: One of "round", "bevel", "miter" or "miter-limit"
		// Param lineCap: One of "round", "square" or "butt"
		// Param miterLimit: Maximum join length, in multiples of the "width" parameter (join is truncated if it exceeds that distance)
		// Returns style object

		width = width !== undefined ? width : 1;
		color = color !== undefined ? color : '#000';
		lineJoin = lineJoin !== undefined ? lineJoin : 'miter';
		lineCap = lineCap !== undefined ? lineCap : 'butt';
		miterLimit = miterLimit !== undefined ? miterLimit : 4;

		return {
			strokeColor: color,
			strokeWidth: width,
			strokeLineJoin: lineJoin,
			strokeLineCap: lineCap,
			strokeMiterLimit: miterLimit,
		};
	}

	static pointsToStroke(points, style, arcDivisions, minDistance) {
		// Generates a stroke with some width around the given path.
		// The path can be open or closed (last point equals to first point)
		// Param points: Array of Vector2D (the path). Minimum 2 points.
		// Param style: Object with SVG properties as returned by SVGLoader.getStrokeStyle(), or SVGLoader.parse() in the path.userData.style object
		// Params arcDivisions: Arc divisions for round joins and endcaps. (Optional)
		// Param minDistance: Points closer to this distance will be merged. (Optional)
		// Returns BufferGeometry with stroke triangles (In plane z = 0). UV coordinates are generated ('u' along path. 'v' across it, from left to right)

		const vertices = [];
		const normals = [];
		const uvs = [];

		if (
			SVGLoader.pointsToStrokeWithBuffers(
				points,
				style,
				arcDivisions,
				minDistance,
				vertices,
				normals,
				uvs,
			) === 0
		) {
			return null;
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
		geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

		return geometry;
	}

	static pointsToStrokeWithBuffers(
		points,
		style,
		arcDivisions,
		minDistance,
		vertices,
		normals,
		uvs,
		vertexOffset,
	) {
		// This function can be called to update existing arrays or buffers.
		// Accepts same parameters as pointsToStroke, plus the buffers and optional offset.
		// Param vertexOffset: Offset vertices to start writing in the buffers (3 elements/vertex for vertices and normals, and 2 elements/vertex for uvs)
		// Returns number of written vertices / normals / uvs pairs
		// if 'vertices' parameter is undefined no triangles will be generated, but the returned vertices count will still be valid (useful to preallocate the buffers)
		// 'normals' and 'uvs' buffers are optional

		const tempV2_1 = new Vector2();
		const tempV2_2 = new Vector2();
		const tempV2_3 = new Vector2();
		const tempV2_4 = new Vector2();
		const tempV2_5 = new Vector2();
		const tempV2_6 = new Vector2();
		const tempV2_7 = new Vector2();
		const lastPointL = new Vector2();
		const lastPointR = new Vector2();
		const point0L = new Vector2();
		const point0R = new Vector2();
		const currentPointL = new Vector2();
		const currentPointR = new Vector2();
		const nextPointL = new Vector2();
		const nextPointR = new Vector2();
		const innerPoint = new Vector2();
		const outerPoint = new Vector2();

		arcDivisions = arcDivisions !== undefined ? arcDivisions : 12;
		minDistance = minDistance !== undefined ? minDistance : 0.001;
		vertexOffset = vertexOffset !== undefined ? vertexOffset : 0;

		// First ensure there are no duplicated points
		points = removeDuplicatedPoints(points);

		const numPoints = points.length;

		if (numPoints < 2) return 0;

		const isClosed = points[0].equals(points[numPoints - 1]);

		let currentPoint;
		let previousPoint = points[0];
		let nextPoint;

		const strokeWidth2 = style.strokeWidth / 2;

		const deltaU = 1 / (numPoints - 1);
		let u0 = 0;
		let u1;

		let innerSideModified;
		let joinIsOnLeftSide;
		let isMiter;
		let initialJoinIsOnLeftSide = false;

		let numVertices = 0;
		let currentCoordinate = vertexOffset * 3;
		let currentCoordinateUV = vertexOffset * 2;

		// Get initial left and right stroke points
		getNormal(points[0], points[1], tempV2_1).multiplyScalar(strokeWidth2);
		lastPointL.copy(points[0]).sub(tempV2_1);
		lastPointR.copy(points[0]).add(tempV2_1);
		point0L.copy(lastPointL);
		point0R.copy(lastPointR);

		for (let iPoint = 1; iPoint < numPoints; iPoint++) {
			currentPoint = points[iPoint];

			// Get next point
			if (iPoint === numPoints - 1) {
				if (isClosed) {
					// Skip duplicated initial point
					nextPoint = points[1];
				} else nextPoint = undefined;
			} else {
				nextPoint = points[iPoint + 1];
			}

			// Normal of previous segment in tempV2_1
			const normal1 = tempV2_1;
			getNormal(previousPoint, currentPoint, normal1);

			tempV2_3.copy(normal1).multiplyScalar(strokeWidth2);
			currentPointL.copy(currentPoint).sub(tempV2_3);
			currentPointR.copy(currentPoint).add(tempV2_3);

			u1 = u0 + deltaU;

			innerSideModified = false;

			if (nextPoint !== undefined) {
				// Normal of next segment in tempV2_2
				getNormal(currentPoint, nextPoint, tempV2_2);

				tempV2_3.copy(tempV2_2).multiplyScalar(strokeWidth2);
				nextPointL.copy(currentPoint).sub(tempV2_3);
				nextPointR.copy(currentPoint).add(tempV2_3);

				joinIsOnLeftSide = true;
				tempV2_3.subVectors(nextPoint, previousPoint);
				if (normal1.dot(tempV2_3) < 0) {
					joinIsOnLeftSide = false;
				}

				if (iPoint === 1) initialJoinIsOnLeftSide = joinIsOnLeftSide;

				tempV2_3.subVectors(nextPoint, currentPoint);
				tempV2_3.normalize();
				const dot = Math.abs(normal1.dot(tempV2_3));

				// If path is straight, don't create join
				if (dot > Number.EPSILON) {
					// Compute inner and outer segment intersections
					const miterSide = strokeWidth2 / dot;
					tempV2_3.multiplyScalar(-miterSide);
					tempV2_4.subVectors(currentPoint, previousPoint);
					tempV2_5.copy(tempV2_4).setLength(miterSide).add(tempV2_3);
					innerPoint.copy(tempV2_5).negate();
					const miterLength2 = tempV2_5.length();
					const segmentLengthPrev = tempV2_4.length();
					tempV2_4.divideScalar(segmentLengthPrev);
					tempV2_6.subVectors(nextPoint, currentPoint);
					const segmentLengthNext = tempV2_6.length();
					tempV2_6.divideScalar(segmentLengthNext);
					// Check that previous and next segments doesn't overlap with the innerPoint of intersection
					if (
						tempV2_4.dot(innerPoint) < segmentLengthPrev &&
						tempV2_6.dot(innerPoint) < segmentLengthNext
					) {
						innerSideModified = true;
					}

					outerPoint.copy(tempV2_5).add(currentPoint);
					innerPoint.add(currentPoint);

					isMiter = false;

					if (innerSideModified) {
						if (joinIsOnLeftSide) {
							nextPointR.copy(innerPoint);
							currentPointR.copy(innerPoint);
						} else {
							nextPointL.copy(innerPoint);
							currentPointL.copy(innerPoint);
						}
					} else {
						// The segment triangles are generated here if there was overlapping

						makeSegmentTriangles();
					}

					switch (style.strokeLineJoin) {
						case 'bevel':
							makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);

							break;

						case 'round':
							// Segment triangles

							createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);

							// Join triangles

							if (joinIsOnLeftSide) {
								makeCircularSector(currentPoint, currentPointL, nextPointL, u1, 0);
							} else {
								makeCircularSector(currentPoint, nextPointR, currentPointR, u1, 1);
							}

							break;

						// biome-ignore lint/complexity/noUselessSwitchCase: readability
						case 'miter':
						// biome-ignore lint/complexity/noUselessSwitchCase: readability
						case 'miter-clip':
						default: {
							const miterFraction = (strokeWidth2 * style.strokeMiterLimit) / miterLength2;

							if (miterFraction < 1) {
								// The join miter length exceeds the miter limit

								if (style.strokeLineJoin !== 'miter-clip') {
									makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u1);
									break;
								}
								// Segment triangles

								createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified);

								// Miter-clip join triangles

								if (joinIsOnLeftSide) {
									tempV2_6
										.subVectors(outerPoint, currentPointL)
										.multiplyScalar(miterFraction)
										.add(currentPointL);
									tempV2_7
										.subVectors(outerPoint, nextPointL)
										.multiplyScalar(miterFraction)
										.add(nextPointL);

									addVertex(currentPointL, u1, 0);
									addVertex(tempV2_6, u1, 0);
									addVertex(currentPoint, u1, 0.5);

									addVertex(currentPoint, u1, 0.5);
									addVertex(tempV2_6, u1, 0);
									addVertex(tempV2_7, u1, 0);

									addVertex(currentPoint, u1, 0.5);
									addVertex(tempV2_7, u1, 0);
									addVertex(nextPointL, u1, 0);
								} else {
									tempV2_6
										.subVectors(outerPoint, currentPointR)
										.multiplyScalar(miterFraction)
										.add(currentPointR);
									tempV2_7
										.subVectors(outerPoint, nextPointR)
										.multiplyScalar(miterFraction)
										.add(nextPointR);

									addVertex(currentPointR, u1, 1);
									addVertex(tempV2_6, u1, 1);
									addVertex(currentPoint, u1, 0.5);

									addVertex(currentPoint, u1, 0.5);
									addVertex(tempV2_6, u1, 1);
									addVertex(tempV2_7, u1, 1);

									addVertex(currentPoint, u1, 0.5);
									addVertex(tempV2_7, u1, 1);
									addVertex(nextPointR, u1, 1);
								}
							} else {
								// Miter join segment triangles

								if (innerSideModified) {
									// Optimized segment + join triangles

									if (joinIsOnLeftSide) {
										addVertex(lastPointR, u0, 1);
										addVertex(lastPointL, u0, 0);
										addVertex(outerPoint, u1, 0);

										addVertex(lastPointR, u0, 1);
										addVertex(outerPoint, u1, 0);
										addVertex(innerPoint, u1, 1);
									} else {
										addVertex(lastPointR, u0, 1);
										addVertex(lastPointL, u0, 0);
										addVertex(outerPoint, u1, 1);

										addVertex(lastPointL, u0, 0);
										addVertex(innerPoint, u1, 0);
										addVertex(outerPoint, u1, 1);
									}

									if (joinIsOnLeftSide) {
										nextPointL.copy(outerPoint);
									} else {
										nextPointR.copy(outerPoint);
									}
								} else {
									// Add extra miter join triangles

									if (joinIsOnLeftSide) {
										addVertex(currentPointL, u1, 0);
										addVertex(outerPoint, u1, 0);
										addVertex(currentPoint, u1, 0.5);

										addVertex(currentPoint, u1, 0.5);
										addVertex(outerPoint, u1, 0);
										addVertex(nextPointL, u1, 0);
									} else {
										addVertex(currentPointR, u1, 1);
										addVertex(outerPoint, u1, 1);
										addVertex(currentPoint, u1, 0.5);

										addVertex(currentPoint, u1, 0.5);
										addVertex(outerPoint, u1, 1);
										addVertex(nextPointR, u1, 1);
									}
								}

								isMiter = true;
							}

							break;
						}
					}
				} else {
					// The segment triangles are generated here when two consecutive points are collinear

					makeSegmentTriangles();
				}
			} else {
				// The segment triangles are generated here if it is the ending segment

				makeSegmentTriangles();
			}

			if (!isClosed && iPoint === numPoints - 1) {
				// Start line endcap
				addCapGeometry(points[0], point0L, point0R, joinIsOnLeftSide, true, u0);
			}

			// Increment loop variables

			u0 = u1;

			previousPoint = currentPoint;

			lastPointL.copy(nextPointL);
			lastPointR.copy(nextPointR);
		}

		if (!isClosed) {
			// Ending line endcap
			addCapGeometry(currentPoint, currentPointL, currentPointR, joinIsOnLeftSide, false, u1);
		} else if (innerSideModified && vertices) {
			// Modify path first segment vertices to adjust to the segments inner and outer intersections

			let lastOuter = outerPoint;
			let lastInner = innerPoint;

			if (initialJoinIsOnLeftSide !== joinIsOnLeftSide) {
				lastOuter = innerPoint;
				lastInner = outerPoint;
			}

			if (joinIsOnLeftSide) {
				if (isMiter || initialJoinIsOnLeftSide) {
					lastInner.toArray(vertices, 0 * 3);
					lastInner.toArray(vertices, 3 * 3);

					if (isMiter) {
						lastOuter.toArray(vertices, 1 * 3);
					}
				}
			} else {
				if (isMiter || !initialJoinIsOnLeftSide) {
					lastInner.toArray(vertices, 1 * 3);
					lastInner.toArray(vertices, 3 * 3);

					if (isMiter) {
						lastOuter.toArray(vertices, 0 * 3);
					}
				}
			}
		}

		return numVertices;

		// -- End of algorithm

		// -- Functions

		function getNormal(p1, p2, result) {
			result.subVectors(p2, p1);
			return result.set(-result.y, result.x).normalize();
		}

		function addVertex(position, u, v) {
			if (vertices) {
				vertices[currentCoordinate] = position.x;
				vertices[currentCoordinate + 1] = position.y;
				vertices[currentCoordinate + 2] = 0;

				if (normals) {
					normals[currentCoordinate] = 0;
					normals[currentCoordinate + 1] = 0;
					normals[currentCoordinate + 2] = 1;
				}

				currentCoordinate += 3;

				if (uvs) {
					uvs[currentCoordinateUV] = u;
					uvs[currentCoordinateUV + 1] = v;

					currentCoordinateUV += 2;
				}
			}

			numVertices += 3;
		}

		function makeCircularSector(center, p1, p2, u, v) {
			// param p1, p2: Points in the circle arc.
			// p1 and p2 are in clockwise direction.

			tempV2_1.copy(p1).sub(center).normalize();
			tempV2_2.copy(p2).sub(center).normalize();

			let angle = Math.PI;
			const dot = tempV2_1.dot(tempV2_2);
			if (Math.abs(dot) < 1) angle = Math.abs(Math.acos(dot));

			angle /= arcDivisions;

			tempV2_3.copy(p1);

			for (let i = 0, il = arcDivisions - 1; i < il; i++) {
				tempV2_4.copy(tempV2_3).rotateAround(center, angle);

				addVertex(tempV2_3, u, v);
				addVertex(tempV2_4, u, v);
				addVertex(center, u, 0.5);

				tempV2_3.copy(tempV2_4);
			}

			addVertex(tempV2_4, u, v);
			addVertex(p2, u, v);
			addVertex(center, u, 0.5);
		}

		function makeSegmentTriangles() {
			addVertex(lastPointR, u0, 1);
			addVertex(lastPointL, u0, 0);
			addVertex(currentPointL, u1, 0);

			addVertex(lastPointR, u0, 1);
			addVertex(currentPointL, u1, 1);
			addVertex(currentPointR, u1, 0);
		}

		function makeSegmentWithBevelJoin(joinIsOnLeftSide, innerSideModified, u) {
			if (innerSideModified) {
				// Optimized segment + bevel triangles

				if (joinIsOnLeftSide) {
					// Path segments triangles

					addVertex(lastPointR, u0, 1);
					addVertex(lastPointL, u0, 0);
					addVertex(currentPointL, u1, 0);

					addVertex(lastPointR, u0, 1);
					addVertex(currentPointL, u1, 0);
					addVertex(innerPoint, u1, 1);

					// Bevel join triangle

					addVertex(currentPointL, u, 0);
					addVertex(nextPointL, u, 0);
					addVertex(innerPoint, u, 0.5);
				} else {
					// Path segments triangles

					addVertex(lastPointR, u0, 1);
					addVertex(lastPointL, u0, 0);
					addVertex(currentPointR, u1, 1);

					addVertex(lastPointL, u0, 0);
					addVertex(innerPoint, u1, 0);
					addVertex(currentPointR, u1, 1);

					// Bevel join triangle

					addVertex(currentPointR, u, 1);
					addVertex(nextPointR, u, 0);
					addVertex(innerPoint, u, 0.5);
				}
			} else {
				// Bevel join triangle. The segment triangles are done in the main loop

				if (joinIsOnLeftSide) {
					addVertex(currentPointL, u, 0);
					addVertex(nextPointL, u, 0);
					addVertex(currentPoint, u, 0.5);
				} else {
					addVertex(currentPointR, u, 1);
					addVertex(nextPointR, u, 0);
					addVertex(currentPoint, u, 0.5);
				}
			}
		}

		function createSegmentTrianglesWithMiddleSection(joinIsOnLeftSide, innerSideModified) {
			if (innerSideModified) {
				if (joinIsOnLeftSide) {
					addVertex(lastPointR, u0, 1);
					addVertex(lastPointL, u0, 0);
					addVertex(currentPointL, u1, 0);

					addVertex(lastPointR, u0, 1);
					addVertex(currentPointL, u1, 0);
					addVertex(innerPoint, u1, 1);

					addVertex(currentPointL, u0, 0);
					addVertex(currentPoint, u1, 0.5);
					addVertex(innerPoint, u1, 1);

					addVertex(currentPoint, u1, 0.5);
					addVertex(nextPointL, u0, 0);
					addVertex(innerPoint, u1, 1);
				} else {
					addVertex(lastPointR, u0, 1);
					addVertex(lastPointL, u0, 0);
					addVertex(currentPointR, u1, 1);

					addVertex(lastPointL, u0, 0);
					addVertex(innerPoint, u1, 0);
					addVertex(currentPointR, u1, 1);

					addVertex(currentPointR, u0, 1);
					addVertex(innerPoint, u1, 0);
					addVertex(currentPoint, u1, 0.5);

					addVertex(currentPoint, u1, 0.5);
					addVertex(innerPoint, u1, 0);
					addVertex(nextPointR, u0, 1);
				}
			}
		}

		function addCapGeometry(center, p1, p2, joinIsOnLeftSide, start, u) {
			// param center: End point of the path
			// param p1, p2: Left and right cap points

			switch (style.strokeLineCap) {
				case 'round':
					if (start) {
						makeCircularSector(center, p2, p1, u, 0.5);
					} else {
						makeCircularSector(center, p1, p2, u, 0.5);
					}

					break;

				case 'square':
					if (start) {
						tempV2_1.subVectors(p1, center);
						tempV2_2.set(tempV2_1.y, -tempV2_1.x);

						tempV2_3.addVectors(tempV2_1, tempV2_2).add(center);
						tempV2_4.subVectors(tempV2_2, tempV2_1).add(center);

						// Modify already existing vertices
						if (joinIsOnLeftSide) {
							tempV2_3.toArray(vertices, 1 * 3);
							tempV2_4.toArray(vertices, 0 * 3);
							tempV2_4.toArray(vertices, 3 * 3);
						} else {
							tempV2_3.toArray(vertices, 1 * 3);
							tempV2_3.toArray(vertices, 3 * 3);
							tempV2_4.toArray(vertices, 0 * 3);
						}
					} else {
						tempV2_1.subVectors(p2, center);
						tempV2_2.set(tempV2_1.y, -tempV2_1.x);

						tempV2_3.addVectors(tempV2_1, tempV2_2).add(center);
						tempV2_4.subVectors(tempV2_2, tempV2_1).add(center);

						const vl = vertices.length;

						// Modify already existing vertices
						if (joinIsOnLeftSide) {
							tempV2_3.toArray(vertices, vl - 1 * 3);
							tempV2_4.toArray(vertices, vl - 2 * 3);
							tempV2_4.toArray(vertices, vl - 4 * 3);
						} else {
							tempV2_3.toArray(vertices, vl - 2 * 3);
							tempV2_4.toArray(vertices, vl - 1 * 3);
							tempV2_4.toArray(vertices, vl - 4 * 3);
						}
					}

					break;
			}
		}

		function removeDuplicatedPoints(points) {
			// Creates a new array if necessary with duplicated points removed.
			// This does not remove duplicated initial and ending points of a closed path.

			let dupPoints = false;
			for (let i = 1, n = points.length - 1; i < n; i++) {
				if (points[i].distanceTo(points[i + 1]) < minDistance) {
					dupPoints = true;
					break;
				}
			}

			if (!dupPoints) return points;

			const newPoints = [];
			newPoints.push(points[0]);

			for (let i = 1, n = points.length - 1; i < n; i++) {
				if (points[i].distanceTo(points[i + 1]) >= minDistance) {
					newPoints.push(points[i]);
				}
			}

			newPoints.push(points[points.length - 1]);

			return newPoints;
		}
	}
}

declare class MeshLineGeometry extends THREE$1.BufferGeometry {
    #private;
    arrow: boolean;
    readonly isMeshLineGeometry = true;
    readonly type = "MeshLineGeometry";
    points: THREE$1.Vector3[];
    totalLength: number;
    constructor(arrow?: boolean);
    setPoints(points: Array<THREE$1.Vector3>, updateBounds?: boolean): void;
    setVertexData(array: WritableArrayLike<number>, offset: number, x: number, y: number, z: number): void;
    setTextureCoords(array: WritableArrayLike<number>, offset: number): void;
    setIndices(array: WritableArrayLike<number>, offset: number, startIndex: number): void;
    computeBoundingSphere(): void;
}
interface WritableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}

declare const setCameraDimensions: (camera: THREE$1.OrthographicCamera) => void;
declare const setCanvasViewport: (viewport: THREE$1.Vector4) => void;
declare class MeshLineMaterial extends THREE$1.ShaderMaterial {
    constructor(parameters: THREE$1.ShaderMaterialParameters & {
        color: THREE$1.ColorRepresentation;
        opacity: number;
        width: number;
        dashLength: number;
        dashOffset: number;
    });
    get color(): any;
    set color(value: any);
    get width(): number;
    set width(value: number);
    get totalLength(): any;
    set totalLength(value: any);
    get dashLength(): any;
    set dashLength(value: any);
    get dashOffset(): any;
    set dashOffset(value: any);
}

declare class MeshLine extends THREE$1.Mesh<MeshLineGeometry, MeshLineMaterial> {
    constructor(geometry: MeshLineGeometry, material: MeshLineMaterial);
    get points(): THREE$1.Vector3[];
    get dashOffset(): number;
    set dashOffset(dashOffset: number);
}

type Transform = {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
};
type Style = {
    fillColor?: THREE.Color;
    fillOpacity?: number;
    strokeColor?: THREE.Color;
    strokeOpacity?: number;
    strokeWidth?: number;
    strokeDashLength?: number;
    strokeDashOffset?: number;
    dashed?: boolean;
};
type LineAttributes = {
    start: THREE.Vector3;
    end: THREE.Vector3;
};
type ArcAttributes = {
    radius: number;
    angle: number;
    closed: boolean;
};
type RectangleAttributes = {
    width: number;
    height: number;
};
type PolygonAttributes = {
    points: Array<THREE.Vector3>;
};

type Fill = THREE$1.Mesh<THREE$1.ShapeGeometry, THREE$1.MeshBasicMaterial>;
type Stroke = MeshLine;
/**
 * An abstract class representing a generalized shape.
 */
declare abstract class Shape extends THREE$1.Group {
    fill?: Fill;
    stroke?: Stroke;
    curveEndIndices: Array<Array<number>>;
    arrow: boolean;
    constructor(points: Array<THREE$1.Vector3>, config?: Style & {
        arrow?: boolean;
        stroke?: boolean;
        fill?: boolean;
    });
    static defaultStyle(): {
        fillColor: THREE$1.Color;
        fillOpacity: number;
        strokeColor: THREE$1.Color;
        strokeOpacity: number;
        strokeWidth: number;
        strokeDashLength: number;
        strokeDashOffset: number;
        dashed: boolean;
    };
    static defaultConfig(): {};
    reshape(...args: any[]): void;
    copyStroke(shape: Shape): void;
    copyFill(shape: Shape): void;
    copyStrokeFill(shape: Shape): void;
    get points(): Array<THREE$1.Vector3>;
    worldPoint(index: number): THREE$1.Vector3;
    transformedPoint(index: number, targetSpace: THREE$1.Object3D): THREE$1.Vector3;
    segment(index: number): THREE$1.Line3;
    curve(curveIndex: number, worldTransform?: boolean): THREE$1.Vector3[];
    get numCurves(): number;
    getCurveEndIndices(): any[];
    clear(): this;
    clone(recursive?: boolean): this;
    getClassConfig(): {};
    abstract getAttributes(): object;
    getCloneAttributes(): Array<unknown>;
    getStyle(): Style;
    setStyle(style: Style): void;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
    dispose(): this;
    getDimensions(): THREE$1.Vector2;
    closestPointToPoint(point: THREE$1.Vector3, target?: THREE$1.Vector3): THREE$1.Vector3;
}
/**
 * A segment between two points.
 *
 * @example line.ts
 */
declare class Line extends Shape {
    start: THREE$1.Vector3;
    end: THREE$1.Vector3;
    constructor(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style & {
        arrow?: boolean;
    });
    static defaultConfig(): {
        arrow: boolean;
    };
    static centeredLine(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style): Line;
    reshape(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style & {
        arrow?: boolean;
    }): void;
    getClassConfig(): {};
    getAttributes(): LineAttributes;
    getVector(global?: boolean): THREE$1.Vector3;
    static fromAttributes(attributes: LineAttributes): Line;
}
/**
 * An arrow derived from a line.
 *
 * @example arrow.ts
 */
declare class Arrow extends Line {
    start: THREE$1.Vector3;
    end: THREE$1.Vector3;
    constructor(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style);
    reshape(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style): void;
}
/**
 * A series of connected line segments.
 *
 * @example polyline.ts
 */
declare class Polyline extends Shape {
    constructor(points: Array<THREE$1.Vector3>, config?: Style);
    reshape(points: Array<THREE$1.Vector3>, config?: Style): void;
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polyline;
}
/**
 * A part of a circle's circumference.
 *
 * @example arc.ts
 */
declare class Arc extends Shape {
    radius: number;
    angle: number;
    closed: boolean;
    constructor(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    });
    static defaultConfig(): {
        closed: boolean;
        fill: boolean;
    };
    reshape(radius?: number, angle?: number, config?: Style & {
        closed?: boolean;
    }): void;
    getCloneAttributes(): (number | boolean)[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Arc;
    get attributeData(): ({
        attribute: string;
        type: string;
        default: number;
    } | {
        attribute: string;
        type: string;
        default: boolean;
    })[];
    getDimensions(): THREE$1.Vector2;
}
/**
 * A shape consisting of all points at a fixed distance from a given center.
 *
 * @example circle.ts
 */
declare class Circle extends Arc {
    constructor(radius?: number, config?: Style & {
        fill?: boolean;
    });
    reshape(radius: number, config?: {}): void;
    static defaultConfig(): {
        fill: boolean;
        closed: boolean;
    };
    getCloneAttributes(): number[];
    getAttributes(): ArcAttributes;
    static fromAttributes(attributes: ArcAttributes): Circle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}
/**
 * A small circle representing a precise location in space.
 *
 * @example point.ts
 */
declare class Point extends Circle {
    constructor(position?: THREE$1.Vector2 | THREE$1.Vector3, config?: Style & {
        radius?: number;
    });
    static defaultConfig(): {
        radius: number;
        fill: boolean;
        closed: boolean;
    };
    getAttributes(): ArcAttributes;
    static fromAttributes(): Point;
}
/**
 * A shape made up of line segments connected
 * to form a (usually) closed shape.
 *
 * @example polygon.ts
 */
declare class Polygon extends Shape {
    constructor(points: Array<THREE$1.Vector3>, config?: Style);
    getClassConfig(): {};
    getAttributes(): PolygonAttributes;
    static fromAttributes(attributes: PolygonAttributes): Polygon;
    get attributeData(): any[];
}
/**
 * A shape with four sides and four right angles.
 *
 * @example rectangle.ts
 */
declare class Rectangle extends Shape {
    width: number;
    height: number;
    constructor(width?: number, height?: number, config?: Style);
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Rectangle;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
    getCurveEndIndices(): Array<Array<number>>;
}
/**
 * A shape with four sides of equal length and four right angles.
 *
 * @example square.ts
 */
declare class Square extends Rectangle {
    sideLength: number;
    constructor(sideLength?: number, config?: Style);
    reshape(sideLength: number, config?: {}): void;
    getCloneAttributes(): number[];
    getAttributes(): RectangleAttributes;
    static fromAttributes(attributes: RectangleAttributes): Square;
    get attributeData(): {
        attribute: string;
        type: string;
        default: number;
    }[];
}

type geometry_Arc = Arc;
declare const geometry_Arc: typeof Arc;
type geometry_Arrow = Arrow;
declare const geometry_Arrow: typeof Arrow;
type geometry_Circle = Circle;
declare const geometry_Circle: typeof Circle;
type geometry_Line = Line;
declare const geometry_Line: typeof Line;
type geometry_MeshLine = MeshLine;
declare const geometry_MeshLine: typeof MeshLine;
type geometry_Point = Point;
declare const geometry_Point: typeof Point;
type geometry_Polygon = Polygon;
declare const geometry_Polygon: typeof Polygon;
type geometry_Polyline = Polyline;
declare const geometry_Polyline: typeof Polyline;
type geometry_Rectangle = Rectangle;
declare const geometry_Rectangle: typeof Rectangle;
type geometry_Shape = Shape;
declare const geometry_Shape: typeof Shape;
type geometry_Square = Square;
declare const geometry_Square: typeof Square;
declare namespace geometry {
  export { geometry_Arc as Arc, geometry_Arrow as Arrow, geometry_Circle as Circle, geometry_Line as Line, geometry_MeshLine as MeshLine, geometry_Point as Point, geometry_Polygon as Polygon, geometry_Polyline as Polyline, geometry_Rectangle as Rectangle, geometry_Shape as Shape, geometry_Square as Square };
}

declare const BUFFER = 0.5;
declare const ORIGIN: Readonly<THREE$1.Vector3>;
declare const RIGHT: Readonly<THREE$1.Vector3>;
declare const LEFT: Readonly<THREE$1.Vector3>;
declare const UP: Readonly<THREE$1.Vector3>;
declare const DOWN: Readonly<THREE$1.Vector3>;
declare const OUT: Readonly<THREE$1.Vector3>;
declare const IN: Readonly<THREE$1.Vector3>;
declare const clamp: (num: any, min: any, max: any) => number;
declare const getFrameAttributes: (aspectRatio: number, height: number) => {
    aspectRatio: number;
    height: number;
    width: number;
    coordinateHeight: number;
    coordinateWidth: number;
};
type WidthSetupConfig = {
    aspectRatio: number;
    pixelWidth: number;
    coordinateWidth: number;
};
type HeightSetupConfig = {
    aspectRatio: number;
    pixelHeight: number;
    coordinateHeight: number;
};
declare const setupCanvas: (canvas: HTMLCanvasElement, config?: (WidthSetupConfig | HeightSetupConfig) & {
    viewport?: THREE$1.Vector4;
}) => [THREE$1.Scene, THREE$1.Camera, THREE$1.WebGLRenderer];
declare const convertWorldDirectionToObjectSpace: (worldDirection: THREE$1.Vector3, object: THREE$1.Object3D) => THREE$1.Vector3;
declare const vstack: (group: THREE$1.Group, buffer?: number) => THREE$1.Group;
declare const vspace: (group: THREE$1.Group, distanceBetween?: number) => THREE$1.Group;
declare const transformBetweenSpaces: (from: THREE$1.Object3D, to: THREE$1.Object3D, point: THREE$1.Vector3) => THREE$1.Vector3;
declare const furthestInDirection: (object: any, direction: any, exclude?: THREE$1.Object3D | Array<THREE$1.Object3D>) => any;
declare const moveNextTo: (target: THREE$1.Object3D, object: THREE$1.Object3D, direction: THREE$1.Vector3, buffer?: number) => THREE$1.Object3D<THREE$1.Event>;
declare const moveToRightOf: (target: any, object: any, distance?: number) => THREE$1.Object3D<THREE$1.Event>;
declare const moveToLeftOf: (target: any, object: any, distance?: number) => THREE$1.Object3D<THREE$1.Event>;
declare const moveAbove: (target: any, object: any, distance?: number) => THREE$1.Object3D<THREE$1.Event>;
declare const moveBelow: (target: any, object: any, distance?: number) => THREE$1.Object3D<THREE$1.Event>;
declare const rotate90: (v: THREE$1.Vector3) => THREE$1.Vector3;
declare const rotate180: (v: THREE$1.Vector3) => THREE$1.Vector3;
declare const rotate270: (v: THREE$1.Vector3) => THREE$1.Vector3;
declare const getBoundingBoxCenter: (obj: THREE$1.Object3D, target: THREE$1.Vector3) => THREE$1.Vector3;
declare const getBoundingBoxHelper: (obj: THREE$1.Object3D, color: string) => THREE$1.Box3Helper;
declare const pointAlongCurve: (shape: Shape, t: number) => THREE$1.Vector3;
declare const intersectionsBetween: (shape1: Shape, shape2: Shape) => Array<THREE$1.Vector3>;
declare const positiveAngleTo: (a: THREE$1.Vector3, b: THREE$1.Vector3) => number;
declare class ShapeFromCurves {
    adjacentThreshold: number;
    segmentClosestToPoint: THREE$1.Vector3;
    pointToSegment: THREE$1.Vector3;
    points: Array<THREE$1.Vector3>;
    style: Style;
    withStyle(style: Style): this;
    startAt(start: THREE$1.Vector3): this;
    extendAlong(shape: Shape, direction: THREE$1.Vector3, until?: THREE$1.Vector3 | undefined): this;
    extendCurve(shape: Shape, initialPointIndex: number, forward: boolean, until?: THREE$1.Vector3 | undefined): void;
    finish(): Polygon;
}

declare const utils_BUFFER: typeof BUFFER;
declare const utils_DOWN: typeof DOWN;
type utils_HeightSetupConfig = HeightSetupConfig;
declare const utils_IN: typeof IN;
declare const utils_LEFT: typeof LEFT;
declare const utils_ORIGIN: typeof ORIGIN;
declare const utils_OUT: typeof OUT;
declare const utils_RIGHT: typeof RIGHT;
type utils_ShapeFromCurves = ShapeFromCurves;
declare const utils_ShapeFromCurves: typeof ShapeFromCurves;
declare const utils_UP: typeof UP;
type utils_WidthSetupConfig = WidthSetupConfig;
declare const utils_clamp: typeof clamp;
declare const utils_convertWorldDirectionToObjectSpace: typeof convertWorldDirectionToObjectSpace;
declare const utils_furthestInDirection: typeof furthestInDirection;
declare const utils_getBoundingBoxCenter: typeof getBoundingBoxCenter;
declare const utils_getBoundingBoxHelper: typeof getBoundingBoxHelper;
declare const utils_getFrameAttributes: typeof getFrameAttributes;
declare const utils_intersectionsBetween: typeof intersectionsBetween;
declare const utils_moveAbove: typeof moveAbove;
declare const utils_moveBelow: typeof moveBelow;
declare const utils_moveNextTo: typeof moveNextTo;
declare const utils_moveToLeftOf: typeof moveToLeftOf;
declare const utils_moveToRightOf: typeof moveToRightOf;
declare const utils_pointAlongCurve: typeof pointAlongCurve;
declare const utils_positiveAngleTo: typeof positiveAngleTo;
declare const utils_rotate180: typeof rotate180;
declare const utils_rotate270: typeof rotate270;
declare const utils_rotate90: typeof rotate90;
declare const utils_setupCanvas: typeof setupCanvas;
declare const utils_transformBetweenSpaces: typeof transformBetweenSpaces;
declare const utils_vspace: typeof vspace;
declare const utils_vstack: typeof vstack;
declare namespace utils {
  export { utils_BUFFER as BUFFER, utils_DOWN as DOWN, type utils_HeightSetupConfig as HeightSetupConfig, utils_IN as IN, utils_LEFT as LEFT, utils_ORIGIN as ORIGIN, utils_OUT as OUT, utils_RIGHT as RIGHT, utils_ShapeFromCurves as ShapeFromCurves, utils_UP as UP, type utils_WidthSetupConfig as WidthSetupConfig, utils_clamp as clamp, utils_convertWorldDirectionToObjectSpace as convertWorldDirectionToObjectSpace, utils_furthestInDirection as furthestInDirection, utils_getBoundingBoxCenter as getBoundingBoxCenter, utils_getBoundingBoxHelper as getBoundingBoxHelper, utils_getFrameAttributes as getFrameAttributes, utils_intersectionsBetween as intersectionsBetween, utils_moveAbove as moveAbove, utils_moveBelow as moveBelow, utils_moveNextTo as moveNextTo, utils_moveToLeftOf as moveToLeftOf, utils_moveToRightOf as moveToRightOf, utils_pointAlongCurve as pointAlongCurve, utils_positiveAngleTo as positiveAngleTo, utils_rotate180 as rotate180, utils_rotate270 as rotate270, utils_rotate90 as rotate90, utils_setupCanvas as setupCanvas, utils_transformBetweenSpaces as transformBetweenSpaces, utils_vspace as vspace, utils_vstack as vstack };
}

declare class Animation {
    func: (elapsedTime: number, deltaTime: number) => void;
    scene: any;
    startTime: number;
    endTime: number;
    prevUpdateTime: number;
    beforeFunc: () => void;
    afterFunc: () => void;
    parent: any;
    object: any;
    before: any;
    after: any;
    family: any;
    reveal: any;
    hide: any;
    scale: number;
    runTime: number;
    finished: boolean;
    elapsedSinceStart: number;
    constructor(func: (elapsedTime: number, deltaTime: number) => void, { object, parent, before, after, family, reveal, hide, }?: {
        object?: any;
        parent?: any;
        before?: any;
        after?: any;
        family?: any;
        reveal?: any;
        hide?: any;
    });
    setUp(): void;
    tearDown(): void;
    update(worldTime: any): void;
    addBefore(before: any): void;
    addAfter(after: any): void;
}
declare class Shift extends Animation {
    constructor(object: any, offset: any, config?: any);
}
declare class MoveTo extends Animation {
    target: THREE$1.Object3D;
    obj: THREE$1.Object3D;
    start: any;
    displacement: any;
    constructor(target: THREE$1.Object3D, obj: THREE$1.Object3D, config?: any);
    setUp(): void;
}
declare class Rotate extends Animation {
    constructor(object: any, angle: any, config?: any);
}
declare class SetScale extends Animation {
    initialScale: number;
    constructor(object: any, factor: any, config?: any);
    setUp(): void;
}
declare class Draw extends Animation {
    constructor(object: any, config?: any);
}
declare class Erase extends Animation {
    object: any;
    config?: any;
    constructor(object: any, config?: any);
    tearDown(): void;
}
declare class FadeIn extends Animation {
    initialOpacity: Map<any, any>;
    constructor(object: any, config?: any);
    setUp(): void;
}
declare class FadeOut extends Animation {
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: any, config?: any);
    setUp(): void;
    tearDown(): void;
}
declare class SetOpacity extends Animation {
    targetOpacity: any;
    config?: any;
    initialOpacity: Map<any, any>;
    constructor(objectOrFunc: any, targetOpacity: any, config?: any);
    setUp(): void;
}
declare class Wait extends Animation {
    constructor(config?: any);
}

type animation_Animation = Animation;
declare const animation_Animation: typeof Animation;
type animation_Draw = Draw;
declare const animation_Draw: typeof Draw;
type animation_Erase = Erase;
declare const animation_Erase: typeof Erase;
type animation_FadeIn = FadeIn;
declare const animation_FadeIn: typeof FadeIn;
type animation_FadeOut = FadeOut;
declare const animation_FadeOut: typeof FadeOut;
type animation_MoveTo = MoveTo;
declare const animation_MoveTo: typeof MoveTo;
type animation_Rotate = Rotate;
declare const animation_Rotate: typeof Rotate;
type animation_SetOpacity = SetOpacity;
declare const animation_SetOpacity: typeof SetOpacity;
type animation_SetScale = SetScale;
declare const animation_SetScale: typeof SetScale;
type animation_Shift = Shift;
declare const animation_Shift: typeof Shift;
type animation_Wait = Wait;
declare const animation_Wait: typeof Wait;
declare namespace animation {
  export { animation_Animation as Animation, animation_Draw as Draw, animation_Erase as Erase, animation_FadeIn as FadeIn, animation_FadeOut as FadeOut, animation_MoveTo as MoveTo, animation_Rotate as Rotate, animation_SetOpacity as SetOpacity, animation_SetScale as SetScale, animation_Shift as Shift, animation_Wait as Wait };
}

declare const PIXELS_TO_COORDS: number;
declare const COORDS_TO_PIXELS: number;
declare const ERROR_THRESHOLD = 0.001;
declare const DEFAULT_BACKGROUND_HEX = 16775920;

declare const constants_COORDS_TO_PIXELS: typeof COORDS_TO_PIXELS;
declare const constants_DEFAULT_BACKGROUND_HEX: typeof DEFAULT_BACKGROUND_HEX;
declare const constants_ERROR_THRESHOLD: typeof ERROR_THRESHOLD;
declare const constants_PIXELS_TO_COORDS: typeof PIXELS_TO_COORDS;
declare namespace constants {
  export { constants_COORDS_TO_PIXELS as COORDS_TO_PIXELS, constants_DEFAULT_BACKGROUND_HEX as DEFAULT_BACKGROUND_HEX, constants_ERROR_THRESHOLD as ERROR_THRESHOLD, constants_PIXELS_TO_COORDS as PIXELS_TO_COORDS };
}

interface IndicatorConfig {
    tickLength?: number;
}
declare class Indicator extends THREE$1.Group {
    start: THREE$1.Vector3;
    end: THREE$1.Vector3;
    startTick: Line;
    endTick: Line;
    stem: any;
    constructor(start: THREE$1.Vector3, end: THREE$1.Vector3, config?: IndicatorConfig & Style);
    grow(config?: any): Animation;
}
declare class CongruentLine extends THREE$1.Group {
    constructor(ticks: number, start: THREE$1.Vector3, end: THREE$1.Vector3, config?: Style & {
        tickLength?: number;
        spacing?: number;
    });
}
declare class CongruentAngle extends THREE$1.Group {
    config: Style & {
        minRadius?: number;
        spacing?: number;
    };
    constructor(arcs: number, point1: THREE$1.Vector3, point2: THREE$1.Vector3, point3: THREE$1.Vector3, config?: Style & {
        minRadius?: number;
        spacing?: number;
    });
}
declare class Angle extends Arc {
    constructor(point1: THREE$1.Vector3, point2: THREE$1.Vector3, point3: THREE$1.Vector3, config?: Style & {
        radius?: number;
        reflex?: boolean;
    });
}
declare class RightAngle extends Polyline {
    constructor(point1: THREE$1.Vector3, point2: THREE$1.Vector3, point3: THREE$1.Vector3, config?: Style & {
        sideLength?: number;
    });
}

type diagram_Angle = Angle;
declare const diagram_Angle: typeof Angle;
type diagram_CongruentAngle = CongruentAngle;
declare const diagram_CongruentAngle: typeof CongruentAngle;
type diagram_CongruentLine = CongruentLine;
declare const diagram_CongruentLine: typeof CongruentLine;
type diagram_Indicator = Indicator;
declare const diagram_Indicator: typeof Indicator;
type diagram_RightAngle = RightAngle;
declare const diagram_RightAngle: typeof RightAngle;
declare namespace diagram {
  export { diagram_Angle as Angle, diagram_CongruentAngle as CongruentAngle, diagram_CongruentLine as CongruentLine, diagram_Indicator as Indicator, diagram_RightAngle as RightAngle };
}

declare const _default: {
    readonly horizontal: {
        readonly nhd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 360;
            readonly frameRate: 30;
        };
        readonly hd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 720;
            readonly frameRate: 30;
        };
        readonly fhd: {
            readonly aspectRatio: number;
            readonly coordinateHeight: 8;
            readonly pixelHeight: 1080;
            readonly frameRate: 60;
        };
    };
    readonly vertical: {
        readonly nhd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 360;
            readonly frameRate: 30;
        };
        readonly hd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 720;
            readonly frameRate: 30;
        };
        readonly fhd: {
            readonly aspectRatio: number;
            readonly coordinateWidth: 8;
            readonly pixelWidth: 1080;
            readonly frameRate: 60;
        };
    };
};

/**
 * A curve described by an equation.
 */
declare class Curve extends Polyline {
    equation: () => void;
    constructor(equation: () => void, config?: Style);
    static defaultConfig(): {
        fill: boolean;
    };
    getClassConfig(): {};
}

type graphing_Curve = Curve;
declare const graphing_Curve: typeof Curve;
declare namespace graphing {
  export { graphing_Curve as Curve };
}

type Class<T> = new (scene: THREE$1.Scene, camera: THREE$1.Camera, renderer: THREE$1.WebGLRenderer) => T;
type AnimationRepresentation = Animation | Array<Animation> | {
    animations: Array<Animation>;
    before?: () => void;
    after?: () => void;
    parent?: THREE$1.Object3D;
    runTime?: number;
    scale?: number;
};
interface StudioScene<T extends THREE$1.Camera = THREE$1.OrthographicCamera> {
    scene: THREE$1.Scene;
    camera: T;
    renderer: THREE$1.WebGLRenderer;
    animations?: Array<AnimationRepresentation>;
    update?: (deltaTime: number, time: number) => void;
}
declare class SceneController {
    UserScene: Class<StudioScene>;
    animationIndex: number;
    deltaTime: number;
    elapsedTime: number;
    firstFrame: boolean;
    paused: boolean;
    fps: number;
    timePrecision: number;
    startTime: number;
    endTime: number;
    loopAnimations: Array<Animation>;
    finishedAnimationCount: number;
    userScene: StudioScene;
    three: typeof THREE$1;
    viewport: THREE$1.Vector4;
    aspectRatio: number;
    constructor(UserScene: Class<StudioScene>, canvasRef: HTMLCanvasElement, config: (WidthSetupConfig | HeightSetupConfig) & {
        viewport?: THREE$1.Vector4;
    });
    get scene(): THREE$1.Scene;
    get camera(): THREE$1.OrthographicCamera;
    get renderer(): THREE$1.WebGLRenderer;
    render(): void;
    tick(deltaTime: number, render?: boolean): void;
    play(): void;
    pause(): void;
    dispose(): void;
}

type TextStyle = {
    fillColor?: THREE$1.Color;
    fillOpacity?: number;
};
type TextConfig = {
    groupColoring?: Array<[number, string?]>;
    batchMaterials?: boolean;
};
declare class Text extends THREE$1.Group {
    text: string;
    constructor(text: string, config?: TextStyle & TextConfig);
    dispose(): void;
    clone(recursive: boolean): this;
    copy(source: this, recursive: boolean): this;
    getDimensions(): THREE$1.Vector2;
    getCloneAttributes(): string[];
    getAttributes(): {
        text: string;
    };
    static fromAttributes(attributes: any): Text;
    get attributeData(): {
        attribute: string;
        type: string;
        default: string;
    }[];
    toJson(): {
        className: string;
        attributes: {
            text: string;
        };
        transform: Transform;
        style: {
            fillColor: number[];
        };
    };
    static fromJson(json: any): Text;
    getTransform(): Transform;
    setTransform(transform: Transform): void;
}

type text_Text = Text;
declare const text_Text: typeof Text;
declare namespace text {
  export { text_Text as Text };
}

declare module "three" {
    interface Object3D {
        vstack(buffer?: number): THREE$1.Object3D;
        vspace(distanceBetween?: number): THREE$1.Object3D;
        setScale(factor: number): THREE$1.Object3D;
        moveNextTo(target: THREE$1.Object3D, direction: THREE$1.Vector3, distance?: any): void;
        moveToRightOf(target: THREE$1.Object3D, distance?: any): void;
        moveToLeftOf(target: THREE$1.Object3D, distance?: any): void;
        moveAbove(target: THREE$1.Object3D, distance?: any): void;
        moveBelow(target: THREE$1.Object3D, distance?: any): void;
        setOpacity(opacity: number): THREE$1.Object3D;
        setInvisible(): THREE$1.Object3D;
        setVisible(config?: any): THREE$1.Object3D;
        setUpright(): THREE$1.Object3D;
        recenter(center: THREE$1.Vector3): THREE$1.Object3D;
        reorient(zRotation: number): void;
        pointAlongCurve(t: number): THREE$1.Vector3;
        addComponent<T extends THREE$1.Object3D, K extends string>(name: K, child: T): this & {
            [P in K]: T;
        };
        updateComponent(name: string, child: THREE$1.Object3D): void;
        removeComponent(name: string): THREE$1.Object3D;
        hideComponents(): THREE$1.Object3D;
        revealComponents(): THREE$1.Object3D;
        hide(): THREE$1.Object3D;
        reveal(): THREE$1.Object3D;
        isHidden(): boolean;
        isRevealed(): boolean;
        isComponent(): boolean;
        revealDescendants(config?: {
            includeSelf: boolean;
        }): this;
        hideDescendants(config?: {
            includeSelf: boolean;
        }): THREE$1.Object3D;
        revealAncestors(config?: {
            includeSelf: boolean;
        }): THREE$1.Object3D;
        hideAncestors(config?: {
            includeSelf: boolean;
        }): THREE$1.Object3D;
        revealLineage(): THREE$1.Object3D;
        hideLineage(): THREE$1.Object3D;
        traverseComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
        traverseAncestorComponents(f: () => void, config?: {
            includeSelf: boolean;
        }): void;
    }
    interface Vector3 {
        rotate90(): THREE$1.Vector3;
        rotate180(): THREE$1.Vector3;
        rotate270(): THREE$1.Vector3;
        rotateZ(angle: number): THREE$1.Vector3;
        transformBetweenSpaces(from: THREE$1.Object3D, to: THREE$1.Object3D): THREE$1.Vector3;
        positiveAngleTo(vector: THREE$1.Vector3): number;
    }
}
type ComponentParent = THREE$1.Object3D & {
    components?: Map<string, THREE$1.Object3D>;
};
declare function component(_: ClassAccessorDecoratorTarget<ComponentParent, THREE$1.Object3D>, context: ClassAccessorDecoratorContext<ComponentParent, THREE$1.Object3D>): ClassAccessorDecoratorResult<ComponentParent, any>;

export { animation as Animation, type AnimationRepresentation, constants as Constants, diagram as Diagram, _default as Frame, geometry as Geometry, graphing as Graphing, SVGLoader, SceneController, type StudioScene, text as Text, utils as Utils, component, setCameraDimensions, setCanvasViewport, setupCanvas };
