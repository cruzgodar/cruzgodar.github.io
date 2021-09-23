!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 2000,
		canvas_height: 2000,
		
		
		
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
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let root = [];
	let branch_points = [];
	
	let num_preview_iterations = 5;
	
	let web_worker = null;
	
	wilson.ctx.fillStyle = "rgb(0, 0, 0)";
	wilson.ctx.fillRect(0, 0, wilson.canvas_width, wilson.canvas_height);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-binary-tree.png");
	});
	
	
	
	init_branch_markers();
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	function draw_binary_tree()
	{
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, wilson.canvas_width, wilson.canvas_height);
		
		
		
		let angles = [Math.atan2(branch_points[0][0] - root[0], branch_points[0][1] - root[1]), Math.atan2(branch_points[1][0] - root[0], branch_points[1][1] - root[1])];
		
		let angle_step = (angles[0] - angles[1]) / 2;
		
		
		
		let distances = [Math.sqrt((branch_points[0][0] - root[0])*(branch_points[0][0] - root[0]) + (branch_points[0][1] - root[1])*(branch_points[0][1] - root[1])), Math.sqrt((branch_points[1][0] - root[0])*(branch_points[1][0] - root[0]) + (branch_points[1][1] - root[1])*(branch_points[1][1] - root[1]))];
		
		let starting_points = [root];
		
		let scale = 1;
		
		
		
		for (let iteration = 0; iteration < num_preview_iterations; iteration++)
		{
			let new_starting_points = [];
			
			let new_angles = [];
			
			
			
			wilson.ctx.lineWidth = 20 * scale + 1;
			
			let r = Math.sqrt(scale) * 139;
			let g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			let b = Math.sqrt(scale) * 19;
			wilson.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
			
			
			
			for (let i = 0; i < starting_points.length; i++)
			{
				let start_x = starting_points[i][1];
				let start_y = starting_points[i][0];
				let end_x = starting_points[i][1] + distances[0] * scale * Math.cos(angles[2*i]);
				let end_y = starting_points[i][0] + distances[0] * scale * Math.sin(angles[2*i]);
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(start_x, start_y);
				wilson.ctx.lineTo(end_x, end_y);
				wilson.ctx.stroke();
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i] - angle_step);
				new_angles.push(angles[2*i] + angle_step);
				
				
				
				start_x = starting_points[i][1];
				start_y = starting_points[i][0];
				end_x = starting_points[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]);
				end_y = starting_points[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]);
				
				wilson.ctx.beginPath();
				wilson.ctx.moveTo(start_x, start_y);
				wilson.ctx.lineTo(end_x, end_y);
				wilson.ctx.stroke();
				
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
				setTimeout(() =>
				{
					Page.set_element_styles(".wilson-draggable", "opacity", 1);
				}, 500);
				
				return;
			}
			
			
			
			wilson.ctx.strokeStyle = e.data[4];
			wilson.ctx.lineWidth = e.data[5];
			
			wilson.ctx.beginPath();
			wilson.ctx.moveTo(e.data[0], e.data[1]);
			wilson.ctx.lineTo(e.data[2], e.data[3]);
			wilson.ctx.stroke();
		}
		
		
		
		web_worker.postMessage([root, branch_points]);
	}
	
	
	
	function init_branch_markers()
	{
		wilson.draggables.add(-1/7, -1/3);
		wilson.draggables.add(1/7, -1/3);
		
		
		
		root = wilson.utils.interpolate.world_to_canvas(0, -4/5);
		
		branch_points[0] = wilson.utils.interpolate.world_to_canvas(-1/7, -1/3);
		branch_points[1] = wilson.utils.interpolate.world_to_canvas(1/7, -1/3);
		
		
		
		draw_binary_tree();
	}
	
	
	
	function on_grab_draggable(active_draggable, x, y, event)
	{
		try {web_worker.terminate();}
		catch(ex) {}
		
		Page.set_element_styles(".wilson-draggable", "opacity", 1);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, wilson.canvas_width, wilson.canvas_height);
		
		draw_binary_tree();
	}
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		branch_points[active_draggable] = wilson.utils.interpolate.world_to_canvas(x, y);
		
		draw_binary_tree();
	}
	
	
	
	function on_release_draggable(active_draggable, x, y, event)
	{
		document.body.style.WebkitUserSelect = "";
		
		Page.set_element_styles(".wilson-draggable", "opacity", 0);
		
		
		
		let step = 0;
		
		let refresh_id = setInterval(() =>
		{
			let alpha = step / 37;
			wilson.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			wilson.ctx.fillRect(0, 0, wilson.canvas_width, wilson.canvas_height);
			
			step++;
		}, 8);
		
		
		
		setTimeout(() =>
		{
			clearInterval(refresh_id);
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, wilson.canvas_width, wilson.canvas_height);
			
			request_animated_binary_tree();
		}, Site.opacity_animation_time);
	}
	
	
	
	function change_aspect_ratio()
	{
		try {web_worker.terminate();}
		catch(ex) {}
		
		Page.set_element_styles(".wilson-draggable", "opacity", 1);
		
		
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				wilson.change_canvas_size(2000, 2000 / Page.Layout.aspect_ratio);
			}
			
			else
			{
				wilson.change_canvas_size(2000 * Page.Layout.aspect_ratio, 2000);
			}
		}
		
		else
		{
			wilson.change_canvas_size(2000, 2000);
		}
		
		
		
		wilson.draggables.recalculate_locations();
		
		
		
		root = wilson.utils.interpolate.world_to_canvas(0, -4/5);
		
		
		
		branch_points[0] = wilson.utils.interpolate.world_to_canvas(...wilson.draggables.world_coordinates[0]);
		branch_points[1] = wilson.utils.interpolate.world_to_canvas(...wilson.draggables.world_coordinates[1]);
		
		
		
		draw_binary_tree();
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