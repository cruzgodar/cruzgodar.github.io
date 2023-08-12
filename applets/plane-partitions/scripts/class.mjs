import { Applet } from "/scripts/src/applets.mjs";
import { $$ } from "/scripts/src/main.mjs";

export class PlanePartitions extends Applet
{
	loadPromise = null;
	
	wilsonNumbers = null;
	
	wilsonHidden = null;
	wilsonHidden2 = null;
	wilsonHidden3 = null;
	wilsonHidden4 = null;
	
	useFullscreenButton = false;
	
	resolution = 2000;
	
	animationTime = 600;
	
	asymptoteLightness = .6;
	cubeLightness = .4;
	floorLightness = .4;
	
	infiniteHeight = 100;
	
	addWalls = false;
	wallSize = 30;
	
	scene = null;
	
	orthographicCamera = null;
	
	renderer = null;
	
	loader = null;
	
	cubeTexture = null;
	cubeTexture2 = null;
	floorTexture = null;
	floorTexture2 = null;
	
	cubeGeometry = null;
	floorGeometry = null;
	wallLeftGeometry = null;
	wallRightGeometry = null;
	
	ambientLight = null;
	
	
	
	dimersShown = false;
	
	ambientLight = null;
	pointLight = null;
	
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
	
	algorithmData =
	{
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
	
	
	
	constructor(canvas, numbersCanvas, useFullscreenButton = true)
	{
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
		
		this.wilsonNumbers.ctx.fillStyle = "rgb(255, 255, 255)";
		
		document.body.querySelector(".wilson-fullscreen-components-container").style.setProperty("z-index", 200, "important");
		
		$$(".wilson-applet-canvas-container").forEach(element => element.style.setProperty("background-color", "rgba(0, 0, 0, 0)", "important"));
		
		
		
		const options =
		{
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
		
		this.wilsonHidden.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilsonHidden.ctx.Alpha = 1;
		
		this.wilsonHidden.ctx.fillStyle = "rgba(64, 64, 64, 1)"
		this.wilsonHidden.ctx.fillRect(0, 0, 64, 64);
		
		this.wilsonHidden.ctx.fillStyle = "rgba(128, 128, 128, 1)"
		this.wilsonHidden.ctx.fillRect(4, 4, 56, 56);
		
		this.wilsonHidden.ctx.lineWidth = 6;
		
		
		
		this.wilsonHidden2.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilsonHidden2.ctx.Alpha = 1;
		
		this.wilsonHidden2.ctx.fillStyle = "rgba(64, 64, 64, 1)"
		this.wilsonHidden2.ctx.fillRect(0, 0, 64, 64);
		
		this.wilsonHidden2.ctx.fillStyle = "rgba(128, 128, 128, 1)"
		this.wilsonHidden2.ctx.fillRect(4, 4, 56, 56);
		
		this.wilsonHidden2.ctx.lineWidth = 6;
		
		
		
		this.wilsonHidden3.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilsonHidden3.ctx.Alpha = 1;
		
		this.wilsonHidden3.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : 1})`;
		this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);
		
		this.wilsonHidden3.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : 1})`;
		this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);
		
		this.wilsonHidden3.ctx.lineWidth = 6;
		
		
		
		this.wilsonHidden4.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilsonHidden4.ctx.Alpha = 1;
		
		this.wilsonHidden4.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : 1})`;
		this.wilsonHidden4.ctx.fillRect(0, 0, 64, 64);
		
		this.wilsonHidden4.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : 1})`;
		this.wilsonHidden4.ctx.fillRect(4, 4, 56, 56);
		
		this.wilsonHidden4.ctx.lineWidth = 6;
		
		
		
		this.loadPromise = new Promise(async (resolve, reject) =>
		{
			if (!Site.scriptsLoaded["three"])
			{
				await Site.loadScript("/scripts/three.min.js")
				
				Site.scriptsLoaded["three"] = true;
			}
			
			if (!Site.scriptsLoaded["lodash"])
			{
				await Site.loadScript("/scripts/lodash.min.js");
				
				Site.scriptsLoaded["lodash"] = true;
			}
			
			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color(0x000000);
			
			this.orthographicCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);
			
			
			
			this.renderer = new THREE.WebGLRenderer({canvas: this.wilson.canvas, antialias: true});
			
			this.renderer.setSize(this.resolution, this.resolution, false);
			
			
			
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
			
			this.drawFrame();
			
			resolve();
		});
	}
	
	
	
	onGrabCanvas(x, y, event)
	{
		this.inExactHexView = false;
		
		this.rotationYVelocity = 0;
		
		this.lastRotationYVelocities = [0, 0, 0, 0];
	}
	
	onDragCanvas(x, y, xDelta, yDelta, event)
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
	
	onReleaseCanvas(x, y, event)
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
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	switchFullscreen()
	{
		if (this.useFullscreenButton)
		{
			//Needs to be document.body because that's where Wilson puts this stuff.
			try {document.body.querySelector(".wilson-exit-fullscreen-button").style.setProperty("z-index", "300", "important")}
			catch(ex) {}
		}
		
		if (!this.in2dView)
		{
			this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
		}
		
		this.wilsonNumbers.fullscreen.switchFullscreen();	
	}
	
	
	
	generateRandomPlanePartition()
	{
		const sideLength = Math.floor(Math.random() * 3) + 5;
		
		const maxEntry = Math.floor(Math.random() * 5) + 10;
		
		let planePartition = new Array(sideLength);
		
		
		
		for (let i = 0; i < sideLength; i++)
		{
			planePartition[i] = new Array(sideLength);
		}
		
		planePartition[0][0] = maxEntry;
		
		for (let j = 1; j < sideLength; j++)
		{
			planePartition[0][j] = Math.max(planePartition[0][j - 1] - Math.floor(Math.random() * 4), 0);
		}
		
		for (let i = 1; i < sideLength; i++)
		{
			planePartition[i][0] = Math.max(planePartition[i - 1][0] - Math.floor(Math.random() * 4), 0);
			
			for (let j = 1; j < sideLength; j++)
			{
				planePartition[i][j] = Math.max(Math.min(planePartition[i][j - 1], planePartition[i - 1][j]) - Math.floor(Math.random() * 4), 0);
			}
		}
		
		for (let i = 0; i < sideLength; i++)
		{
			planePartition[sideLength - 1][i] = 0;
			planePartition[i][sideLength - 1] = 0;
		}
		
		
		return planePartition;
	}
	
	
	
	//Does not return a string, unlike the previous function.
	generateRandomTableau()
	{
		const sideLength = Math.floor(Math.random() * 3) + 5;
		
		let tableau = new Array(sideLength);
		
		
		
		for (let i = 0; i < sideLength; i++)
		{
			tableau[i] = new Array(sideLength);
			
			for (let j = 0; j < sideLength; j++)
			{
				if (Math.random() < .75 / sideLength)
				{
					tableau[i][j] = Math.floor(Math.random() * 3) + 1;
				}
				
				else
				{
					tableau[i][j] = 0;
				}
			}
		}
		
		for (let i = 0; i < sideLength; i++)
		{
			tableau[i][sideLength - 1] = 0;
			tableau[sideLength - 1][i] = 0;
		}
		
		return tableau;
	}
	
	
	
	//Also doesn't return a string.
	generateRandomSsyt()
	{
		const sideLength = Math.floor(Math.random() * 3) + 2;
		
		let ssyt = new Array(sideLength);
		
		
		
		for (let i = 0; i < sideLength; i++)
		{
			ssyt[i] = new Array(sideLength);
		}
		
		ssyt[0][0] = Math.floor(Math.random() * 2);
		
		for (let j = 1; j < sideLength; j++)
		{
			ssyt[0][j] = ssyt[0][j - 1] + Math.floor(Math.random() * 2);
		}
		
		for (let i = 1; i < sideLength; i++)
		{
			ssyt[i][0] = ssyt[i - 1][0] + 1 + Math.floor(Math.random() * 2);
			
			for (let j = 1; j < sideLength; j++)
			{
				ssyt[i][j] = Math.max(ssyt[i][j - 1], ssyt[i - 1][j] + 1) + Math.floor(Math.random() * 2);
			}
		}
		
		
		
		return ssyt;
	}
	
	
	
	//Turns a block of numbers into an array.
	parseArray(data)
	{
		const splitData = data.split("\n");
		
		let numRows = splitData.length;
		
		let splitRows = new Array(splitData.length);
		
		for (let i = 0; i < splitRows.length; i++)
		{
			splitRows[i] = splitData[i].split(" ");
			
			for (let j = 0; j < splitRows[i].length; j++)
			{
				if (splitRows[i][j] === "")
				{
					splitRows[i].splice(j, 1);
					j--;
				}
			}
		}
		
		let numCols = splitRows[0].length;
		
		
		
		if (data.indexOf(">") === -1)
		{
			for (let i = 0; i < splitRows.length; i++)
			{
				splitRows[i].push("0");
			}
			
			numCols++;
		}
		
		if (data.indexOf("v") === -1)
		{
			splitRows.push(["0"]);
			
			numRows++;
		}
		
		let size = Math.max(numRows, numCols);
		
		let array = new Array(size);
		
		
		
		
		
		for (let i = 0; i < numRows; i++)
		{
			array[i] = new Array(size);
			
			for (let j = 0; j < splitRows[i].length; j++)
			{
				//A vertically upward leg.
				if (splitRows[i][j] === "^")
				{
					array[i][j] = Infinity;
				}
				
				//A leg pointing right or down.
				else if (splitRows[i][j] === ">")
				{
					array[i][j] = array[i][j - 1];
				}
				
				else if (splitRows[i][j] === "v")
				{
					array[i][j] = array[i - 1][j];
				}
				
				else
				{
					array[i][j] = parseInt(splitRows[i][j]);
				}
			}
			
			for (let j = splitRows[i].length; j < size; j++)
			{
				array[i][j] = 0;
			}
		}
		
		for (let i = numRows; i < size; i++)
		{
			array[i] = new Array(size);
				
			for (let j = 0; j < size; j++)
			{
				array[i][j] = 0;
			}
		}
		
		
		
		return array;
	}
	
	
	
	arrayToAscii(numbers)
	{
		let numCharacters = 1;
		
		for (let i = 0; i < numbers.length; i++)
		{
			for (let j = 0; j < numbers.length; j++)
			{
				if (numbers[i][j] !== Infinity)
				{
					numCharacters = Math.max(numCharacters, `${numbers[i][j]}`.length);
				}
			}	
		}
		
		numCharacters++;
		
		
		
		let text = "";
		
		for (let i = 0; i < numbers.length - 1; i++)
		{
			for (let j = 0; j < numbers.length - 1; j++)
			{
				if (numbers[i][j] === Infinity)
				{
					for (let k = 0; k < numCharacters - 1 - (j === 0); k++)
					{
						text += " ";
					}
					
					text += "^";
				}
				
				else
				{
					let len = `${numbers[i][j]}`.length;
					
					for (let k = 0; k < numCharacters - len - (j === 0); k++)
					{
						text += " ";
					}
					
					text += numbers[i][j];
				}
			}
			
			
			
			if (numbers[i][numbers.length - 1] !== 0)
			{
				for (let k = 0; k < numCharacters - 1; k++)
				{
					text += " ";
				}
				
				text += ">";
			}
			
			
			
			if (i !== numbers.length - 2)
			{
				text += "\n";
			}
		}
		
		
		
		if (numbers[numbers.length - 1][0] !== 0)
		{
			text += "\n";
			
			for (let j = 0; j < numbers.length - 1; j++)
			{
				if (numbers[numbers.length - 1][j] !== 0)
				{
					for (let k = 0; k < numCharacters - 1 - (j === 0); k++)
					{
						text += " ";
					}
					
					text += "v";
				}
			}
		}
		
		
		
		return text;
	}
	
	
	
	verifyPp(planePartition)
	{
		for (let i = 0; i < planePartition.length - 1; i++)
		{
			for (let j = 0; j < planePartition[i].length - 1; j++)
			{
				if (planePartition[i][j] < planePartition[i + 1][j] || planePartition[i][j] < planePartition[i][j + 1])
				{
					return false;
				}
			}
		}
		
		return true;
	}
	
	
	
	verifySsyt(ssyt)
	{
		for (let i = 0; i < ssyt.length - 1; i++)
		{
			for (let j = 0; j < ssyt[i].length - 1; j++)
			{
				if ((ssyt[i + 1][j] !== 0 && ssyt[i][j] >= ssyt[i + 1][j]) || (ssyt[i][j + 1] !== 0 && ssyt[i][j] > ssyt[i][j + 1]))
				{
					return false;
				}
			}
		}
		
		return true;
	}
	
	
	
	displayError(message)
	{
		
	}
	
	
	
	addNewArray(index, numbers, keepNumbersCanvasVisible = false, horizontalLegs = true)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimating)
			{
				resolve();
				return;
			}
			
			
			
			let array = {
				numbers: numbers,
				cubes: [],
				floor: [],
				leftWall: [],
				rightWall: [],
				
				cubeGroup: null,
				
				centerOffset: 0,
				partialFootprintSum: 0,
				
				footprint: 0,
				height: 0,
				size: 0
			};
			
			if (this.in2dView && !keepNumbersCanvasVisible)
			{
				await changeOpacity(this.wilsonNumbers.canvas, 0, this.animationTime / 5);
			}
			
			
			
			this.arrays.splice(index, 0, array);
			
			array.footprint = array.numbers.length;
			
			//Update the other arrays.
			for (let i = index; i < this.arrays.length; i++)
			{
				this.arrays[i].partialFootprintSum = this.arrays[i].footprint;
				
				if (i !== 0)
				{
					this.arrays[i].centerOffset = this.arrays[i - 1].centerOffset + this.arrays[i - 1].footprint / 2 + this.arrays[i].footprint / 2 + 1;
					
					this.arrays[i].partialFootprintSum += this.arrays[i - 1].partialFootprintSum + 1;
				}
				
				else
				{
					this.arrays[i].centerOffset = 0;
				}
				
				if (i !== index)
				{
					if (this.in2dView)
					{
						anime({
							targets: this.arrays[i].cubeGroup.position,
							x: this.arrays[i].centerOffset,
							y: 0,
							z: 0,
							duration: this.animationTime,
							easing: "easeInOutQuad"
						});
					}
					
					else
					{
						anime({
							targets: this.arrays[i].cubeGroup.position,
							x: this.arrays[i].centerOffset,
							y: 0,
							z: -this.arrays[i].centerOffset,
							duration: this.animationTime,
							easing: "easeInOutQuad"
						});
					}
				}
			}
			
			
			
			array.cubeGroup = new THREE.Object3D();
			this.scene.add(array.cubeGroup);
			
			if (!this.addWalls)
			{
				if (this.in2dView)
				{
					array.cubeGroup.position.set(array.centerOffset, 0, 0);
				}
				
				else
				{
					array.cubeGroup.position.set(array.centerOffset, 0, -array.centerOffset);
				}
			}
			
			array.cubeGroup.rotation.y = this.rotationY;
			
			
			
			array.cubes = new Array(array.footprint);
			array.floor = new Array(array.footprint);
			
			for (let i = 0; i < array.footprint; i++)
			{
				array.cubes[i] = new Array(array.footprint);
				array.floor[i] = new Array(array.footprint);
				
				for (let j = 0; j < array.footprint; j++)
				{
					if (array.numbers[i][j] !== Infinity)
					{
						array.cubes[i][j] = new Array(array.numbers[i][j]);
						
						if (array.numbers[i][j] > array.height)
						{
							array.height = array.numbers[i][j];
						}
						
						array.floor[i][j] = this.addFloor(array, j, i);
						
						
						
						if (horizontalLegs)
						{
							const legHeight = Math.max(array.numbers[i][array.footprint - 1], array.numbers[array.footprint - 1][j]);
							
							for (let k = 0; k < legHeight; k++)
							{
								array.cubes[i][j][k] = this.addCube(array, j, k, i, 0, 0, this.asymptoteLightness);
							}
							
							for (let k = legHeight; k < array.numbers[i][j]; k++)
							{
								array.cubes[i][j][k] = this.addCube(array, j, k, i);
							}
						}
						
						else
						{
							for (let k = 0; k < array.numbers[i][j]; k++)
							{
								array.cubes[i][j][k] = this.addCube(array, j, k, i);
							}
						}
					}
					
					
					else
					{
						array.cubes[i][j] = new Array(this.infiniteHeight);
						
						array.floor[i][j] = this.addFloor(array, j, i);
						
						for (let k = 0; k < this.infiniteHeight; k++)
						{
							array.cubes[i][j][k] = this.addCube(array, j, k, i, 0, 0, this.asymptoteLightness);
						}
					}	
				}
			}
			
			
			
			//Add walls. Disabled by default.
			if (this.addWalls)
			{
				array.leftWall = new Array(this.wallSize);
				array.rightWall = new Array(this.wallSize);
				
				for (let i = 0; i < this.wallSize; i++)
				{
					array.leftWall[i] = new Array(2 * this.wallSize);
					array.rightWall[i] = new Array(2 * this.wallSize);
				}
				
				for (let i = 0; i < this.wallSize; i++)
				{
					for (let j = 0; j < 2 * this.wallSize; j++)
					{
						array.leftWall[i][j] = this.addLeftWall(array, j, i);
						array.rightWall[i][j] = this.addRightWall(array, i, j);
					}
				}
			}
			
			
			array.size = Math.max(array.footprint, array.height);
			
			this.totalArrayFootprint += array.footprint + 1;
			this.totalArrayHeight = Math.max(this.totalArrayHeight, array.height);
			this.totalArraySize = Math.max(this.totalArrayFootprint, this.totalArrayHeight);
			
			
			
			if (this.arrays.length === 1 && !keepNumbersCanvasVisible)
			{
				this.hexViewCameraPos = [this.totalArraySize, this.totalArraySize + this.totalArrayHeight / 3, this.totalArraySize];
				this._2dViewCameraPos = [0, this.totalArraySize + 10, 0];
				
				if (this.in2dView && !keepNumbersCanvasVisible)
				{
					this.updateCameraHeight(true);
				}
				
				else
				{
					this.orthographicCamera.left = -this.totalArraySize;
					this.orthographicCamera.right = this.totalArraySize;
					this.orthographicCamera.top = this.totalArraySize;
					this.orthographicCamera.bottom = -this.totalArraySize;
					this.orthographicCamera.position.set(this.hexViewCameraPos[0], this.hexViewCameraPos[1], this.hexViewCameraPos[2]);
					this.orthographicCamera.rotation.set(-0.785398163, 0.615479709, 0.523598775);
					this.orthographicCamera.updateProjectionMatrix();
				}
			}
			
			else if (!this.addWalls && !keepNumbersCanvasVisible)
			{
				this.updateCameraHeight(true);
			}
			
			
			
			if (index !== this.arrays.length - 1)
			{
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			}
			
			
			
			let thingsToAnimate = [];
			
			array.cubeGroup.traverse(node =>
			{
				if (node.material)
				{
					node.material.forEach(material => thingsToAnimate.push(material));
				}
			});
			
			await new Promise(async (resolve, reject) =>
			{
				anime({
					targets: thingsToAnimate,
					opacity: 1,
					duration: this.animationTime / 2,
					easing: "easeOutQuad",
					complete: resolve
				});
			});
			
			
			
			if (this.in2dView && !keepNumbersCanvasVisible)
			{
				this.drawAll2dViewText();
			}
			
			resolve(array);
		});	
	}
	
	
	
	editArray(index, numbers)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.displayError(`No array at index ${index}`);
				
				return;
			}
			
			await this.removeArray(index);
			
			await this.addNewArray(index, numbers);
			
			if (!this.in2dView)
			{
				this.updateCameraHeight();
			}	
			
			resolve();
		});	
	}
	
	
	//Resizes the array into the minimum possible square.
	trimArray(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.displayError(`No array at index ${index}`);
				
				return;
			}
			
			let array = arrays[index];
			
			let numbers = array.numbers;
			
			
			
			let minSize = 0;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== 0)
					{
						minSize = Math.max(minSize, Math.max(i + 1, j + 1));
					}
				}
			}
			
			
			
			let newNumbers = new Array(minSize);
			
			for (let i = 0; i < minSize; i++)
			{
				newNumbers[i] = new Array(minSize);
				
				for (let j = 0; j < minSize; j++)
				{
					newNumbers[i][j] = numbers[i][j];
				}
			}
			
			
			
			await this.removeArray(index);
			
			await this.addNewArray(index, newNumbers);
			
			if (!this.in2dView)
			{
				this.updateCameraHeight();
			}	
			
			resolve();
		});	
	}
	
	
	
	removeArray(index, keepNumbersCanvasVisible = false)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.displayError(`No array at index ${index}`);
				
				return;
			}
			
			
			
			if (this.in2dView && !keepNumbersCanvasVisible)
			{
				await changeOpacity(this.wilsonNumbers.canvas, 0, this.animationTime / 5);
			}
			
			
			
			await new Promise((resolve, reject) =>
			{
				let thingsToAnimate = [];
				
				this.arrays[index].cubeGroup.traverse(node =>
				{
					if (node.material)
					{
						node.material.forEach(material => thingsToAnimate.push(material));
					}
				});
				
				anime({
					targets: thingsToAnimate,
					opacity: 0,
					duration: this.animationTime / 2,
					easing: "easeOutQuad",
					complete: resolve
				});
			});
			
			
			
			//Dispose of all the materials.
			for (let i = 0; i < this.arrays[index].cubes.length; i++)
			{
				for (let j = 0; j < this.arrays[index].cubes[i].length; j++)
				{
					if (this.arrays[index].cubes[i][j])
					{
						for (let k = 0; k < this.arrays[index].cubes[i][j].length; k++)
						{
							if (this.arrays[index].cubes[i][j][k])
							{
								this.arrays[index].cubes[i][j][k].material.forEach(material => material.dispose());
							}	
						}
					}	
				}
			}
			
			this.scene.remove(this.arrays[index].cubeGroup);
			
			this.totalArrayFootprint -= this.arrays[index].footprint + 1;
			
			this.arrays.splice(index, 1);
			
			
			
			//Update the other arrays.
			for (let i = index; i < this.arrays.length; i++)
			{
				this.arrays[i].partialFootprintSum = this.arrays[i].footprint;
				
				if (i !== 0)
				{
					this.arrays[i].centerOffset = this.arrays[i - 1].centerOffset + this.arrays[i - 1].footprint / 2 + this.arrays[i].footprint / 2 + 1;
					
					this.arrays[i].partialFootprintSum += this.arrays[i - 1].partialFootprintSum + 1;
				}
				
				else
				{
					this.arrays[i].centerOffset = 0;
				}
				
				if (this.in2dView)
				{
					anime({
						targets: this.arrays[i].cubeGroup.position,
						x: this.arrays[i].centerOffset,
						y: 0,
						z: 0,
						duration: this.animationTime,
						easing: "easeInOutQuad"
					});
				}
				
				else
				{
					anime({
						targets: this.arrays[i].cubeGroup.position,
						x: this.arrays[i].centerOffset,
						y: 0,
						z: -this.arrays[i].centerOffset,
						duration: this.animationTime,
						easing: "easeInOutQuad"
					});
				}
			}
			
			
			if (this.arrays.length !== 0 && !keepNumbersCanvasVisible)
			{
				this.updateCameraHeight(true);
			}	
			
			resolve();
		});	
	}
	
	
	
	addCube(array, x, y, z, h = 0, s = 0, v = this.cubeLightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.cubeTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cubeTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cubeTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cubeTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cubeTexture2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cubeTexture2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const cube = new THREE.Mesh(this.cubeGeometry, materials);
		
		array.cubeGroup.add(cube);
		
		if (this.addWalls)
		{
			cube.position.set(x, y, z);
		}
		
		else
		{
			cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}	
		
		return cube;
	}
	
	
	
	addFloor(array, x, z, h = 0, s = 0, v = this.floorLightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const floor = new THREE.Mesh(this.floorGeometry, materials);
		
		array.cubeGroup.add(floor);
		
		//This aligns the thing correctly.
		if (this.addWalls)
		{
			floor.position.set(x, -.5 - .0005, z);
		}
		
		else
		{
			floor.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		}
		
		return floor;
	}
	
	
	
	addLeftWall(array, y, z, h = 0, s = 0, v = this.floorLightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(this.wallLeftGeometry, materials);
		
		array.cubeGroup.add(wall);
		
		//This aligns the thing correctly.
		if (this.addWalls)
		{
			wall.position.set(-.5 - .0005, y - this.wallSize, z);
		}
		
		else
		{
			wall.position.set(-.5 - .0005 - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}
		
		return wall;
	}
	
	
	
	addRightWall(array, x, y, h = 0, s = 0, v = this.floorLightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floorTexture2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(this.wallRightGeometry, materials);
		
		array.cubeGroup.add(wall);
		
		//This aligns the thing correctly.
		if (this.addWalls)
		{
			wall.position.set(x, y - this.wallSize, -.5 - .0005);
		}
		
		else
		{
			wall.position.set(x - (array.footprint - 1) / 2, y, -.5 - .0005 - (array.footprint - 1) / 2);
		}	
		
		return wall;
	}
	
	
	
	showHexView()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimatingCamera)
			{
				resolve();
				return;
			}
			
			
			
			this.currentlyAnimatingCamera = true;
			
			if (this.in2dView)
			{
				await changeOpacity(this.wilsonNumbers.canvas, 0, this.animationTime / 5);
			}
			
			this.in2dView = false;
			this.inExactHexView = true;
			
			this.rotationYVelocity = 0;
			
			this.lastRotationYVelocities = [0, 0, 0, 0];
			
			
			
			this.updateCameraHeight(true);
			
			anime({
				targets: this.orthographicCamera.rotation,
				x: -0.785398163,
				y: 0.615479709,
				z: 0.523598775,
				duration: this.animationTime,
				easing: "easeInOutQuad",
				complete: () =>
				{
					this.currentlyAnimatingCamera = false;
					resolve();
				}	
			});
			
			this.arrays.forEach(array =>
			{
				anime({
					targets: array.cubeGroup.rotation,
					y: 0,
					duration: this.animationTime,
					easing: "easeInOutQuad"
				});
				
				anime({
					targets: array.cubeGroup.position,
					x: array.centerOffset,
					y: 0,
					z: -array.centerOffset,
					duration: this.animationTime,
					easing: "easeInOutQuad"
				});
			});
			
			this.rotationY = 0;
		});	
	}
	
	show2dView()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimatingCamera || this.in2dView)
			{
				resolve();
				return;
			}
			
			
			if (this.dimersShown)
			{
				await this.hideDimers();
			}
			
			
			
			this.currentlyAnimatingCamera = true;
			
			this.in2dView = true;
			this.inExactHexView = false;
			
			this.rotationYVelocity = 0;
			
			this.lastRotationYVelocities = [0, 0, 0, 0];
			
			
			
			this.updateCameraHeight(true);
			
			anime({
				targets: this.orthographicCamera.rotation,
				x: -1.570796327,
				y: 0,
				z: 0,
				duration: this.animationTime,
				easing: "easeInOutQuad"
			});
			
			this.arrays.forEach(array =>
			{
				anime({
					targets: array.cubeGroup.rotation,
					y: 0,
					duration: this.animationTime,
					easing: "easeInOutQuad"
				});
				
				anime({
					targets: array.cubeGroup.position,
					x: array.centerOffset,
					y: 0,
					z: 0,
					duration: this.animationTime,
					easing: "easeInOutQuad"
				});
			});
			
			
			
			setTimeout(() =>
			{
				this.drawAll2dViewText();
				
				changeOpacity(this.wilsonNumbers.canvas, 1, this.animationTime / 5)
				
				.then(() =>
				{
					this.currentlyAnimatingCamera = false;
					
					this.rotationY = 0;
					
					resolve();
				});
			}, this.animationTime);
		});	
	}
	
	
	
	//Makes sure everything is in frame but doesn't affect rotation.
	updateCameraHeight(force = false)
	{
		if (!force)
		{
			if (this.currentlyAnimatingCamera)
			{
				return;
			}
			
			this.currentlyAnimatingCamera = true;
		}	
		
		
		
		this.totalArrayHeight = 0;
		
		for (let i = 0; i < this.arrays.length; i++)
		{
			this.totalArrayHeight = Math.max(this.totalArrayHeight, this.arrays[i].height);
		}
		
		this.totalArraySize = Math.max(this.totalArrayFootprint, this.totalArrayHeight);
		
		
		
		let hexViewCameraOffset = (-this.arrays[0].footprint / 2 + this.arrays[this.arrays.length - 1].centerOffset + this.arrays[this.arrays.length - 1].footprint / 2) / 2;
		
		this.hexViewCameraPos = [this.totalArraySize + hexViewCameraOffset, this.totalArraySize + this.totalArrayHeight / 3, this.totalArraySize - hexViewCameraOffset];
		
		if (this.addWalls)
		{
			this.hexViewCameraPos[0] += 10;
			this.hexViewCameraPos[1] += 10;
			this.hexViewCameraPos[2] += 10;
		}
		
		this._2dViewCameraPos = [hexViewCameraOffset, this.totalArraySize + 10, 0];	
		
		if (this.in2dView)
		{
			anime({
				targets: this.orthographicCamera.position,
				x: this._2dViewCameraPos[0],
				y: this._2dViewCameraPos[1],
				z: this._2dViewCameraPos[2],
				duration: this.animationTime,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: this.orthographicCamera,
				left: -(this.totalArrayFootprint / 2 + .5),
				right: this.totalArrayFootprint / 2 + .5,
				top: this.totalArrayFootprint / 2 + .5,
				bottom: -(this.totalArrayFootprint / 2 + .5),
				duration: this.animationTime,
				easing: "easeInOutQuad",
				update: () => this.orthographicCamera.updateProjectionMatrix(),
				complete: () =>
				{
					this.orthographicCamera.updateProjectionMatrix();
					this.currentlyAnimatingCamera = false;
				}
			});
			
			setTimeout(() =>
			{
				this.drawAll2dViewText();
				
				changeOpacity(this.wilsonNumbers.canvas, 1, this.animationTime / 5);
			}, this.animationTime);
		}
		
		else
		{
			anime({
				targets: this.orthographicCamera.position,
				x: this.hexViewCameraPos[0],
				y: this.hexViewCameraPos[1],
				z: this.hexViewCameraPos[2],
				duration: this.animationTime,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: this.orthographicCamera,
				left: -this.totalArraySize,
				right: this.totalArraySize,
				top: this.totalArraySize,
				bottom: -this.totalArraySize,
				duration: this.animationTime,
				easing: "easeInOutQuad",
				update: () => this.orthographicCamera.updateProjectionMatrix(),
				complete: () =>
				{
					this.orthographicCamera.updateProjectionMatrix();
					this.currentlyAnimatingCamera = false;
				}
			});
		}	
	}
	
	
	
	showDimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimatingCamera)
			{
				resolve();
				return;
			}
			
			this.dimersShown = true;
			
			
			
			if (!this.inExactHexView)
			{
				await this.showHexView();
			}	
			
			this.currentlyAnimatingCamera = true;
			
			
			
			let targets = [];
			
			//Hide everything not visible by the camera.
			this.arrays.forEach(array =>
			{
				for (let i = 0; i < array.footprint; i++)
				{
					for (let j = 0; j < array.footprint; j++)
					{
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							//Remove the top face.
							if (k < array.cubes[i][j].length - 1)
							{
								targets.push(array.cubes[i][j][k].material[2]);
							}
							
							//The left face.
							if (i < array.footprint - 1 && array.cubes[i + 1][j].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[4]);
							}
							
							//The right face.
							if (j < array.footprint - 1 && array.cubes[i][j + 1].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[0]);
							}
							
							targets.push(array.cubes[i][j][k].material[1]);
							targets.push(array.cubes[i][j][k].material[3]);
							targets.push(array.cubes[i][j][k].material[5]);
						}
						
						if (array.cubes[i][j].length !== 0)
						{
							targets.push(array.floor[i][j].material[2]);
						}
					}
				}
				
				
				
				if (this.addWalls)
				{
					for (let i = 0; i < this.wallSize; i++)
					{
						for (let j = 0; j < 2 * this.wallSize; j++)
						{
							targets.push(array.rightWall[i][j].material[0]);
							targets.push(array.leftWall[i][j].material[4]);
						}
					}
				}
			});
			
			targets.forEach(material => material.opacity = 0);
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [this.wilsonHidden.ctx, this.wilsonHidden2.ctx, this.wilsonHidden3.ctx, this.wilsonHidden4.ctx],
					strokeStyle: "rgba(255, 255, 255, 1)",
					Alpha: 0,
					duration: this.animationTime / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						this.wilsonHidden.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilsonHidden.ctx.Alpha})`;
						this.wilsonHidden.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilsonHidden.ctx.Alpha})`;
						this.wilsonHidden.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden.ctx.moveTo(42.7, 21.3);
						this.wilsonHidden.ctx.lineTo(21.3, 42.7);
						this.wilsonHidden.ctx.stroke();
						
						this.cubeTexture.needsUpdate = true;
						
						
						
						this.wilsonHidden2.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden2.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilsonHidden2.ctx.Alpha})`;
						this.wilsonHidden2.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden2.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilsonHidden2.ctx.Alpha})`;
						this.wilsonHidden2.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden2.ctx.moveTo(21.3, 21.3);
						this.wilsonHidden2.ctx.lineTo(42.7, 42.7);
						this.wilsonHidden2.ctx.stroke();
						
						this.cubeTexture2.needsUpdate = true;
						
						
						
						this.wilsonHidden3.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden3.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : this.wilsonHidden3.ctx.Alpha})`;
						this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden3.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : this.wilsonHidden3.ctx.Alpha})`;
						this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden3.ctx.moveTo(42.7, 21.3);
						this.wilsonHidden3.ctx.lineTo(21.3, 42.7);
						this.wilsonHidden3.ctx.stroke();
						
						this.floorTexture.needsUpdate = true;
						
						
						
						this.wilsonHidden4.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden4.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : this.wilsonHidden4.ctx.Alpha})`;
						this.wilsonHidden4.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden4.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : this.wilsonHidden4.ctx.Alpha})`;
						this.wilsonHidden4.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden4.ctx.moveTo(21.3, 21.3);
						this.wilsonHidden4.ctx.lineTo(42.7, 42.7);
						this.wilsonHidden4.ctx.stroke();
						
						this.floorTexture2.needsUpdate = true;
					}
				});
			});
			
			this.currentlyAnimatingCamera = false;
			
			resolve();
		});	
	}
	
	
	
	hideDimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currentlyAnimatingCamera)
			{
				resolve();
				return;
			}
			
			this.dimersShown = false;
			
			
			
			let targets = [];
			
			//Show everything not visible by the camera.
			this.arrays.forEach(array =>
			{
				for (let i = 0; i < array.footprint; i++)
				{
					for (let j = 0; j < array.footprint; j++)
					{
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							//Remove the top face.
							if (k < array.cubes[i][j].length - 1)
							{
								targets.push(array.cubes[i][j][k].material[2]);
							}
							
							//The left face.
							if (i < array.footprint - 1 && array.cubes[i + 1][j].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[4]);
							}
							
							//The right face.
							if (j < array.footprint - 1 && array.cubes[i][j + 1].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[0]);
							}
							
							targets.push(array.cubes[i][j][k].material[1]);
							targets.push(array.cubes[i][j][k].material[3]);
							targets.push(array.cubes[i][j][k].material[5]);
						}
						
						if (array.cubes[i][j].length !== 0)
						{
							targets.push(array.floor[i][j].material[2]);
						}
					}
				}
				
				
				
				if (this.addWalls)
				{
					for (let i = 0; i < this.wallSize; i++)
					{
						for (let j = 0; j < 2 * this.wallSize; j++)
						{
							targets.push(array.leftWall[i][j].material[0]);
							targets.push(array.rightWall[i][j].material[4]);
						}
					}
				}
			});
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [this.wilsonHidden.ctx, this.wilsonHidden2.ctx, this.wilsonHidden3.ctx, this.wilsonHidden4.ctx],
					strokeStyle: "rgba(255, 255, 255, 0)",
					Alpha: 1,
					duration: this.animationTime / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						this.wilsonHidden.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilsonHidden.ctx.Alpha})`;
						this.wilsonHidden.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilsonHidden.ctx.Alpha})`;
						this.wilsonHidden.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden.ctx.moveTo(42.7, 21.3);
						this.wilsonHidden.ctx.lineTo(21.3, 42.7);
						this.wilsonHidden.ctx.stroke();
						
						this.cubeTexture.needsUpdate = true;
						
						
						
						this.wilsonHidden2.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden2.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilsonHidden2.ctx.Alpha})`;
						this.wilsonHidden2.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden2.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilsonHidden2.ctx.Alpha})`;
						this.wilsonHidden2.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden2.ctx.moveTo(21.3, 21.3);
						this.wilsonHidden2.ctx.lineTo(42.7, 42.7);
						this.wilsonHidden2.ctx.stroke();
						
						this.cubeTexture2.needsUpdate = true;
						
						
						
						this.wilsonHidden3.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden3.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : this.wilsonHidden3.ctx.Alpha})`;
						this.wilsonHidden3.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden3.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : this.wilsonHidden3.ctx.Alpha})`;
						this.wilsonHidden3.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden3.ctx.moveTo(42.7, 21.3);
						this.wilsonHidden3.ctx.lineTo(21.3, 42.7);
						this.wilsonHidden3.ctx.stroke();
						
						this.floorTexture.needsUpdate = true;
						
						
						
						this.wilsonHidden4.ctx.clearRect(0, 0, 64, 64);
						
						this.wilsonHidden4.ctx.fillStyle = `rgba(32, 32, 32, ${this.addWalls ? 0 : this.wilsonHidden4.ctx.Alpha})`;
						this.wilsonHidden4.ctx.fillRect(0, 0, 64, 64);
						
						this.wilsonHidden4.ctx.fillStyle = `rgba(64, 64, 64, ${this.addWalls ? 0 : this.wilsonHidden4.ctx.Alpha})`;
						this.wilsonHidden4.ctx.fillRect(4, 4, 56, 56);
						
						this.wilsonHidden4.ctx.moveTo(21.3, 21.3);
						this.wilsonHidden4.ctx.lineTo(42.7, 42.7);
						this.wilsonHidden4.ctx.stroke();
						
						this.floorTexture2.needsUpdate = true;
					}
				});
			});
			
			targets.forEach(material => material.opacity = 1);
			
			this.currentlyAnimatingCamera = false;
			
			resolve();
		});	
	}
	
	
	
	showFloor(opacity = 1)
	{
		return new Promise(async (resolve, reject) =>
		{
			let targets = [];
			
			this.arrays.forEach(array =>
			{
				array.floor.forEach(row =>
				{
					row.forEach(floor =>
					{
						floor.material.forEach(material => targets.push(material));
					});
				});
			});
			
			anime({
				targets: targets,
				opacity: opacity,
				duration: this.animationTime / 2,
				easing: "easeOutQuad",
				complete: () =>
				{
					resolve();
				}
			});	
		});	
	}
	
	hideFloor()
	{
		return this.showFloor(0);
	}
	
	
	
	//Removes the floor from right to left in each row until a box with positive size is reached --- used to make RPPs display a little better.
	removeOutsideFloor(array)
	{
		let targets = [];
		let removals = [];
		
		for (let i = 0; i < array.footprint; i++)
		{
			for (let j = array.footprint - 1; j >= 0; j--)
			{
				if (array.numbers[i][j] !== 0)
				{
					break;
				}
				
				array.floor[i][j].material.forEach(material => targets.push(material));
				removals.push([i, j]);
			}
		}
		
		removals.forEach(coordinates =>
		{
			array.floor[coordinates[0]][coordinates[1]].material.forEach(material => material.dispose());
			
			array.cubeGroup.remove(array.floor[coordinates[0]][coordinates[1]]);
			
			array.floor[coordinates[0]][coordinates[1]] = null;
		});
		
		if (this.in2dView)
		{
			this.drawAll2dViewText();
		}
	}
	
	
	
	//Goes through and recomputes the sizes of array and then the total array sizes.
	recalculateHeights(array)
	{
		array.height = 0;
		
		array.numbers.forEach(row =>
		{
			row.forEach(entry =>
			{
				if (entry !== Infinity)
				{
					array.height = Math.max(entry, array.height);
				}	
			});
		});
		
		array.size = Math.max(array.footprint, array.height);
		
		
		
		let oldTotalArrayHeight = this.totalArrayHeight;
		
		this.totalArrayHeight = 0;
		
		this.arrays.forEach(array => this.totalArrayHeight = Math.max(array.height, this.totalArrayHeight));
		
		
		
		this.totalArraySize = Math.max(this.totalArrayFootprint, this.totalArrayHeight);
		
		if (this.totalArrayHeight !== this.oldTotalArrayHeight)
		{
			this.updateCameraHeight();
		}
	}
	
	
	
	drawAll2dViewText()
	{
		this.fontSize = this.wilsonNumbers.canvasWidth / (this.totalArrayFootprint + 1);
		
		const numCharacters = Math.max(`${this.totalArrayHeight}`.length, 2);
		
		this.wilsonNumbers.ctx.font = `${this.fontSize / numCharacters}px monospace`;
		
		this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
		
		this.arrays.forEach(array =>
		{
			//Show the numbers in the right places.
			for (let i = 0; i < array.footprint; i++)
			{
				for (let j = 0; j < array.footprint; j++)
				{
					if (array.floor[i][j] !== null)
					{
						this.drawSingleCell2dViewText(array, i, j);
					}
				}
			}
		});
	}
	
	
	
	drawSingleCell2dViewText(array, row, col)
	{
		const top = (this.totalArrayFootprint - array.footprint - 1) / 2;
		const left = array.partialFootprintSum - array.footprint;
		
		this.wilsonNumbers.ctx.clearRect(this.fontSize * (col + left + 1), this.fontSize * (row + top + 1), this.fontSize, this.fontSize);
		
		if (array.numbers[row][col] !== Infinity && (array.numbers[row][col] !== 0 || this.floorLightness !== 0))
		{
			const textMetrics = this.wilsonNumbers.ctx.measureText(array.numbers[row][col]);
			
			//The height adjustment is an annoying spacing computation.
			this.wilsonNumbers.ctx.fillText(array.numbers[row][col], this.fontSize * (col + left + 1) + (this.fontSize - textMetrics.width) / 2, this.fontSize * (row + top + 1) + (this.fontSize + textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2);
		}	
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	colorCubes(array, coordinates, hue)
	{
		return new Promise((resolve, reject) =>
		{
			if (coordinates.length === 0)
			{
				resolve();
				return;
			}
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material.color));
			});
			
			targets.forEach(color => color.getRGB(color));
			
			//Convert HSV to HSL.
			let v = this.cubeLightness + 1 * Math.min(this.cubeLightness, 1 - this.cubeLightness);
			let s = v === 0 ? 0 : 2 * (1 - this.cubeLightness / v);
			
			let targetColors = targets.map(color => this.wilson.utils.hsvToRgb(hue, s, v));
			
			
			
			anime({
				targets: targets,
				r: (element, index) => targetColors[index][0] / 255,
				g: (element, index) => targetColors[index][1] / 255,
				b: (element, index) => targetColors[index][2] / 255,
				duration: this.animationTime,
				delay: (element, index) => Math.floor(index / 6) * this.animationTime / 10,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setRGB(color.r, color.g, color.b)),
				complete: resolve
			});
		});
	}
	
	
	
	uncolorCubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material.color));
			});
			
			targets.forEach(color => color.getHSL(color));
			
			anime({
				targets: targets,
				s: 0,
				duration: this.animationTime,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setHSL(color.h, color.s, this.cubeLightness)),
				complete: resolve
			});
		});
	}
	
	
	
	//Lifts the specified cubes to the specified height. The animation is skipped in 2d mode.
	raiseCubes(array, coordinates, height)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = this.in2dView ? 0 : this.animationTime;
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot raise cubes from an infinite height");
				}
			});
			
			anime({
				targets: targets,
				y: height,
				duration: duration,
				easing: "easeInOutQuad",
				complete: resolve
			});
		});	
	}
	
	
	
	//Lowers the specified cubes onto the array. The animation is skipped in 2d mode.
	lowerCubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = this.in2dView ? 0 : this.animationTime;
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot lower cubes onto an infinite height");
				}
			});
			
			anime({
				targets: targets,
				y: (element, index) => array.numbers[coordinates[index][0]][coordinates[index][1]],
				duration: duration,
				easing: "easeInOutQuad",
				complete: () =>
				{
					coordinates.forEach(xyz =>
					{	
						array.cubes[xyz[0]][xyz[1]][array.numbers[xyz[0]][xyz[1]]] = array.cubes[xyz[0]][xyz[1]][xyz[2]];
						
						array.cubes[xyz[0]][xyz[1]][xyz[2]] = null;
					});
					
					resolve();
				}
			});
		});	
	}
	
	
	
	//Moves cubes from one array to another and changes their group.
	moveCubes(sourceArray, sourceCoordinates, targetArray, targetCoordinates, updateCubeArray = true)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			sourceCoordinates.forEach(xyz =>
			{
				targets.push(sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				targetArray.cubeGroup.attach(sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]]);
				
				if (sourceArray.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot move cubes from an infinite height");
				}
			});
			
			
			
			anime({
				targets: targets,
				x: (element, index) => targetCoordinates[index][1] - (targetArray.footprint - 1) / 2,
				y: (element, index) => targetCoordinates[index][2],
				z: (element, index) => targetCoordinates[index][0] - (targetArray.footprint - 1) / 2,
				duration: this.animationTime,
				easing: "easeInOutQuad",
				complete: () =>
				{
					if (updateCubeArray)
					{
						//This is necessary in case the source and target arrays are the same.
						let sourceCubes = sourceCoordinates.map(xyz => sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]]);
						
						sourceCoordinates.forEach(xyz => sourceArray.cubes[xyz[0]][xyz[1]][xyz[2]] = null);
						
						targetCoordinates.forEach((xyz, index) =>
						{
							if (targetArray.numbers[xyz[0]][xyz[1]] === Infinity)
							{
								console.error("Cannot move cubes to an infinite height");
							}
							
							if (targetArray.cubes[xyz[0]][xyz[1]][xyz[2]] && !sourceCoordinates.some(e => e[0] === xyz[0] && e[1] === xyz[1] && e[2] === xyz[2]))
							{
								console.warn(`Moving a cube to a location that's already occupied: ${xyz}. This is probably not what you want to do.`);
							}
							
							targetArray.cubes[xyz[0]][xyz[1]][xyz[2]] = sourceCubes[index];
						});
					}
					
					resolve();
				}	
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to 1.
	revealCubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			if (coordinates.length === 0)
			{
				resolve();
				return;
			}
			
			
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material));
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot reveal cubes at an infinite height");
				}
			});
			
			anime({
				targets: targets,
				opacity: 1,
				duration: this.animationTime / 2,
				delay: (element, index) => Math.floor(index / 6) * this.animationTime / 10,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to zero, and then deletes them.
	deleteCubes(array, coordinates, instant = false, noAnimation = false)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material));
			});
						
			anime({
				targets: targets,
				opacity: 0,
				duration: this.animationTime / 2 * !noAnimation,
				delay: (element, index) => (!instant) * Math.floor(index / 6) * this.animationTime / 10,
				easing: "easeOutQuad",
				complete: () =>
				{
					targets.forEach(material => material.dispose());
					
					coordinates.forEach(xyz =>
					{
						array.cubeGroup.remove(array.cubes[xyz[0]][xyz[1]][xyz[2]]);
						
						array.cubes[xyz[0]][xyz[1]][xyz[2]] = null;
					});
					
					resolve();
				}
			});	
		});
	}
	
	
	
	//For use with tableaux of skew shape.
	deleteFloor(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.floor[xyz[0]][xyz[1]].material.forEach(material => targets.push(material));
			});
						
			anime({
				targets: targets,
				opacity: 0,
				duration: this.animationTime / 2,
				easing: "easeOutQuad",
				complete: () =>
				{
					targets.forEach(material => material.dispose());
					
					coordinates.forEach(xyz =>
					{
						array.cubeGroup.remove(array.floor[xyz[0]][xyz[1]]);
						
						array.cubes[xyz[0]][xyz[1]] = null;
					});
					
					resolve();
				}
			});	
		});
	}
	
	
	
	runExample(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (index === 1 || index === 2)
			{
				while (this.arrays.length > 1)
				{
					await this.removeArray(1);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
				}
				
				if (this.arrays.length === 0)
				{
					const planePartition = this.parseArray(this.generateRandomPlanePartition());
					await this.addNewArray(this.arrays.length, planePartition);
				}
				
				else if (!this.verifyPp(this.arrays[0].numbers))
				{
					await this.removeArray(0);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
					
					const planePartition = this.parseArray(this.generateRandomPlanePartition());
					await addNewArray(this.arrays.length, planePartition);
				}
				
				
				
				if (index === 1)
				{
					await this.runAlgorithm("hillmanGrassl", 0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animationTime));
					
					await this.runAlgorithm("hillmanGrasslInverse", 0);
				}
				
				else
				{
					await this.runAlgorithm("pak", 0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animationTime));
					
					await this.showHexView();
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
					
					await this.runAlgorithm("sulzgruberInverse", 0);
				}	
				
				resolve();
			}
			
			
			
			else if (index === 3)
			{
				while (this.arrays.length > 0)
				{
					await this.removeArray(0);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
				}
				
				await this.addNewArray(this.arrays.length, this.generateRandomTableau());
				
				
				
				await this.show2dView();
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
				
				await this.runAlgorithm("rskInverse", 0)
				
				await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animationTime));
				
				await this.runAlgorithm("rsk", 0);
				
				resolve();
			}
		});
	}
	
	
	
	runAlgorithm(name, index, subAlgorithm = false)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!subAlgorithm && this.currentlyRunningAlgorithm)
			{
				resolve();
				return;
			}
			
			this.currentlyRunningAlgorithm = true;
			
			
			
			const data = this.algorithmData[name];
			
			const numArrays = data.inputType.length;
			
			if (index > this.arrays.length - 1 || index < 0)
			{
				console.log(`No array at index ${index}!`);
				
				this.currentlyRunningAlgorithm = false;
				
				resolve();
				return;
			}
			
			else if (numArrays > 1 && index > this.arrays.length - numArrays)
			{
				console.log(`No array at index ${index + numArrays - 1}! (This algorithm needs ${numArrays} arrays)`);
				
				this.currentlyRunningAlgorithm = false;
				
				resolve();
				return;
			}
			
			
			
			for (let i = 0; i < numArrays; i++)
			{
				let type = data.inputType[i];
				
				if (type === "pp" && !this.verifyPp(this.arrays[index + i].numbers))
				{
					console.log(`Array at index ${index + i} is not a plane partition!`);
					
					this.currentlyRunningAlgorithm = false;
					
					reject();
					return;
				}
				
				if (type === "ssyt" && !this.verifySsyt(this.arrays[index + i].numbers))
				{
					console.log(`Array at index ${index + i} is not an SSYT!`);
					
					this.currentlyRunningAlgorithm = false;
					
					resolve();
					return;
				}
			}
			
			
			
			if (numArrays > 1 && data.sameShape !== undefined && data.sameShape)
			{
				let rowLengths = new Array(numArrays);
				
				let maxNumRows = 0;
				
				for (let i = 0; i < numArrays; i++)
				{
					maxNumRows = Math.max(maxNumRows, this.arrays[index + i].numbers.length);
				}	
				
				for (let i = 0; i < numArrays; i++)
				{
					rowLengths[i] = new Array(maxNumRows);
					
					for (let j = 0; j < maxNumRows; j++)
					{
						rowLengths[i][j] = 0;
					}
					
					for (let j = 0; j < this.arrays[index + i].numbers.length; j++)
					{
						let k = 0;
						
						while (k < this.arrays[index + i].numbers[j].length && this.arrays[index + i].numbers[j][k] !== 0)
						{
							k++;
						}
						
						rowLengths[i][j] = k;
					}	
				}
				
				
				
				for (let i = 1; i < numArrays; i++)
				{
					for (let j = 0; j < maxNumRows; j++)
					{
						if (rowLengths[i][j] !== rowLengths[0][j])
						{
							this.displayError(`Arrays are not the same shape!`);
							
							this.currentlyRunningAlgorithm = false;
							
							resolve();
							return;
						}
					}	
				}
			}
			
			
			
			//Uncolor everything.
			for (let i = 0; i < numArrays; i++)
			{
				let coordinates = [];
				
				const numbers = this.arrays[index + i].numbers;
				
				for (let j = 0; j < numbers.length; j++)
				{
					for (let k = 0; k < numbers.length; k++)
					{
						if (numbers[j][k] !== Infinity)
						{
							for (let l = 0; l < numbers[j][k]; l++)
							{
								coordinates.push([j, k, l]);
							}
						}	
					}
				}
				
				this.uncolorCubes(this.arrays[index + i], coordinates);
			}	
			
			
			
			const boundFunction = data.method.bind(this);
			
			await boundFunction(index);
			
			
			
			if (!this.subAlgorithm)
			{
				this.currentlyRunningAlgorithm = false;
			}
			
			resolve();
		});
	}
	
	
	hillmanGrassl(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let planePartition = _.cloneDeep(array.numbers);
			
			
			
			let columnStarts = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				let j = 0;
				
				while (j < planePartition.length && planePartition[j][i] === Infinity)
				{
					j++;
				}
				
				columnStarts[i] = j;
			}
			
			
			
			let rowStarts = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				let j = 0;
				
				while (j < planePartition.length && planePartition[i][j] === Infinity)
				{
					j++;
				}
				
				rowStarts[i] = j;
			}
			
			
			
			let zigzagPaths = [];
			
			while (true)
			{
				//Find the right-most nonzero entry at the top of its column.
				let startingCol = planePartition[0].length - 1;
				
				while (startingCol >= 0 && columnStarts[startingCol] < planePartition.length && planePartition[columnStarts[startingCol]][startingCol] === 0)
				{
					startingCol--;
				}
				
				if (startingCol < 0 || columnStarts[startingCol] === planePartition.length)
				{
					break;
				}
				
				
				
				let currentRow = columnStarts[startingCol];
				let currentCol = startingCol;
				
				let path = [[currentRow, currentCol, planePartition[currentRow][currentCol] - 1]];
				
				while (true)
				{
					if (currentRow < planePartition.length - 1 && planePartition[currentRow + 1][currentCol] === planePartition[currentRow][currentCol])
					{
						currentRow++;
					}
					
					else if (currentCol > 0 && planePartition[currentRow][currentCol - 1] !== Infinity)
					{
						currentCol--;
					}
					
					else
					{
						break;
					}
					
					path.push([currentRow, currentCol, planePartition[currentRow][currentCol] - 1]);
				}
				
				
				
				for (let i = 0; i < path.length; i++)
				{
					planePartition[path[i][0]][path[i][1]]--;
				}
				
				zigzagPaths.push(path);
			}
			
			
			
			let emptyArray = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				emptyArray[i] = new Array(planePartition.length);
				
				for (let j = 0; j < planePartition.length; j++)
				{
					emptyArray[i][j] = planePartition[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let outputArray = await this.addNewArray(index + 1, emptyArray);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one.
			for (let i = 0; i < zigzagPaths.length; i++)
			{
				let hue = i / zigzagPaths.length * 6/7;
				
				await this.colorCubes(array, zigzagPaths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await this.raiseCubes(array, zigzagPaths[i], array.height);
				
				
				
				//Now we actually delete the cubes.
				for (let j = 0; j < zigzagPaths[i].length; j++)
				{
					array.numbers[zigzagPaths[i][j][0]][zigzagPaths[i][j][1]]--;
					
					if (this.in2dView)
					{
						this.drawSingleCell2dViewText(array, zigzagPaths[i][j][0], zigzagPaths[i][j][1]);
					}	
				}
				
				this.recalculateHeights(array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 5));
				
				//Find the pivot and rearrange the shape into a hook.
				let pivot = [zigzagPaths[i][zigzagPaths[i].length - 1][0], zigzagPaths[i][0][1]];
				
				let targetCoordinates = [];
				
				let targetHeight = outputArray.height + 1;
				
				//This is the vertical part of the hook.
				for (let j = columnStarts[pivot[1]]; j <= pivot[0]; j++)
				{
					targetCoordinates.push([j, pivot[1], targetHeight]);
				}
				
				let pivotCoordinates = targetCoordinates[targetCoordinates.length - 1];
				
				//And this is the horizontal part.
				for (let j = pivot[1] - 1; j >= rowStarts[pivot[0]]; j--)
				{
					targetCoordinates.push([pivot[0], j, targetHeight]);
				}
				
				await this.moveCubes(array, zigzagPaths[i], outputArray, targetCoordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				targetCoordinates = [];
				
				for (let j = pivot[0] - 1; j >= columnStarts[pivot[1]]; j--)
				{
					targetCoordinates.push([j, pivot[1], targetHeight]);
				}
				
				this.deleteCubes(outputArray, targetCoordinates);
				
				targetCoordinates = [];
				
				for (let j = pivot[1] - 1; j >= rowStarts[pivot[0]]; j--)
				{
					targetCoordinates.push([pivot[0], j, targetHeight]);
				}
				
				this.deleteCubes(outputArray, targetCoordinates);
				
				
				
				await this.lowerCubes(outputArray, [pivotCoordinates]);
				
				
				
				outputArray.numbers[pivotCoordinates[0]][pivotCoordinates[1]]++;
				
				this.recalculateHeights(outputArray);
				
				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(outputArray, pivotCoordinates[0], pivotCoordinates[1]);
				}
				
				outputArray.height = Math.max(outputArray.height, outputArray.numbers[pivotCoordinates[0]][pivotCoordinates[1]]);
				
				outputArray.size = Math.max(outputArray.size, outputArray.height);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			}
			
			
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	hillmanGrasslInverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = _.cloneDeep(array.numbers);
			
			let zigzagPaths = [];
			
			
			
			let columnStarts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[j][i] === Infinity)
				{
					j++;
				}
				
				columnStarts[i] = j;
			}
			
			
			
			let rowStarts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[i][j] === Infinity)
				{
					j++;
				}
				
				rowStarts[i] = j;
			}
				
			
			
			let emptyArray = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				emptyArray[i] = new Array(tableau.length);
				
				for (let j = 0; j < tableau.length; j++)
				{
					emptyArray[i][j] = tableau[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let planePartition = _.cloneDeep(emptyArray);
			
			let outputArray = await this.addNewArray(index + 1, emptyArray);
			
			
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let j = 0; j < tableau.length; j++)
			{
				for (let i = tableau.length - 1; i >= columnStarts[j]; i--)
				{
					while (tableau[i][j] !== 0)
					{
						let path = [];
						
						let currentRow = i;
						let currentCol = rowStarts[i];
						
						while (currentRow >= 0)
						{
							//Go up at the last possible place with a matching entry.
							let k = currentCol;
							
							if (currentRow !== 0)
							{
								while (planePartition[currentRow][k] !== planePartition[currentRow - 1][k] && k < j)
								{
									k++;
								}
							}
							
							else
							{
								k = j;
							}
							
							//Add all of these boxes.
							for (let l = currentCol; l <= k; l++)
							{
								path.push([currentRow, l, planePartition[currentRow][l]]);
							}
							
							if (currentRow - 1 >= columnStarts[k])
							{
								currentRow--;
								currentCol = k;
							}
							
							else
							{
								break;
							}		
						}
						
						
						
						for (let k = 0; k < path.length; k++)
						{
							planePartition[path[k][0]][path[k][1]]++;
						}
						
						zigzagPaths.push([path, [i, j, tableau[i][j] - 1]]);
						
						tableau[i][j]--;
					}
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			
			
			//Now we'll animate those paths actually incrementing, one-by-one.
			for (let i = 0; i < zigzagPaths.length; i++)
			{
				let hue = i / zigzagPaths.length * 6/7;
				
				await this.colorCubes(array, [zigzagPaths[i][1]], hue);
				
				
				
				let row = zigzagPaths[i][1][0];
				let col = zigzagPaths[i][1][1];
				let height = array.size;
				
				//Add a bunch of cubes corresponding to the hook that this thing is a part of.
				for (let j = columnStarts[col]; j < row; j++)
				{
					array.cubes[j][col][height] = this.addCube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}
				
				for (let j = rowStarts[row]; j < col; j++)
				{
					array.cubes[row][j][height] = this.addCube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}
				
				
				
				await this.raiseCubes(array, [zigzagPaths[i][1]], height);
				
				
				
				let coordinates = [];
				
				for (let j = row - 1; j >= columnStarts[col]; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise1 = this.revealCubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = col - 1; j >= rowStarts[row]; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise2 = this.revealCubes(array, coordinates);
				
				await Promise.all([promise1, promise2]);
				
				
				
				//The coordinates now need to be in a different order to match the zigzag path.
				coordinates = [];
				
				for (let j = rowStarts[row]; j < col; j++)
				{
					coordinates.push([row, j, height]);
				}
				
				coordinates.push([row, col, array.numbers[row][col] - 1]);
				
				for (let j = row - 1; j >= columnStarts[col]; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let targetCoordinates = zigzagPaths[i][0];
				
				let targetHeight = outputArray.height + 1;
				
				targetCoordinates.forEach(entry => entry[2] = targetHeight);
				
				array.numbers[row][col]--;
				
				this.recalculateHeights(array);
				
				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(array, row, col);
				}
				
				await this.moveCubes(array, coordinates, outputArray, targetCoordinates);
				
				
				
				await this.lowerCubes(outputArray, targetCoordinates);
				
				targetCoordinates.forEach((entry) =>
				{
					outputArray.numbers[entry[0]][entry[1]]++;
				});
				
				this.recalculateHeights(outputArray);
				
				if (this.in2dView)
				{
					targetCoordinates.forEach(entry => this.drawSingleCell2dViewText(outputArray, entry[0], entry[1]));
				}
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			}
			
			
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	pak(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let planePartition = array.numbers;
			
			if (!this.in2dView)
			{
				await this.show2dView();
			}
			
			
			
			let rightLegSize = 0;
			let bottomLegSize = 0;
			
			while (rightLegSize < array.footprint && array.numbers[rightLegSize][array.footprint - 1] !== 0)
			{
				rightLegSize++;
			}
			
			while (bottomLegSize < array.footprint && array.numbers[array.footprint - 1][bottomLegSize] !== 0)
			{
				bottomLegSize++;
			}
			
			//Todo: remove eventually
			rightLegSize = 0;
			bottomLegSize = 0;
			
			let numCorners = 0;
			
			for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
				{
					if (planePartition[row][col] !== Infinity)
					{
						numCorners++;
					}
				}
			}
			
			
			
			let hueIndex = 0;
			
			//Get outer corners by just scanning through the array forwards.
			for (let row = 0; row < array.footprint - bottomLegSize; row++)
			{
				for (let col = 0; col < array.footprint - rightLegSize; col++)
				{
					if (planePartition[row][col] === Infinity)
					{
						continue;
					}
					
					//Highlight this diagonal.
					let diagonalCoordinates = [];
					
					let i = 0;
					
					while (row + i < array.footprint && col + i < array.footprint)
					{
						diagonalCoordinates.push([row + i, col + i, planePartition[row + i][col + i] - 1]);
						
						i++;
					}
					
					
					
					i = diagonalCoordinates[0][0];
					let j = diagonalCoordinates[0][1];
					
					let coordinatesToColor = [];
					
					for (let k = planePartition[i][j] - 2; k >= 0; k--)
					{
						coordinatesToColor.push([i, j, k]);
					}
					
					this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6/7);
					
					
					
					coordinatesToColor = [];
					
					diagonalCoordinates.forEach(coordinate =>
					{
						if (coordinate[2] >= 0)
						{
							coordinatesToColor.push(coordinate);
						}
					});
					
					await this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6/7);
					
					
					
					//For each coordinate in the diagonal, we need to find the toggled value. The first and last will always be a little different, since they don't have as many neighbors.
					let newDiagonalHeight = new Array(diagonalCoordinates.length);
					
					diagonalCoordinates.forEach((coordinate, index) =>
					{
						let i = coordinate[0];
						let j = coordinate[1];
						
						let neighbor1 = 0;
						let neighbor2 = 0;
						
						if (i < array.footprint - 1)
						{
							neighbor1 = planePartition[i + 1][j];
						}
						
						if (j < array.footprint - 1)
						{
							neighbor2 = planePartition[i][j + 1];
						}
						
						newDiagonalHeight[index] = Math.max(neighbor1, neighbor2);
						
						
						
						if (index > 0)
						{
							neighbor1 = planePartition[i - 1][j];
							neighbor2 = planePartition[i][j - 1];
							
							newDiagonalHeight[index] += Math.min(neighbor1, neighbor2) - planePartition[i][j];
						}
						
						else
						{
							newDiagonalHeight[index] = planePartition[i][j] - newDiagonalHeight[index];
						}
					});	
					
					
					
					//This is async, so we can't use forEach easily.
					for (let index = 0; index < diagonalCoordinates.length; index++)
					{
						i = diagonalCoordinates[index][0];
						j = diagonalCoordinates[index][1];
						
						if (newDiagonalHeight[index] > planePartition[i][j])
						{
							let coordinatesToReveal = [];
							
							for (let k = planePartition[i][j]; k < newDiagonalHeight[index]; k++)
							{
								array.cubes[i][j][k] = this.addCube(array, j, k, i);
								
								coordinatesToReveal.push([i, j, k]);
							}
							
							if (this.in2dView)
							{
								this.revealCubes(array, coordinatesToReveal);
							}
							
							else
							{
								await this.revealCubes(array, coordinatesToReveal);
							}	
						}
						
						
						
						else if (newDiagonalHeight[index] < planePartition[i][j])
						{
							let coordinatesToDelete = [];
							
							for (let k = planePartition[i][j] - 1; k >= newDiagonalHeight[index]; k--)
							{
								coordinatesToDelete.push([i, j, k]);
							}
							
							if (this.in2dView)
							{
								this.deleteCubes(array, coordinatesToDelete);
							}
							
							else
							{
								await this.deleteCubes(array, coordinatesToDelete);
							}
						}
						
						
						
						planePartition[i][j] = newDiagonalHeight[index];
						
						if (this.in2dView)
						{
							this.drawSingleCell2dViewText(array, i, j);
						}
					}
					
					
					
					let coordinatesToUncolor = [];
					
					coordinatesToColor.forEach((coordinate, index) =>
					{
						if (index !== 0 && coordinate[2] < planePartition[coordinate[0]][coordinate[1]])
						{
							coordinatesToUncolor.push(coordinate);
						}
					});
					
					if (this.in2dView)
					{
						this.uncolorCubes(array, coordinatesToUncolor);
					}
					
					else
					{
						await this.uncolorCubes(array, coordinatesToUncolor);
					}		
					
					
					
					hueIndex++;
					
					this.recalculateHeights(array);
					
					if (coordinatesToColor.length !== 0)
					{
						await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
					}
				}
			}
			
			
			
			this.updateCameraHeight(true);
			
			resolve();
		});	
	}
	
	
	
	pakInverse(index, rightLegSize = 0, bottomLegSize = 0)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = array.numbers;
			
			
			
			if (!this.in2dView)
			{
				await this.show2dView();
			}
			
			
			
			let numCorners = 0;
			
			for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
				{
					if (tableau[row][col] !== Infinity)
					{
						numCorners++;
					}
				}
			}
			
			
			
			let hueIndex = 0;
			
			//Get outer corners by just scanning through the array backwards.
			for (let row = array.footprint - 1 - bottomLegSize; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - rightLegSize; col >= 0; col--)
				{
					if (tableau[row][col] === Infinity)
					{
						continue;
					}
					
					
					
					//Highlight this diagonal.
					let diagonalCoordinates = [];
					
					let i = 0;
					
					while (row + i < array.footprint && col + i < array.footprint)
					{
						diagonalCoordinates.push([row + i, col + i, tableau[row + i][col + i] - 1]);
						
						i++;
					}
					
					
					
					i = diagonalCoordinates[0][0];
					let j = diagonalCoordinates[0][1];
					
					
					
					//For each coordinate in the diagonal, we need to find the toggled value. The first and last will always be a little different, since they don't have as many neighbors.
					let newDiagonalHeight = new Array(diagonalCoordinates.length);
					
					let anyChange = false;
					
					diagonalCoordinates.forEach((coordinate, index) =>
					{
						let i = coordinate[0];
						let j = coordinate[1];
						
						let neighbor1 = 0;
						let neighbor2 = 0;
						
						if (i < array.footprint - 1)
						{
							neighbor1 = tableau[i + 1][j];
						}
						
						if (j < array.footprint - 1)
						{
							neighbor2 = tableau[i][j + 1];
						}
						
						newDiagonalHeight[index] = Math.max(neighbor1, neighbor2);
						
						
						
						if (index > 0)
						{
							neighbor1 = tableau[i - 1][j];
							neighbor2 = tableau[i][j - 1];
							
							newDiagonalHeight[index] += Math.min(neighbor1, neighbor2) - tableau[i][j];
						}
						
						else
						{
							newDiagonalHeight[index] += tableau[i][j];
						}
						
						
						
						if (!anyChange && newDiagonalHeight[index] !== tableau[i][j])
						{
							anyChange = true;
						}
					});
					
					
					
					if (tableau[i][j] !== 0)
					{
						let coordinatesToColor = [];
						
						for (let k = tableau[i][j] - 1; k >= 0; k--)
						{
							coordinatesToColor.push([i, j, k]);
						}
						
						this.colorCubes(array, coordinatesToColor, hueIndex / numCorners * 6/7);
					}
					
					else if (newDiagonalHeight[0] !== 0)
					{
						array.cubes[i][j][0] = this.addCube(array, j, 0, i, hueIndex / numCorners * 6/7, 1, this.cubeLightness);
						
						tableau[i][j] = 1;
						
						this.revealCubes(array, [[i, j, 0]]);
					}
					
					else if (!anyChange)
					{
						hueIndex++;
						continue;
					}
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
					
					
					
					//This is async, so we can't use forEach easily.
					for (let index = 0; index < diagonalCoordinates.length; index++)
					{
						i = diagonalCoordinates[index][0];
						j = diagonalCoordinates[index][1];
						
						if (newDiagonalHeight[index] > tableau[i][j])
						{
							let coordinatesToReveal = [];
							
							for (let k = tableau[i][j]; k < newDiagonalHeight[index]; k++)
							{
								array.cubes[i][j][k] = this.addCube(array, j, k, i, hueIndex / numCorners * 6/7, 1, this.cubeLightness);
								
								coordinatesToReveal.push([i, j, k]);
							}
							
							if (this.in2dView)
							{
								this.revealCubes(array, coordinatesToReveal);
							}
							
							else
							{
								await this.revealCubes(array, coordinatesToReveal);
							}
						}
						
						
						
						else if (newDiagonalHeight[index] < tableau[i][j])
						{
							let coordinatesToDelete = [];
							
							for (let k = tableau[i][j] - 1; k >= newDiagonalHeight[index]; k--)
							{
								coordinatesToDelete.push([i, j, k]);
							}
							
							if (this.in2dView)
							{
								this.deleteCubes(array, coordinatesToDelete);
							}
							
							else
							{
								await this.deleteCubes(array, coordinatesToDelete);
							}
						}
						
						
						
						tableau[i][j] = newDiagonalHeight[index];
						
						if (this.in2dView)
						{
							this.drawSingleCell2dViewText(array, i, j);
						}
					}
					
					
					
					hueIndex++;
					
					this.recalculateHeights(array);
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
				}
			}
			
			
			
			this.updateCameraHeight(true);
			
			resolve();
		});	
	}
	
	
	
	sulzgruber(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let planePartition = _.cloneDeep(array.numbers);
			
			
			
			let columnStarts = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				let j = 0;
				
				while (j < planePartition.length && planePartition[j][i] === Infinity)
				{
					j++;
				}
				
				columnStarts[i] = j;
			}
			
			
			
			let rowStarts = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				let j = 0;
				
				while (j < planePartition.length && planePartition[i][j] === Infinity)
				{
					j++;
				}
				
				rowStarts[i] = j;
			}
			
			
			
			//First, find the candidates. This first requires categorizing the diagonals.
			let diagonals = {};
			
			let diagonalStarts = {};
			
			
			
			//First the ones along the left edge.
			for (let i = 0; i < planePartition.length; i++)
			{
				diagonalStarts[-i] = [i, 0];
			}
			
			//Now the ones along the top edge.
			for (let i = 1; i < planePartition.length; i++)
			{
				diagonalStarts[i] = [0, i];
			}
			
			
			
			//First the ones along the left edge.
			for (let i = -planePartition.length + 1; i < planePartition.length; i++)
			{
				let row = diagonalStarts[i][0];
				let col = diagonalStarts[i][1];
				
				while (row < planePartition.length && col < planePartition.length && planePartition[row][col] === Infinity)
				{
					row++;
					col++;
				}
				
				diagonalStarts[i] = [row, col];
				
				if (row === planePartition.length || col === planePartition.length)
				{
					diagonals[i] = -1;
					continue;
				}
				
				
				
				let boundaryLeft = col === 0 || planePartition[row][col - 1] === Infinity;
				let boundaryUp = row === 0 || planePartition[row - 1][col] === Infinity;
				
				if (boundaryLeft && boundaryUp)
				{
					diagonals[i] = 0;
				}
				
				else if (boundaryLeft)
				{
					diagonals[i] = 3;
				}
				
				else if (boundaryUp)
				{
					diagonals[i] = 2;
				}
				
				else
				{
					diagonals[i] = 1;
				}
			}
			
			
			
			//Now we need to move through the candidates. They only occur in A and O regions, so we only scan those diagonals, top-left to bottom-right, and then bottom-left to top-right in terms of diagonals.
			let qPaths = [];
			let rimHooks = [];
			
			for (let i = -planePartition.length + 1; i < planePartition.length; i++)
			{
				if (diagonals[i] === 1 || diagonals[i] === 3)
				{
					continue;
				}
				
				let startRow = diagonalStarts[i][0];
				let startCol = diagonalStarts[i][1];
				
				if (planePartition[startRow][startCol] === 0)
				{
					continue;
				}
				
				
				
				while (true)
				{
					let foundCandidate = false;	
					
					while (startRow < planePartition.length && startCol < planePartition.length && planePartition[startRow][startCol] !== 0)
					{
						if ((startCol < planePartition.length - 1 && planePartition[startRow][startCol] > planePartition[startRow][startCol + 1]) || (startCol === planePartition.length - 1 && planePartition[startRow][startCol] > 0))
						{
							if (diagonals[i] === 0 || (diagonals[i] === 2 && ((startRow < planePartition.length - 1 && planePartition[startRow][startCol] > planePartition[startRow + 1][startCol]) || (startRow === planePartition.length - 1 && planePartition[startRow][startCol] > 0))))
							{
								foundCandidate = true;
								break;
							}	
						}
						
						startRow++;
						startCol++;
					}
					
					if (!foundCandidate)
					{
						break;
					}
					
					
					
					let row = startRow;
					let col = startCol;
					
					let path = [[row, col, planePartition[row][col] - 1]];
					
					while (true)
					{
						let currentContent = col - row;
						
						if (row < planePartition.length - 1 && planePartition[row][col] === planePartition[row + 1][col] && (diagonals[currentContent] === 0 || diagonals[currentContent] === 3))
						{
							row++;
						}
						
						else if (col > rowStarts[row] && (row === planePartition.length - 1 || (row < planePartition.length - 1 && planePartition[row][col] > planePartition[row + 1][col])))
						{
							col--;
						}
						
						else
						{
							break;
						}
						
						path.push([row, col, planePartition[row][col] - 1]);
					}
					
					path.forEach(box => planePartition[box[0]][box[1]]--);
					
					qPaths.push(path);
				}	
			}
			
			
			
			let emptyArray = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				emptyArray[i] = new Array(planePartition.length);
				
				for (let j = 0; j < planePartition.length; j++)
				{
					emptyArray[i][j] = planePartition[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let outputArray = await this.addNewArray(index + 1, emptyArray);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one. We're using a for loop because we need to await.
			for (let i = 0; i < qPaths.length; i++)
			{
				let hue = i / qPaths.length * 6/7;
				
				await this.colorCubes(array, qPaths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await this.raiseCubes(array, qPaths[i], array.height + 1);
				
				
				
				//Now we actually delete the cubes.
				qPaths[i].forEach(box =>
				{
					array.numbers[box[0]][box[1]]--;
					
					if (this.in2dView)
					{
						this.drawSingleCell2dViewText(array, box[0], box[1]);
					}	
				});
				
				this.recalculateHeights(array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 5));
				
				//Find the pivot and rearrange the shape into a hook. The end of the Q-path is the same as the end of the rim-hook, so it defines the row. To find the column, we need to go row boxes down, and then use the rest of the length to go right.
				let row = qPaths[i][qPaths[i].length - 1][0];
				
				let startContent = qPaths[i][qPaths[i].length - 1][1] - row;
				
				//Every step along the rim-hook increases the content by one.
				let endContent = startContent + qPaths[i].length - 1;
				
				let col = diagonalStarts[endContent][1];
				
				
				
				let targetCoordinates = [];
				
				let targetHeight = Math.max(array.height + 1, outputArray.height + 1);
				
				for (let j = columnStarts[col]; j <= row; j++)
				{
					targetCoordinates.push([j, col, targetHeight]);
				}
				
				for (let j = col - 1; j >= rowStarts[row]; j--)
				{
					targetCoordinates.push([row, j, targetHeight]);
				}
				
				await this.moveCubes(array, qPaths[i], outputArray, targetCoordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				targetCoordinates = [];
				
				for (let j = row - 1; j >= columnStarts[col]; j--)
				{
					targetCoordinates.push([j, col, targetHeight]);
				}
				
				this.deleteCubes(outputArray, targetCoordinates);
				
				targetCoordinates = [];
				
				for (let j = col - 1; j >= rowStarts[row]; j--)
				{
					targetCoordinates.push([row, j, targetHeight]);
				}
				
				this.deleteCubes(outputArray, targetCoordinates);
				
				
				
				await this.lowerCubes(outputArray, [[row, col, targetHeight]]);
				
				
				
				outputArray.numbers[row][col]++;
				
				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(outputArray, row, col);
				}
				
				this.recalculateHeights(outputArray);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			}
			
			
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	sulzgruberInverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = array.numbers;
			
			let qPaths = [];
			
			
			
			let columnStarts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[j][i] === Infinity)
				{
					j++;
				}
				
				columnStarts[i] = j;
			}
			
			
			
			let rowStarts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[i][j] === Infinity)
				{
					j++;
				}
				
				rowStarts[i] = j;
			}
			
			
			
			//First, find the candidates. This first requires categorizing the diagonals.
			let diagonalStarts = {};
			
			//First the ones along the left edge.
			for (let i = 0; i < tableau.length; i++)
			{
				diagonalStarts[-i] = [i, 0];
			}
			
			//Now the ones along the top edge.
			for (let i = 1; i < tableau.length; i++)
			{
				diagonalStarts[i] = [0, i];
			}
			
			for (let i = -tableau.length + 1; i < tableau.length; i++)
			{
				let row = diagonalStarts[i][0];
				let col = diagonalStarts[i][1];
				
				while (row < tableau.length && col < tableau.length && tableau[row][col] === Infinity)
				{
					row++;
					col++;
				}
				
				diagonalStarts[i] = [row, col];
			}
			
			
			
			let numHues = 0;
			
			let emptyArray = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				emptyArray[i] = new Array(tableau.length);
				
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] === Infinity)
					{
						emptyArray[i][j] = Infinity;
					}
					
					else
					{
						emptyArray[i][j] = 0;
						
						numHues += tableau[i][j];
					}	
				}
			}
			
			let outputArray = await this.addNewArray(index + 1, emptyArray);
			
			let planePartition = outputArray.numbers;
			
			
			
			let currentHueIndex = 0;
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let j = tableau.length - 1; j >= 0; j--)
			{
				for (let i = tableau.length - 1; i >= 0; i--)
				{
					if (tableau[i][j] === Infinity)
					{
						continue;
					}
					
					
					
					while (tableau[i][j] !== 0)
					{
						let hue = currentHueIndex / numHues * 6/7;
						
						let height = Math.max(array.size + 1, outputArray.size + 1);
						
						await this.colorCubes(array, [[i, j, tableau[i][j] - 1]], hue);
						
						await this.raiseCubes(array, [[i, j, tableau[i][j] - 1]], height);
						
						
						
						let row = i;
						let col = j;
						
						//Add a bunch of cubes corresponding to the hook that this thing is a part of.
						for (let k = columnStarts[col]; k < row; k++)
						{
							array.cubes[k][col][height] = this.addCube(array, col, height, k);
							array.cubes[k][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
						}
						
						for (let k = rowStarts[row]; k < col; k++)
						{
							array.cubes[row][k][height] = this.addCube(array, k, height, row);
							array.cubes[row][k][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
						}
						
						
						
						let coordinates = [];
						
						for (let k = row - 1; k >= columnStarts[col]; k--)
						{
							coordinates.push([k, col, height]);
						}
						
						let promise1 = this.revealCubes(array, coordinates);
						
						coordinates = [];
						
						for (let k = col - 1; k >= rowStarts[row]; k--)
						{
							coordinates.push([row, k, height]);
						}
						
						let promise2 = this.revealCubes(array, coordinates);
						
						await Promise.all([promise1, promise2]);
						
						
						
						//In order to animate this nicely, we won't just jump straight to the Q-path -- we'll turn it into a rim-hook first.
						coordinates = [];
						
						for (let k = rowStarts[row]; k < col; k++)
						{
							coordinates.push([row, k, height]);
						}
						
						coordinates.push([row, col, array.numbers[row][col] - 1]);
						
						for (let k = row - 1; k >= columnStarts[col]; k--)
						{
							coordinates.push([k, col, height]);
						}
						
						
						
						let startContent = rowStarts[row] - row;
						let endContent = startContent + coordinates.length - 1;
						
						let targetCoordinates = [];
						
						for (let k = startContent; k <= endContent; k++)
						{
							targetCoordinates.push(_.clone(diagonalStarts[k]));
						}
						
						
						
						tableau[row][col]--;
						
						this.recalculateHeights(array);
						
						if (this.in2dView)
						{
							this.drawSingleCell2dViewText(array, row, col);
						}
						
						await this.moveCubes(array, coordinates, outputArray, targetCoordinates);
						
						
						
						//Now we'll lower one part at a time.
						let currentIndex = 0;
						
						let currentHeight = outputArray.numbers[targetCoordinates[0][0]][targetCoordinates[0][1]];
						
						while (true)
						{
							let nextIndex = currentIndex;
							
							while (nextIndex < targetCoordinates.length && targetCoordinates[nextIndex][0] === targetCoordinates[currentIndex][0])
							{
								nextIndex++;
							}
							
							coordinates = targetCoordinates.slice(currentIndex, nextIndex);
							
							
							
							//Check if this part can all be inserted at the same height.
							let insertionWorks = true;
							
							for (let k = 0; k < coordinates.length; k++)
							{
								if (outputArray.numbers[coordinates[k][0]][coordinates[k][1]] !== currentHeight)
								{
									insertionWorks = false;
									break;
								}
							}
							
							
							
							if (insertionWorks)
							{
								await this.lowerCubes(outputArray, coordinates);
								
								coordinates.forEach(coordinate => outputArray.numbers[coordinate[0]][coordinate[1]]++);
								
								this.recalculateHeights(outputArray);
								
								if (this.in2dView)
								{
									coordinates.forEach(entry =>
									{
										this.drawSingleCell2dViewText(outputArray, entry[0], entry[1])
									});
								}
								
								currentIndex = nextIndex;
							}
							
							else
							{
								let oldTargetCoordinates = _.cloneDeep(targetCoordinates.slice(currentIndex));
								
								//Shift the rest of the coordinates down and right by 1.
								for (let k = currentIndex; k < targetCoordinates.length; k++)
								{
									targetCoordinates[k][0]++;
									targetCoordinates[k][1]++;
									
									if (targetCoordinates[k][0] > outputArray.footprint || targetCoordinates[k][1] > outputArray.footprint)
									{
										console.error("Insertion failed!");
										return;
									}
								}
								
								let newTargetCoordinates = targetCoordinates.slice(currentIndex);
								
								await this.moveCubes(outputArray, oldTargetCoordinates, outputArray, newTargetCoordinates);
								
								currentHeight = outputArray.numbers[targetCoordinates[currentIndex][0]][targetCoordinates[currentIndex][1]];
							}
							
							
							
							if (currentIndex === targetCoordinates.length)
							{
								break;
							}
						}
						
						
						
						currentHueIndex++;
						
						await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
					}	
				}
			}	
			
			
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	rsk(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let pArray = this.arrays[index];
			let qArray = this.arrays[index + 1];
			
			let pSsyt = pArray.numbers;
			let qSsyt = qArray.numbers;
			
			let arraySize = 0;
			
			let numHues = 0;
			
			//Remove any color that's here.
			for (let i = 0; i < pSsyt.length; i++)
			{
				for (let j = 0; j < pSsyt.length; j++)
				{
					if (pSsyt[i][j] === Infinity || qSsyt[i][j] === Infinity)
					{
						this.displayError(`The SSYT contain infinite values, which is not allowed in RSK!`);
						
						this.currentlyRunningAlgorithm = false;
						
						resolve();
						return;
					}
					
					if (pSsyt[i][j] !== 0)
					{
						numHues++;
					}
					
					arraySize = Math.max(Math.max(arraySize, pSsyt[i][j]), qSsyt[i][j]);
				}
			}
			
			if (arraySize === 0)
			{
				displayError(`The SSYT are empty!`);
				
				currentlyRunningAlgorithm = false;
				
				resolve();
				return;
			}
			
			
			
			let emptyArray = new Array(arraySize);
			
			for (let i = 0; i < arraySize; i++)
			{
				emptyArray[i] = new Array(arraySize);
				
				for (let j = 0; j < arraySize; j++)
				{
					emptyArray[i][j] = 0;
				}
			}
			
			let outputArray = await this.addNewArray(index + 2, emptyArray);
			
			
			
			//Start building up the entries in w. The first thing to do is to undo the insertion operations in P, using the entries in Q to ensure they're in the right order. The most recently added entry is the rightmost largest number in Q.
			let w = [];
			
			let hueIndex = 0;
			
			while (qSsyt[0][0] !== 0)
			{
				let hue = hueIndex / numHues * 6/7;
				
				let maxEntry = 0;
				let row = 0;
				let col = 0;
				
				for (let i = 0; i < qSsyt.length; i++)
				{
					let j = qSsyt.length - 1;
					
					while (j >= 0 && qSsyt[i][j] === 0)
					{
						j--;
					}
					
					if (j >= 0)
					{
						maxEntry = Math.max(maxEntry, qSsyt[i][j]);
					}
				}
				
				for (let i = 0; i < qSsyt.length; i++)
				{
					let j = qSsyt.length - 1;
					
					while (j >= 0 && qSsyt[i][j] === 0)
					{
						j--;
					}
					
					if (qSsyt[i][j] === maxEntry)
					{
						row = i;
						col = j;
						break;
					}
				}
				
				
				
				//Now row and col are the coordinates of the most recently added element. We just need to un-insert the corresponding element from P.
				let pSourceCoordinatesLocal = [];
				let pTargetCoordinatesLocal = [];
				let pSourceCoordinatesExternal = [];
				let pTargetCoordinatesExternal = [];
				
				let qSourceCoordinatesExternal = [];
				let qTargetCoordinatesExternal = [];
				
				let i = row;
				let j = col;
				let pEntry = pSsyt[i][j];
				let qEntry = qSsyt[i][j];
				
				let pCoordinatePath = [[i, j]];
				
				
				
				while (i !== 0)
				{
					//Find the rightmost element in the row above that's strictly smaller than this.
					let newJ = pSsyt.length - 1;
					
					while (pSsyt[i - 1][newJ] === 0 || pEntry <= pSsyt[i - 1][newJ])
					{
						newJ--;
					}
					
					for (let k = 0; k < pEntry; k++)
					{
						pSourceCoordinatesLocal.push([i, j, k]);
						pTargetCoordinatesLocal.push([i - 1, newJ, k]);
					}
					
					i--;
					j = newJ;
					pEntry = pSsyt[i][j];
					
					pCoordinatePath.push([i, j]);
				}
				
				
				
				//Alright, time for a stupid hack. The visual result we want is to take the stacks getting popped from both P and Q, move them to the first row and column of the output array to form a hook, delete all but one box (the top box of P), and then lower the other. The issue is that this will risk overwriting one of the two overlapping boxes, causing a memory leak and a glitchy state. The solution is to do a couple things. Only the P corner box will actually move to the output array -- the one from Q will appear to, but it will stay in its own array.
				
				let height = outputArray.height + 1;
				
				for (let k = 0; k < pEntry; k++)
				{
					pSourceCoordinatesExternal.push([i, j, k]);
					pTargetCoordinatesExternal.push([qEntry - 1, k, height]);
				}
				
				for (let k = 0; k < qEntry - 1; k++)
				{
					qSourceCoordinatesExternal.push([row, col, k]);
					qTargetCoordinatesExternal.push([k, pEntry - 1, height]);
				}
				
				
				
				this.colorCubes(qArray, qSourceCoordinatesExternal.concat([[row, col, qEntry - 1]]), hue);
				this.colorCubes(pArray, pSourceCoordinatesLocal, hue);
				await this.colorCubes(pArray, pSourceCoordinatesExternal, hue);
				
				
				
				//Update all the numbers.
				qSsyt[row][col] = 0;
				
				for (let k = pCoordinatePath.length - 1; k > 0; k--)
				{
					pSsyt[pCoordinatePath[k][0]][pCoordinatePath[k][1]] = pSsyt[pCoordinatePath[k - 1][0]][pCoordinatePath[k - 1][1]];
				}
				
				pSsyt[row][col] = 0;
				
				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(pArray, row, col);
					
					for (let k = pCoordinatePath.length - 1; k > 0; k--)
					{
						this.drawSingleCell2dViewText(pArray, pCoordinatePath[k][0], pCoordinatePath[k][1]);
					}
					
					this.drawSingleCell2dViewText(qArray, row, col);
				}
				
				
				
				this.moveCubes(qArray, qSourceCoordinatesExternal, outputArray, qTargetCoordinatesExternal);
				this.moveCubes(pArray, pSourceCoordinatesExternal, outputArray, pTargetCoordinatesExternal);
				this.moveCubes(pArray, pSourceCoordinatesLocal, pArray, pTargetCoordinatesLocal);
				await this.moveCubes(qArray, [[row, col, qEntry - 1]], outputArray, [[qEntry - 1, pEntry - 1, height]], false);
				
				
				
				this.uncolorCubes(pArray, pTargetCoordinatesLocal);
				
				
				
				//Delete the non-corner parts of the hook (animated), delete one of the overlapping corner cubes (instantly), and drop the other.
				
				//Gross but necessary. deleteCubes() needs to detach the object from its parent cube group, but what we pass isn't actually its parent, so we have to do it manually.
				outputArray.cubeGroup.remove(qArray.cubes[row][col][qEntry - 1]);
				this.deleteCubes(qArray, [[row, col, qEntry - 1]], true, true);
				
				pTargetCoordinatesExternal.reverse();
				qTargetCoordinatesExternal.reverse();
				
				this.deleteCubes(outputArray, pTargetCoordinatesExternal.slice(1));
				this.deleteCubes(outputArray, qTargetCoordinatesExternal);
				
				await this.lowerCubes(outputArray, [[qEntry - 1, pEntry - 1, height]]);
				
				emptyArray[qEntry - 1][pEntry - 1]++;
				
				if (this.in2dView)
				{
					this.drawSingleCell2dViewText(outputArray, qEntry - 1, pEntry - 1);
				}
				
				this.recalculateHeights(outputArray);
				
				
				
				hueIndex++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			}
			
			
			
			
			await this.removeArray(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	rskInverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = _.cloneDeep(array.numbers);
			
			let numEntries = 0;
			
			tableau.forEach(row => row.forEach(entry => numEntries += entry));
			
			//The largest possible shape for these two is a straight line, requiring all the inserted elements to be increasing or decreasing.
			let pSsyt = new Array(numEntries);
			let qSsyt = new Array(numEntries);
			
			for (let i = 0; i < numEntries; i++)
			{
				pSsyt[i] = new Array(numEntries);
				qSsyt[i] = new Array(numEntries);
				
				for (let j = 0; j < numEntries; j++)
				{
					pSsyt[i][j] = 0;
					qSsyt[i][j] = 0;
				}
			}
			
			
			
			let pRowLengths = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				pRowLengths[i] = 0;
			}
			
			let pNumRows = 0;
			
			
			
			//Unfortunately, there's no way to know the shape of P and Q without actually doing RSK, so we need to do all the calculations ahead of time, and only then animate things around.
			let pInsertionPaths = [];
			let qInsertionLocations = [];
			let tableauRemovalLocations = [];
			
			for (let row = 0; row < tableau.length; row++)
			{
				for (let col = 0; col < tableau.length; col++)
				{
					while (tableau[row][col] !== 0)
					{
						tableau[row][col]--;
						
						let newNum = col + 1;
						
						let i = 0;
						let j = 0;
						
						let path = [];
						
						while (true)
						{
							j = pRowLengths[i];
							
							while (j !== 0 && pSsyt[i][j - 1] > newNum)
							{
								j--;
							}
							
							if (j === pRowLengths[i])
							{
								pSsyt[i][j] = newNum;
								
								pRowLengths[i]++;
								
								if (j === 0)
								{
									pNumRows++;
								}
								
								path.push([i, j]);
								
								break;
							}
							
							let temp = pSsyt[i][j];
							pSsyt[i][j] = newNum;
							newNum = temp;
							path.push([i, j]);
							
							i++;
						}
						
						pInsertionPaths.push(path);
						qInsertionLocations.push([i, j]);
						tableauRemovalLocations.push([row, col]);
						
						qSsyt[i][j] = row + 1;
					}
				}
			}
			
			
	
			let ssytSize = Math.max(pRowLengths[0], pNumRows);
			
			pSsyt = new Array(ssytSize);
			qSsyt = new Array(ssytSize);
			
			for (let i = 0; i < ssytSize; i++)
			{
				pSsyt[i] = new Array(ssytSize);
				qSsyt[i] = new Array(ssytSize);
				
				for (let j = 0; j < ssytSize; j++)
				{
					pSsyt[i][j] = 0;
					qSsyt[i][j] = 0;
				}
			}
			
			let pArray = await this.addNewArray(index + 1, pSsyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			let qArray = await this.addNewArray(index + 2, qSsyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			
			
			let hueIndex = 0;
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let i = 0; i < tableauRemovalLocations.length; i++)
			{
				let row = tableauRemovalLocations[i][0];
				let col = tableauRemovalLocations[i][1];
				
				let height = array.height + 1;
				
				let hue = hueIndex / numEntries * 6/7;
				
				
				
				//Add a bunch of cubes corresponding to the hook that this thing is a part of.
				for (let j = col; j >= 0; j--)
				{
					array.cubes[row][j][height] = this.addCube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}
				
				for (let j = row - 1; j >= 0; j--)
				{
					array.cubes[j][col][height] = this.addCube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				}
				
				//This is the duplicate cube. As usual, we need to store it somewhere else in the array -- here, we're going to place it one space vertically above its actual location.
				
				array.cubes[row][col][height + 1] = this.addCube(array, col, height, row);
				array.cubes[row][col][height + 1].material.forEach(material => material.color.setHSL(hue, 1, this.cubeLightness));
				
				
				
				await this.colorCubes(array, [[row, col, array.numbers[row][col] - 1]], hue);
				
				await this.raiseCubes(array, [[row, col, array.numbers[row][col] - 1]], height);
				
				
				
				let promise1 = this.revealCubes(array, [[row, col, height + 1]]);
				
				let coordinates = [];
				
				for (let j = col - 1; j >= 0; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise2 = this.revealCubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = row - 1; j >= 0; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise3 = this.revealCubes(array, coordinates);
				
				await Promise.all([promise1, promise2, promise3]);
				
				
				
				//First of all, we'll handle the insertion into P. As always, this takes some care. The strictly proper way to animate this would be to move the stacks one at a time, but just like with the forward direction, it is *much* easier (and time-efficient) to just move everything at once.
				let path = pInsertionPaths[hueIndex];
				
				let pSourceCoordinatesLocal = [];
				let pTargetCoordinatesLocal = [];
				
				let pSourceCoordinatesExternal = [[row, col, array.numbers[row][col] - 1]];
				let pTargetCoordinatesExternal = [[path[0][0], path[0][1], col]];
				
				let qSourceCoordinatesExternal = [[row, col, height + 1]];
				let qTargetCoordinatesExternal = [[qInsertionLocations[hueIndex][0], qInsertionLocations[hueIndex][1], row]];
				
				
				
				for (let j = col - 1; j >= 0; j--)
				{
					pSourceCoordinatesExternal.push([row, j, height]);
					pTargetCoordinatesExternal.push([path[0][0], path[0][1], j]);
				}
				
				for (let j = 0; j < path.length - 1; j++)
				{
					for (let k = 0; k < pSsyt[path[j][0]][path[j][1]]; k++)
					{
						pSourceCoordinatesLocal.push([path[j][0], path[j][1], k]);
						pTargetCoordinatesLocal.push([path[j + 1][0], path[j + 1][1], k]);
					}
				}
				
				for (let j = row - 1; j >= 0; j--)
				{
					qSourceCoordinatesExternal.push([j, col, height]);
					qTargetCoordinatesExternal.push([qInsertionLocations[hueIndex][0], qInsertionLocations[hueIndex][1], j]);
				}
				
				await this.colorCubes(pArray, pSourceCoordinatesLocal, hue);
				
				
				
				for (let j = path.length - 1; j > 0; j--)
				{
					pSsyt[path[j][0]][path[j][1]] = pSsyt[path[j - 1][0]][path[j - 1][1]];
				}
				
				if (path.length !== 0)
				{
					pSsyt[path[0][0]][path[0][1]] = 0;
				}
				
				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
				
				if (pSourceCoordinatesLocal.length !== 0)
				{
					await this.moveCubes(pArray, pSourceCoordinatesLocal, pArray, pTargetCoordinatesLocal);	
				}	
				
				
				
				array.numbers[row][col]--;
				
				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
				
				this.moveCubes(array, pSourceCoordinatesExternal, pArray, pTargetCoordinatesExternal);
				
				await this.moveCubes(array, qSourceCoordinatesExternal, qArray, qTargetCoordinatesExternal);
				
				
				
				pSsyt[path[0][0]][path[0][1]] = col + 1;
				
				qSsyt[qInsertionLocations[hueIndex][0]][qInsertionLocations[hueIndex][1]] = row + 1;
				
				if (this.in2dView)
				{
					this.drawAll2dViewText();
				}
				
				
				
				this.recalculateHeights(array);
				this.recalculateHeights(pArray);
				this.recalculateHeights(qArray);
				
				
				
				hueIndex++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			}
			
			
			
			await this.removeArray(index);
			
			resolve();
		});	
	}
	
	
	
	godar1(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			//Figure out the shape of nu.
			let array = this.arrays[index];
			let planePartition = array.numbers;
			
			let nuRowLengths = new Array(2 * planePartition.length);
			let nuColLengths = new Array(2 * planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				let j = 0;
				
				while (j < planePartition.length && planePartition[i][j] === Infinity)
				{
					j++;
				}
				
				nuRowLengths[i] = j;
				
				
				
				j = 0;
				
				while (j < planePartition.length && planePartition[j][i] === Infinity)
				{
					j++;
				}
				
				nuColLengths[i] = j;
			}
			
			for (let i = planePartition.length; i < 2 * planePartition.length; i++)
			{
				nuRowLengths[i] = 0;
				
				nuColLengths[i] = 0;
			}
			
			let rppSize = Math.max(nuRowLengths[0], nuColLengths[0]);
			
			
			
			let newArray = new Array(planePartition.length);
			
			for (let i = 0; i < planePartition.length; i++)
			{
				newArray[i] = new Array(planePartition.length);
				
				for (let j = 0; j < planePartition.length; j++)
				{
					if (planePartition[i][j] === Infinity)
					{
						newArray[i][j] = this.infiniteHeight;
					}
					
					else
					{
						newArray[i][j] = planePartition[i][j];
					}
				}
			}
			
			await this.addNewArray(index + 1, newArray);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			await this.removeArray(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			array = this.arrays[index];
			planePartition = array.numbers;
			
			
			
			let rightLegSize = 0;
			let bottomLegSize = 0;
			
			while (rightLegSize < planePartition.length && planePartition[rightLegSize][planePartition.length - 1] !== 0)
			{
				rightLegSize++;
			}
			
			while (bottomLegSize < planePartition.length && planePartition[planePartition.length - 1][bottomLegSize] !== 0)
			{
				bottomLegSize++;
			}
			
			
			
			await this.runAlgorithm("pak", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 2));
			
			array = this.arrays[index];
			planePartition = array.numbers;
			
			
			
			//Clip out the finite part of the array.
			
			//The -1 is there to ensure the new array has the padding that indicates it's finite on the edges.
			const legSize = Math.max(rightLegSize, bottomLegSize);
			
			let finiteArray = new Array(planePartition.length - legSize + 1);
			
			let cubesToDelete = [];
			
			for (let i = 0; i < finiteArray.length - 1; i++)
			{
				finiteArray[i] = new Array(finiteArray.length);
				
				for (let j = 0; j < finiteArray.length - 1; j++)
				{
					finiteArray[i][j] = planePartition[i][j];
					
					for (let k = 0; k < planePartition[i][j]; k++)
					{
						cubesToDelete.push([i, j, k]);
					}
					
					planePartition[i][j] = 0;
				}
				
				finiteArray[i][finiteArray.length - 1] = 0;
			}
			
			finiteArray[finiteArray.length - 1] = new Array(finiteArray.length);
			
			for (let j = 0; j < finiteArray.length; j++)
			{
				finiteArray[finiteArray.length - 1][j] = 0;
			}
			
			
			
			this.deleteCubes(array, cubesToDelete, true, true);
			
			await this.addNewArray(index, finiteArray);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			
			
			//Now we unPak the second array.
			
			await this.runAlgorithm("pakInverse", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 2));
			
			
	
			//We're now clear to pull apart the negative RPP from the finite part.n
			
			
			
			//In order for the bijection to actually be correct, we need to make sure the rearrangement works the same way each time. The easiest way to do this is to ensure that every hook length actually in the APP has a *full* array of possible locations, so that its index in that is correct.
			
			
			
			//Organize everything by hook length.
			let maxAppHookLength = 2 * planePartition.length - nuRowLengths[planePartition.length - 1] - nuColLengths[planePartition.length - 1];
			let maxRppHookLength = nuRowLengths[0] + nuColLengths[0];
			
			let appPivotsByHookLength = new Array(4 * planePartition.length);
			let rppPivotsByHookLength = new Array(maxRppHookLength);
			let ppPivotsByHookLength = new Array(4 * planePartition.length);
			
			for (let i = 0; i < 4 * planePartition.length; i++)
			{
				appPivotsByHookLength[i] = new Array();
			}
			
			for (let i = 0; i < maxRppHookLength; i++)
			{
				rppPivotsByHookLength[i] = new Array();
			}
			
			for (let i = 0; i < 4 * planePartition.length; i++)
			{
				ppPivotsByHookLength[i] = new Array();
			}
			
			let ppSize = 1;
			
			//If nu = (3, 1) and the APP given is 3x3, then its maximum hook length is 5, and we need to check an 8x8 square.
			
			for (let i = 0; i < 2 * planePartition.length; i++)
			{
				for (let j = 0; j < 2 * planePartition.length; j++)
				{
					if (j >= nuRowLengths[i])
					{
						appPivotsByHookLength[i + j + 1 - nuRowLengths[i] - nuColLengths[j]].push([i, j]);
					}
					
					else
					{
						//.unshift rather than .push makes the hooks move in the correct order.
						rppPivotsByHookLength[nuRowLengths[i] + nuColLengths[j] - i - j - 1].unshift([rppSize - i - 1, rppSize - j - 1]);
					}
					
					ppPivotsByHookLength[i + j + 1].push([i, j]);
				}
			}
			
			
			
			let hookMap = new Array(2 * planePartition.length);
			
			for (let i = 0; i < 2 * planePartition.length; i++)
			{
				hookMap[i] = new Array(2 * planePartition.length);
			}
			
			for (let i = 1; i < maxAppHookLength; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < appPivotsByHookLength[i].length; j++)
				{
					let row = appPivotsByHookLength[i][j][0];
					let col = appPivotsByHookLength[i][j][1];
					
					if (row < planePartition.length - bottomLegSize && col < planePartition.length - rightLegSize)
					{
						for (let k = 0; k < this.arrays[index].numbers[row][col]; k++)
						{
							coordinates.push([row, col, k]);
						}
					}
					
					if (j < ppPivotsByHookLength[i].length)
					{
						hookMap[row][col] = [1, ppPivotsByHookLength[i][j]];
						
						if (row < planePartition.length && col < planePartition.length && this.arrays[index].numbers[row][col] > 0)
						{
							ppSize = Math.max(Math.max(ppSize, ppPivotsByHookLength[i][j][0] + 1), ppPivotsByHookLength[i][j][1] + 1);
						}
					}
					
					else
					{
						hookMap[row][col] = [0, rppPivotsByHookLength[i][j - ppPivotsByHookLength[i].length]];
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.colorCubes(this.arrays[index], coordinates, (i - 1) / (maxAppHookLength - 1) * 6/7);
				}
			}
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 3));
			
			
			
			let rpp = new Array(rppSize);
			
			for (let i = 0; i < rppSize; i++)
			{
				rpp[i] = new Array(rppSize);
				
				for (let j = 0; j < rppSize; j++)
				{
					if (j < rppSize - nuRowLengths[rppSize - i - 1])
					{
						rpp[i][j] = Infinity;
					}
					
					else
					{
						rpp[i][j] = 0;
					}
				}
			}
			
			let rppArray = null;
			
			if (rppSize > 0)
			{
				rppArray = await this.addNewArray(index + 1, rpp);
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			}
			
			
			
			let pp = new Array(ppSize);
			
			for (let i = 0; i < ppSize; i++)
			{
				pp[i] = new Array(ppSize);
				
				for (let j = 0; j < ppSize; j++)
				{
					pp[i][j] = 0;
				}
			}
			
			let ppArray = await this.addNewArray(index + 2, pp);
			
			
			
			for (let i = 0; i < planePartition.length - bottomLegSize; i++)
			{
				for (let j = nuRowLengths[i]; j < planePartition.length - rightLegSize; j++)
				{
					if (this.arrays[index].numbers[i][j] > 0)
					{
						let sourceCoordinates = [];
						let targetCoordinates = [];
						
						let targetRow = hookMap[i][j][1][0];
						let targetCol = hookMap[i][j][1][1];
						
						for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
						{
							sourceCoordinates.push([i, j, k]);
							targetCoordinates.push([targetRow, targetCol, k]);
						}
						
						if (hookMap[i][j][0] === 0)
						{
							await this.moveCubes(this.arrays[index], sourceCoordinates, rppArray, targetCoordinates);
							
							rpp[targetRow][targetCol] = this.arrays[index].numbers[i][j];
							this.arrays[index].numbers[i][j] = 0;
						}
						
						else
						{
							await this.moveCubes(this.arrays[index], sourceCoordinates, ppArray, targetCoordinates);
							
							pp[targetRow][targetCol] = this.arrays[index].numbers[i][j];
							this.arrays[index].numbers[i][j] = 0;
						}
						
						if (this.in2dView)
						{
							this.drawAll2dViewText();
						}
					}	
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 3));
			
			//Now it's time for the palindromic toggle.
			
			await this.runAlgorithm("pakInverse", index, true);
				
			if (rppSize > 0)
			{
				await this.runAlgorithm("hillmanGrasslInverse", index + 1, true);
			}	
			
			this.resolve();
		});	
	}
	
	
	
	godar1Inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let ppArray = this.arrays[index + 1];
			let pp = ppArray.numbers;
			
			let rppArray = this.arrays[index];
			let rpp = rppArray.numbers;
			
			let nuRowLengths = new Array(pp.length + 2 * rpp.length);
			let nuColLengths = new Array(pp.length + 2 * rpp.length);
			
			for (let i = 0; i < pp.length + 2 * rpp.length; i++)
			{
				nuRowLengths[i] = 0;
				nuColLengths[i] = 0;
			}
			
			//Figure out the shape of nu.
			for (let i = 0; i < rpp.length; i++)
			{
				let j = rpp.length - 1;
				
				while (j >= 0 && rpp[i][j] !== Infinity)
				{
					j--;
				}
				
				nuRowLengths[rpp.length - i - 1] = rpp.length - j - 1;
				
				
				
				j = rpp.length - 1;
				
				while (j >= 0 && rpp[j][i] !== Infinity)
				{
					j--;
				}
				
				nuColLengths[rpp.length - i - 1] = rpp.length - j - 1;
			}
			
			
			
			await this.runAlgorithm("pak", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			await this.runAlgorithm("pak", index + 1, true);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 3));
			
			
			
			//Uncolor everything.
			let coordinates = [];
			
			let numbers = this.arrays[index].numbers;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== Infinity)
					{
						for (let k = 0; k < numbers[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			this.uncolorCubes(this.arrays[index], coordinates);
			
			
			
			coordinates = [];
			
			numbers = this.arrays[index + 1].numbers;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== Infinity)
					{
						for (let k = 0; k < numbers[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			await this.uncolorCubes(arrays[index + 1], coordinates);
			
			
			
			//Organize everything by hook length. The largest the APP can be is determined by the maximum hook in the plane partition -- we'll narrow this down later but it suffices for now.
			let appSize = Math.max(nuRowLengths[0], nuColLengths[0]) + 2 * pp.length - 1;
			let maxAppHookLength = 2 * appSize;
			let maxRppHookLength = nuRowLengths[0] + nuColLengths[0];
			let maxPpHookLength = 2 * pp.length;
			
			let appPivotsByHookLength = new Array(maxAppHookLength);
			let rppPivotsByHookLength = new Array(maxRppHookLength);
			let ppPivotsByHookLength = new Array(maxPpHookLength);
			
			for (let i = 0; i < maxAppHookLength; i++)
			{
				appPivotsByHookLength[i] = new Array();
			}
			
			for (let i = 0; i < maxRppHookLength; i++)
			{
				rppPivotsByHookLength[i] = new Array();
			}
			
			for (let i = 0; i < maxPpHookLength; i++)
			{
				ppPivotsByHookLength[i] = new Array(i);
				
				for (let j = 0; j < i; j++)
				{
					ppPivotsByHookLength[i][j] = -1;
				}
			}
			
			
			
			while (nuRowLengths.length < appSize)
			{
				nuRowLengths.push(0);
			}
			
			while (nuColLengths.length < appSize)
			{
				nuColLengths.push(0);
			}
			
			
			
			for (let i = 0; i < appSize; i++)
			{
				for (let j = 0; j < appSize; j++)
				{
					if (j >= nuRowLengths[i])
					{
						appPivotsByHookLength[i + j + 1 - nuRowLengths[i] - nuColLengths[j]].push([i, j]);
					}
					
					else
					{
						//.unshift rather than .push makes the hooks move in the correct order.
						rppPivotsByHookLength[nuRowLengths[i] + nuColLengths[j] - i - j - 1].unshift([rpp.length - i - 1, rpp.length - j - 1]);
					}
					
					
					
					if (i < pp.length && j < pp.length)
					{
						//We can't just use .push here -- there will be more hooks of any given length that aren't included in the square.
						ppPivotsByHookLength[i + j + 1][i] = [i, j];
					}	
				}
			}
			
			let ppHookMap = new Array(pp.length);
			
			for (let i = 0; i < pp.length; i++)
			{
				ppHookMap[i] = new Array(pp.length);
			}
			
			let rppHookMap = new Array(rpp.length);
			
			for (let i = 0; i < rpp.length; i++)
			{
				rppHookMap[i] = new Array(rpp.length);
			}
			
			
			
			appSize = 1;
			
			for (let i = 1; i < maxRppHookLength; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < rppPivotsByHookLength[i].length; j++)
				{
					let row = rppPivotsByHookLength[i][j][0];
					let col = rppPivotsByHookLength[i][j][1];
					
					for (let k = 0; k < arrays[index].numbers[row][col]; k++)
					{
						coordinates.push([row, col, k]);
					}
					
					rppHookMap[row][col] = appPivotsByHookLength[i][j + ppPivotsByHookLength[i].length];
					
					if (this.arrays[index].numbers[row][col] !== 0)
					{
						appSize = Math.max(Math.max(appSize, rppHookMap[row][col][0] + 1), rppHookMap[row][col][1] + 1);
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.colorCubes(this.arrays[index], coordinates, (i - 1) / (maxRppHookLength - 1) * 6/7);
				}
			}
			
			
			
			for (let i = 1; i < maxPpHookLength; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < ppPivotsByHookLength[i].length; j++)
				{
					if (ppPivotsByHookLength[i][j] === -1)
					{
						continue;
					}
					
					let row = ppPivotsByHookLength[i][j][0];
					let col = ppPivotsByHookLength[i][j][1];
					
					for (let k = 0; k < arrays[index + 1].numbers[row][col]; k++)
					{
						coordinates.push([row, col, k]);
					}
					
					ppHookMap[row][col] = appPivotsByHookLength[i][j];
					
					if (this.arrays[index + 1].numbers[row][col] !== 0)
					{
						appSize = Math.max(Math.max(appSize, ppHookMap[row][col][0] + 1), ppHookMap[row][col][1] + 1);
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.colorCubes(this.arrays[index + 1], coordinates, (i - 1) / (maxPpHookLength - 1) * 6/7);
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 3));
			
			
			
			let app = new Array(appSize);
			
			for (let i = 0; i < appSize; i++)
			{
				app[i] = new Array(appSize);
				
				for (let j = 0; j < appSize; j++)
				{
					if (j < nuRowLengths[i])
					{
						app[i][j] = Infinity;
					}
					
					else
					{
						app[i][j] = 0;
					}	
				}
			}
			
			let appArray = await this.addNewArray(index + 2, app);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			
			
			for (let i = 0; i < rpp.length; i++)
			{
				for (let j = 0; j < rpp.length; j++)
				{
					if (arrays[index].numbers[i][j] > 0 && this.arrays[index].numbers[i][j] !== Infinity)
					{
						let sourceCoordinates = [];
						let targetCoordinates = [];
						
						let targetRow = rppHookMap[i][j][0];
						let targetCol = rppHookMap[i][j][1];
						
						for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
						{
							sourceCoordinates.push([i, j, k]);
							targetCoordinates.push([targetRow, targetCol, k]);
						}
						
						await this.moveCubes(this.arrays[index], sourceCoordinates, appArray, targetCoordinates);
						
						app[targetRow][targetCol] = this.arrays[index].numbers[i][j];
						
						this.arrays[index].numbers[i][j] = 0;
						
						
						
						if (this.in2dView)
						{
							this.drawAll2dViewText();
						}
					}	
				}
			}
			
			
			
			for (let i = 0; i < pp.length; i++)
			{
				for (let j = 0; j < pp.length; j++)
				{
					if (this.arrays[index + 1].numbers[i][j] > 0 && arrays[index + 1].numbers[i][j] !== Infinity)
					{
						let sourceCoordinates = [];
						let targetCoordinates = [];
						
						let targetRow = ppHookMap[i][j][0];
						let targetCol = ppHookMap[i][j][1];
						
						for (let k = 0; k < this.arrays[index + 1].numbers[i][j]; k++)
						{
							sourceCoordinates.push([i, j, k]);
							targetCoordinates.push([targetRow, targetCol, k]);
						}
						
						
						
						await this.moveCubes(this.arrays[index + 1], sourceCoordinates, appArray, targetCoordinates);
						
						app[targetRow][targetCol] = this.arrays[index + 1].numbers[i][j];
						this.arrays[index + 1].numbers[i][j] = 0;
						
						
						
						if (this.in2dView)
						{
							this.drawAll2dViewText();
						}
					}	
				}
			}
			
			
			
			await this.removeArray(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime / 2));
			
			await this.removeArray(index);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime * 3));
			
			
			
			await this.runAlgorithm("pakInverse", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animationTime));
			
			
			
			resolve();
		});
	}
	
	
	
	//A demonstration of the n-quotient, not currently public-facing in the applet. It uses the numbers canvas to draw the appropriate edges and move them around. To call this function, the canvas should be in 2d mode but the numbers should be gone.
	drawBoundary(index, n)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!this.in2dView)
			{
				await this.show2dView();
			}
			
			if (this.wilsonNumbers.canvas.style.opacity !== "0")
			{
				await changeOpacity(this.wilsonNumbers.canvas, 0, this.animationTime / 3);
			}
			
			this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
			
			
			
			let array = this.arrays[index];
			let planePartition = array.numbers;
			
			let rects = [];
			
			let hueIndex = 0;
			
			let j = 0;
			
			for (let i = array.footprint - 1; i >= 0; i--)
			{
				while (j < array.footprint && planePartition[i][j] === Infinity)
				{
					//Add horizontal edges.
					if (i === array.footprint - 1 || planePartition[i + 1][j] !== Infinity)
					{
						let h = (hueIndex % n) / n;
						
						let rgb = this.wilson.utils.hsvToRgb(h, 1, 1);
						
						rects.push([i, j, true, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
						
						hueIndex++;
					}
					
					j++;
				}
				
				//Add a vertical edge.
				let h = (hueIndex % n) / n;
				
				let rgb = this.wilson.utils.hsvToRgb(h, 1, 1);
				
				rects.push([i, j, false, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
				
				hueIndex++;
			}
			
			//Add all the horizontal edges we missed.
			let i = -1;
			
			while (j < array.footprint)
			{
				if (i === array.footprint - 1 || planePartition[i + 1][j] !== Infinity)
				{
					let h = (hueIndex % n) / n;
					
					let rgb = this.wilson.utils.hsvToRgb(h, 1, 1);
					
					rects.push([i, j, true, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
					
					hueIndex++;
				}
				
				j++;
			}
			
			rects.forEach(rect =>
			{
				this.drawBoundaryRect(array, rect[0], rect[1], rect[2], `${rect[3]} 1)`);
			});
			
			
			
			await changeOpacity(this.wilsonNumbers.canvas, 1, this.animationTime / 3);
			
			this.wilsonNumbers.ctx.fillStyle = "rgb(255, 255, 255)";
			
			resolve(rects);
		});
	}
	
	
	
	drawNQuotient(index, n, m, rects)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			//Fade out the ones we don't care about.
			
			let dummy = {t: 1};
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 0,
					duration: this.animationTime,
					easing: "easeOutQuad",
					
					complete: () => 
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							let opacity = index % n === m ? 1 : 0;
							
							this.drawBoundaryRect(array, rect[0], rect[1], rect[2], `${rect[3]} ${opacity})`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							let opacity = index % n === m ? 1 : dummy.t;
							
							this.drawBoundaryRect(array, rect[0], rect[1], rect[2], `${rect[3]} ${opacity})`);
						});
					}
				});
			});
			
			
			
			//Collapse the remaining ones. This assumes that the first and last rectangles are part of the endless border.
			rects = rects.filter((rect, index) => index % n === m);
			
			//If we start from the bottom-left, the only difficult thing to do is figure out the correct starting column. Thankfully, that's easy: it's just the number of vertical edges total.
			
			let numVerticalEdges = rects.filter(rect => !rect[2]).length;
			
			let targetRects = new Array(rects.length);
			
			let row = numVerticalEdges - 1;
			let col = 0;
			
			rects.forEach((rect, index) =>
			{
				targetRects[index] = [row, col];
				
				if (rect[2])
				{
					col++;
				}
				
				else
				{
					row--;
				}
			});
			
			
			
			dummy.t = 0;
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 1,
					duration: this.animationTime,
					easing: "easeInOutQuad",
					
					complete: () =>
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, targetRects[index][0], targetRects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, (1 - dummy.t) * rect[0] + dummy.t * targetRects[index][0], (1 - dummy.t) * rect[1] + dummy.t * targetRects[index][1], rect[2], `${rect[3]} 1)`);
						});
					}
				});
			});
			
			
			
			//We'll start the next animation without waiting for it so that it plays concurrently: any asymptotes where there should no longer be any need to be removed.
			
			let cubesToDelete = [];
			
			targetRects.forEach((rect, index) =>
			{
				if (!rects[index][2])
				{
					for (let j = rect[1]; j < array.footprint; j++)
					{
						if (array.numbers[rect[0]][j] === Infinity)
						{
							for (let k = 0; k < this.infiniteHeight; k++)
							{
								cubesToDelete.push([rect[0], j, k]);
							}
						}
					}
				}
			});
			
			this.deleteCubes(array, cubesToDelete, true);
			
			
			
			//Now we'll go through and add more edges to make the whole thing look nicer.
			let bonusRects = [];
			
			for (let i = array.footprint - 1; i > targetRects[0][0]; i--)
			{
				bonusRects.push([i, 0, false]);
			}
			
			for (let j = targetRects[targetRects.length - 1][1]; j < array.footprint; j++)
			{
				bonusRects.push([-1, j, true]);
			}
			
			dummy.t = 0;
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 1,
					duration: this.animationTime / 2,
					easing: "easeInQuad",
					
					complete: () =>
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, targetRects[index][0], targetRects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						bonusRects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, rect[0], rect[1], rect[2], `${rects[0][3]} 1)`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilsonNumbers.ctx.clearRect(0, 0, this.wilsonNumbers.canvasWidth, this.wilsonNumbers.canvasHeight);
						
						rects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, targetRects[index][0], targetRects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						bonusRects.forEach((rect, index) =>
						{
							this.drawBoundaryRect(array, rect[0], rect[1], rect[2], `${rects[0][3]} ${dummy.t})`);
						});
					}
				});
			});
			
			
			this.wilsonNumbers.ctx.fillStyle = "rgb(255, 255, 255)";
			
			resolve();
		});
	}
	
	
	
	drawBoundaryRect(array, i, j, horizontal, rgba)
	{
		let top = (this.totalArrayFootprint - array.footprint - 1) / 2;
		let left = array.partialFootprintSum - array.footprint;
		
		this.wilsonNumbers.ctx.fillStyle = rgba;
		
		if (horizontal)
		{
			this.wilsonNumbers.ctx.fillRect(this.wilsonNumbers.canvasWidth * (j + left + 1) / (this.totalArrayFootprint + 1), this.wilsonNumbers.canvasHeight * (i + top + 1 + 15/16) / (this.totalArrayFootprint + 1) + 1, this.wilsonNumbers.canvasWidth / (this.totalArrayFootprint + 1), this.wilsonNumbers.canvasHeight * (1/16) / (this.totalArrayFootprint + 1));
		}
		
		else
		{
			this.wilsonNumbers.ctx.fillRect(this.wilsonNumbers.canvasWidth * (j + left + 15/16) / (this.totalArrayFootprint + 1), this.wilsonNumbers.canvasHeight * (i + top + 1) / (this.totalArrayFootprint + 1) + 1, this.wilsonNumbers.canvasWidth * (1/16) / (this.totalArrayFootprint + 1), this.wilsonNumbers.canvasHeight / (this.totalArrayFootprint + 1));
		}
	}
	}