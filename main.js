
let scene, camera, renderer, stars, starGeo;
scene = new THREE.Scene();

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// scene.background = new THREE.Color(0xdddddd);

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 10;
camera.lookAt(0, 0, 0);
var camhelper = new THREE.CameraHelper(camera);
scene.add(camhelper);

hlight = new THREE.AmbientLight(0xffffff, 6);
scene.add(hlight);

directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

light = new THREE.PointLight(0xc4c4c4, 5);
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

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', renderer);

let loader = new THREE.GLTFLoader();
loader.load('models3d/spaceship/scene.gltf', function (gltf) {
    console.log(gltf);
    rocket = gltf.scene.children[0];
    rocket.scale.set(0.005, 0.005, 0.005);
    rocket.position.set(-100, 0, 0);
    rocket.rotation.z = Math.PI / 2;
    scene.add(gltf.scene);
});
loader.load('models3d/earth/scene.gltf', function (gltf) {
    console.log(gltf);
    earth = gltf.scene.children[0];
    earth.scale.set(0.03, 0.03, 0.03);
    earth.position.set(-100, 0, 200);
    // earth.rotation.z = Math.PI / 2;
    scene.add(gltf.scene);
});
loader.load('models3d/jupiter/scene.gltf', function (gltf) {
    console.log(gltf);
    jupiter = gltf.scene.children[0];
    jupiter.scale.set(20, 20, 20);
    jupiter.position.set(200, 0, -100);
    // jupiter.rotation.z = Math.PI / 2;
    scene.add(gltf.scene);
});
loader.load('models3d/pluto/scene.gltf', function (gltf) {
    console.log(gltf);
    pluto = gltf.scene.children[0];
    pluto.scale.set(10, 10, 10);
    pluto.position.set(-102, 0,-100);
    // pluto.rotation.z = Math.PI / 2;
    scene.add(gltf.scene);
});

loader.load('models3d/neptune/scene.gltf', function (gltf) {
    console.log(gltf);
    neptune = gltf.scene.children[0];
    neptune.scale.set(10, 10, 10);
    neptune.position.set(200, 0, 200);
    // neptune.rotation.z = Math.PI / 2;
    scene.add(gltf.scene);
});


animate();
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    // starGen();

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
