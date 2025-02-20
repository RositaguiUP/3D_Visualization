import * as THREE from 'three';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const canvas = document.querySelector( '#c' );
const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
renderer.setAnimationLoop(animate);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 150);
camera.position.set(0, 20, 50);

const params = (new URL(document.location)).searchParams;
const allowvr = params.get('allowvr') === 'true';
if (allowvr) {
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));
  document.querySelector('#vr').style.display = 'none';
  camera.position.set(0, 20, 50);
} else {
  // no VR, add some controls
  const controls = new OrbitControls(camera, canvas);
  //controls.target.set(0, 10, 0);
  controls.target.set(0, 1.6, -2);
  controls.update();
  document.querySelector('#nonvr').style.display = 'none';
}

function setLights() {
    const color = 0xFFFFFF;
    const intensity = 3;
    const light1 = new THREE.DirectionalLight(color, intensity);
    const light2 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(-1, 2, 4);
    light2.position.set(1, -2, -4);
    scene.add(light1);
    scene.add(light2);
}

const whiteMtl = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide,
});


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
    right: {}
};

function addPart(x, y, z, geometry, name, parent, side) {
    const mesh = new THREE.Mesh(geometry, whiteMtl);
    mesh.position.set(x, y, z);
    parent.add(mesh);

    if (side === undefined) {
        robot[name] = mesh;
    } else {
        robot[side][name] = mesh;
    }
}

function addPivot(x, y, z, pivot, name, parent, side) {
    pivot.position.set(x, y, z);
    parent.add(pivot);
    robot[side][name] = pivot;
}

function buildArm(side, bodyHeight) {
    const armWidth = 7;
    const armHeight = 10;
    const armDepth = 5;
    const handWidth = 3;
    const handHeight = 5;
    const handDepth = 2;
    const fingerWidth = 1;
    const fingerHeight = 2;
    const fingerDepth = 0.4;

    const prearmPivot = new THREE.Object3D();
    if (side === "left") {
        addPivot(0, bodyHeight/2, 0, prearmPivot, "prearmPivot", robot.body, side);
    } else {
        addPivot(bodyHeight/2, 0, 0, prearmPivot, "prearmPivot", robot.body, side);
    }

    const prearm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(0, armHeight/2, 0, prearm, "prearm", robot[side].prearmPivot, side);

    const shoulder = new THREE.Object3D();
    addPivot(0, armHeight / 2, 0, shoulder, "shoulder", robot[side].prearm, side);

    const arm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(0, armHeight / 2, 0, arm, "arm", robot[side].shoulder, side);

    const elbow = new THREE.Object3D();
    addPivot(0, armHeight / 2, 0, elbow, "elbow", robot[side].arm, side);

    const forearm = new THREE.BoxGeometry(armWidth, armHeight, armDepth);
    addPart(0, armHeight / 2, 0, forearm, "forearm", robot[side].elbow, side);

    const wrist = new THREE.Object3D();
    addPivot(0, armHeight / 2, 0, wrist, "wrist", robot[side].forearm, side);

    const hand = new THREE.BoxGeometry(handWidth, handHeight, handDepth);
    addPart(0, handHeight / 2, 0, hand, "hand", robot[side].wrist, side);

    const fingeJoint1 = new THREE.Object3D();
    addPivot(0, handHeight / 2, 0.5, fingeJoint1, "fingeJoint1", robot[side].hand, side);

    const fingeJoint2 = new THREE.Object3D();
    addPivot(0, handHeight / 2, -0.5, fingeJoint2, "fingeJoint2", robot[side].hand, side);
    
    const finger = new THREE.BoxGeometry(fingerWidth, fingerHeight, fingerDepth);
    addPart(0, fingerHeight / 2, 0, finger, "finger1", robot[side].fingeJoint1, side);
    addPart(0, fingerHeight / 2, 0, finger, "finger2", robot[side].fingeJoint2, side);

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
    const bodyWidth = 20;
    const bodyHeight = 20;
    const bodyDepth = 10;

    const body = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    addPart(0, bodyHeight / 2, -20, body, "body", scene);

    buildArm("left", bodyHeight);
    buildArm("right", bodyHeight);

    robot.body.rotation.z = Math.PI / 4;
}


function rotatePart(part, isJoint, orientation, finishAngle) {
    let axis = isJoint ? "x" : "y";
    let angle = part.rotation[axis];

    if (angle*orientation < finishAngle) {
        part.rotation[axis] += time * orientation;
        console.log(time);
        return false;
    }

    return true;
}


function animArm(steps) {
    let step = steps[currentStep];
    
    if (rotationDone == false) {
        rotationDone = rotatePart(step.part, step.isJoint, step.orientation*orientChange, step.angle);
    } else {
        if (currentStep < steps.length - 1) {
            currentStep += 1;
        } else {
            currentStep = 0;
            //orientChange *= -1;
        }
        time = 0;
        rotationDone = false;
    }
}

setLights();
marksGrid(150, 2);
buildRobot();

const stepsLeft = [
    {
        part: robot.left.prearm,
        isJoint: false,
        orientation: -1,
        angle: Math.PI/4,
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
        angle: Math.PI/4,
    },
    {
        part: robot.left.wrist,
        isJoint: true,
        orientation: -1,
        angle: Math.PI/4,
    }
];

const stepsRight = [
    {
        part: robot.right.prearm,
        isJoint: false,
        orientation: -1,
        angle: Math.PI/4,
    },
    {
        part: robot.right.shoulder,
        isJoint: true,
        orientation: -1,
        angle: Math.PI/4,
    },
    {
        part: robot.right.elbow,
        isJoint: true,
        orientation: -1,
        angle: Math.PI/4,
    },
    {
        part: robot.right.wrist,
        isJoint: true,
        orientation: -1,
        angle: Math.PI/4,
    }
];

let currentStep = 0;
let rotationDone =  false;
let orientChange = 1; 
let time = 0;
let speed = 0.0001;

function resizeRendererToDisplaySize( renderer ) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if ( needResize ) {

        renderer.setSize( width, height, false );

    }

    return needResize;

}

function animate() {
    time += speed;

    if ( resizeRendererToDisplaySize( renderer ) ) {

        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

    }

    renderer.render(scene, camera);

    animArm(stepsLeft);
    //animArm(stepsRight);
    
    // rotatePrearm("left");
    // rotatePrearm("right");

    //rotateShoulder("left");
    // rotateShoulder("right");

    // rotateArm("left");
    // rotateArm("right");

    //rotateElbow("left");
    //rotateElbow("right");

    // rotateForearm("left");
    //rotateForearm("right");

    // rotateWrist("left");
    // rotateWrist("right");

    // rotateHand("left");
    // rotateHand("right");

}
