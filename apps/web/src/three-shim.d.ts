declare module 'three' {
  export interface Vector3 {
    z: number;
    set(x: number, y: number, z: number): void;
  }
  export interface Euler {
    x: number;
    y: number;
    set(x: number, y: number, z: number): void;
  }
  export interface Object3D {
    rotation: Euler;
  }
  export interface BufferGeometry {
    computeVertexNormals(): void;
    hasAttribute(name: string): boolean;
  }
  export class Scene { add(object: Object3D): void; }
  export class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number);
    position: Vector3;
  }
  export class WebGLRenderer {
    constructor(options: Record<string, unknown>);
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }
  export class PointsMaterial { constructor(options: Record<string, unknown>); }
  export class Points implements Object3D {
    constructor(geometry: BufferGeometry, material: PointsMaterial);
    rotation: Euler;
  }
}

declare module 'three/examples/jsm/loaders/PLYLoader.js' {
  import type { BufferGeometry } from 'three';
  export class PLYLoader { loadAsync(src: string): Promise<BufferGeometry>; }
}
