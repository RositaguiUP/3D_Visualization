import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

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

  const roomWidth = 8;
  const roomHeight = 4;
  const roomDepth = 10;
  const span = 0.001;

  const colorRed = 0xff0000;
  const colorGreen = 0x00ff00;

  // ********************** Lighting Setup **********************

  // Ambient
  const ambLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambLight);
  ambLight.visible = true;

  // Point
  const pointLight = new THREE.PointLight(0xffffff, 6);
  pointLight.position.set(0, 3.9, -1);
  scene.add(pointLight);

  RectAreaLightUniformsLib.init();
  const xPos = roomWidth / 2 - span;
  const intensity = 0.1;

  const greenLight = new THREE.RectAreaLight(
    colorGreen,
    intensity,
    roomDepth,
    roomHeight
  );
  greenLight.position.set(xPos, roomHeight / 2, 0);
  greenLight.rotation.y = THREE.MathUtils.degToRad(90);
  scene.add(greenLight);
  const greenHelper = new RectAreaLightHelper(greenLight);
  greenLight.add(greenHelper);

  const redLight = new THREE.RectAreaLight(
    colorRed,
    intensity,
    roomDepth,
    roomHeight
  );
  redLight.position.set(-xPos, roomHeight / 2, 0);
  redLight.rotation.y = THREE.MathUtils.degToRad(-90);
  scene.add(redLight);
  const redHelper = new RectAreaLightHelper(redLight);
  redLight.add(redHelper);

  // ********************** Materials & Objects **********************
  const whiteLmbrtMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const greenLmbrtMtl = new THREE.MeshLambertMaterial({
    color: colorGreen,
    side: THREE.DoubleSide,
  });

  const redLmbrtMtl = new THREE.MeshLambertMaterial({
    color: colorRed,
    side: THREE.DoubleSide,
  });

  const whitePhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const greenPhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: colorGreen,
    side: THREE.DoubleSide,
  });

  const redPhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: colorRed,
    side: THREE.DoubleSide,
  });

  const cornellBoxLmbrMtls = [
    greenLmbrtMtl, // Right face - Green
    redLmbrtMtl, // Left face - Red
    whiteLmbrtMtl,
    whiteLmbrtMtl,
    whiteLmbrtMtl,
    whiteLmbrtMtl,
  ];

  const cornellBoxPhysicalMtls = [
    greenPhyscalMtl, // Right face - Green
    redPhyscalMtl, // Left face - Red
    whitePhyscalMtl,
    whitePhyscalMtl,
    whitePhyscalMtl,
    whitePhyscalMtl,
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

    const yPos = tableHeight + height / 2 + 0.015;
    const yPosSphere = tableHeight + radius + 0.015;

    const coneGeo = new THREE.ConeGeometry(radius, height, 32);
    const coneMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cone = addObject(-0.5, yPos, 0, coneGeo, scene, coneMtl);

    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinderMtl = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cylinder = addObject(0.5, yPos, 0, cylinderGeo, scene, cylinderMtl);

    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMtl = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    const sphere = addObject(0, yPosSphere, 0.25, sphereGeo, scene, sphereMtl);
  }

  function createTable(room) {
    const width = 1.4;
    const height = 1;
    const depth = 1;

    const legRadius = 0.03;
    const baseGeo = new THREE.BoxGeometry(width, 0.03, depth);
    const base = addObject(0, height, 0, baseGeo, scene, whiteLmbrtMtl);

    const leg = new THREE.CylinderGeometry(legRadius, legRadius, height, 24);
    addObject(
      width / 2 - legRadius,
      -height / 2,
      0,
      leg,
      base,
      whiteLmbrtMtl
    );
    addObject(
      -width / 2 + legRadius,
      -height / 2,
      0,
      leg,
      base,
      whiteLmbrtMtl
    );
  }

  function createRoom(width, height, depth) {
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    const room = addObject(
      0,
      height / 2,
      0,
      roomGeo,
      scene,
      cornellBoxLmbrMtls
    );
    createTable(room);
  }

  createRoom(roomWidth, roomHeight, roomDepth);
  createObjectsInTable();

  // ********************** GUI **********************

  function changeMaterials(value) {
    let oldWhiteMtl = currentWhiteMtl;
    let oldCornelBoxMtl = currentCornelBoxMtl;
    if (value) {
      currentWhiteMtl = whitePhyscalMtl;
      currentCornelBoxMtl = cornellBoxPhysicalMtls;
    } else {
      currentWhiteMtl = whiteLmbrtMtl;
      currentCornelBoxMtl = cornellBoxLmbrMtls;
    }

    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.material === oldWhiteMtl) {
          obj.material = currentWhiteMtl;
        } else if (obj.material === oldCornelBoxMtl) {
          obj.material = currentCornelBoxMtl;
        }
      }
    });
  }

  function changeHelperVisibility(value) {
    greenHelper.visible = value;
    redHelper.visible = value;
  }

  function changeIntensity(value) {
    greenLight.intensity = value;
    redLight.intensity = value;
  }
  
  let currentWhiteMtl = whiteLmbrtMtl;
  let currentCornelBoxMtl = cornellBoxLmbrMtls;

  const guiOptions = { adaptMaterials: true, visibleHelper: false, intensity: intensity };

  const gui = new GUI();
  gui.add(guiOptions, "adaptMaterials").onChange(changeMaterials).name("Physical instead of Lambertian material");
  gui.add(guiOptions, "visibleHelper").onChange(changeHelperVisibility);
  gui.add(guiOptions, "intensity", 0, 5, 0.01).onChange(changeIntensity);;

  changeMaterials(guiOptions.adaptMaterials);
  changeHelperVisibility(guiOptions.visibleHelper);

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
