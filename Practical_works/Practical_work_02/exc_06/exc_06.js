import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;

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
  dirLight.position.set(0, 3.9, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 10;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.top = 5;
  dirLight.shadow.camera.bottom = -5;
  scene.add(dirLight);
  scene.add(dirLight.target);
  dirLight.visible = false;

  const dirHelper = new THREE.DirectionalLightHelper(dirLight);
  scene.add(dirHelper);
  dirHelper.visible = false;

  const dirCamHelper = new THREE.CameraHelper(dirLight.shadow.camera);
  scene.add(dirCamHelper);
  dirCamHelper.visible = false;

  // Point
  const pointLight = new THREE.PointLight(0xffffff, 6);
  pointLight.position.set(0, 3.9, -2);
  scene.add(pointLight);
  pointLight.castShadow = true;
  pointLight.shadow.camera.near = 0.5;
  pointLight.shadow.camera.far = 10;
  pointLight.visible = false;

  const pointHelper = new THREE.PointLightHelper(pointLight);
  scene.add(pointHelper);
  pointHelper.visible = false;

  const pointCamHelper = new THREE.CameraHelper(pointLight.shadow.camera);
  scene.add(pointCamHelper);
  pointCamHelper.visible = false;

  // Spot
  const spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(0, 3.9, 0);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 10;
  scene.add(spotLight);
  scene.add(spotLight.target);
  spotLight.visible = false;

  const spotHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotHelper);
  spotHelper.visible = false;

  const spotCamHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  scene.add(spotCamHelper);
  spotCamHelper.visible = false;

  // Hemisphere
  const skyColor = 0xb1e1ff;
  const groundColor = 0xb97a20;
  const hmsphrLight = new THREE.HemisphereLight(skyColor, groundColor, 1);
  hmsphrLight.position.set(0, 5, 0);
  scene.add(hmsphrLight);
  hmsphrLight.visible = false;

  // ********************** Materials & Objects **********************
  const whiteMtlDbl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const whiteMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Right face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }),  // Left face - Green
    whiteMtlDbl,
    whiteMtlDbl,
    whiteMtlDbl,
    whiteMtlDbl,
  ];

  function addObject(
    x,
    y,
    z,
    geometry,
    parent,
    material,
    castShdw,
    receiveShdw
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = castShdw;
    mesh.receiveShadow = receiveShdw;
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
    const cone = addObject(-0.5, yPos, 0, coneGeo, scene, coneMtl, true, true);

    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinderMtl = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cylinder = addObject(
      0.5,
      yPos,
      0,
      cylinderGeo,
      scene,
      cylinderMtl,
      true,
      true
    );

    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMtl = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
    const sphere = addObject(
      0,
      yPosSphere,
      0.25,
      sphereGeo,
      scene,
      sphereMtl,
      true,
      true
    );
  }

  function createTable(room) {
    const width = 1.4;
    const height = 1;
    const depth = 1;

    const legRadius = 0.03;
    const baseGeo = new THREE.BoxGeometry(width, 0.03, depth);
    const base = addObject(0, height, 0, baseGeo, scene, whiteMtl, true, true);

    const leg = new THREE.CylinderGeometry(legRadius, legRadius, height, 24);
    addObject(
      width / 2 - legRadius,
      -height / 2,
      0,
      leg,
      base,
      whiteMtl,
      true,
      true
    );
    addObject(
      -width / 2 + legRadius,
      -height / 2,
      0,
      leg,
      base,
      whiteMtl,
      true,
      true
    );
  }

  function createRoom() {
    const width = 8;
    const height = 4;
    const depth = 10;
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    const room = addObject(
      0,
      height / 2,
      0,
      roomGeo,
      scene,
      cornellBoxMtls,
      false,
      true
    );

    createTable(room);
  }

  createRoom();
  createObjectsInTable();

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

  class DimensionGUIHelper {
    constructor(obj, minProp, maxProp) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
    }
    get value() {
      return this.obj[this.maxProp] * 2;
    }
    set value(v) {
      this.obj[this.maxProp] = v / 2;
      this.obj[this.minProp] = v / -2;
    }
  }

  class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
      this.obj = obj;
      this.minProp = minProp;
      this.maxProp = maxProp;
      this.minDif = minDif;
    }
    get min() {
      return this.obj[this.minProp];
    }
    set min(v) {
      this.obj[this.minProp] = v;
      this.obj[this.maxProp] = Math.max(
        this.obj[this.maxProp],
        v + this.minDif
      );
    }
    get max() {
      return this.obj[this.maxProp];
    }
    set max(v) {
      this.obj[this.maxProp] = v;
      this.min = this.min;
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

    updateLightFolder();

    if (currentLightHelper !== null) currentLightHelper.visible = false;

    if (currentCamHelper !== null) currentCamHelper.visible = false;

    if (currentLight instanceof THREE.HemisphereLight) {
      currentLightHelper = null;
      currentCamHelper = null;
      visibleLightHelperCheckbox.disable();
      shadowFolder.destroy();
    } else {
      currentLightHelper = lightMap[value].helper;
      currentLightHelper.visible = lightOptions.visibleLightHelper;
      currentCamHelper = lightMap[value].cam;
      currentCamHelper.visible = lightOptions.visibleShadowHelper;
      visibleLightHelperCheckbox.enable();
      updateShadowFolder();
    }
  }

  function changeLightHelperVisibility(value) {
    if (currentLightHelper !== null)
      currentLightHelper.visible = lightOptions.visibleLightHelper;
  }

  function changeCameraHelperVisibility(value) {
    if (currentCamHelper !== null)
      currentCamHelper.visible = lightOptions.visibleShadowHelper;
  }

  function updateLight() {
    if (currentLight.target) currentLight.target.updateMatrixWorld();

    if (currentLightHelper !== null) currentLightHelper.update();

    if (currentCamHelper !== null) currentCamHelper.update();

    currentLight.shadow.camera.updateProjectionMatrix();

    console.log(currentLight.shadow);
  }

  const lightMap = {
    Directional: {
      light: dirLight,
      helper: dirHelper,
      cam: dirCamHelper,
    },
    Point: {
      light: pointLight,
      helper: pointHelper,
      cam: pointCamHelper,
    },
    Spot: {
      light: spotLight,
      helper: spotHelper,
      cam: spotCamHelper,
    },
    Hemisphere: {
      light: hmsphrLight,
    },
  };

  let currentLight = dirLight;
  let currentLightHelper = dirHelper;
  let currentCamHelper = dirCamHelper;
  currentLight.visible = true;
  currentLightHelper.visible = true;
  currentCamHelper.visible = true;
  updateLight();

  const lightOptions = {
    type: "Directional",
    visibleLightHelper: true,
    visibleShadowHelper: true,
  };

  const gui = new GUI();
  gui.add(lightOptions, "type", Object.keys(lightMap)).onChange(changeLight);
  const visibleLightHelperCheckbox = gui
    .add(lightOptions, "visibleLightHelper")
    .onChange(changeLightHelperVisibility);

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

  // Dynamic folder for shadow propeties
  let shadowFolder = gui.addFolder("Shadow Camera");
  function updateShadowFolder() {
    if (shadowFolder) shadowFolder.destroy();
    shadowFolder = gui.addFolder("Shadow Camera");

    shadowFolder
      .add(lightOptions, "visibleShadowHelper")
      .onChange(changeCameraHelperVisibility);

    const minMaxGUIHelper = new MinMaxGUIHelper(
      currentLight.shadow.camera,
      "near",
      "far",
      0.1
    );

    shadowFolder
      .add(minMaxGUIHelper, "min", 0.1, 20, 0.1)
      .name("near")
      .onChange(updateLight);
    shadowFolder
      .add(minMaxGUIHelper, "max", 0.1, 20, 0.1)
      .name("far")
      .onChange(updateLight);

    shadowFolder
      .add(currentLight.shadow.mapSize, "width", [128, 256, 512, 1024, 2048])
      .name("mapWidth")
      .onChange(() => {
        currentLight.shadow.map.dispose(); // Free memory
        currentLight.shadow.map = null; // Prevent unwanted reuse
        updateLight();
      });

    shadowFolder
      .add(currentLight.shadow.mapSize, "height", [128, 256, 512, 1024, 2048])
      .name("mapHeight")
      .onChange(() => {
        currentLight.shadow.map.dispose(); // Free memory
        currentLight.shadow.map = null; // Prevent unwanted reuse
        updateLight();
      });

    if (currentLight instanceof THREE.DirectionalLight) {
      shadowFolder
        .add(
          new DimensionGUIHelper(currentLight.shadow.camera, "left", "right"),
          "value",
          1,
          20
        )
        .name("width")
        .onChange(updateLight);
      shadowFolder
        .add(
          new DimensionGUIHelper(currentLight.shadow.camera, "bottom", "top"),
          "value",
          1,
          20
        )
        .name("height")
        .onChange(updateLight);

      shadowFolder
        .add(currentLight.shadow.camera, "zoom", 0.01, 1.5, 0.01)
        .onChange(updateLight);
    }

    shadowFolder.open();
  }

  updateLightFolder();
  updateShadowFolder();

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
