Ammo().then(function (Ammo) {

	// - Global variables -
	var DISABLE_DEACTIVATION = 4;
	var TRANSFORM_AUX = new Ammo.btTransform();
	var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

	// Graphics variables
	var camera, scene, renderer, renderPass, composer;
	var clock = new THREE.Clock();
	var githubUfo, linkedinUfo, mailUfo;
	var mobile, pc, blockchain, coin, dialogueL, dialogueR, trend;
	var pad, takeOffAction = [], hoverAction, closeAction = [], openAction = [];
	var insta_button, fms_button, kart_button, linkedin_button, github_button, email_button, xerv_button, fund_button, download_button;
	var up = 1, down = 0;
	var dl = 1, dr = 0, step = 0;
	var trendBack = 1, trendFront = 0;
	var loadingManager, gltfLoader, textLoader, textureLoader;
	var linkedinTexture, gmailTexture, githubTexture, clothTexture, bitcoinTexture;
	var mouse, raycaster;
	var mixers = [], foods = [], runAction = [];
	var andy, lText, starInfo;
	var isAndyMoving = false, hasAndyTurned = false;
	var INTERSECTED, rotateButton, div;

	var links = ['https://github.com/ItsTheKayBee/InstaNote',
		'https://github.com/ItsTheKayBee/FundEasy',
		'https://github.com/ItsTheKayBee/EssentialsKart',
		'https://github.com/ItsTheKayBee/FacultyManagementSystem',
		'https://github.com/ItsTheKayBee/Xervixx',
		'https://www.github.com/ItsTheKayBee',
		'https://linkedin.com/in/itsthekaybee',
		'mailto:kunal.bohra@somaiya.edu',
		'resume/kunal_resume.pdf'
	];

	// Physics variables
	var collisionConfiguration;
	var dispatcher;
	var broadphase;
	var solver;
	var physicsWorld;
	var rigidBodies = [];
	var margin = 0.05;

	var loadingScreen = {
		scene: new THREE.Scene(),
		camera: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100),
		circle: new THREE.Mesh(
			new THREE.CircleBufferGeometry(0.2, 20),
			new THREE.MeshBasicMaterial({ color: 0x99d8d0, side: THREE.DoubleSide })
		)
	};
	var RESOURCES_LOADED = false;

	function scenes() {
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0xf2f3ee, 0.01);
	}

	function cam() {
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.set(0, 5, 10);
		camera.lookAt(scene.position);
	}

	function lights() {
		//ambient light
		hlight = new THREE.AmbientLight(0xffffff, 1);
		scene.add(hlight);

		//directional light
		var dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(-10, 10, 5);
		scene.add(dirLight);
	}

	function rend() {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor(0xbae1ff);
		renderer.shadowMap.type = THREE.BasicShadowMap;
		renderer.shadowMap.enabled = true;
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

		window.addEventListener('resize', onWindowResize, false);

		var canvas = document.getElementsByTagName('canvas')[0];
		rotateButton = document.createElement('input');
		rotateButton.setAttribute('type', 'image');
		rotateButton.setAttribute('src', 'images/rotate.png');
		rotateButton.setAttribute('id', 'rotate');
		div = document.createElement('div');
		var t = document.createTextNode("This website requires landscape mode. Click to rotate!");
		div.appendChild(t);
		div.setAttribute('style', 'display:none');
		div.setAttribute('id', 'div');
		document.body.appendChild(div);
		rotateButton.setAttribute('style', 'display:none');
		document.body.appendChild(rotateButton);

		if (screen.orientation.type === "portrait-primary" || screen.orientation.type === "portrait-secondary") {
			rotateButton.setAttribute('style', 'display:block');
			div.setAttribute('style', 'display:block');
			document.getElementById("rotate").addEventListener("click", function () {
				canvas.requestFullscreen();
				screen.orientation.lock("landscape-primary");
				rotateButton.setAttribute('style', 'display:none');
				div.setAttribute('style', 'display:none');
			}, false);
			document.getElementById("div").addEventListener("click", function () {
				canvas.requestFullscreen();
				screen.orientation.lock("landscape-primary");
				rotateButton.setAttribute('style', 'display:none');
				div.setAttribute('style', 'display:none');
			}, false);
		}

		// Set up the loading screen's scene.
		loadingScreen.circle.position.set(0, 0, 5);
		loadingScreen.camera.lookAt(loadingScreen.circle.position);
		loadingScreen.scene.add(loadingScreen.circle);

		// Create a loading manager.
		// Pass loadingManager to all resource loaders.
		loadingManager = new THREE.LoadingManager();
		gltfLoader = new THREE.GLTFLoader();
		textureLoader = new THREE.TextureLoader(loadingManager);
		textLoader = new THREE.FontLoader(loadingManager);

		githubTexture = textureLoader.load('images/github.png');
		linkedinTexture = textureLoader.load('images/linkedin.png');
		gmailTexture = textureLoader.load('images/gmail.png');
		clothTexture = textureLoader.load('textures/indian_flag.jpg');
		bitcoinTexture = textureLoader.load('textures/bitcoin.png');

		mouse = new THREE.Vector3();
		raycaster = new THREE.Raycaster();

		loadingManager.onLoad = function () {
			RESOURCES_LOADED = true;
		};

		window.addEventListener('wheel', scrolling, { passive: false });
		window.addEventListener('mousedown', onMouseDown, false);
		window.addEventListener('mousemove', hover, false);
		window.addEventListener('touchstart', touchstart, false);
		window.addEventListener('touchend', touchend, false);
	}

	var ts;
	function touchstart(e) {
		ts = e.touches[0].clientY;
	}

	function touchend(e) {
		var te = e.changedTouches[0].clientY;

		touchScroll(ts - te);
		console.log(ts - te);
	}

	function touchScroll(dy) {
		if (andy) {
			let andyz = andy.position.z;
			let camz = camera.position.z;
			let camy = camera.position.y;

			if (camz > -174 || camz <= -180) {
				camera.position.z -= dy * 0.05;
				andy.position.z -= dy * 0.05;

				if (camz <= -186)
					andy.position.y = 1;
				else if (camz > -186 && camz <= -180)
					andy.position.y = 2;
				else if (camz <= -170 && camz >= -172)
					andy.position.y = pad.position.y + 0.5;
				else if (camz < -172 && camz >= -174)
					andy.position.y = pad.position.y + 1;
				else
					andy.position.y = 1;

				isAndyMoving = true;

				if (dy < 0) {
					hasAndyTurned = true;
				} else {
					hasAndyTurned = false;
				}
				camera.position.clampScalar(-270, 10);
				andy.position.clampScalar(-275, 5);
			}
			else if (camz <= -178 && Math.ceil(camz) >= -179) {
				camera.lookAt(pad.position);
				pad.position.y -= dy * 0.005;
				andy.position.y = pad.position.y + 1;
				camera.position.y -= dy * 0.005;
				camera.position.z = -178;
				for (var i = 0; i < 4; i++) {
					takeOffAction[i].stop();
				}
				if (camy < 5) {
					camera.position.y = 5;
					andy.position.y = 2;
					andy.position.z = -186;
					pad.position.z = -186;
					pad.position.y = 1;
					camera.position.z = -181;
					camera.lookAt(andy.position);

					for (var i = 0; i < 4; i++) {
						openAction[i].play();
					}
					setTimeout(() => {
						for (var i = 0; i < 4; i++) {
							openAction[i].timeScale = 0;
						}
					}, 3000);
				}
				else if (camy > 120) {
					camera.position.y = 119;
					camera.position.z = -176;
				}
			}
			else if (camz <= -174 && camz >= -177) {
				camera.lookAt(pad.position);
				camera.position.z = -174.5;
				pad.position.y += dy * 0.005;
				andy.position.y = pad.position.y + 1;
				camera.position.y += dy * 0.005;
				for (var i = 0; i < 4; i++) {
					takeOffAction[i].play();
					closeAction[i].play();
				}
				if (camy < 5) {
					camera.position.z = -173;
					camera.position.y = 5;
					andy.position.y = 2;
					andy.position.z = -180;
					pad.position.z = -180;
					pad.position.y = 1;
				}
				else if (camy > 120) {
					pad.position.y = 119;
					camera.position.y = pad.position.y;
					camera.position.z = -178;
					pad.position.z = -186;
					andy.position.z = -186;
				}
			}

			//movement of L
			if (andyz < -9.5 && andyz > -11) {
				lText.position.x = -2;
				lText.rotation.y = Math.PI / 4;
			}

			//buttons
			if (andyz <= -218 && andyz >= -220) {
				//github
				github_button.position.y = 4;

			} else if (andyz <= -238 && andyz >= -240) {
				//linkedin
				linkedin_button.position.y = 4;

			} else if (andyz <= -258 && andyz >= -260) {
				//email
				email_button.position.y = 4;

			} else if (andyz <= -23 && andyz >= -31) {
				// instanote
				insta_button.position.y = 4;

			} else if (andyz <= -34 && andyz >= -41) {
				// fundeasy
				fund_button.position.y = 4;

			} else if (andyz <= -43 && andyz >= -51) {
				// essentialskart
				kart_button.position.y = 4;

			} else if (andyz <= -54 && andyz >= -61) {
				// fms
				fms_button.position.y = 4;

			} else if (andyz <= -64 && andyz >= -71) {
				// xervixx
				xerv_button.position.y = 4;

			} else if (andyz <= -75 && andyz >= -87) {
				// info
				starInfo.position.y = 4;

			} else {
				insta_button.position.y = -4;
				fund_button.position.y = -4;
				kart_button.position.y = -4;
				fms_button.position.y = -4;
				xerv_button.position.y = -4;
				linkedin_button.position.y = -4;
				github_button.position.y = -4;
				email_button.position.y = -4;
				starInfo.position.y = -4;
			}
		}
	}

	function scrolling() {
		if (andy) {
			let andyz = andy.position.z;
			let camz = camera.position.z;
			let camy = camera.position.y;
			let dy = event.deltaY;

			if (camz > -174 || camz <= -180) {
				camera.position.z -= dy * 0.005;
				andy.position.z -= dy * 0.005;

				if (camz <= -186)
					andy.position.y = 1;
				else if (camz > -186 && camz <= -180)
					andy.position.y = 2;
				else if (camz <= -170 && camz >= -172)
					andy.position.y = pad.position.y + 0.5;
				else if (camz < -172 && camz >= -174)
					andy.position.y = pad.position.y + 1;
				else
					andy.position.y = 1;

				isAndyMoving = true;

				if (dy < 0) {
					hasAndyTurned = true;
				} else {
					hasAndyTurned = false;
				}
				camera.position.clampScalar(-270, 10);
				andy.position.clampScalar(-275, 5);
			}
			else if (camz <= -178 && Math.ceil(camz) >= -179) {
				camera.lookAt(pad.position);
				pad.position.y -= dy * 0.005;
				andy.position.y = pad.position.y + 1;
				camera.position.y -= dy * 0.005;
				camera.position.z = -178;
				for (var i = 0; i < 4; i++) {
					takeOffAction[i].stop();
				}
				if (camy < 5) {
					camera.position.y = 5;
					andy.position.y = 2;
					andy.position.z = -186;
					pad.position.z = -186;
					pad.position.y = 1;
					camera.position.z = -181;
					camera.lookAt(andy.position);

					for (var i = 0; i < 4; i++) {
						openAction[i].play();
					}
					setTimeout(() => {
						for (var i = 0; i < 4; i++) {
							openAction[i].timeScale = 0;
						}
					}, 3000);
				}
				else if (camy > 120) {
					camera.position.y = 119;
					camera.position.z = -176;
				}
			}
			else if (camz <= -174 && camz >= -177) {
				camera.lookAt(pad.position);
				camera.position.z = -174.5;
				pad.position.y += dy * 0.005;
				andy.position.y = pad.position.y + 1;
				camera.position.y += dy * 0.005;
				for (var i = 0; i < 4; i++) {
					takeOffAction[i].play();
					closeAction[i].play();
				}
				if (camy < 5) {
					camera.position.z = -173;
					camera.position.y = 5;
					andy.position.y = 2;
					andy.position.z = -180;
					pad.position.z = -180;
					pad.position.y = 1;
				}
				else if (camy > 120) {
					pad.position.y = 119;
					camera.position.y = pad.position.y;
					camera.position.z = -178;
					pad.position.z = -186;
					andy.position.z = -186;
				}
			}

			//movement of L
			if (andyz < -9.5 && andyz > -11) {
				lText.position.x = -2;
				lText.rotation.y = Math.PI / 4;
			}

			//buttons
			if (andyz <= -218 && andyz >= -220) {
				//github
				github_button.position.y = 4;

			} else if (andyz <= -238 && andyz >= -240) {
				//linkedin
				linkedin_button.position.y = 4;

			} else if (andyz <= -258 && andyz >= -260) {
				//email
				email_button.position.y = 4;

			} else if (andyz <= -23 && andyz >= -31) {
				// instanote
				insta_button.position.y = 4;

			} else if (andyz <= -34 && andyz >= -41) {
				// fundeasy
				fund_button.position.y = 4;

			} else if (andyz <= -43 && andyz >= -51) {
				// essentialskart
				kart_button.position.y = 4;

			} else if (andyz <= -54 && andyz >= -61) {
				// fms
				fms_button.position.y = 4;

			} else if (andyz <= -64 && andyz >= -71) {
				// xervixx
				xerv_button.position.y = 4;

			} else if (andyz <= -75 && andyz >= -87) {
				// info
				starInfo.position.y = 4;

			} else {
				insta_button.position.y = -4;
				fund_button.position.y = -4;
				kart_button.position.y = -4;
				fms_button.position.y = -4;
				xerv_button.position.y = -4;
				linkedin_button.position.y = -4;
				github_button.position.y = -4;
				email_button.position.y = -4;
				starInfo.position.y = -4;
			}
		}
	}

	function onMouseDown(event) {
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			var url = intersects[0].object.userData.url;
			if (url) window.open(url);
		}
	}

	function hover(event) {
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			var obj = intersects[0].object;
			var url = obj.userData.url;
			if (INTERSECTED != obj && url) {
				if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
				obj.geometry.type == "CylinderBufferGeometry" ? obj.scale.set(1, 3, 1) : obj.scale.set(1, 1, 1.5);
				INTERSECTED = obj;
			} else if (!url) {
				if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
				INTERSECTED = null;
			}
		} else {
			if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
			INTERSECTED = null;
		}
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

	var firstFlag = false;

	function animate() {

		if (screen.orientation.type == "portrait-primary" || screen.orientation.type == "portrait-secondary") {
			if (RESOURCES_LOADED && firstFlag) {

				rotateButton.setAttribute('id', 'rotateLarge');
				div.setAttribute('id', 'divLarge');
				rotateButton.setAttribute('style', 'display:block');
				div.setAttribute('style', 'display:block');
			}
			requestAnimationFrame(animate);

			let posx = loadingScreen.circle.position.x;
			loadingScreen.circle.position.x -= 0.05;
			if (posx < -1) loadingScreen.circle.position.x = 1;

			renderer.render(loadingScreen.scene, loadingScreen.camera);
			return; // Stop the function here.
		} else {
			if (!RESOURCES_LOADED) {
				requestAnimationFrame(animate);

				let posx = loadingScreen.circle.position.x;
				loadingScreen.circle.position.x -= 0.05;
				if (posx < -1) loadingScreen.circle.position.x = 1;

				renderer.render(loadingScreen.scene, loadingScreen.camera);
				return;
			}
			rotateButton.setAttribute('style', 'display:none');
			div.setAttribute('style', 'display:none');
			firstFlag = true;
		}

		requestAnimationFrame(animate);
		var dt = clock.getDelta();

		physicsWorld.stepSimulation(dt, 10);

		projectsAnimation(step);
		step++;

		updateMixers(dt);

		for (var i = 0; i < foods.length; i++) {
			foods[i].rotation.x = -Math.PI / 2;
		}

		andyMovement();

		updatePhysics();

		composer.render(0.1);
		renderer.render(scene, camera);
	}

	function andyMovement() {
		if (andy) {
			if (isAndyMoving) {
				for (var i = 0; i < 4; i++) {
					runAction[i].play();
					runAction[i].fadeOut(1);
				}
			} else {
				for (var i = 0; i < 4; i++) {
					runAction[i].stop();
				}
			}
			if (hasAndyTurned) {
				andy.rotation.y = -Math.PI / 2;
			} else {
				andy.rotation.y = Math.PI / 2;
			}
			isAndyMoving = false;
		}
	}

	function updatePhysics() {
		for (var i = 0; i < rigidBodies.length; i++) {
			let mesh = rigidBodies[i];
			var objPhys = mesh.userData.physicsBody;
			var ms = objPhys.getMotionState();
			if (ms) {
				ms.getWorldTransform(TRANSFORM_AUX);
				var p = TRANSFORM_AUX.getOrigin();
				var q = TRANSFORM_AUX.getRotation();
				mesh.position.set(p.x(), p.y(), p.z());
				mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
			}
		}
	}

	function updateMixers(dt) {

		//update mixers
		for (var i = 0; i < mixers.length; i++) {
			mixers[i].update(dt);
		}
	}

	function projectsAnimation(step) {

		//rotation of holographs
		mobile.rotation.y += 0.02;
		pc.rotation.y += 0.02;
		blockchain.rotation.y += 0.02;

		//coin animation
		if (coin.position.y >= 4) {
			down = 1;
			up = 0;
		} else if (coin.position.y <= 1) {
			down = 0;
			up = 1;
		}
		if (up) {
			coin.position.y += 0.04;
		} else if (down) {
			coin.position.y -= 0.04;
		}

		//dialogflow animation
		if (step % 30 == 0) {
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
			trend.position.z += 0.1;
			if (trend.position.z >= 3) {
				trend.rotation.y += 0.1;
				if (trend.rotation.y % Math.PI >= Math.PI - 0.10) {
					trendBack = 1;
					trendFront = 0;
				}
			}
		}
		else if (trendBack == 1) {
			trend.position.z -= 0.1;
			if (trend.position.z <= 0) {
				trendBack = 0;
				trendFront = 1;
			}
		}
		trend.position.x = 1.5;
		trend.position.y = 2;
	}

	function createBox(mesh, pos, quat, w, l, h, mass, friction) {
		var shape = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));
		shape.setMargin(margin);

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
			mesh.userData.physicsBody = body;
			rigidBodies.push(mesh);
		}
		return body;
	}

	//helper function for loading gtlf models
	function loadModel(path, pos, quat, rot, s, mass, w, h, l) {
		let modelPromise = new Promise((resolve) => {
			gltfLoader.load('models3d/' + path + '/scene.gltf', function (gltf) {
				let mesh = gltf.scene;
				let object = mesh.children[0];

				//adjustments
				object.scale.set(s, s, s);
				object.rotation.set(rot.x, rot.y, rot.z);

				//physics
				createBox(mesh, pos, quat, w, h, l, mass, 1);

				mesh.traverse(function (node) {

					if (node.isMesh) {
						node.castShadow = true;
						node.receiveShadow = true;
					}
				});

				resolve(gltf);
			});
		});
		return modelPromise;
	}

	//creates indian flag
	function createFlag() {
		var steelMaterial = new THREE.MeshPhongMaterial({
			flatShading: true,
			color: 0x858482
		});
		var pole = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0.2, 10, 10), steelMaterial);
		var top = new THREE.Mesh(new THREE.SphereBufferGeometry(0.4, 10, 10), steelMaterial);
		top.position.y = 5;
		pole.add(top);
		var clothMaterial = new THREE.MeshBasicMaterial({
			map: clothTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5,
		});
		var flag = new THREE.Mesh(new THREE.PlaneBufferGeometry(6.75, 3.75, 32), clothMaterial);
		flag.position.y = 2.65;
		flag.position.x = -3.25;
		pole.add(flag);
		pole.rotation.y = Math.PI;
		pole.position.set(-7.5, 2, -213);
		pole.scale.set(0.35, 0.35, 0.35);
		scene.add(pole);
	}

	function addMumbai() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var text = createText(
				font,
				"I      Mumbai",
				{ x: -10, y: 0, z: -210 },
				ZERO_QUATERNION,
				2, 0.5, 0.2,
				0xf9f9f9
			);
			text.rotation.y = Math.PI / 6;
			scene.add(text);
		});
		var rot = { x: -Math.PI / 2, y: 0, z: Math.PI / 6 };
		loadModel(
			'heart',
			{ x: -9.2, y: 0.2, z: -211 },
			ZERO_QUATERNION,
			rot,
			2, 0, 0.5, 0.5, 0.1
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			scene.add(model);
			model.scale.set(0.5, 0.5, 0.5);
			let models = [model];
			addGltfAnims(models, clip);
		});
	}

	function addGltfAnims(models, clip) {
		for (var i = 0; i < models.length; i++) {
			//animation 
			if (clip) {
				let mixer = new THREE.AnimationMixer(models[i]);
				let hover = mixer.clipAction(clip);
				hover.play();
				mixers.push(mixer);
			}
		}
	}

	//adds bio
	function addBio() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var text = createText(
				font,
				"Hi, I am Kunal Bohra, 2O years young undergraduate student with a keen interest in ",
				{ x: -7.5, y: 0, z: -210 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x385170
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"programming and software development. I am enthusiastic about Blockchain and",
				{ x: -7.5, y: 0, z: -209.5 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x385170
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"Android. I am a motivated IT student with a solution-oriented mindset to tackle any",
				{ x: -7.5, y: 0, z: -209 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x385170
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"obstacle that comes in path. I am a passionate learner who keeps on learning new",
				{ x: -7.5, y: 0, z: -208.5 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x385170
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"technologies and expands his skillset to become a valuable asset for any company.",
				{ x: -7.5, y: 0, z: -208 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x385170
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"I am open for any JOB opportunities in the IT industry.",
				{ x: -7.5, y: 0, z: -207 },
				ZERO_QUATERNION,
				0.5, 0.5, 0.01,
				0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
		});
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
		var textMaterial = new THREE.MeshPhongMaterial({ color: color });
		var text = new THREE.Mesh(textGeometry, textMaterial);
		text.receiveShadow = true;
		text.castShadow = true;
		text.scale.set(s, s, s);
		text.position.set(pos.x, pos.y, pos.z);
		text.rotation.set(quat.x, quat.y, quat.z);
		return text;
	}

	//creates direction sign post
	function createPole(pos, text, dir) {
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
		var signGeometry = new THREE.BoxBufferGeometry(4, 0.25, 1.25);
		var sign = new THREE.Mesh(signGeometry, woodMaterial);

		sign.position.y = 4.375;
		sign.position.x = -2;
		sign.rotation.x = Math.PI / 2;

		//pointy directionheads
		var triGeo = new THREE.BoxBufferGeometry(1, 0.25, 1);
		var triangle = new THREE.Mesh(triGeo, woodMaterial);

		triangle.position.x = -2;

		triangle.rotation.y = Math.PI / 4;

		//creating text
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var pos = dir == 1 ? { x: -2, y: 0, z: 0.25 } : { x: 1.5, y: 0, z: 0.25 };
			var rot = dir == 1 ? { x: -Math.PI / 2, y: 0, z: 0, w: 1 } : { x: -Math.PI / 2, y: Math.PI, z: 0, w: 1 };
			var projectsText = createText(
				font,
				text,
				pos,
				rot,
				0.5, 0.9, 0.3, 0x654321
			);
			sign.add(projectsText);
		});

		//adding to parents
		sign.add(triangle);
		woodenPole.add(sign);
		woodenPole.position.set(pos.x, pos.y, pos.z);
		woodenPole.castShadow = true;
		woodenPole.receiveShadow = true;
		woodenPole.scale.set(0.8, 0.8, 0.8);
		return woodenPole;
	}

	//for creating irregular shapes
	function addShape(image, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s, dx, dy) {
		// extruded shape
		var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

		var edges = new THREE.EdgesGeometry(geometry);
		var lineMaterial = new THREE.LineBasicMaterial({
			color: color,
			transparent: true,
			opacity: 0.7
		});
		var line = new THREE.LineSegments(edges, lineMaterial);

		if (image !== '') {
			var texture = textureLoader.load('textures/' + image + '.png', function (texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.offset.set(-1, 0);
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
					opacity: 0.5
				}),
			];
		} else {
			var materials = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.5
			});
		}

		var mesh = new THREE.Mesh(geometry, materials);
		mesh.position.set(x, y, z);
		mesh.rotation.set(rx, ry, rz);
		mesh.scale.set(s, s, s);
		mesh.add(line);
		return mesh;
	}

	//for adding hologram base
	function addHoloBase() {
		var geometry = new THREE.SphereBufferGeometry(2, 28, 28, Math.PI / 2, Math.PI * 2, 0, 1)
		var material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 0.7,
			color: 0x00fff0
		});

		var sphere = new THREE.Mesh(geometry, material);
		return sphere;
	}

	//to create rounded rectangle shape
	function createRoundedRect(ctx, x, y, width, height, radius) {
		//creates rounded rectangle
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

		createRoundedRect(addPhoneShape, -1, 0, 2, 3.5, 0.1);

		mobile = addShape('', addPhoneShape, extrudeSettings, 0xf0f69f, 4, 2, 0, 0, 0, 0, 1, 0.25, 0.25);

		mobile.position.set(10, 2, -30);
		scene.add(mobile);
	}

	//FundEasy project
	function addBlockchain() {

		var blockGeo = new THREE.BoxBufferGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial({
			color: 0xef6c57,
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

		blockchain = new THREE.Group();

		blockchain.add(block1);
		blockchain.add(block2);
		blockchain.add(block3);
		blockchain.add(block4);

		var edges = new THREE.EdgesGeometry(blockGeo);
		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0xef6c57,
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

		blockchain.position.set(-10, 1, -40);

		var coinGeo = new THREE.CylinderBufferGeometry(0.5, 0.5, 0.15, 20);

		var coinMat = [
			new THREE.MeshBasicMaterial({
				color: 0xef6c57,
				transparent: true,
				opacity: 0.3
			}),
			new THREE.MeshBasicMaterial({
				map: bitcoinTexture,
				color: 0xef6c57,
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

		var lineMaterial1 = new THREE.LineBasicMaterial({
			color: 0x05a3ff,
			transparent: true,
			opacity: 0.7
		});
		var lineMaterial2 = new THREE.LineBasicMaterial({
			color: 0xf5b5fc,
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
		dialogueR = addShape('', splineShapeR, extrudeSettings, 0xf5b5fc, 0, 0, 0, 0, 0, 0, 1);

		//edges
		var dialogGeoL = new THREE.ExtrudeBufferGeometry(splineShapeL, extrudeSettings);
		var dialogGeoR = new THREE.ExtrudeBufferGeometry(splineShapeR, extrudeSettings);

		var edgesL = new THREE.EdgesGeometry(dialogGeoL);
		var edgesR = new THREE.EdgesGeometry(dialogGeoR);
		var line1 = new THREE.LineSegments(edgesL, lineMaterial1);
		var line2 = new THREE.LineSegments(edgesR, lineMaterial2);

		dialogueL.add(line1);
		dialogueR.add(line2);

		var chat = new THREE.Group();
		chat.add(dialogueL);
		chat.add(dialogueR);
		chat.position.set(8, 1, -51);
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

		var screen = addShape('desktop', screenShape, extrudeSettings, 0x7fe7cc, -2, 0, 0, 0, 0, 0, 1, 0.25, 0.2);
		var neck = addShape('', neckShape, extrudeSettings, 0x7fe7cc, -2, 0, 0, 0, 0, 0, 1);
		var stand = addShape('', standShape, extrudeSettings, 0x7fe7cc, -2, 0, 0, Math.PI / 2, 0, 0, 1);

		pc = new THREE.Group();

		pc.add(screen);
		pc.add(neck);
		pc.add(stand);
		pc.position.set(-10, 1, -60)
		scene.add(pc);
	}

	//xervixx project
	function addStock() {
		var material = new THREE.LineBasicMaterial({
			color: 0xffc5a1,
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
		graph.position.set(8.5, 1, -70);
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
				0xee8276
			);
			bcSkillGroup.add(blockchainText);
		});
		var rot = { x: -Math.PI / 2, y: 0, z: 0 };
		loadModel(
			'pancakes',
			{ x: 0, y: 2, z: 0 },
			ZERO_QUATERNION,
			rot,
			2, 0, 0.5, 0.5, 0.1
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			bcSkillGroup.add(model);
			models = [];
			models.push(model);
			model.scale.set(0.025, 0.025, 0.025);
			model1 = model.clone();
			model2 = model.clone();
			models.push(model1);
			models.push(model2);
			model1.position.set(3, 3, 0);
			model2.position.set(6, 2, 0);

			addGltfAnims(models, clip);
			bcSkillGroup.add(model1);
			bcSkillGroup.add(model2);
		});

		bcSkillGroup.position.set(-11, 0, -90);
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
				0xf6a24e
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
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			phpSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			model3 = model.clone();
			models.push(model1);
			models.push(model2);
			models.push(model3);
			model1.position.set(1.5, 3, 0);
			model2.position.set(2.7, 3, 0);
			model3.position.set(3.6, 2, 0);
			addGltfAnims(models, clip);

			phpSkillGroup.add(model1);
			phpSkillGroup.add(model2);
			phpSkillGroup.add(model3);

		});

		phpSkillGroup.position.set(6, 0, -100);
		scene.add(phpSkillGroup);
	}

	//3 stars skill	
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
				0xf8b88b
			);
			androidSkillGroup.add(androidText);
		});
		var rot = { x: 0, y: 0, z: 0 };
		loadModel(
			'donut',
			{ x: 1.6, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			0.0035, 0, 0.5, 0.5, 0.1
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			androidSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			models.push(model1);
			models.push(model2);
			model1.position.set(5, 4, 0);
			model2.position.set(8.4, 3, 0);
			addGltfAnims(models, clip);

			androidSkillGroup.add(model1);
			androidSkillGroup.add(model2);

			foods.push(model);
			foods.push(model1);
			foods.push(model2);
		});

		androidSkillGroup.position.set(-12, 0, -110);
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
				0xe97140
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
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			pythonSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			models.push(model1);
			models.push(model2);
			model1.position.set(4.25, 4, 0);
			model2.position.set(7, 3, 0);
			addGltfAnims(models, clip);

			pythonSkillGroup.add(model1);
			pythonSkillGroup.add(model2);
		});

		pythonSkillGroup.position.set(5, 0, -120);
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
				0xcc5079
			);
			webSkillGroup.add(htmlText);

			var cssText = createText(
				font,
				"CSS",
				{ x: 0.5, y: 1.45, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xf274bc
			);
			webSkillGroup.add(cssText);

			var jsText = createText(
				font,
				"JS",
				{ x: 1.5, y: 2.8, z: 0 },
				ZERO_QUATERNION,
				0.5,
				3,
				0.7,
				0xf2a2e8
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
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			webSkillGroup.add(model);
			foods.push(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			model3 = model.clone();
			models.push(model1);
			models.push(model2);
			models.push(model3);
			model1.position.set(2, 5, 0);
			model2.position.set(3.5, 5, 0);
			model3.position.set(4.85, 3.5, 0);
			addGltfAnims(models, clip);

			webSkillGroup.add(model1);
			webSkillGroup.add(model2);
			webSkillGroup.add(model3);
			foods.push(model1);
			foods.push(model2);
			foods.push(model3);

		});

		webSkillGroup.position.set(-10, 0, -130);
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
				0x129a7d
			);
			javaSkillGroup.add(javaText);
		});
		var rot = { x: 0, y: 0, z: 0 };
		loadModel(
			'cookie',
			{ x: 1.2, y: 3, z: 0 },
			ZERO_QUATERNION,
			rot,
			2, 0, 0.5, 0.5, 0.1
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			javaSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			model3 = model.clone();
			models.push(model1);
			models.push(model2);
			models.push(model3);
			model1.position.set(2.2, 4, 0);
			model2.position.set(3.5, 4, 0);
			model3.position.set(4.5, 3, 0);
			addGltfAnims(models, clip);

			javaSkillGroup.add(model1);
			javaSkillGroup.add(model2);
			javaSkillGroup.add(model3);
		});

		javaSkillGroup.position.set(7, 0, -140);
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
				0xa87550
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
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			mysqlSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			model3 = model.clone();
			models.push(model1);
			models.push(model2);
			models.push(model3);
			model1.position.set(2.5, 5, 0);
			model2.position.set(4.5, 5, 0);
			model3.position.set(6, 3, 0);
			addGltfAnims(models, clip);

			mysqlSkillGroup.add(model1);
			mysqlSkillGroup.add(model2);
			mysqlSkillGroup.add(model3);
			foods.push(model);
			foods.push(model1);
			foods.push(model2);
			foods.push(model3);

		});

		mysqlSkillGroup.position.set(-10, 0, -150);
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
				0x2d7f9d
			);
			cppSkillGroup.add(cppText);
		});
		var rot = { x: 0, y: 0, z: -1.5 * Math.PI / 2 };
		loadModel(
			'cake',
			{ x: 0.75, y: 2.5, z: 0 },
			ZERO_QUATERNION,
			rot,
			2, 0, 0.5, 0.5, 0.1
		).then((gltf) => {
			let model = gltf.scene;
			let clip = gltf.animations[0];
			cppSkillGroup.add(model);
			models = [];
			models.push(model);
			model1 = model.clone();
			model2 = model.clone();
			models.push(model1);
			models.push(model2);
			model1.position.set(2.5, 3.5, 0);
			model2.position.set(4.25, 2.5, 0);
			addGltfAnims(models, clip);

			cppSkillGroup.add(model1);
			cppSkillGroup.add(model2);

			foods.push(model);
			foods.push(model1);
			foods.push(model2);
		});

		cppSkillGroup.position.set(6, 0, -160);
		scene.add(cppSkillGroup);
	}

	function createUFOs() {
		githubUfo = new THREE.Object3D();
		var pos = { x: 0, y: 0, z: 0 };
		var quat = ZERO_QUATERNION;
		var s = 1;

		gltfLoader.load('models3d/github_ufo/scene.gltf', function (gltf) {
			var rot = { x: -Math.PI / 2, y: 0, z: 0 };

			//github ufo
			let mesh = gltf.scene;
			let object = mesh.children[0];

			//adjustments
			object.scale.set(s, s, s);
			object.rotation.set(rot.x, rot.y, rot.z);

			//physics
			createBox(mesh, pos, quat, 0.5, 0.5, 0.1, 0, 1);

			mesh.traverse(function (node) {

				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			githubUfo.add(mesh);
			var logo = githubTexture;
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
			plateMesh.position.set(0, 0.75, 0);
			plateMesh.rotation.y = -1.5 * Math.PI / 6;

			var ufoLightMaterial = new THREE.MeshBasicMaterial({
				color: 0x81dafc,
				transparent: true,
				opacity: 0.7
			});
			var ufoLightMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 1.1, 5, 32), ufoLightMaterial);
			ufoLightMesh.position.y = -2.5;

			githubUfo.add(ufoLightMesh);

			githubUfo.position.set(0, 3, -220);
			scene.add(githubUfo);

			//linkedin ufo

			let linkedMesh = mesh.clone();

			var newMaterial = new THREE.MeshLambertMaterial({ color: 0x34859d });
			linkedMesh.children[2].children[0].material = newMaterial;
			linkedinUfo = new THREE.Object3D();
			var rot = { x: -Math.PI / 2, y: 0, z: 0 };

			linkedinUfo.add(linkedMesh);
			var logo = linkedinTexture;
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
			plateMesh.position.set(0, 0.75, 0);
			plateMesh.rotation.y = -1.5 * Math.PI / 6;

			ufoLightMesh1 = ufoLightMesh.clone();

			linkedinUfo.add(ufoLightMesh1);

			linkedinUfo.position.set(0, 3, -240);

			scene.add(linkedinUfo);

			//mail ufo

			mailUfo = new THREE.Object3D();

			let mailMesh = mesh.clone();

			var newMaterial = new THREE.MeshLambertMaterial({ color: 0xff392e });
			mailMesh.children[2].children[0].material = newMaterial;

			mailUfo.add(mailMesh);
			var logo = gmailTexture;
			logo.wrapS = logo.wrapT = THREE.RepeatWrapping;
			logo.offset.set(0, 0);
			logo.repeat.set(1, 1);

			var logoMat = new THREE.MeshStandardMaterial({
				map: logo,
				transparent: true,
				side: THREE.DoubleSide
			});

			var plate = new THREE.SphereBufferGeometry(0.7, 10, 10, 2, 0.8, 1, 0.6);
			var plateMesh = new THREE.Mesh(plate, logoMat);

			mailUfo.add(plateMesh);
			plateMesh.scale.set(1.5, 1.5, 1.5);
			plateMesh.position.set(0, 0.75, 0);
			plateMesh.rotation.y = -1.5 * Math.PI / 6;

			ufoLightMesh2 = ufoLightMesh.clone();

			mailUfo.add(ufoLightMesh2);

			scene.add(mailUfo);
			mailUfo.position.set(0, 3, -260);

		});
	}

	function createPad() {

		gltfLoader.load('models3d/pad/scene.gltf', function (gltf) {
			var mesh = gltf.scene;

			let mixer = new THREE.AnimationMixer(mesh);
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

			mesh.traverse(function (node) {

				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			pad = mesh;
			mesh.position.set(0, 3, -180);
			mesh.scale.set(2, 2, 2);
			scene.add(mesh);
		});
	}

	function createExperience() {

		gltfLoader.load('models3d/arcon/scene.gltf', function (gltf) {
			let mesh = gltf.scene;
			let mixer = new THREE.AnimationMixer(mesh);
			mixers.push(mixer);
			let rotation = mixer.clipAction(gltf.animations[0]);
			rotation.play();

			mesh.rotation.y = -1.2 * Math.PI / 2;
			mesh.position.set(10, 100, -200);

			scene.add(mesh);
		});

		gltfLoader.load('models3d/gre_edge/scene.gltf', function (gltf) {
			let mesh = gltf.scene;
			let mixer = new THREE.AnimationMixer(mesh);
			mixers.push(mixer);
			let rotation = mixer.clipAction(gltf.animations[0]);
			rotation.play();

			mesh.rotation.y = -0.9 * Math.PI / 2;
			mesh.position.set(-10, 50, -200);

			scene.add(mesh);
		});
	}

	function addAndy() {
		gltfLoader.load('models3d/andy/scene.gltf', function (gltf) {
			var mesh = gltf.scene;

			let mixer = new THREE.AnimationMixer(mesh);
			mixers.push(mixer);

			for (var i = 2; i < 6; i++) {
				var action = mixer.clipAction(gltf.animations[i]);
				runAction.push(action);
			}
			var headMove = mixer.clipAction(gltf.animations[0]);
			headMove.play()
			var lAntennaMove = mixer.clipAction(gltf.animations[6]);
			lAntennaMove.play();
			var rAntennaMove = mixer.clipAction(gltf.animations[7]);
			rAntennaMove.play();

			mesh.traverse(function (node) {

				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});

			andy = mesh;

			mesh.position.set(0, 1, 5);
			mesh.rotation.set(0, Math.PI, 0);

			scene.add(mesh);
		});
	}

	function addGodrays(base) {
		//add godrays effect for holograph
		var godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, base, {
			resolutionScale: 1,
			density: 0.9,
			decay: 0.96,
			weight: 1,
			samples: 100
		});
		var effectPass = new POSTPROCESSING.EffectPass(camera, godraysEffect);

		composer.addPass(effectPass);
	}

	function addAllProjects() {
		//projects 

		let base1 = addHoloBase();

		addGodrays(base1);

		base1.position.set(10, -2, -30);
		scene.add(base1);

		addPhone();

		let base2 = addHoloBase();
		addGodrays(base2);
		base2.position.set(-10, -2, -40);
		scene.add(base2);

		addBlockchain()

		let base3 = addHoloBase();
		addGodrays(base3);
		base3.position.set(10, -2, -50);
		scene.add(base3);

		addDialogFlow();

		let base4 = addHoloBase();
		addGodrays(base4);
		base4.position.set(-10, -2, -60);
		scene.add(base4);

		addDesktop();

		let base5 = addHoloBase();
		addGodrays(base5);
		base5.position.set(10, -2, -70);
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

	function addAllAboutMe() {
		createFlag();
		addBio();
		addMumbai();
		createUFOs();
	}

	function addAllExperiences() {

		createPad();
		createExperience();
	}

	function addButton(pos, color) {
		var geom = new THREE.BoxBufferGeometry(1.5, 0.6, 0.25);
		var material = new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: 0.6
		});

		var edges = new THREE.EdgesGeometry(geom);
		var lineMaterial = new THREE.LineBasicMaterial({ color: color });
		var line = new THREE.LineSegments(edges, lineMaterial);
		var button = new THREE.Mesh(geom, material);
		button.add(line);
		button.position.set(pos.x, pos.y, pos.z);
		return button;
	}

	function addTrack() {
		var trackWidth = 30;
		var trackLength = 1000;
		trackGeom = new THREE.PlaneBufferGeometry(trackWidth, trackLength);
		var trackMaterial = new THREE.MeshBasicMaterial({
			color: 0xbaffc9,
			side: THREE.DoubleSide
		});
		track = new THREE.Mesh(trackGeom, trackMaterial);
		track.receiveShadow = true;
		track.castShadow = true;
		createBox(track, new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, trackWidth, 1, trackLength, 0, 2);

		track.rotation.x = Math.PI / 2;
		track.position.z = 10 - trackLength / 2;
	}

	function addSignPosts() {
		var pos = { x: -10, y: 0, z: -25 };
		var projectsSign = createPole(pos, "PROJECTS", -1);
		projectsSign.rotation.y = Math.PI;
		scene.add(projectsSign);

		pos = { x: 10, y: 0, z: -80 };
		var skillsSign = createPole(pos, "SKILLS", 1);
		scene.add(skillsSign);

		pos = { x: -10, y: 0, z: -170 };
		var experienceSign = createPole(pos, "EXPERIENCE", -1);
		experienceSign.rotation.y = Math.PI;
		scene.add(experienceSign);

		pos = { x: 10, y: 0, z: -200 };
		var aboutSign = createPole(pos, "ABOUT ME", 1);
		scene.add(aboutSign);
	}

	function addKB() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var kunaText = createText(
				font,
				"KUNA",
				{ x: -9.5, y: 0, z: -10 },
				ZERO_QUATERNION,
				1, 2, 0.6,
				0xf69e7b
			);
			scene.add(kunaText);
			var pos = { x: -1.5, y: 0, z: -10 }
			lText = createText(
				font,
				"L",
				pos,
				ZERO_QUATERNION,
				1, 2, 0.6,
				0xf69e7b
			);
			scene.add(lText);
			var bohraText = createText(
				font,
				"BOHRA",
				{ x: 1.5, y: 0, z: -10 },
				ZERO_QUATERNION,
				1, 2, 0.6,
				0xff8364
			);
			scene.add(bohraText);
			var devText = createText(
				font,
				"SOFTWARE D",
				{ x: 3, y: 0, z: -6 },
				ZERO_QUATERNION,
				0.35, 2, 0.6,
				0xef6c57
			);
			scene.add(devText);
			var eText = createText(
				font,
				"E",
				{ x: 9.35, y: 0, z: -6 },
				ZERO_QUATERNION,
				0.35, 2, 0.6,
				0xef6c57
			);
			eText.rotation.z = 0.3;
			scene.add(eText);
			var vText = createText(
				font,
				"V",
				{ x: 9.85, y: 0, z: -6 },
				ZERO_QUATERNION,
				0.35, 2, 0.6,
				0xef6c57
			);
			scene.add(vText);
		});
	}

	function addButtons() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var posn = { x: -0.55, y: -0.1, z: 0.2 };
			var rot = { x: 0, y: 0, z: 0, w: 1 };
			var visitText = createText(
				font,
				"OPEN",
				posn,
				rot,
				0.5, 0.6, 0.05, 0xe9e9e5
			);

			//instanote
			var color = 0xbb5a5a;
			var pos = { x: 2.5, y: -4, z: -28 };
			insta_button = addButton(pos, color);
			insta_button.add(visitText);
			insta_button.userData = { url: links[0] };
			scene.add(insta_button);

			//fundeasy
			color = 0x61c0bf;
			pos = { x: -2.5, y: -4, z: -36 };
			fund_button = addButton(pos, color);
			fund_button.add(visitText.clone());
			fund_button.userData = { url: links[1] };
			scene.add(fund_button);

			//essentialskart
			color = 0xffcab0;
			pos = { x: 2.5, y: -4, z: -46 };
			kart_button = addButton(pos, color);
			kart_button.add(visitText.clone());
			kart_button.userData = { url: links[2] };
			scene.add(kart_button);

			//fms
			color = 0x9a9b94;
			pos = { x: -2.5, y: -4, z: -56 };
			fms_button = addButton(pos, color);
			fms_button.add(visitText.clone());
			fms_button.userData = { url: links[3] };
			scene.add(fms_button);

			//xervixx
			color = 0xe6a4b4;
			pos = { x: 2.5, y: -4, z: -66 };
			xerv_button = addButton(pos, color);
			xerv_button.add(visitText.clone());
			xerv_button.userData = { url: links[4] };
			scene.add(xerv_button);

			var posn = { x: -0.65, y: -0.1, z: 0.2 };
			var teleportText = createText(
				font,
				"TELEPORT",
				posn,
				rot,
				0.5, 0.4, 0.05, 0xe8ecf1
			);

			//github
			color = 0x8a79af;
			pos = { x: -3, y: -4, z: -220 };
			github_button = addButton(pos, color);
			github_button.add(teleportText);
			github_button.userData = { url: links[5] };
			scene.add(github_button);

			//linkedin
			color = 0x99ddcc;
			pos = { x: 3, y: -4, z: -240 };
			linkedin_button = addButton(pos, color);
			linkedin_button.add(teleportText.clone());
			linkedin_button.userData = { url: links[6] };
			scene.add(linkedin_button);

			//email
			color = 0xf67280;
			pos = { x: -3, y: -4, z: -260 };
			email_button = addButton(pos, color);
			email_button.add(teleportText.clone());
			email_button.userData = { url: links[7] };
			scene.add(email_button);

			//that's about it
			color = 0xbb5a5a;
			pos = { x: 0, y: 4, z: -275 };
			var geom = new THREE.BoxBufferGeometry(4.5, 0.6, 0.3);
			var material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.6
			});

			var edges = new THREE.EdgesGeometry(geom);
			var lineMaterial = new THREE.LineBasicMaterial({ color: color });
			var line = new THREE.LineSegments(edges, lineMaterial);
			var button = new THREE.Mesh(geom, material);
			button.add(line);
			button.position.set(pos.x, pos.y, pos.z);

			var posn = { x: -2, y: -0.1, z: 0.2 };
			var text = createText(
				font,
				"That's all about me. Scroll up",
				posn,
				rot,
				0.5, 0.4, 0.05, 0xe8ecf1
			);
			button.add(text);
			scene.add(button);

			//stars info
			color = 0xac8daf;
			pos = { x: 0, y: -4, z: -85 };
			var geom = new THREE.BoxBufferGeometry(5, 0.6, 0.3);
			var material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.6
			});

			var edges = new THREE.EdgesGeometry(geom);
			var lineMaterial = new THREE.LineBasicMaterial({ color: color });
			var line = new THREE.LineSegments(edges, lineMaterial);
			var button = new THREE.Mesh(geom, material);
			button.add(line);
			button.position.set(pos.x, pos.y, pos.z);

			var posn = { x: -2.25, y: -0.1, z: 0.2 };
			var text = createText(
				font,
				"Food indicates expertise out of 5",
				posn,
				rot,
				0.5, 0.4, 0.05, 0xe8ecf1
			);
			button.add(text);
			starInfo = button;
			scene.add(button);

			//download resume
			color = 0x9a9b94;
			pos = { x: 5, y: 0, z: -206.5 };
			var geom = new THREE.BoxBufferGeometry(3, 0.6, 0.3);
			var material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
				opacity: 0.6
			});

			var edges = new THREE.EdgesGeometry(geom);
			var lineMaterial = new THREE.LineBasicMaterial({ color: color });
			var line = new THREE.LineSegments(edges, lineMaterial);
			download_button = new THREE.Mesh(geom, material);
			download_button.add(line);
			download_button.position.set(pos.x, pos.y, pos.z);

			var posn = { x: -1.3, y: -0.1, z: 0.2 };
			var text = createText(
				font,
				"Download resume",
				posn,
				rot,
				0.5, 0.4, 0.05, 0xe8ecf1
			);
			download_button.add(text);
			download_button.rotation.x = -Math.PI / 2;
			download_button.userData = { url: links[8] };
			scene.add(download_button);

		});
	}

	function addRibbon() {
		var geom = new THREE.CylinderBufferGeometry(0.5, 0.5, 0.15, 17);

		var material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
			map: githubTexture
		});
		var btn = new THREE.Mesh(geom, material);
		btn.rotation.y = Math.PI / 2;
		btn.rotation.x = Math.PI / 2;
		btn.userData = { url: links[5] };
		btn.position.set(-11, 3, -10);
		scene.add(btn);

		material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
			map: linkedinTexture
		});
		btn = new THREE.Mesh(geom, material);
		btn.rotation.y = Math.PI / 2;
		btn.rotation.x = Math.PI / 2;
		btn.userData = { url: links[6] };
		btn.position.set(-11, 1.5, -10);
		scene.add(btn);

		material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
			map: gmailTexture
		});
		btn = new THREE.Mesh(geom, material);
		btn.rotation.y = Math.PI / 2;
		btn.rotation.x = Math.PI / 2;
		btn.userData = { url: links[7] };
		btn.position.set(-11, 4.5, -10);
		scene.add(btn);
	}

	function addScrollText() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			var scrollText = createText(
				font,
				"SCROLL TO MOVE",
				{ x: 1.5, y: 0, z: 5 },
				ZERO_QUATERNION,
				0.5, 0.6, 0.01, 0x427996
			);
			scrollText.rotation.x = -Math.PI / 2;
			scene.add(scrollText);
		});
	}

	function addProjectDesc() {
		textLoader.load('fonts/Poppins/Poppins_Bold.json', function (font) {
			//instanote
			var text = createText(
				font,
				"InstaNote",
				{ x: 8, y: -0.2, z: -27 },
				ZERO_QUATERNION,
				0.6, 0.9, 0.20, 0x6e5773
			);
			scene.add(text);

			var text = createText(
				font,
				"ANDROID",
				{ x: 5.25, y: -0.2, z: -29.5 },
				ZERO_QUATERNION,
				0.6, 0.6, 0.01, 0x516091
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			var text = createText(
				font,
				"Making notes in 1 click",
				{ x: 4, y: -0.2, z: -29 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			//fms
			var text = createText(
				font,
				"Faculty Management System",
				{ x: -13, y: -0.2, z: -57 },
				ZERO_QUATERNION,
				0.6, 0.9, 0.20, 0x6a8caf
			);
			scene.add(text);
			var text = createText(
				font,
				"PHP | MySQL - FULL STACK",
				{ x: -8, y: -0.2, z: -59.5 },
				ZERO_QUATERNION,
				0.6, 0.6, 0.01, 0x516091
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			var text = createText(
				font,
				"Portal for faculties in college",
				{ x: -8, y: -0.2, z: -59 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			//fundeasy
			var text = createText(
				font,
				"FundEasy",
				{ x: -11.5, y: -0.2, z: -37 },
				ZERO_QUATERNION,
				0.6, 0.9, 0.20, 0x32afa9
			);
			scene.add(text);
			var text = createText(
				font,
				"BLOCKCHAIN - MERN STACK",
				{ x: -8, y: -0.2, z: -39.5 },
				ZERO_QUATERNION,
				0.6, 0.6, 0.01, 0x516091
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			var text = createText(
				font,
				"Making fund disbursal secure",
				{ x: -8, y: -0.2, z: -39 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			//essentialskart
			var text = createText(
				font,
				"EssentialsKart",
				{ x: 7, y: -0.2, z: -47 },
				ZERO_QUATERNION,
				0.6, 0.9, 0.20, 0xee8276
			);
			scene.add(text);
			var text = createText(
				font,
				"Dialogflow | Python",
				{ x: 3.75, y: -0.2, z: -49.5 },
				ZERO_QUATERNION,
				0.6, 0.5, 0.01, 0x516091
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			var text = createText(
				font,
				"WhatsApp chatbot for",
				{ x: 4.15, y: -0.2, z: -49 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"online shopping",
				{ x: 4.95, y: -0.2, z: -48.5 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			//xervixx
			var text = createText(
				font,
				"Xervixx",
				{ x: 8, y: -0.2, z: -67 },
				ZERO_QUATERNION,
				0.6, 0.9, 0.20, 0xf1935c
			);
			scene.add(text);
			var text = createText(
				font,
				"PHP | MySQL - FULL STACK",
				{ x: 1.7, y: -0.2, z: -69.5 },
				ZERO_QUATERNION,
				0.6, 0.6, 0.01, 0x516091
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);

			var text = createText(
				font,
				"Gamified customer",
				{ x: 4.8, y: -0.2, z: -69 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
			var text = createText(
				font,
				"engagement dashboard",
				{ x: 3.8, y: -0.2, z: -68.5 },
				ZERO_QUATERNION,
				0.5, 0.45, 0.01, 0x494949
			);
			text.rotation.x = -Math.PI / 2;
			scene.add(text);
		});

	}
	function createObjects() {
		addAndy();

		addKB();

		addProjectDesc();

		addScrollText();

		addRibbon();

		addButtons();

		addSignPosts();

		addAllProjects();

		addAllSkills();

		addAllAboutMe();

		addAllExperiences();

		addTrack();
	}

	// Init
	initGraphics();
	initPhysics();
	createObjects();
	animate();
});