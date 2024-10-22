import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Arrow', () => {
	function getTestPoints(): [start: THREE.Vector3, end: THREE.Vector3] {
		return [new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)];
	}

	describe('default config', () => {
		it('should set arrow to true', () => {
			const arrowOne = new Geometry.Arrow(...getTestPoints());
			assert.isTrue(arrowOne.arrow);

			// @ts-expect-error invalid config
			const arrowTwo = new Geometry.Arrow(...getTestPoints(), { arrow: false });
			assert.isTrue(arrowTwo.arrow);
		});

		it('should have default style set', () => {
			const arrow = new Geometry.Arrow(...getTestPoints());
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(arrow.fill?.material.color.getHexString(), defaults.fillColor.getHexString());
			assert.equal(arrow.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(arrow.fill?.material.transparent);
			assert.equal(
				arrow.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(arrow.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(arrow.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a start and end attribute', () => {
			const arrow = new Geometry.Arrow(...getTestPoints());
			assert.containsAllKeys(arrow.getAttributes(), ['start', 'end']);
		});
	});

	describe('shape', () => {
		it('should set start and end correctly', () => {
			const arrow = new Geometry.Arrow(...getTestPoints());

			assert.deepEqual(arrow.start.toArray(), [-1, -1, 0]);
			assert.deepEqual(arrow.end.toArray(), [1, 1, 0]);
		});

		it.skip('should correctly reshape', () => {
			const arrow = new Geometry.Arrow(...getTestPoints());

			arrow.reshape(new THREE.Vector3(-2, -2, 0), new THREE.Vector3(2, 2, 0), {
				fillColor: new THREE.Color('#C458A5'),
			});

			assert.deepEqual(arrow.start.toArray(), [-2, -2, 0]);
			assert.deepEqual(arrow.end.toArray(), [2, 2, 0]);
			assert.equal(arrow.fill?.material.color.getHexString(), 'c458a5');
		});
	});

	it('should inherit from shape', () => {
		const arrow = new Geometry.Arrow(...getTestPoints());
		assert.instanceOf(arrow.fill, THREE.Mesh);
		assert.instanceOf(arrow.stroke, MeshLine);
		assert.isArray(arrow.curveEndIndices);
		assert.isBoolean(arrow.arrow);
	});
});
