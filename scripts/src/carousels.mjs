import anime from "../anime.js";
import { carouselFillAnimationTime, carouselSwitchAnimationTime } from "./animation.mjs";
import { $$, addTemporaryListener } from "./main.mjs";

const dotSize = 8;
const expandedDotWidth = 128;

class Carousel
{
	element;
	children;
	dots;
	activeChild = -1;
	currentFillAnimation;
	permanentlyPaused = false;



	constructor(element)
	{
		this.element = element;
		this.children = element.firstElementChild.children;
		this.dots = Array.from(element.lastElementChild.children);

		this.dots.forEach((dot, index) =>
		{
			dot.addEventListener("click", () =>
			{
				if (index !== this.activeChild)
				{
					this.permanentlyPaused = true;
					this.advance(index);
				}
			});
		});



		this.element.addEventListener("mouseenter", () =>
		{
			if (this.currentFillAnimation && !this.permanentlyPaused)
			{
				this.currentFillAnimation.pause();
			}
		});

		this.element.addEventListener("mouseleave", () =>
		{
			if (this.currentFillAnimation && !this.permanentlyPaused)
			{
				this.currentFillAnimation.play();
			}
		});



		const onScroll = () =>
		{
			if (!this.currentFillAnimation || this.permanentlyPaused)
			{
				return;
			}

			const rect = this.element.getBoundingClientRect();
			const top = rect.top;
			const height = rect.height;

			if (top >= -height && top < window.innerHeight)
			{
				this.currentFillAnimation.play();
			}

			else
			{
				this.currentFillAnimation.pause();
			}
		};

		addTemporaryListener({
			object: window,
			event: "scroll",
			callback: onScroll
		});

		onScroll();



		this.advance(0);
	}

	async advance(newActiveChild = (this.activeChild + 1) % this.children.length)
	{
		if (this.currentFillAnimation)
		{
			this.currentFillAnimation.pause();
		}

		const lastActiveChild = this.activeChild;

		this.dots[newActiveChild].classList.add("active");

		const oldDotTop = this.dots[0].getBoundingClientRect().top;

		await new Promise(resolve => setTimeout(resolve, 10));



		const oldDot = this.activeChild !== -1 ? this.dots[this.activeChild] : undefined;

		const oldDotPromises = oldDot
			? [
				anime({
					targets: oldDot,
					width: dotSize,
					duration: carouselSwitchAnimationTime,
					easing: "easeInOutQuad",
				}).finished,

				anime({
					targets: oldDot.firstElementChild,
					opacity: 0,
					duration: carouselSwitchAnimationTime,
					easing: "easeInOutQuad",
				}).finished,

				anime({
					targets: this.children[this.activeChild],
					opacity: 0,
					duration: carouselSwitchAnimationTime,
					easing: "easeInQuad",
				}).finished
			]
			: [];
		


		this.activeChild = newActiveChild;

		const newDot = this.dots[newActiveChild];

		if (this.permanentlyPaused)
		{
			newDot.firstElementChild.style.width = `${expandedDotWidth / 5 + 4}px`;
		}

		const newDotPromises = [
			anime({
				targets: newDot,
				width: this.permanentlyPaused ? expandedDotWidth / 5 : expandedDotWidth,
				duration: carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished,

			anime({
				targets: newDot.firstElementChild,
				opacity: 1,
				duration: this.permanentlyPaused ? 0 : carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished,
		];



		await Promise.all(oldDotPromises.concat(newDotPromises));

		if (oldDot)
		{
			oldDot.firstElementChild.style.width = `${dotSize + 4}px`;

			this.children[lastActiveChild].style.display = "none";
			this.dots[lastActiveChild].classList.remove("active");
		}

		this.children[newActiveChild].style.display = "block";



		if (!this.permanentlyPaused)
		{
			this.currentFillAnimation = anime({
				targets: newDot.firstElementChild,
				width: expandedDotWidth + 4,
				duration: carouselFillAnimationTime,
				easing: "linear",
				endDelay: carouselSwitchAnimationTime
			});

			window.dispatchEvent(new Event("scroll"));

			await Promise.all([
				this.currentFillAnimation.finished,

				anime({
					targets: this.children[this.activeChild],
					opacity: 1,
					duration: carouselSwitchAnimationTime,
					easing: "easeInOutQuad",
				}).finished
			]);

			this.advance();
		}

		else
		{
			const newDotTop = this.dots[0].getBoundingClientRect().top;
			
			window.scrollBy(0, newDotTop - oldDotTop);

			await anime({
				targets: this.children[this.activeChild],
				opacity: 1,
				duration: carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished;
		}
	}
}

export function setUpCarousels()
{
	$$(".carousel").forEach(element => new Carousel(element));
}