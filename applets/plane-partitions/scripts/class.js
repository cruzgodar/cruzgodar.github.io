import { addCube, addFloor, addLeftWall, addRightWall } from "./addGeometry.js";
import { godar1, godar1Inverse } from "./algorithms/goder1.js";
import { hillmanGrassl, hillmanGrasslInverse } from "./algorithms/hillmanGrassl.js";
import { pak, pakInverse } from "./algorithms/pak.js";
import { rsk, rskInverse } from "./algorithms/rsk.js";
import { sulzgruber, sulzgruberInverse } from "./algorithms/sulzgruber.js";
import {
	hideDimers,
	show2dView,
	showDimers,
	showHexView,
	updateCameraHeight
} from "./cameraControls.js";
import { addNewArray, editArray, removeArray, trimArray } from "./editArrays.js";
import {
	generateRandomPlanePartition,
	generateRandomSsyt,
	generateRandomTableau
} from "./generateRandomData.js";
import {
	drawAll2dViewText,
	drawSingleCell2dViewText,
	hideFloor,
	recalculateHeights,
	removeOutsideFloor,
	showFloor
} from "./miscUtils.js";
import { drawBoundary, drawBoundaryRect, drawNQuotient } from "./nQuotients.js";
import { arrayToAscii, parseArray, verifyPp, verifySsyt } from "./parseAndVerify.js";
import { runAlgorithm, runExample } from "./runAlgorithm.js";
import {
	colorCubes,
	deleteCubes,
	deleteFloor,
	lowerCubes,
	moveCubes,
	raiseCubes,
	revealCubes,
	uncolorCubes
} from "./styleCubes.js";
import { AnimationFrameApplet } from "/scripts/applets/animationFrameApplet.js";
import { convertColor } from "/scripts/src/browser.js";
import { $$ } from "/scripts/src/main.js";
import * as THREE from "/scripts/three.js";
import { Wilson } from "/scripts/wilson.js";

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

	animationTime = 600;

	asymptoteLightness = .6;
	cubeLightness = .4;
	floorLightness = .4;

	infiniteHeight = 100;

	addWalls = false;
	wallWidth = 17;
	wallHeight = 17;

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

	rotationY = 0;
	rotationYVelocity = 0;
	nextRotationYVelocity = 0;
	lastRotationYVelocities = [];

	rotationYVelocityFriction = .94;
	rotationYVelocityStartThreshhold = .005;
	rotationYVelocityStopThreshhold = .0005;

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
		}
	};



	constructor({
		canvas,
		numbersCanvas,
		useFullscreenButton = true
	}) {
		super(canvas);

		this.useFullscreenButton = useFullscreenButton;



		const hiddenCanvas = this.createHiddenCanvas();
		const hiddenCanvas2 = this.createHiddenCanvas();
		const hiddenCanvas3 = this.createHiddenCanvas();
		const hiddenCanvas4 = this.createHiddenCanvas();



		const optionsNumbers =
		{
			renderer: "cpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			useFullscreenButton: false,

			mousedownCallback: this.onGrabCanvas.bind(this),
			touchstartCallback: this.onGrabCanvas.bind(this),

			mousedragCallback: this.onDragCanvas.bind(this),
			touchmoveCallback: this.onDragCanvas.bind(this),

			mouseupCallback: this.onReleaseCanvas.bind(this),
			touchendCallback: this.onReleaseCanvas.bind(this)
		};

		this.wilsonNumbers = new Wilson(numbersCanvas, optionsNumbers);

		this.wilsonNumbers.ctx.fillStyle = convertColor(255, 255, 255);

		document.body.querySelector(".wilson-fullscreen-components-container").style
			.setProperty("z-index", 200, "important");

		$$(".wilson-applet-canvas-container")
			.forEach(element => element.style
				.setProperty("background-color", convertColor(0, 0, 0, 0), "important")
			);



		const options =
		{
			renderer: "gpu",

			canvasWidth: this.resolution,
			canvasHeight: this.resolution,

			useFullscreen: true,

			useFullscreenButton: this.useFullscreenButton,

			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",

			switchFullscreenCallback: this.switchFullscreen.bind(this)
		};

		this.wilson = new Wilson(canvas, options);



		const optionsHidden =
		{
			renderer: "cpu",

			canvasWidth: 64,
			canvasHeight: 64
		};

		this.wilsonHidden = new Wilson(hiddenCanvas, optionsHidden);
		this.wilsonHidden2 = new Wilson(hiddenCanvas2, optionsHidden);
		this.wilsonHidden3 = new Wilson(hiddenCanvas3, optionsHidden);
		this.wilsonHidden4 = new Wilson(hiddenCanvas4, optionsHidden);

		this.wilsonHidden.ctx.strokeStyle = convertColor(255, 255, 255);
		this.wilsonHidden.ctx._alpha = 1;

		this.wilsonHidden.ctx.fillStyle = convertColor(64, 64, 64);
		this.wilsonHidden.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden.ctx.fillStyle = convertColor(128, 128, 128);
		this.wilsonHidden.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden.ctx.lineWidth = 6;

		this.wilsonHidden2.ctx.strokeStyle = convertColor(255, 255, 255);
		this.wilsonHidden2.ctx._alpha = 1;

		this.wilsonHidden2.ctx.fillStyle = convertColor(64, 64, 64);
		this.wilsonHidden2.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden2.ctx.fillStyle = convertColor(128, 128, 128);
		this.wilsonHidden2.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden2.ctx.lineWidth = 6;



		this.wilsonHidden3.ctx.strokeStyle = convertColor(255, 255, 255);
		this.wilsonHidden3.ctx._alpha = 1;

		this.wilsonHidden3.ctx.fillStyle = convertColor(32, 32, 32, this.addWalls ? 1 : 0);
		this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);

		this.wilsonHidden3.ctx.fillStyle = convertColor(64, 64, 64, this.addWalls ? 1 : 0);
		this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);

		this.wilsonHidden3.ctx.lineWidth = 6;



		this.wilsonHidden4.ctx.strokeStyle = convertColor(255, 255, 255);
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
			antialias: true,
			context: this.wilson.gl
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



	onGrabCanvas()
	{
		this.inExactHexView = false;

		this.rotationYVelocity = 0;

		this.lastRotationYVelocities = [0, 0, 0, 0];
	}

	onDragCanvas(x, y, xDelta)
	{
		if (this.in2dView)
		{
			return;
		}

		this.rotationY += xDelta;

		if (this.rotationY > Math.PI)
		{
			this.rotationY -= 2 * Math.PI;
		}

		else if (this.rotationY < -Math.PI)
		{
			this.rotationY += 2 * Math.PI;
		}

		this.scene.children.forEach(object => object.rotation.y = this.rotationY);

		this.nextRotationYVelocity = xDelta;
	}

	onReleaseCanvas()
	{
		if (!this.in2dView)
		{
			let maxIndex = 0;

			this.lastRotationYVelocities.forEach((velocity, index) =>
			{
				if (Math.abs(velocity) > this.rotationYVelocity)
				{
					this.rotationYVelocity = Math.abs(velocity);
					maxIndex = index;
				}
			});

			if (this.rotationYVelocity < this.rotationYVelocityStartThreshhold)
			{
				this.rotationYVelocity = 0;
				return;
			}

			this.rotationYVelocity = this.lastRotationYVelocities[maxIndex];
		}

		this.lastRotationYVelocities = [0, 0, 0, 0];
	}



	drawFrame()
	{
		this.renderer.render(this.scene, this.orthographicCamera);



		this.lastRotationYVelocities.push(this.nextRotationYVelocity);
		this.lastRotationYVelocities.shift();

		this.nextRotationYVelocity = 0;

		if (this.rotationYVelocity !== 0)
		{
			this.rotationY += this.rotationYVelocity;

			this.scene.children.forEach(object => object.rotation.y = this.rotationY);

			this.rotationYVelocity *= this.rotationYVelocityFriction;

			if (Math.abs(this.rotationYVelocity) < this.rotationYVelocityStopThreshhold)
			{
				this.rotationYVelocity = 0;
			}
		}



		if (this.rotationY > Math.PI)
		{
			this.rotationY -= 2 * Math.PI;
		}

		else if (this.rotationY < -Math.PI)
		{
			this.rotationY += 2 * Math.PI;
		}



		if (this.needDownload)
		{
			this.needDownload = false;

			this.wilson.canvas.toBlob(blob =>
			{
				const link = document.createElement("a");

				link.download = "a-plane-partition.png";

				link.href = window.URL.createObjectURL(blob);

				link.click();

				link.remove();
			});
		}



		this.needNewFrame = true;
	}

	switchFullscreen()
	{
		if (this.useFullscreenButton)
		{
			const exitFullscreenButtonElement =
				document.body.querySelector(".wilson-exit-fullscreen-button");

			if (exitFullscreenButtonElement)
			{
				exitFullscreenButtonElement.style.setProperty("z-index", "300", "important");
			}
		}

		if (!this.in2dView)
		{
			this.wilsonNumbers.ctx.clearRect(
				0,
				0,
				this.wilsonNumbers.canvasWidth,
				this.wilsonNumbers.canvasHeight
			);
		}

		this.wilsonNumbers.fullscreen.switchFullscreen();
	}

	isValidABConfig({
		lambda,
		mu,
		nu,
		A,
		B
	}) {
		while (lambda.length < nu[0])
		{
			lambda.push(0);
		}

		while (mu.length < nu.length)
		{
			mu.push(0);
		}

		// Elements of this are of the form [x, y, z, label], where a label of 0 is unlabeled.
		const boxes = [];

		let numNegativeARows = 0;
		let numNegativeACols = 0;

		while (A[numNegativeARows][0] === Infinity)
		{
			numNegativeARows++;
		}

		while (A[0][numNegativeACols] === Infinity)
		{
			numNegativeACols++;
		}

		if (A[numNegativeARows - 1][numNegativeACols - 1] !== Infinity)
		{
			throw new Error("Infinite part of A is not rectangular!");
		}

		for (let i = 0; i < A.length; i++)
		{
			for (let j = 0; j < A[i].length; j++)
			{
				const row = i - numNegativeARows;
				const col = j - numNegativeACols;

				if (row < 0 && col < 0)
				{
					continue;
				}

				const inNu = row >= 0 && row < nu.length && col >= 0 && col < nu[row];

				const [maxAEntry, maxBEntry] = (() =>
				{
					if (row < 0)
					{
						return [lambda[col], 0];
					}
					
					if (col < 0)
					{
						return [mu[row], 0];
					}
					
					if (inNu)
					{
						return [
							Math.min(lambda[col], mu[row]),
							Math.max(lambda[col], mu[row])
						];
					}

					return [0, Math.min(lambda[col], mu[row])];
				})();

				const minEntry = inNu ? -5 : 0;

				for (
					let k = minEntry;
					k < Math.max(maxAEntry, maxBEntry);
					k++
				) {
					const [region, label] = (() =>
					{
						if (row < 0)
						{
							return [1, 1];
						}

						if (col < 0)
						{
							return [1, 2];
						}

						if (k < 0)
						{
							return [1, 3];
						}
						
						if (inNu && k < Math.min(lambda[col], mu[row]))
						{
							return [3, 0];
						}

						if (!inNu)
						{
							return [2, 3];
						}

						if (k >= lambda[col])
						{
							return [2, 1];
						}

						if (k >= mu[row])
						{
							return [2, 2];
						}

						throw new Error("Region/label code is broken");
					})();

					const boxIsInA = A[i][j] <= k && k < maxAEntry;
					const boxIsInB = (row >= 0 && col >= 0)
						? B[row][col] <= k && k < maxBEntry
						: false;
					const boxCouldBeInB = (row >= 0 && col >= 0)
						? k < maxBEntry && k >= 0
						: false;

					if (boxIsInA)
					{
						console.log(row, col, k, region, label);
					}

					if (region === 1 && boxIsInA)
					{
						boxes.push([row, col, k, label]);
					}

					else if (region === 2 && !boxIsInB && boxCouldBeInB)
					{
						boxes.push([row, col, k, label]);
					}

					else if (
						region === 3
						&& ((boxIsInA && !boxIsInB) || (!boxIsInA && boxIsInB))
					) {
						boxes.push([row, col, k, label]);
					}
				}
			}
		}



		const components = [];
		const unexplored = structuredClone(boxes);

		const directions = [
			[-1, 0, 0],
			[1, 0, 0],
			[0, -1, 0],
			[0, 1, 0],
			[0, 0, -1],
			[0, 0, 1]
		];
		
		while (unexplored.length !== 0)
		{
			let component = [];
			let active = [unexplored[0]];
			unexplored.splice(0, 1);

			while (active.length !== 0)
			{
				const nextActive = [];

				// Each element of active checks everything around it.
				active.forEach(activeBox =>
				{
					directions.forEach(direction =>
					{
						const adjacentBox = [
							activeBox[0] + direction[0],
							activeBox[1] + direction[1],
							activeBox[2] + direction[2]
						];

						const index = this.boxIsInArray(adjacentBox, unexplored);

						if (index !== -1)
						{
							nextActive.push(unexplored[index]);
							unexplored.splice(index, 1);
						}
					});
				});

				component = component.concat(active);
				active = nextActive;
			}

			components.push(component);
		}



		// Finally, determine if there's a label conflict.

		for (let i = 0; i < components.length; i++)
		{
			const labels = new Set(components[i].map(box => box[3]));
			
			labels.delete(0);

			console.log(components[i], labels);

			if (labels.size > 1)
			{
				return false;
			}
		}

		return true;
	}

	boxIsInArray(box, array)
	{
		for (let i = 0; i < array.length; i++)
		{
			const element = array[i];

			if (
				element[0] === box[0]
				&& element[1] === box[1]
				&& element[2] === box[2]
			) {
				return i;
			}
		}

		return -1;
	}

	static generateRandomPlanePartition = generateRandomPlanePartition;
	static generateRandomTableau = generateRandomTableau;
	static generateRandomSsyt = generateRandomSsyt;

	static parseArray = parseArray;
	static arrayToAscii = arrayToAscii;
	static verifyPp = verifyPp;
	static verifySsyt = verifySsyt;

	addNewArray = addNewArray;
	editArray = editArray;
	trimArray = trimArray;
	removeArray = removeArray;

	addCube = addCube;
	addFloor = addFloor;
	addLeftWall = addLeftWall;
	addRightWall = addRightWall;

	showHexView = showHexView;
	show2dView = show2dView;
	updateCameraHeight = updateCameraHeight;
	showDimers = showDimers;
	hideDimers = hideDimers;

	showFloor = showFloor;
	hideFloor = hideFloor;
	removeOutsideFloor = removeOutsideFloor;
	recalculateHeights = recalculateHeights;
	drawAll2dViewText = drawAll2dViewText;
	drawSingleCell2dViewText = drawSingleCell2dViewText;

	colorCubes = colorCubes;
	uncolorCubes = uncolorCubes;
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
}