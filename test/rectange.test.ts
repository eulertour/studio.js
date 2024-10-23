import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Rectangle', () => {
	describe('default config', () => {
		it('should set default width and height', () => {
			const rectangle = new Geometry.Rectangle();

			assert.deepEqual(rectangle.points, [
				new THREE.Vector3(-2, 1, 0),
				new THREE.Vector3(2, 1, 0),
				new THREE.Vector3(2, -1, 0),
				new THREE.Vector3(-2, -1, 0),
				new THREE.Vector3(-2, 1, 0),
			]);

			assert.equal(rectangle.width, 4);
			assert.equal(rectangle.height, 2);
		});

		it('should have default style set', () => {
			const rectangle = new Geometry.Rectangle();
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(
				rectangle.fill?.material.color.getHexString(),
				defaults.fillColor.getHexString(),
			);
			assert.equal(rectangle.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(rectangle.fill?.material.transparent);
			assert.equal(
				rectangle.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(rectangle.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(rectangle.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a width and height attribute', () => {
			const rectangle = new Geometry.Rectangle(10, 8);
			assert.containsAllKeys(rectangle.getAttributes(), ['width', 'height']);
			assert.deepEqual(rectangle.getAttributes(), { width: 10, height: 8 });
		});

		it('should correctly return clone attributes', () => {
			const rectangle = new Geometry.Rectangle(10, 8);
			assert.deepEqual(rectangle.getCloneAttributes(), [10, 8]);
		});

		it('should correctly return attribute data', () => {
			const rectangle = new Geometry.Rectangle(10, 8);
			assert.deepEqual(rectangle.attributeData, [
				{
					attribute: 'width',
					type: 'number',
					default: 4,
				},
				{
					attribute: 'height',
					type: 'number',
					default: 2,
				},
			]);
		});
	});

	describe('shape', () => {
		it('should correctly use width and height', () => {
			const rectangle = new Geometry.Rectangle(10, 8);

			assert.deepEqual(rectangle.points, [
				new THREE.Vector3(-5, 4, 0),
				new THREE.Vector3(5, 4, 0),
				new THREE.Vector3(5, -4, 0),
				new THREE.Vector3(-5, -4, 0),
				new THREE.Vector3(-5, 4, 0),
			]);

			assert.equal(rectangle.width, 10);
			assert.equal(rectangle.height, 8);
		});
	});

	it('should correctly return curve end indices', () => {
		const rectangle = new Geometry.Rectangle(10, 8);
		assert.deepEqual(rectangle.getCurveEndIndices(), [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
		]);
	});

	it('should inherit from shape', () => {
		const rectangle = new Geometry.Rectangle();
		assert.instanceOf(rectangle.fill, THREE.Mesh);
		assert.instanceOf(rectangle.stroke, MeshLine);
		assert.isArray(rectangle.curveEndIndices);
	});
});
