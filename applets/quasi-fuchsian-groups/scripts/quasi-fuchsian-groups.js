!function()
{
	"use strict";
	
	
	
	let canvas_size = 200;
	
	let box_size = 5;
	
	let ctx = document.querySelector("#quasi-fuchsian-groups-plot").getContext("2d", {alpha: false});
	
	let brightness = [];
	let hue = [];
	
	let web_worker = null;
	
	
	
	let coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]]];
	
	let coefficient_markers = [];
	let coefficient_points = [];
	
	let active_marker = -1;
	
	let coefficient_selector_width = document.querySelector("#coefficient-selector").offsetWidth;
	let coefficient_selector_height = document.querySelector("#coefficient-selector").offsetHeight;
	
	let coefficient_marker_radius = 17.5;
	
	

	let num_iterations = 100;

	let x = 0;
	let y = 0;
	
	
	
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	init_coefficient_markers();
	
	
	
	window.addEventListener("resize", quasi_fuchsian_groups_resize);
	temporary_handlers["resize"].push(quasi_fuchsian_groups_resize);
	
	setTimeout(quasi_fuchsian_groups_resize, 1000);
	
	
	
	
	
	function draw_quasi_fuchsian_group()
	{
		document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_size);
		document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_size, canvas_size);
		
		
		
		brightness = [];
		hue = [];
		
		for (let i = 0; i < canvas_size; i++)
		{
			brightness[i] = [];
			hue[i] = [];
			
			for (let j = 0; j < canvas_size; j++)
			{
				brightness[i][j] = 0;
				hue[i][j] = 0;
			}
		}
		
		
		
		//This bizarre ordering lets us do 3 - index to reference an inverse.
		for (let i = 1; i >= 0; i--)
		{
			let ax = coefficients[i][0][0];
			let ay = coefficients[i][0][1];
			let bx = coefficients[i][1][0];
			let by = coefficients[i][1][1];
			let cx = coefficients[i][2][0];
			let cy = coefficients[i][2][1];
			let dx = coefficients[i][3][0];
			let dy = coefficients[i][3][1];
			
			coefficients.push([[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]]);
		}
		
		
		
		for (let i = 0; i < canvas_size; i++)
		{
			for (let j = 0; j < canvas_size; j++)
			{
				x = (i / canvas_size * box_size) - box_size / 2;
				y = box_size / 2 - (j / canvas_size * box_size);
				
				hue[i][j] = (Math.atan2(-y, -x) + Math.PI) / (2 * Math.PI);
				
				
				
				for (let iteration = 0; iteration < num_iterations; iteration++)
				{
					let transformation_index = Math.floor(Math.random() * 4);
					
					apply_transformation(transformation_index);
					
					
					
					let col = Math.floor((x + box_size / 2) / box_size * canvas_size);
					let row = Math.floor((-y + box_size / 2) / box_size * canvas_size);
					
					if (row >= 0 && row < canvas_size && col >= 0 && col < canvas_size)
					{
						brightness[row][col]++;
					}
					
					else
					{
						break;
					}
				}
			}
		}
		
		
		
		let brightness_sorted = brightness.flat().sort(function(a, b) {return a - b});
		
		let	max_brightness = Math.sqrt(brightness_sorted[Math.round(brightness_sorted.length * .9999) - 1]);
		
		
		
		let img_data = ctx.getImageData(0, 0, canvas_size, canvas_size);
		let data = img_data.data;
		
		for (let i = 0; i < canvas_size; i++)
		{
			for (let j = 0; j < canvas_size; j++)
			{
				let index = (4 * i * canvas_size) + (4 * j);
				
				let rgb = HSVtoRGB(hue[i][j], 1, Math.min(Math.sqrt(brightness[i][j]) / max_brightness, 1)); 
				
				data[index] = rgb[0];
				data[index + 1] = rgb[1];
				data[index + 2] = rgb[2];
				data[index + 3] = 255;
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
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
		
		
		temporary_handlers["touchstart"].push(drag_start);
		temporary_handlers["touchmove"].push(drag_move);
		temporary_handlers["touchend"].push(drag_end);
		
		temporary_handlers["mousedown"].push(drag_start);
		temporary_handlers["mousemove"].push(drag_move);
		temporary_handlers["mouseup"].push(drag_end);
	}
	
	
	
	function init_coefficient_markers()
	{
		for (let i = 0; i < 8; i++)
		{
			let element = document.createElement("div");
			element.classList.add("coefficient-marker");
			element.id = `coefficient-marker-${i}`;
			
			document.querySelector("#coefficient-selector").appendChild(element);
			
			coefficient_markers.push(element);
		}
		
		
		
		for (let i = 0; i < 8; i++)
		{
			coefficient_points.push([Math.floor(canvas_size / 2), Math.floor(canvas_size / 2)]);
			
			let row = (coefficient_points[i][0] / canvas_size) * coefficient_selector_height;
			let col = (coefficient_points[i][1] / canvas_size) * coefficient_selector_width;
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		}
		
		
		
		draw_quasi_fuchsian_group();
	}
	
	
	
	function drag_start(e)
	{
		active_marker = -1;
		
		//Figure out which marker, if any, this is referencing.
		for (let i = 0; i < 8; i++)
		{
			if (e.target.id === `coefficient-marker-${i}`)
			{
				e.preventDefault();
				
				active_marker = i;
			}
		}
	}
	
	
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			canvas_size = 500;
			
			draw_quasi_fuchsian_group();
			
			canvas_size = 200;
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
		
		coefficients[Math.floor(active_marker / 4)][active_marker % 4][0] = box_size / 2 - (row / coefficient_selector_height * box_size);
		coefficients[Math.floor(active_marker / 4)][active_marker % 4][1] = box_size / 2 + (col / coefficient_selector_width * box_size);
		
		draw_quasi_fuchsian_group();
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
		
		let rect = document.querySelector("#coefficient-selector").getBoundingClientRect();
		
		for (let i = 0; i < 8; i++)
		{
			let row = Math.floor((box_size / 2 - coefficients[Math.floor(i / 4)][i % 4][0]) / box_size * coefficient_selector_height);
			let col = Math.floor((box_size / 2 + coefficients[Math.floor(i / 4)][i % 4][1]) / box_size * coefficient_selector_width);
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		}
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
		
		add_style(`
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