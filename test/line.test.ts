import { assert } from 'chai';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Line', () => {
	const line = new Geometry.Line(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));

	describe('attributes', () => {
		it('should have a start and end attribute', () => {
			const attributes = line.getAttributes();
			assert.containsAllKeys(attributes, ['start', 'end']);
		});

		it('should have the correct start attribute', () => {
			const start = line.start;
			const startDifference = new THREE.Vector3(0, 0, 0).sub(start).length();
			assert.isAtMost(startDifference, 0.001);
		});

		it('should have the corrent end attribute', () => {
			const end = line.end;
			const endDifference = new THREE.Vector3(1, 1, 1).sub(end).length();
			assert.isAtMost(endDifference, 0.001);
		});
	});

	it('should inherit from shape', () => {
		assert.instanceOf(line.fill, THREE.Mesh);
		assert.instanceOf(line.stroke, MeshLine);
		assert.isArray(line.curveEndIndices);
		assert.isBoolean(line.arrow);
	});
});
