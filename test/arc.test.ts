import { assert } from 'chai';
import { Vector3 } from 'three';
import { MeshLine } from '../src/MeshLine';
import { Geometry } from '../src/index';

describe('Arc', () => {
	describe('default config', () => {
		it('should set default config', () => {
			const arc = new Geometry.Arc();

			assert.equal(arc.radius, 1);
			assert.equal(arc.angle, Math.PI / 2);
			assert.isFalse(arc.closed);
			assert.isUndefined(arc.fill);
		});

		it('should have default style set', () => {
			const arc = new Geometry.Arc();
			const defaults = Geometry.Arrow.defaultStyle();

			assert.isUndefined(arc.fill);
			assert.equal(arc.stroke?.material.color.getHexString(), defaults.strokeColor.getHexString());
			assert.equal(arc.stroke?.material.opacity, defaults.strokeOpacity);
			assert.equal(arc.stroke?.material.width, defaults.strokeWidth);
		});
	});

	describe('attributes', () => {
		it('should have a radius, angle, and closed attributes', () => {
			const arc = new Geometry.Arc();
			assert.containsAllKeys(arc.getAttributes(), ['radius', 'angle', 'closed']);
			assert.deepEqual(arc.getAttributes(), { radius: 1, angle: Math.PI / 2, closed: false });
		});

		it('should correctly return clone attributes', () => {
			const arc = new Geometry.Arc(10, 8, { closed: true });
			assert.deepEqual(arc.getCloneAttributes(), [10, 8, true]);
		});

		it('should correctly return attribute data', () => {
			const arc = new Geometry.Arc();
			assert.deepEqual(arc.attributeData, [
				{
					attribute: 'radius',
					type: 'number',
					default: 1,
				},
				{
					attribute: 'angle',
					type: 'angle',
					default: 45,
				},
				{
					attribute: 'closed',
					type: 'boolean',
					default: false,
				},
			]);
		});
	});

	describe('shape', () => {
		it('closed arc should start and end with a (0, 0, 0) vector 3', () => {
			const closedArc = new Geometry.Arc(10, 8, { closed: true });
			const openArc = new Geometry.Arc(10, 8, { closed: false });

			assert.equal(closedArc.points.length, openArc.points.length + 2);
			assert.deepEqual(closedArc.points.at(0)?.toArray(), [0, 0, 0]);
			assert.deepEqual(closedArc.points.at(-1)?.toArray(), [0, 0, 0]);
		});

		it('should set correct curveEndIndices on a closed arc', () => {
			const arc = new Geometry.Arc(1, Math.PI / 2, { closed: true });
			assert.deepEqual(arc.curveEndIndices, [
				[0, 1],
				[1, 51],
				[51, 52],
			]);
		});

		it('should set correct curveEndIndices on an arc', () => {
			const arc = new Geometry.Arc(1, Math.PI / 2, { closed: false });
			assert.deepEqual(arc.curveEndIndices, [[0, 50]]);
		});

		it('should have correct points with a 0 angle', () => {
			const arc = new Geometry.Arc(1, 0);
			assert.deepEqual(arc.points, [new Vector3(1, 0, 0), new Vector3(1, 0, 0)]);
		});

		it('should return the correct dimensions', () => {
			const arc = new Geometry.Arc(1, 0);
			assert.deepEqual(arc.getDimensions().toArray(), [2, 2]);
		});

		it('should have correct points', () => {
			const arc = new Geometry.Arc(1, 1);

			assert.deepEqual(arc.points, [
				new Vector3(1, 0, 0),
				new Vector3(0.9998000066665778, 0.01999866669333308, 0),
				new Vector3(0.9992001066609779, 0.03998933418663416, 0),
				new Vector3(0.9982005399352042, 0.059964006479444595, 0),
				new Vector3(0.9968017063026194, 0.0799146939691727, 0),
				new Vector3(0.9950041652780257, 0.09983341664682815, 0),
				new Vector3(0.9928086358538663, 0.11971220728891938, 0),
				new Vector3(0.9902159962126371, 0.1395431146442365, 0),
				new Vector3(0.9872272833756269, 0.15931820661424598, 0),
				new Vector3(0.9838436927881214, 0.17902957342582418, 0),
				new Vector3(0.9800665778412416, 0.1986693307950612, 0),
				new Vector3(0.9758974493306055, 0.2182296230808693, 0),
				new Vector3(0.9713379748520297, 0.23770262642713455, 0),
				new Vector3(0.9663899781345132, 0.25708055189215506, 0),
				new Vector3(0.961055438310771, 0.2763556485641137, 0),
				new Vector3(0.955336489125606, 0.29552020666133955, 0),
				new Vector3(0.9492354180824408, 0.31456656061611776, 0),
				new Vector3(0.9427546655283462, 0.3334870921408144, 0),
				new Vector3(0.9358968236779348, 0.35227423327509, 0),
				new Vector3(0.9286646355765102, 0.37092046941298273, 0),
				new Vector3(0.9210609940028851, 0.3894183423086506, 0),
				new Vector3(0.9130889403123083, 0.40776045305957026, 0),
				new Vector3(0.9047516632199634, 0.4259394650659997, 0),
				new Vector3(0.8960524975255252, 0.4439481069655199, 0),
				new Vector3(0.8869949227792842, 0.461779175541483, 0),
				new Vector3(0.8775825618903726, 0.4794255386042031, 0),
				new Vector3(0.8678191796776499, 0.49688013784373686, 0),
				new Vector3(0.857708681363824, 0.5141359916531132, 0),
				new Vector3(0.8472551110134161, 0.5311861979208835, 0),
				new Vector3(0.8364626499151868, 0.5480239367918737, 0),
				new Vector3(0.8253356149096782, 0.5646424733950355, 0),
				new Vector3(0.8138784566625338, 0.5810351605373052, 0),
				new Vector3(0.8020957578842924, 0.5971954413623922, 0),
				new Vector3(0.789992231497365, 0.613116851973434, 0),
				new Vector3(0.7775727187509278, 0.6287930240184687, 0),
				new Vector3(0.7648421872844883, 0.6442176872376912, 0),
				new Vector3(0.7518057291408948, 0.6593846719714734, 0),
				new Vector3(0.7384685587295876, 0.6742879116281453, 0),
				new Vector3(0.7248360107409049, 0.6889214451105515, 0),
				new Vector3(0.7109135380122771, 0.7032794192004104, 0),
				new Vector3(0.6967067093471652, 0.717356090899523, 0),
				new Vector3(0.6822212072876133, 0.7311458297268961, 0),
				new Vector3(0.6674628258413078, 0.7446431199708596, 0),
				new Vector3(0.6524374681640516, 0.7578425628952772, 0),
				new Vector3(0.6371511441985799, 0.7707388788989695, 0),
				new Vector3(0.6216099682706641, 0.7833269096274836, 0),
				new Vector3(0.6058201566434624, 0.7956016200363664, 0),
				new Vector3(0.5897880250310978, 0.8075581004051146, 0),
				new Vector3(0.5735199860724562, 0.8191915683009986, 0),
				new Vector3(0.5570225467662169, 0.8304973704919708, 0),
				new Vector3(0.5403023058681393, 0.8414709848078967, 0),
			]);
		});
	});

	it('should inherit from shape', () => {
		const arc = new Geometry.Arc();
		assert.isUndefined(arc.fill);
		assert.instanceOf(arc.stroke, MeshLine);
		assert.isArray(arc.curveEndIndices);
	});
});
