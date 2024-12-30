import * as THREE from 'three';
export default function MeshLineRaycast(raycaster, intersects) {
    const nextIntersectIndex = intersects.length;
    const inverseMatrix = new THREE.Matrix4();
    const ray = new THREE.Ray();
    const interRay = new THREE.Vector3();
    const geometry = this.geometry;
    inverseMatrix.copy(this.matrixWorld).invert();
    ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
    const vStart = new THREE.Vector3();
    const vEnd = new THREE.Vector3();
    const interSegment = new THREE.Vector3();
    const index = geometry.index;
    const attributes = geometry.attributes;
    if (index !== null) {
        const indices = index.array;
        const positions = attributes.position.array;
        const endPositions = attributes.endPosition.array;
        let minDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < positions.length; i += 12) {
            vStart.fromArray(positions, i);
            vEnd.fromArray(endPositions, i);
            const precision = raycaster.params.Line?.threshold;
            const precisionSq = precision * precision;
            const distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
            if (distSq > precisionSq)
                continue;
            // Move back to world space for distance calculation
            interRay.applyMatrix4(this.matrixWorld);
            interSegment.applyMatrix4(this.matrixWorld);
            const distance = interSegment.distanceTo(interRay);
            if (distance < raycaster.near || distance > raycaster.far)
                continue;
            if (distance < minDistance) {
                minDistance = distance;
                intersects[nextIntersectIndex] = {
                    distance,
                    // What do we want? intersection point on the ray or on the segment??
                    // point: raycaster.ray.at( distance ),
                    point: interSegment.clone(),
                    index: i / 12,
                    face: null,
                    faceIndex: undefined,
                    object: this,
                };
                break;
            }
        }
    }
}
//# sourceMappingURL=MeshLineRaycast.js.map