import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
  {
    const light = new THREE.PointLight(0xffffff, 6);
    light.position.set(0, 3.9, -2);
    scene.add(light);
  }

  // ********************** Materials & Objects **********************

  const blackMtl = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const whiteMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const whiteWallMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Back face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Front face - Red
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
