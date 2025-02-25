import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main() {
  // ********************** Scene Setup **********************
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setAnimationLoop(animate);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 150);
  camera.position.set(0, 1.6, 2);

  const params = new URL(document.location).searchParams;
  const allowvr = params.get("allowvr") === "true";
  if (allowvr) {
    renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(VRButton.createButton(renderer));
    document.querySelector("#vr").style.display = "none";
  } else {
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1.6, 0);
    controls.update();
    document.querySelector("#nonvr").style.display = "none";
  }

  // ********************** Lighting Setup **********************
  {
    const color = 0xffffff;
    const intensity = 3;
    const light1 = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(-1, 2, 4);
    light2.position.set(1, -2, -4);
    scene.add(light1);
    scene.add(light2);
  }

  // ********************** Materials & Objects **********************
  const loader = new THREE.TextureLoader();
  const bodyTxt = loader.load("../public/textures/robot/body_tex.jpg");
  const trnglTxt = loader.load("../public/textures/robot/triangl_tex.jpg");
  const screwTxt = loader.load("../public/textures/robot/screw_tex.jpg");
  const fingerTxt = loader.load("../public/textures/robot/finger_tex.jpg");

  const bodySingleMtl = new THREE.MeshLambertMaterial({ map: bodyTxt });
  const trnglMtl = new THREE.MeshLambertMaterial({ map: trnglTxt });
  const screwMtl = new THREE.MeshLambertMaterial({ map: screwTxt });
  const fingerSingleMtl = new THREE.MeshLambertMaterial({ map: fingerTxt });

  const blackMtl = new THREE.MeshLambertMaterial({ color: 0x181b1e });
  const whiteMtl = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const bodyMtl = [
    blackMtl,
    blackMtl,
    blackMtl,
    blackMtl,
    bodySingleMtl,
    bodySingleMtl,
  ];
  const armMtl = [screwMtl, screwMtl, blackMtl, blackMtl, trnglMtl, trnglMtl];
  const fingerMtl = [
    fingerSingleMtl,
    fingerSingleMtl,
    blackMtl,
    blackMtl,
    fingerSingleMtl,
    fingerSingleMtl,
  ];

  function marksGrid(gridSize, unitSize) {
    const dashMtl = new THREE.LineDashedMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      dashSize: unitSize,
      gapSize: unitSize,
    });

    const totalLines = gridSize / unitSize / 2;
    const initialPos = -gridSize - unitSize;
    const finalPos = gridSize + unitSize;

    for (let i = -totalLines; i <= totalLines; i++) {
      const offset = i * unitSize * 2;

      for (let isVertical = 0; isVertical < 2; isVertical++) {
        const points = [];

        if (isVertical === 0) {
          points.push(new THREE.Vector3(initialPos, 0, 0));
          points.push(new THREE.Vector3(finalPos, 0, 0));
        } else {
          points.push(new THREE.Vector3(0, 0, initialPos));
          points.push(new THREE.Vector3(0, 0, finalPos));
        }

        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineSegments(geo, dashMtl);

        if (isVertical == 0) {
          line.position.z = offset;
          line.position.x = unitSize / 2;
        } else {
          line.position.x = offset;
          line.position.z = unitSize / 2;
        }

        line.computeLineDistances();
        scene.add(line);
      }
    }
  }

  let robot = {
    left: {},
    right: {},
  };

  function addObject(x, y, z, geometry, parent, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function addPart(x, y, z, geometry, name, parent, material, side) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);

    if (side === undefined) {
      robot[name] = mesh;
    } else {
      robot[side][name] = mesh;
    }
    return mesh;
  }

  function addPivot(x, y, z, pivot, name, parent, side) {
    pivot.position.set(x, y, z);
    parent.add(pivot);
    robot[side][name] = pivot;
  }

  function buildArm(side, bodyHeight) {
    const armWidth = 0.15;
    const armHeight = 0.25;
    const armDepth = 0.1;
    const handRadius = 0.04;
    const handHeight = 0.06;
    const fingerWidth = 0.02;
    const fingerHeight = 0.08;
    const fingerDepth = 0.01;

    const prearmPivot = new THREE.Object3D();
    if (side === "left") {
      addPivot(
        0,
        bodyHeight / 2,
        0,
        prearmPivot,
        "prearmPivot",
        robot.body,
        side
      );
    } else {
      addPivot(
        bodyHeight / 2,
        0,
        0,
        prearmPivot,
        "prearmPivot",
        robot.body,
        side
      );
    }

    const prearm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(
      0,
      armHeight / 2,
      0,
      prearm,
      "prearm",
      robot[side].prearmPivot,
      armMtl,
      side
    );

    const shoulder = new THREE.Object3D();
    addPivot(
      0,
      armHeight / 2,
      0,
      shoulder,
      "shoulder",
      robot[side].prearm,
      side
    );

    const arm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(
      0,
      armHeight / 2,
      0,
      arm,
      "arm",
      robot[side].shoulder,
      armMtl,
      side
    );

    const elbow = new THREE.Object3D();
    addPivot(0, armHeight / 2, 0, elbow, "elbow", robot[side].arm, side);

    const forearm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(
      0,
      armHeight / 2,
      0,
      forearm,
      "forearm",
      robot[side].elbow,
      armMtl,
      side
    );

    const wrist = new THREE.Object3D();
    addPivot(0, armHeight / 2, 0, wrist, "wrist", robot[side].forearm, side);

    const hand = new THREE.CylinderGeometry(handRadius, handRadius, handHeight);
    addPart(
      0,
      handHeight / 2,
      0,
      hand,
      "hand",
      robot[side].wrist,
      blackMtl,
      side
    );

    const fingeJoint1 = new THREE.Object3D();
    addPivot(
      0,
      handHeight / 2,
      0.02,
      fingeJoint1,
      "fingeJoint1",
      robot[side].hand,
      side
    );

    const fingeJoint2 = new THREE.Object3D();
    addPivot(
      0,
      handHeight / 2,
      -0.02,
      fingeJoint2,
      "fingeJoint2",
      robot[side].hand,
      side
    );

    const finger = new THREE.BoxGeometry(
      fingerWidth,
      fingerHeight,
      fingerDepth
    );
    addPart(
      0,
      fingerHeight / 2,
      0,
      finger,
      "finger1",
      robot[side].fingeJoint1,
      fingerMtl,
      side
    );
    addPart(
      0,
      fingerHeight / 2,
      0,
      finger,
      "finger2",
      robot[side].fingeJoint2,
      fingerMtl,
      side
    );

    if (side === "left") {
      robot[side].prearmPivot.rotation.x = Math.PI / 12;
    } else {
      robot[side].prearmPivot.rotation.z = -Math.PI / 2;
      robot[side].prearmPivot.rotation.y = -Math.PI / 12;
    }

    robot[side].shoulder.rotation.x = Math.PI / 4;
    robot[side].elbow.rotation.x = Math.PI / 4;

    robot[side].elbow.rotation.x = Math.PI / 4;
    robot[side].elbow.rotation.x = Math.PI / 4;
  }

  function buildRobot() {
    const baseWidth = 0.5;
    const baseHeight = 0.15;
    const baseDepth = 0.8;
    const supportWidth = 0.1;
    const supportHeight = 2;
    const supportDepth = 0.1;
    const bodyWidth = 0.5;
    const bodyHeight = 0.5;
    const bodyDepth = 0.25;

    let yPos = baseHeight / 2;
    let zPos = -0.3;
    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const base = addPart(0, yPos, zPos, baseGeo, "base", scene, blackMtl);

    yPos = supportHeight / 2;
    zPos = -0.2;
    const supportGeo = new THREE.BoxGeometry(
      supportWidth,
      supportHeight,
      supportDepth
    );
    const support = addPart(
      0,
      yPos,
      zPos,
      supportGeo,
      "support",
      base,
      whiteMtl
    );

    yPos = 0.3;
    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const body = addPart(0, yPos, 0, bodyGeo, "body", support, bodyMtl);
    body.rotation.x = Math.PI / 16;

    buildArm("left", bodyHeight);
    buildArm("right", bodyHeight);

    robot.body.rotation.z = Math.PI / 4;
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

  const tableWidth = 1.8;
  const tableHeight = 1;
  const tableDepth = 0.8;

  marksGrid(20, 0.1);
  createTable(tableWidth, tableHeight, tableDepth, 0, tableHeight, 0);
  buildRobot();

  // ********************** Rendering **********************
  function rotatePrearm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].prearm.rotation.y =
      ((Math.sin(time) * Math.PI) / 4) * orientation;
  }

  function rotateShoulder(side) {
    robot[side].shoulder.rotation.x =
      (Math.sin(time) * Math.PI) / 6 + Math.PI / 4;
  }

  function rotateArm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].arm.rotation.y = ((Math.sin(time) * Math.PI) / 4) * orientation;
  }

  function rotateElbow(side) {
    robot[side].elbow.rotation.x = (Math.sin(time) * Math.PI) / 6 + Math.PI / 4;
  }

  function rotateForearm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].forearm.rotation.y =
      ((Math.sin(time) * Math.PI) / 4) * orientation;
  }

  function rotateWrist(side) {
    robot[side].wrist.rotation.x = (Math.sin(time) * Math.PI) / 6 + Math.PI / 4;
  }

  function rotateHand(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].hand.rotation.y =
      ((Math.sin(time) * Math.PI) / 4) * orientation;
  }

  function rotatePart(part, isJoint, orientation, finishAngle) {
    let axis = isJoint ? "x" : "y";
    let angle = part.rotation[axis];

    if (angle * orientation < finishAngle) {
      part.rotation[axis] += time * orientation;
      return false;
    }

    return true;
  }

  function animArm(steps) {
    let step = steps[currentStep];

    if (rotationDone == false) {
      rotationDone = rotatePart(
        step.part,
        step.isJoint,
        step.orientation * orientChange,
        step.angle
      );
    } else {
      if (currentStep < steps.length - 1) {
        currentStep += 1;
      } else {
        currentStep = 0;
        orientChange *= -1;
      }
      time = 0;
      rotationDone = false;
    }
  }

  const stepsLeft = [
    {
      part: robot.left.prearm,
      isJoint: false,
      orientation: -1,
      angle: Math.PI / 4,
    },
    {
      part: robot.left.shoulder,
      isJoint: true,
      orientation: -1,
      angle: 0,
    },
    {
      part: robot.left.elbow,
      isJoint: true,
      orientation: -1,
      angle: Math.PI / 4,
    },
    {
      part: robot.left.wrist,
      isJoint: true,
      orientation: -1,
      angle: Math.PI / 4,
    },
  ];

  const stepsRight = [
    {
      part: robot.right.prearm,
      isJoint: false,
      orientation: -1,
      angle: Math.PI / 4,
    },
    {
      part: robot.right.shoulder,
      isJoint: true,
      orientation: -1,
      angle: Math.PI / 4,
    },
    {
      part: robot.right.elbow,
      isJoint: true,
      orientation: -1,
      angle: Math.PI / 4,
    },
    {
      part: robot.right.wrist,
      isJoint: true,
      orientation: -1,
      angle: Math.PI / 4,
    },
  ];

  let currentStep = 0;
  let rotationDone = false;
  let orientChange = 1;
  let time = 0;
  let speedAnim = 0.0001;
  let speedRotation = 0.005;

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

    // Anim 2
    time += speedAnim;
    animArm(stepsLeft);
    animArm(stepsRight);

    // Anim 1
    // time += speedRotation;
    // rotatePrearm("left");
    // //rotatePrearm("right");

    // rotateShoulder("left");
    // rotateShoulder("right");

    // rotateArm("left");
    // rotateArm("right");

    // //rotateElbow("left");
    // rotateElbow("right");

    // rotateForearm("left");
    // rotateForearm("right");

    // rotateWrist("left");
    // //rotateWrist("right");

    // rotateHand("left");
    // rotateHand("right");

    renderer.render(scene, camera);
  }
}

main();
