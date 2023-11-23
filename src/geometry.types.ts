type Transform = {
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
};

type Style = {
	strokeColor?: THREE.ColorRepresentation;
	strokeWidth?: number;
	strokeOpacity?: number;
	fillColor?: THREE.ColorRepresentation;
	fillOpacity?: number;
};

type StyleJson = {
	strokeColor?: Array<number>;
	strokeWidth?: number;
	strokeOpacity?: number;
	fillColor?: Array<number>;
	fillOpacity?: number;
};

type Representation = {
	class: string;
	attributes: object;
	transform: Transform;
	style: StyleJson;
};

type LineAttributes = {
	start: THREE.Vector3;
	end: THREE.Vector3;
};

type ArcAttributes = {
	radius: number;
	angle: number;
	closed: boolean;
};

type RectangleAttributes = {
	width: number;
	height: number;
};

type PolygonAttributes = {
	points: Array<THREE.Vector3>;
};

export type {
	Transform,
	Style,
	StyleJson,
	Representation,
	PolygonAttributes,
	LineAttributes,
	ArcAttributes,
	RectangleAttributes
};
