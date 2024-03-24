# studio.js

Studio.js is the library that powers [Euler Studio](https://eulertour.com/) using [three.js](https://threejs.org/).

## Installation

To run locally you can install into your project with your package manager:

```bash
npm install @eulertour/studio
```

## Setup

The entry point from your animation is a class that implements the `StudioScene` interface. Most of the three.js boilerplate has been setup for you here.

```ts
import { AnimationRepresentation, StudioScene, THREE } from "@eulertour/studio";

export default class Animation implements StudioScene {
  animations: AnimationRepresentation[];

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGLRenderer
  ) {
    this.animations = [];
  }

  loop(time: number, deltaTime: number) {}
}
```

TODO run the animation

## Examples

TODO
