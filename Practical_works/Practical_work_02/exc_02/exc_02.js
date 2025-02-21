import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(65, 2, 0.01, 100);
  camera.position.y = 1.7;
  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, 0);
  controls.update();

  // ********************** Lightning Setup **********************
  // RectAreaLightUniformsLib.init();
  
  {
  // 	const color = 0xFFFFFF;
  // 	const intensity = 5;
  // 	const width = 1;
  // 	const height = 1;
  // 	const light = new THREE.RectAreaLight( color, intensity, width, height );
  // 	light.position.set( 0, 3.9, -2 );
  // 	light.rotation.x = THREE.MathUtils.degToRad( - 90 );
  // 	scene.add( light );

  // 	const helper = new RectAreaLightHelper( light );
  // 	light.add( helper );
  }

  {
    const light = new THREE.PointLight(0xffffff, 10);
    light.position.set(0, 3.9, -2);
    scene.add(light);
  }

  {
    // const color = 0xFFFFFF;
    // const intensity = 1;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set( 0, 3.9, 0 );
    // //light.target.position.set(0, 0, 0);
    // scene.add(light);
    // //scene.add(light.target);

    // const helper = new THREE.DirectionalLightHelper(light);
    // scene.add(helper);
  }

  // ********************** Materials & Objects **********************
  const whiteMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const dynamicMtl = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
    side: THREE.DoubleSide,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Back face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Front face - Red
    whiteMtl,
    whiteMtl,
    whiteMtl,
    dynamicMtl,
  ];

  function addObject(x, y, z, geometry, parent, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);

    return mesh;
  }

  function createObjectsInTable() {
    const tableHeight = 1;
    const height = 0.3;
    const radius = 0.1;

    const yPos = tableHeight + height/2 + 0.015;
    const yPosSphere = tableHeight + radius + 0.015;

    const coneGeo = new THREE.ConeGeometry(radius, height, 32);
    const coneMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cone = addObject(-0.5, yPos, 0, coneGeo, scene, coneMtl);
    
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinderMtl = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    const cylinder = addObject(0.5, yPos, 0, cylinderGeo, scene, cylinderMtl);
    
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMtl = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.25,
    });
    const sphere = addObject(0, yPosSphere, 0.25, sphereGeo, scene, sphereMtl);
  }

  function createTable(room) {
    const width = 1.4;
    const height = 1;
    const depth = 1;

    const legRadius = 0.03;
    const baseGeo = new THREE.BoxGeometry(width, 0.03, depth);
    const base = addObject(0, height, 0, baseGeo, scene, whiteMtl);

    const leg = new THREE.CylinderGeometry(legRadius, legRadius, height, 24);
    addObject(width / 2 - legRadius, -height / 2, 0, leg, base, whiteMtl);
    addObject(-width / 2 + legRadius, -height / 2, 0, leg, base, whiteMtl);
  }

  function createRoom() {
    const width = 8;
    const height = 4;
    const depth = 10;
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    const room = addObject(0, height / 2, 0, roomGeo, scene, cornellBoxMtls);
    createTable(room);
  }

  createRoom();
  createObjectsInTable();

  // ********************** GUI **********************
  class ColorGUIHelper {
		constructor( object, prop ) {
			this.object = object;
			this.prop = prop;
		}
		get value() {
			return `#${this.object[ this.prop ].getHexString()}`;
		}
		set value( hexString ) {
			this.object[ this.prop ].set( hexString );
		}
	}

	{
		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( dynamicMtl, 'color' ), 'value' ).name( 'Wall color' );
	}

  // ********************** Rendering **********************
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

main();
