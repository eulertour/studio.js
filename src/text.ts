import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import type { Style, StyleJson, Transform } from './geometry.types';

class Text extends THREE.Group {
	constructor(public text: string) {
		super();

		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color('black'),
			opacity: 1,
			transparent: true,
			side: THREE.DoubleSide,
			polygonOffset: true
		});

		let svgString = window.MathJax.tex2svg(this.text).children[0].outerHTML.replaceAll(
			'currentColor',
			'black'
		);

		// Remove after updating to three.js r150 (https://github.com/mrdoob/three.js/issues/25548)
		const emptyPath = 'd=""';
		while (true) {
			const match = svgString.match(emptyPath);
			if (match === null) {
				break;
			}

			svgString =
				svgString.slice(0, match.index) +
				'd="M0,0"' +
				svgString.slice(match.index + emptyPath.length);
		}

		const parseData = new SVGLoader().parse(svgString);
		const group = new THREE.Group();
		group.scale.set(0.001, -0.001, 0.001);
		for (const shapePath of parseData.paths) {
			const shapes = SVGLoader.createShapes(shapePath);
			for (const shape of shapes) {
				const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
				group.add(mesh);
			}
		}

		const center = new THREE.Vector3();
		new THREE.Box3().setFromObject(group).getCenter(center);
		group.position.sub(center);
		this.add(group);
	}

	clone(recursive: boolean) {
		if (recursive === false) {
			throw Error('Text.clone() is always recursive');
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const clone = new this.constructor(...this.getCloneAttributes());
		THREE.Object3D.prototype.copy.call(clone, this, false);
		return clone;
	}

	copy(source: this, recursive: boolean) {
		if (recursive === false) {
			throw Error('Text.clone() is always recursive');
		}
		return this;
	}

	getDimensions() {
		const box = new THREE.Box3();
		box.setFromObject(this);
		const width = box.max.x - box.min.x;
		const height = box.max.y - box.min.y;
		return new THREE.Vector2(width, height);
	}

	getCloneAttributes() {
		return [this.text];
	}

	getAttributes() {
		return { text: this.text };
	}

	static fromAttributes(attributes): Text {
		const { text } = attributes;
		return new Text(text);
	}

	get attributeData() {
		return [
			{
				attribute: 'text',
				type: 'string',
				default: 'x^2'
			}
		];
	}

	toJson() {
		return {
			className: this.constructor.name,
			attributes: this.getAttributes(),
			transform: this.getTransform(),
			style: { fillColor: [0, 0, 0] }
		};
	}

	static fromJson(json) {
		const text = this.fromAttributes(json.attributes);

		if (json.transform !== undefined) {
			text.setTransform(json.transform);
		}

		return text;
	}

	getTransform(): Transform {
		return {
			position: this.position.toArray(),
			rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
			scale: this.scale.x
		};
	}

	setTransform(transform: Transform): void {
		const { position, rotation, scale } = transform;
		this.position.set(...position);
		this.setRotationFromEuler(new THREE.Euler(...rotation));
		this.scale.set(scale, scale, scale);
	}

	static styleToJson = (style: Style): StyleJson => {
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
}

const textFromJson = (json: object) => {
	return Text.fromJson(json);
};

export { Text, textFromJson };
