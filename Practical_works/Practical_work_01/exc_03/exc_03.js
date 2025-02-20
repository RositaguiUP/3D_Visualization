import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function makeInstance(scene, texture, geometry, color, x) {
  const material = new THREE.MeshBasicMaterial({
    color,
    map: texture,
    side: THREE.DoubleSide,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;
  return cube;
}

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
  camera.position.z = 5;

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window); // optional

  // ********************** Lightning Setup **********************
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // ********************** Materials & Objects **********************
  // NOT A GOOD EXAMPLE OF HOW TO MAKE A CUBE!
  // Only trying to make it clear most vertices are unique
  const vertices = [
    // front
    { pos: [   -1,   -1,  1], norm: [ 0,  0,  1], uv: [   0,   0], }, // 0
    { pos: [ -0.4,   -1,  1], norm: [ 0,  0,  1], uv: [ 0.3,   0], }, // 1
    { pos: [  0.4,   -1,  1], norm: [ 0,  0,  1], uv: [ 0.7,   0], }, // 2
    { pos: [    1,   -1,  1], norm: [ 0,  0,  1], uv: [   1,   0], }, // 3
    { pos: [   -1,    1,  1], norm: [ 0,  0,  1], uv: [   0,   1], }, // 4
    { pos: [ -0.4,    1,  1], norm: [ 0,  0,  1], uv: [ 0.3,   1], }, // 5
    { pos: [  0.4,    1,  1], norm: [ 0,  0,  1], uv: [ 0.7,   1], }, // 6
    { pos: [    1,    1,  1], norm: [ 0,  0,  1], uv: [   1,   1], }, // 7
    { pos: [ -0.4,  0.4,  1], norm: [ 0,  0,  1], uv: [ 0.3, 0.7], }, // 8
    { pos: [  0.4,  0.4,  1], norm: [ 0,  0,  1], uv: [ 0.7, 0.7], }, // 9
    { pos: [ -0.4, -0.4,  1], norm: [ 0,  0,  1], uv: [ 0.3, 0.3], }, // 10
    { pos: [  0.4, -0.4,  1], norm: [ 0,  0,  1], uv: [ 0.7, 0.3], }, // 11
    // right
    { pos: [  1,   -1,    1], norm: [ 1,  0,  0], uv: [   0,   0], }, // 12
    { pos: [  1,   -1,  0.4], norm: [ 1,  0,  0], uv: [ 0.3,   0], }, // 13
    { pos: [  1,   -1, -0.4], norm: [ 1,  0,  0], uv: [ 0.7,   0], }, // 14
    { pos: [  1,   -1,   -1], norm: [ 1,  0,  0], uv: [   1,   0], }, // 15
    { pos: [  1,    1,    1], norm: [ 1,  0,  0], uv: [   0,   1], }, // 16
    { pos: [  1,    1,  0.4], norm: [ 1,  0,  0], uv: [ 0.3,   1], }, // 17
    { pos: [  1,    1, -0.4], norm: [ 1,  0,  0], uv: [ 0.7,   1], }, // 18
    { pos: [  1,    1,   -1], norm: [ 1,  0,  0], uv: [   1,   1], }, // 19
    { pos: [  1,  0.4,  0.4], norm: [ 1,  0,  0], uv: [ 0.3, 0.7], }, // 20
    { pos: [  1,  0.4, -0.4], norm: [ 1,  0,  0], uv: [ 0.7, 0.7], }, // 21
    { pos: [  1, -0.4,  0.4], norm: [ 1,  0,  0], uv: [ 0.3, 0.3], }, // 22
    { pos: [  1, -0.4, -0.4], norm: [ 1,  0,  0], uv: [ 0.7, 0.3], }, // 23
    // back
    { pos: [    1,   -1, -1], norm: [ 0,  0,  1], uv: [   0,   0], }, // 24
    { pos: [  0.4,   -1, -1], norm: [ 0,  0,  1], uv: [ 0.3,   0], }, // 25
    { pos: [ -0.4,   -1, -1], norm: [ 0,  0,  1], uv: [ 0.7,   0], }, // 26
    { pos: [   -1,   -1, -1], norm: [ 0,  0,  1], uv: [   1,   0], }, // 27
    { pos: [    1,    1, -1], norm: [ 0,  0,  1], uv: [   0,   1], }, // 28
    { pos: [  0.4,    1, -1], norm: [ 0,  0,  1], uv: [ 0.3,   1], }, // 29
    { pos: [ -0.4,    1, -1], norm: [ 0,  0,  1], uv: [ 0.7,   1], }, // 30
    { pos: [   -1,    1, -1], norm: [ 0,  0,  1], uv: [   1,   1], }, // 31
    { pos: [  0.4,  0.4, -1], norm: [ 0,  0,  1], uv: [ 0.3, 0.7], }, // 32
    { pos: [ -0.4,  0.4, -1], norm: [ 0,  0,  1], uv: [ 0.7, 0.7], }, // 33
    { pos: [  0.4, -0.4, -1], norm: [ 0,  0,  1], uv: [ 0.3, 0.3], }, // 34
    { pos: [ -0.4, -0.4, -1], norm: [ 0,  0,  1], uv: [ 0.7, 0.3], }, // 35
    // left
    { pos: [ -1,   -1,   -1], norm: [ 1,  0,  0], uv: [   0,   0], }, // 36
    { pos: [ -1,   -1, -0.4], norm: [ 1,  0,  0], uv: [ 0.3,   0], }, // 37
    { pos: [ -1,   -1,  0.4], norm: [ 1,  0,  0], uv: [ 0.7,   0], }, // 38
    { pos: [ -1,   -1,    1], norm: [ 1,  0,  0], uv: [   1,   0], }, // 39
    { pos: [ -1,    1,   -1], norm: [ 1,  0,  0], uv: [   0,   1], }, // 40
    { pos: [ -1,    1, -0.4], norm: [ 1,  0,  0], uv: [ 0.3,   1], }, // 41
    { pos: [ -1,    1,  0.4], norm: [ 1,  0,  0], uv: [ 0.7,   1], }, // 42
    { pos: [ -1,    1,    1], norm: [ 1,  0,  0], uv: [   1,   1], }, // 43
    { pos: [ -1,  0.4, -0.4], norm: [ 1,  0,  0], uv: [ 0.3, 0.7], }, // 44
    { pos: [ -1,  0.4,  0.4], norm: [ 1,  0,  0], uv: [ 0.7, 0.7], }, // 45
    { pos: [ -1, -0.4, -0.4], norm: [ 1,  0,  0], uv: [ 0.3, 0.3], }, // 46
    { pos: [ -1, -0.4,  0.4], norm: [ 1,  0,  0], uv: [ 0.7, 0.3], }, // 47
    // top
    { pos: [    1,  1,   -1], norm: [ 0,  0,  1], uv: [   0,   0], }, // 48
    { pos: [  0.4,  1,   -1], norm: [ 0,  0,  1], uv: [ 0.3,   0], }, // 49
    { pos: [ -0.4,  1,   -1], norm: [ 0,  0,  1], uv: [ 0.7,   0], }, // 50
    { pos: [   -1,  1,   -1], norm: [ 0,  0,  1], uv: [   1,   0], }, // 51
    { pos: [    1,  1,    1], norm: [ 0,  0,  1], uv: [   0,   1], }, // 52
    { pos: [  0.4,  1,    1], norm: [ 0,  0,  1], uv: [ 0.3,   1], }, // 53
    { pos: [ -0.4,  1,    1], norm: [ 0,  0,  1], uv: [ 0.7,   1], }, // 54
    { pos: [   -1,  1,    1], norm: [ 0,  0,  1], uv: [   1,   1], }, // 55
    { pos: [  0.4,  1,  0.4], norm: [ 0,  0,  1], uv: [ 0.3, 0.7], }, // 56
    { pos: [ -0.4,  1,  0.4], norm: [ 0,  0,  1], uv: [ 0.7, 0.7], }, // 57
    { pos: [  0.4,  1, -0.4], norm: [ 0,  0,  1], uv: [ 0.3, 0.3], }, // 58
    { pos: [ -0.4,  1, -0.4], norm: [ 0,  0,  1], uv: [ 0.7, 0.3], }, // 59
    // bottom
    { pos: [    1, -1,    1], norm: [ 0,  0,  1], uv: [   0,   0], }, // 60
    { pos: [  0.4, -1,    1], norm: [ 0,  0,  1], uv: [ 0.3,   0], }, // 61
    { pos: [ -0.4, -1,    1], norm: [ 0,  0,  1], uv: [ 0.7,   0], }, // 62
    { pos: [   -1, -1,    1], norm: [ 0,  0,  1], uv: [   1,   0], }, // 63
    { pos: [    1, -1,   -1], norm: [ 0,  0,  1], uv: [   0,   1], }, // 64
    { pos: [  0.4, -1,   -1], norm: [ 0,  0,  1], uv: [ 0.3,   1], }, // 65
    { pos: [ -0.4, -1,   -1], norm: [ 0,  0,  1], uv: [ 0.7,   1], }, // 66
    { pos: [   -1, -1,   -1], norm: [ 0,  0,  1], uv: [   1,   1], }, // 67
    { pos: [  0.4, -1, -0.4], norm: [ 0,  0,  1], uv: [ 0.3, 0.7], }, // 68
    { pos: [ -0.4, -1, -0.4], norm: [ 0,  0,  1], uv: [ 0.7, 0.7], }, // 69
    { pos: [  0.4, -1,  0.4], norm: [ 0,  0,  1], uv: [ 0.3, 0.3], }, // 70
    { pos: [ -0.4, -1,  0.4], norm: [ 0,  0,  1], uv: [ 0.7, 0.3], }, // 71
  ];

  function nextIndexes(indices) {
    let newIndices = [];
    indices.forEach((item) => {
      newIndices.push(item + 12);
    });
    return newIndices
  }

  const frontIndices = [
     0,  1,  4,   4,  1,  5,  // front left
     8,  9,  5,   5,  9,  6,  // front top
     2,  3,  6,   6,  3,  7,  // front right
     1,  2, 10,  10,  2, 11, // front bottom
    ]

  const rightIndices = nextIndexes(frontIndices);
  const backIndices = nextIndexes(rightIndices);
  const leftIndices = nextIndexes(backIndices);
  const topIndices = nextIndexes(leftIndices);
  const bottomIndices = nextIndexes(topIndices);

  const allIndices = [
    ...frontIndices,
    ...rightIndices,
    ...backIndices,
    ...leftIndices,
    ...topIndices,
    ...bottomIndices,
  ];

  const numVertices = vertices.length;
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  const positions = new Float32Array(numVertices * positionNumComponents);
  const normals = new Float32Array(numVertices * normalNumComponents);
  const uvs = new Float32Array(numVertices * uvNumComponents);
  let posNdx = 0;
  let nrmNdx = 0;
  let uvNdx = 0;
  for (const vertex of vertices) {
    positions.set(vertex.pos, posNdx);
    normals.set(vertex.norm, nrmNdx);
    uvs.set(vertex.uv, uvNdx);
    posNdx += positionNumComponents;
    nrmNdx += normalNumComponents;
    uvNdx += uvNumComponents;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, positionNumComponents)
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(normals, normalNumComponents)
  );
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, uvNumComponents));
  geometry.setIndex(allIndices);

  const loader = new THREE.TextureLoader();
  const texture = loader.load("/Practical_work_01/public/images/grenouille.jpg");

  const cubes = [
    makeInstance(scene, texture, geometry, 0x00ff00, 0),
    makeInstance(scene, texture, geometry, 0xff0000, -3),
    makeInstance(scene, texture, geometry, 0x0000ff, 3),
  ];

  
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

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

main();
