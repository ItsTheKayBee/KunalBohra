Ammo().then(function (Ammo) {

	// - Global variables -
	var DISABLE_DEACTIVATION = 4;
	var TRANSFORM_AUX = new Ammo.btTransform();
	var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);
	var marsRadius = 10000;
	var chassisMesh;

	// Graphics variables
	var camera, controls, scene, renderer, renderPass, composer;
	var clock = new THREE.Clock();
	var githubUfo, linkedinUfo, mailUfo;
	var mobile, pc, blockchain, coin, dialogueL, dialogueR, trend;
	var pad, arcon, takeOffAction = [], hoverAction;
	var force_vec = new Ammo.btVector3();
	var up = 1, down = 0;
	var dl = 1, dr = 0, step = 0;
	var trendBack = 1, trendFront = 0;
	let gltfLoader = new THREE.GLTFLoader();
	var textureLoader = new THREE.TextureLoader();
	var textLoader = new THREE.FontLoader();
	var mixers = [];
	var models3d = [];
	var foods = [];
	var closeAction = [];
	var openAction = [];
	// var groundLimit = 0;
	var padMesh;

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
		"ArrowRight": 'right',
		"KeyW": "up",
		"KeyS": "down",
		"KeyE": "out"
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
		hlight.castShadow = true;
		scene.add(hlight);

		//directional light
		var dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(- 3, 10, - 10);
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = - 2;
		dirLight.shadow.camera.left = - 2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;
		scene.add(dirLight);

	}

	function rend() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.type = THREE.BasicShadowMap;
		renderer.shadowMap.enabled = true;
		console.log(renderer);
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

		projectsAnimation(step);
		step++;

		updateMixers(dt);

		for (var i = 0; i < foods.length; i++) {
			foods[i].rotation.x = -Math.PI / 2;
		}

		if (pad) padMovement();

		if (padMesh) camera.lookAt(padMesh.position);

		composer.render(0.1);
		renderer.render(scene, camera);
	}

	function updateMixers(dt) {

		//update mixers
		for (var i = 0; i < mixers.length; i++) {
			mixers[i].update(dt);
		}
	}

	function projectsAnimation(step) {

		//rotation of holographs
		mobile.rotation.y += 0.01;
		pc.rotation.y += 0.01;
		blockchain.rotation.y += 0.01;

		//coin animation
		if (coin.position.y >= 4) {
			down = 1;
			up = 0;
		} else if (coin.position.y <= 1) {
			down = 0;
			up = 1;
		}
		if (up) {
			coin.position.y += 0.02;
		} else if (down) {
			coin.position.y -= 0.02;
		}

		//dialogflow animation
		if (step % 90 == 0) {
			if (dl == 1) {
				dl = 0;
				dr = 1;
			} else {
				dr = 0;
				dl = 1;
			}
			dialogueL.position.y = dl == 0 ? 0 : 3;
			dialogueR.position.y = dr == 0 ? 0 : 3;
		}

		//stock graph animation
		if (trendFront == 1) {
			trend.position.z += 0.05;
			if (trend.position.z >= 3) {
				trend.rotation.y += 0.1;
				if (trend.rotation.y % Math.PI >= Math.PI - 0.10) {
					trendBack = 1;
					trendFront = 0;
				}
			}
		}
		if (trendBack == 1) {
			trend.position.z -= 0.05;
			if (trend.position.z <= 0) {
				trendBack = 0;
				trendFront = 1;
			}
		}
		trend.position.x = 1.5;
		trend.position.y = 2;
	}

	//function to set event listeners to false
	function keyup(e) {
		if (keysActions[e.code]) {
			actions[keysActions[e.code]] = false;
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	//function to set event listeners to true
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
		return body;
	}

	function createWheelMesh(radius, width) {
		var t = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
		t.rotateZ(Math.PI / 2);
		var sphmat = new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/metal.jpg') });
		var mesh = new THREE.Mesh(t, sphmat);
		mesh.castShadow = true;
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
		mesh.castShadow = true;
		return mesh;
	}

	//loads the plane
	function loadMars() {
		//three.js
		marsGeom = new THREE.PlaneBufferGeometry(marsRadius, marsRadius);
		// buildTerrain();
		var marsMaterial = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide
		});
		mars = new THREE.Mesh(marsGeom, marsMaterial);
		mars.position.y = -1;
		mars.rotation.x = Math.PI / 2;
		mars.receiveShadow = true;
		scene.add(mars);

		//ammo
		var marsShape = new Ammo.btBoxShape(new Ammo.btVector3(marsRadius * .5, 1 * .5, marsRadius * .5));
		marsShape.setMargin(margin);
		var groundMass = 0;
		var groundLocalInertia = new Ammo.btVector3(0, 0, 0);
		marsShape.calculateLocalInertia(groundMass, groundLocalInertia);
		var groundTransform = new Ammo.btTransform();
		groundTransform.setIdentity();
		groundTransform.setOrigin(new Ammo.btVector3(0, -1, 0));
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
			vertex.z += Math.abs(value) * 25;
		}
		marsGeom.computeFaceNormals();
		marsGeom.computeVertexNormals();
	}

	//add vehicle and movements
	function createVehicle() {

		// Vehicle contants
		var pos = new THREE.Vector3(0, 10, 0);
		var quat = ZERO_QUATERNION;

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
		var maxEngineForce = 5000;
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

			breakingForce = 0;
			engineForce = 0;
			// console.log(speed);


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
		var boxMat = new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/solar_panel.jpg') });
		var panel = new THREE.Mesh(boxGeo, boxMat);
		panel.castShadow = true;
		panel.rotation.x = Math.PI / 2;
		panel.rotation.z = Math.PI / 2;
		panel.rotation.y = Math.PI / 4;
		panel.position.x += 0.5;
		panel.position.y += 0.8;
		return panel;
	}

	//helper function for loading gtlf models
	function loadModel(path, pos, quat, rot, s, mass, w, h, l) {
		let modelPromise = new Promise((resolve) => {
			gltfLoader.load('models3d/' + path + '/scene.gltf', function (gltf) {
				let object = gltf.scene.children[0];

				//adjustments
				object.scale.set(s, s, s);
				object.rotation.set(rot.x, rot.y, rot.z);

				//physics
				createBox(gltf.scene, pos, quat, w, h, l, mass, 1);
				models3d.push(gltf.scene);

				//animation 
				var mixer = new THREE.AnimationMixer(gltf.scene);
				var hover = mixer.clipAction(gltf.animations[0]);
				hover.play();
				mixers.push(mixer);

				gltf.scene.traverse(function (node) {

					if (node.isMesh) {
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});

				resolve(gltf.scene);
			});
		});
		return modelPromise;
	}

	//creates indian flag
	function createFlag() {
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
		var clothTexture = textureLoader.load('textures/indian_flag.jpg');
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

	//returns 3D text 
	function createText(font, texts, pos, quat, s, size, depth, color) {
		var textGeometry = new THREE.TextBufferGeometry(texts, {
			font: font,
			size: size,
			height: depth,
			curveSegments: 2,
			bevelEnabled: false,
		});
		var textMaterial = new THREE.MeshLambertMaterial({ color: color });
		var text = new THREE.Mesh(textGeometry, textMaterial);
		text.scale.set(s, s, s);
		text.position.set(pos.x, pos.y, pos.z);
		text.rotation.set(quat.x, quat.y, quat.z);
		return text;
	}

	//creates direction sign post
	function createSignPost() {
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
		var experienceSignGeometry = new THREE.BoxBufferGeometry(5, 0.25, 1.25);
		var projectsSign = new THREE.Mesh(projectsSignGeometry, woodMaterial);
		var skillsSign = new THREE.Mesh(skillsSignGeometry, woodMaterial);
		var aboutSign = new THREE.Mesh(aboutSignGeometry, woodMaterial);
		var experienceSign = new THREE.Mesh(experienceSignGeometry, woodMaterial);

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

		experienceSign.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
		experienceSign.position.set(0, 3, -2);


		//pointy directionheads
		var triGeo = new THREE.BoxBufferGeometry(1, 0.25, 1);
		var triangleL = new THREE.Mesh(triGeo, woodMaterial);
		var triangleR = new THREE.Mesh(triGeo, woodMaterial);
		var triangleB = new THREE.Mesh(triGeo, woodMaterial);
		var triangleU = new THREE.Mesh(triGeo, woodMaterial);

		triangleL.position.x = -2;

		triangleR.position.x = 2;

		triangleB.position.x = -2;

		triangleU.position.x = 2.5;

		triangleL.rotation.y = Math.PI / 4;
		triangleR.rotation.y = Math.PI / 4;
		triangleB.rotation.y = Math.PI / 4;
		triangleU.rotation.y = Math.PI / 4;

		//creating text
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var projectsText = createText(
				font,
				"PROJECTS",
				{ x: -2, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5, 1, 0.3, 0x654321
			);
			projectsSign.add(projectsText);
			var skillsText = createText(
				font,
				"SKILLS",
				{ x: -1, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5, 1, 0.3, 0x654321
			);
			skillsSign.add(skillsText);
			var aboutText = createText(
				font,
				"ABOUT ME",
				{ x: -2, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5, 1, 0.3, 0x654321
			);
			aboutSign.add(aboutText);
			var experienceText = createText(
				font,
				"EXPERIENCE",
				{ x: -1.6, y: 0, z: 0.25 },
				{ x: -Math.PI / 2, y: 0, z: 0, w: 1 },
				0.5, 1, 0.3, 0x654321
			);
			experienceSign.add(experienceText);
		});

		//adding to parents
		projectsSign.add(triangleL);
		skillsSign.add(triangleR);
		aboutSign.add(triangleB);
		experienceSign.add(triangleU);
		woodenPole.add(projectsSign);
		woodenPole.add(skillsSign);
		woodenPole.add(aboutSign);
		woodenPole.add(experienceSign);
		woodenPole.position.set(0, 4.5, 0);
		woodenPole.castShadow = true;
		woodenPole.receiveShadow = true;
		scene.add(woodenPole);
	}

	//for creating irregular shapes
	function addShape(image, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s, dx, dy) {
		// extruded shape
		var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

		if (image !== '') {
			var texture = textureLoader.load('textures/' + image + '.png', function (texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.offset.set(0, 0);
				texture.repeat.set(dx, dy);
			});
			var materials = [
				new THREE.MeshBasicMaterial({
					color: color,
					transparent: true,
					opacity: 1,
					map: texture,
				}),
				new THREE.MeshBasicMaterial({
					color: color,
					transparent: true,
					opacity: 0.3
				}),
			];
		} else {
			var materials = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.3
			});
		}

		var mesh = new THREE.Mesh(geometry, materials);
		mesh.position.set(x, y, z);
		mesh.rotation.set(rx, ry, rz);
		mesh.scale.set(s, s, s);
		return mesh;
	}

	//for adding hologram base
	function addHoloBase() {
		var geometry = new THREE.SphereBufferGeometry(2, 28, 28, Math.PI / 2, Math.PI * 2, 0, 1)
		var material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.7,
			color: 0x00fff2
		});

		var sphere = new THREE.Mesh(geometry, material);
		return sphere;
	}

	//to create rounded rectangle shape
	function createRoundedRect(ctx, x, y, width, height, radius) {
		//ceates rounded rectangle
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

	//instanote project
	function addPhone() {
		var extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.25, bevelThickness: 0.1 };
		var addPhoneShape = new THREE.Shape();

		createRoundedRect(addPhoneShape, 0, 0, 2, 4, 0.1);

		mobile = addShape('mobile', addPhoneShape, extrudeSettings, 0x00fff2, 4, 2, 0, 0, 0, 0, 1, 0.5, 0.25);

		mobile.position.set(-40, 1, 0);
		scene.add(mobile);
	}

	//FundEasy project
	function addBlockchain() {

		var blockGeo = new THREE.BoxBufferGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00fff2,
			transparent: true,
			opacity: 0.3
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

		blockchain = new THREE.Group();

		blockchain.add(block1);
		blockchain.add(block2);
		blockchain.add(block3);
		blockchain.add(block4);


		var edges = new THREE.EdgesGeometry(blockGeo);
		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0x00fff2,
			transparent: true,
			opacity: 0.7
		});
		var line1 = new THREE.LineSegments(edges, lineMaterial);
		var line2 = new THREE.LineSegments(edges, lineMaterial);
		var line3 = new THREE.LineSegments(edges, lineMaterial);
		var line4 = new THREE.LineSegments(edges, lineMaterial);
		blockchain.add(line1);
		blockchain.add(line2);
		blockchain.add(line3);
		blockchain.add(line4);
		line1.position.copy(block1.position);
		line2.position.copy(block2.position);
		line3.position.copy(block3.position);
		line4.position.copy(block4.position);

		var chainGeo = new THREE.TubeBufferGeometry(path, 10, 0.1, 8, false);

		var chain1 = new THREE.Mesh(chainGeo, material);
		chain1.rotation.set(0, 0, Math.PI / 2);
		chain1.position.set(0.6, 2, 0);
		blockchain.add(chain1);

		var chain2 = new THREE.Mesh(chainGeo, material);
		chain2.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
		chain2.position.set(-0.6, 2, 0);
		blockchain.add(chain2);

		var chain3 = new THREE.Mesh(chainGeo, material);
		chain3.rotation.set(0, Math.PI / 2, Math.PI / 2);
		chain3.position.set(0, 2, -0.6);
		blockchain.add(chain3);

		var chain4 = new THREE.Mesh(chainGeo, material);
		chain4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
		chain4.position.set(0.6, 2, 0);
		blockchain.add(chain4);

		var chain5 = new THREE.Mesh(chainGeo, material);
		chain5.rotation.set(Math.PI / 2, 0, 0);
		chain5.position.set(0, 2, -0.6);
		blockchain.add(chain5);

		var chain6 = new THREE.Mesh(chainGeo, material);
		chain6.rotation.set(0, -Math.PI / 2, Math.PI / 2);
		chain6.position.set(0, 2, 0.6);
		blockchain.add(chain6);

		var chain7 = new THREE.Mesh(chainGeo, material);
		chain7.rotation.set(0, Math.PI, Math.PI / 2);
		chain7.position.set(-0.6, 2, 0);
		blockchain.add(chain7);

		var chain8 = new THREE.Mesh(chainGeo, material);
		chain8.rotation.set(Math.PI / 2, Math.PI, Math.PI);
		chain8.position.set(2, 0, 0.6);
		blockchain.add(chain8);

		blockchain.position.set(-60, 1, 0);

		var coinGeo = new THREE.CylinderBufferGeometry(0.5, 0.5, 0.15, 20);
		var texture = textureLoader.load('textures/bitcoin.png');

		var coinMat = [
			new THREE.MeshBasicMaterial({
				color: 0x00ffff,
				transparent: true,
				opacity: 0.3
			}),
			new THREE.MeshBasicMaterial({
				map: texture,
				color: 0x00ffff,
				opacity: 0.7,
				transparent: true,
				side: THREE.DoubleSide
			}),
		];

		coin = new THREE.Mesh(coinGeo, coinMat);
		var edgesC = new THREE.EdgesGeometry(coinGeo);
		var lineC = new THREE.LineSegments(edgesC, lineMaterial);
		coin.add(lineC);
		coin.position.set(0, 0, 0);
		coin.rotation.set(Math.PI / 2, Math.PI / 2, 0);

		blockchain.add(coin);

		scene.add(blockchain);
	}

	//EssentialsKart project
	function addDialogFlow() {
		var extrudeSettings = { depth: 0.25, bevelEnabled: false };

		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0x00fff2,
			transparent: true,
			opacity: 0.7
		});

		var splinepts = [];
		splinepts.push(new THREE.Vector2(3, 0));
		splinepts.push(new THREE.Vector2(3, 2));
		splinepts.push(new THREE.Vector2(-0.5, 2));
		splinepts.push(new THREE.Vector2(-0.5, 0.2));
		splinepts.push(new THREE.Vector2(-1, -0.5));
		splinepts.push(new THREE.Vector2(0.2, 0));

		var splineShapeL = new THREE.Shape()
			.moveTo(0.2, 0)
			.splineThru(splinepts);

		dialogueL = addShape('', splineShapeL, extrudeSettings, 0x05a3ff, 0, 0, 0, 0, 0, 0, 1);

		var splineptsR = [];
		splineptsR.push(new THREE.Vector2(3.8, 0));
		splineptsR.push(new THREE.Vector2(4.7, -0.5));
		splineptsR.push(new THREE.Vector2(4.5, 0));
		splineptsR.push(new THREE.Vector2(4.5, 1.5));
		splineptsR.push(new THREE.Vector2(1.5, 2));
		splineptsR.push(new THREE.Vector2(1.5, 0));

		var splineShapeR = new THREE.Shape()
			.moveTo(1.5, 0)
			.splineThru(splineptsR);
		dialogueR = addShape('', splineShapeR, extrudeSettings, 0x00fff2, 0, 0, 0, 0, 0, 0, 1);

		//edges
		var dialogGeoL = new THREE.ExtrudeBufferGeometry(splineShapeL, extrudeSettings);
		var dialogGeoR = new THREE.ExtrudeBufferGeometry(splineShapeR, extrudeSettings);

		var edgesL = new THREE.EdgesGeometry(dialogGeoL);
		var edgesR = new THREE.EdgesGeometry(dialogGeoR);
		var line1 = new THREE.LineSegments(edgesL, lineMaterial);
		var line2 = new THREE.LineSegments(edgesR, lineMaterial);

		dialogueL.add(line1);
		dialogueR.add(line2);

		var chat = new THREE.Group();
		chat.add(dialogueL);
		chat.add(dialogueR);
		chat.position.set(-82, 2, 0);
		scene.add(chat);
	}

	//FacultyManagementSystem project
	function addDesktop() {
		var extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.25, bevelThickness: 0.1 };
		var screenShape = new THREE.Shape();
		var neckShape = new THREE.Shape();
		var standShape = new THREE.Shape();

		createRoundedRect(screenShape, 0, 1, 4, 2.8, 0.1);
		createRoundedRect(neckShape, 1.75, 0, 0.5, 1, 0.1);
		createRoundedRect(standShape, 0.6, 0, 2.8, 1, 0.1);

		var screen = addShape('desktop', screenShape, extrudeSettings, 0x00fff2, -2, 0, 0, 0, 0, 0, 1, 0.25, 0.2);
		var neck = addShape('', neckShape, extrudeSettings, 0x00fff2, -2, 0, 0, 0, 0, 0, 1);
		var stand = addShape('', standShape, extrudeSettings, 0x00fff2, -2, 0, 0, Math.PI / 2, 0, 0, 1);

		pc = new THREE.Group();
		
		pc.add(screen);
		pc.add(neck);
		pc.add(stand);
		pc.position.set(-100, 1, 0)
		scene.add(pc);
	}

	//xervixx project
	function addStock() {
		var material = new THREE.LineBasicMaterial({
			color: 0x00fff2,
			transparent: true,
			opacity: 0.7,
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
		geometry1.applyMatrix4(new THREE.Matrix4().makeTranslation(-1.5, -2, 0));

		trend = new THREE.Line(geometry1, material);

		var graph = new THREE.Group();
		graph.add(axes);
		graph.add(trend);
		graph.position.set(-121, 2, 0);
		scene.add(graph);
	}

	//3 stars skill
	function addBlockchainSkill() {
		var bcSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var blockchainText = createText(
				font,
				"BLOCKCHAIN",
				{ x: -1.5, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				2,
				0.7,
				0xffffff
			);
			bcSkillGroup.add(blockchainText);
		});
		var rot = { x: -Math.PI / 2, y: 0, z: 0 };
		loadModel(
			'star',
			{ x: 0, y: 2, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.005, 0, 0.5, 0.5, 0.1
		).then((model) => {
			bcSkillGroup.add(model);
			model.scale.set(0.025, 0.025, 0.025);
		});
		setTimeout(() => {
			loadModel(
				'star',
				{ x: 3, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.05, 0, 0.5, 0.5, 0.1
			).then((model) => {
				bcSkillGroup.add(model);
				model.scale.set(0.025, 0.025, 0.025);
			});
		}, 500);
		setTimeout(() => {
			loadModel(
				'star',
				{ x: 6, y: 2, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.005, 0, 0.5, 0.5, 0.1
			).then((model) => {
				bcSkillGroup.add(model);
				model.scale.set(0.025, 0.025, 0.025);
			});
		}, 1000);
		bcSkillGroup.position.set(40, -1, 0);
		scene.add(bcSkillGroup);
	}

	//4 stars skill
	function addPHPSkill() {
		var phpSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var phpText = createText(
				font,
				"PHP",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			phpSkillGroup.add(phpText);
		});
		var rot = { x: Math.PI / 2, y: Math.PI, z: Math.PI };
		loadModel(
			'pizza',
			{ x: 0.5, y: 2, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.1, 0, 0.5, 0.5, 0.1
		).then((model) => phpSkillGroup.add(model));
		setTimeout(() => {
			loadModel(
				'pizza',
				{ x: 1.5, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.1, 0, 0.5, 0.5, 0.1
			).then((model) => phpSkillGroup.add(model));
		}, 500);
		setTimeout(() => {
			loadModel(
				'pizza',
				{ x: 2.7, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.1, 0, 0.5, 0.5, 0.1
			).then((model) => phpSkillGroup.add(model));
		}, 1000);
		setTimeout(() => {
			loadModel(
				'pizza',
				{ x: 3.6, y: 2, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.1, 0, 0.5, 0.5, 0.1
			).then((model) => phpSkillGroup.add(model));
		}, 1500);

		phpSkillGroup.position.set(50, -1, 0);
		scene.add(phpSkillGroup);
	}

	//4 stars skill	
	function addAndroidSkill() {
		var androidSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var androidText = createText(
				font,
				"ANDROID",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			androidSkillGroup.add(androidText);
		});
		var rot = { x: 0, y: 0, z: 0 };
		loadModel(
			'android',
			{ x: 1.2, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.5, 0, 0.5, 0.5, 0.1
		).then((model) => {
			androidSkillGroup.add(model);
			foods.push(model);
		});
		setTimeout(() => {
			loadModel(
				'android',
				{ x: 3.2, y: 4, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.5, 0, 0.5, 0.5, 0.1
			).then((model) => {
				androidSkillGroup.add(model);
				foods.push(model);
			});
		}, 500);
		setTimeout(() => {
			loadModel(
				'android',
				{ x: 6.2, y: 4, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.5, 0, 0.5, 0.5, 0.1
			).then((model) => {
				androidSkillGroup.add(model);
				foods.push(model);
			});
		}, 1000);
		setTimeout(() => {
			loadModel(
				'android',
				{ x: 8.2, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.5, 0, 0.5, 0.5, 0.1
			).then((model) => {
				androidSkillGroup.add(model);
				foods.push(model);
			});
		}, 1500);

		androidSkillGroup.position.set(58, -1, 0);
		scene.add(androidSkillGroup);
	}

	//3 stars skill
	function addPythonSkill() {
		var pythonSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var pyText = createText(
				font,
				"PYTHON",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			pythonSkillGroup.add(pyText);
		});
		var rot = { x: Math.PI / 2, y: Math.PI, z: Math.PI };
		loadModel(
			'fries',
			{ x: 1.5, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.25, 0, 0.5, 0.5, 0.1
		).then((model) => pythonSkillGroup.add(model));
		setTimeout(() => {
			loadModel(
				'fries',
				{ x: 4.25, y: 4, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.25, 0, 0.5, 0.5, 0.1
			).then((model) => pythonSkillGroup.add(model));
		}, 500);
		setTimeout(() => {
			loadModel(
				'fries',
				{ x: 7, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.25, 0, 0.5, 0.5, 0.1
			).then((model) => pythonSkillGroup.add(model));
		}, 1000);

		pythonSkillGroup.position.set(72, -1, 0);
		scene.add(pythonSkillGroup);
	}

	//4 stars skill
	function addWebSkill() {
		var webSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var htmlText = createText(
				font,
				"HTML",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			webSkillGroup.add(htmlText);
		});
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var cssText = createText(
				font,
				"CSS",
				{ x: 0.5, y: 1.45, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			webSkillGroup.add(cssText);
		});
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var jsText = createText(
				font,
				"JS",
				{ x: 1.5, y: 2.8, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			webSkillGroup.add(jsText);
		});
		var rot = { x: Math.PI, y: Math.PI, z: Math.PI };
		loadModel(
			'ice_cream',
			{ x: 0.7, y: 3.5, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.25, 0, 0.5, 0.5, 0.1
		).then((model) => {
			webSkillGroup.add(model);
			foods.push(model);
		});
		setTimeout(() => {
			loadModel(
				'ice_cream',
				{ x: 2, y: 5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.25, 0, 0.5, 0.5, 0.1
			).then((model) => {
				webSkillGroup.add(model);
				foods.push(model);
			});
		}, 500);
		setTimeout(() => {
			loadModel(
				'ice_cream',
				{ x: 3.5, y: 5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.25, 0, 0.5, 0.5, 0.1
			).then((model) => {
				webSkillGroup.add(model);
				foods.push(model);
			});
		}, 1000);
		setTimeout(() => {
			loadModel(
				'ice_cream',
				{ x: 4.85, y: 3.5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.25, 0, 0.5, 0.5, 0.1
			).then((model) => {
				webSkillGroup.add(model);
				foods.push(model);
			});
		}, 1500);

		webSkillGroup.position.set(95, -1, 0);
		scene.add(webSkillGroup);
	}

	//4 stars skill
	function addJavaSkill() {
		var javaSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var javaText = createText(
				font,
				"JAVA",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			javaSkillGroup.add(javaText);
		});
		var rot = { x: 0, y: 0, z: 0 };
		loadModel(
			'chocolate_chip_cookie',
			{ x: 1.2, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			2, 0, 0.5, 0.5, 0.1
		).then((model) => javaSkillGroup.add(model));
		setTimeout(() => {
			loadModel(
				'chocolate_chip_cookie',
				{ x: 2.2, y: 4, z: 0 },
				ZERO_QUATERNION,
				rot,
				2, 0, 0.5, 0.5, 0.1
			).then((model) => javaSkillGroup.add(model));
		}, 500);
		setTimeout(() => {
			loadModel(
				'chocolate_chip_cookie',
				{ x: 3.5, y: 4, z: 0 },
				ZERO_QUATERNION,
				rot,
				2, 0, 0.5, 0.5, 0.1
			).then((model) => javaSkillGroup.add(model));
		}, 1000);
		setTimeout(() => {
			loadModel(
				'chocolate_chip_cookie',
				{ x: 4.5, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				2, 0, 0.5, 0.5, 0.1
			).then((model) => javaSkillGroup.add(model));
		}, 1500);

		javaSkillGroup.position.set(85, -1, 0);
		scene.add(javaSkillGroup);
	}

	//4 stars skill
	function addMySQLSkill() {
		var mysqlSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var javaText = createText(
				font,
				"MySQL",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xffffff
			);
			mysqlSkillGroup.add(javaText);
		});
		var rot = { x: 0, y: 0, z: 0 };
		loadModel(
			'burger',
			{ x: 1, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.45, 0, 0.5, 0.5, 0.1
		).then((model) => {
			mysqlSkillGroup.add(model);
			foods.push(model);
		});
		setTimeout(() => {
			loadModel(
				'burger',
				{ x: 2.5, y: 5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.45, 0, 0.5, 0.5, 0.1
			).then((model) => {
				mysqlSkillGroup.add(model);
				foods.push(model);
			});
		}, 500);
		setTimeout(() => {
			loadModel(
				'burger',
				{ x: 4.5, y: 5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.45, 0, 0.5, 0.5, 0.1
			).then((model) => {
				mysqlSkillGroup.add(model);
				foods.push(model);
			});
		}, 1000);
		setTimeout(() => {
			loadModel(
				'burger',
				{ x: 6, y: 3, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.45, 0, 0.5, 0.5, 0.1
			).then((model) => {
				mysqlSkillGroup.add(model);
				foods.push(model);
			});
		}, 1500);

		mysqlSkillGroup.position.set(105, -0.75, 0);
		scene.add(mysqlSkillGroup);
	}

	//3 stars skill
	function addCppSkill() {
		var cppSkillGroup = new THREE.Group();
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var cppText = createText(
				font,
				"C++",
				{ x: 0, y: 0, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3.25,
				0.7,
				0xffffff
			);
			cppSkillGroup.add(cppText);
		});
		var rot = { x: Math.PI / 2, y: Math.PI, z: Math.PI };
		loadModel(
			'cupcake',
			{ x: 0.75, y: 2.5, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.005, 0, 0.5, 0.5, 0.1
		).then((model) => {
			cppSkillGroup.add(model);
			foods.push(model);
		});
		setTimeout(() => {
			loadModel(
				'cupcake',
				{ x: 2, y: 3.5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.005, 0, 0.5, 0.5, 0.1
			).then((model) => {
				cppSkillGroup.add(model);
				foods.push(model);
			});
		}, 500);
		setTimeout(() => {
			loadModel(
				'cupcake',
				{ x: 3.25, y: 2.5, z: 0 },
				ZERO_QUATERNION,
				rot,
				0.005, 0, 0.5, 0.5, 0.1
			).then((model) => {
				cppSkillGroup.add(model);
				foods.push(model);
			});
		}, 1000);

		cppSkillGroup.position.set(115, -1, 0);
		scene.add(cppSkillGroup);
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


	function createGithubUfo() {
		githubUfo = new THREE.Object3D();
		var rot = { x: -Math.PI / 2, y: 0, z: 0 };

		loadModel(
			'github_ufo',
			{ x: 0, y: 0, z: 0 },
			ZERO_QUATERNION,
			rot,
			1, 0, 0.5, 0.5, 0.1
		).then((model) => githubUfo.add(model));

		var logo = textureLoader.load('images/github.png');
		logo.wrapS = logo.wrapT = THREE.RepeatWrapping;
		logo.offset.set(0, 0);
		logo.repeat.set(1, 1);

		var logoMat = new THREE.MeshBasicMaterial({
			map: logo,
			transparent: true,
			side: THREE.DoubleSide
		});

		var plate = new THREE.SphereBufferGeometry(0.7, 10, 10, 2, 0.8, 1, 0.6);
		var plateMesh = new THREE.Mesh(plate, logoMat);

		githubUfo.add(plateMesh);
		plateMesh.scale.set(1.5, 1.5, 1.5);
		plateMesh.position.set(0, 1, 0);

		githubUfo.scale.set(2, 2, 2);

		var ufoLightMaterial = new THREE.MeshBasicMaterial({
			color: 0x009eff,
			transparent: true,
			opacity: 0.7
		});
		var ufoLightMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 1.1, 5, 32), ufoLightMaterial);
		ufoLightMesh.position.y = -3;

		let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, ufoLightMesh, {
			resolutionScale: 1,
			density: 1,
			decay: 0.95,
			weight: 0.1,
			samples: 100
		});
		let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);
		effectPass.renderToScreen = true;

		githubUfo.add(ufoLightMesh);

		githubUfo.position.y = 5;

		scene.add(githubUfo);
		githubUfo.position.set(10, 10, -10);
	}

	function createLinkedinUfo() {
		linkedinUfo = new THREE.Object3D();
		var rot = { x: -Math.PI / 2, y: 0, z: 0 };

		loadModel(
			'linkedin_ufo',
			{ x: 0, y: 0, z: 0 },
			ZERO_QUATERNION,
			rot,
			1, 0, 0.5, 0.5, 0.1
		).then((model) => linkedinUfo.add(model));

		var logo = textureLoader.load('images/linkedin.png');
		logo.wrapS = logo.wrapT = THREE.RepeatWrapping;
		logo.offset.set(0, 0);
		logo.repeat.set(1, 1);

		var logoMat = new THREE.MeshBasicMaterial({
			map: logo,
			transparent: true,
			side: THREE.DoubleSide
		});

		var plate = new THREE.SphereBufferGeometry(0.7, 10, 10, 2, 0.8, 1, 0.6);
		var plateMesh = new THREE.Mesh(plate, logoMat);

		linkedinUfo.add(plateMesh);
		plateMesh.scale.set(1.5, 1.5, 1.5);
		plateMesh.position.set(0, 1, 0);

		linkedinUfo.scale.set(2, 2, 2);

		var ufoLightMaterial = new THREE.MeshBasicMaterial({
			color: 0x009eff,
			transparent: true,
			opacity: 0.7
		});
		var ufoLightMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 1.1, 5, 32), ufoLightMaterial);
		ufoLightMesh.position.y = -3;

		let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, ufoLightMesh, {
			resolutionScale: 1,
			density: 1,
			decay: 0.95,
			weight: 0.1,
			samples: 100
		});
		let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);
		effectPass.renderToScreen = true;

		linkedinUfo.add(ufoLightMesh);

		linkedinUfo.position.y = 5;

		scene.add(linkedinUfo);
	}

	function createMailUfo() {
		mailUfo = new THREE.Object3D();
		var rot = { x: -Math.PI / 2, y: 0, z: 0 };

		loadModel(
			'mail_ufo',
			{ x: 0, y: 0, z: 0 },
			ZERO_QUATERNION,
			rot,
			1, 0, 0.5, 0.5, 0.1
		).then((model) => mailUfo.add(model));

		var logo = textureLoader.load('images/gmail.png');
		logo.wrapS = logo.wrapT = THREE.RepeatWrapping;
		logo.offset.set(0, 0);
		logo.repeat.set(1, 1);

		var logoMat = new THREE.MeshBasicMaterial({
			map: logo,
			transparent: true,
			side: THREE.DoubleSide
		});

		var plate = new THREE.SphereBufferGeometry(0.7, 10, 10, 2, 0.8, 1, 0.6);
		var plateMesh = new THREE.Mesh(plate, logoMat);

		mailUfo.add(plateMesh);
		plateMesh.scale.set(1.5, 1.5, 1.5);
		plateMesh.position.set(0, 1, 0);

		mailUfo.scale.set(2, 2, 2);

		var ufoLightMaterial = new THREE.MeshBasicMaterial({
			color: 0x009eff,
			transparent: true,
			opacity: 0.7
		});
		var ufoLightMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 1.1, 5, 32), ufoLightMaterial);
		ufoLightMesh.position.y = -3;

		let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, ufoLightMesh, {
			resolutionScale: 1,
			density: 1,
			decay: 0.95,
			weight: 0.1,
			samples: 100
		});
		let effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);
		effectPass.renderToScreen = true;

		mailUfo.add(ufoLightMesh);

		mailUfo.position.y = 5;

		scene.add(mailUfo);
		mailUfo.position.set(-10, 0, - 10);
	}

	function createPad() {
		pos = { x: 10, y: 3, z: 10 };
		quat = ZERO_QUATERNION;
		w = 2;
		h = 4.5;
		l = 2;

		var texture = textureLoader.load('textures/outer_texture.jpg');
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.flipY = false;

		gltfLoader.load('models3d/pad/scene.gltf', function (gltf) {
			pad = createBox(gltf.scene, pos, quat, w, h, l, 100, 1);
			models3d.push(gltf.scene);
			var mesh = gltf.scene;
			mesh.scale.set(4, 4, 4);
			mixer = new THREE.AnimationMixer(mesh);
			mixers.push(mixer);
			for (var i = 0; i < 4; i++) {
				var action = mixer.clipAction(gltf.animations[i]);
				takeOffAction.push(action);
				action.clampWhenFinished = true;
				action.setLoop(THREE.LoopOnce);
			}
			for (var i = 6; i < 13; i += 2) {
				var caction = mixer.clipAction(gltf.animations[i]);
				caction.setLoop(THREE.LoopOnce);
				caction.clampWhenFinished = true;
				closeAction.push(caction);

				var oaction = mixer.clipAction(gltf.animations[i + 1]);
				oaction.setLoop(THREE.LoopOnce);
				openAction.clampWhenFinished = true;
				openAction.push(oaction);
			}

			hoverAction = mixer.clipAction(gltf.animations[4]);
			hoverAction.play();

			var outer = mesh.children[1].children[4];
			outer.material.map = texture;

			gltf.scene.traverse(function (node) {

				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			padMesh = mesh;
			scene.add(mesh);
		});
	}

	function createExperience() {
		pos = { x: 0, y: 0, z: 0 };
		quat = ZERO_QUATERNION;
		w = 0.5;
		h = 0.5;
		l = 0.1;

		gltfLoader.load('models3d/arcon/scene.gltf', function (gltf) {
			createBox(gltf.scene, pos, quat, w, h, l, 0, 1);
			models3d.push(gltf.scene);
			var mesh = gltf.scene;
			mixer = new THREE.AnimationMixer(mesh);
			var rotation = mixer.clipAction(gltf.animations[0]);
			rotation.play();

			mesh.rotation.y = -Math.PI / 6;

			arcon = mesh;
			scene.add(mesh);
		});

		pos = { x: 0, y: 0, z: 0 };
		quat = ZERO_QUATERNION;
		w = 0.5;
		h = 0.5;
		l = 0.1;

		gltfLoader.load('models3d/gre_edge/scene.gltf', function (gltf) {
			createBox(gltf.scene, pos, quat, w, h, l, 0, 1);
			models3d.push(gltf.scene);
			var mesh = gltf.scene;
			mixer = new THREE.AnimationMixer(mesh);
			var rotation = mixer.clipAction(gltf.animations[0]);
			rotation.play();

			mesh.rotation.y = -Math.PI / 6;

			arcon = mesh;
			scene.add(mesh);
		});
	}
	var padpos = 0;

	function padMovement() {
		var velocity = 0;
		if (actions.up) {
			velocity = 10;
			for (var i = 0; i < 4; i++) {
				takeOffAction[i].play();
				closeAction[i].play();
			}
		} else if (actions.down) {
			velocity = -10;
			for (var i = 0; i < 4; i++) {
				takeOffAction[i].stop();
			}
		} else if (actions.out) {
			for (var i = 0; i < 4; i++) {
				openAction[i].play();
			}
			setTimeout(() => {
				for (var i = 0; i < 4; i++) {
					openAction[i].timeScale = 0;
				}
			}, 3300);
			padpos = 1.5;
		} else {
			for (var i = 0; i < 4; i++) {
				takeOffAction[i].stop();
			}
		}
		force_vec.setValue(0, velocity, 0);
		pad.setLinearVelocity(force_vec);
		padMesh.position.y -= padpos;
	}

	function test() {
		var geometry = new THREE.SphereBufferGeometry(1, 17, 17);
		var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
		scene.add(mesh);
		mesh.position.set(-10, 2, 10);
		mesh.castShadow = true;
	}

	function addGodrays(base) {
		//add godrays effect for holograph
		var godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, base, {
			resolutionScale: 1,
			density: 1,
			decay: 0.95,
			weight: 0.3,
			samples: 100
		});
		var effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);
	}

	function addAllProjects() {
		//projects 

		let base1 = addHoloBase();

		addGodrays(base1);

		base1.position.set(-40, -2, 0);
		scene.add(base1);

		addPhone();

		let base2 = addHoloBase();
		addGodrays(base2);
		base2.position.set(-60, -2, 0);
		scene.add(base2);

		addBlockchain()

		let base3 = addHoloBase();
		addGodrays(base3);
		base3.position.set(-80, -2, 0);
		scene.add(base3);

		addDialogFlow();

		let base4 = addHoloBase();
		addGodrays(base4);
		base4.position.set(-100, -2, 0);
		scene.add(base4);

		addDesktop();

		let base5 = addHoloBase();
		addGodrays(base5);
		base5.position.set(-120, -2, 0);
		scene.add(base5);

		addStock();
	}

	function addAllSkills() {
		//skills
		addBlockchainSkill();
		addPHPSkill();
		addAndroidSkill();
		addPythonSkill();
		addJavaSkill();
		addMySQLSkill();
		addWebSkill();
		addCppSkill();
	}

	function createObjects() {

		loadMars();
		// createFlag();
		createSignPost();

		addAllProjects();

		addAllSkills();

		// createVehicle();

		/* createGithubUfo();
		createMailUfo();
		createLinkedinUfo(); */

		// createPad();

		// createExperience();

		// test();

	}

	// - Init -
	initGraphics();
	initPhysics();
	createObjects();
	animate();
});