import anime from "../anime.js";
import { carouselFillAnimationTime, carouselSwitchAnimationTime } from "./animation.mjs";
import { $$ } from "./main.mjs";

const dotSize = 8;
const expandedDotWidth = 128;

class Carousel
{
	element;
	children;
	dots;
	activeChild = -1;
	currentFillAnimation;


	constructor(element)
	{
		this.element = element;
		this.children = element.firstElementChild.children;
		this.dots = element.lastElementChild.children;

		this.advance();
	}

	async advance(
		newActiveNode = (this.activeChild + 1) % this.children.length,
		lastActiveNode = newActiveNode - 1
	)
	{
		if (this.currentFillAnimation)
		{
			this.currentFillAnimation.pause();
		}
		
		this.children[(this.activeChild + 1) % this.children.length].style.display = "block";

		await new Promise(resolve => setTimeout(resolve, 10));

		const oldDot = this.activeChild !== -1 ? this.dots[this.activeChild] : undefined;

		const oldDotPromises = oldDot
			? [
				anime({
					targets: oldDot,
					width: 8,
					duration: carouselSwitchAnimationTime,
					easing: "easeInOutQuad",
				}).finished,

				anime({
					targets: oldDot.firstElementChild,
					opacity: 0,
					duration: carouselSwitchAnimationTime,
					easing: "easeInOutQuad",
				}).finished,
			]
			: [];
		
		this.activeChild = (this.activeChild + 1) % this.children.length;

		const newDot = this.dots[this.activeChild];

		const newDotPromises = [
			anime({
				targets: newDot,
				width: expandedDotWidth,
				duration: carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished,

			anime({
				targets: newDot.firstElementChild,
				opacity: 1,
				duration: carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished,

			anime({
				targets: this.children[this.activeChild],
				opacity: 1,
				duration: carouselSwitchAnimationTime,
				easing: "easeInOutQuad",
			}).finished
		];

		await Promise.all(oldDotPromises.concat(newDotPromises));

		if (oldDot)
		{
			oldDot.firstElementChild.style.width = `${dotSize + 1}px`;
		}

		this.currentFillAnimation = anime({
			targets: newDot.firstElementChild,
			width: expandedDotWidth + 1,
			duration: carouselFillAnimationTime,
			easing: "linear",
			endDelay: carouselSwitchAnimationTime
		});

		await this.currentFillAnimation.finished;

		await anime({
			targets: this.children[this.activeChild],
			opacity: 0,
			duration: carouselSwitchAnimationTime,
			easing: "easeInQuad",
		}).finished;

		this.children[this.activeChild].style.display = "none";

		this.advance();
	}
}

export function setUpCarousels()
{
	$$(".carousel").forEach(element =>
	{
		const carousel = new Carousel(element);

		//setInterval(() => carousel.advance(), 1000);
	});
}