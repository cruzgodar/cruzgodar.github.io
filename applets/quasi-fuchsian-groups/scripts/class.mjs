import { Applet } from "/scripts/src/applets.mjs";
import { aspectRatio } from "/scripts/src/layout.mjs";
import { addTemporaryWorker, loadScript } from "/scripts/src/main.mjs";
import { Wilson } from "/scripts/wilson.mjs";

export class QuasiFuchsianGroups extends Applet
{
	loadPromise = null;
	
	wilsonHidden = null;
	
	resolutionSmall = 400;
	resolutionLarge = 1200;
	
	imageSize = this.resolutionSmall;
	imageWidth = this.resolutionSmall;
	imageHeight = this.resolutionSmall;
	
	boxSize = 4;
	
	webWorker = null;
	
	lastTimestamp = -1;
	
	t = [[2, 0], [2, 0]];
	
	coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [], []];
	
	drawAnotherFrame = false;
	needToRestart = true;
	
	maxDepth = 200;
	maxPixelBrightness = 50;

	x = 0;
	y = 0;
	
	brightness = null;
	image = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		
		
		const fragShaderTrim = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//remove isolated pixels.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					texture2D(uTexture, center + vec2(textureStep, 0.0)).z +
					texture2D(uTexture, center - vec2(textureStep, 0.0)).z +
					texture2D(uTexture, center + vec2(0.0, textureStep)).z +
					texture2D(uTexture, center - vec2(0.0, textureStep)).z +
					texture2D(uTexture, center + vec2(textureStep, textureStep)).z +
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).z +
					texture2D(uTexture, center + vec2(-textureStep, textureStep)).z +
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).z;
				
				if (brightness < 0.1)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					
					return;
				}
				
				
				gl_FragColor = vec4(0.0, 0.0, texture2D(uTexture, center).z, 1.0);
			}
		`;
		
		
		
		const fragShaderDilate = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			uniform float textureStep;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					max(max(max(texture2D(uTexture, center + vec2(textureStep, 0.0)).z,
					texture2D(uTexture, center - vec2(textureStep, 0.0)).z),
					max(texture2D(uTexture, center + vec2(0.0, textureStep)).z,
					texture2D(uTexture, center - vec2(0.0, textureStep)).z)),
					
					max(max(texture2D(uTexture, center + vec2(textureStep, textureStep)).z,
					texture2D(uTexture, center + vec2(textureStep, -textureStep)).z),
					max(texture2D(uTexture, center + vec2(-textureStep, textureStep)).z,
					texture2D(uTexture, center + vec2(-textureStep, -textureStep)).z)));
					
				brightness = max(brightness, texture2D(uTexture, center).z);
				
				gl_FragColor = vec4(0.0, 0.0, brightness, 1.0);
			}
		`;
		
		
		
		const fragShaderColor = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D uTexture;
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				vec2 z = 3.0 * uv;
				vec3 color = 1.5 * normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				
				gl_FragColor = vec4(color * texture2D(uTexture, center).z, 1.0);
			}
		`;
		
		
		
		const options =
		{
			renderer: "gpu",
			
			shader: fragShaderTrim,
			
			canvasWidth: this.resolutionSmall,
			canvasHeight: this.resolutionSmall,
			
			worldWidth: 1,
			worldHeight: 4,
			worldCenterX: 2,
			worldCenterY: 0,
			
			
			
			useDraggables: true,
			
			draggablesMousedownCallback: this.onGrabDraggable.bind(this),
			draggablesTouchstartCallback: this.onGrabDraggable.bind(this),
			
			draggablesMousemoveCallback: this.onDragDraggable.bind(this),
			draggablesTouchmoveCallback: this.onDragDraggable.bind(this),
			
			draggablesMouseupCallback: this.onReleaseDraggable.bind(this),
			draggablesTouchendCallback: this.onReleaseDraggable.bind(this),
			
			
			
			useFullscreen: true,
			
			trueFullscreen: true,
		
			useFullscreenButton: true,
			
			enterFullscreenButtonIconPath: "/graphics/general-icons/enter-fullscreen.png",
			exitFullscreenButtonIconPath: "/graphics/general-icons/exit-fullscreen.png",
			
			switchFullscreenCallback: this.changeAspectRatio.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.loadNewShader(fragShaderDilate);
		this.wilson.render.loadNewShader(fragShaderColor);
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.render.initUniforms(["textureStep"], 0);
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
		this.wilson.render.initUniforms(["textureStep"], 1);
		
		
	this.wilson.render.createFramebufferTexturePair();	this.wilson.render.createFramebufferTexturePair(this.wilson.gl.UNSIGNED_BYTE);
		
		this.image = new Float32Array(this.imageWidth * this.imageHeight * 4);
		
		
		
		this.regenerateHueAndBrightness();
		
		
		
		this.loadPromise = new Promise(async(resolve, reject) =>
		{
			await loadScript("/scripts/complex.min.js");
			
			this.initDraggables();
			
			this.changeRecipe(0);
			
			resolve();
		});
	}
	
	
	
	grandmaCoefficients(x1 = this.wilson.draggables.worldCoordinates[0][0], y1 = this.wilson.draggables.worldCoordinates[0][1], x2 = this.wilson.draggables.worldCoordinates[1][0], y2 = this.wilson.draggables.worldCoordinates[1][1])
	{
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		const ta = new Complex(x1, y1);
		const tb = new Complex(x2, y2);
		
		const b = ta.mul(tb);
		
		const c = ta.mul(ta).add(tb.mul(tb));
		
		const discriminant = b.mul(b).sub(c.mul(4));
		
		const tab = discriminant.arg() > 0 ? b.sub(discriminant.sqrt()).div(2) : b.add(discriminant.sqrt()).div(2);
		
		const z0 = tab.sub(2).mul(tb).div(tb.mul(tab).sub(ta.mul(2)).add(tab.mul(new Complex([0, 2]))));
		
		
		
		const c1 = ta.div(2);
		const c2 = ta.mul(tab).sub(tb.mul(2)).add(new Complex([0, 4])).div(tab.mul(2).add(4).mul(z0));
		const c3 = ta.mul(tab).sub(tb.mul(2)).sub(new Complex([0, 4])).mul(z0).div(tab.mul(2).sub(4));
		const c4 = tb.sub(new Complex([0, 2])).div(2);
		const c5 = tb.div(2);
		const c6 = tb.add(new Complex([0, 2])).div(2);
		
		this.coefficients[0][0][0] = c1.re;
		this.coefficients[0][0][1] = c1.im;
		
		this.coefficients[0][1][0] = c2.re;
		this.coefficients[0][1][1] = c2.im;
		
		this.coefficients[0][2][0] = c3.re;
		this.coefficients[0][2][1] = c3.im;
		
		this.coefficients[0][3][0] = c1.re;
		this.coefficients[0][3][1] = c1.im;
		
		this.coefficients[1][0][0] = c4.re;
		this.coefficients[1][0][1] = c4.im;
		
		this.coefficients[1][1][0] = c5.re;
		this.coefficients[1][1][1] = c5.im;
		
		this.coefficients[1][2][0] = c5.re;
		this.coefficients[1][2][1] = c5.im;
		
		this.coefficients[1][3][0] = c6.re;
		this.coefficients[1][3][1] = c6.im;
		
		
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];
			
			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}
	
	
	
	rileyCoefficients(x1 = this.wilson.draggables.worldCoordinates[0][0], y1 = this.wilson.draggables.worldCoordinates[0][1])
	{
		this.coefficients[0][0][0] = 1;
		this.coefficients[0][0][1] = 0;
		
		this.coefficients[0][1][0] = 0;
		this.coefficients[0][1][1] = 0;
		
		this.coefficients[0][2][0] = x1;
		this.coefficients[0][2][1] = y1;
		
		this.coefficients[0][3][0] = 1;
		this.coefficients[0][3][1] = 0;
		
		this.coefficients[1][0][0] = 1;
		this.coefficients[1][0][1] = 0;
		
		this.coefficients[1][1][0] = 2;
		this.coefficients[1][1][1] = 0;
		
		this.coefficients[1][2][0] = 0;
		this.coefficients[1][2][1] = 0;
		
		this.coefficients[1][3][0] = 1;
		this.coefficients[1][3][1] = 0;
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];
			
			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}
	
	
	
	grandmaSpecialCoefficients(x1 = this.wilson.draggables.worldCoordinates[0][0], y1 = this.wilson.draggables.worldCoordinates[0][1], x2 = this.wilson.draggables.worldCoordinates[1][0], y2 = this.wilson.draggables.worldCoordinates[1][1], x3 = this.wilson.draggables.worldCoordinates[2][0], y3 = this.wilson.draggables.worldCoordinates[2][1])
	{
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		const ta = new Complex(x1, y1);
		const tb = new Complex(x2, y2);
		const tab = new Complex(x3, y3);
		const I = new Complex(0, 1);
		const TWO = new Complex(2, 0);
		
		const tc = ta.mul(ta).add(tb.mul(tb)).add(tab.mul(tab)).sub(ta.mul(tb).mul(tab)).sub(2);
		
		const Q = TWO.sub(tc).sqrt();
		
		const mag = tc.add(I.mul(Q).mul(tc.add(2).sqrt())).abs();
		
		const R = tc.add(2).sqrt().mul(mag >= 2 ? 1 : -1);
		
		const z0 = tab.sub(2).mul(tb.add(R)).div(tb.mul(tab).sub(ta.mul(2)).add(I.mul(Q).mul(tab)));
		
		
		
		const c1 = ta.div(2);
		const c2 = ta.mul(tab).sub(tb.mul(2)).add(I.mul(Q).mul(2)).div(z0.mul(tab.mul(2).add(4)));
		const c3 = z0.mul(ta.mul(tab).sub(tb.mul(2)).sub(I.mul(2).mul(Q))).div(tab.mul(2).sub(4));
		
		const c4 = tb.sub(I.mul(Q)).div(2);
		const c5 = tb.mul(tab).sub(ta.mul(2)).add(I.mul(Q).mul(tab)).div(z0.mul(tab.mul(2).add(4)));
		const c6 = tb.mul(tab).sub(ta.mul(2)).sub(I.mul(Q).mul(tab)).mul(z0).div(tab.mul(2).sub(4));
		const c7 = tb.add(I.mul(Q)).div(2);
		
		
		
		this.coefficients[0][0][0] = c1.re;
		this.coefficients[0][0][1] = c1.im;
		
		this.coefficients[0][1][0] = c2.re;
		this.coefficients[0][1][1] = c2.im;
		
		this.coefficients[0][2][0] = c3.re;
		this.coefficients[0][2][1] = c3.im;
		
		this.coefficients[0][3][0] = c1.re;
		this.coefficients[0][3][1] = c1.im;
		
		this.coefficients[1][0][0] = c4.re;
		this.coefficients[1][0][1] = c4.im;
		
		this.coefficients[1][1][0] = c5.re;
		this.coefficients[1][1][1] = c5.im;
		
		this.coefficients[1][2][0] = c6.re;
		this.coefficients[1][2][1] = c6.im;
		
		this.coefficients[1][3][0] = c7.re;
		this.coefficients[1][3][1] = c7.im;
		
		
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];
			
			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}
	
	
	
	bakeCoefficients = this.grandmaCoefficients;
	
	
	
	changeRecipe(index)
	{
		if (index === 0)
		{
			this.bakeCoefficients = this.grandmaCoefficients;
			
			this.wilson.draggables.draggables[1].style.display = "block";
			this.wilson.draggables.draggables[2].style.display = "none";
		}
		
		else if (index === 1)
		{
			this.bakeCoefficients = this.rileyCoefficients;
			
			this.wilson.draggables.draggables[1].style.display = "none";
			this.wilson.draggables.draggables[2].style.display = "none";
		}
		
		else if (index === 2)
		{
			this.bakeCoefficients = this.grandmaSpecialCoefficients;
			
			this.wilson.draggables.draggables[1].style.display = "block";
			this.wilson.draggables.draggables[2].style.display = "block";
		}
	}
	
	
	
	drawFrame(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;
		
		this.lastTimestamp = timestamp;
		
		if (timeElapsed === 0)
		{
			return;
		}
		
		
		
		this.bakeCoefficients();
		
		for (let i = 0; i < 4; i++)
		{
			this.searchStep(0, 0, i, -1, -1, 1);
		}
		
		
		
		let maxBrightness = 0;
		
		for (let i = 0; i < this.brightness.length; i++)
		{
			maxBrightness = Math.max(maxBrightness, this.brightness[i]);
		}
		
		
		
		for (let i = 0; i < this.imageHeight; i++)
		{
			for (let j = 0; j < this.imageWidth; j++)
			{
				const index = i * this.imageWidth + j;
				
				this.image[4 * index] = 0;
				this.image[4 * index + 1] = 1;
				this.image[4 * index + 2] = Math.pow(this.brightness[index] / maxBrightness, .15);
				this.image[4 * index + 3] = 1;
			}
		}
		
		
		
		this.renderShaderStack();
	}
	
	
	
	renderShaderStack()
	{
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.imageWidth, this.imageHeight, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, this.image);
		
		this.wilson.render.drawFrame();
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
			
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		
		
		
		//Dilate the image.
		
		const numDilations = this.imageSize >= 1000 ? 1 : 0;
		
		for (let i = 0; i < numDilations; i++)
		{
			const pixelData = this.wilson.render.getPixelData();
			
			this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.imageWidth, this.imageHeight, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, pixelData);
			
			this.wilson.render.drawFrame();
		}
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[2]);
			
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		
		const pixelData = this.wilson.render.getPixelData();
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.imageWidth, this.imageHeight, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, pixelData);
		
		this.wilson.render.drawFrame();
	}
	
	
	
	searchStep(startX, startY, lastTransformationIndex, lastRow, lastCol, depth)
	{
		if (depth === this.maxDepth)
		{
			return;
		}
		
		for (let i = 3; i < 6; i++)
		{
			this.x = startX;
			this.y = startY;
			
			const transformationIndex = (lastTransformationIndex + i) % 4;
			
			this.applyTransformation(transformationIndex);
			
			
			
			const row = (this.imageWidth >= this.imageHeight) ? Math.floor((-this.y + this.boxSize / 2) / this.boxSize * this.imageHeight) : Math.floor((-this.y * (this.imageWidth / this.imageHeight) + this.boxSize / 2) / this.boxSize * this.imageHeight);
			
			const col = (this.imageWidth >= this.imageHeight) ? Math.floor((this.x / (this.imageWidth / this.imageHeight) + this.boxSize / 2) / this.boxSize * this.imageWidth) : Math.floor((this.x + this.boxSize / 2) / this.boxSize * this.imageWidth);
			
			
			
			if (row >= 0 && row < this.imageHeight && col >= 0 && col < this.imageWidth)
			{
				if (this.brightness[this.imageWidth * row + col] === this.maxPixelBrightness)
				{
					continue;
				}
				
				if (depth > 10 || this.imageSize !== this.resolutionSmall)
				{
					this.brightness[this.imageWidth * row + col]++;
				}
			}
			
			
			
			this.searchStep(this.x, this.y, transformationIndex, row, col, depth + 1);
		}
	}
	
	
	
	applyTransformation(index)
	{
		const ax = this.coefficients[index][0][0];
		const ay = this.coefficients[index][0][1];
		const bx = this.coefficients[index][1][0];
		const by = this.coefficients[index][1][1];
		const cx = this.coefficients[index][2][0];
		const cy = this.coefficients[index][2][1];
		const dx = this.coefficients[index][3][0];
		const dy = this.coefficients[index][3][1];
		
		
		
		const numX = ax*this.x - ay*this.y + bx;
		const numY = ax*this.y + ay*this.x + by;
		
		const denX = cx*this.x - cy*this.y + dx;
		const denY = cx*this.y + cy*this.x + dy;
		
		const newX = numX*denX + numY*denY;
		const newY = numY*denX - numX*denY;
		
		const magnitude = denX*denX + denY*denY;
		
		this.x = newX / magnitude;
		this.y = newY / magnitude;
	}
	
	
	
	initDraggables()
	{
		this.wilson.draggables.add(2, 0);
		this.wilson.draggables.add(2, 0);
		this.wilson.draggables.add(2, -2);
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	onGrabDraggable(activeDraggable, x, y, event)
	{
		this.imageSize = this.resolutionSmall;
		
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}
			
			else
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}
		}
		
		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}
		
		
		
		this.maxDepth = 200;
		this.maxPixelBrightness = 50;
		
		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);
		
		this.regenerateHueAndBrightness();
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	onReleaseDraggable(activeDraggable, x, y, event)
	{
		this.imageSize = this.resolutionLarge;
		
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}
			
			else
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}
		}
		
		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}
		
		
		
		this.maxDepth = 200;
		this.maxPixelBrightness = 50;
		
		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);
		
		this.regenerateHueAndBrightness();
		
		
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	onDragDraggable(activeDraggable, x, y, event)
	{
		for (let i = 0; i < this.imageHeight; i++)
		{
			for (let j = 0; j < this.imageWidth; j++)
			{
				this.brightness[this.imageWidth * i + j] = 0;
			}
		}
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	
	
	
	requestHighResFrame(imageSize, maxDepth, maxPixelBrightness, boxSize = this.boxSize)
	{
		return new Promise((resolve, reject) =>
		{
			this.imageSize = imageSize;
			this.maxDepth = maxDepth;
			this.maxPixelBrightness = maxPixelBrightness;
			this.boxSize = boxSize;
			
			
			
			if (this.wilson.fullscreen.currentlyFullscreen)
			{
				if (aspectRatio >= 1)
				{
					this.imageWidth = Math.floor(this.imageSize * aspectRatio);
					this.imageHeight = this.imageSize;
				}
				
				else
				{
					this.imageWidth = this.imageSize;
					this.imageHeight = Math.floor(this.imageSize / aspectRatio);
				}
			}
			
			else
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = this.imageSize;
			}
			
			
			
			this.regenerateHueAndBrightness();
			
			
			
			this.webWorker = addTemporaryWorker("/applets/quasi-fuchsian-groups/scripts/worker.js");
			
			
			
			this.webWorker.onmessage = e =>
			{
				this.brightness = e.data[0];
				
				this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);
				
				for (let i = 0; i < this.imageHeight; i++)
				{
					for (let j = 0; j < this.imageWidth; j++)
					{
						const index = i * this.imageWidth + j;
						
						this.image[4 * index] = 0;
						this.image[4 * index + 1] = 0;
						this.image[4 * index + 2] = this.brightness[index];
						this.image[4 * index + 3] = 0;
					}
				}
				
				this.renderShaderStack();
				
				resolve();
			};
			
			this.webWorker.postMessage([this.imageWidth, this.imageHeight, this.maxDepth, this.maxPixelBrightness, this.boxSize, this.coefficients]);
		});
	}
	
	
	
	regenerateHueAndBrightness()
	{
		this.brightness = new Float32Array(this.imageWidth * this.imageHeight);
		this.image = new Float32Array(this.imageWidth * this.imageHeight * 4);
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["textureStep"][0], 1 / this.imageSize);
		
		this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[1]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["textureStep"][1], 1 / this.imageSize);
		
		for (let i = 0; i < this.imageHeight; i++)
		{
			for (let j = 0; j < this.imageWidth; j++)
			{
				this.brightness[this.imageWidth * i + j] = 0;
			}
		}
	}
	
	
	
	changeAspectRatio()
	{
		this.imageSize = this.resolutionSmall;
		
		if (this.wilson.fullscreen.currentlyFullscreen)
		{
			if (aspectRatio >= 1)
			{
				this.imageWidth = Math.floor(this.imageSize * aspectRatio);
				this.imageHeight = this.imageSize;
			}
			
			else
			{
				this.imageWidth = this.imageSize;
				this.imageHeight = Math.floor(this.imageSize / aspectRatio);
			}
		}
		
		else
		{
			this.imageWidth = this.imageSize;
			this.imageHeight = this.imageSize;
		}
		
		
		
		this.wilson.changeCanvasSize(this.imageWidth, this.imageHeight);
		
		this.regenerateHueAndBrightness();
		
		window.requestAnimationFrame(this.drawFrame.bind(this));
	}
	}