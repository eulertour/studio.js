import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Square', () => {
	describe('default config', () => {
		it('should set default side length', () => {
			const square = new Geometry.Square();

			assert.deepEqual(square.points, [
				new THREE.Vector3(-1, 1, 0),
				new THREE.Vector3(1, 1, 0),
				new THREE.Vector3(1, -1, 0),
				new THREE.Vector3(-1, -1, 0),
				new THREE.Vector3(-1, 1, 0),
			]);

			assert.equal(square.width, 2);
			assert.equal(square.height, 2);
			assert.equal(square.sideLength, 2);
		});

		it('should have default style set', () => {
			const square = new Geometry.Square();
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(square.fill?.material.color.getHexString(), defaults.fillColor.getHexString());
			assert.equal(square.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(square.fill?.material.transparent);
			assert.equal(
				square.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(square.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(square.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a width and height attribute', () => {
			const square = new Geometry.Square(10);
			assert.containsAllKeys(square.getAttributes(), ['width', 'height']);
			assert.deepEqual(square.getAttributes(), { width: 10, height: 10 });
		});

		it('should correctly return clone attributes', () => {
			const square = new Geometry.Square(10);
			assert.deepEqual(square.getCloneAttributes(), [10]);
		});

		it('should correctly return attribute data', () => {
			const square = new Geometry.Square(10);
			assert.deepEqual(square.attributeData, [
				{
					attribute: 'sideLength',
					type: 'number',
					default: 2,
				},
			]);
		});
	});

	describe('shape', () => {
		it('should correctly use width and height', () => {
			const square = new Geometry.Square(10);

			assert.deepEqual(square.points, [
				new THREE.Vector3(-5, 5, 0),
				new THREE.Vector3(5, 5, 0),
				new THREE.Vector3(5, -5, 0),
				new THREE.Vector3(-5, -5, 0),
				new THREE.Vector3(-5, 5, 0),
			]);

			assert.equal(square.width, 10);
			assert.equal(square.height, 10);
			assert.equal(square.sideLength, 10);
		});

		it('should correctly reshape', () => {
			const square = new Geometry.Square(6);

			assert.deepEqual(square.points, [
				new THREE.Vector3(-3, 3, 0),
				new THREE.Vector3(3, 3, 0),
				new THREE.Vector3(3, -3, 0),
				new THREE.Vector3(-3, -3, 0),
				new THREE.Vector3(-3, 3, 0),
			]);

			assert.equal(square.width, 6);
			assert.equal(square.height, 6);
			assert.equal(square.sideLength, 6);
		});
	});

	it('should correctly return curve end indices', () => {
		const square = new Geometry.Square(10);
		assert.deepEqual(square.getCurveEndIndices(), [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
		]);
	});

	describe('inheritance', () => {
		it('from shape', () => {
			const square = new Geometry.Square();
			assert.instanceOf(square.fill, THREE.Mesh);
			assert.instanceOf(square.stroke, MeshLine);
			assert.isArray(square.curveEndIndices);
		});

		it('from rectange', () => {
			const square = new Geometry.Square();
			assert.equal(square.width, 2);
			assert.equal(square.height, 2);
		});
	});
});
