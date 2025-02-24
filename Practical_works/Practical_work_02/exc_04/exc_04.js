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
  
  // Point
  const pointLight = new THREE.PointLight(0xffffff, 6);
  pointLight.position.set(0, 3.9, -1);
  scene.add(pointLight);

  // ********************** Materials & Objects **********************

  const blackMtl = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const whiteMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const whiteWallMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Right face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Left face - Green
    whiteWallMtl,
    whiteWallMtl,
    whiteWallMtl,
    whiteWallMtl,
  ];

  const shareColor = 0xffffff;

  const lambertMtl = new THREE.MeshLambertMaterial({ color: shareColor });
  const phongMtl = new THREE.MeshPhongMaterial({ color: shareColor });
  const physicalMtl = new THREE.MeshPhysicalMaterial({ color: shareColor });

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
  function changeShareMtlProperty(property, value, needsUpdate) {
    if (property === "color") {
      lambertMtl[property].set(value);
      phongMtl[property].set(value);
      physicalMtl[property].set(value);
    } else {
      lambertMtl[property] = value;
      phongMtl[property] = value;
      physicalMtl[property] = value;

      if (needsUpdate) {
        lambertMtl.needsUpdate = true;
        phongMtl.needsUpdate = true;
        physicalMtl.needsUpdate = true;
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
    emissive: lambertMtl.emissive,
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
      combine: Object.keys(combineOptions)[lambertMtl.combine],
    };

    lambertFolder
      .add(currentProps, "combine", Object.keys(combineOptions))
      .onChange((value) =>
        changeProperty(lambertMtl, "combine", combineOptions[value])
      );
    lambertFolder.add(lambertMtl, "reflectivity", 0, 1);
    lambertFolder.add(lambertMtl, "refractionRatio", 0, 1);
  }

  function createPhongFolder() {
    const phongFolder = gui.addFolder("Phong Properties");
    phongFolder.addColor(phongMtl, "specular");
    phongFolder.add(phongMtl, "shininess", 0, 100);

    const currentProps = {
      combine: Object.keys(combineOptions)[phongMtl.combine],
    };

    phongFolder
      .add(currentProps, "combine", Object.keys(combineOptions))
      .onChange((value) =>
        changeProperty(phongMtl, "combine", combineOptions[value])
      );
    phongFolder.add(phongMtl, "reflectivity", 0, 1);
    phongFolder.add(phongMtl, "refractionRatio", 0, 1);
  }

  function createPhysicalFolder() {
    const physicalFolder = gui.addFolder("Physical Properties");

    physicalFolder.add(physicalMtl, "roughness", 0, 1);
    physicalFolder.add(physicalMtl, "metalness", 0, 1);
    physicalFolder.add(physicalMtl, "ior", 1, 2.333);
    physicalFolder.add(physicalMtl, "reflectivity", 0, 1);
    physicalFolder.add(physicalMtl, "iridescence", 0, 1);
    physicalFolder.add(physicalMtl, "iridescenceIOR", 1, 2.333);
    physicalFolder.add(physicalMtl, "sheen", 0, 1);
    physicalFolder.add(physicalMtl, "sheenRoughness", 0, 1);
    physicalFolder.addColor(physicalMtl, "sheenColor");
    physicalFolder.add(physicalMtl, "clearcoat", 0, 1).step(0.01);
    physicalFolder.add(physicalMtl, "clearcoatRoughness", 0, 1).step(0.01);
    physicalFolder.add(physicalMtl, "specularIntensity", 0, 1);
    physicalFolder.addColor(physicalMtl, "specularColor");

    const currentMaps = {
      roughnessMap: "none",
      metalnessMap: "none",
      iridescenceMap: "none",
    };

    physicalFolder
      .add(currentMaps, "roughnessMap", Object.keys(roughMapOptions))
      .onChange((value) =>
        changeProperty(physicalMtl, "roughnessMap", roughMapOptions[value])
      );
    physicalFolder
      .add(currentMaps, "metalnessMap", Object.keys(alphaMapOptions))
      .onChange((value) =>
        changeProperty(physicalMtl, "metalnessMap", alphaMapOptions[value])
      );

    physicalFolder
      .add(currentMaps, "iridescenceMap", Object.keys(alphaMapOptions))
      .onChange((value) =>
        changeProperty(physicalMtl, "iridescenceMap", alphaMapOptions[value])
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
