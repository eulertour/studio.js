import { assert } from 'chai';
import { Vector3 } from 'three';
import { MeshLine } from '../src/MeshLine';
import { Geometry, THREE } from '../src/index';

describe('Point', () => {
	describe('default config', () => {
		it('should set defaults', () => {
			const point = new Geometry.Point();

			assert.equal(point.radius, 0.08);
			assert.equal(point.angle, Math.PI * 2);
			assert.deepEqual(point.position, new Vector3(0, 0, 0));
			assert.isFalse(point.closed);
		});

		it.skip('should have default style set', () => {
			const point = new Geometry.Point();
			const defaults = Geometry.Arrow.defaultStyle();

			assert.equal(point.fill?.material.color.getHexString(), defaults.fillColor.getHexString());
			assert.equal(point.fill?.material.opacity, defaults.fillOpacity);
			assert.isTrue(point.fill?.material.transparent);
			assert.equal(
				point.stroke?.material.color.getHexString(),
				defaults.strokeColor.getHexString(),
			);
			assert.equal(point.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(point.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a radius, angle, and closed attributes', () => {
			const point = new Geometry.Point(undefined, { radius: 10 });
			assert.containsAllKeys(point.getAttributes(), ['radius', 'angle', 'closed']);
			assert.deepEqual(point.getAttributes(), { radius: 10, angle: Math.PI * 2, closed: false });
		});

		it('should correctly return clone attributes', () => {
			const point = new Geometry.Point(undefined, { radius: 10 });
			assert.deepEqual(point.getCloneAttributes(), [10]);
		});

		it('should correctly return attribute data', () => {
			const point = new Geometry.Point();
			assert.deepEqual(point.attributeData, [
				{
					attribute: 'radius',
					type: 'number',
					default: 1,
				},
			]);
		});
	});

	describe('shape', () => {
		it('should set correct curveEndIndices on an point', () => {
			const point = new Geometry.Point();
			assert.deepEqual(point.curveEndIndices, [[0, 50]]);
		});

		it('should return the correct dimensions', () => {
			const point = new Geometry.Point();
			assert.deepEqual(point.getDimensions().toArray(), [0.16, 0.16]);
		});

		it('should have correct points', () => {
			const point = new Geometry.Point();

			assert.deepEqual(point.points, [
				new Vector3(0.08, 0, 0),
				new Vector3(0.07936917610515823, 0.010026658685144341, 0),
				new Vector3(0.07748665289029048, 0.019895190973188384, 0),
				new Vector3(0.07438211887106011, 0.02944996421477424, 0),
				new Vector3(0.07010453440350908, 0.03854029392813723, 0),
				new Vector3(0.06472135954999579, 0.04702282018339785, 0),
				new Vector3(0.05831749019371293, 0.054763768474295094, 0),
				new Vector3(0.05099391917989519, 0.06164105942206313, 0),
				new Vector3(0.04286614359831974, 0.0675462340401612, 0),
				new Vector3(0.03406234332520583, 0.07238616419728156, 0),
				new Vector3(0.024721359549995815, 0.07608452130361229, 0),
				new Vector3(0.014990505166857996, 0.07858298005829509, 0),
				new Vector3(0.0050232415623451, 0.07984213827426173, 0),
				new Vector3(-0.005023241562345036, 0.07984213827426173, 0),
				new Vector3(-0.014990505166857935, 0.0785829800582951, 0),
				new Vector3(-0.024721359549995756, 0.0760845213036123, 0),
				new Vector3(-0.03406234332520579, 0.07238616419728158, 0),
				new Vector3(-0.042866143598319716, 0.06754623404016122, 0),
				new Vector3(-0.05099391917989518, 0.06164105942206314, 0),
				new Vector3(-0.058317490193712934, 0.05476376847429508, 0),
				new Vector3(-0.06472135954999582, 0.047022820183397825, 0),
				new Vector3(-0.07010453440350911, 0.03854029392813719, 0),
				new Vector3(-0.07438211887106014, 0.029449964214774187, 0),
				new Vector3(-0.07748665289029051, 0.019895190973188318, 0),
				new Vector3(-0.07936917610515824, 0.010026658685144256, 0),
				new Vector3(-0.08, -9.678423597083621e-17, 0),
				new Vector3(-0.07936917610515822, -0.010026658685144449, 0),
				new Vector3(-0.07748665289029046, -0.019895190973188506, 0),
				new Vector3(-0.07438211887106007, -0.029449964214774367, 0),
				new Vector3(-0.07010453440350901, -0.038540293928137355, 0),
				new Vector3(-0.0647213595499957, -0.047022820183397984, 0),
				new Vector3(-0.0583174901937128, -0.054763768474295225, 0),
				new Vector3(-0.050993919179895056, -0.06164105942206324, 0),
				new Vector3(-0.042866143598319584, -0.0675462340401613, 0),
				new Vector3(-0.03406234332520564, -0.07238616419728164, 0),
				new Vector3(-0.024721359549995606, -0.07608452130361235, 0),
				new Vector3(-0.014990505166857761, -0.07858298005829513, 0),
				new Vector3(-0.005023241562344844, -0.07984213827426175, 0),
				new Vector3(0.005023241562345311, -0.0798421382742617, 0),
				new Vector3(0.014990505166858221, -0.07858298005829505, 0),
				new Vector3(0.02472135954999605, -0.07608452130361221, 0),
				new Vector3(0.034062343325206065, -0.07238616419728144, 0),
				new Vector3(0.04286614359831998, -0.06754623404016105, 0),
				new Vector3(0.050993919179895424, -0.06164105942206294, 0),
				new Vector3(0.058317490193713135, -0.05476376847429486, 0),
				new Vector3(0.064721359549996, -0.047022820183397575, 0),
				new Vector3(0.07010453440350926, -0.03854029392813692, 0),
				new Vector3(0.07438211887106025, -0.029449964214773895, 0),
				new Vector3(0.07748665289029058, -0.019895190973188016, 0),
				new Vector3(0.07936917610515827, -0.01002665868514395, 0),
				new Vector3(0.08, 4.067312926697025e-16, 0),
			]);
		});
	});

	describe('inheritance', () => {
		it('from shape', () => {
			const point = new Geometry.Point();
			assert.instanceOf(point.fill, THREE.Mesh);
			assert.instanceOf(point.stroke, MeshLine);
			assert.isArray(point.curveEndIndices);
		});

		it('from arc', () => {
			const point = new Geometry.Point();
			assert.equal(point.radius, 0.08);
			assert.equal(point.angle, Math.PI * 2);
			assert.deepEqual(point.curveEndIndices, [[0, 50]]);
		});

		it('from circle', () => {
			const point = new Geometry.Point();
			assert.instanceOf(point, Geometry.Circle);
		});
	});
});
