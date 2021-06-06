import * as THREE from 'three';
import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private controls: OrbitControls;
  private manager: THREE.LoadingManager;
  private loader: ThreeMFLoader;

  private chair: THREE.Group;

  private frameId: number = null;

  private url: string;
  public part: string = 'chair';

  public loadingProgress: number;

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

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight / 3);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 50;
    this.camera.position.y = 30;
    this.camera.position.x = 50;
    this.camera.lookAt(0, 0, 0); // Point camera at chair
    this.scene.add(this.camera);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let color = prefersDark.matches ? 0xCCCCCC : 0xFFFFFF;

    // soft white light
    this.light = new THREE.AmbientLight(0xFFFFFF);
    this.light.position.z = 10;
    this.scene.add(this.light);

    this.dirLight = new THREE.DirectionalLight(color, 1);
    this.dirLight.position.set(10, 10, 10);
    this.dirLight.position.multiplyScalar(30);
    this.dirLight.shadow.radius = 8;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.scene.add(this.dirLight);

    // let helper = new THREE.DirectionalLightHelper(this.dirLight);
    // this.scene.add(helper);

    // let axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    // this.controls.autoRotate = true;
    // this.controls.autoRotateSpeed = 2;

    this.manager = new THREE.LoadingManager();
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    this.manager.onLoad = () => {
      console.log('Loading complete!');
    };
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    this.manager.onError = (url) => {
      console.log('There was an error loading ' + url);
    };

    this.url = `assets/models/${this.part}.3MF`;

    this.loader = new ThreeMFLoader(this.manager);
    // let material = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: false });
    // let material = new THREE.MeshPhysicalMaterial({ color: 0x494949, wireframe: false });

    return new Promise<boolean>((resolve, reject) => {
      this.loader.load(this.url, async (geometry) => {
        // console.log(geometry);
        // this.chair = new THREE.Mesh(geometry, material);
        this.chair = geometry;
        console.log(this.chair);
        this.chair.position.set(-20, -20, 0);
        this.chair.rotation.x = -0.5 * Math.PI;
        this.chair.scale.set(0.05, 0.05, 0.05);
        this.chair.castShadow = true;
        this.chair.receiveShadow = true;
        this.scene.add(this.chair);
        resolve(true);
      }, (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        this.loadingProgress = xhr.loaded / xhr.total * 100;
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

    this.resizeCanvasToDisplaySize();

    this.renderer.render(this.scene, this.camera);
  }

  public async updateChairModel() {
    this.scene.remove(this.chair);
    this.cleanUp();
    this.url = `assets/models/${this.part}.3MF`;
    console.log(`change part to: ${this.part} with url: ${this.url}`);
    this.loader.load(this.url, async (geometry) => {
      // console.log(geometry);
      // this.chair = new THREE.Mesh(geometry, material);
      this.chair = geometry;
      console.log(this.chair);
      this.chair.position.set(-20, -20, 0);
      this.chair.rotation.x = -0.5 * Math.PI;
      this.chair.scale.set(0.05, 0.05, 0.05);
      this.chair.castShadow = true;
      this.chair.receiveShadow = true;
      this.scene.add(this.chair);
    }, (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      this.loadingProgress = xhr.loaded / xhr.total * 100;
    }, (error) => {
      console.log(error);
    })
    // this.chair = await this.loader.loadAsync(this.url);

    console.log('New loadAsync chair: ', this.chair);
  }

  private cleanUp() {
    const cleanMaterial = material => {
      console.log('dispose material!');
      material.dispose();

      // dispose textures
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value === 'object' && 'minFilter' in value) {
          console.log('dispose texture!');
          value.dispose();
        }
      }
    }

    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        console.log('dispose geometry!');
        object.geometry.dispose();

        if (object.material.isMaterial) {
          cleanMaterial(object.material);
        } else {
          // an array of materials
          for (const material of object.material) cleanMaterial(material);
        }
      }
    })
  }

  resizeCanvasToDisplaySize() {
    const canvas = this.renderer.domElement;
    // const width = canvas.clientWidth;
    // const height = canvas.clientHeight;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      this.renderer.setSize(width, height / 3, false);
      this.camera.aspect = width / (height / 3);
      this.camera.updateProjectionMatrix();

      // set render target sizes here
    }
  }
  // Check: https://stackoverflow.com/questions/56163896/three-js-how-to-fit-object-to-left-half-side-of-the-screenwidth-and-height

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // const width = this.canvas.width;
    // const height = this.canvas.height;

    this.camera.aspect = width / (height / 3);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height / 3);
  }
}