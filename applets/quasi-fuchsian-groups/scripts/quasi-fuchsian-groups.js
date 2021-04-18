!function()
{
	"use strict";
	
	
	
	let canvas_size = 300;
	let canvas_width = 300;
	let canvas_height = 300;
	
	let box_size = 4;
	
	let ctx = document.querySelector("#quasi-fuchsian-groups-plot").getContext("2d", {alpha: false});
	
	let brightness = [];
	let hue = [];
	
	let web_worker = null;
	
	
	
	let t = [[2, 0], [2, 0]];
	
	
	
	let coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [], []];
	
	let coefficient_markers = [];
	let coefficient_points = [];
	
	let active_marker = -1;
	
	let coefficient_selector_width = document.querySelector("#coefficient-selector").offsetWidth;
	let coefficient_selector_height = document.querySelector("#coefficient-selector").offsetHeight;
	
	let coefficient_marker_radius = 17.5;
	
	
	
	let draw_another_frame = false;
	let need_to_restart = true;
	
	

	let max_depth = 20;
	let max_pixel_brightness = 10;

	let x = 0;
	let y = 0;
	
	
	
	document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_width);
	document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_height);
	
	hue = [];
	brightness = [];
	
	for (let i = 0; i < canvas_height; i++)
	{
		hue[i] = [];
		brightness[i] = [];
		
		for (let j = 0; j < canvas_width; j++)
		{
			x = (i / canvas_height * box_size) - box_size / 2;
			y = box_size / 2 - (j / canvas_width * box_size);
			hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
			
			brightness[i][j] = 0;
		}
	}
	
	
	
	if (!Site.scripts_loaded["complexjs"])
	{
		Site.load_script("/scripts/complex.min.js")
		
		.then(function()
		{
			Site.scripts_loaded["complexjs"] = true;
			
			init_coefficient_markers();
		})
		
		.catch(function(error)
		{
			console.error("Could not load ComplexJS");
		});
	}
	
	else
	{
		init_coefficient_markers();
	}
	
	
	
	document.querySelector("#download-button").addEventListener("click", request_high_res_quasi_fuchsian_group);
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	
	
	Applets.Canvases.to_resize = [document.querySelector("#quasi-fuchsian-groups-plot"), document.querySelector("#coefficient-selector")];
	
	Applets.Canvases.resize_callback = function()
	{
		canvas_size = 300;
		
		if (Applets.Canvases.is_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				canvas_width = canvas_size;
				canvas_height = Math.floor(canvas_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				canvas_width = Math.floor(canvas_size * Page.Layout.aspect_ratio);
				canvas_height = canvas_size;
			}
		}
		
		else
		{
			canvas_width = canvas_size;
			canvas_height = canvas_size;
		}
		
		
		
		for (let i = 0; i < canvas_height; i++)
		{
			hue[i] = [];
			brightness[i] = [];
			
			for (let j = 0; j < canvas_width; j++)
			{
				x = (i / canvas_height * box_size) - box_size / 2;
				y = box_size / 2 - (j / canvas_width * box_size);
				hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
				
				brightness[i][j] = 0;
			}
		}
		
		
		
		document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_width);
		document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_height);
		
		
		
		quasi_fuchsian_groups_resize();
		
		draw_quasi_fuchsian_group();
	};
	
	Applets.Canvases.true_fullscreen = true;
	
	Applets.Canvases.set_up_resizer();
	
	
	
	
	
	function draw_quasi_fuchsian_group()
	{
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_width, canvas_height);
		
		
		
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		let ta = new Complex(t[0]);
		let tb = new Complex(t[1]);
		
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
		
		
		
		let brightness_sorted = brightness.flat().sort(function(a, b) {return a - b});
		
		let	max_brightness = brightness_sorted[brightness_sorted.length - 1];
		
		
		
		//Run a pass to remove any isolated pixels.
		if (canvas_size !== 300)
		{
			for (let i = 1; i < canvas_height - 1; i++)
			{
				for (let j = 1; j < canvas_width - 1; j++)
				{
					if (brightness[i][j] !== 0 && brightness[i - 1][j] === 0 && brightness[i - 1][j + 1] === 0 && brightness[i][j + 1] === 0 && brightness[i + 1][j + 1] === 0 && brightness[i + 1][j] === 0 && brightness[i + 1][j - 1] === 0 && brightness[i][j - 1] === 0 && brightness[i - 1][j - 1] === 0)
					{
						brightness[i][j] = 0;
					}
				}
			}
		}
		
		
		
		let img_data = ctx.getImageData(0, 0, canvas_width, canvas_height);
		let data = img_data.data;
		
		for (let i = 0; i < canvas_height; i++)
		{
			for (let j = 0; j < canvas_width; j++)
			{
				let index = (4 * i * canvas_width) + (4 * j);
				
				let rgb = HSVtoRGB(hue[i][j], 1, Math.pow(brightness[i][j] / max_brightness, .25)); 
				
				data[index] = rgb[0];
				data[index + 1] = rgb[1];
				data[index + 2] = rgb[2];
				data[index + 3] = 255;
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
		
		
		
		//Uncomment to make an animation.
		
		/*
		let link = document.createElement("a");
		
		link.download = `${frame}.png`;
		
		link.href = document.querySelector("#quasi-fuchsian-groups-plot").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		let a = .25 * (Math.cos(2 * 2 * Math.PI * frame / 3000) + .2 * Math.sin(7 * 2 * Math.PI * frame / 3000)) + 2;
		b = .25 * (1.75 * Math.sin(2 * Math.PI * frame / 3000) + .2 * Math.cos(5 * 2 * Math.PI * frame / 3000));
		
		t[0] = [a, b];
		
		a = .25 * (Math.cos(4 * 2 * Math.PI * frame / 3000) + .2 * Math.sin(5 * 2 * Math.PI * frame / 3000)) + 2;
		b = .25 * (1.75 * Math.sin(2 * 2 * Math.PI * frame / 3000) + .2 * Math.cos(6 * 2 * Math.PI * frame / 3000));
		
		t[1] = [a, b];
		
		
		
		for (let i = 0; i < 2; i++)
		{
			let row = Math.floor((1 - (t[i][1] + .5)) * coefficient_selector_height);
			let col = Math.floor((t[i][0] - 2 + .5) * coefficient_selector_width);
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		}
		
		
		
		frame++;
		
		
		
		for (let i = 0; i < canvas_size; i++)
		{
			for (let j = 0; j < canvas_size; j++)
			{
				brightness[i][j] = 0;
			}
		}
		
		
		
		setTimeout(function()
		{
			window.requestAnimationFrame(draw_quasi_fuchsian_group);
		}, 20);
		*/

		
		
		if (draw_another_frame)
		{
			draw_another_frame = false;
			
			window.requestAnimationFrame(draw_quasi_fuchsian_group);
		}
		
		else
		{
			need_to_restart = true;
		}
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
			
			if (canvas_width >= canvas_height)
			{
				row = Math.floor((-y + box_size / 2) / box_size * canvas_height);
				col = Math.floor((x / (canvas_width / canvas_height) + box_size / 2) / box_size * canvas_width);
			}
			
			else
			{
				row = Math.floor((-y * (canvas_width / canvas_height) + box_size / 2) / box_size * canvas_height);
				col = Math.floor((x + box_size / 2) / box_size * canvas_width);
			}
			
			
			
			if (row >= 0 && row < canvas_height && col >= 0 && col < canvas_width)
			{
				if (brightness[row][col] === max_pixel_brightness)
				{
					continue;
				}
				
				if (depth > 10 || canvas_size !== 300)
				{
					brightness[row][col]++;
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
	
	
	
	
	function init_listeners()
	{
		document.documentElement.addEventListener("touchstart", drag_start, false);
		document.documentElement.addEventListener("touchmove", drag_move, false);
		document.documentElement.addEventListener("touchend", drag_end, false);

		document.documentElement.addEventListener("mousedown", drag_start, false);
		document.documentElement.addEventListener("mousemove", drag_move, false);
		document.documentElement.addEventListener("mouseup", drag_end, false);
		
		
		Page.temporary_handlers["touchstart"].push(drag_start);
		Page.temporary_handlers["touchmove"].push(drag_move);
		Page.temporary_handlers["touchend"].push(drag_end);
		
		Page.temporary_handlers["mousedown"].push(drag_start);
		Page.temporary_handlers["mousemove"].push(drag_move);
		Page.temporary_handlers["mouseup"].push(drag_end);
	}
	
	
	
	function init_coefficient_markers()
	{
		for (let i = 0; i < 2; i++)
		{
			coefficient_markers.push(document.querySelector(`#coefficient-marker-${i}`));
		}
		
		
		
		for (let i = 0; i < 2; i++)
		{
			coefficient_points.push([Math.floor(canvas_height / 2), Math.floor(canvas_width / 2)]);
			
			let row = 0;
			let col = 0;
			
			if (canvas_width >= canvas_height)
			{
				row = (coefficient_points[i][0] / canvas_height) * coefficient_selector_height;
				col = (coefficient_points[i][1] / (canvas_width / canvas_height) / canvas_width) * coefficient_selector_width;
			}
			
			else
			{
				row = (coefficient_points[i][0] * (canvas_width / canvas_height) / canvas_height) * coefficient_selector_height;
				col = (coefficient_points[i][1] / canvas_width) * coefficient_selector_width;

			}
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
			
			coefficient_markers[i].classList.add("no-floating-footer");
		}
		
		
		
		window.addEventListener("resize", quasi_fuchsian_groups_resize);
		Page.temporary_handlers["resize"].push(quasi_fuchsian_groups_resize);
		
		setTimeout(quasi_fuchsian_groups_resize, 1000);
		
		
		
		draw_quasi_fuchsian_group();
	}
	
	
	
	function drag_start(e)
	{
		active_marker = -1;
		
		//Figure out which marker, if any, this is referencing.
		for (let i = 0; i < 2; i++)
		{
			if (e.target.id === `coefficient-marker-${i}`)
			{
				e.preventDefault();
				
				active_marker = i;
				
				
				
				canvas_size = 300;
				
				if (Applets.Canvases.is_fullscreen)
				{
					if (Page.Layout.aspect_ratio >= 1)
					{
						canvas_width = canvas_size;
						canvas_height = Math.floor(canvas_size / Page.Layout.aspect_ratio);
					}
					
					else
					{
						canvas_width = Math.floor(canvas_size * Page.Layout.aspect_ratio);
						canvas_height = canvas_size;
					}
				}
				
				else
				{
					canvas_width = canvas_size;
					canvas_height = canvas_size;
				}
				
				
				
				max_depth = 20;
				max_pixel_brightness = 10;
				
				document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_width);
				document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_height);
				
				hue = [];
				brightness = [];
				
				for (let i = 0; i < canvas_height; i++)
				{
					hue[i] = [];
					brightness[i] = [];
					
					for (let j = 0; j < canvas_width; j++)
					{
						x = (i / canvas_height * box_size) - box_size / 2;
						y = box_size / 2 - (j / canvas_width * box_size);
						hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
						
						brightness[i][j] = 0;
					}
				}
				
				draw_another_frame = true;
			
				if (need_to_restart)
				{
					need_to_restart = false;
					
					window.requestAnimationFrame(draw_quasi_fuchsian_group);
				}
			}
		}
	}
	
	
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			canvas_size = 1000;
			
			if (Applets.Canvases.is_fullscreen)
			{
				if (Page.Layout.aspect_ratio >= 1)
				{
					canvas_width = canvas_size;
					canvas_height = Math.floor(canvas_size / Page.Layout.aspect_ratio);
				}
				
				else
				{
					canvas_width = Math.floor(canvas_size * Page.Layout.aspect_ratio);
					canvas_height = canvas_size;
				}
			}
			
			else
			{
				canvas_width = canvas_size;
				canvas_height = canvas_size;
			}
			
			
			
			max_depth = 100;
			max_pixel_brightness = 50;
			
			document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_width);
			document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_height);
			
			hue = [];
			brightness = [];
			
			for (let i = 0; i < canvas_height; i++)
			{
				hue[i] = [];
				brightness[i] = [];
				
				for (let j = 0; j < canvas_width; j++)
				{
					x = (i / canvas_height * box_size) - box_size / 2;
					y = box_size / 2 - (j / canvas_width * box_size);
					hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
					
					brightness[i][j] = 0;
				}
			}
			
			
			
			draw_another_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_quasi_fuchsian_group);
			}
		}
		
		active_marker = -1;
	}
	
	
	
	function drag_move(e)
	{
		if (active_marker === -1)
		{
			return;
		}
		
		
		
		let row = null;
		let col = null;
		
		let rect = document.querySelector("#coefficient-selector").getBoundingClientRect();
		
		if (e.type === "touchmove")
		{
			row = e.touches[0].clientY - rect.top;
			col = e.touches[0].clientX - rect.left;
		}
		
		else
		{
			row = e.clientY - rect.top;
			col = e.clientX - rect.left;
		}
		
		
		
		if (row < coefficient_marker_radius)
		{
			row = coefficient_marker_radius;
		}
		
		if (row > coefficient_selector_height - coefficient_marker_radius)
		{
			row = coefficient_selector_height - coefficient_marker_radius;
		}
		
		if (col < coefficient_marker_radius)
		{
			col = coefficient_marker_radius;
		}
		
		if (col > coefficient_selector_width - coefficient_marker_radius)
		{
			col = coefficient_selector_width - coefficient_marker_radius;
		}
		
		
		
		coefficient_markers[active_marker].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		
		t[active_marker][0] = (col / coefficient_selector_width - .5) + 2;
		t[active_marker][1] = (1 - row / coefficient_selector_height - .5);
		
		
		
		for (let i = 0; i < canvas_height; i++)
		{
			for (let j = 0; j < canvas_width; j++)
			{
				brightness[i][j] = 0;
			}
		}
		
		
		
		draw_another_frame = true;
		
		if (need_to_restart)
		{
			need_to_restart = false;
			
			window.requestAnimationFrame(draw_quasi_fuchsian_group);
		}
	}
	
	
	
	function request_high_res_quasi_fuchsian_group()
	{
		canvas_size = parseInt(document.querySelector("#image-size-input").value || 1000);
		max_depth = parseInt(document.querySelector("#max-depth-input").value || 100);
		max_pixel_brightness = parseInt(document.querySelector("#max-pixel-brightness-input").value || 50);
		
		
		
		if (Applets.Canvases.is_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				canvas_width = canvas_size;
				canvas_height = Math.floor(canvas_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				canvas_width = Math.floor(canvas_size * Page.Layout.aspect_ratio);
				canvas_height = canvas_size;
			}
		}
		
		else
		{
			canvas_width = canvas_size;
			canvas_height = canvas_size;
		}
		
		
		
		hue = [];
		brightness = [];
		
		for (let i = 0; i < canvas_height; i++)
		{
			hue[i] = [];
			brightness[i] = [];
			
			for (let j = 0; j < canvas_width; j++)
			{
				x = (i / canvas_height * box_size) - box_size / 2;
				y = box_size / 2 - (j / canvas_width * box_size);
				hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
				
				brightness[i][j] = 0;
			}
		}
		
		
		
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
			
			document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_width);
			document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_height);
			
			let img_data = ctx.getImageData(0, 0, canvas_width, canvas_height);
			let data = img_data.data;
			
			for (let i = 0; i < canvas_height; i++)
			{
				for (let j = 0; j < canvas_width; j++)
				{
					let index = (4 * i * canvas_width) + (4 * j);
					
					let rgb = HSVtoRGB(hue[i][j], 1, brightness[i][j]); 
					
					data[index] = rgb[0];
					data[index + 1] = rgb[1];
					data[index + 2] = rgb[2];
					data[index + 3] = 255;
				}
			}
			
			ctx.putImageData(img_data, 0, 0);
			
			prepare_download();
		}
		
		web_worker.postMessage([canvas_width, canvas_height, max_depth, max_pixel_brightness, box_size, coefficients]);
	}
	
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "a-quasi-fuchsian-group.png";
		
		link.href = document.querySelector("#quasi-fuchsian-groups-plot").toDataURL();
		
		link.click();
		
		link.remove();
	}
	
	
	
	function quasi_fuchsian_groups_resize()
	{
		coefficient_selector_width = document.querySelector("#coefficient-selector").offsetWidth;
		coefficient_selector_height = document.querySelector("#coefficient-selector").offsetHeight;
		
		for (let i = 0; i < 2; i++)
		{
			let row = Math.floor((1 - (t[i][1] + .5)) * coefficient_selector_height);
			let col = Math.floor((t[i][0] - 2 + .5) * coefficient_selector_width);
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		}
		
		draw_quasi_fuchsian_group();
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#quasi-fuchsian-groups-plot").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#quasi-fuchsian-groups-plot").style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		Site.add_style(`
			.coefficient-marker.hover
			{
				background-color: rgb(127, 127, 127);	
			}
			
			.coefficient-marker:not(:hover):focus
			{
				background-color: rgb(127, 127, 127);
				outline: none;
			}
		`, true);
	}
	
	
	
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