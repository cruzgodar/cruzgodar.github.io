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
		this.dots = Array.from(element.lastElementChild.children);

		this.dots.forEach((dot, index) =>
		{
			dot.addEventListener("click", () =>
			{
				if (index !== this.activeChild)
				{
					this.advance(index);
				}
			});
		});

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
		];



		await Promise.all(oldDotPromises.concat(newDotPromises));

		if (oldDot)
		{
			oldDot.firstElementChild.style.width = `${dotSize + 1}px`;

			this.children[lastActiveChild].style.display = "none";
			this.dots[lastActiveChild].classList.remove("active");
		}

		this.children[newActiveChild].style.display = "block";



		this.currentFillAnimation = anime({
			targets: newDot.firstElementChild,
			width: expandedDotWidth + 1,
			duration: carouselFillAnimationTime,
			easing: "linear",
			endDelay: carouselSwitchAnimationTime
		});

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



	// async cleanUpThenAdvance()
	// {
	// 	await anime({
	// 		targets: this.children[this.activeChild],
	// 		opacity: 0,
	// 		duration: carouselSwitchAnimationTime,
	// 		easing: "easeInQuad",
	// 	}).finished;

	// 	this.children[this.activeChild].style.display = "none";
	// 	this.dots[this.activeChild].classList.remove("active");

	// 	this.advance(newActiveChild);
	// }
}

export function setUpCarousels()
{
	$$(".carousel").forEach(element =>
	{
		const carousel = new Carousel(element);

		//setInterval(() => carousel.advance(), 1000);
	});
}