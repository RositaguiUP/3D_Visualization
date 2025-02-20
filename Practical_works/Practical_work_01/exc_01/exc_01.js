import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

function main() {
    // ********************** Scene Setup **********************
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    
    const floorOffset = 10;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 140;
    
    // ********************** Lightning Setup **********************
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light1 = new THREE.DirectionalLight(color, intensity);
        const light2 = new THREE.DirectionalLight(color, intensity);
        light1.position.set(-1, 2, 4);
        light2.position.set(1, -2, -4);
        scene.add(light1);
        scene.add(light2);
    }

    // ********************** Materials & Objects **********************
    const spread = 25;
    var objects = [];

    const whiteMtl = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide,
    });

    function addObject(x, y, z, obj) {
        obj.position.x = x * spread;
        obj.position.y = y * spread + floorOffset;
        obj.position.z = z * spread;

        scene.add(obj);
        objects.push(obj);
    }

    function addSolidGeometry(x, y, z, geometry) {
        const mesh = new THREE.Mesh(geometry, whiteMtl);
        addObject(x, y, z, mesh);
    }

    function addLineGeometry(x, y, z, geometry) {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.LineSegments(geometry, material);
        addObject(x, y, z, mesh);
    }

    function addAllPrimitives(posX, paramLevel) {
        const width = 10;
        const height = 10 + 3 * paramLevel;
        const depth = 10;

        const radius = 4 + 1 * paramLevel;
        const tubeRadius = 2;
        const radiusTop = 4 + 1 * paramLevel;
        const radiusBottom = 5;

        const widthSegments = 6 * (paramLevel + 1);
        const heightSegments = 6 * (paramLevel + 1);

        const segments = 6 * (paramLevel + 1);
        const radialSegments = 6 * (paramLevel + 1);
        const tubularSegments = 6 * (paramLevel + 1);

        const detail = 1 * paramLevel;

        const geometries = [];

        {
            var geometry = new THREE.BoxGeometry(width, height, depth);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.CircleGeometry(radius, segments);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.ConeGeometry(radius, height, radialSegments);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.CylinderGeometry(
                radiusTop, radiusBottom, height, radialSegments);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.DodecahedronGeometry(radius, detail);
            geometries.push(geometry);
        }

        {
            var shape = new THREE.Shape();
            var x = -2.5;
            var y = -5;
            shape.moveTo(x + 2.5, y + 2.5);
            shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
            shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
            shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
            shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
            shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
            shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

            const extrudeSettings = {
                steps: 2,
                depth: 1 + paramLevel,
                bevelEnabled: true,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 3 * paramLevel,

            };

            geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.IcosahedronGeometry(radius, detail);
            geometries.push(geometry);
        }

        {
            const points = [];
            for (let i = 0; i < 10; ++i) {

                points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));

            }
            const segments = 3 * (paramLevel + 1);
            const phiStart = Math.PI * 0.00;
            const phiLength = Math.PI * (1.2 + 0.4 * paramLevel);
            geometry = new THREE.LatheGeometry(
                points, segments, phiStart, phiLength);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.OctahedronGeometry(radius, detail);
            geometries.push(geometry);
        }

        {
            const slices = 3 * (paramLevel + 1);
            const stacks = 3 * (paramLevel + 1);

            // from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js
            function klein(v, u, target) {

                u *= Math.PI;
                v *= 2 * Math.PI;
                u = u * 2;

                let x;
                let z;

                if (u < Math.PI) {

                    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
                    z = - 8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);

                } else {

                    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
                    z = - 8 * Math.sin(u);

                }

                const y = - 2 * (1 - Math.cos(u) / 2) * Math.sin(v);

                target.set(x, y, z).multiplyScalar(0.75);

            }

            geometry = new ParametricGeometry(
                klein, slices, stacks);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.PlaneGeometry(
                width, height,
                widthSegments, heightSegments);
            geometries.push(geometry);
        }

        {
            const verticesOfCube = [
                - 1, - 1, - 1, 1, - 1, - 1, 1, 1, - 1, - 1, 1, - 1,
                - 1, - 1, 1, 1, - 1, 1, 1, 1, 1, - 1, 1, 1,
            ];
            const indicesOfFaces = [
                2, 1, 0, 0, 3, 2,
                0, 4, 7, 7, 3, 0,
                0, 1, 5, 5, 4, 0,
                1, 2, 6, 6, 5, 1,
                2, 3, 7, 7, 6, 2,
                4, 5, 6, 6, 7, 4,
            ];
            geometry = new THREE.PolyhedronGeometry(
                verticesOfCube, indicesOfFaces, radius, detail);
            geometries.push(geometry);
        }

        {
            const innerRadius = 2;
            const outerRadius = 7;
            geometry = new THREE.RingGeometry(
                innerRadius, outerRadius, segments);
            geometries.push(geometry);
        }


        {
            shape = new THREE.Shape();
            let x = - 2.5;
            let y = - 5;
            shape.moveTo(x + 2.5, y + 2.5);
            shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
            shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
            shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
            shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
            shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
            shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
            const curveSegments = 1 + paramLevel;
            geometry = new THREE.ShapeGeometry(shape, curveSegments);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.TetrahedronGeometry(radius, detail);
            geometries.push(geometry);
        }

        {
            geometry = new THREE.TorusGeometry(
                radius, tubeRadius,
                radialSegments, tubularSegments);
            geometries.push(geometry);
        }

        {
            const p = paramLevel + 1;
            const q = paramLevel + 2;
            geometry = new THREE.TorusKnotGeometry(radius, tubeRadius,
                tubularSegments, radialSegments, p, q);
            geometries.push(geometry);
        }

        {
            class CustomSinCurve extends THREE.Curve {
                constructor(scale) {
                    super();
                    this.scale = scale;
                }
                getPoint(t) {
                    const tx = t * 3 - 1.5;
                    const ty = Math.sin(2 * Math.PI * t);
                    const tz = 0;
                    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
                }

            }

            const path = new CustomSinCurve(4);
            const closed = false;
            geometry = new THREE.TubeGeometry(
                path, tubularSegments, radius / 2, radialSegments / 2, closed);
            geometries.push(geometry);
        }

        let nObj = 0;
        for (let posY = 4; posY >= 0; posY--) {
            for (let posZ = -2; posZ <= 2; posZ++) {
                addSolidGeometry(posX, posY, posZ, geometries[nObj]);
                nObj += 1;
            }
        }

        {
            const loader = new FontLoader();
            function loadFont(url) {
                return new Promise((resolve, reject) => {
                    loader.load(url, resolve, undefined, reject);
                });
            }

            async function doit() {
                const font = await loadFont('/Practical_work_01/public/fonts/helvetiker_regular.typeface.json');
                const geometry = new TextGeometry('three.js', {
                    font: font,
                    size: 3.0,
                    depth: paramLevel + 1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.15,
                    bevelSize: .3,
                    bevelSegments: 5,
                });
                const mesh = new THREE.Mesh(geometry, whiteMtl);
                geometry.computeBoundingBox();
                geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

                const parent = new THREE.Object3D();
                parent.add(mesh);

                addObject(posX, 1, 2, parent);
            }
            doit();

        }

        {
            const radius = 7;
            const widthSegments = 6;
            const heightSegments = 3;
            const sphereGeometry = new THREE.SphereGeometry(
                radius, widthSegments, heightSegments);
            const thresholdAngle = 20 * (paramLevel + 1);
            const geometry = new THREE.EdgesGeometry(sphereGeometry, thresholdAngle);
            addLineGeometry(posX, 0, -1, geometry);
        }

        {
            const size = 8;
            const widthSegments = 1;
            const heightSegments = 1 + paramLevel;
            const depthSegments = 1;

            const geometry = new THREE.WireframeGeometry(
                new THREE.BoxGeometry(
                    size, size, size,
                    widthSegments, heightSegments, depthSegments));
            addLineGeometry(posX, 0, 1, geometry);
        }
    }

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
    
    marksGrid(150, 2);
    addAllPrimitives(0, 1);
    addAllPrimitives(-2, 0);
    addAllPrimitives(2, 2);

    // ********************** Animation **********************
    const radius = 200;
    const speedCam = 0.002;
    const speedPrim = 0.003;
    var angle = 0;
    
    function rotatePrimitives(speed) {
        for (let i = 0; i < objects.length; i++) {
            objects[i].rotation.x += speed;
            objects[i].rotation.y += speed;
        }
    }

    function rotateCamera(radius, speed) {
        angle -= speed;
        camera.position.x = radius * Math.cos(angle);
        camera.position.z = radius * Math.sin(angle);
        camera.lookAt(0, floorOffset, 0);
    }

    function animate() {
        rotatePrimitives(speedPrim);
        rotateCamera(radius, speedCam);

        renderer.render(scene, camera);
    }
}
main();
