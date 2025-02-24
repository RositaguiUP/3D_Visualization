import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";

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

  // ********************** Lighting Setup **********************
  {
    const light = new THREE.PointLight(0xffffff, 6);
    light.position.set(0, 3.9, -2);
    scene.add(light);
  }

  // ********************** Materials & Objects **********************

  const whiteMtl = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });

  const cornellBoxMtls = [
    new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Back face - Green
    new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Front face - Red
    whiteMtl,
    whiteMtl,
    whiteMtl,
    whiteMtl,
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
    const cylinderMtl = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
    });
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

  function createTable(width, height, depth, x, y, z, angle) {
    const baseHeight = 0.03;
    const wheelRadius = 0.04;
    const wheelHeight = 0.06;
    const legRadius = 0.03;
    const legHeight = height - legRadius - wheelRadius * 2;
    const wheelAngle = Math.Pi / 2;

    const baseGeo = new THREE.BoxGeometry(width, baseHeight, depth);
    const base = addObject(x, y, z, baseGeo, scene, whiteMtl);
    if (angle) base.rotation.y = angle;

    let posX = width / 2 - legRadius * 4;
    let posY = -(legHeight + baseHeight) / 2;

    const legGeo = new THREE.CylinderGeometry(
      legRadius,
      legRadius,
      legHeight,
      24
    );
    const leg1 = addObject(posX, posY, 0, legGeo, base, whiteMtl);
    const leg2 = addObject(-posX, posY, 0, legGeo, base, whiteMtl);

    posY = -(legHeight + legRadius)/2;

    const auxConector = new THREE.BoxGeometry(legRadius * 2, legRadius, depth);
    addObject(0, posY, 0, auxConector, leg1, whiteMtl);
    addObject(0, posY, 0, auxConector, leg2, whiteMtl);

    // posX = depth;
    // posY = -legHeight - legRadius - wheelRadius;
    // const wheelGeo = new THREE.CylinderGeometry(
    //   wheelRadius,
    //   wheelRadius,
    //   legRadius,
    //   24
    // );
    // let wheel = addObject(posX, posY, 0, wheelGeo, base, whiteMtl);
    // wheel.rotation.z = Math.PI/2;
    // addObject(-posX, legHeight, 0, wheel, base, whiteMtl, wheelAngle);
    //wheel.rotation.z = Math.PI/2;
  }

  const ambLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambLight);
  ambLight.visible = true;

  function createRoom() {
    const width = 8;
    const height = 4;
    const depth = 10;
    const roomGeo = new THREE.BoxGeometry(width, height, depth);
    addObject(0, height / 2, 0, roomGeo, scene, cornellBoxMtls);

    const tableWidth = 1.8;
    const tableHeight = 1;
    const tableDepth = 0.8;

    const spaceBeetween = 0.02;

    let x = (tableWidth + spaceBeetween) / 2;
    const y = tableHeight;
    let z = -tableWidth * 1.5 - tableDepth / 2 - spaceBeetween * 2;

    createTable(tableWidth, tableHeight, tableDepth, x, y, z);
    createTable(tableWidth, tableHeight, tableDepth, -x, y, z);

    x = tableWidth - (tableDepth - spaceBeetween) / 2;
    z = tableWidth + spaceBeetween;
    let angle = Math.PI / 2;

    createTable(tableWidth, tableHeight, tableDepth, -x, y, z, angle);
    createTable(tableWidth, tableHeight, tableDepth, -x, y, -z, angle);
    createTable(tableWidth, tableHeight, tableDepth, -x, y, 0, angle);

    createTable(tableWidth, tableHeight, tableDepth, x, y, z, -angle);
    createTable(tableWidth, tableHeight, tableDepth, x, y, -z, -angle);
    createTable(tableWidth, tableHeight, tableDepth, x, y, 0, -angle);
  }

  createRoom();
  createObjectsInTable();

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
