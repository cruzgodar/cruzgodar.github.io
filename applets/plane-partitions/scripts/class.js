import {
	colorABConfigRegions,
	colorABConfigs,
	getArrayVersionOfABConfig,
	getMinimalABConfig,
	isValidABConfig,
	iterateThroughEntries,
	printABConfig,
	testAllEntriesOfABConfig
} from "./abConfigs.js";
import { addCube, addFloor, addLeftWall, addRightWall } from "./addGeometry.js";
import { godar1, godar1Inverse } from "./algorithms/godar1.js";
import { godar2 } from "./algorithms/godar2.js";
import { hillmanGrassl, hillmanGrasslInverse } from "./algorithms/hillmanGrassl.js";
import { pak, pakInverse } from "./algorithms/pak.js";
import { rsk, rskInverse } from "./algorithms/rsk.js";
import { sulzgruber, sulzgruberInverse } from "./algorithms/sulzgruber.js";
import {
	hideDimers,
	hideNumbersCanvas,
	show2dView,
	showDimers,
	showHexView,
	showNumbersCanvas,
	updateCameraHeight
} from "./cameraControls.js";
import { addNewArray, editArray, removeAllArrays, removeArray, trimArray } from "./editArrays.js";
import {
	drawAll2dViewText,
	drawSingleCell2dViewText,
	hideFloor,
	hideWalls,
	recalculateHeights,
	removeOutsideFloor,
	showFloor,
	showWalls
} from "./miscUtils.js";
import { drawBoundary, drawBoundaryRect, drawNQuotient } from "./nQuotients.js";
import { runAlgorithm, runExample } from "./runAlgorithm.js";
import {
	colorCubes,
	colorWalls,
	deleteCubes,
	deleteFloor,
	lowerCubes,
	moveCubes,
	raiseCubes,
	revealCubes,
	uncolorCubes
} from "./styleCubes.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { tempShader } from "/scripts/applets/applet.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { convertColor } from "/scripts/src/browser.js";
import { sleep } from "/scripts/src/utils.js";
import * as THREE from "/scripts/three.js";
import { WilsonCPU, WilsonGPU } from "/scripts/wilson.js";

export class PlanePartitions extends AnimationFrameApplet
{
	wilsonNumbers;

	wilsonHidden;
	wilsonHidden2;
	wilsonHidden3;
	wilsonHidden4;

	useFullscreenButton = false;

	backgroundColor = 0x000000;

	resolution = 2000;

	animationTime = 500;

	asymptoteLightness = .6;
	cubeLightness = .4;
	floorLightness = .4;

	infiniteHeight = 50;

	addWalls = false;
	abConfigMode = false;
	wallWidth = 16;
	wallHeight = 16;

	scene;

	orthographicCamera;

	renderer;

	loader;

	cubeTexture;
	cubeTexture2;
	floorTexture;
	floorTexture2;

	cubeGeometry;
	floorGeometry;
	wallLeftGeometry;
	wallRightGeometry;

	ambientLight;



	dimersShown = false;

	pointLight;

	in2dView = false;
	inExactHexView = true;

	currentlyAnimatingCamera = false;

	currentlyRunningAlgorithm = false;

	needDownload = false;

	fontSize = 10;

	arrays = [];

	totalArrayFootprint = 0;
	totalArrayHeight = 0;
	totalArraySize = 0;

	hexViewCameraPos = [15, 15, 15];
	_2dViewCameraPos = [0, 20, 0];



	constructor({
		canvas,
		numbersCanvas,
		useFullscreenButton = true,
		backgroundColor = 0x000000
	}) {
		super(canvas);

		this.useFullscreenButton = useFullscreenButton;

		this.backgroundColor = backgroundColor;

		const hiddenCanvas = this.createHiddenCanvas();
		const hiddenCanvas2 = this.createHiddenCanvas();
		const hiddenCanvas3 = this.createHiddenCanvas();
		const hiddenCanvas4 = this.createHiddenCanvas();

		const options =
		{
			shader: tempShader,

			canvasWidth: this.resolution,

			fullscreenOptions: {
				useFullscreenButton: this.useFullscreenButton,

				enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
				exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

				onSwitch: this.onSwitchFullscreen.bind(this),
				beforeSwitch: this.beforeSwitchFullscreen.bind(this),
			},

			verbose: window.DEBUG,
		};

		this.wilson = new WilsonGPU(canvas, options);



		const optionsNumbers =
		{
			canvasWidth: this.resolution,

			worldWidth: 2,

			maxWorldY: 1,
			minWorldY: -1,

			interactionOptions: {
				useForPanAndZoom: true,
				disallowZooming: true,
				onPanAndZoom: () => this.needNewFrame = true,
			},

			fullscreenOptions: {
				animate: false,
				closeWithEscape: false,
			},

			verbose: window.DEBUG,
		};

		this.wilsonNumbers = new WilsonCPU(numbersCanvas, optionsNumbers);
		this.wilsonForFullscreen = this.wilson;

		this.wilsonNumbers.ctx.fillStyle = convertColor(255, 255, 255);
		
		setTimeout(() =>
		{
			const elements = document.body.querySelectorAll(".WILSON_fullscreen-container");
			elements[0].style.zIndex = 200;
			elements[1].style.zIndex = 300;
			elements[1].style.backgroundColor = convertColor(0, 0, 0, 0);
		}, 50);

		// Not totally sure what's going on here.
		this.wilsonNumbers.exitFullscreen();



		const optionsHidden =
		{
			canvasWidth: 64,

			verbose: window.DEBUG,
		};

		this.wilsonHidden = new WilsonCPU(hiddenCanvas, optionsHidden);
		this.wilsonHidden2 = new WilsonCPU(hiddenCanvas2, optionsHidden);
		this.wilsonHidden3 = new WilsonCPU(hiddenCanvas3, optionsHidden);
		this.wilsonHidden4 = new WilsonCPU(hiddenCanvas4, optionsHidden);

		this.wilsonHidden.ctx.strokeStyle = convertColor(255, 255, 255, 0);
		this.wilsonHidden.ctx._alpha = 1;

		this.wilsonHidden.ctx.fillStyle = convertColor(64, 64, 64);
		this.wilsonHidden.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden.ctx.fillStyle = convertColor(128, 128, 128);
		this.wilsonHidden.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden.ctx.lineWidth = 6;

		this.wilsonHidden2.ctx.strokeStyle = convertColor(255, 255, 255, 0);
		this.wilsonHidden2.ctx._alpha = 1;

		this.wilsonHidden2.ctx.fillStyle = convertColor(64, 64, 64);
		this.wilsonHidden2.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden2.ctx.fillStyle = convertColor(128, 128, 128);
		this.wilsonHidden2.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden2.ctx.lineWidth = 6;



		this.wilsonHidden3.ctx.strokeStyle = convertColor(255, 255, 255, 0);
		this.wilsonHidden3.ctx._alpha = 1;

		this.wilsonHidden3.ctx.fillStyle = convertColor(32, 32, 32);
		this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden3.ctx.fillStyle = convertColor(64, 64, 64);
		this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden3.ctx.lineWidth = 6;



		this.wilsonHidden4.ctx.strokeStyle = convertColor(255, 255, 255, 0);
		this.wilsonHidden4.ctx._alpha = 1;

		this.wilsonHidden4.ctx.fillStyle = convertColor(32, 32, 32, this.addWalls ? 1 : 0);
		this.wilsonHidden4.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden4.ctx.fillStyle = convertColor(64, 64, 64, this.addWalls ? 1 : 0);
		this.wilsonHidden4.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden4.ctx.lineWidth = 6;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(this.backgroundColor);

		this.orthographicCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);



		this.renderer = new THREE.WebGLRenderer({
			canvas: this.wilson.canvas,
			context: this.wilson.gl,
			alpha: true,
		});

		this.renderer.setSize(this.resolution, this.resolution, false);

		this.renderer.useLegacyLights = true;



		this.loader = new THREE.TextureLoader();

		this.cubeTexture = new THREE.CanvasTexture(this.wilsonHidden.canvas);
		this.cubeTexture.minFilter = THREE.LinearFilter;
		this.cubeTexture.magFilter = THREE.NearestFilter;

		this.cubeTexture2 = new THREE.CanvasTexture(this.wilsonHidden2.canvas);
		this.cubeTexture2.minFilter = THREE.LinearFilter;
		this.cubeTexture2.magFilter = THREE.NearestFilter;

		this.floorTexture = new THREE.CanvasTexture(this.wilsonHidden3.canvas);
		this.floorTexture.minFilter = THREE.LinearFilter;
		this.floorTexture.magFilter = THREE.NearestFilter;

		this.floorTexture2 = new THREE.CanvasTexture(this.wilsonHidden4.canvas);
		this.floorTexture2.minFilter = THREE.LinearFilter;
		this.floorTexture2.magFilter = THREE.NearestFilter;

		this.cubeGeometry = new THREE.BoxGeometry();



		this.dimersShown = false;



		this.floorGeometry = new THREE.BoxGeometry(1, .001, 1);
		this.wallLeftGeometry = new THREE.BoxGeometry(.001, 1, 1);
		this.wallRightGeometry = new THREE.BoxGeometry(1, 1, .001);


		this.ambientLight = new THREE.AmbientLight(0xffffff, .2);
		this.scene.add(this.ambientLight);

		this.pointLight = new THREE.PointLight(0xffffff, 3, 10000);
		this.pointLight.position.set(750, 1000, 500);
		this.scene.add(this.pointLight);

		this.resume();
	}

	drawFrame()
	{
		this.inExactHexView = this.wilsonNumbers.worldCenterX === 0;

		for (const object of this.scene.children)
		{
			object.rotation.y = -1.5 * this.wilsonNumbers.worldCenterX;
		}

		this.renderer.render(this.scene, this.orthographicCamera);
	}

	onSwitchFullscreen(isFullscreen)
	{
		if (isFullscreen)
		{
			this.wilsonNumbers.enterFullscreen();

			const containers = document.querySelectorAll(".WILSON_canvas-container");

			containers[0].appendChild(
				document.querySelector(".WILSON_exit-fullscreen-button")
			);
		}

		else
		{
			this.wilsonNumbers.exitFullscreen();
		}

		if (this.in2dView)
		{
			setTimeout(() =>
			{
				changeOpacity({
					element: this.wilsonNumbers.canvas,
					opacity: 1,
					duration: this.animationTime / 5
				});
			}, 300);
		}

		this.resume();
	}

	isValidABConfig = isValidABConfig;
	getMinimalABConfig = getMinimalABConfig;
	iterateThroughEntries = iterateThroughEntries;
	printABConfig = printABConfig;
	testAllEntriesOfABConfig = testAllEntriesOfABConfig;
	getArrayVersionOfABConfig = getArrayVersionOfABConfig;
	colorABConfigRegions = colorABConfigRegions;
	colorABConfigs = colorABConfigs;

	addNewArray = addNewArray;
	editArray = editArray;
	trimArray = trimArray;
	removeArray = removeArray;
	removeAllArrays = removeAllArrays;

	addCube = addCube;
	addFloor = addFloor;
	addLeftWall = addLeftWall;
	addRightWall = addRightWall;

	showHexView = showHexView;
	show2dView = show2dView;
	showNumbersCanvas = showNumbersCanvas;
	hideNumbersCanvas = hideNumbersCanvas;
	updateCameraHeight = updateCameraHeight;
	showDimers = showDimers;
	hideDimers = hideDimers;

	showFloor = showFloor;
	hideFloor = hideFloor;
	showWalls = showWalls;
	hideWalls = hideWalls;
	removeOutsideFloor = removeOutsideFloor;
	recalculateHeights = recalculateHeights;
	drawAll2dViewText = drawAll2dViewText;
	drawSingleCell2dViewText = drawSingleCell2dViewText;

	colorCubes = colorCubes;
	uncolorCubes = uncolorCubes;
	colorWalls = colorWalls;
	raiseCubes = raiseCubes;
	lowerCubes = lowerCubes;
	moveCubes = moveCubes;
	revealCubes = revealCubes;
	deleteCubes = deleteCubes;
	deleteFloor = deleteFloor;

	drawBoundary = drawBoundary;
	drawNQuotient = drawNQuotient;
	drawBoundaryRect = drawBoundaryRect;

	runExample = runExample;
	runAlgorithm = runAlgorithm;

	hillmanGrassl = hillmanGrassl;
	hillmanGrasslInverse = hillmanGrasslInverse;

	pak = pak;
	pakInverse = pakInverse;

	sulzgruber = sulzgruber;
	sulzgruberInverse = sulzgruberInverse;

	rsk = rsk;
	rskInverse = rskInverse;

	godar1 = godar1;
	godar1Inverse = godar1Inverse;

	godar2 = godar2;

	algorithmData = {
		hillmanGrassl:
		{
			method: this.hillmanGrassl,
			inputType: ["pp"]
		},

		hillmanGrasslInverse:
		{
			method: this.hillmanGrasslInverse,
			inputType: ["tableau"]
		},

		pak:
		{
			method: this.pak,
			inputType: ["pp"]
		},

		pakInverse:
		{
			method: this.pakInverse,
			inputType: ["tableau"]
		},

		sulzgruber:
		{
			method: this.sulzgruber,
			inputType: ["pp"]
		},

		sulzgruberInverse:
		{
			method: this.sulzgruberInverse,
			inputType: ["tableau"]
		},

		rsk:
		{
			method: this.rsk,
			inputType: ["ssyt", "ssyt"],
			sameShape: true
		},

		rskInverse:
		{
			method: this.rskInverse,
			inputType: ["tableau"]
		},

		godar1:
		{
			method: this.godar1,
			inputType: ["pp"]
		},

		godar1Inverse:
		{
			method: this.godar1Inverse,
			inputType: ["pp", "pp"]
		},

		godar2:
		{
			method: this.godar2,
			inputType: ["pp"]
		},
	};

	async beforeSwitchFullscreen()
	{
		this.pause();

		if (this.in2dView)
		{
			await changeOpacity({
				element: this.wilsonNumbers.canvas,
				opacity: 0,
				duration: this.animationTime / 5
			});
		}

		await sleep(33);
	}
}