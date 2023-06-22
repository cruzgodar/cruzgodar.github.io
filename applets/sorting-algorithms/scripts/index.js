!function()
{
	"use strict";
	
	
	
	let resolution = 2000;
	
	let dataLength = null;
	let data = [];
	let brightness = [];
	let maxBrightness = 40;
	
	let currentGenerator = null;
	
	let minFrequency = 20;
	let maxFrequency = 600;
	
	let doPlaySound = true;
	
	let lastTimestamp = -1;
	let timeElapsed = 0;
	
	let startingProcessId = null;
	
	let algorithms =
	{
		"bubble": bubbleSort,
		"insertion": insertionSort,
		"selection": selectionSort,
		"heap": heapsort,
		"merge": mergeSort,
		"quick": quicksort,
		"cycle": cycleSort,
		"msd-radix": msdRadixSort,
		"lsd-radix": lsdRadixSort,
		"gravity": gravitySort
	};
	
	let generators = [shuffleArray, null, verifyArray];
	let currentGeneratorIndex = 0;
	
	let numReads = 0;
	let numWrites = 0;
	let inFrameOperations = 0;
	let operationsPerFrame = 1;
	let updateReadsAndWrites = false;
	
	let changingSound = false;
	
	let audioNodes = [];
	
	
	
	let fragShaderSource = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float dataLength;
		
		const float circleSize = .8;
		
		uniform sampler2D uTexture;
		
		
		
		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		
		
		void main(void)
		{
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			if (length(uv) <= circleSize)
			{
				float sample = mod(atan(uv.y, uv.x) / 6.283, 1.0);
				
				vec4 output1 = texture2D(uTexture, vec2(floor(sample * dataLength) / dataLength, .5));
				vec4 output2 = texture2D(uTexture, vec2(mod(floor(sample * dataLength + 1.0) / dataLength, 1.0), .5));
				
				float brightness = mix(output1.z, output2.z, fract(sample * dataLength));
				
				float h1 = (output1.x * 256.0 + output1.y) / dataLength * 255.0;
				float h2 = (output2.x * 256.0 + output2.y) / dataLength * 255.0;
				
				if (abs(h1 - h2) > .5)
				{
					if (h1 > h2)
					{
						h1 -= 1.0;
					}
					
					else
					{
						h2 -= 1.0;
					}
				}
				
				
				
				float h = mix(h1, h2, fract(sample * dataLength));
				
				float s = clamp((length(uv) / circleSize - .03) * (1.0 - brightness), 0.0, 1.0);
				
				float v = clamp((1.0 - length(uv) / circleSize) * 100.0, 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		}
	`;
	
	let options =
	{
		renderer: "gpu",
		
		shader: fragShaderSource,
		
		canvasWidth: 2000,
		canvasHeight: 2000,
		
		
		
		useFullscreen: true,
	
		useFullscreenButton: true,
		
		enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
		exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson($("#output-canvas"), options);
	
	wilson.render.initUniforms(["dataLength"]);
	
	
	
	let texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	
	
	let algorithmSelectorDropdownElement = $("#algorithm-selector-dropdown");
	
	algorithmSelectorDropdownElement.addEventListener("input", () =>
	{
		Page.setElementStyles(".info-text", "opacity", 0);
		
		setTimeout(() =>
		{
			Page.setElementStyles(".info-text", "display", "none");
			
			let element = $(`#${algorithmSelectorDropdownElement.value}-info`);
			
			element.style.display = "block";
			
			setTimeout(() =>
			{
				element.style.opacity = 1;
			}, 10);
		}, Site.opacityAnimationTime);	
	});
	
	
	
	let generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", drawSortingAlgorithm);
	
	
	
	let resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			drawSortingAlgorithm();
		}
	});
	
	
	
	let arraySizeInputElement = $("#array-size-input");
	
	arraySizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			drawSortingAlgorithm();
		}
	});
	
	
	
	let playSoundCheckboxElement = $("#play-sound-checkbox");
	
	playSoundCheckboxElement.checked = true;
	
	let audioContext = null;
	let audioOscillator = null;
	let audioGainNode = null;
	
	
	
	let numReadsElement = $("#num-reads");
	
	let numWritesElement = $("#num-writes");
	
	
	
	let downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		wilson.downloadFrame("an-aztec-diamond.png");
	});
	
	
	
	Page.show();
	
	
	
	function drawSortingAlgorithm()
	{
		try {audioNodes[currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, audioNodes[currentGeneratorIndex][0].currentTime + timeElapsed / 1000);}
		catch(ex) {}
		
		
		
		startingProcessId = Site.appletProcessId;
		
		
		
		resolution = parseInt(resolutionInputElement.value || 2000);
		
		wilson.changeCanvasSize(resolution, resolution);
		
		
		
		let oldDataLength = dataLength;
		dataLength = parseInt(arraySizeInputElement.value || 256);
		
		if (dataLength !== oldDataLength)
		{
			data = new Array(dataLength);
			brightness = new Array(dataLength);
			
			for (let i = 0; i < dataLength; i++)
			{
				data[i] = i;
				brightness[i] = 0;
			}
			
			wilson.gl.uniform1f(wilson.uniforms["dataLength"], dataLength);
		}	
		
		
		
		numReads = 0;
		numWrites = 0;
		inFrameOperations = 0;
		
		updateReadsAndWrites = false;
		
		numReadsElement.textContent = "0";
		numWritesElement.textContent = "0";
		
		
		
		doPlaySound = playSoundCheckboxElement.checked;
		
		
		
		generators = [shuffleArray, algorithms[algorithmSelectorDropdownElement.value], verifyArray];
		currentGeneratorIndex = 0;
		
		audioNodes = [];
		createAudioNodes();
		
		if (doPlaySound)
		{
			audioNodes[currentGeneratorIndex][1].start(0);
		}
		
		currentGenerator = generators[0]();
		
		
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function drawFrame(timestamp)
	{
		timeElapsed = timestamp - lastTimestamp;
		
		lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		let textureData = new Uint8Array(dataLength * 4);
		
		for (let i = 0; i < dataLength; i++)
		{
			textureData[4 * i] = Math.floor(data[i] / 256);
			textureData[4 * i + 1] = data[i] % 256;
			
			textureData[4 * i + 2] = Math.floor(brightness[i] / maxBrightness * 256);
		}
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, dataLength, 1, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, textureData);
		
		wilson.render.drawFrame();
		
		decreaseBrightness();
		
		if (updateReadsAndWrites)
		{
			numReadsElement.textContent = numReads;
			numWritesElement.textContent = numWrites;
		}
		
		if (!changingSound)
		{
			currentGenerator.next();
		}
		
		
		
		if (startingProcessId !== Site.appletProcessId)
		{
			console.log("Terminated applet process");
			
			try {audioNodes[currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, audioNodes[currentGeneratorIndex][0].currentTime + timeElapsed / 1000);}
			catch(ex) {}
			
			return;
		}
		
		window.requestAnimationFrame(drawFrame);
	}
	
	
	
	function createAudioNodes()
	{
		if (doPlaySound)
		{
			for (let i = 0; i < generators.length; i++)
			{
				let audioContext = new AudioContext();
				
				let audioOscillator = audioContext.createOscillator();
				
				audioOscillator.type = "sine";
				
				audioOscillator.frequency.value = 50;
				
				let audioGainNode = audioContext.createGain();
				
				audioOscillator.connect(audioGainNode);
				
				audioGainNode.connect(audioContext.destination);
				
				
				
				audioNodes.push([audioContext, audioOscillator, audioGainNode]);
			}
		}
	}
	
	function readFromPosition(index, highlight = false)
	{
		numReads++;
	}
	
	function writeToPosition(index, highlight = true, sound = true)
	{
		if (highlight)
		{
			brightness[index] = maxBrightness - 1;
		}	
		
		numWrites++;
		
		inFrameOperations++;
		
		if (inFrameOperations >= operationsPerFrame)
		{
			inFrameOperations = 0;
			
			if (sound)
			{
				playSound(index);
			}	
				
			return true;
		}
		
		return false;
	}
	
	function playSound(index)
	{
		if (doPlaySound)
		{
			audioNodes[currentGeneratorIndex][1].frequency.linearRampToValueAtTime((maxFrequency - minFrequency) * data[index] / dataLength + minFrequency, audioNodes[currentGeneratorIndex][0].currentTime + timeElapsed / 1000);
		}
	}
	
	function decreaseBrightness()
	{
		for (let i = 0; i < dataLength; i++)
		{
			brightness[i] = Math.max(brightness[i] - 1, 0);
		}
	}
	
	function advanceGenerator()
	{
		changingSound = true;
		
		if (doPlaySound)
		{
			audioNodes[currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, audioNodes[currentGeneratorIndex][0].currentTime + timeElapsed / 1000);
		}
		
		currentGeneratorIndex++;
		
		if (currentGeneratorIndex < generators.length)
		{
			setTimeout(() =>
			{
				if (doPlaySound)
				{
					audioNodes[currentGeneratorIndex][1].start(0);
				}
				
				currentGenerator = generators[currentGeneratorIndex]();
				
				changingSound = false;
			}, 1000);
		}
	}
	
	
	
	function* shuffleArray()
	{
		operationsPerFrame = Math.ceil(dataLength / 60);
		
		for (let i = 0; i < dataLength - 1; i++)
		{
			let j = Math.floor(Math.random() * (dataLength - i - 1)) + i;
			
			let temp = data[i];
			data[i] = data[j];
			data[j] = temp;
			
			if (writeToPosition(i)) {yield}
			if (writeToPosition(j)) {yield}
		}
		
		numReads = 0;
		numWrites = 0;
		
		updateReadsAndWrites = true;
		
		advanceGenerator();
	}
	
	
	
	function* verifyArray()
	{
		updateReadsAndWrites = false;
		
		operationsPerFrame = Math.ceil(dataLength / 60);
		
		for (let i = 0; i < dataLength; i++)
		{
			//This isn't actually a write, but we want to animate the process.
			if (writeToPosition(i)) {yield}
		}
		
		if (doPlaySound)
		{
			audioNodes[currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, audioNodes[currentGeneratorIndex][0].currentTime + timeElapsed / 1000);
		}
	}
	
	
	
	function* bubbleSort()
	{
		operationsPerFrame = Math.ceil(dataLength * dataLength / 2500);
		
		while (true)
		{
			let done = true;
			
			for (let i = 0; i < dataLength - 1; i++)
			{
				readFromPosition(i);
				readFromPosition(i + 1);
				
				if (data[i] > data[i + 1])
				{
					done = false;
					
					let temp = data[i];
					data[i] = data[i + 1];
					data[i + 1] = temp;
					
					if (writeToPosition(i)) {yield}
					if (writeToPosition(i + 1)) {yield}
				}
			}
			
			if (done)
			{
				break;
			}
		}
		
		advanceGenerator();
	}
	
	
	
	function* insertionSort()
	{
		operationsPerFrame = Math.ceil(dataLength * dataLength / 5000);
		
		for (let i = 1; i < dataLength; i++)
		{
			readFromPosition(i);
			readFromPosition(i - 1);
			
			if (data[i] < data[i - 1])
			{
				for (let j = 0; j < i; j++)
				{
					readFromPosition(j);
					readFromPosition(i);
					
					if (data[j] > data[i])
					{
						let temp = data[i];
						
						for (let k = i; k > j; k--)
						{
							data[k] = data[k - 1];
							
							if (writeToPosition(k)) {yield}
						}
						
						data[j] = temp;
						
						if (writeToPosition(j)) {yield}
					}
				}
			}
		}
		
		advanceGenerator();
	}
	
	
	
	function* selectionSort()
	{
		operationsPerFrame = Math.ceil(dataLength / 1000);
		
		for (let i = 0; i < dataLength; i++)
		{
			let minIndex = -1;
			let minElement = dataLength;
			
			for (let j = i; j < dataLength; j++)
			{
				readFromPosition(j);
				readFromPosition(minElement);
				
				if (data[j] < minElement)
				{
					minElement = data[j];
					minIndex = j;
				}
			}
			
			let temp = data[i];
			data[i] = minElement;
			data[minIndex] = temp;
			
			if (writeToPosition(i)) {yield}
			if (writeToPosition(minIndex)) {yield}
		}
		
		advanceGenerator();
	}
	
	
	
	function* heapsort()
	{
		operationsPerFrame = Math.ceil(dataLength * Math.log(dataLength) / 500);
		
		//Build the heap.
		for (let i = 1; i < dataLength; i++)
		{
			let index = i;
			let index2 = 0;
			
			while (index !== 0)
			{
				index2 = Math.floor((index - 1) / 2);
				
				readFromPosition(index);
				readFromPosition(index2);
				
				if (data[index] > data[index2])
				{
					let temp = data[index];
					data[index] = data[index2];
					data[index2] = temp;
					
					if (writeToPosition(index)) {yield}
					if (writeToPosition(index2)) {yield}
					
					index = index2;
				}
				
				else
				{
					break;
				}
			}
		}
		
		//Disassemble the heap.
		for (let i = dataLength - 1; i >= 0; i--)
		{
			let temp = data[0];
			data[0] = data[i];
			data[i] = temp;
			
			if (writeToPosition(0)) {yield}
			if (writeToPosition(i)) {yield}
			
			
			
			let index = 0;
			
			let child1 = 0;
			let child2 = 0;
			let maxChild = 0;
			
			while (true)
			{
				child1 = 2 * index + 1;
				child2 = child1 + 1;
				
				if (child1 >= i)
				{
					break;
				}
				
				else if (child2 >= i)
				{
					maxChild = child1;
				}
				
				else
				{
					readFromPosition(child1);
					readFromPosition(child2);
					
					maxChild = data[child1] > data[child2] ? child1 : child2;
				}
				
				
				
				readFromPosition(index);
				readFromPosition(maxChild);
				
				if (data[index] < data[maxChild])
				{
					let temp = data[index];
					data[index] = data[maxChild];
					data[maxChild] = temp;
					
					if (writeToPosition(index)) {yield}
					if (writeToPosition(maxChild)) {yield}
					
					index = maxChild;
				}
				
				else
				{
					break;
				}
			}
		}
		
		advanceGenerator();
	}
	
	
	
	function* mergeSort()
	{
		operationsPerFrame = Math.ceil(dataLength * Math.log(dataLength) / 450);
		
		let auxArray = new Array(dataLength);
		
		let blockSize = 1;
		
		while (true)
		{
			//First iterate over blocks.
			for (let i = 0; i < dataLength; i += 2 * blockSize)
			{
				//Within each block, we need to place things in the right order into the auxiliary array.
				let index1 = 0;
				let index2 = blockSize;
				let auxIndex = 0;
				
				while (true)
				{
					if (index2 + i >= dataLength || index2 >= 2*blockSize)
					{
						if (index1 >= blockSize || i + index1 >= dataLength)
						{
							break;
						}
						
						auxArray[auxIndex] = data[i + index1];
						
						if (writeToPosition(i + index1)) {yield}
						
						index1++;
						auxIndex++;
					}
					
					else if (index1 >= blockSize || i + index1 >= dataLength)
					{
						auxArray[auxIndex] = data[i + index2];
						
						if (writeToPosition(i + index2)) {yield}
						
						index2++;
						auxIndex++;
					}
					
					else
					{
						readFromPosition(i + index1);
						readFromPosition(i + index2);
						
						if (data[i + index1] < data[i + index2])
						{
							auxArray[auxIndex] = data[i + index1];
							
							if (writeToPosition(i + index1)) {yield}
							
							index1++;
							auxIndex++;
						}
						
						else
						{
							auxArray[auxIndex] = data[i + index2];
							
							if (writeToPosition(i + index2)) {yield}
							
							index2++;
							auxIndex++;
						}
					}
				}
				
				//Copy the aux array back into the original one.
				for (let j = 0; j < 2 * blockSize; j++)
				{
					if (i + j >= dataLength)
					{
						break;
					}
					
					data[i + j] = auxArray[j];
					
					if (writeToPosition(i + j)) {yield}
				}
			}
			
			blockSize *= 2;
			
			if (blockSize >= dataLength)
			{
				break;
			}
		}
		
		advanceGenerator();
	}
	
	
	
	function* quicksort()
	{
		operationsPerFrame = Math.ceil(dataLength * Math.log(dataLength) / 2250);
		
		let currentEndpoints = new Array(dataLength);
		currentEndpoints[0] = 0;
		currentEndpoints[1] = dataLength - 1;
		
		let nextEndpoints = new Array(dataLength);
		
		let numBlocks = 1;
		let nextNumBlocks = 0;
		
		
		
		while (numBlocks > 0)
		{
			for (let i = 0; i < numBlocks; i++)
			{
				//For each block, pick the middle element as the pivot.
				let pivot = data[Math.floor((currentEndpoints[2 * i] + currentEndpoints[2 * i + 1]) / 2)];
				readFromPosition(Math.floor((currentEndpoints[2 * i] + currentEndpoints[2 * i + 1]) / 2));
				
				//Now we need to split the block so that everything before the pivot is less than it and everything after is greater.
				let leftIndex = currentEndpoints[2 * i] - 1;
				let rightIndex = currentEndpoints[2 * i + 1] + 1;
				
				while (true)
				{
					do
					{
						leftIndex++;
						readFromPosition(leftIndex);
					} while (data[leftIndex] < pivot)
					
					readFromPosition(leftIndex);
					
					do
					{
						rightIndex--;
						readFromPosition(rightIndex);
					} while (data[rightIndex] > pivot)
					
					readFromPosition(rightIndex);
					
					if (leftIndex >= rightIndex)
					{
						break;
					}
					
					let temp = data[leftIndex];
					data[leftIndex] = data[rightIndex];
					data[rightIndex] = temp;
					
					if (writeToPosition(leftIndex)) {yield}
					if (writeToPosition(rightIndex)) {yield}
				}
				
				if (rightIndex > currentEndpoints[2 * i])
				{
					nextEndpoints[2 * nextNumBlocks] = currentEndpoints[2 * i];
					nextEndpoints[2 * nextNumBlocks + 1] = rightIndex;
					
					nextNumBlocks++;
				}
				
				if (currentEndpoints[2 * i + 1] > rightIndex + 1)
				{
					nextEndpoints[2 * nextNumBlocks] = rightIndex + 1;
					nextEndpoints[2 * nextNumBlocks + 1] = currentEndpoints[2 * i + 1];
					
					nextNumBlocks++;
				}
			}
			
			
			
			numBlocks = nextNumBlocks;
			nextNumBlocks = 0;
			
			for (let i = 0; i < 2 * numBlocks; i++)
			{
				currentEndpoints[i] = nextEndpoints[i];
			}
		}
		
		advanceGenerator();
	}
	
	
	
	function* cycleSort()
	{
		operationsPerFrame = Math.ceil(dataLength / 2000);
		
		let done = new Array(dataLength);
		
		for (let i = 0; i < dataLength; i++)
		{
			done[i] = false;
		}
		
		for (let i = 0; i < dataLength; i++)
		{
			if (done[i])
			{
				continue;
			}
			
			readFromPosition(i);
			
			let poppedEntry = data[i];
			let firstPoppedEntry = poppedEntry;
			let index = 0;
			
			do
			{
				//Figure out where this index should go.
				index = 0;
				
				for (let j = 0; j < dataLength; j++)
				{
					readFromPosition(j);
					
					if (data[j] < poppedEntry)
					{
						index++;
					}
				}
				
				if (poppedEntry > firstPoppedEntry)
				{
					index--;
				}
				
				let temp = data[index];
				data[index] = poppedEntry;
				poppedEntry = temp;
				
				if (writeToPosition(index)) {yield}
				
				done[index] = true;
			} while (index !== i)
		}	
		
		advanceGenerator();
	}
	
	
	
	function* msdRadixSort()
	{
		let maxKeyLength = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < dataLength; i++)
		{
			readFromPosition(i);
			
			let keyLength = Math.log(data[i]) * denom;
			
			maxKeyLength = Math.max(maxKeyLength, keyLength);
		}
		
		maxKeyLength = Math.round(maxKeyLength);
		
		
		
		operationsPerFrame = Math.ceil(dataLength * maxKeyLength / 650);
		
		
		
		let currentEndpoints = new Array(dataLength);
		currentEndpoints[0] = 0;
		currentEndpoints[1] = dataLength - 1;
		
		let nextEndpoints = new Array(dataLength);
		
		let numBlocks = 1;
		let nextNumBlocks = 0;
		
		let auxArray = new Array(dataLength);
		
		
		
		let div = Math.pow(2, maxKeyLength - 1);
		
		for (let keyPos = 0; keyPos < maxKeyLength; keyPos++)
		{
			for (let i = 0; i < numBlocks; i++)
			{
				let index0 = currentEndpoints[2 * i];
				let index1 = currentEndpoints[2 * i + 1];
				
				for (let j = currentEndpoints[2 * i]; j <= currentEndpoints[2 * i + 1]; j++)
				{
					readFromPosition(j);
					
					let digit = Math.floor(data[j] / div) % 2;
					
					if (digit === 0)
					{
						auxArray[index0] = data[j];
						
						if (writeToPosition(index0)) {yield}
						
						index0++;
					}
					
					else
					{
						auxArray[index1] = data[j];
						
						if (writeToPosition(index1)) {yield}
						
						index1--;
					}
				}
				
				for (let j = currentEndpoints[2 * i]; j <= currentEndpoints[2 * i + 1]; j++)
				{
					data[j] = auxArray[j];
					
					if (writeToPosition(j)) {yield}
				}
				
				index0--;
				index1++;
				
				if (index0 > currentEndpoints[2 * i])
				{
					nextEndpoints[2 * nextNumBlocks] = currentEndpoints[2 * i];
					nextEndpoints[2 * nextNumBlocks + 1] = index0;
					
					nextNumBlocks++;
				}	
				
				if (currentEndpoints[2 * i + 1] > index1)
				{
					nextEndpoints[2 * nextNumBlocks] = index1;
					nextEndpoints[2 * nextNumBlocks + 1] = currentEndpoints[2 * i + 1];
					
					nextNumBlocks++;
				}			
			}
			
			numBlocks = nextNumBlocks;
			nextNumBlocks = 0;
			
			for (let i = 0; i < 2 * numBlocks; i++)
			{
				currentEndpoints[i] = nextEndpoints[i];
			}
			
			div /= 2;
		}
		
		
		
		advanceGenerator();
	}
	
	
	
	function* lsdRadixSort()
	{
		let maxKeyLength = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < dataLength; i++)
		{
			readFromPosition(i);
			
			let keyLength = Math.log(data[i]) * denom;
			
			maxKeyLength = Math.max(maxKeyLength, keyLength);
		}
		
		maxKeyLength = Math.round(maxKeyLength);
		
		
		
		operationsPerFrame = Math.ceil(dataLength * maxKeyLength / 650);
		
		
		
		let auxArray = new Array(dataLength);
		
		
		
		let div = 1;
		
		for (let keyPos = 0; keyPos < maxKeyLength; keyPos++)
		{
			let index0 = 0;
			let index1 = dataLength - 1;
			
			for (let j = 0; j < dataLength; j++)
			{
				readFromPosition(j);
				
				let digit = Math.floor(data[j] / div) % 2;
				
				if (digit === 0)
				{
					auxArray[index0] = data[j];
					
					if (writeToPosition(index0)) {yield}
					
					index0++;
				}
				
				else
				{
					auxArray[index1] = data[j];
					
					if (writeToPosition(index1)) {yield}
					
					index1--;
				}
			}
			
			index0--;
			index1++;
			
			for (let j = 0; j <= index0; j++)
			{
				data[j] = auxArray[j];
				
				if (writeToPosition(j)) {yield}
			}
			
			//We need to take care to reverse the top half of auxArray.
			for (let j = 0; j < dataLength - index1; j++)
			{
				data[index1 + j] = auxArray[dataLength - 1 - j];
				
				if (writeToPosition(index1 + j)) {yield}
			}
			
			div *= 2;
		}
		
		
		
		advanceGenerator();
	}
	
	
	
	function* gravitySort()
	{
		operationsPerFrame = Math.ceil(dataLength * dataLength / 1000000);
		
		let beads = new Array(dataLength);
		
		for (let i = 0; i < dataLength; i++)
		{
			beads[i] = new Array(dataLength);
			
			for (let j = 0; j < dataLength; j++)
			{
				beads[i][j] = false;
			}
		}
		
		let maxIndex = 0;
		let maxEntry = 0;
		
		for (let i = 0; i < dataLength; i++)
		{
			readFromPosition(i);
			
			let size = data[i];
			
			for (let j = 0; j < size; j++)
			{
				beads[i][j] = true;
			}
			
			if (size - i > maxEntry)
			{
				maxEntry = size - i;
				maxIndex = i;
			}
		}
		
		for (let j = 0; j < dataLength; j++)
		{
			for (let i = dataLength - 1; i >= 0; i--)
			{
				if (beads[i][j])
				{	
					let targetRow = i;
					
					do
					{
						targetRow++;
					} while (targetRow < dataLength && !beads[targetRow][j])
					
					targetRow--;
					
					beads[i][j] = false;
					beads[targetRow][j] = true;
					
					data[i]--;
					data[targetRow]++;
					
					writeToPosition(i, false, false);
					writeToPosition(targetRow, false, false);
				}
			}
			
			if (writeToPosition(maxIndex, false, true)) {yield}
			
			numWrites--;
			inFrameOperations--;
		}
		
		advanceGenerator();
	}
	}()