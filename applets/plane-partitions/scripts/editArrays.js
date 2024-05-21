import anime from "/scripts/anime.js";
import { changeOpacity } from "/scripts/src/animation.js";
import * as THREE from "/scripts/three.js";

export async function addNewArray(
	index,
	numbers,
	keepNumbersCanvasVisible = false,
	horizontalLegs = true
) {
	if (this.currentlyAnimatingCamera)
	{
		return;
	}

	this.currentlyAnimatingCamera = true;

	let updatingCamera = false;



	const array = {
		numbers,
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
		await changeOpacity({
			element: this.wilsonNumbers.canvas,
			opacity: 0,
			duration: this.animationTime / 5
		});
	}



	this.arrays.splice(index, 0, array);

	array.footprint = array.numbers.length;

	// Update the other arrays.
	for (let i = index; i < this.arrays.length; i++)
	{
		this.arrays[i].partialFootprintSum = this.arrays[i].footprint;

		if (i !== 0)
		{
			this.arrays[i].centerOffset = this.arrays[i - 1].centerOffset
				+ this.arrays[i - 1].footprint / 2
				+ this.arrays[i].footprint / 2 + 1;

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
					x: this.addWalls ? 0 : this.arrays[i].centerOffset,
					y: 0,
					z: this.addWalls ? 0 : -this.arrays[i].centerOffset,
					duration: this.animationTime,
					easing: "easeInOutQuad"
				});
			}
		}
	}



	array.cubeGroup = new THREE.Object3D();
	this.scene.add(array.cubeGroup);

	if (this.addWalls)
	{
		// Quick hack to make PT objects render properly.
		array.cubeGroup.position.set(0, 0, 0);
	}

	else
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
					const legHeight = Math.max(
						array.numbers[i][array.footprint - 1],
						array.numbers[array.footprint - 1][j]
					);

					for (let k = 0; k < legHeight; k++)
					{
						array.cubes[i][j][k] = this.addCube(
							array,
							j,
							k,
							i,
							0,
							0,
							this.asymptoteLightness
						);
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
					array.cubes[i][j][k] = this.addCube(
						array,
						j,
						k,
						i,
						0,
						0,
						this.asymptoteLightness
					);
				}
			}
		}
	}



	// Add walls. Disabled by default.
	if (this.addWalls)
	{
		array.leftWall = new Array(this.wallWidth);
		array.rightWall = new Array(this.wallWidth);

		for (let i = 0; i < this.wallWidth; i++)
		{
			array.leftWall[i] = new Array(this.wallHeight);
			array.rightWall[i] = new Array(this.wallHeight);
		}

		for (let i = 0; i < this.wallWidth; i++)
		{
			for (let j = 0; j < this.wallHeight; j++)
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
		this.hexViewCameraPos = [
			this.totalArraySize,
			this.totalArraySize + this.totalArrayHeight / 3,
			this.totalArraySize
		];

		this._2dViewCameraPos = [0, this.totalArraySize + 10, 0];

		if (this.in2dView && !keepNumbersCanvasVisible && !this.addWalls)
		{
			this.updateCameraHeight(true);
			updatingCamera = true;
		}

		else
		{
			this.orthographicCamera.left = -this.totalArraySize;
			this.orthographicCamera.right = this.totalArraySize;
			this.orthographicCamera.top = this.totalArraySize;
			this.orthographicCamera.bottom = -this.totalArraySize;

			this.orthographicCamera.position.set(
				this.hexViewCameraPos[0],
				this.hexViewCameraPos[1],
				this.hexViewCameraPos[2]
			);

			this.orthographicCamera.rotation.set(-0.785398163, 0.615479709, 0.523598775);
			this.orthographicCamera.updateProjectionMatrix();
		}
	}

	else if (!this.addWalls && !keepNumbersCanvasVisible)
	{
		this.updateCameraHeight(true);
		updatingCamera = true;
	}



	if (index !== this.arrays.length - 1)
	{
		await new Promise(resolve => setTimeout(resolve, this.animationTime));
	}



	const thingsToAnimate = [];

	array.cubeGroup.traverse(node =>
	{
		if (node.material)
		{
			node.material.forEach(material => thingsToAnimate.push(material));
		}
	});

	await anime({
		targets: thingsToAnimate,
		opacity: 1,
		duration: this.animationTime / 2,
		easing: "easeOutQuad",
	}).finished;



	if (this.in2dView && !keepNumbersCanvasVisible)
	{
		this.drawAll2dViewText();
	}

	if (!updatingCamera)
	{
		this.currentlyAnimatingCamera = false;
	}

	return array;
}

export async function editArray(index, numbers)
{
	if (this.currentlyAnimatingCamera)
	{
		return;
	}

	if (index >= this.arrays.length || index < 0)
	{
		this.displayError(`No array at index ${index}`);

		return;
	}

	await this.removeArray(index);

	await this.addNewArray(index, numbers);

	this.currentlyAnimatingCamera = false;

	if (!this.in2dView)
	{
		this.updateCameraHeight();
	}
}


// Resizes the array into the minimum possible square.
export async function trimArray(index)
{
	if (this.currentlyAnimating)
	{
		return;
	}



	if (index >= this.arrays.length || index < 0)
	{
		this.displayError(`No array at index ${index}`);

		return;
	}

	const array = this.arrays[index];

	const numbers = array.numbers;



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



	const newNumbers = new Array(minSize);

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
}



export async function removeArray(index, keepNumbersCanvasVisible = false)
{
	if (this.currentlyAnimatingCamera)
	{
		return;
	}

	this.currentlyAnimatingCamera = true;



	if (index >= this.arrays.length || index < 0)
	{
		this.displayError(`No array at index ${index}`);

		return;
	}



	if (this.in2dView && !keepNumbersCanvasVisible)
	{
		await changeOpacity({
			element: this.wilsonNumbers.canvas,
			opacity: 0,
			duration: this.animationTime / 5
		});
	}



	const thingsToAnimate = [];

	this.arrays[index].cubeGroup.traverse(node =>
	{
		if (node.material)
		{
			node.material.forEach(material => thingsToAnimate.push(material));
		}
	});

	await anime({
		targets: thingsToAnimate,
		opacity: 0,
		duration: this.animationTime / 2,
		easing: "easeOutQuad",
	}).finished;



	// Dispose of all the materials.
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
						this.arrays[index].cubes[i][j][k].material
							.forEach(material => material.dispose());
					}
				}
			}
		}
	}

	this.scene.remove(this.arrays[index].cubeGroup);

	this.totalArrayFootprint -= this.arrays[index].footprint + 1;

	this.arrays.splice(index, 1);



	// Update the other arrays.
	for (let i = index; i < this.arrays.length; i++)
	{
		this.arrays[i].partialFootprintSum = this.arrays[i].footprint;

		if (i !== 0)
		{
			this.arrays[i].centerOffset = this.arrays[i - 1].centerOffset
				+ this.arrays[i - 1].footprint / 2
					+ this.arrays[i].footprint / 2 + 1;

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
				x: this.addWalls ? 0 : this.arrays[i].centerOffset,
				y: 0,
				z: this.addWalls ? 0 : -this.arrays[i].centerOffset,
				duration: this.animationTime,
				easing: "easeInOutQuad"
			});
		}
	}



	this.currentlyAnimatingCamera = false;

	if (this.arrays.length !== 0 && !keepNumbersCanvasVisible)
	{
		this.updateCameraHeight(true);
	}
}