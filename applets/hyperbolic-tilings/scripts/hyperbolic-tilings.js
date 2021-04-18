!function()
{
	"use strict";
	
	
	
	let canvas_width = 2000;
	let canvas_height = 2000;
	
	let root = [];
	let branch_points = [];
	
	let num_preview_iterations = 5;
	
	let ctx = document.querySelector("#binary-trees-plot").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	
	
	let branch_markers = [];
	
	let active_marker = -1;
	
	let branch_selector_width = document.querySelector("#branch-selector").offsetWidth;
	let branch_selector_height = document.querySelector("#branch-selector").offsetHeight;
	
	let branch_marker_radius = 17.5;
	
	
	
	document.querySelector("#binary-trees-plot").setAttribute("width", canvas_width);
	document.querySelector("#binary-trees-plot").setAttribute("height", canvas_height);
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(0, 0, canvas_width, canvas_height);
	
	
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	init_branch_markers();
	
	
	
	window.addEventListener("resize", binary_trees_resize);
	Page.temporary_handlers["resize"].push(binary_trees_resize);
	
	setTimeout(binary_trees_resize, 1000);
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	Applets.Canvases.to_resize = [document.querySelector("#binary-trees-plot"), document.querySelector("#branch-selector")];
	
	Applets.Canvases.resize_callback = function()
	{
		try {web_worker.terminate();}
		catch(ex) {}
		
		set_element_styles(".branch-marker", "opacity", 1);
		
		
		
		if (Applets.Canvases.is_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				canvas_width = 2000;
				canvas_height = Math.floor(2000 / Page.Layout.aspect_ratio);
			}
			
			else
			{
				canvas_width = Math.floor(2000 * Page.Layout.aspect_ratio);
				canvas_height = 2000;
			}
		}
		
		else
		{
			canvas_width = 2000;
			canvas_height = 2000;
		}
		
		
		
		branch_selector_width = document.querySelector("#branch-selector").offsetWidth;
		branch_selector_height = document.querySelector("#branch-selector").offsetHeight;
		
		
		
		document.querySelector("#binary-trees-plot").setAttribute("width", canvas_width);
		document.querySelector("#binary-trees-plot").setAttribute("height", canvas_height);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_width, canvas_height);
		
		
		
		root[0] = Math.floor(canvas_height * 9/10);
		root[1] = Math.floor(canvas_width / 2);
		
		branch_points[0][0] = Math.floor(canvas_height * 2/3);
		branch_points[0][1] = Math.floor(canvas_width * 3/7);
		
		branch_points[1][0] = Math.floor(canvas_height * 2/3);
		branch_points[1][1] = Math.floor(canvas_width * 4/7);
		
		
		
		binary_trees_resize();
		
		draw_binary_tree();
	};
	
	Applets.Canvases.true_fullscreen = true;
	
	Applets.Canvases.set_up_resizer();
	
	
	draw_poincare_disc();
	
	draw_point(0, 0);
	draw_point(0, .5);
	draw_point(-.75, 0);
	draw_geodesic(0, .5, -.75, 0);
	
	
	
	function draw_poincare_disc()
	{
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_width, canvas_height);
		
		let radius = .9 * Math.min(canvas_width / 2, canvas_height / 2);
		
		ctx.beginPath();
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.arc(canvas_width / 2, canvas_height / 2, radius, 0, 2 * Math.PI, false);
		ctx.fill();
	}
	
	
	
	function draw_point(x, y)
	{
		let row = Math.floor((1 - (y * .9 + 1) / 2) * canvas_height);
		let col = Math.floor(((x * .9 + 1) / 2) * canvas_width);
		
		let radius = 30;
		
		ctx.fillStyle = "rgb(255, 0, 0)";
		ctx.beginPath();
		ctx.arc(col, row, radius, 0, 2 * Math.PI, false);
		ctx.fill();
	}
	
	
	
	//This is an arc of a circle perpendicular to the Poincare disc that passes through (x_1, y_1) and (x_2, y_2). To find it, we construct a third point, which is the circle inversion of either of the points.
	function draw_geodesic(x_1, y_1, x_2, y_2)
	{
		let r = Math.sqrt(x_1 * x_1 + y_1 * y_1);
		
		let x_3 = x_1 / (r*r);
		let y_3 = y_1 / (r*r);
		
		draw_point(x_3, y_3);
		
		//This process is absolutely disgusting, but here we go.
		let A = x_1*(y_2 - y_3) - y_1*(x_2 - x_3) + x_2*y_3 - x_3*y_2;
		let B = (x_1*x_1 + y_1*y_1)*(y_3 - y_2) + (x_2*x_2 + y_2*y_2)*(y_1 - y_3) + (x_3*x_3 + y_3*y_3)*(y_2 - y_1);
		let C = (x_1*x_1 + y_1*y_1)*(x_2 - x_3) + (x_2*x_2 + y_2*y_2)*(x_3 - x_1) + (x_3*x_3 + y_3*y_3)*(x_1 - x_2);
		let D = (x_1*x_1 + y_1*y_1)*(x_3*y_2 - x_2*y_3) + (x_2*x_2 + y_2*y_2)*(x_1*y_3 - x_3*y_1) + (x_3*x_3 + y_3*y_3)*(x_2*y_1 - x_1*y_2);
		
		let h = -B / (2*A);
		let k = -C / (2*A);
		let radius = Math.sqrt((B*B + C*C - 4*A*D) / (4*A*A));
		
		let row = Math.floor((1 - (k * .9 + 1) / 2) * canvas_height);
		let col = Math.floor(((h * .9 + 1) / 2) * canvas_width);
		let radius_scaled = radius * Math.min(canvas_width / 2, canvas_height / 2) * .9;
		
		
		
		//We have the center and radius now, but we still need to find the start and end angles.
		
		let angle_1 = -Math.atan2((y_1 - k) / radius, (x_1 - h) / radius);
		let angle_2 = -Math.atan2((y_2 - k) / radius, (x_2 - h) / radius);
		
		if (angle_2 > angle_1)
		{
			let temp = angle_1;
			angle_1 = angle_2;
			angle_2 = temp;
		}
		
		
		
		ctx.lineWidth = 20;
		ctx.strokeStyle = "rgb(0, 0, 255)";
		ctx.beginPath();
		ctx.arc(col, row, radius_scaled, angle_1, angle_2, true);
		ctx.stroke();
	}
	
	
	
	function draw_polygon(x_1, y_1, x_2, y_2, num_sides)
	{
		
	}
	
	
	function draw_binary_tree()
	{
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_width, canvas_height);
		
		
		
		let angles = [Math.atan2(branch_points[0][0] - root[0], branch_points[0][1] - root[1]), Math.atan2(branch_points[1][0] - root[0], branch_points[1][1] - root[1])];
		
		let angle_step = (angles[0] - angles[1]) / 2;
		
		
		
		let distances = [Math.sqrt((branch_points[0][0] - root[0])*(branch_points[0][0] - root[0]) + (branch_points[0][1] - root[1])*(branch_points[0][1] - root[1])), Math.sqrt((branch_points[1][0] - root[0])*(branch_points[1][0] - root[0]) + (branch_points[1][1] - root[1])*(branch_points[1][1] - root[1]))];
		
		let starting_points = [root];
		
		let scale = 1;
		
		
		
		for (let iteration = 0; iteration < num_preview_iterations; iteration++)
		{
			let new_starting_points = [];
			
			let new_angles = [];
			
			
			
			ctx.lineWidth = 20 * scale + 1;
			
			let r = Math.sqrt(scale) * 139;
			let g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			let b = Math.sqrt(scale) * 19;
			ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
			
			
			
			for (let i = 0; i < starting_points.length; i++)
			{
				let start_x = starting_points[i][1];
				let start_y = starting_points[i][0];
				let end_x = starting_points[i][1] + distances[0] * scale * Math.cos(angles[2*i]);
				let end_y = starting_points[i][0] + distances[0] * scale * Math.sin(angles[2*i]);
				
				ctx.beginPath();
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i] - angle_step);
				new_angles.push(angles[2*i] + angle_step);
				
				
				
				start_x = starting_points[i][1];
				start_y = starting_points[i][0];
				end_x = starting_points[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]);
				end_y = starting_points[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]);
				
				ctx.beginPath();
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i + 1] - angle_step);
				new_angles.push(angles[2*i + 1] + angle_step);
			}
			
			
			
			starting_points = new_starting_points;
			
			angles = new_angles;
			
			scale *= .675;
		}
	}
	
	
	
	function request_animated_binary_tree()
	{
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/binary-trees/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/binary-trees/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "done")
			{
				setTimeout(function()
				{
					set_element_styles(".branch-marker", "opacity", 1);
				}, 500);
				
				return;
			}
			
			
			
			ctx.strokeStyle = e.data[4];
			ctx.lineWidth = e.data[5];
			
			ctx.beginPath();
			ctx.moveTo(e.data[0], e.data[1]);
			ctx.lineTo(e.data[2], e.data[3]);
			ctx.stroke();
		}
		
		
		
		web_worker.postMessage([root, branch_points]);
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
	
	
	
	function init_branch_markers()
	{
		root[0] = Math.floor(canvas_height * 9/10);
		root[1] = Math.floor(canvas_width / 2);
		
		for (let i = 0; i < 2; i++)
		{
			let element = document.createElement("div");
			element.classList.add("branch-marker");
			element.classList.add("no-floating-footer");
			element.id = `branch-marker-${i}`;
			
			document.querySelector("#branch-selector").appendChild(element);
			
			branch_markers.push(element);
			
			branch_points.push([0, 0]);
		}
		
		branch_points[0][0] = Math.floor(canvas_height * 2/3);
		branch_points[0][1] = Math.floor(canvas_width * 3/7);
		
		branch_points[1][0] = Math.floor(canvas_height * 2/3);
		branch_points[1][1] = Math.floor(canvas_width * 4/7);
		
		for (let i = 0; i < 2; i++)
		{
			let row = (branch_points[i][0] / canvas_height) * branch_selector_height;
			let col = (branch_points[i][1] / canvas_width) * branch_selector_width;
			
			branch_markers[i].style.transform = `translate3d(${col - branch_marker_radius}px, ${row - branch_marker_radius}px, 0)`;
		}
	}
	
	
	
	function drag_start(e)
	{
		active_marker = -1;
		
		//Figure out which marker, if any, this is referencing.
		for (let i = 0; i < 2; i++)
		{
			if (e.target.id === `branch-marker-${i}`)
			{
				e.preventDefault();
				
				active_marker = i;
				
				try {web_worker.terminate();}
				catch(ex) {}
				
				break;
			}
		}
	}
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			document.body.style.WebkitUserSelect = "";
			
			set_element_styles(".branch-marker", "opacity", 0);
			
			
			
			let step = 0;
			
			let refresh_id = setInterval(function()
			{
				ctx.fillStyle = `rgba(0, 0, 0, ${step / 37})`;
				ctx.fillRect(0, 0, canvas_width, canvas_height);
				
				step++;
			}, 8);
			
			
			
			setTimeout(function()
			{
				clearInterval(refresh_id);
				
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(0, 0, canvas_width, canvas_height);
				
				request_animated_binary_tree();
			}, 300);
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
		
		let rect = document.querySelector("#branch-selector").getBoundingClientRect();
		
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
		
		
		
		if (row < branch_marker_radius)
		{
			row = branch_marker_radius;
		}
		
		if (row > branch_selector_height - branch_marker_radius)
		{
			row = branch_selector_height - branch_marker_radius;
		}
		
		if (col < branch_marker_radius)
		{
			col = branch_marker_radius;
		}
		
		if (col > branch_selector_width - branch_marker_radius)
		{
			col = branch_selector_width - branch_marker_radius;
		}
		
		
		
		branch_markers[active_marker].style.transform = `translate3d(${col - branch_marker_radius}px, ${row - branch_marker_radius}px, 0)`;
		
		branch_points[active_marker][0] = (row / branch_selector_height) * canvas_height;
		branch_points[active_marker][1] = (col / branch_selector_width) * canvas_width;
		
		draw_binary_tree();
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "binary-trees.png";
		
		link.href = document.querySelector("#binary-trees-plot").toDataURL();
		
		link.click();
		
		link.remove();
	}
	
	
	
	function binary_trees_resize()
	{
		branch_selector_width = document.querySelector("#branch-selector").offsetWidth;
		branch_selector_height = document.querySelector("#branch-selector").offsetHeight;
		
		let rect = document.querySelector("#branch-selector").getBoundingClientRect();
		
		for (let i = 0; i < 2; i++)
		{
			let row = Math.floor(branch_selector_height * branch_points[i][0] / canvas_height);
			let col = Math.floor(branch_selector_width * branch_points[i][1] / canvas_width);
			
			branch_markers[i].style.transform = `translate3d(${col - branch_marker_radius}px, ${row - branch_marker_radius}px, 0)`;
		}
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#binary-trees-plot").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#binary-trees-plot").style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		add_style(`
			.branch-marker.hover
			{
				background-color: rgb(127, 127, 127);	
			}
			
			.branch-marker:not(:hover):focus
			{
				background-color: rgb(127, 127, 127);
				outline: none;
			}
		`, true);
	}
	
	
	
	function alert_about_hardware_acceleration()
	{
		let elements = document.querySelector("main").children;
		
		elements = elements[elements.length - 1].children;
		
		elements[elements.length - 1].insertAdjacentHTML("afterend", `
			<div data-aos="fade-up" style="margin-top: 10vh">
				<p class="body-text">
					Your browser treats canvases in a way that may make this applet stutter excessively. If this happens, try temporarily turning off hardware acceleration in the browser&#x2019;s settings.
				</p>
			</div>
		`);
		
		Page.Load.AOS.on_resize();
	}
}()