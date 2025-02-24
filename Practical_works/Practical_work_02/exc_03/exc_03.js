import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(65, 2, 0.01, 100);
  camera.position.y = 1.7;
  camera.position.z = 2;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, -4);
  controls.update();

  // ********************** Lighting Setup **********************

  // Ambient
  const ambLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambLight);
  ambLight.visible = true;

  // Directional
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(0, 3.9, -2);
  dirLight.target.position.set(0, 0, -2);
  scene.add(dirLight);
  scene.add(dirLight.target);
  dirLight.visible = false;
  
  const dirHelper = new THREE.DirectionalLightHelper(dirLight);
  scene.add(dirHelper);
  dirHelper.visible = false;
  
  // Point
  const pointLight = new THREE.PointLight(0xffffff, 6);
  pointLight.position.set(0, 3.9, -2);
  scene.add(pointLight);
  pointLight.visible = false;
  
  const pointHelper = new THREE.PointLightHelper(pointLight);
  scene.add(pointHelper);
  pointHelper.visible = false;
  
  // Spot
  const spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(0, 3.9, -2);
  spotLight.target.position.set(0, 0, -2);
  scene.add(spotLight);
  scene.add(spotLight.target);
  spotLight.visible = false;

  const spotHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotHelper);
  spotHelper.visible = false;

  // Hemisphere
  const skyColor = 0xb1e1ff;
  const groundColor = 0xb97a20;
  const hmsphrLight = new THREE.HemisphereLight(skyColor, groundColor, 1);
  hmsphrLight.position.set(0, 5, 0);
  scene.add(hmsphrLight);
  hmsphrLight.visible = false;

  // ********************** Materials & Objects **********************

  const blackMtl = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const whiteMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const whiteWallMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Right face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }),  // Left face - Green
    whiteWallMtl,
    whiteWallMtl,
    whiteWallMtl,
    whiteWallMtl,
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
    const base = addObject(x, y, z, baseGeo, scene, whiteMtl);
    if (angle) base.rotation.y = angle;

    let posX = width / 2 - legRadius * 4;
    let posY = -height * 0.2;

    const mainConector = new THREE.BoxGeometry(
      posX * 2,
      baseHeight * 3,
      baseHeight
    );
    addObject(0, posY, 0, mainConector, base, blackMtl);

    posY = -(legHeight + baseHeight) / 2;

    const legGeo = new THREE.CylinderGeometry(
      legRadius,
      legRadius,
      legHeight,
      24
    );
    const leg1 = addObject(posX, posY, 0, legGeo, base, whiteMtl);
    const leg2 = addObject(-posX, posY, 0, legGeo, base, whiteMtl);

    posY = -legHeight / 2;

    const auxConector = new THREE.BoxGeometry(
      baseHeight * 2,
      baseHeight,
      depth
    );
    const conector1 = addObject(0, posY, 0, auxConector, leg1, whiteMtl);
    const conector2 = addObject(0, posY, 0, auxConector, leg2, whiteMtl);

    posY = legRadius - wheelRadius * 2;
    let posZ = depth / 2 - wheelRadius * 2;
    const wheelGeo = new THREE.CylinderGeometry(
      wheelRadius,
      wheelRadius,
      legRadius,
      24
    );
    let wheel = addObject(0, posY, posZ, wheelGeo, conector1, blackMtl);
    wheel.rotation.z = Math.PI / 2;
    wheel = addObject(0, posY, -posZ, wheelGeo, conector1, blackMtl);
    wheel.rotation.z = Math.PI / 2;

    wheel = addObject(0, posY, posZ, wheelGeo, conector2, blackMtl);
    wheel.rotation.z = Math.PI / 2;
    wheel = addObject(0, posY, -posZ, wheelGeo, conector2, blackMtl);
    wheel.rotation.z = Math.PI / 2;
  }

  function createRoom() {
    const width = 6;
    const height = 4;
    const depth = 8;
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    addObject(0, height / 2, 0, roomGeo, scene, cornellBoxMtls);

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

  createRoom();
  // ********************** GUI **********************
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  function makeXYZGUI(parent, vector3, name, onChangeFn) {
    const folder = parent.addFolder(name);
    folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "y", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
    folder.open();
  }

  function changeLight(value) {
    currentLight.visible = false;
    currentLight = lightMap[value].light;
    currentLight.visible = true;

    if (currentHelper !== null) currentHelper.visible = false;

    if (currentLight instanceof THREE.HemisphereLight) {
      currentHelper = null;
      visibleCheckbox.disable();
    } else {
      currentHelper = lightMap[value].helper;
      currentHelper.visible = lightOptions.visibleHelper;
      visibleCheckbox.enable();
    }

    updateLightFolder();
  }

  function changeHelperVisibility() {
    if (currentHelper !== null)
      currentHelper.visible = lightOptions.visibleHelper;
  }

  function updateLight() {
    if (currentLight.target) currentLight.target.updateMatrixWorld();

    if (currentHelper !== null) currentHelper.update();
  }

  const lightMap = {
    Directional: {
      light: dirLight,
      helper: dirHelper,
    },
    Point: {
      light: pointLight,
      helper: pointHelper,
    },
    Spot: {
      light: spotLight,
      helper: spotHelper,
    },
    Hemisphere: {
      light: hmsphrLight,
    },
  };

  let currentLight = dirLight;
  let currentHelper = dirHelper;
  currentLight.visible = true;
  currentHelper.visible = true;
  updateLight();

  const lightOptions = { type: "Directional", visibleHelper: true };

  const gui = new GUI();
  gui.add(ambLight, "intensity", 0, 1, 0.01).name("Ambient intensity");
  gui.add(lightOptions, "type", Object.keys(lightMap)).onChange(changeLight);
  const visibleCheckbox = gui
    .add(lightOptions, "visibleHelper")
    .onChange(changeHelperVisibility);

  // Dynamic folder for light propeties
  let lightFolder = gui.addFolder("Light Properties");
  function updateLightFolder() {
    lightFolder.destroy();
    lightFolder = gui.addFolder("Light Properties");

    lightFolder.add(currentLight, "intensity", 0, 50, 0.1);

    if (currentLight instanceof THREE.HemisphereLight) {
      lightFolder.addColor(currentLight, "color");
      lightFolder.addColor(currentLight, "groundColor");
    } else {
      lightFolder.addColor(currentLight, "color");

      if (currentLight instanceof THREE.PointLight) {
        lightFolder
          .add(currentLight, "distance", 0, 10, 0.01)
          .onChange(updateLight);
      } else if (currentLight instanceof THREE.SpotLight) {
        lightFolder
          .add(currentLight, "distance", 0, 10, 0.01)
          .onChange(updateLight);
        lightFolder
          .add(new DegRadHelper(currentLight, "angle"), "value", 0, 90)
          .name("angle")
          .onChange(updateLight);
        lightFolder.add(currentLight, "penumbra", 0, 1, 0.01);
      }
    }

    if (currentLight.position)
      makeXYZGUI(lightFolder, currentLight.position, "position", updateLight);

    if (currentLight.target)
      makeXYZGUI(
        lightFolder,
        currentLight.target.position,
        "target",
        updateLight
      );

    lightFolder.open();
  }

  updateLightFolder();

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
