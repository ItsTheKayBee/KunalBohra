
let scene, camera, renderer, stars, starGeo, flyCont, earth, jupiter, neptune, pluto;
let mars, marsGeom;
let rotationSpeed = 0.05;
y_axis = new THREE.Vector3(0, 1, 0);
var clock = new THREE.Clock();
Physijs.scripts.worker = "js/physijs_worker.js";


function scenes() {
    scene = new Physijs.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00000025);
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function cam() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0,200, 420);
    camera.lookAt(scene.position);
}

function lights() {
    hlight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(hlight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    light = new THREE.PointLight(0xc4c4c4, 3);
    light.position.set(0, 300, 500);
    scene.add(light);

    // light2 = new THREE.PointLight(0xc4c4c4, 100);
    // light2.position.set(-10, 20, 100);
    // scene.add(light2);

    // light3 = new THREE.PointLight(0xc4c4c4, 10);
    // light3.position.set(0, 100, -500);
    // scene.add(light3);

    // light4 = new THREE.PointLight(0xc4c4c4, 10);
    // light4.position.set(-500, 300, 500);
    // scene.add(light4);
}


function fly() {
    flyCont = new THREE.FlyControls(camera, renderer.domElement);
    flyCont.domElement = renderer.domElement;
    flyCont.rollSpeed = Math.PI / 24;
    flyCont.autoForward = false;
    flyCont.dragToLook = true;
    flyCont = new THREE.FirstPersonControls(camera, renderer.domElement);
    flyCont.lookSpeed = 0.5;
    flyCont.movementSpeed = 1;
    flyCont.lookAt(-100, 20, 40);
}


function rend() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function starAdd() {
    starGeo = new THREE.Geometry();

    for (let i = 0; i < 6000; i++) {
        star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );
        star.velocity = 0;
        star.acceleration = 0.02;
        starGeo.vertices.push(star);
    }

    let sprite = new THREE.TextureLoader().load('images/star.png');
    let starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);
}

function orbCont() {
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', renderer);
}

function loadModels() {

    let loader = new THREE.GLTFLoader();
    loader.load('models3d/spaceship/scene.gltf', function (gltf) {
        // console.log(gltf);
        rocket = gltf.scene.children[0];
        rocket.scale.set(0.005, 0.005, 0.005);
        rocket.position.set(0, 0, 0);
        // rocket.add(camera);
        goal = new THREE.Object3D;
        // goal.position.set(0,10, 0);
        rocket.add(goal);
        scene.add(gltf.scene);
    });
    loader.load('models3d/earth/scene.gltf', function (gltf) {
        console.log(gltf);
        earth = gltf.scene.children[0];
        earth.scale.set(0.2, 0.2, 0.2);
        earth.position.set(-100, 0, 200);
        // earth.rotation.z = Math.PI / 2;
        scene.add(gltf.scene);
    });

    loader.load('models3d/jupiter/scene.gltf', function (gltf) {
        // console.log(gltf);
        jupiter = gltf.scene.children[0];
        jupiter.scale.set(20, 20, 20);
        jupiter.position.set(200, 0, -100);
        // jupiter.rotation.y = Math.PI / 180;
        scene.add(gltf.scene);
    });
    loader.load('models3d/pluto/scene.gltf', function (gltf) {
        // console.log(gltf);
        pluto = gltf.scene.children[0];
        pluto.scale.set(10, 10, 10);
        pluto.position.set(-102, 0, -100);
        // pluto.rotation.z = Math.PI / 2;
        scene.add(gltf.scene);
    });

    loader.load('models3d/neptune/scene.gltf', function (gltf) {
        // console.log(gltf);
        neptune = gltf.scene.children[0];
        neptune.scale.set(10, 10, 10);
        neptune.position.set(200, 0, 200);
        // neptune.rotation.z = Math.PI / 2;
        scene.add(gltf.scene);
    });
}

function init() {
    rend();
    scenes();
    // loadModels();
    loadMars();
    cam();
    orbCont();
    // fly();
    lights();
    starAdd();
    animate();
}

init();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function distance() {
    // cameraDist = camera.position.length();

    // dMoonVec.subVectors(camera.position, meshMoon.position);
    // dMoon = dMoonVec.length();

}

function rotatePlanets() {
    if (earth != undefined)
        earth.rotation.z += rotationSpeed * delta;
    if (jupiter != undefined)
        jupiter.rotation.z += rotationSpeed * delta;
    if (neptune != undefined)
        neptune.rotation.z += rotationSpeed * delta;
    if (pluto != undefined)
        pluto.rotation.z += rotationSpeed * delta;
}

function animate() {
    // starGen();
    delta = clock.getDelta();
    rotatePlanets();

    // distance();

    // flyCont.update(delta);
    renderer.clear();
    scene.simulate();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


function starGen() {
    starGeo.vertices.forEach(p => {
        p.velocity += p.acceleration
        p.z += p.velocity;

        if (p.z > 200) {
            p.z = -200;
            p.velocity = 0;
        }
    });
    starGeo.verticesNeedUpdate = true;
}


function moveFront() {
    rocket.translateX(2);
    var temp = new THREE.Vector3;
    temp.setFromMatrixPosition(goal.matrixWorld);

    camera.position.lerp(temp, 0.4);
    camera.lookAt(rocket.position);
}
function moveLeft() {
    rot = new THREE.Quaternion().setFromAxisAngle(y_axis, 0.1);
    curr = rocket.quaternion;
    curr.multiplyQuaternions(rot, curr);
}
function moveRight() {
    rot = new THREE.Quaternion().setFromAxisAngle(y_axis, -0.1);
    curr = rocket.quaternion;
    curr.multiplyQuaternions(rot, curr);
}


document.addEventListener("keydown", function (event) {
    var code = event.which || event.keyCode;
    switch (code) {
        case 38:
            moveFront();
            break;
        case 37:
            moveLeft();
            break;
        case 39:
            moveRight();
            break;
    }
})


function loadMars() {
    marsGeom = new THREE.SphereGeometry(650, 17, 17);
    buildTerrain(marsGeom);
    var marsTexture = new THREE.TextureLoader().load('textures/mars_texture.jpg');
    var marsMaterial = new Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ map: marsTexture }),
        0.8,
        0.3
    );
    // var marsMaterial = new THREE.MeshLambertMaterial({ map: marsTexture });
    mars = new Physijs.SphereMesh(marsGeom, marsMaterial, 0);
    mars.receiveShadow = true;
    mars.position.y = -400;
    scene.add(mars);
}

function buildTerrain(marsGeom) {
    for (var i = 0; i < marsGeom.vertices.length; i++) {
        var vertex = marsGeom.vertices[i];
        value = noise.simplex2(vertex.x / 100, vertex.y / 100);
        vertex.z += Math.abs(value)*70 ;
    }
    marsGeom.computeFaceNormals();
    marsGeom.computeVertexNormals();
}