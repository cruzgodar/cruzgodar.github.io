!function()
{
	"use strict";
	
	
	
	let small_image_size = 500;
	let large_image_size = 1500;
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: small_image_size,
		canvas_height: small_image_size,
		
		world_width: 1,
		world_height: 4,
		world_center_x: 2,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousedown_callback: on_grab_draggable,
		draggables_touchstart_callback: on_grab_draggable,
		
		draggables_mousemove_callback: on_drag_draggable,
		draggables_touchmove_callback: on_drag_draggable,
		
		draggables_mouseup_callback: on_release_draggable,
		draggables_touchend_callback: on_release_draggable,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let image_size = small_image_size;
	let image_width = small_image_size;
	let image_height = small_image_size;
	
	let box_size = 4;
	
	let web_worker = null;
	
	let last_timestamp = -1;
	
	
	
	let t = [[2, 0], [2, 0]];
	
	
	
	let coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [], []];
	
	
	
	let draw_another_frame = false;
	let need_to_restart = true;
	
	

	let max_depth = 20;
	let max_pixel_brightness = 10;

	let x = 0;
	let y = 0;
	
	
	
	let hue = null;
	let brightness = null;
	let image = null;
	
	regenerate_hue_and_brightness();
	
	
	
	if (!Site.scripts_loaded["complexjs"])
	{
		Site.load_script("/scripts/complex.min.js")
		
		.then(() =>
		{
			Site.scripts_loaded["complexjs"] = true;
			
			init_draggables();
		})
		
		.catch((error) =>
		{
			console.error("Could not load ComplexJS");
		});
	}
	
	else
	{
		init_draggables();
	}
	
	
	
	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		small_image_size = Math.max(parseInt(resolution_input_element.value || 500), 100);
		
		large_image_size = small_image_size * 3;
		
		change_aspect_ratio();
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", request_high_res_frame);
	
	
	
	Page.show();
	
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		let ta = new Complex(wilson.draggables.world_coordinates[0][0], wilson.draggables.world_coordinates[0][1]);
		let tb = new Complex(wilson.draggables.world_coordinates[1][0], wilson.draggables.world_coordinates[1][1]);
		
		let b = new Complex([0, 0]);
		b = ta.mul(tb);
		
		let c = new Complex([0, 0]);
		c = ta.mul(ta).add(tb.mul(tb));
		
		let tab = new Complex([0, 0]);
		
		if (b.mul(b).sub(c.mul(4)).arg() > 0)
		{
			tab = b.sub(b.mul(b).sub(c.mul(4)).sqrt()).div(2);
		}
		
		else
		{
			tab = b.add(b.mul(b).sub(c.mul(4)).sqrt()).div(2);
		}
		
		let z0 = new Complex([0, 0]);
		z0 = tab.sub(2).mul(tb).div(tb.mul(tab).sub(ta.mul(2)).add(tab.mul(new Complex([0, 2]))));
		
		let temp = new Complex([0, 0]);
		
		
		
		temp = ta.div(2);
		
		coefficients[0][0][0] = temp.re;
		coefficients[0][0][1] = temp.im;
		coefficients[0][3][0] = temp.re;
		coefficients[0][3][1] = temp.im;
		
		temp = ta.mul(tab).sub(tb.mul(2)).add(new Complex([0, 4])).div(tab.mul(2).add(4).mul(z0));
		
		coefficients[0][1][0] = temp.re;
		coefficients[0][1][1] = temp.im;
		
		temp = ta.mul(tab).sub(tb.mul(2)).sub(new Complex([0, 4])).mul(z0).div(tab.mul(2).sub(4));
		
		coefficients[0][2][0] = temp.re;
		coefficients[0][2][1] = temp.im;
		
		
		
		temp = tb.sub(new Complex([0, 2])).div(2);
		
		coefficients[1][0][0] = temp.re;
		coefficients[1][0][1] = temp.im;
		
		temp = tb.div(2);
		
		coefficients[1][1][0] = temp.re;
		coefficients[1][1][1] = temp.im;
		coefficients[1][2][0] = temp.re;
		coefficients[1][2][1] = temp.im;
		
		temp = tb.add(new Complex([0, 2])).div(2);
		
		coefficients[1][3][0] = temp.re;
		coefficients[1][3][1] = temp.im;
		
		
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			let ax = coefficients[i][0][0];
			let ay = coefficients[i][0][1];
			let bx = coefficients[i][1][0];
			let by = coefficients[i][1][1];
			let cx = coefficients[i][2][0];
			let cy = coefficients[i][2][1];
			let dx = coefficients[i][3][0];
			let dy = coefficients[i][3][1];
			
			coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
		
		
		
		for (let i = 0; i < 4; i++)
		{
			search_step(0, 0, i, -1, -1, 1);
		}
		
		
		
		let brightness_sorted = brightness.slice().sort((a, b) => a - b);
		
		let	max_brightness = brightness_sorted[brightness_sorted.length - 1];
		
		
		
		//Run a pass to remove any isolated pixels.
		if (image_size !== small_image_size)
		{
			for (let i = 1; i < image_height - 1; i++)
			{
				for (let j = 1; j < image_width - 1; j++)
				{
					if (brightness[image_width * i + j] !== 0 && brightness[image_width * (i - 1) + j] === 0 && brightness[image_width * (i - 1) + (j + 1)] === 0 && brightness[image_width * i + (j + 1)] === 0 && brightness[image_width * (i + 1) + (j + 1)] === 0 && brightness[image_width * (i + 1) + j] === 0 && brightness[image_width * (i + 1) + (j - 1)] === 0 && brightness[image_width * i + (j - 1)] === 0 && brightness[image_width * (i - 1) + (j - 1)] === 0)
					{
						brightness[image_width * i + j] = 0;
					}
				}
			}
		}
		
		
		
		for (let i = 0; i < image_height; i++)
		{
			for (let j = 0; j < image_width; j++)
			{
				let index = (4 * i * image_width) + (4 * j);
				
				let rgb = wilson.utils.hsv_to_rgb(hue[image_width * i + j], 1, Math.pow(brightness[image_width * i + j] / max_brightness, .25)); 
				
				image[index] = rgb[0];
				image[index + 1] = rgb[1];
				image[index + 2] = rgb[2];
				image[index + 3] = 255;
			}
		}
		
		wilson.render.draw_frame(image);
	}
	
	
	
	function search_step(start_x, start_y, last_transformation_index, last_row, last_col, depth)
	{
		if (depth === max_depth)
		{
			return;
		}
		
		for (let i = 3; i < 6; i++)
		{
			x = start_x;
			y = start_y;
			
			let transformation_index = (last_transformation_index + i) % 4;
			
			apply_transformation(transformation_index);
			
			
			let row = 0;
			let col = 0;
			
			if (image_width >= image_height)
			{
				row = Math.floor((-y + box_size / 2) / box_size * image_height);
				col = Math.floor((x / (image_width / image_height) + box_size / 2) / box_size * image_width);
			}
			
			else
			{
				row = Math.floor((-y * (image_width / image_height) + box_size / 2) / box_size * image_height);
				col = Math.floor((x + box_size / 2) / box_size * image_width);
			}
			
			
			
			if (row >= 0 && row < image_height && col >= 0 && col < image_width)
			{
				if (brightness[image_width * row + col] === max_pixel_brightness)
				{
					continue;
				}
				
				if (depth > 10 || image_size !== small_image_size)
				{
					brightness[image_width * row + col]++;
				}
			}
			
			
			
			search_step(x, y, transformation_index, row, col, depth + 1);
		}
	}
	
	
	
	function apply_transformation(index)
	{
		let ax = coefficients[index][0][0];
		let ay = coefficients[index][0][1];
		let bx = coefficients[index][1][0];
		let by = coefficients[index][1][1];
		let cx = coefficients[index][2][0];
		let cy = coefficients[index][2][1];
		let dx = coefficients[index][3][0];
		let dy = coefficients[index][3][1];
		
		
		
		let num_x = ax*x - ay*y + bx;
		let num_y = ax*y + ay*x + by;
		
		let den_x = cx*x - cy*y + dx;
		let den_y = cx*y + cy*x + dy;
		
		let new_x = num_x*den_x + num_y*den_y;
		let new_y = num_y*den_x - num_x*den_y;
		
		let magnitude = den_x*den_x + den_y*den_y;
		
		x = new_x / magnitude;
		y = new_y / magnitude;
	}
	
	
	
	function init_draggables()
	{
		wilson.draggables.add(2, 0);
		wilson.draggables.add(2, 0);
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_grab_draggable(active_draggable, x, y, event)
	{
		image_size = small_image_size;
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * Page.Layout.aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		max_depth = 20;
		max_pixel_brightness = 10;
		
		wilson.change_canvas_size(image_width, image_height);
		
		regenerate_hue_and_brightness();
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_release_draggable(active_draggable, x, y, event)
	{
		image_size = large_image_size;
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * Page.Layout.aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		max_depth = 100;
		max_pixel_brightness = 50;
		
		wilson.change_canvas_size(image_width, image_height);
		
		regenerate_hue_and_brightness();
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		for (let i = 0; i < image_height; i++)
		{
			for (let j = 0; j < image_width; j++)
			{
				brightness[image_width * i + j] = 0;
			}
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function request_high_res_frame()
	{
		image_size = parseInt(Page.element.querySelector("#high-res-resolution-input").value || 1000);
		max_depth = parseInt(Page.element.querySelector("#max-depth-input").value || 100);
		max_pixel_brightness = parseInt(Page.element.querySelector("#max-pixel-brightness-input").value || 50);
		
		
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * Page.Layout.aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		regenerate_hue_and_brightness();
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/quasi-fuchsian-groups/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/quasi-fuchsian-groups/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			brightness = e.data[0];
			
			wilson.change_canvas_size(image_width, image_height);
			
			for (let i = 0; i < image_height; i++)
			{
				for (let j = 0; j < image_width; j++)
				{
					let index = (4 * i * image_width) + (4 * j);
					
					let rgb = wilson.utils.hsv_to_rgb(hue[image_width * i + j], 1, brightness[image_width * i + j]); 
					
					image[index] = rgb[0];
					image[index + 1] = rgb[1];
					image[index + 2] = rgb[2];
					image[index + 3] = 255;
				}
			}
			
			wilson.render.draw_frame(image);
			
			wilson.download_frame("a-quasi-fuchsian-group.png");
		}
		
		web_worker.postMessage([image_width, image_height, max_depth, max_pixel_brightness, box_size, coefficients]);
	}
	
	
	
	function regenerate_hue_and_brightness()
	{
		hue = new Array(image_width * image_height);
		brightness = new Array(image_width * image_height);
		image = new Uint8ClampedArray(image_width * image_height * 4);
		
		for (let i = 0; i < image_height; i++)
		{
			for (let j = 0; j < image_width; j++)
			{
				x = (i / image_height * box_size) - box_size / 2;
				y = box_size / 2 - (j / image_width * box_size);
				hue[image_width * i + j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
				
				brightness[image_width * i + j] = 0;
			}
		}
	}
	
	
	
	function change_aspect_ratio()
	{
		image_size = small_image_size;
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * Page.Layout.aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		wilson.change_canvas_size(image_width, image_height);
		
		regenerate_hue_and_brightness();
		
		window.requestAnimationFrame(draw_frame);
	}
}()