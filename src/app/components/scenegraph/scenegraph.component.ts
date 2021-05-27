import { Component, Input, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { Color, Object3D, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'scenegraph',
  template: '<div style="width:100%; height:50%"></div>',
  // templateUrl: './scenegraph.component.html',
  // styleUrls: ['./scenegraph.component.scss'],
})

export class SceneGraph {

  @Input()
  geometry: string;

  url: string;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  mesh: THREE.Mesh;
  controls: OrbitControls;
  animating: boolean;

  constructor(private sceneGraphElement: ElementRef) {
  }

  ngAfterViewInit() {
    this.url = 'assets/models/chair.stl';

    let height = (window.innerHeight - 150) / 2;

    // create a render and set the size
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    // this.renderer.setClearColor(new Color('white'), 0.1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, height);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color().setHSL(0.6, 0, 0.9);
    // this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / height, 0.1, 1000);
    // this.camera.position.z = 1000;


    // position and point the camera to the center of the scene
    // this.camera.position.x = 150;
    // this.camera.position.y = 150;
    // this.camera.position.z = 150;
    // this.camera.lookAt(new Vector3(0, 40, 0));

    // add spotlight for the shadows
    // let spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.position.set(1000, 1000, 1000);
    // this.scene.add(spotLight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    // this.controls.target.set(0, 0.5, 0);
    // this.controls.update();
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1;

    const hemiLight = new THREE.HemisphereLight(0xfffff, 0xfffff, 1);
    hemiLight.color.setHSL(0.5, 0, 0.6);
    hemiLight.groundColor.setHSL(0.5, 0, 0.6);
    hemiLight.position.set(0, 80, 0);

    const helper = new THREE.HemisphereLightHelper(hemiLight, 10);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(10, 10, 10);
    dirLight.position.multiplyScalar(30);
    dirLight.castShadow = true;
    dirLight.shadow.radius = 8;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 100;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;

    const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);

    const axesHelper = new THREE.AxesHelper(40);

    // this.scene.add(axesHelper);
    // this.scene.add(helper);
    this.scene.add(hemiLight);
    this.scene.add(dirLight);
    // this.scene.add(dirLightHelper);
    // this.scene.add(ground);
    // this.scene.add(sky);
    // this.renderer = new THREE.WebGLRenderer();
    // this.renderer.setClearColor(new Color('black'));

    // let geometry;
    // switch (this.geometry) {
    //   case 'box': geometry = new THREE.BoxGeometry(500, 500, 500); break;
    //   case 'cylinder': geometry = new THREE.CylinderGeometry(200, 200, 600); break;
    //   default:
    //   case 'sphere': geometry = new THREE.SphereGeometry(400);
    // }

    let loader = new STLLoader();

    loader.load(this.url, async (geometry) => {
      // console.log(geometry);
      let material = new THREE.MeshPhysicalMaterial({ color: 0x494949, wireframe: false });
      this.mesh = new THREE.Mesh(geometry, material);
      // console.log(this.mesh);
      this.mesh.position.set(-20, -20, 0);
      this.mesh.rotation.x = -0.5 * Math.PI;
      this.mesh.scale.set(0.1, 0.1, 0.1);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.scene.add(this.mesh);
    }, (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    }, (error) => {
      console.log(error);
    })

    //controls.update() must be called after any manual changes to the camera's transform
    // position and point the camera to the center of the scene
    this.camera.position.x = 150;
    this.camera.position.y = 150;
    this.camera.position.z = 150;
    this.camera.lookAt(new Vector3(0, 40, 0));


    // this.renderer = new THREE.WebGLRenderer();
    this.sceneGraphElement.nativeElement.childNodes[0].appendChild(this.renderer.domElement);
  }

  startAnimation() {
    let width = this.sceneGraphElement.nativeElement.childNodes[0].clientWidth;
    let height = this.sceneGraphElement.nativeElement.childNodes[0].clientHeight;
    this.renderer.setSize(width, height);
    this.animating = true;
    this.render();
  }

  stopAnimation() {
    this.animating = false;
  }

  render() {
    // this.mesh.rotation.x += 0.05;
    // this.mesh.rotation.y += 0.05;
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
    if (this.animating) { requestAnimationFrame(() => { this.render() }); };
  }

}