Ammo().then(function (Ammo) {

	// - Global variables -
	var DISABLE_DEACTIVATION = 4;
	var TRANSFORM_AUX = new Ammo.btTransform();
	var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
	var marsRadius = 1000;
	var chassisMesh;

	// Graphics variables
	var camera, controls, scene, renderer, renderPass, composer;
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
		hlight = new THREE.AmbientLight(0xffffff, 0.);
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

		// var plight = new THREE.PointLight(0xff0000, 1, 0);
		// plight.position.set(20, 20, 20);
		// scene.add(plight);
	}


	function rend() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderPass = new POSTPROCESSING.RenderPass(scene, camera);
		composer = new POSTPROCESSING.EffectComposer(renderer);
		composer.addPass(renderPass);
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

		composer.render(0.1);

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

	//add vehicle and movements
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
			// console.log(speed);

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
		loader.load('models3d/taj_mahal/scene.gltf', function (gltf) {
			// console.log(gltf);
			taj = gltf.scene.children[0];
			taj.scale.set(0.01, 0.01, 0.01);
			/* pos = { x: 100, y: 1400, z: 10 };
			quat = { x: 0, y: 0, z: 0, w: 1 };
			createBox(gltf.scene, pos, quat, 100, 200, 50, 200000, 1); */
			scene.add(gltf.scene);
		});
	}

	function flagLoader() {
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
		pole.position.set(20, 20, 0);
		scene.add(pole);
	}

	function createText(font, texts, pos, quat, s, size, depth) {
		var textGeometry = new THREE.TextBufferGeometry(texts, {
			font: font,
			size: size,
			height: depth,
			curveSegments: 2,
			bevelEnabled: false,
		});
		var textMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
		var text = new THREE.Mesh(textGeometry, textMaterial);
		text.scale.set(s, s, s);
		text.position.set(pos.x, pos.y, pos.z);
		text.rotation.set(quat.x, quat.y, quat.z);
		return text;
	}

	function signpostLoader() {
		//wooden material
		var woodMaterial = new THREE.MeshLambertMaterial({
			color: 0xcaa472,
			flatShading: true,
			side: THREE.DoubleSide
		});

		//pole
		var poleGeometry = new THREE.CylinderBufferGeometry(0.2, 0.2, 10.5, 8);
		var woodenPole = new THREE.Mesh(poleGeometry, woodMaterial);

		//signboard
		var projectsSignGeometry = new THREE.BoxBufferGeometry(4, 0.25, 1.25);
		var skillsSignGeometry = new THREE.BoxBufferGeometry(4, 0.25, 1.25);
		var aboutSignGeometry = new THREE.BoxBufferGeometry(4, 0.25, 1.25);
		var projectsSign = new THREE.Mesh(projectsSignGeometry, woodMaterial);
		var skillsSign = new THREE.Mesh(skillsSignGeometry, woodMaterial);
		var aboutSign = new THREE.Mesh(aboutSignGeometry, woodMaterial);
		projectsSign.position.y = 4.375;
		projectsSign.position.x = -2;
		projectsSign.rotation.x = Math.PI / 2;

		skillsSign.position.y = 1.8;
		skillsSign.position.x = 2;
		skillsSign.rotation.x = Math.PI / 2;

		aboutSign.position.y = 3;
		aboutSign.position.z = 2;
		aboutSign.rotation.x = Math.PI / 2;
		aboutSign.rotation.z = -Math.PI / 2;


		//pointy directionheads
		var triGeo = new THREE.BoxBufferGeometry(1, 0.25, 1);
		var triangleL = new THREE.Mesh(triGeo, woodMaterial);
		var triangleR = new THREE.Mesh(triGeo, woodMaterial);
		var triangleB = new THREE.Mesh(triGeo, woodMaterial);
		triangleL.position.x = -2;

		triangleR.position.x = 2;

		triangleB.position.x = -2;
		triangleL.rotation.y = Math.PI / 4;
		triangleR.rotation.y = Math.PI / 4;
		triangleB.rotation.y = Math.PI / 4;

		//creating text
		var textLoader = new THREE.FontLoader();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var projectsText = createText(
				font,
				"PROJECTS",
				{ x: -2, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5,
				1,
				0.3
			);
			projectsSign.add(projectsText);
			var skillsText = createText(
				font,
				"SKILLS",
				{ x: -1, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5,
				1,
				0.3
			);
			skillsSign.add(skillsText);
			var aboutText = createText(
				font,
				"ABOUT ME",
				{ x: -2, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5,
				1,
				0.3
			);
			aboutSign.add(aboutText);
		});

		//adding to parents
		projectsSign.add(triangleL);
		skillsSign.add(triangleR);
		aboutSign.add(triangleB);
		woodenPole.add(projectsSign);
		woodenPole.add(skillsSign);
		woodenPole.add(aboutSign);
		woodenPole.position.set(-10, 20, -10);
		scene.add(woodenPole);
	}

	function addShape(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {
		// extruded shape

		var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

		var material = new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: 0.7
		});

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(x, y, z);
		mesh.rotation.set(rx, ry, rz);
		mesh.scale.set(s, s, s);
		return mesh;
	}

	function holoBase() {
		var geometry = new THREE.SphereBufferGeometry(1.6, 28, 28, Math.PI / 2, Math.PI * 2, 0, 1)
		var material = new THREE.MeshBasicMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.7
		});
		var sphere = new THREE.Mesh(geometry, material);
		sphere.position.y = -1;
		return sphere;
	}

	function phone() {
		var extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.25, bevelThickness: 0.1 };
		var roundedRectShape = new THREE.Shape();

		(function roundedRect(ctx, x, y, width, height, radius) {

			ctx.moveTo(x, y + radius);
			ctx.lineTo(x, y + height - radius);
			ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
			ctx.lineTo(x + width - radius, y + height);
			ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
			ctx.lineTo(x + width, y + radius);
			ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
			ctx.lineTo(x + radius, y);
			ctx.quadraticCurveTo(x, y, x, y + radius);

		})(roundedRectShape, 0, 0, 2, 4, 0.1);

		var mobile = addShape(roundedRectShape, extrudeSettings, 0x00FFFF, 4, 2, 0, 0, 0, 0, 1);
		var base = holoBase();

		//add godrays effect for holograph
		// createEffect(base, 0.95, 0.5, 0.9);
		let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, base, mobile, {
			resolutionScale: 1,
			density: 0.9,
			decay: 0.95,
			weight: 0.5,
			samples: 100
		});
		let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);

		base.position.y = -3;
		base.position.x = 1;
		mobile.add(base);
		scene.add(mobile);
	}

	function blockchain() {

		var blockGeo = new THREE.BoxBufferGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00FFFF,
			transparent: true,
			opacity: 0.7
		});

		var block1 = new THREE.Mesh(blockGeo, material);
		var block2 = new THREE.Mesh(blockGeo, material);
		var block3 = new THREE.Mesh(blockGeo, material);
		var block4 = new THREE.Mesh(blockGeo, material);

		block1.position.set(1, 1, 1);
		block2.position.set(1, 1, -1);
		block3.position.set(-1, 1, -1);
		block4.position.set(-1, 1, 1);

		function CustomSinCurve(scale) {
			THREE.Curve.call(this);
			this.scale = (scale === undefined) ? 1 : scale;
		}

		CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
		CustomSinCurve.prototype.constructor = CustomSinCurve;

		CustomSinCurve.prototype.getPoint = function (t) {

			var tx = t / 2 - 1.5;
			var ty = Math.sin(Math.PI * t);
			var tz = 1.25;

			return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

		};
		var path = new CustomSinCurve(0.8);

		var group = new THREE.Group();

		group.add(block1);
		group.add(block2);
		group.add(block3);
		group.add(block4);

		var chainGeo = new THREE.TubeBufferGeometry(path, 10, 0.1, 8, false);

		var chain1 = new THREE.Mesh(chainGeo, material);
		chain1.rotation.set(0, 0, Math.PI / 2);
		chain1.position.set(0.6, 2, 0);
		group.add(chain1);

		var chain2 = new THREE.Mesh(chainGeo, material);
		chain2.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
		chain2.position.set(-0.6, 2, 0);
		group.add(chain2);

		var chain3 = new THREE.Mesh(chainGeo, material);
		chain3.rotation.set(0, Math.PI / 2, Math.PI / 2);
		chain3.position.set(0, 2, -0.6);
		group.add(chain3);

		var chain4 = new THREE.Mesh(chainGeo, material);
		chain4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
		chain4.position.set(0.6, 2, 0);
		group.add(chain4);

		var chain5 = new THREE.Mesh(chainGeo, material);
		chain5.rotation.set(Math.PI / 2, 0, 0);
		chain5.position.set(0, 2, -0.6);
		group.add(chain5);

		var chain6 = new THREE.Mesh(chainGeo, material);
		chain6.rotation.set(0, -Math.PI / 2, Math.PI / 2);
		chain6.position.set(0, 2, 0.6);
		group.add(chain6);

		var chain7 = new THREE.Mesh(chainGeo, material);
		chain7.rotation.set(0, Math.PI, Math.PI / 2);
		chain7.position.set(-0.6, 2, 0);
		group.add(chain7);

		var chain8 = new THREE.Mesh(chainGeo, material);
		chain8.rotation.set(Math.PI / 2, Math.PI, Math.PI);
		chain8.position.set(2, 0, 0.6);
		group.add(chain8);

		group.position.set(0, 2, 0);
		var base = holoBase();


		let godraysEffect1 = new POSTPROCESSING.GodRaysEffect(camera, base, block1, block2, {
			resolutionScale: 1,
			density: 0.9,
			decay: 0.95,
			weight: 0.5,
			samples: 100
		});
		let effectPass1 = new POSTPROCESSING.EffectPass(camera, godraysEffect1);
		composer.addPass(effectPass1);
		// effectPass1.renderToScreen = true;

		base.position.y = -3;
		group.add(base);

		scene.add(group);
	}

	function dialog() {
		var cubeGeo = new THREE.BoxBufferGeometry(2, 2, 2);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00FFFF,
			transparent: true,
			opacity: 0.5,
		});

		var cube = new THREE.Mesh(cubeGeo, material);

		var cone = new THREE.Mesh(new THREE.ConeBufferGeometry(0.4, 1, 10), material);
		cone.rotation.set(Math.PI - Math.PI / 8, Math.PI / 2 - Math.PI / 6, -Math.PI / 4);
		cone.position.set(0.8, -0.8, 1);
		cube.add(cone);
		cube.position.set(-3, 0, 0);

		scene.add(cube);
	}

	function desktop() {
		var extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.25, bevelThickness: 0.1 };
		var roundedRectShape = new THREE.Shape();
		var neckShape = new THREE.Shape();
		var standShape = new THREE.Shape();

		function roundedRect(ctx, x, y, width, height, radius) {

			ctx.moveTo(x, y + radius);
			ctx.lineTo(x, y + height - radius);
			ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
			ctx.lineTo(x + width - radius, y + height);
			ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
			ctx.lineTo(x + width, y + radius);
			ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
			ctx.lineTo(x + radius, y);
			ctx.quadraticCurveTo(x, y, x, y + radius);

		}
		roundedRect(roundedRectShape, 0, 1, 4, 3, 0.1);
		roundedRect(neckShape, 1.75, 0, 0.5, 1, 0.1);
		roundedRect(standShape, 0.6, 0, 2.8, 1, 0.1);

		var screen = addShape(roundedRectShape, extrudeSettings, 0x00FFFF, -2, 0, 0, 0, 0, 0, 1);
		var neck = addShape(neckShape, extrudeSettings, 0x00FFFF, -2, 0, 0, 0, 0, 0, 1);
		var stand = addShape(standShape, extrudeSettings, 0x00FFFF, -2, 0, 0, Math.PI / 2, 0, 0, 1);

		var pc = new THREE.Group();
		pc.add(screen);
		pc.add(neck);
		pc.add(stand);
		pc.position.set(10, 10, 10)
		scene.add(pc);
	}

	function stock() {
		var material = new THREE.LineBasicMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.7
		});
		var points = [];
		points.push(new THREE.Vector3(0, 4, 0));
		points.push(new THREE.Vector3(0, 1, 0));
		points.push(new THREE.Vector3(3, 1, 0));
		var geometry = new THREE.BufferGeometry().setFromPoints(points);
		var axes = new THREE.Line(geometry, material);

		var points1 = [];
		points1.push(new THREE.Vector3(0.25, 1.25, 0));
		points1.push(new THREE.Vector3(0.3, 1.4, 0));
		points1.push(new THREE.Vector3(0.35, 1.2, 0));
		points1.push(new THREE.Vector3(0.5, 1.5, 0));
		points1.push(new THREE.Vector3(0.7, 1.2, 0));
		points1.push(new THREE.Vector3(0.85, 1.4, 0));
		points1.push(new THREE.Vector3(1, 1.24, 0));
		points1.push(new THREE.Vector3(1.3, 2.2, 0));
		points1.push(new THREE.Vector3(1.5, 1.4, 0));
		points1.push(new THREE.Vector3(1.6, 2.1, 0));
		points1.push(new THREE.Vector3(1.7, 1.6, 0));
		points1.push(new THREE.Vector3(1.9, 2.3, 0));
		points1.push(new THREE.Vector3(2.1, 2, 0));
		points1.push(new THREE.Vector3(2.7, 3.5, 0));
		var geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
		var trend = new THREE.Line(geometry1, material);

		var graph = new THREE.Group();
		graph.add(axes);
		graph.add(trend);
		graph.position.set(10, 10, -30);
		scene.add(graph);
	}

	function createObjects() {

		loadMars();
		flagLoader();
		signpostLoader();
		phone();
		blockchain();
		dialog();
		desktop();
		stock();

		// modelsLoader();
		createVehicle(new THREE.Vector3(100, marsRadius - 5, 10), ZERO_QUATERNION);
	}


	// - Init -
	initGraphics();
	initPhysics();
	createObjects();
	animate();

});