Ammo().then(function (Ammo) {

	// - Global variables -
	var DISABLE_DEACTIVATION = 4;
	var TRANSFORM_AUX = new Ammo.btTransform();
	var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
	var marsRadius = 1000;
	var chassisMesh;

	// Graphics variables
	var camera, controls, scene, renderer;
	var clock = new THREE.Clock();

	// Physics variables
	var collisionConfiguration;
	var dispatcher;
	var broadphase;
	var solver;
	var physicsWorld;
	var syncList = [];
	var margin = 0.05;

	// Keybord actions
	var actions = {};
	var keysActions = {
		"ArrowUp": 'acceleration',
		"ArrowDown": 'braking',
		"ArrowLeft": 'left',
		"ArrowRight": 'right'
	};

	function scenes() {
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0xffffff, 0.00025);
		var axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);
	}

	function cam() {
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.set(10, 10, 10);
		camera.lookAt(scene.position);
	}

	function lights() {
		//ambient light
		hlight = new THREE.AmbientLight(0xffffff, 1);
		scene.add(hlight);

		//directional light
		directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(100, 1010, 10);
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		//hemisphere light
		var hemilight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
		scene.add(hemilight);

		var spotLight = new THREE.SpotLight(0xffffff);
		spotLight.position.set(90, 1010, 10);

		spotLight.castShadow = true;

		spotLight.shadow.mapSize.width = 1024;
		spotLight.shadow.mapSize.height = 1024;

		spotLight.shadow.camera.near = 500;
		spotLight.shadow.camera.far = 4000;
		spotLight.shadow.camera.fov = 30;

		scene.add(spotLight);

		var plight = new THREE.PointLight(0xff0000, 1, 0);
		plight.position.set(20, 20, 20);
		scene.add(plight);
	}


	function rend() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
	}

	function initGraphics() {
		//config graphics
		rend();
		scenes();
		cam();
		lights();
		// orbCont();
		controls = new THREE.OrbitControls(camera, renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('keydown', keydown);
		window.addEventListener('keyup', keyup);
	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function initPhysics() {

		// Physics configuration
		collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
		broadphase = new Ammo.btDbvtBroadphase();
		solver = new Ammo.btSequentialImpulseConstraintSolver();
		physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
		physicsWorld.setGravity(new Ammo.btVector3(0, -5.8, 0));
	}

	function animate() {
		requestAnimationFrame(animate);
		var dt = clock.getDelta();
		for (var i = 0; i < syncList.length; i++)
			syncList[i](dt);
		physicsWorld.stepSimulation(dt, 10);
		if (chassisMesh)
			camera.lookAt(chassisMesh.position);
		controls.update(dt);
		renderer.render(scene, camera);
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

	function createBox(mesh, pos, quat, w, l, h, mass, friction) {
		var shape = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));

		if (!mass) mass = 0;
		if (!friction) friction = 1;

		mesh.position.copy(pos);
		mesh.quaternion.copy(quat);
		scene.add(mesh);

		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
		transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		var motionState = new Ammo.btDefaultMotionState(transform);

		var localInertia = new Ammo.btVector3(0, 0, 0);
		shape.calculateLocalInertia(mass, localInertia);

		var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		var body = new Ammo.btRigidBody(rbInfo);

		body.setFriction(friction);

		physicsWorld.addRigidBody(body);

		if (mass > 0) {
			body.setActivationState(DISABLE_DEACTIVATION);
			// Sync physics and graphics
			function sync(dt) {
				var ms = body.getMotionState();
				if (ms) {
					ms.getWorldTransform(TRANSFORM_AUX);
					var p = TRANSFORM_AUX.getOrigin();
					var q = TRANSFORM_AUX.getRotation();
					mesh.position.set(p.x(), p.y(), p.z());
					mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
				}
			}

			syncList.push(sync);
		}
	}

	function createWheelMesh(radius, width) {
		var t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
		t.rotateZ(Math.PI / 2);
		var sphmat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/metal.jpg') });
		var mesh = new THREE.Mesh(t, sphmat);
		// var boxMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/gold.jpg') });
		// mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1), boxMat));
		scene.add(mesh);
		return mesh;
	}

	function createChassisMesh(w, l, h) {
		var shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
		var boxMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/gold.jpg') });
		var mesh = new THREE.Mesh(shape, boxMat);
		scene.add(mesh);
		return mesh;
	}

	//loads the plain
	function loadMars() {
		//three
		marsGeom = new THREE.SphereGeometry(marsRadius, 32, 32);
		buildTerrain();
		var marsMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
		mars = new THREE.Mesh(marsGeom, marsMaterial);
		mars.receiveShadow = mars.castShadow = true;
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
		groundBody.setFriction(1);
		physicsWorld.addRigidBody(groundBody);
	}


	//creates noisy terrain
	function buildTerrain() {
		for (var i = 0; i < marsGeom.vertices.length; i++) {
			var vertex = marsGeom.vertices[i];
			value = noise.simplex2(vertex.x / 100, vertex.y / 100);
			vertex.z += Math.abs(value) * 75;
		}
		marsGeom.computeFaceNormals();
		marsGeom.computeVertexNormals();
	}

	function createVehicle(pos, quat) {

		// Vehicle contants

		var chassisWidth = 2.5;
		var chassisHeight = .4;
		var chassisLength = 4;
		var massVehicle = 800;

		var wheelAxisPositionBack = -1.2;
		var wheelRadiusBack = .35;
		var wheelWidthBack = .3;
		var wheelHalfTrackBack = 1.4;
		var wheelAxisHeightBack = .3;

		var wheelAxisFrontPosition = 1.2;
		var wheelHalfTrackFront = 1.4;
		var wheelAxisHeightFront = .3;
		var wheelRadiusFront = .35;
		var wheelWidthFront = .2;

		var friction = 1000;
		var suspensionStiffness = 20.0;
		var suspensionDamping = 2.3;
		var suspensionCompression = 4.4;
		var suspensionRestLength = 0.6;
		var rollInfluence = 0.2;

		var steeringIncrement = .04;
		var steeringClamp = .5;
		var maxEngineForce = 500;
		var maxBreakingForce = 100;

		// Chassis
		var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
		var transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
		transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		var motionState = new Ammo.btDefaultMotionState(transform);
		var localInertia = new Ammo.btVector3(0, 0, 0);
		geometry.calculateLocalInertia(massVehicle, localInertia);
		var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
		body.setActivationState(4);
		physicsWorld.addRigidBody(body);
		chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

		//solar panel
		chassisMesh.add(addPanel());

		// Raycast Vehicle
		var engineForce = 0;
		var vehicleSteering = 0;
		var breakingForce = 0;
		var tuning = new Ammo.btVehicleTuning();
		var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
		var vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
		vehicle.setCoordinateSystem(0, 1, 2);
		physicsWorld.addAction(vehicle);

		// Wheels
		var FRONT_LEFT = 0;
		var FRONT_RIGHT = 1;
		var BACK_LEFT = 2;
		var BACK_RIGHT = 3;
		var wheelMeshes = [];
		var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
		var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

		function addWheel(isFront, pos, radius, width, index) {

			var wheelInfo = vehicle.addWheel(
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

			wheelMeshes[index] = createWheelMesh(radius, width);
		}

		addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
		addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
		addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
		addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

		// Sync keybord actions and physics and graphics
		function sync(dt) {

			var speed = vehicle.getCurrentSpeedKmHour();
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

			vehicle.applyEngineForce(engineForce, BACK_LEFT);
			vehicle.applyEngineForce(engineForce, BACK_RIGHT);

			vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
			vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
			vehicle.setBrake(breakingForce, BACK_LEFT);
			vehicle.setBrake(breakingForce, BACK_RIGHT);

			vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
			vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

			var tm, p, q, i;
			var n = vehicle.getNumWheels();
			for (i = 0; i < n; i++) {
				vehicle.updateWheelTransform(i, true);
				tm = vehicle.getWheelTransformWS(i);
				p = tm.getOrigin();
				q = tm.getRotation();
				wheelMeshes[i].position.set(p.x(), p.y(), p.z());
				wheelMeshes[i].quaternion.set(q.x(), q.y(), q.z(), q.w());
			}

			tm = vehicle.getChassisWorldTransform();
			p = tm.getOrigin();
			q = tm.getRotation();
			chassisMesh.position.set(p.x(), p.y(), p.z());
			chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}

		syncList.push(sync);
	}

	//solar panel
	function addPanel() {
		var boxGeo = new THREE.BoxGeometry(3, 0.01, 1.8);
		var boxMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/solar_panel.jpg') });
		var panel = new THREE.Mesh(boxGeo, boxMat);
		panel.rotation.x = Math.PI / 2;
		panel.rotation.z = Math.PI / 2;
		panel.rotation.y = Math.PI / 4;
		panel.position.x += 0.5;
		panel.position.y += 0.8;
		return panel;
	}

	function modelsLoader() {
		let loader = new THREE.GLTFLoader();
		/* loader.load('models3d/spaceship/scene.gltf', function (gltf) {
			// console.log(gltf);
			rocket = gltf.scene.children[0];
			rocket.scale.set(0.05, 0.05, 0.05);
			pos = { x: 100, y: 1400, z: 10 };
			quat = { x: 0, y: 0, z: 0, w: 1 };
			createBox(gltf.scene, pos, quat, 100, 200, 50, 200000, 1);
		}); */
	}

	function flag() {
		var steelMaterial = new THREE.MeshPhongMaterial({
			flatShading: true,
			color: 0x858482,
			specular: 0xffffff,
			shininess: 100,
		});
		var pole = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0.2, 10, 10), steelMaterial);
		var top = new THREE.Mesh(new THREE.SphereBufferGeometry(0.4, 10, 10), steelMaterial);
		top.position.y = 5;
		pole.add(top);
		var loader = new THREE.TextureLoader();
		var clothTexture = loader.load('textures/indian_flag.jpg');
		var clothMaterial = new THREE.MeshBasicMaterial({
			map: clothTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5,
		});
		var flag = new THREE.Mesh(new THREE.PlaneBufferGeometry(6.5, 4, 32), clothMaterial);
		flag.position.y = 2.65;
		flag.position.x = -3.25;
		pole.add(flag);
		pole.rotation.y = Math.PI / 2;
		// pole.position.set(20, 20, 0);
		scene.add(pole);
	}

	function f() {
		
	}

	function createObjects() {

		loadMars();
		flag();
		modelsLoader();
		createVehicle(new THREE.Vector3(100, marsRadius - 5, 10), ZERO_QUATERNION);
	}

	// - Init -
	initGraphics();
	initPhysics();
	createObjects();
	animate();

});