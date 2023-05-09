import * as THREE from 'three';

const PIXELS_TO_COORDS = 8 / 450;
const ERROR_THRESHOLD = 0.001;

class MeshLine extends THREE.BufferGeometry {
	constructor() {
		super();
		this.isMeshLine = true;
		this.type = 'MeshLine';

		this.positions = [];

		this.previous = [];
		this.next = [];
		this.side = [];
		this.width = [];
		this.indices_array = [];
		this.uvs = [];
		this.counters = [];
		this._points = [];
		this._geom = null;

		this.widthCallback = null;

		// Used to raycast
		this.matrixWorld = new THREE.Matrix4();

		Object.defineProperties(this, {
			// this is now a bufferGeometry
			// add getter to support previous api
			geometry: {
				enumerable: true,
				get: function () {
					return this;
				}
			},
			geom: {
				enumerable: true,
				get: function () {
					return this._geom;
				},
				set: function (value) {
					this.setGeometry(value, this.widthCallback);
				}
			},
			// for declaritive architectures
			// to return the same value that sets the points
			// eg. this.points = points
			// console.log(this.points) -> points
			points: {
				enumerable: true,
				get: function () {
					return this._points;
				},
				set: function (value) {
					this.setPoints(value, this.widthCallback);
				}
			}
		});
	}
}

MeshLine.prototype.setMatrixWorld = function (matrixWorld) {
	this.matrixWorld = matrixWorld;
};

// setting via a geometry is rather superfluous
// as you're creating a unecessary geometry just to throw away
// but exists to support previous api
MeshLine.prototype.setGeometry = function (g, c) {
	// as the input geometry are mutated we store them
	// for later retreival when necessary (declaritive architectures)
	this._geometry = g;
	this.setPoints(g.getAttribute('position').array, c);
};

MeshLine.prototype.setPoints = function (points, wcb) {
	if (!(points instanceof Float32Array) && !(points instanceof Array)) {
		console.error('ERROR: The BufferArray of points is not instancied correctly.');
		return;
	}
	// as the points are mutated we store them
	// for later retreival when necessary (declaritive architectures)
	this._points = points;
	this.widthCallback = wcb;
	this.positions = [];
	this.counters = [];
	if (points.length && points[0] instanceof THREE.Vector3) {
		// could transform Vector3 array into the array used below
		// but this approach will only loop through the array once
		// and is more performant
		for (var j = 0; j < points.length; j++) {
			var p = points[j];
			var c = j / points.length;
			this.positions.push(p.x, p.y, p.z);
			this.positions.push(p.x, p.y, p.z);
			this.counters.push(c);
			this.counters.push(c);
		}
	} else {
		for (var j = 0; j < points.length; j += 3) {
			var c = j / points.length;
			this.positions.push(points[j], points[j + 1], points[j + 2]);
			this.positions.push(points[j], points[j + 1], points[j + 2]);
			this.counters.push(c);
			this.counters.push(c);
		}
	}
	this.process();
};

function MeshLineRaycast(raycaster, intersects) {
	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();
	var interRay = new THREE.Vector3();
	var geometry = this.geometry;
	// Checking boundingSphere distance to ray

	if (!geometry.boundingSphere) geometry.computeBoundingSphere();
	sphere.copy(geometry.boundingSphere);
	sphere.applyMatrix4(this.matrixWorld);

	if (raycaster.ray.intersectSphere(sphere, interRay) === false) {
		return;
	}

	inverseMatrix.copy(this.matrixWorld).invert();
	ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

	var vStart = new THREE.Vector3();
	var vEnd = new THREE.Vector3();
	var interSegment = new THREE.Vector3();
	var step = this instanceof THREE.LineSegments ? 2 : 1;
	var index = geometry.index;
	var attributes = geometry.attributes;

	if (index !== null) {
		var indices = index.array;
		var positions = attributes.position.array;
		var widths = attributes.width.array;

		for (var i = 0, l = indices.length - 1; i < l; i += step) {
			var a = indices[i];
			var b = indices[i + 1];

			vStart.fromArray(positions, a * 3);
			vEnd.fromArray(positions, b * 3);
			var width = widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1;
			var precision = raycaster.params.Line.threshold + (this.material.lineWidth * width) / 2;
			var precisionSq = precision * precision;

			var distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

			if (distSq > precisionSq) continue;

			interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

			var distance = raycaster.ray.origin.distanceTo(interRay);

			if (distance < raycaster.near || distance > raycaster.far) continue;

			intersects.push({
				distance: distance,
				// What do we want? intersection point on the ray or on the segment??
				// point: raycaster.ray.at( distance ),
				point: interSegment.clone().applyMatrix4(this.matrixWorld),
				index: i,
				face: null,
				faceIndex: null,
				object: this
			});
			// make event only fire once
			i = l;
		}
	}
}
MeshLine.prototype.raycast = MeshLineRaycast;
MeshLine.prototype.compareV3 = function (a, b) {
	var aa = a * 6;
	var ab = b * 6;
	return (
		this.positions[aa] === this.positions[ab] &&
		this.positions[aa + 1] === this.positions[ab + 1] &&
		this.positions[aa + 2] === this.positions[ab + 2]
	);
};

MeshLine.prototype.copyV3 = function (a) {
	var aa = a * 6;
	return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];
};

MeshLine.prototype.process = function () {
	var l = this.positions.length / 6;

	this.previous = [];
	this.next = [];
	this.side = [];
	this.width = [];
	this.indices_array = [];
	this.uvs = [];

	var w;

	var v;
	// initial previous points
	if (this.compareV3(0, l - 1)) {
		v = this.copyV3(l - 2);
	} else {
		v = this.copyV3(0);
	}
	this.previous.push(v[0], v[1], v[2]);
	this.previous.push(v[0], v[1], v[2]);

	for (var j = 0; j < l; j++) {
		// sides
		this.side.push(1);
		this.side.push(-1);

		// widths
		if (this.widthCallback) w = this.widthCallback(j / (l - 1));
		else w = 1;
		this.width.push(w);
		this.width.push(w);

		// uvs
		this.uvs.push(j / (l - 1), 0);
		this.uvs.push(j / (l - 1), 1);

		if (j < l - 1) {
			// points previous to poisitions
			v = this.copyV3(j);
			this.previous.push(v[0], v[1], v[2]);
			this.previous.push(v[0], v[1], v[2]);

			// indices
			var n = j * 2;
			this.indices_array.push(n, n + 1, n + 2);
			this.indices_array.push(n + 2, n + 1, n + 3);
		}
		if (j > 0) {
			// points after poisitions
			v = this.copyV3(j);
			this.next.push(v[0], v[1], v[2]);
			this.next.push(v[0], v[1], v[2]);
		}
	}

	// last next point
	if (this.compareV3(l - 1, 0)) {
		v = this.copyV3(1);
	} else {
		v = this.copyV3(l - 1);
	}
	this.next.push(v[0], v[1], v[2]);
	this.next.push(v[0], v[1], v[2]);

	// redefining the attribute seems to prevent range errors
	// if the user sets a differing number of vertices
	if (!this._attributes || this._attributes.position.count !== this.positions.length) {
		this._attributes = {
			position: new THREE.BufferAttribute(new Float32Array(this.positions), 3),
			previous: new THREE.BufferAttribute(new Float32Array(this.previous), 3),
			next: new THREE.BufferAttribute(new Float32Array(this.next), 3),
			side: new THREE.BufferAttribute(new Float32Array(this.side), 1),
			width: new THREE.BufferAttribute(new Float32Array(this.width), 1),
			uv: new THREE.BufferAttribute(new Float32Array(this.uvs), 2),
			index: new THREE.BufferAttribute(new Uint16Array(this.indices_array), 1),
			counters: new THREE.BufferAttribute(new Float32Array(this.counters), 1)
		};
	} else {
		this._attributes.position.copyArray(new Float32Array(this.positions));
		this._attributes.position.needsUpdate = true;
		this._attributes.previous.copyArray(new Float32Array(this.previous));
		this._attributes.previous.needsUpdate = true;
		this._attributes.next.copyArray(new Float32Array(this.next));
		this._attributes.next.needsUpdate = true;
		this._attributes.side.copyArray(new Float32Array(this.side));
		this._attributes.side.needsUpdate = true;
		this._attributes.width.copyArray(new Float32Array(this.width));
		this._attributes.width.needsUpdate = true;
		this._attributes.uv.copyArray(new Float32Array(this.uvs));
		this._attributes.uv.needsUpdate = true;
		this._attributes.index.copyArray(new Uint16Array(this.indices_array));
		this._attributes.index.needsUpdate = true;
	}

	this.setAttribute('position', this._attributes.position);
	this.setAttribute('previous', this._attributes.previous);
	this.setAttribute('next', this._attributes.next);
	this.setAttribute('side', this._attributes.side);
	this.setAttribute('width', this._attributes.width);
	this.setAttribute('uv', this._attributes.uv);
	this.setAttribute('counters', this._attributes.counters);

	this.setIndex(this._attributes.index);

	this.computeBoundingSphere();
	this.computeBoundingBox();
};

function memcpy(src, srcOffset, dst, dstOffset, length) {
	var i;

	src = src.subarray || src.slice ? src : src.buffer;
	dst = dst.subarray || dst.slice ? dst : dst.buffer;

	src = srcOffset
		? src.subarray
			? src.subarray(srcOffset, length && srcOffset + length)
			: src.slice(srcOffset, length && srcOffset + length)
		: src;

	if (dst.set) {
		dst.set(src, dstOffset);
	} else {
		for (i = 0; i < src.length; i++) {
			dst[i + dstOffset] = src[i];
		}
	}

	return dst;
}

/**
 * Fast method to advance the line by one position.  The oldest position is removed.
 * @param position
 */
MeshLine.prototype.advance = function (position) {
	var positions = this._attributes.position.array;
	var previous = this._attributes.previous.array;
	var next = this._attributes.next.array;
	var l = positions.length;

	// PREVIOUS
	memcpy(positions, 0, previous, 0, l);

	// POSITIONS
	memcpy(positions, 6, positions, 0, l - 6);

	positions[l - 6] = position.x;
	positions[l - 5] = position.y;
	positions[l - 4] = position.z;
	positions[l - 3] = position.x;
	positions[l - 2] = position.y;
	positions[l - 1] = position.z;

	// NEXT
	memcpy(positions, 6, next, 0, l - 6);

	next[l - 6] = position.x;
	next[l - 5] = position.y;
	next[l - 4] = position.z;
	next[l - 3] = position.x;
	next[l - 2] = position.y;
	next[l - 1] = position.z;

	this._attributes.position.needsUpdate = true;
	this._attributes.previous.needsUpdate = true;
	this._attributes.next.needsUpdate = true;
};

THREE.ShaderChunk['meshline_vert'] = [
	'',
	THREE.ShaderChunk.logdepthbuf_pars_vertex,
	THREE.ShaderChunk.fog_pars_vertex,
	'',
	'attribute vec3 previous;',
	'attribute vec3 next;',
	'attribute float side;',
	'attribute float width;',
	'attribute float counters;',
	'',
	'uniform vec2 resolution;',
	'uniform float lineWidth;',
	'uniform vec3 color;',
	'uniform float opacity;',
	'uniform float sizeAttenuation;',
	'',
	'varying vec2 vUV;',
	'varying vec4 vColor;',
	'varying float vCounters;',
	'',
	'vec2 fix( vec4 i, float aspect ) {',
	'',
	'    vec2 res = i.xy / i.w;',
	'    res.x *= aspect;',
	'	   vCounters = counters;',
	'    return res;',
	'',
	'}',
	'',
	'void main() {',
	'',
	'    float aspect = resolution.x / resolution.y;',
	'',
	'    vColor = vec4( color, opacity );',
	'    vUV = uv;',
	'',
	'    mat4 m = projectionMatrix * modelViewMatrix;',
	'    vec4 finalPosition = m * vec4( position, 1.0 );',
	'    vec4 prevPos = m * vec4( previous, 1.0 );',
	'    vec4 nextPos = m * vec4( next, 1.0 );',
	'',
	'    vec2 currentP = fix( finalPosition, aspect );',
	'    vec2 prevP = fix( prevPos, aspect );',
	'    vec2 nextP = fix( nextPos, aspect );',
	'',
	'    float w = lineWidth * width;',
	'',
	'    vec2 dir;',
	'    vec4 normal;',
	'    if( nextP == currentP ) {',
	'      dir = normalize( currentP - prevP );',
	'      normal = vec4( -dir.y, dir.x, 0., 1. );',
	'      normal.xy *= .5 * w;',
	'    } else if( prevP == currentP ) {',
	'      dir = normalize( nextP - currentP );',
	'      normal = vec4( -dir.y, dir.x, 0., 1. );',
	'      normal.xy *= .5 * w;',
	'    } else {',
	'        vec2 dir1 = normalize( currentP - prevP );',
	'        vec2 dir2 = normalize( nextP - currentP );',
	'        dir = normalize( dir1 + dir2 );',
	'        normal = vec4( -dir.y, dir.x, 0., 1. );',
	'',
	'        vec2 perp = vec2( -dir1.y, dir1.x );',
	'        vec2 miter = vec2( -dir.y, dir.x );',
	'        float d = .5 * w / dot( perp, miter );',
	'        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );',
	'        normal.xy *= d;',
	'',
	'    }',
	'',
	'    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
	'    // normal.xy *= .5 * w;',
	'    //normal.xy *= w / dot(miter, perp);',
	'    normal *= projectionMatrix;',
	'    if( sizeAttenuation == 0. ) {',
	'        normal.xy *= finalPosition.w;',
	'        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;',
	'    }',
	'',
	'    finalPosition.xy += normal.xy * side;',
	'',
	'    gl_Position = finalPosition;',
	'',
	THREE.ShaderChunk.logdepthbuf_vertex,
	THREE.ShaderChunk.fog_vertex && '    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
	THREE.ShaderChunk.fog_vertex,
	'}'
].join('\n');

THREE.ShaderChunk['meshline_frag'] = [
	'',
	THREE.ShaderChunk.fog_pars_fragment,
	THREE.ShaderChunk.logdepthbuf_pars_fragment,
	'',
	'uniform sampler2D map;',
	'uniform sampler2D alphaMap;',
	'uniform float useMap;',
	'uniform float useAlphaMap;',
	'uniform float useDash;',
	'uniform float dashArray;',
	'uniform float dashOffset;',
	'uniform float dashRatio;',
	'uniform float visibility;',
	'uniform float alphaTest;',
	'uniform vec2 repeat;',
	'',
	'varying vec2 vUV;',
	'varying vec4 vColor;',
	'varying float vCounters;',
	'',
	'void main() {',
	'',
	THREE.ShaderChunk.logdepthbuf_fragment,
	'',
	'    vec4 c = vColor;',
	'    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );',
	'    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;',
	'    if( c.a < alphaTest ) discard;',
	'    if( useDash == 1. ){',
	'        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));',
	'    }',
	'    gl_FragColor = c;',
	'    gl_FragColor.a *= step(vCounters, visibility);',
	'',
	THREE.ShaderChunk.fog_fragment,
	'}'
].join('\n');

class MeshLineMaterial extends THREE.ShaderMaterial {
	constructor(parameters) {
		super({
			uniforms: Object.assign({}, THREE.UniformsLib.fog, {
				lineWidth: { value: 1 },
				map: { value: null },
				useMap: { value: 0 },
				alphaMap: { value: null },
				useAlphaMap: { value: 0 },
				color: { value: new THREE.Color(0xffffff) },
				opacity: { value: 1 },
				resolution: { value: new THREE.Vector2(1, 1) },
				sizeAttenuation: { value: 1 },
				dashArray: { value: 0 },
				dashOffset: { value: 0 },
				dashRatio: { value: 0.5 },
				useDash: { value: 0 },
				visibility: { value: 1 },
				alphaTest: { value: 0 },
				repeat: { value: new THREE.Vector2(1, 1) }
			}),

			vertexShader: THREE.ShaderChunk.meshline_vert,

			fragmentShader: THREE.ShaderChunk.meshline_frag
		});
		this.isMeshLineMaterial = true;
		this.type = 'MeshLineMaterial';

		Object.defineProperties(this, {
			lineWidth: {
				enumerable: true,
				get: function () {
					return this.uniforms.lineWidth.value;
				},
				set: function (value) {
					this.uniforms.lineWidth.value = value;
				}
			},
			map: {
				enumerable: true,
				get: function () {
					return this.uniforms.map.value;
				},
				set: function (value) {
					this.uniforms.map.value = value;
				}
			},
			useMap: {
				enumerable: true,
				get: function () {
					return this.uniforms.useMap.value;
				},
				set: function (value) {
					this.uniforms.useMap.value = value;
				}
			},
			alphaMap: {
				enumerable: true,
				get: function () {
					return this.uniforms.alphaMap.value;
				},
				set: function (value) {
					this.uniforms.alphaMap.value = value;
				}
			},
			useAlphaMap: {
				enumerable: true,
				get: function () {
					return this.uniforms.useAlphaMap.value;
				},
				set: function (value) {
					this.uniforms.useAlphaMap.value = value;
				}
			},
			color: {
				enumerable: true,
				get: function () {
					return this.uniforms.color.value;
				},
				set: function (value) {
					this.uniforms.color.value = value;
				}
			},
			opacity: {
				enumerable: true,
				get: function () {
					return this.uniforms.opacity.value;
				},
				set: function (value) {
					this.uniforms.opacity.value = value;
				}
			},
			resolution: {
				enumerable: true,
				get: function () {
					return this.uniforms.resolution.value;
				},
				set: function (value) {
					this.uniforms.resolution.value.copy(value);
				}
			},
			sizeAttenuation: {
				enumerable: true,
				get: function () {
					return this.uniforms.sizeAttenuation.value;
				},
				set: function (value) {
					this.uniforms.sizeAttenuation.value = value;
				}
			},
			dashArray: {
				enumerable: true,
				get: function () {
					return this.uniforms.dashArray.value;
				},
				set: function (value) {
					this.uniforms.dashArray.value = value;
					this.useDash = value !== 0 ? 1 : 0;
				}
			},
			dashOffset: {
				enumerable: true,
				get: function () {
					return this.uniforms.dashOffset.value;
				},
				set: function (value) {
					this.uniforms.dashOffset.value = value;
				}
			},
			dashRatio: {
				enumerable: true,
				get: function () {
					return this.uniforms.dashRatio.value;
				},
				set: function (value) {
					this.uniforms.dashRatio.value = value;
				}
			},
			useDash: {
				enumerable: true,
				get: function () {
					return this.uniforms.useDash.value;
				},
				set: function (value) {
					this.uniforms.useDash.value = value;
				}
			},
			visibility: {
				enumerable: true,
				get: function () {
					return this.uniforms.visibility.value;
				},
				set: function (value) {
					this.uniforms.visibility.value = value;
				}
			},
			alphaTest: {
				enumerable: true,
				get: function () {
					return this.uniforms.alphaTest.value;
				},
				set: function (value) {
					this.uniforms.alphaTest.value = value;
				}
			},
			repeat: {
				enumerable: true,
				get: function () {
					return this.uniforms.repeat.value;
				},
				set: function (value) {
					this.uniforms.repeat.value.copy(value);
				}
			}
		});

		this.setValues(parameters);
	}
}

MeshLineMaterial.prototype.copy = function (source) {
	THREE.ShaderMaterial.prototype.copy.call(this, source);

	this.lineWidth = source.lineWidth;
	this.map = source.map;
	this.useMap = source.useMap;
	this.alphaMap = source.alphaMap;
	this.useAlphaMap = source.useAlphaMap;
	this.color.copy(source.color);
	this.opacity = source.opacity;
	this.resolution.copy(source.resolution);
	this.sizeAttenuation = source.sizeAttenuation;
	this.dashArray = source.dashArray;
	this.dashOffset = source.dashOffset;
	this.dashRatio = source.dashRatio;
	this.useDash = source.useDash;
	this.visibility = source.visibility;
	this.alphaTest = source.alphaTest;
	this.repeat.copy(source.repeat);

	return this;
};

const GeometryResolution = new THREE.Vector2();
const getFillGeometry = (points) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
        shape.lineTo(point.x, point.y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
};
class Shape extends THREE.Group {
    constructor(points, { strokeColor = new THREE.Color(0x000000), strokeOpacity = 1.0, strokeWidth = 4 * PIXELS_TO_COORDS, stroke = true, fillColor = new THREE.Color(0xfffaf0), fillOpacity = 1.0, fill = false } = {}) {
        super();
        const fillGeometry = getFillGeometry(points);
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: fillColor,
            opacity: fillOpacity,
            transparent: true,
            polygonOffset: true
        });
        this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
        this.fillVisible = fill;
        if (this.fillVisible) {
            this.add(this.fill);
        }
        const strokeGeometry = new MeshLine();
        strokeGeometry.setPoints(points);
        const strokeMaterial = new MeshLineMaterial({
            color: strokeColor,
            opacity: strokeOpacity,
            lineWidth: strokeWidth,
            transparent: true,
            polygonOffset: true
        });
        // Set the uniform to a reference to GeometryResolution so that
        // strokes automatically update when the canvas resolution changes.
        strokeMaterial.uniforms.resolution.value = GeometryResolution;
        this.stroke = new THREE.Mesh(strokeGeometry, strokeMaterial);
        this.stroke.raycast = MeshLineRaycast;
        this.strokeVisible = stroke;
        if (this.strokeVisible) {
            this.add(this.stroke);
        }
        this.curveEndIndices = this.getCurveEndIndices();
    }
    get points() {
        return this.stroke.geometry._points;
    }
    curve(curveIndex, worldTransform = true) {
        const curveEndIndices = this.curveEndIndices[curveIndex];
        const curvePoints = this.points.slice(curveEndIndices[0], curveEndIndices[1] + 1);
        if (worldTransform) {
            return curvePoints.map((p) => p.clone().applyMatrix4(this.matrixWorld));
        }
        else {
            return curvePoints;
        }
    }
    get numCurves() {
        return this.curveEndIndices.length;
    }
    getCurveEndIndices() {
        const points = this.stroke.geometry._points;
        const indices = [];
        for (let i = 0; i < points.length - 1; i++) {
            indices.push([i, i + 1]);
        }
        return indices;
    }
    clear() {
        this.removeStroke();
        this.removeFill();
        return this;
    }
    clone(recursive) {
        if (recursive === false) {
            throw Error('Shape.clone() is always recursive');
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const clone = new this.constructor(...this.getCloneAttributes(), this.getStyle());
        THREE.Object3D.prototype.copy.call(clone, this, false);
        return clone;
    }
    copy(source, recursive) {
        if (recursive === false) {
            throw Error('Shape.clone() is always recursive');
        }
        const originalFillVisible = source.fillVisible;
        const originalStrokeVisible = source.strokeVisible;
        this.clear();
        source.clear();
        source.addFill();
        source.addStroke();
        super.copy(source, true);
        this.fill = this.children[0];
        this.stroke = this.children[1];
        this.stroke.raycast = source.stroke.raycast;
        source.clear();
        this.clear();
        if (originalFillVisible) {
            source.addFill();
            this.addFill();
        }
        if (originalStrokeVisible) {
            source.addStroke();
            this.addStroke();
        }
        for (const { attribute } of source.attributeData) {
            this[attribute] = source[attribute];
        }
        this.curveEndIndices = source.curveEndIndices;
        return this;
    }
    toJson() {
        return {
            className: this.constructor.name,
            attributes: this.getAttributes(),
            transform: this.getTransform(),
            style: Shape.styleToJson(this.getStyle())
        };
    }
    static fromJson(json) {
        const shape = this.fromAttributes(json.attributes);
        if (json.transform !== undefined) {
            shape.setTransform(json.transform);
        }
        if (json.style !== undefined) {
            shape.setStyle(Shape.jsonToStyle(json.style));
        }
        return shape;
    }
    getCloneAttributes() {
        return [this.points];
    }
    getStyle() {
        return {
            fill: this.fillVisible,
            fillColor: this.fill.material.color,
            fillOpacity: this.fill.material.opacity,
            stroke: this.strokeVisible,
            strokeColor: this.stroke.material.uniforms.color.value,
            strokeOpacity: this.stroke.material.opacity,
            strokeWidth: this.stroke.material.lineWidth
        };
    }
    setStyle(style) {
        const { fillColor, fillOpacity, fill } = style;
        if (fillColor !== undefined) {
            this.fill.material.color = fillColor;
        }
        if (fillOpacity !== undefined) {
            this.fill.material.opacity = fillOpacity;
        }
        if (fill !== undefined) {
            fill ? this.addFill() : this.removeFill();
        }
        const { strokeColor, strokeOpacity, strokeWidth, stroke } = style;
        if (strokeColor !== undefined) {
            this.stroke.material.color = strokeColor;
        }
        if (strokeOpacity !== undefined) {
            this.stroke.material.opacity = strokeOpacity;
        }
        if (strokeWidth !== undefined) {
            this.stroke.material.lineWidth = strokeWidth;
        }
        if (stroke !== undefined) {
            stroke ? this.addStroke() : this.removeStroke();
        }
    }
    getTransform() {
        return {
            position: this.position.toArray(),
            rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
            scale: this.scale.x
        };
    }
    setTransform(transform) {
        const { position, rotation, scale } = transform;
        this.position.set(...position);
        this.setRotationFromEuler(new THREE.Euler(...rotation));
        this.scale.set(scale, scale, scale);
    }
    addStroke() {
        this.add(this.stroke);
        this.strokeVisible = true;
    }
    removeStroke() {
        this.remove(this.stroke);
        this.strokeVisible = false;
    }
    addFill() {
        this.add(this.fill);
        this.fillVisible = true;
    }
    removeFill() {
        this.remove(this.fill);
        this.fillVisible = false;
    }
    dispose() {
        this.fill.geometry.dispose();
        this.fill.material.dispose();
        this.stroke.geometry.dispose();
        this.stroke.material.dispose();
        return this;
    }
    getDimensions() {
        const box = new THREE.Box3();
        box.setFromObject(this);
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;
        return new THREE.Vector2(width, height);
    }
}
Shape.styleToJson = (style) => {
    const { strokeColor, strokeOpacity, strokeWidth, stroke, fillColor, fillOpacity, fill } = style;
    return {
        strokeColor: strokeColor ? strokeColor.toArray() : undefined,
        strokeOpacity,
        strokeWidth,
        stroke,
        fillColor: fillColor ? fillColor.toArray() : undefined,
        fillOpacity,
        fill
    };
};
Shape.jsonToStyle = (styleJson) => {
    const { strokeColor, strokeOpacity, strokeWidth, stroke, fillColor, fillOpacity, fill } = styleJson;
    return {
        strokeColor: strokeColor ? new THREE.Color().fromArray(strokeColor) : undefined,
        strokeOpacity,
        strokeWidth,
        stroke,
        fillColor: fillColor ? new THREE.Color().fromArray(fillColor) : undefined,
        fillOpacity,
        fill
    };
};
class Line extends Shape {
    constructor(start, end, config = { transformCenter: true }) {
        this.start = start;
        this.end = end;
        if (config.transformCenter) {
            const strokeCenter = new THREE.Vector3().addVectors(start, end).divideScalar(2);
            const newPoints = [
                new THREE.Vector3().subVectors(start, strokeCenter),
                new THREE.Vector3().subVectors(end, strokeCenter)
            ];
            super(newPoints, Object.assign(Object.assign({}, config), { fill: false }));
            this.position.copy(strokeCenter);
        }
        else {
            super([start, end], Object.assign(Object.assign({}, config), { fill: false }));
        }
        this.curveEndIndices = [[0, 1]];
    }
    getAttributes() {
        return {
            start: this.start,
            end: this.end
        };
    }
    static fromAttributes(attributes) {
        const { start, end } = attributes;
        return new Line(start, end);
    }
}
class Arc extends Shape {
    constructor(radius = 1, angle = Math.PI / 2, closed = false, config = {}) {
        let points = [];
        for (let i = 0; i <= angle + ERROR_THRESHOLD; i += angle / 50) {
            points.push(new THREE.Vector3(radius * Math.cos(i), radius * Math.sin(i), 0));
        }
        if (closed) {
            points = [new THREE.Vector3(0, 0, 0), ...points, new THREE.Vector3(0, 0, 0)];
        }
        super(points, config);
        this.radius = radius;
        this.angle = angle;
        this.closed = closed;
        this.radius = radius;
        this.angle = angle;
        this.closed = closed;
        if (closed) {
            this.curveEndIndices = [
                [0, 1],
                [1, points.length - 2],
                [points.length - 2, points.length - 1]
            ];
        }
        else {
            this.curveEndIndices = [[0, points.length - 1]];
        }
    }
    getCloneAttributes() {
        return [this.radius, this.angle, this.closed];
    }
    getAttributes() {
        return {
            radius: this.radius,
            angle: this.angle,
            closed: this.closed
        };
    }
    static fromAttributes(attributes) {
        const { radius, angle, closed } = attributes;
        return new Arc(radius, angle, closed);
    }
    get attributeData() {
        return [
            {
                attribute: 'radius',
                type: 'number',
                default: 1
            },
            {
                attribute: 'angle',
                type: 'angle',
                default: 45
            },
            {
                attribute: 'closed',
                type: 'boolean',
                default: false
            }
        ];
    }
    getDimensions() {
        const worldDiameter = 2 * this.radius * this.scale.x;
        return new THREE.Vector2(worldDiameter, worldDiameter);
    }
}
class Circle extends Arc {
    constructor(radius = 1, config = {}) {
        super(radius, 2 * Math.PI, false, config);
    }
    getCloneAttributes() {
        return [this.radius];
    }
    getAttributes() {
        return {
            radius: this.radius,
            angle: 2 * Math.PI,
            closed: false
        };
    }
    static fromAttributes(attributes) {
        const { radius } = attributes;
        return new Circle(radius);
    }
    get attributeData() {
        return [
            {
                attribute: 'radius',
                type: 'number',
                default: 1
            }
        ];
    }
}
class Point extends Circle {
    // TODO: this.location should return this.position
    constructor(location, config = {}) {
        super(0.08, Object.assign({ fillColor: new THREE.Color('black'), fill: true }, config));
        this.location = location;
        this.position.set(location.x, location.y, 0);
    }
    getAttributes() {
        return {
            radius: 0.08,
            angle: 2 * Math.PI,
            closed: false
        };
    }
    static fromAttributes() {
        return new Point(new THREE.Vector3());
    }
}
class Polygon extends Shape {
    constructor(points, config = {}) {
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        for (const point of points.slice(0, points.length - 1)) {
            min.min(point);
            max.max(point);
        }
        const center = new THREE.Vector3().addVectors(min, max).divideScalar(2);
        const newPoints = points.map((p) => new THREE.Vector3().subVectors(p, center));
        super(newPoints, config);
        this.position.copy(center);
        this.curveEndIndices = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.curveEndIndices.push([i, i + 1]);
        }
    }
    getAttributes() {
        return {
            points: this.points
        };
    }
    static fromAttributes(attributes) {
        const { points } = attributes;
        return new Polygon(points);
    }
    get attributeData() {
        return [];
    }
}
class Rectangle extends Shape {
    constructor(width = 4, height = 2, config = {}) {
        super([
            new THREE.Vector3(-width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0),
            new THREE.Vector3(width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(-width / 2, height / 2, 0)
        ], config);
        this.width = width;
        this.height = height;
    }
    getCloneAttributes() {
        return [this.width, this.height];
    }
    getAttributes() {
        return {
            width: this.width,
            height: this.height
        };
    }
    static fromAttributes(attributes) {
        const { width, height } = attributes;
        return new Rectangle(width, height);
    }
    get attributeData() {
        return [
            {
                attribute: 'width',
                type: 'number',
                default: 4
            },
            {
                attribute: 'height',
                type: 'number',
                default: 2
            }
        ];
    }
    getCurveEndIndices() {
        return [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4]
        ];
    }
}
class Square extends Rectangle {
    constructor(sideLength = 2, config = {}) {
        super(sideLength, sideLength, config);
        this.sideLength = sideLength;
    }
    getCloneAttributes() {
        return [this.sideLength];
    }
    getAttributes() {
        return {
            width: this.sideLength,
            height: this.sideLength
        };
    }
    static fromAttributes(attributes) {
        const { width } = attributes;
        return new Square(width, width);
    }
    get attributeData() {
        return [
            {
                attribute: 'sideLength',
                type: 'number',
                default: 2
            }
        ];
    }
}
const shapeFromJson = (json) => {
    switch (json.className) {
        case 'Line':
            return Line.fromJson(json);
        case 'Arc':
            return Arc.fromJson(json);
        case 'Circle':
            return Circle.fromJson(json);
        case 'Point':
            return Point.fromJson(json);
        case 'Polygon':
            return Polygon.fromJson(json);
        case 'Rectangle':
            return Rectangle.fromJson(json);
        case 'Square':
            return Square.fromJson(json);
        default:
            throw Error(`Invalid JSON ${json}`);
    }
};

var geometry = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Arc: Arc,
	Circle: Circle,
	GeometryResolution: GeometryResolution,
	Line: Line,
	Point: Point,
	Polygon: Polygon,
	Rectangle: Rectangle,
	Shape: Shape,
	Square: Square,
	shapeFromJson: shapeFromJson
});

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let sigmoid = (x) => 1 / (1 + Math.exp(-x));
let smooth = (t) => {
	let error = sigmoid(-10 / 2);
	return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};

const modulate = (t, dt) => {
	let tSeconds = t / 1000;
	let modulatedDelta = 1000 * (smooth(tSeconds) - smooth((t - dt) / 1000));
	let modulatedTime = 1000 * smooth(tSeconds);
	return [modulatedTime, modulatedDelta];
};

class Animation {
	constructor(func) {
		this.func = func;
		this.elapsedTime = 0;
		this.runtime = 1000;
		this.finished = false;
		this.excessTime = null;
	}

	update(deltaTime) {
		if (this.elapsedTime + deltaTime >= this.runtime) {
			this.finish(deltaTime);
			return;
		}
		this.elapsedTime += deltaTime;
		this.func(...modulate(this.elapsedTime, deltaTime));
	}

	finish(deltaTime) {
		this.finished = true;
		let finishDeltaTime = this.runtime - this.elapsedTime;
		this.excessTime = this.elapsedTime + deltaTime - this.runtime;
		this.elapsedTime = this.runtime;
		this.func(...modulate(this.runtime, finishDeltaTime));
	}
}

const Shift = (object, direction) => {
	return new Animation((elapsedTime, deltaTime) => {
		object.position.add(direction.clone().multiplyScalar(deltaTime / 1000));
	});
};

var animation = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Animation: Animation,
	Shift: Shift
});

const updateRenderData = (startTime, previousCallTime, time) => {
    let deltaTime, elapsedTime;
    if (previousCallTime !== null && startTime !== null) {
        deltaTime = time - previousCallTime;
        elapsedTime = time - startTime;
        previousCallTime = time;
    }
    else {
        startTime = time;
        deltaTime = 0;
        elapsedTime = 0;
        previousCallTime = time;
    }
    return [startTime, deltaTime, elapsedTime, previousCallTime];
};
const handleAnimations = (animations, currentAnimationIndex, deltaTime) => {
    if (currentAnimationIndex >= animations.length) {
        return currentAnimationIndex;
    }
    let currentAnimation = animations[currentAnimationIndex];
    currentAnimation.update(deltaTime);
    if (!currentAnimation.finished) {
        return currentAnimationIndex;
    }
    currentAnimationIndex += 1;
    if (currentAnimationIndex >= animations.length) {
        return currentAnimationIndex;
    }
    let nextAnimation = animations[currentAnimationIndex];
    nextAnimation.update(currentAnimation.excessTime);
    return currentAnimationIndex;
};

class Scene {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.animations = [];
        this.previousCallTime = null;
        this.startTime = null;
        this.currentAnimationIndex = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
        scene.clear();
        renderer.getSize(GeometryResolution);
    }
    render(time, deltaTime) { }
    reset() {
        this.previousCallTime = null;
        this.startTime = null;
        this.currentAnimationIndex = 0;
        this.deltaTime = 0;
        this.elapsedTime = 0;
    }
    tick(time) {
        [this.startTime, this.deltaTime, this.elapsedTime, this.previousCallTime] =
            updateRenderData(this.startTime, this.previousCallTime, time);
        try {
            this.render(this.elapsedTime, this.deltaTime);
            this.currentAnimationIndex = handleAnimations(this.animations, this.currentAnimationIndex, this.deltaTime);
        }
        catch (err) {
            console.error("Error executing user animation: ", err);
            this.renderer.setAnimationLoop(null);
        }
    }
}

export { animation as Animation, geometry as Geometry, Scene };
