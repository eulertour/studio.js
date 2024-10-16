import * as THREE from 'three';
import { Polyline } from './geometry';
import type { Style } from './geometry.types';

type CurveAttributes = {
	equation: () => void;
};

/**
 * A curve described by an equation.
 */
export class Curve extends Polyline {
	constructor(
		public equation: () => void,
		config: Style = {},
	) {
		config = { ...Polyline.defaultConfig(), ...config };
		super([new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)], config);
	}

	static defaultConfig() {
		return { ...Polyline.defaultConfig() };
	}

	getClassConfig() {
		return {};
	}

	// getAttributes(): CurveAttributes {
	//   return {
	//     equation: this.equation,
	//   };
	// }
	//
	// static fromAttributes(attributes: CurveAttributes): Curve {
	//   const { equation } = attributes;
	//   return new Curve(equation);
	// }
}
