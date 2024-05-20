import { addTemporaryListener } from "../src/main.js";
import { Applet } from "./applet.js";

export class AnimationFrameApplet extends Applet
{
	needNewFrame = true;
	animationPaused = false;

	constructor(canvas)
	{
		super(canvas);
	}

	// When an applet needs to draw potentially every frame, it registers these two functions.
	// The first is called every frame and can be used to determine if a new frame is needed,
	// while the second is the actual Wilson call to render the frame. This makes it easier
	// to not needlessly draw frames and also harder to forget to check for animationPaused.

	prepareFrame() {}
	drawFrame() {}

	lastTimestamp = -1;

	drawFrameLoop(timestamp)
	{
		const timeElapsed = timestamp - this.lastTimestamp;

		if (this.lastTimestamp === -1)
		{
			this.lastTimestamp = timestamp;
			requestAnimationFrame(this.drawFrameLoopBound);
			return;
		}

		this.lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}

		this.prepareFrame(timeElapsed);

		if (this.needNewFrame)
		{
			this.needNewFrame = false;
			this.drawFrame(timeElapsed);
		}

		if (!this.animationPaused)
		{
			requestAnimationFrame(this.drawFrameLoopBound);
		}
	}

	drawFrameLoopBound = this.drawFrameLoop.bind(this);

	pause()
	{
		this.animationPaused = true;
	}

	resume()
	{
		this.animationPaused = false;
		this.needNewFrame = true;

		requestAnimationFrame(this.drawFrameLoopBound);
	}

	pauseWhenOffscreen()
	{
		const onScroll = () =>
		{
			const rect = this.canvas.getBoundingClientRect();
			const top = rect.top;
			const height = rect.height;

			if (top >= -height && top < window.innerHeight)
			{
				this.resume();
			}

			else
			{
				this.pause();
			}
		};

		addTemporaryListener({
			object: window,
			event: "scroll",
			callback: onScroll
		});

		onScroll();
	}
}