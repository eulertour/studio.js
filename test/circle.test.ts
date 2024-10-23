import { assert } from 'chai';
import { Vector3 } from 'three';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Circle', () => {
	describe('default config', () => {
		it('should set defaults', () => {
			const circle = new Geometry.Circle();

			assert.equal(circle.radius, 1);
			assert.equal(circle.angle, Math.PI * 2);
			assert.isFalse(circle.closed);
		});

		it('should have default style set', () => {
			const circle = new Geometry.Circle();
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(circle.fill?.material.color.getHexString(), defaults.fillColor.getHexString());
			assert.equal(circle.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(circle.fill?.material.transparent);
			assert.equal(
				circle.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(circle.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(circle.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a radius, angle, and closed attributes', () => {
			const circle = new Geometry.Circle(10);
			assert.containsAllKeys(circle.getAttributes(), ['radius', 'angle', 'closed']);
			assert.deepEqual(circle.getAttributes(), { radius: 10, angle: Math.PI * 2, closed: false });
		});

		it('should correctly return clone attributes', () => {
			const circle = new Geometry.Circle(10);
			assert.deepEqual(circle.getCloneAttributes(), [10]);
		});

		it('should correctly return attribute data', () => {
			const circle = new Geometry.Circle();
			assert.deepEqual(circle.attributeData, [
				{
					attribute: 'radius',
					type: 'number',
					default: 1,
				},
			]);
		});
	});

	describe('shape', () => {
		it('should set correct curveEndIndices on an circle', () => {
			const circle = new Geometry.Circle(1);
			assert.deepEqual(circle.curveEndIndices, [[0, 50]]);
		});

		it('should return the correct dimensions', () => {
			const circle = new Geometry.Circle(1);
			assert.deepEqual(circle.getDimensions().toArray(), [2, 2]);
		});

		it('should have correct points', () => {
			const circle = new Geometry.Circle(1);

			assert.deepEqual(circle.points, [
				new Vector3(1, 0, 0),
				new Vector3(0.9921147013144779, 0.12533323356430426, 0),
				new Vector3(0.9685831611286311, 0.2486898871648548, 0),
				new Vector3(0.9297764858882513, 0.368124552684678, 0),
				new Vector3(0.8763066800438636, 0.4817536741017153, 0),
				new Vector3(0.8090169943749475, 0.5877852522924731, 0),
				new Vector3(0.7289686274214116, 0.6845471059286886, 0),
				new Vector3(0.6374239897486899, 0.7705132427757891, 0),
				new Vector3(0.5358267949789968, 0.844327925502015, 0),
				new Vector3(0.4257792915650728, 0.9048270524660195, 0),
				new Vector3(0.3090169943749477, 0.9510565162951535, 0),
				new Vector3(0.18738131458572493, 0.9822872507286886, 0),
				new Vector3(0.06279051952931375, 0.9980267284282716, 0),
				new Vector3(-0.06279051952931296, 0.9980267284282716, 0),
				new Vector3(-0.18738131458572418, 0.9822872507286887, 0),
				new Vector3(-0.30901699437494695, 0.9510565162951538, 0),
				new Vector3(-0.4257792915650723, 0.9048270524660197, 0),
				new Vector3(-0.5358267949789964, 0.8443279255020152, 0),
				new Vector3(-0.6374239897486897, 0.7705132427757893, 0),
				new Vector3(-0.7289686274214117, 0.6845471059286885, 0),
				new Vector3(-0.8090169943749477, 0.5877852522924728, 0),
				new Vector3(-0.8763066800438638, 0.4817536741017148, 0),
				new Vector3(-0.9297764858882517, 0.3681245526846773, 0),
				new Vector3(-0.9685831611286313, 0.24868988716485396, 0),
				new Vector3(-0.992114701314478, 0.1253332335643032, 0),
				new Vector3(-1, -1.2098029496354525e-15, 0),
				new Vector3(-0.9921147013144777, -0.12533323356430562, 0),
				new Vector3(-0.9685831611286307, -0.2486898871648563, 0),
				new Vector3(-0.9297764858882508, -0.3681245526846796, 0),
				new Vector3(-0.8763066800438627, -0.48175367410171693, 0),
				new Vector3(-0.8090169943749462, -0.5877852522924748, 0),
				new Vector3(-0.72896862742141, -0.6845471059286903, 0),
				new Vector3(-0.6374239897486882, -0.7705132427757905, 0),
				new Vector3(-0.5358267949789948, -0.8443279255020163, 0),
				new Vector3(-0.42577929156507055, -0.9048270524660205, 0),
				new Vector3(-0.30901699437494506, -0.9510565162951543, 0),
				new Vector3(-0.18738131458572202, -0.9822872507286892, 0),
				new Vector3(-0.06279051952931054, -0.9980267284282718, 0),
				new Vector3(0.06279051952931639, -0.9980267284282713, 0),
				new Vector3(0.18738131458572777, -0.982287250728688, 0),
				new Vector3(0.3090169943749506, -0.9510565162951525, 0),
				new Vector3(0.4257792915650758, -0.904827052466018, 0),
				new Vector3(0.5358267949789998, -0.8443279255020131, 0),
				new Vector3(0.6374239897486927, -0.7705132427757867, 0),
				new Vector3(0.7289686274214142, -0.6845471059286857, 0),
				new Vector3(0.8090169943749499, -0.5877852522924697, 0),
				new Vector3(0.8763066800438657, -0.48175367410171144, 0),
				new Vector3(0.9297764858882531, -0.3681245526846737, 0),
				new Vector3(0.9685831611286323, -0.2486898871648502, 0),
				new Vector3(0.9921147013144784, -0.12533323356429937, 0),
				new Vector3(1, 5.084141158371281e-15, 0),
			]);
		});
	});

	describe('inheritance', () => {
		it('from shape', () => {
			const circle = new Geometry.Circle();
			assert.instanceOf(circle.fill, THREE.Mesh);
			assert.instanceOf(circle.stroke, MeshLine);
			assert.isArray(circle.curveEndIndices);
		});

		it('from arc', () => {
			const circle = new Geometry.Circle();
			assert.equal(circle.radius, 1);
			assert.equal(circle.angle, Math.PI * 2);
			assert.deepEqual(circle.curveEndIndices, [[0, 50]]);
		});
	});
});
