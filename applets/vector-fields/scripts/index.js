!function()
{
	"use strict";
	
	
	
	let resolution = 500;
	
	let num_particles = 0;
	let max_particles = 2000;
	
	let dt = .005;
	
	//Average lifetime in frames -- actual values are .5 to 1.5x this.
	let lifetime = 240;
	
	//A full array representing the grid -- we need this to do trails.
	let grid = [];
	
	//A long array of particles of the form [x, y, remaining lifetime].
	let particles = [];
	
	let free_particle_slots = [];
	
	let paused = false;
	
	let image_data = null;
	
	let starting_process_id = Site.applet_process_id;
	
	let x_function = (x, y) => -Math.sin(y);
	let y_function = (x, y) => Math.sin(x);
	
	
	
	const options =
	{
		renderer: "hybrid",
		
		canvas_width: resolution,
		canvas_height: resolution,
		
		world_width: 15,
		world_height: 15,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		
		use_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	const wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	const max_particles_input_element = Page.element.querySelector("#max-particles-input");
	
	const speed_input_element = Page.element.querySelector("#speed-input");
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", generate_new_field);
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-vector-field.png");
	});
	
	
	
	function generate_new_field()
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		num_particles = 0;
		max_particles = parseInt(max_particles_input_element.value || 2000);
		
		dt = parseFloat(speed_input_element.value || .005);
		
		wilson.change_canvas_size(resolution, resolution);
		
		
		
		particles = new Array(max_particles);
		free_particle_slots = new Array(max_particles);
		
		for (let i = 0; i < max_particles; i++)
		{
			particles[i] = [0, 0];
			free_particle_slots[i] = i;
		}
		
		
		
		grid = new Array(resolution);
		
		for (let i = 0; i < resolution; i++)
		{
			grid[i] = new Array(resolution);
			
			for (let j = 0; j < resolution; j++)
			{
				//Lifetime, hue
				grid[i][j] = [0, 0];
			}
		}
		
		
		
		image_data = new Uint8ClampedArray(resolution * resolution * 4);
		
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				image_data[4 * (resolution * i + j) + 3] = 255;
			}
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	let last_timestamp = -1;
	
	function draw_frame(timestamp)
	{
		const time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		//If there's not enough particles, we add half of what's missing, capped at 1% of the total particle count.
		if (num_particles < max_particles)
		{
			//We find the first open slot we can and search from the end of the list so that we can slice more efficiently.
			const num_to_add = Math.floor(Math.min(max_particles / 100, (max_particles - num_particles) / 2));
			
			for (let i = free_particle_slots.length - num_to_add; i < free_particle_slots.length; i++)
			{
				create_particle(free_particle_slots[i]);
			}
			
			free_particle_slots.splice(free_particle_slots.length - num_to_add, num_to_add);
		}
		
		
		
		//Draw all the particles, lower their lifetimes, and update them according to the vector field.
		for (let i = 0; i < particles.length; i++)
		{
			const canvas_coordinates = wilson.utils.interpolate.world_to_canvas(particles[i][0], particles[i][1]);
			
			if (canvas_coordinates[0] >= 0 && canvas_coordinates[0] < resolution && canvas_coordinates[1] >= 0 && canvas_coordinates[1] < resolution)
			{
				const dx = dt * x_function(particles[i][0], particles[i][1]);
				const dy = dt * y_function(particles[i][0], particles[i][1]);
				
				grid[canvas_coordinates[0]][canvas_coordinates[1]][0] = lifetime;
				grid[canvas_coordinates[0]][canvas_coordinates[1]][1] = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
				
				particles[i][0] += dx;
				particles[i][1] += dy;
				
				particles[i][2]--;
				
				if (particles[i][2] <= 0)
				{
					destroy_particle(i);
				}
			}
			
			else
			{
				destroy_particle(i);
				continue;
			}
		}
		
		
		
		//Deal with the image data.
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				if (grid[i][j][0])
				{
					const rgb = HSVtoRGB(grid[i][j][1], 1, grid[i][j][0] / lifetime);
					
					image_data[4 * (resolution * i + j) + 0] = rgb[0];
					image_data[4 * (resolution * i + j) + 1] = rgb[1];
					image_data[4 * (resolution * i + j) + 2] = rgb[2];
					
					grid[i][j][0]--;
				}
				
				else
				{
					image_data[4 * (resolution * i + j) + 0] = 0;
					image_data[4 * (resolution * i + j) + 1] = 0;
					image_data[4 * (resolution * i + j) + 2] = 0;
				}
			}
		}
		
		
		
		wilson.render.draw_frame(image_data);
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		if (!paused)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function create_particle(index)
	{
		particles[index][0] = wilson.world_center_x + wilson.world_width * (Math.random() - .5);
		
		particles[index][1] = wilson.world_center_y + wilson.world_height * (Math.random() - .5);
		
		particles[index][2] = Math.floor(lifetime * (Math.random() + .5));
		
		num_particles++;
	}
	
	function destroy_particle(index)
	{
		//Set the lifetime to 0 if it wasn't already.
		particles[index][2] = 0;
		
		free_particle_slots.push(index);
		
		num_particles--;
	}
	
	
	
	
	
	Page.show();
	
	
	
	function HSVtoRGB(h, s, v)
	{
		let r, g, b, i, f, p, q, t;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		
		switch (i % 6)
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
	    
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
}()