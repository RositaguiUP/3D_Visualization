import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
camera.position.y = 20;
camera.position.z = 50;

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

    if (side === "left") {
        robot[side].prearmPivot.rotation.x = Math.PI / 12;
    } else {
        robot[side].prearmPivot.rotation.z = -Math.PI / 2;
        robot[side].prearmPivot.rotation.y = -Math.PI / 12;
    }

    robot[side].shoulder.rotation.x = Math.PI / 4;
    robot[side].elbow.rotation.x = Math.PI / 4;
}

function buildRobot() {
    const bodyWidth = 20;
    const bodyHeight = 20;
    const bodyDepth = 10;

    const body = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    addPart(0, bodyHeight / 2, 0, body, "body", scene);

    buildArm("left", bodyHeight);
    buildArm("right", bodyHeight);

    robot.body.rotation.z = Math.PI / 4;
}

function rotatePrearm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].prearm.rotation.y = Math.sin(time) * Math.PI / 4 * orientation;
}

function rotateShoulder(side) {
    robot[side].shoulder.rotation.x = (Math.sin(time) * Math.PI / 6) + Math.PI / 4;
}

function rotateArm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].arm.rotation.y = Math.sin(time) * Math.PI / 4 * orientation;
}

function rotateElbow(side) {
    robot[side].elbow.rotation.x = (Math.sin(time) * Math.PI / 6) + Math.PI / 4;
}

function rotateForearm(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].forearm.rotation.y = Math.sin(time) * Math.PI / 4 * orientation;
}

function rotateWrist(side) {
    robot[side].wrist.rotation.x = (Math.sin(time) * Math.PI / 6) + Math.PI / 4;
}

function rotateHand(side) {
    let orientation = side === "left" ? 1 : -1;
    robot[side].hand.rotation.y = Math.sin(time) * Math.PI / 4 * orientation;
}

setLights();
marksGrid(150, 2);
buildRobot();

let time = 0;
let speed = 0.005;

function animate() {
    time += speed;
    renderer.render(scene, camera);
    controls.update();
    rotatePrearm("left");
    rotatePrearm("right");

    // rotateShoulder("left");
    // rotateShoulder("right");

    // rotateArm("left");
    // rotateArm("right");

    //rotateElbow("left");
    //rotateElbow("right");

    // rotateForearm("left");
    // rotateForearm("right");

    // rotateWrist("left");
    // rotateWrist("right");

    //rotateHand("left");
    //rotateHand("right");
}
