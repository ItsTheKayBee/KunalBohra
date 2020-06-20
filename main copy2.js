let scene, camera, renderer, stars, starGeo;
let mars, marsGeom, rover, light, chassis;
let whl1, whl2, whl3, whl4, whl5, whl6;
// let rotationSpeed = 0.05;
// y_axis = new THREE.Vector3(0, 1, 0);
zero_vector = new THREE.Vector3(0, 0, 0);
var clock = new THREE.Clock();
var marsRadius = 1000;
var actions = {};
let wheelMeshes = [];
var DISABLE_DEACTIVATION = 4;
var keysActions = {
    "ArrowUp": 'acceleration',
    "ArrowDown": 'braking',
    "ArrowLeft": 'left',
    "ArrowRight": 'right'
};

//physics vars
var gravityConstant = -9.8;
var physicsWorld;
var margin = 0.05;
var transformAux1;
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var dynamicObjects = [];

/* //heightfield params
var terrainWidthExtents = 100;
var terrainDepthExtents = 100;
var terrainWidth = 128;
var terrainDepth = 128;
var terrainHalfWidth = terrainWidth / 2;
var terrainHalfDepth = terrainDepth / 2;
var terrainMaxHeight = 8;
var terrainMinHeight = - 2; */


Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;
    init();
    animate();
});

function initPhysics() {
    // Physics configuration
    collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    broadphase = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    transformAux1 = new Ammo.btTransform();
}

function scenes() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.00025);
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function cam() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-30, 1100, 90);
    camera.lookAt(scene.position);
}

function lights() {
    //ambient light
    hlight = new THREE.AmbientLight(0xffffff, 4);
    scene.add(hlight);

    //directional light
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
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
    //config graphics
    rend();
    scenes();
    cam();
    lights();
    // orbCont();

    //setting listeners
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    //setting physics
    initPhysics();

    //adding objects
    loadMars();
    addRover();
}


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

function animate() {
    var dt = clock.getDelta();
    updatePhysics(dt);
    moveRover();
    // rotateWheels(1);
    if (chassis)
        camera.lookAt(chassis.position);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
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

function moveCam() {
    if (chassis) {
        camera.position.copy(chassis.mesh.position).add(new THREE.Vector3(40, 25, 40));
        camera.lookAt(chassis.mesh.position);

        light.target.position.copy(chassis.mesh.position);
        light.position.addVectors(light.target.position, new THREE.Vector3(20, 20, -15));
    }
}

function moveRover() {
    var steeringIncrement = .04;
    var steeringClamp = .5;
    var maxEngineForce = 200000;
    var maxBreakingForce = 100;
    var engineForce = 0;
    var vehicleSteering = 0;
    var breakingForce = 0;
    var FRONT_LEFT = 0;
    var FRONT_RIGHT = 1;
    var MIDDLE_LEFT = 2;
    var MIDDLE_RIGHT = 3;
    var BACK_LEFT = 4;
    var BACK_RIGHT = 5;

    if (rover) {
        var speed = rover.getCurrentSpeedKmHour();
        console.log(speed);

        breakingForce = 0;
        engineForce = 0;

        if (actions.acceleration) {
            if (speed < -1)
                breakingForce = maxBreakingForce;
            else engineForce = maxEngineForce;
        }
        if (actions.braking) {
            if (speed > 1)
                breakingForce = maxBreakingForce;
            else engineForce = -maxEngineForce / 2;
        }
        if (actions.left) {
            if (vehicleSteering < steeringClamp)
                vehicleSteering += steeringIncrement;
        }
        else {
            if (actions.right) {
                if (vehicleSteering > -steeringClamp)
                    vehicleSteering -= steeringIncrement;
            }
            else {
                if (vehicleSteering < -steeringIncrement)
                    vehicleSteering += steeringIncrement;
                else {
                    if (vehicleSteering > steeringIncrement)
                        vehicleSteering -= steeringIncrement;
                    else {
                        vehicleSteering = 0;
                    }
                }
            }
        }
        console.log(engineForce);

        rover.applyEngineForce(engineForce, MIDDLE_LEFT);
        rover.applyEngineForce(engineForce, MIDDLE_RIGHT);
        rover.applyEngineForce(engineForce, BACK_LEFT);
        rover.applyEngineForce(engineForce, BACK_RIGHT);

        rover.setBrake(breakingForce / 2, FRONT_LEFT);
        rover.setBrake(breakingForce / 2, FRONT_RIGHT);
        rover.setBrake(breakingForce, MIDDLE_LEFT);
        rover.setBrake(breakingForce, MIDDLE_RIGHT);
        rover.setBrake(breakingForce, BACK_LEFT);
        rover.setBrake(breakingForce, BACK_RIGHT);

        rover.setSteeringValue(vehicleSteering, FRONT_LEFT);
        rover.setSteeringValue(vehicleSteering, FRONT_RIGHT);

        var tm, p, q, i;
        var n = rover.getNumWheels();
        for (i = 0; i < n; i++) {
            rover.updateWheelTransform(i, true);
            tm = rover.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            wheelMeshes[i].position.set(p.x(), p.y(), p.z());
            wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
        }

        tm = rover.getChassisWorldTransform();
        p = tm.getOrigin();
        console.log(p.x());
        q = tm.getRotation();
        chassis.position.set(p.x(), p.y(), p.z());
        chassis.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
}

function keyup(e) {
    if (keysActions[e.code]) {
        actions[keysActions[e.code]] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}
function keydown(e) {
    if (keysActions[e.code]) {
        actions[keysActions[e.code]] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

//loads the plain
function loadMars() {
    //three
    marsGeom = new THREE.SphereGeometry(marsRadius, 18, 18);
    // buildTerrain();
    var marsTexture = new THREE.TextureLoader().load('textures/mars_texture.jpg');
    var marsMaterial = new THREE.MeshBasicMaterial({ map: marsTexture });
    mars = new THREE.Mesh(marsGeom, marsMaterial);
    mars.receiveShadow = true;
    scene.add(mars);

    //ammo
    var marsShape = new Ammo.btSphereShape(marsRadius);
    marsShape.setMargin(margin);
    var groundMass = 0;
    var groundLocalInertia = new Ammo.btVector3(0, 0, 0);
    marsShape.calculateLocalInertia(groundMass, groundLocalInertia);
    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, 0, 0));
    groundTransform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    var groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
    var groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, marsShape, groundLocalInertia));
    physicsWorld.addRigidBody(groundBody);
}

//creates noisy terrain
function buildTerrain() {
    for (var i = 0; i < marsGeom.vertices.length; i++) {
        var vertex = marsGeom.vertices[i];
        value = noise.simplex2(vertex.x / 100, vertex.y / 100);
        vertex.z += Math.abs(value) * 55;
    }
    marsGeom.computeFaceNormals();
    marsGeom.computeVertexNormals();
}

//returns a wheel
function createWheel() {
    var sphGeo = new THREE.CylinderGeometry(2.5, 2.5, 2, 24, 1);
    sphGeo.rotateZ(Math.PI / 2);
    var sphmat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/metal.jpg') });
    var sph = new THREE.Mesh(sphGeo, sphmat);
    sph.castShadow = sph.receiveShadow = true;
    sph.add(innerWheel());
    scene.add(sph);
    return sph;
}

//inner wheel 
function innerWheel() {
    var sphGeo = new THREE.TorusGeometry(0.2, 1, 16, 100);
    var sphmat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    var sph = new THREE.Mesh(sphGeo, sphmat);
    sph.castShadow = sph.receiveShadow = true;
    var shape = new Ammo.btCylinderShape(0.2, 0.5, 0.2);
    shape.setMargin(margin);
    wheel = createModels(sph, shape, null, null, 0);
    return sph;
}

function createModels(object, shape, pos, quat, mass) {
    var localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    if (pos == null && quat == null) {
        pos = { x: 0, y: 0, z: 0 };
        quat = { x: 0, y: 0, z: 0, w: 1 };
    }
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    object.userData.physicsBody = body;
    // body.setActivationState(DISABLE_DEACTIVATION);
    physicsWorld.addRigidBody(body);
    // if (mass > 0) {
    //     dynamicObjects.push(object);
    // }
    return body;
}

//add rover to scene
function addRover() {

    var friction = 1000;
    var suspensionStiffness = 20.0;
    var suspensionDamping = 2.3;
    var suspensionCompression = 4.4;
    var suspensionRestLength = 0.6;
    var rollInfluence = 0.2;

    //chassis mesh
    var boxGeo = new THREE.BoxBufferGeometry(30, 4, 18);
    var boxMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/gold.jpg') });
    chassis = new THREE.Mesh(boxGeo, boxMat);
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(15, 2, 9));
    shape.setMargin(margin);
    chassis.castShadow = chassis.receiveShadow = true;

    //create rigid body
    var mass = 27000;
    var pos = { x: 100, y: marsRadius + 5, z: 10 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    body = createModels(chassis, shape, pos, quat, mass);

    //add solar panel
    chassis.add(addPanel());

    //create raycast vehicle
    var tuning = new Ammo.btVehicleTuning();
    var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
    rover = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    rover.setCoordinateSystem(0, 1, 2);
    physicsWorld.addAction(rover);

    let wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    let wheelAxleCS = new Ammo.btVector3(0, 0, -1);
    var FRONT_LEFT = 0;
    var FRONT_RIGHT = 1;
    var MIDDLE_LEFT = 2;
    var MIDDLE_RIGHT = 3;
    var BACK_LEFT = 4;
    var BACK_RIGHT = 5;

    function addWheel(isFront, pos, radius, index) {

        var wheelInfo = rover.addWheel(
            pos,
            wheelDirectionCS0,
            wheelAxleCS,
            suspensionRestLength,
            radius,
            tuning,
            isFront);

        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
        wheelInfo.set_m_frictionSlip(friction);
        wheelInfo.set_m_rollInfluence(rollInfluence);
        wheelMeshes[index] = createWheel();
    }

    addWheel(true, new Ammo.btVector3(-10, -2.5, 10), 2.5, FRONT_LEFT);
    addWheel(true, new Ammo.btVector3(-10, -2.5, -10), 2.5, FRONT_RIGHT);
    addWheel(false, new Ammo.btVector3(0, -2.5, 10), 2.5, MIDDLE_LEFT);
    addWheel(false, new Ammo.btVector3(0, -2.5, -10), 2.5, MIDDLE_RIGHT);
    addWheel(false, new Ammo.btVector3(10, -2.5, 10), 2.5, BACK_LEFT);
    addWheel(false, new Ammo.btVector3(10, -2.5, -10), 2.5, BACK_RIGHT);
    scene.add(chassis);
}

//solar panel
function addPanel() {
    var boxGeo = new THREE.BoxGeometry(20, 0.5, 15);
    var boxMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/solar_panel.jpg') });
    var panel = new THREE.Mesh(boxGeo, boxMat);
    panel.rotation.x = Math.PI / 4;
    panel.position.z += 2.5;
    panel.position.y += 8;
    return panel;
}

//to rotate wheels
function rotateWheels(dir) {
    whl1.rotation.y += dir * 0.2;
    whl2.rotation.y += dir * 0.2;
    whl3.rotation.y += dir * 0.2;
    whl4.rotation.y += dir * 0.2;
    whl5.rotation.y += dir * 0.2;
    whl6.rotation.y += dir * 0.2;
}


function updatePhysics(deltaTime) {
    physicsWorld.stepSimulation(deltaTime, 10);
    // for (let i = 0; i < dynamicObjects.length; i++) {
    //     let objThree = dynamicObjects[i];
    //     let objAmmo = objThree.userData.physicsBody;
    //     let ms = objAmmo.getMotionState();
    //     if (ms) {
    //         ms.getWorldTransform(transformAux1);
    //         var position = transformAux1.getOrigin();
    //         var quaternion = transformAux1.getRotation();
    //         objThree.position.set(position.x(), position.y(), position.z());
    //         objThree.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
    //     }
    // }
}