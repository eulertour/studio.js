import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Polyline', () => {
	function getTestPoints() {
		return [new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)];
	}

	describe('default config', () => {
		it('should set curveEndIndices', () => {
			const polyline = new Geometry.Polyline(getTestPoints());
			assert.deepEqual(polyline.curveEndIndices, [[0, 1]]);
		});

		it('should have default style set', () => {
			const polyline = new Geometry.Polyline(getTestPoints());
			const defaults = Geometry.Arrow.defaultStyle();

			assert.isUndefined(polyline.fill);
			assert.equal(
				polyline.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(polyline.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(polyline.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a start and end attribute', () => {
			const points = getTestPoints();
			const polyline = new Geometry.Polyline(points);
			assert.containsAllKeys(polyline.getAttributes(), ['points']);
			assert.deepEqual(polyline.getAttributes().points, points);
		});
	});

	describe('shape', () => {
		it('should set start and end correctly', () => {
			const points = getTestPoints();
			const polyline = new Geometry.Polyline(points);

			assert.deepEqual(polyline.points, points);
		});

		it.skip('should correctly reshape', () => {
			const polyline = new Geometry.Polyline(getTestPoints());

			const newPoints = [new THREE.Vector3(-2, -2, 0), new THREE.Vector3(2, 2, 0)];
			polyline.reshape(newPoints, {
				strokeColor: new THREE.Color('#C458A5'),
			});

			assert.deepEqual(polyline.points, newPoints);
			assert.equal(polyline.stroke?.material.color.getHexString(), 'c458a5');
		});
	});

	it('should inherit from shape', () => {
		const polyline = new Geometry.Polyline(getTestPoints());
		assert.isUndefined(polyline.fill);
		assert.instanceOf(polyline.stroke, MeshLine);
		assert.isArray(polyline.curveEndIndices);
	});
});
