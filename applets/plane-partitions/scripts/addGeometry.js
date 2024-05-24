import * as THREE from "/scripts/three.js";

export function addCube(array, x, y, z, h = 0, s = 0, v = this.cubeLightness)
{
	const materials = [
		new THREE.MeshStandardMaterial({
			map: this.cubeTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.cubeTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.cubeTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.cubeTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.cubeTexture2,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.cubeTexture2,
			transparent: true,
			opacity: 0
		})
	];

	materials.forEach(material => material.color.setHSL(h, s, v));

	const cube = new THREE.Mesh(this.cubeGeometry, materials);

	array.cubeGroup.add(cube);

	if (this.abConfigMode)
	{
		cube.position.set(x, y, z);
	}

	else
	{
		cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
	}

	return cube;
}



export function addFloor(array, x, z, h = 0, s = 0, v = this.floorLightness)
{
	const materials = [
		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		})
	];

	materials.forEach(material => material.color.setHSL(h, s, v));

	const floor = new THREE.Mesh(this.floorGeometry, materials);

	array.cubeGroup.add(floor);

	// This aligns the thing correctly.
	if (this.abConfigMode)
	{
		floor.position.set(x, -.5 - .0005, z);
	}

	else
	{
		floor.position.set(
			x - (array.footprint - 1) / 2,
			-.5 - .0005,
			z - (array.footprint - 1) / 2
		);
	}

	return floor;
}



export function addLeftWall(array, y, z, h = 0, s = 0, v = this.floorLightness)
{
	const materials = [
		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		})
	];

	materials.forEach(material => material.color.setHSL(h, s, v));

	const wall = new THREE.Mesh(this.wallLeftGeometry, materials);

	array.cubeGroup.add(wall);

	// This aligns the thing correctly.
	if (this.abConfigMode)
	{
		wall.position.set(-.5 - .0005, y, z);
	}

	else
	{
		wall.position.set(
			-.5 - .0005 - (array.footprint - 1) / 2,
			y,
			z - (array.footprint - 1) / 2
		);
	}

	return wall;
}



export function addRightWall(array, x, y, h = 0, s = 0, v = this.floorLightness)
{
	const materials = [
		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		}),

		new THREE.MeshStandardMaterial({
			map: this.floorTexture2,
			transparent: true,
			opacity: 0
		})
	];

	materials.forEach(material => material.color.setHSL(h, s, v));

	const wall = new THREE.Mesh(this.wallRightGeometry, materials);

	array.cubeGroup.add(wall);

	// This aligns the thing correctly.
	if (this.abConfigMode)
	{
		wall.position.set(x, y, -.5 - .0005);
	}

	else
	{
		wall.position.set(
			x - (array.footprint - 1) / 2,
			y,
			-.5 - .0005 - (array.footprint - 1) / 2
		);
	}

	return wall;
}