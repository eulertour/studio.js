type Transform = {
	position: THREE.Vector3;
	rotation: THREE.Euler;
	scale: THREE.Vector3;
};

type Style = {
	strokeColor?: THREE.Color;
	strokeWidth?: number;
	strokeOpacity?: number;
	fillColor?: THREE.Color;
	fillOpacity?: number;
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
	PolygonAttributes,
	LineAttributes,
	ArcAttributes,
	RectangleAttributes,
};
