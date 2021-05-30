import * as THREE from 'three';
import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private controls: OrbitControls;

  private chair: THREE.Mesh;

  private frameId: number = null;

  private url: string;


  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<boolean> {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 200;
    this.camera.position.y = 100;
    this.camera.position.x = 100;
    this.camera.lookAt(0, 0, 0); // Point camera at chair
    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    // this.controls.autoRotate = true;
    // this.controls.autoRotateSpeed = 2;

    this.url = 'assets/models/chair.stl';


    let loader = new STLLoader();
    let material = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: false });
    // let material = new THREE.MeshPhysicalMaterial({ color: 0x494949, wireframe: false });

    return new Promise<boolean>((resolve, reject) => {
      loader.load(this.url, async (geometry) => {
        // console.log(geometry);
        this.chair = new THREE.Mesh(geometry, material);
        // console.log(this.chair);
        this.chair.position.set(-20, -20, 0);
        this.chair.rotation.x = -0.5 * Math.PI;
        this.chair.scale.set(0.05, 0.05, 0.05);
        this.chair.castShadow = true;
        this.chair.receiveShadow = true;
        this.scene.add(this.chair);
        resolve(true);
      }, (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      }, (error) => {
        console.log(error);
        reject(false);
      })
    });
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}