import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { HTMLMesh } from "three/addons/interactive/HTMLMesh.js";
import { InteractiveGroup } from "three/addons/interactive/InteractiveGroup.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/addons/libs/stats.module.js";

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  document.body.appendChild(VRButton.createButton(renderer));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.y = 1.7;
  camera.position.z = 2;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, -4);
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
    addObject(width / 2 - legRadius, -height / 2, 0, leg, base, whiteLmbrtMtl);
    addObject(-width / 2 + legRadius, -height / 2, 0, leg, base, whiteLmbrtMtl);
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

  const guiOptions = {
    adaptMaterials: true,
    visibleHelper: false,
    intensity: intensity,
  };

  const gui = new GUI();
  gui
    .add(guiOptions, "adaptMaterials")
    .onChange(changeMaterials)
    .name("Physical instead of Lambertian material");
  gui.add(guiOptions, "visibleHelper").onChange(changeHelperVisibility);
  gui.add(guiOptions, "intensity", 0, 5, 0.01).onChange(changeIntensity);
  gui.domElement.style.visibility = "hidden";

  changeMaterials(guiOptions.adaptMaterials);
  changeHelperVisibility(guiOptions.visibleHelper);

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5),
  ]);

  const controller1 = renderer.xr.getController(0);
  controller1.add(new THREE.Line(geometry));
  scene.add(controller1);

  const controller2 = renderer.xr.getController(1);
  controller2.add(new THREE.Line(geometry));
  scene.add(controller2);

  //

  const controllerModelFactory = new XRControllerModelFactory();

  const controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  const controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  const group = new InteractiveGroup();
  group.listenToPointerEvents(renderer, camera);
  group.listenToXRControllerEvents(controller1);
  group.listenToXRControllerEvents(controller2);
  scene.add(group);

  const mesh = new HTMLMesh(gui.domElement);
  mesh.position.x = -0.75;
  mesh.position.y = 1;
  mesh.position.z = -0.5;
  mesh.rotation.y = Math.PI / 4;
  mesh.scale.setScalar(2);
  group.add(mesh);

  // let stats, statsMesh;

  // stats = new Stats();
  // stats.dom.style.width = "80px";
  // stats.dom.style.height = "48px";
  // document.body.appendChild(stats.dom);

  // statsMesh = new HTMLMesh(stats.dom);
  // statsMesh.position.x = -0.75;
  // statsMesh.position.y = 2;
  // statsMesh.position.z = -0.6;
  // statsMesh.rotation.y = Math.PI / 4;
  // statsMesh.scale.setScalar(2.5);
  // group.add(statsMesh);

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
