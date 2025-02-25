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
  renderer.setAnimationLoop(animate);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(65, 2, 0.01,100);
  camera.position.y = 1.7;
  camera.position.z = 2;

  const params = new URL(document.location).searchParams;
  const allowvr = params.get("allowvr") === "true";
  if (allowvr) {
    renderer.xr.enabled = true;
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(VRButton.createButton(renderer));
    document.querySelector("#vr").style.display = "none";
  } else {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, -4);
    controls.update();
    document.querySelector("#nonvr").style.display = "none";
  }

  const roomWidth = 6;
  const roomHeight = 4;
  const roomDepth = 8;
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
  pointLight.position.set(0, 3.9, -2);
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
  const blackLmbrtMtl = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const whiteLmbrtMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const whiteWallLmbrtMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  });

  const greenLmbrtMtl = new THREE.MeshLambertMaterial({
    color: colorGreen,
    side: THREE.BackSide,
  });

  const redLmbrtMtl = new THREE.MeshLambertMaterial({
    color: colorRed,
    side: THREE.BackSide,
  });

  const blackPhysicalMtl = new THREE.MeshPhysicalMaterial({ color: 0x000000 });
  const whitePhysicalMtl = new THREE.MeshPhysicalMaterial({ color: 0xffffff });

  const whiteWallPhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  });

  const greenPhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: colorGreen,
    side: THREE.BackSide,
  });

  const redPhyscalMtl = new THREE.MeshPhysicalMaterial({
    color: colorRed,
    side: THREE.BackSide,
  });

  const cornellBoxLmbrMtls = [
    greenLmbrtMtl, // Right face - Green
    redLmbrtMtl, // Left face - Red
    whiteWallLmbrtMtl,
    whiteWallLmbrtMtl,
    whiteWallLmbrtMtl,
    whiteWallLmbrtMtl,
  ];

  const cornellBoxPhysicalMtls = [
    greenPhyscalMtl, // Right face - Green
    redPhyscalMtl, // Left face - Red
    whiteWallPhyscalMtl,
    whiteWallPhyscalMtl,
    whiteWallPhyscalMtl,
    whiteWallPhyscalMtl,
  ];

  const lambertMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const phongMtl = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const physicalMtl = new THREE.MeshPhysicalMaterial({ color: 0xffffff });

  function addObject(x, y, z, geometry, parent, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function createObjectsInTable(tableHeight, zPos) {
    const height = 0.6;
    const radius = height / 2;

    const spaceBeetween = 1;
    const yPos = tableHeight + height / 2 + 0.015;
    const yPosSphere = tableHeight + radius + 0.015;

    const coneGeo = new THREE.ConeGeometry(radius, height, 32);
    addObject(-spaceBeetween, yPos, zPos - 0.25, coneGeo, scene, lambertMtl);

    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
    addObject(spaceBeetween, yPos, zPos - 0.25, cylinderGeo, scene, phongMtl);

    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    addObject(0, yPosSphere, zPos + 0.25, sphereGeo, scene, physicalMtl);
  }

  function createTable(width, height, depth, x, y, z, angle) {
    const baseHeight = 0.03;
    const wheelRadius = 0.04;
    const legRadius = 0.03;
    const legHeight = height - legRadius - wheelRadius * 2;

    const baseGeo = new THREE.BoxGeometry(width, baseHeight, depth);
    const base = addObject(x, y, z, baseGeo, scene, whiteLmbrtMtl);
    if (angle) base.rotation.y = angle;

    let posX = width / 2 - legRadius * 4;
    let posY = -height * 0.2;

    const mainConector = new THREE.BoxGeometry(
      posX * 2,
      baseHeight * 3,
      baseHeight
    );
    addObject(0, posY, 0, mainConector, base, blackLmbrtMtl);

    posY = -(legHeight + baseHeight) / 2;

    const legGeo = new THREE.CylinderGeometry(
      legRadius,
      legRadius,
      legHeight,
      24
    );
    const leg1 = addObject(posX, posY, 0, legGeo, base, whiteLmbrtMtl);
    const leg2 = addObject(-posX, posY, 0, legGeo, base, whiteLmbrtMtl);

    posY = -legHeight / 2;

    const auxConector = new THREE.BoxGeometry(
      baseHeight * 2,
      baseHeight,
      depth
    );
    const conector1 = addObject(0, posY, 0, auxConector, leg1, whiteLmbrtMtl);
    const conector2 = addObject(0, posY, 0, auxConector, leg2, whiteLmbrtMtl);

    posY = legRadius - wheelRadius * 2;
    let posZ = depth / 2 - wheelRadius * 2;
    const wheelGeo = new THREE.CylinderGeometry(
      wheelRadius,
      wheelRadius,
      legRadius,
      24
    );
    let wheel = addObject(0, posY, posZ, wheelGeo, conector1, blackLmbrtMtl);
    wheel.rotation.z = Math.PI / 2;
    wheel = addObject(0, posY, -posZ, wheelGeo, conector1, blackLmbrtMtl);
    wheel.rotation.z = Math.PI / 2;

    wheel = addObject(0, posY, posZ, wheelGeo, conector2, blackLmbrtMtl);
    wheel.rotation.z = Math.PI / 2;
    wheel = addObject(0, posY, -posZ, wheelGeo, conector2, blackLmbrtMtl);
    wheel.rotation.z = Math.PI / 2;
  }

  function createRoom(roomWidth, roomHeight, roomDepth) {
    const width = roomWidth;
    const height = roomHeight;
    const depth = roomDepth;
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    addObject(0, height / 2, 0, roomGeo, scene, cornellBoxLmbrMtls);

    const tableWidth = 1.8;
    const tableHeight = 1;
    const tableDepth = 0.8;

    const spaceBeetween = 0.02;

    let xPos = (tableWidth + spaceBeetween) / 2;
    const y = tableHeight;
    let zPos = -tableWidth * 1.5 - tableDepth / 2 - spaceBeetween * 2;

    createTable(tableWidth, tableHeight, tableDepth, xPos, y, zPos);
    createTable(tableWidth, tableHeight, tableDepth, -xPos, y, zPos);

    createObjectsInTable(tableHeight, zPos);

    xPos = tableWidth - (tableDepth - spaceBeetween) / 2;
    zPos = tableWidth + spaceBeetween;
    let angle = Math.PI / 2;

    createTable(tableWidth, tableHeight, tableDepth, -xPos, y, zPos, angle);
    createTable(tableWidth, tableHeight, tableDepth, -xPos, y, -zPos, angle);
    createTable(tableWidth, tableHeight, tableDepth, -xPos, y, 0, angle);

    createTable(tableWidth, tableHeight, tableDepth, xPos, y, zPos, -angle);
    createTable(tableWidth, tableHeight, tableDepth, xPos, y, -zPos, -angle);
    createTable(tableWidth, tableHeight, tableDepth, xPos, y, 0, -angle);
  }

  createRoom(roomWidth, roomHeight, roomDepth);

  // ********************** GUI **********************

  function changeMaterials(value) {
    let oldBlackLmbrtMtl = currentBlackLmbrtMtl;
    let oldWhiteLmbrtMtl = currentWhiteLmbrtMtl;
    let oldCornelBoxMtl = currentCornelBoxMtl;
    if (value) {
      currentBlackLmbrtMtl = blackPhysicalMtl;
      currentWhiteLmbrtMtl = whitePhysicalMtl;
      currentCornelBoxMtl = cornellBoxPhysicalMtls;
    } else {
      currentBlackLmbrtMtl = blackLmbrtMtl;
      currentWhiteLmbrtMtl = whiteLmbrtMtl;
      currentCornelBoxMtl = cornellBoxLmbrMtls;
    }

    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.material === oldBlackLmbrtMtl) {
          obj.material = currentBlackLmbrtMtl;
        } else if (obj.material === oldWhiteLmbrtMtl) {
          obj.material = currentWhiteLmbrtMtl;
        } else if (obj.material === oldCornelBoxMtl) {
          obj.material = currentCornelBoxMtl;
        }
      }
    });

    guiOptions.adaptMaterials = !guiOptions.adaptMaterials;
  }

  function changeHelperVisibility(value) {
    greenHelper.visible = value;
    redHelper.visible = value;

    guiOptions.visibleHelper = !guiOptions.visibleHelper;
  }

  function changeIntensity(value) {
    greenLight.intensity = value;
    redLight.intensity = value;
  }

  let currentBlackLmbrtMtl = blackLmbrtMtl;
  let currentWhiteLmbrtMtl = whiteLmbrtMtl;
  let currentCornelBoxMtl = cornellBoxLmbrMtls;

  const guiOptions = {
    adaptMaterials: true,
    visibleHelper: false,
    intensity: intensity,
  };

  const gui = new GUI();
  gui
    .add({ Change: () => changeMaterials(guiOptions.adaptMaterials) }, "Change")
    .name("Enable/Disable Physical Material");
  gui
    .add(
      { Change: () => changeHelperVisibility(guiOptions.visibleHelper) },
      "Change"
    )
    .name("Enable/Disable Helper");
  gui.add(guiOptions, "intensity", 0, 5, 0.01).onChange(changeIntensity);

  changeMaterials(guiOptions.adaptMaterials);
  changeHelperVisibility(guiOptions.visibleHelper);

  if (allowvr) {
    gui.domElement.style.visibility = "hidden";
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5),
    ]);

    // Draw ray from controllers
    const controller1 = renderer.xr.getController(0);
    controller1.add(new THREE.Line(geometry));
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    controller2.add(new THREE.Line(geometry));
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    // Draw controllers
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

    // Event listeners for controllers
    const group = new InteractiveGroup();
    group.listenToPointerEvents(renderer, camera);
    group.listenToXRControllerEvents(controller1);
    group.listenToXRControllerEvents(controller2);
    scene.add(group);

    // 3D gui
    const mesh = new HTMLMesh(gui.domElement);
    mesh.position.x = -1.2;
    mesh.position.y = 1.6;
    mesh.position.z = -1.5;
    mesh.rotation.y = Math.PI / 4;
    mesh.scale.setScalar(4);
    group.add(mesh);
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
  }
}

main();
