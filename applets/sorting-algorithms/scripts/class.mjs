import { Applet } from "/scripts/src/applets.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class SortingAlgorithm extends Applet
{
	resolution = 2000;
	
	dataLength = null;
	data = [];
	brightness = [];
	maxBrightness = 40;
	
	currentGenerator = null;
	
	minFrequency = 30;
	maxFrequency = 600;
	
	doPlaySound = true;
	
	lastTimestamp = -1;
	timeElapsed = 0;
	
	algorithms =
	{
		"bubble": this.bubbleSort,
		"insertion": this.insertionSort,
		"selection": this.selectionSort,
		"heap": this.heapsort,
		"merge": this.mergeSort,
		"quick": this.quicksort,
		"shell": this.shellsort,
		"cycle": this.cycleSort,
		"msd-radix": this.msdRadixSort,
		"lsd-radix": this.lsdRadixSort,
		"gravity": this.gravitySort
	};
	
	generators = [this.shuffleArray, null, this.verifyArray];
	currentGeneratorIndex = 0;
	
	numReads = 0;
	numWrites = 0;
	inFrameOperations = 0;
	operationsPerFrame = 1;
	updateReadsAndWrites = false;

	numReadsElement = null;
	numWritesElement= null;
	
	changingSound = false;
	
	audioNodes = [];
	

	
	constructor(canvas, numReadsElement, numWritesElement)
	{
		super(canvas);
		
		this.numReadsElement = numReadsElement;
		this.numWritesElement = numWritesElement;
		
		const fragShaderSource = `
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
		
		const options =
		{
			renderer: "gpu",
			
			shader: fragShaderSource,
			
			canvasWidth: this.resolution,
			canvasHeight: this.resolution,
			
			
			
			useFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.initUniforms(["dataLength"]);
		
		
		
		const texture = this.wilson.gl.createTexture();
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, texture);
		
		this.wilson.gl.texParameteri(this.wilson.gl.TEXTURE_2D, this.wilson.gl.TEXTURE_MAG_FILTER, this.wilson.gl.NEAREST);
		this.wilson.gl.texParameteri(this.wilson.gl.TEXTURE_2D, this.wilson.gl.TEXTURE_MIN_FILTER, this.wilson.gl.NEAREST);
		
		this.wilson.gl.texParameteri(this.wilson.gl.TEXTURE_2D, this.wilson.gl.TEXTURE_WRAP_S, this.wilson.gl.CLAMP_TO_EDGE);
		this.wilson.gl.texParameteri(this.wilson.gl.TEXTURE_2D, this.wilson.gl.TEXTURE_WRAP_T, this.wilson.gl.CLAMP_TO_EDGE);
		
		this.wilson.gl.disable(this.wilson.gl.DEPTH_TEST);
	}
	
	
	
	run(resolution, algorithm, dataLength, doPlaySound)
	{
		this.resolution = resolution;

		this.generators = [this.shuffleArray.bind(this), this.algorithms[algorithm].bind(this), this.verifyArray.bind(this)];
		this.currentGeneratorIndex = 0;

		const oldDataLength = this.dataLength;
		this.dataLength = dataLength;

		this.doPlaySound = doPlaySound;



		try {this.audioNodes[this.currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, this.audioNodes[this.currentGeneratorIndex][0].currentTime + this.timeElapsed / 1000);}
		catch(ex) {}

		this.wilson.changeCanvasSize(this.resolution, this.resolution);


		
		if (this.dataLength !== oldDataLength)
		{
			this.data = new Array(this.dataLength);
			this.brightness = new Array(this.dataLength);
			
			for (let i = 0; i < this.dataLength; i++)
			{
				this.data[i] = i;
				this.brightness[i] = 0;
			}
			
			this.wilson.gl.uniform1f(this.wilson.uniforms["dataLength"], this.dataLength);
		}	
		
		
		
		this.numReads = 0;
		this.numWrites = 0;
		this.inFrameOperations = 0;
		
		this.updateReadsAndWrites = false;
		
		try
		{
			this.numReadsElement.textContent = "0";
			this.numWritesElement.textContent = "0";
		}

		catch(ex) {}
		
		

		this.audioNodes = [];
		this.createAudioNodes();
		
		if (this.doPlaySound)
		{
			this.audioNodes[this.currentGeneratorIndex][1].start(0);
		}
		
		this.currentGenerator = this.generators[0]();
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	drawFrame(timestamp)
	{
		this.timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (this.timeElapsed === 0)
		{
			return;
		}
		
		
		
		const textureData = new Uint8Array(this.dataLength * 4);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			textureData[4 * i] = Math.floor(this.data[i] / 256);
			textureData[4 * i + 1] = this.data[i] % 256;
			
			textureData[4 * i + 2] = Math.floor(this.brightness[i] / this.maxBrightness * 256);
		}
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.dataLength, 1, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, textureData);
		
		this.wilson.render.drawFrame();
		
		this.decreaseBrightness();
		
		if (this.updateReadsAndWrites)
		{
			try
			{
				this.numReadsElement.textContent = this.numReads;
				this.numWritesElement.textContent = this.numWrites;
			}

			catch(ex) {}
		}
		
		if (!this.changingSound)
		{
			this.currentGenerator.next();
		}
		
		
		
		if (this.animationPaused)
		{
			try {this.audioNodes[this.currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, this.audioNodes[this.currentGeneratorIndex][0].currentTime + this.timeElapsed / 1000);}
			catch(ex) {}
		}
		
		else
		{
			window.requestAnimationFrame(this.drawFrame.bind(this));
		}
	}
	
	
	
	createAudioNodes()
	{
		if (this.doPlaySound)
		{
			for (let i = 0; i < this.generators.length; i++)
			{
				const audioContext = new AudioContext();
				
				const audioOscillator = audioContext.createOscillator();
				
				audioOscillator.type = "sine";
				
				audioOscillator.frequency.value = 50;
				
				const audioGainNode = audioContext.createGain();
				
				audioOscillator.connect(audioGainNode);
				
				audioGainNode.connect(audioContext.destination);
				
				
				
				this.audioNodes.push([audioContext, audioOscillator, audioGainNode]);
			}
		}
	}
	
	readFromPosition()
	{
		this.numReads++;
	}
	
	writeToPosition(index, highlight = true, sound = true)
	{
		if (highlight)
		{
			this.brightness[index] = this.maxBrightness - 1;
		}	
		
		this.numWrites++;
		
		this.inFrameOperations++;
		
		if (this.inFrameOperations >= this.operationsPerFrame)
		{
			this.inFrameOperations = 0;
			
			if (sound)
			{
				this.playSound(index);
			}	
				
			return true;
		}
		
		return false;
	}
	
	playSound(index)
	{
		if (this.doPlaySound)
		{
			this.audioNodes[this.currentGeneratorIndex][1].frequency.linearRampToValueAtTime((this.maxFrequency - this.minFrequency) * this.data[index] / this.dataLength + this.minFrequency, this.audioNodes[this.currentGeneratorIndex][0].currentTime + this.timeElapsed / 1000);
		}
	}
	
	decreaseBrightness()
	{
		for (let i = 0; i < this.dataLength; i++)
		{
			this.brightness[i] = Math.max(this.brightness[i] - 1, 0);
		}
	}
	
	advanceGenerator()
	{
		this.changingSound = true;
		
		if (this.doPlaySound)
		{
			this.audioNodes[this.currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, this.audioNodes[this.currentGeneratorIndex][0].currentTime + this.timeElapsed / 1000);
		}
		
		this.currentGeneratorIndex++;
		
		if (this.currentGeneratorIndex < this.generators.length)
		{
			setTimeout(() =>
			{
				if (this.doPlaySound)
				{
					this.audioNodes[this.currentGeneratorIndex][1].start(0);
				}
				
				this.currentGenerator = this.generators[this.currentGeneratorIndex]();
				
				this.changingSound = false;
			}, 1000);
		}
	}
	
	
	
	* shuffleArray()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength / 60);
		
		for (let i = 0; i < this.dataLength - 1; i++)
		{
			let j = Math.floor(Math.random() * (this.dataLength - i - 1)) + i;
			
			let temp = this.data[i];
			this.data[i] = this.data[j];
			this.data[j] = temp;
			
			if (this.writeToPosition(i)) {yield}
			if (this.writeToPosition(j)) {yield}
		}
		
		this.numReads = 0;
		this.numWrites = 0;
		
		this.updateReadsAndWrites = true;
		
		this.advanceGenerator();
	}
	
	
	
	* verifyArray()
	{
		this.updateReadsAndWrites = false;
		
		this.operationsPerFrame = Math.ceil(this.dataLength / 60);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			//This isn't actually a write, but we want to animate the process.
			if (this.writeToPosition(i)) {yield}
			
			if (i !== this.dataLength - 1 && this.data[i] > this.data[i + 1])
			{
				console.log("Not sorted!", this.data);
			}
		}
		
		if (this.doPlaySound)
		{
			this.audioNodes[this.currentGeneratorIndex][2].gain.linearRampToValueAtTime(.0001, this.audioNodes[this.currentGeneratorIndex][0].currentTime + this.timeElapsed / 1000);
		}
	}
	
	
	
	* bubbleSort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength * this.dataLength / 2500);
		
		while (true)
		{
			let done = true;
			
			for (let i = 0; i < this.dataLength - 1; i++)
			{
				this.readFromPosition(i);
				this.readFromPosition(i + 1);
				
				if (this.data[i] > this.data[i + 1])
				{
					done = false;
					
					let temp = this.data[i];
					this.data[i] = this.data[i + 1];
					this.data[i + 1] = temp;
					
					if (this.writeToPosition(i)) {yield}
					if (this.writeToPosition(i + 1)) {yield}
				}
			}
			
			if (done)
			{
				break;
			}
		}
		
		this.advanceGenerator();
	}
	
	
	
	* insertionSort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength * this.dataLength / 5000);
		
		for (let i = 1; i < this.dataLength; i++)
		{
			this.readFromPosition(i);
			this.readFromPosition(i - 1);
			
			if (this.data[i] < this.data[i - 1])
			{
				for (let j = 0; j < i; j++)
				{
					this.readFromPosition(j);
					this.readFromPosition(i);
					
					if (this.data[j] > this.data[i])
					{
						let temp = this.data[i];
						
						for (let k = i; k > j; k--)
						{
							this.data[k] = this.data[k - 1];
							
							if (this.writeToPosition(k)) {yield}
						}
						
						this.data[j] = temp;
						
						if (this.writeToPosition(j)) {yield}
					}
				}
			}
		}
		
		this.advanceGenerator();
	}
	
	
	
	* selectionSort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength / 1000);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			let minIndex = -1;
			let minElement = this.dataLength;
			
			for (let j = i; j < this.dataLength; j++)
			{
				this.readFromPosition(j);
				this.readFromPosition(minElement);
				
				if (this.data[j] < minElement)
				{
					minElement = this.data[j];
					minIndex = j;
				}
			}
			
			let temp = this.data[i];
			this.data[i] = minElement;
			this.data[minIndex] = temp;
			
			if (this.writeToPosition(i)) {yield}
			if (this.writeToPosition(minIndex)) {yield}
		}
		
		this.advanceGenerator();
	}
	
	
	
	* heapsort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength * Math.log(this.dataLength) / 500);
		
		//Build the heap.
		for (let i = 1; i < this.dataLength; i++)
		{
			let index = i;
			let index2 = 0;
			
			while (index !== 0)
			{
				index2 = Math.floor((index - 1) / 2);
				
				this.readFromPosition(index);
				this.readFromPosition(index2);
				
				if (this.data[index] > this.data[index2])
				{
					let temp = this.data[index];
					this.data[index] = this.data[index2];
					this.data[index2] = temp;
					
					if (this.writeToPosition(index)) {yield}
					if (this.writeToPosition(index2)) {yield}
					
					index = index2;
				}
				
				else
				{
					break;
				}
			}
		}
		
		//Disassemble the heap.
		for (let i = this.dataLength - 1; i >= 0; i--)
		{
			let temp = this.data[0];
			this.data[0] = this.data[i];
			this.data[i] = temp;
			
			if (this.writeToPosition(0)) {yield}
			if (this.writeToPosition(i)) {yield}
			
			
			
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
					this.readFromPosition(child1);
					this.readFromPosition(child2);
					
					maxChild = this.data[child1] > this.data[child2] ? child1 : child2;
				}
				
				
				
				this.readFromPosition(index);
				this.readFromPosition(maxChild);
				
				if (this.data[index] < this.data[maxChild])
				{
					let temp = this.data[index];
					this.data[index] = this.data[maxChild];
					this.data[maxChild] = temp;
					
					if (this.writeToPosition(index)) {yield}
					if (this.writeToPosition(maxChild)) {yield}
					
					index = maxChild;
				}
				
				else
				{
					break;
				}
			}
		}
		
		this.advanceGenerator();
	}
	
	
	
	* mergeSort(start = 0, end = this.dataLength)
	{
		if (end - start === 2)
		{
			this.readFromPosition(start);
			this.readFromPosition(end - 1);
			
			if (this.data[start] > this.data[end - 1])
			{
				if (this.writeToPosition(start)) {yield}
				if (this.writeToPosition(end - 1)) {yield}
				
				const temp = this.data[start];
				this.data[start] = this.data[end - 1];
				this.data[end - 1] = temp;
			}
			
			return;
		}	
		
		if (end - start <= 1)
		{
			return;
		}
		
		this.operationsPerFrame = Math.ceil(this.dataLength * Math.log(this.dataLength) / 200);
		
		
		
		//First recursively sort the last half.
		
		let rightHalfStart = start + Math.floor((end - start) / 2);
		yield* this.mergeSort(rightHalfStart, end);
		
		while (true)
		{
			if (rightHalfStart === start + 1)
			{
				//Insertion sort the single element up.
				
				let i = start;
				
				while (i < end - 1 && this.data[i] > this.data[i + 1])
				{
					this.readFromPosition(i);
					this.readFromPosition(i + 1);
					
					if (this.writeToPosition(i)) {yield}
					if (this.writeToPosition(i + 1)) {yield}
					
					const temp = this.data[i];
					this.data[i] = this.data[i + 1];
					this.data[i + 1] = temp;
					
					i++;
				}
				
				break;
			}
			
			//Sort the first quarter.
			const bufferStart = start + Math.floor((rightHalfStart - start) / 2);
			yield* this.mergeSort(start, bufferStart);
			
			//Now merge those together by using the middle area as a buffer.
			
			let left = start;
			let buffer = bufferStart;
			let right = rightHalfStart;
			
			while (true)
			{
				if (buffer === right)
				{
					break;
				}
				
				//Compare the current elements of the left and right sorted parts.
				if (buffer !== left && (right === end || this.data[left] < this.data[right]))
				{
					this.readFromPosition(left);
					this.readFromPosition(buffer);
					
					if (this.writeToPosition(left)) {yield}
					if (this.writeToPosition(buffer)) {yield}
					
					const temp = this.data[left];
					this.data[left] = this.data[buffer];
					this.data[buffer] = temp;
					
					left++;
					buffer++;
				}
				
				else if (right < end && this.data[right] <= this.data[left])
				{
					this.readFromPosition(right);
					this.readFromPosition(buffer);
					
					if (this.writeToPosition(right)) {yield}
					if (this.writeToPosition(buffer)) {yield}
					
					const temp = this.data[right];
					this.data[right] = this.data[buffer];
					this.data[buffer] = temp;
					
					right++;
					buffer++;
				}
				
				else
				{
					break;
				}
			}
			
			
			
			//Now increase the amount marked as sorted.
			rightHalfStart = start + (rightHalfStart - bufferStart);
			
			
			
			//The last place to move needs to be insertion sorted to the correct place.
			
			let i = buffer - 1;
			
			while (i > rightHalfStart && this.data[i - 1] > this.data[i])
			{
				this.readFromPosition(i);
				this.readFromPosition(i - 1);
				
				if (this.writeToPosition(i)) {yield}
				if (this.writeToPosition(i - 1)) {yield}
				
				const temp = this.data[i];
				this.data[i] = this.data[i - 1];
				this.data[i - 1] = temp;
				
				i--;
			}
			
			while (i < end - 1 && this.data[i + 1] < this.data[i])
			{
				this.readFromPosition(i);
				this.readFromPosition(i + 1);
				
				if (this.writeToPosition(i)) {yield}
				if (this.writeToPosition(i + 1)) {yield}
				
				const temp = this.data[i];
				this.data[i] = this.data[i + 1];
				this.data[i + 1] = temp;
				
				i++;
			}
			
			
			
			if (rightHalfStart === start)
			{
				break;
			}
		}
		
		if (start === 0 && end === this.dataLength)
		{
			this.advanceGenerator();
		}
	}
	
	
	
	* quicksort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength * Math.log(this.dataLength) / 2250);
		
		let currentEndpoints = new Array(this.dataLength);
		currentEndpoints[0] = 0;
		currentEndpoints[1] = this.dataLength - 1;
		
		let nextEndpoints = new Array(this.dataLength);
		
		let numBlocks = 1;
		let nextNumBlocks = 0;
		
		
		
		while (numBlocks > 0)
		{
			for (let i = 0; i < numBlocks; i++)
			{
				//For each block, pick the middle element as the pivot.
				let pivot = this.data[Math.floor((currentEndpoints[2 * i] + currentEndpoints[2 * i + 1]) / 2)];
				this.readFromPosition(Math.floor((currentEndpoints[2 * i] + currentEndpoints[2 * i + 1]) / 2));
				
				//Now we need to split the block so that everything before the pivot is less than it and everything after is greater.
				let leftIndex = currentEndpoints[2 * i] - 1;
				let rightIndex = currentEndpoints[2 * i + 1] + 1;
				
				while (true)
				{
					do
					{
						leftIndex++;
						this.readFromPosition(leftIndex);
					} while (this.data[leftIndex] < pivot)
					
					this.readFromPosition(leftIndex);
					
					do
					{
						rightIndex--;
						this.readFromPosition(rightIndex);
					} while (this.data[rightIndex] > pivot)
					
					this.readFromPosition(rightIndex);
					
					if (leftIndex >= rightIndex)
					{
						break;
					}
					
					let temp = this.data[leftIndex];
					this.data[leftIndex] = this.data[rightIndex];
					this.data[rightIndex] = temp;
					
					if (this.writeToPosition(leftIndex)) {yield}
					if (this.writeToPosition(rightIndex)) {yield}
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
		
		this.advanceGenerator();
	}
	
	
	
	* shellsort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength / 100);
		
		let gaps = [];
		
		const gamma = 2.2436091;
		
		let k = 1;
		
		while (true)
		{
			const entry = Math.ceil((Math.pow(gamma, k) - 1) / (gamma - 1));
			
			if (entry >= this.dataLength)
			{
				break;
			}
			
			gaps.unshift(entry);
			
			k++;
		}
		
		for (let i = 0; i < gaps.length; i++)
		{
			const gap = gaps[i];
			
			for (let j = gap; j < this.dataLength; j++)
			{
				const temp = this.data[j];
				
				this.readFromPosition(j);
				
				let k = j;
				
				for (; k >= gap && this.data[k - gap] > temp; k -= gap)
				{
					this.data[k] = this.data[k - gap];
					
					if (this.writeToPosition(k)) {yield}
				}
				
				this.data[k] = temp;
				
				if (this.writeToPosition(k)) {yield}
			}
		}
		
		this.advanceGenerator();
	}
	
	
	
	* cycleSort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength / 2000);
		
		let done = new Array(this.dataLength);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			done[i] = false;
		}
		
		for (let i = 0; i < this.dataLength; i++)
		{
			if (done[i])
			{
				continue;
			}
			
			this.readFromPosition(i);
			
			let poppedEntry = this.data[i];
			let firstPoppedEntry = poppedEntry;
			let index = 0;
			
			do
			{
				//Figure out where this index should go.
				index = 0;
				
				for (let j = 0; j < this.dataLength; j++)
				{
					this.readFromPosition(j);
					
					if (this.data[j] < poppedEntry)
					{
						index++;
					}
				}
				
				if (poppedEntry > firstPoppedEntry)
				{
					index--;
				}
				
				let temp = this.data[index];
				this.data[index] = poppedEntry;
				poppedEntry = temp;
				
				if (this.writeToPosition(index)) {yield}
				
				done[index] = true;
			} while (index !== i)
		}	
		
		this.advanceGenerator();
	}
	
	
	
	* msdRadixSort()
	{
		let maxKeyLength = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			this.readFromPosition(i);
			
			let keyLength = Math.log(this.data[i]) * denom;
			
			maxKeyLength = Math.max(maxKeyLength, keyLength);
		}
		
		maxKeyLength = Math.round(maxKeyLength);
		
		
		
		this.operationsPerFrame = Math.ceil(this.dataLength * maxKeyLength / 650);
		
		
		
		let currentEndpoints = new Array(this.dataLength);
		currentEndpoints[0] = 0;
		currentEndpoints[1] = this.dataLength - 1;
		
		let nextEndpoints = new Array(this.dataLength);
		
		let numBlocks = 1;
		let nextNumBlocks = 0;
		
		let auxArray = new Array(this.dataLength);
		
		
		
		let div = Math.pow(2, maxKeyLength - 1);
		
		for (let keyPos = 0; keyPos < maxKeyLength; keyPos++)
		{
			for (let i = 0; i < numBlocks; i++)
			{
				let index0 = currentEndpoints[2 * i];
				let index1 = currentEndpoints[2 * i + 1];
				
				for (let j = currentEndpoints[2 * i]; j <= currentEndpoints[2 * i + 1]; j++)
				{
					this.readFromPosition(j);
					
					let digit = Math.floor(this.data[j] / div) % 2;
					
					if (digit === 0)
					{
						auxArray[index0] = this.data[j];
						
						if (this.writeToPosition(index0)) {yield}
						
						index0++;
					}
					
					else
					{
						auxArray[index1] = this.data[j];
						
						if (this.writeToPosition(index1)) {yield}
						
						index1--;
					}
				}
				
				for (let j = currentEndpoints[2 * i]; j <= currentEndpoints[2 * i + 1]; j++)
				{
					this.data[j] = auxArray[j];
					
					if (this.writeToPosition(j)) {yield}
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
		
		
		
		this.advanceGenerator();
	}
	
	
	
	* lsdRadixSort()
	{
		let maxKeyLength = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			this.readFromPosition(i);
			
			let keyLength = Math.log(this.data[i]) * denom;
			
			maxKeyLength = Math.max(maxKeyLength, keyLength);
		}
		
		maxKeyLength = Math.round(maxKeyLength);
		
		
		
		this.operationsPerFrame = Math.ceil(this.dataLength * maxKeyLength / 650);
		
		
		
		let auxArray = new Array(this.dataLength);
		
		
		
		let div = 1;
		
		for (let keyPos = 0; keyPos < maxKeyLength; keyPos++)
		{
			let index0 = 0;
			let index1 = this.dataLength - 1;
			
			for (let j = 0; j < this.dataLength; j++)
			{
				this.readFromPosition(j);
				
				let digit = Math.floor(this.data[j] / div) % 2;
				
				if (digit === 0)
				{
					auxArray[index0] = this.data[j];
					
					if (this.writeToPosition(index0)) {yield}
					
					index0++;
				}
				
				else
				{
					auxArray[index1] = this.data[j];
					
					if (this.writeToPosition(index1)) {yield}
					
					index1--;
				}
			}
			
			index0--;
			index1++;
			
			for (let j = 0; j <= index0; j++)
			{
				this.data[j] = auxArray[j];
				
				if (this.writeToPosition(j)) {yield}
			}
			
			//We need to take care to reverse the top half of auxArray.
			for (let j = 0; j < this.dataLength - index1; j++)
			{
				this.data[index1 + j] = auxArray[this.dataLength - 1 - j];
				
				if (this.writeToPosition(index1 + j)) {yield}
			}
			
			div *= 2;
		}
		
		
		
		this.advanceGenerator();
	}
	
	
	
	* gravitySort()
	{
		this.operationsPerFrame = Math.ceil(this.dataLength * this.dataLength / 1000000);
		
		let beads = new Array(this.dataLength);
		
		for (let i = 0; i < this.dataLength; i++)
		{
			beads[i] = new Array(this.dataLength);
			
			for (let j = 0; j < this.dataLength; j++)
			{
				beads[i][j] = false;
			}
		}
		
		let maxIndex = 0;
		let maxEntry = 0;
		
		for (let i = 0; i < this.dataLength; i++)
		{
			this.readFromPosition(i);
			
			let size = this.data[i];
			
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
		
		for (let j = 0; j < this.dataLength; j++)
		{
			for (let i = this.dataLength - 1; i >= 0; i--)
			{
				if (beads[i][j])
				{	
					let targetRow = i;
					
					do
					{
						targetRow++;
					} while (targetRow < this.dataLength && !beads[targetRow][j])
					
					targetRow--;
					
					beads[i][j] = false;
					beads[targetRow][j] = true;
					
					this.data[i]--;
					this.data[targetRow]++;
					
					this.writeToPosition(i, false, false);
					this.writeToPosition(targetRow, false, false);
				}
			}
			
			if (this.writeToPosition(maxIndex, false, true)) {yield}
			
			this.numWrites--;
			this.inFrameOperations--;
		}
		
		this.advanceGenerator();
	}
}