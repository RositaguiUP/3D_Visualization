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
  camera.position.z = 5;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.5, 0);
  controls.update();

  const roomWidth = 8;
  const roomHeight = 4;
  const roomDepth = 10;

  // ********************** Lighting Setup **********************

  // Ambient
  const ambLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambLight);
  ambLight.visible = true;

  // Point
  const pointLight = new THREE.PointLight(0xffffff, 6);
  pointLight.position.set(0, 3.9, -1);
  scene.add(pointLight);

  // ********************** Materials & Objects **********************
  const whiteMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const cornellBoxLmbrMtls = [
    new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    }), // Right face - Green
    new THREE.MeshLambertMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    }), // Left face - Red
    whiteMtl,
    whiteMtl,
    whiteMtl,
    whiteMtl,
  ];

  const shareColor = 0xffffff;

  const coneMtl = new THREE.MeshLambertMaterial({ color: shareColor });
  const cylinderMtl = new THREE.MeshPhongMaterial({ color: shareColor });
  const sphereMtl = new THREE.MeshPhysicalMaterial({ color: shareColor });

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
    const cone = addObject(-0.5, yPos, 0, coneGeo, scene, coneMtl);

    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinder = addObject(0.5, yPos, 0, cylinderGeo, scene, cylinderMtl);

    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
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
  function changeShareMtlProperty(property, value, needsUpdate) {
    if (property === "color") {
      coneMtl[property].set(value);
      cylinderMtl[property].set(value);
      sphereMtl[property].set(value);
    } else {
      coneMtl[property] = value;
      cylinderMtl[property] = value;
      sphereMtl[property] = value;

      if (needsUpdate) {
        coneMtl.needsUpdate = true;
        cylinderMtl.needsUpdate = true;
        sphereMtl.needsUpdate = true;
      }
    }
  }

  function changeProperty(material, property, value) {
    material[property] = value;
    material.needsUpdate = true;
  }

  const sides = {
    FrontSide: THREE.FrontSide,
    BackSide: THREE.BackSide,
    DoubleSide: THREE.DoubleSide,
  };

  const cubeMapPaths = [
    "../public/textures/cube/posx.jpg",
    "../public/textures/cube/negx.jpg",
    "../public/textures/cube/posy.jpg",
    "../public/textures/cube/negy.jpg",
    "../public/textures/cube/posz.jpg",
    "../public/textures/cube/negz.jpg",
  ];

  const reflectionMap = new THREE.CubeTextureLoader().load(cubeMapPaths);
  const refractionMap = new THREE.CubeTextureLoader().load(cubeMapPaths);
  refractionMap.mapping = THREE.CubeRefractionMapping;

  const envOptions = {
    none: null,
    reflection: reflectionMap,
    refraction: refractionMap,
  };

  const textureLoader = new THREE.TextureLoader();

  const rockDiff = textureLoader.load(
    "../public/textures/rock_wall/rock_wall_diff.jpg"
  );
  rockDiff.wrapS = THREE.RepeatWrapping;
  rockDiff.wrapT = THREE.RepeatWrapping;
  rockDiff.repeat.set(2, 1);

  const bricksDiff = textureLoader.load(
    "../public/textures/bricks/brick_diffuse.jpg"
  );
  bricksDiff.wrapS = THREE.RepeatWrapping;
  bricksDiff.wrapT = THREE.RepeatWrapping;
  bricksDiff.repeat.set(1, 0.5);

  const mapOptions = {
    none: null,
    rocks: rockDiff,
    bricks: bricksDiff,
  };

  const rockRough = textureLoader.load(
    "../public/textures/rock_wall/rock_wall_rough.jpg"
  );
  rockRough.wrapS = THREE.RepeatWrapping;
  rockRough.wrapT = THREE.RepeatWrapping;
  rockRough.repeat.set(2, 1);
  const brickRough = textureLoader.load(
    "../public/textures/bricks/brick_roughness.jpg"
  );
  brickRough.wrapS = THREE.RepeatWrapping;
  brickRough.wrapT = THREE.RepeatWrapping;
  brickRough.repeat.set(1, 0.5);

  const roughMapOptions = {
    none: null,
    rocks: rockRough,
    bricks: brickRough,
  };

  const fibers = textureLoader.load("../public/textures/alphaMap.jpg");

  const alphaMapOptions = {
    none: null,
    fibers: fibers,
  };

  const combineOptions = {
    MultiplyOperation: THREE.MultiplyOperation,
    MixOperation: THREE.MixOperation,
    AddOperation: THREE.AddOperation,
  };

  const materialOptions = {
    color: shareColor,
    emissive: coneMtl.emissive,
    transparent: false,
    opacity: 1,
    flatShading: false,
    wireframe: false,
    depthTest: true,
    depthWrite: true,
    alphaTest: 0,
    alphaHash: false,
    visible: true,
    side: sides.FrontSide,
    envMap: "none",
    map: "none",
    alphaMap: "none",
  };

  const gui = new GUI();

  function sharedPropertiesGUI() {
    gui
      .addColor(materialOptions, "color")
      .onChange((value) => changeShareMtlProperty("color", value));
    gui
      .addColor(materialOptions, "emissive")
      .onChange((value) => changeShareMtlProperty("emissive", value));
    gui
      .add(materialOptions, "transparent")
      .onChange((value) => changeShareMtlProperty("transparent", value, true));
    gui
      .add(materialOptions, "opacity", 0, 1)
      .step(0.01)
      .onChange((value) => changeShareMtlProperty("opacity", value));
    gui
      .add(materialOptions, "flatShading")
      .onChange((value) => changeShareMtlProperty("flatShading", value, true));
    gui
      .add(materialOptions, "wireframe")
      .onChange((value) => changeShareMtlProperty("wireframe", value, true));
    gui
      .add(materialOptions, "depthTest")
      .onChange((value) => changeShareMtlProperty("depthTest", value));
    gui
      .add(materialOptions, "depthWrite")
      .onChange((value) => changeShareMtlProperty("depthWrite", value));
    gui
      .add(materialOptions, "alphaTest", 0, 1)
      .step(0.01)
      .onChange((value) => changeShareMtlProperty("alphaTest", value, true));
    gui
      .add(materialOptions, "alphaHash")
      .onChange((value) => changeShareMtlProperty("alphaHash", value, true));
    gui
      .add(materialOptions, "visible")
      .onChange((value) => changeShareMtlProperty("visible", value));
    gui
      .add(materialOptions, "side", sides)
      .onChange((value) => changeShareMtlProperty("side", value, true));

    gui
      .add(materialOptions, "envMap", Object.keys(envOptions))
      .onChange((value) =>
        changeShareMtlProperty("envMap", envOptions[value], true)
      );
    gui
      .add(materialOptions, "map", Object.keys(mapOptions))
      .onChange((value) =>
        changeShareMtlProperty("map", mapOptions[value], true)
      );
    gui
      .add(materialOptions, "alphaMap", Object.keys(alphaMapOptions))
      .onChange((value) =>
        changeShareMtlProperty("alphaMap", alphaMapOptions[value], true)
      );
  }

  function createLambertFolder() {
    const lambertFolder = gui.addFolder("Lambert Properties");

    const currentProps = {
      combine: Object.keys(combineOptions)[coneMtl.combine],
    };

    lambertFolder
      .add(currentProps, "combine", Object.keys(combineOptions))
      .onChange((value) =>
        changeProperty(coneMtl, "combine", combineOptions[value])
      );
    lambertFolder.add(coneMtl, "reflectivity", 0, 1);
    lambertFolder.add(coneMtl, "refractionRatio", 0, 1);
  }

  function createPhongFolder() {
    const phongFolder = gui.addFolder("Phong Properties");
    phongFolder.addColor(cylinderMtl, "specular");
    phongFolder.add(cylinderMtl, "shininess", 0, 100);

    const currentProps = {
      combine: Object.keys(combineOptions)[cylinderMtl.combine],
    };

    phongFolder
      .add(currentProps, "combine", Object.keys(combineOptions))
      .onChange((value) =>
        changeProperty(cylinderMtl, "combine", combineOptions[value])
      );
    phongFolder.add(cylinderMtl, "reflectivity", 0, 1);
    phongFolder.add(cylinderMtl, "refractionRatio", 0, 1);
  }

  function createPhysicalFolder() {
    const physicalFolder = gui.addFolder("Physical Properties");

    physicalFolder.add(sphereMtl, "roughness", 0, 1);
    physicalFolder.add(sphereMtl, "metalness", 0, 1);
    physicalFolder.add(sphereMtl, "ior", 1, 2.333);
    physicalFolder.add(sphereMtl, "reflectivity", 0, 1);
    physicalFolder.add(sphereMtl, "iridescence", 0, 1);
    physicalFolder.add(sphereMtl, "iridescenceIOR", 1, 2.333);
    physicalFolder.add(sphereMtl, "sheen", 0, 1);
    physicalFolder.add(sphereMtl, "sheenRoughness", 0, 1);
    physicalFolder.addColor(sphereMtl, "sheenColor");
    physicalFolder.add(sphereMtl, "clearcoat", 0, 1).step(0.01);
    physicalFolder.add(sphereMtl, "clearcoatRoughness", 0, 1).step(0.01);
    physicalFolder.add(sphereMtl, "specularIntensity", 0, 1);
    physicalFolder.addColor(sphereMtl, "specularColor");

    const currentMaps = {
      roughnessMap: "none",
      metalnessMap: "none",
      iridescenceMap: "none",
    };

    physicalFolder
      .add(currentMaps, "roughnessMap", Object.keys(roughMapOptions))
      .onChange((value) =>
        changeProperty(sphereMtl, "roughnessMap", roughMapOptions[value])
      );
    physicalFolder
      .add(currentMaps, "metalnessMap", Object.keys(alphaMapOptions))
      .onChange((value) =>
        changeProperty(sphereMtl, "metalnessMap", alphaMapOptions[value])
      );

    physicalFolder
      .add(currentMaps, "iridescenceMap", Object.keys(alphaMapOptions))
      .onChange((value) =>
        changeProperty(sphereMtl, "iridescenceMap", alphaMapOptions[value])
      );
  }

  sharedPropertiesGUI();
  createLambertFolder();
  createPhongFolder();
  createPhysicalFolder();

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
