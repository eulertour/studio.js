import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Polygon', () => {
	function getTestPoints() {
		return [
			new THREE.Vector3(-2, -1, 0),
			new THREE.Vector3(-1, 1, 0),
			new THREE.Vector3(1, 1, 0),
			new THREE.Vector3(2, -1, 0),
			new THREE.Vector3(-2, -1, 0),
		];
	}

	describe('default config', () => {
		it('should set curveEndIndices', () => {
			const polygon = new Geometry.Polygon(getTestPoints());
			assert.deepEqual(polygon.curveEndIndices, [
				[0, 1],
				[1, 2],
				[2, 3],
				[3, 4],
			]);
		});

		it('should have default style set', () => {
			const polygon = new Geometry.Polygon(getTestPoints());
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(polygon.fill?.material.color.getHexString(), defaults.fillColor.getHexString());
			assert.equal(polygon.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(polygon.fill?.material.transparent);
			assert.equal(
				polygon.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(polygon.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(polygon.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a start and end attribute', () => {
			const points = getTestPoints();
			const polygon = new Geometry.Polygon(points);
			assert.containsAllKeys(polygon.getAttributes(), ['points']);
			assert.deepEqual(polygon.getAttributes().points, points);
		});
	});

	describe('shape', () => {
		it('should set start and end correctly', () => {
			const points = getTestPoints();
			const polygon = new Geometry.Polygon(points);

			assert.deepEqual(polygon.points, points);
		});

		it.skip('should correctly reshape', () => {
			const polygon = new Geometry.Polygon(getTestPoints());

			const newPoints = [new THREE.Vector3(-2, -2, 0), new THREE.Vector3(2, 2, 0)];
			polygon.reshape(newPoints, {
				strokeColor: new THREE.Color('#C458A5'),
			});

			assert.deepEqual(polygon.points, newPoints);
			assert.equal(polygon.stroke?.material.color.getHexString(), 'c458a5');
		});
	});

	it('should inherit from shape', () => {
		const polygon = new Geometry.Polygon(getTestPoints());
		assert.instanceOf(polygon.fill, THREE.Mesh);
		assert.instanceOf(polygon.stroke, MeshLine);
		assert.isArray(polygon.curveEndIndices);
	});
});
