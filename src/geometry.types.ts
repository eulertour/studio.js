type Transform = {
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
};

type Style = {
	strokeColor?: THREE.Color;
	strokeWidth?: number;
	strokeOpacity?: number;
	stroke?: boolean;
	fillColor?: THREE.Color;
	fillOpacity?: number;
	fill?: boolean;
};

type StyleJson = {
	strokeColor?: Array<number>;
	strokeWidth?: number;
	strokeOpacity?: number;
	stroke?: boolean;
	fillColor?: Array<number>;
	fillOpacity?: number;
	fill?: boolean;
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
