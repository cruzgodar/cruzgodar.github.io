!function()
{
	"use strict";
	
	
	
	let canvas_size = 500;
	
	let box_size = 50;
	
	let ctx = document.querySelector("#quasi-fuchsian-groups-plot").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	
	
	let coefficients = [[[1, 0], [0, 1], [1, 0], [1, 0]], [[0, 1], [0, 1], [1, 0], [0, 1]]];
	
	let coefficient_markers = [];
	
	let active_marker = -1;
	
	let coefficient_selector_width = document.querySelector("#coefficient-selector").offsetWidth;
	let coefficient_selector_height = document.querySelector("#coefficient-selector").offsetHeight;
	
	let coefficient_marker_radius = 17.5;
	
	
	
	document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("width", canvas_size);
	document.querySelector("#quasi-fuchsian-groups-plot").setAttribute("height", canvas_size);
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(0, 0, canvas_size, canvas_size);
	
	
	/*
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	init_coefficient_markers();
	
	
	
	window.addEventListener("resize", quasi_fuchsian_groups_resize);
	temporary_handlers["resize"].push(quasi_fuchsian_groups_resize);
	
	setTimeout(quasi_fuchsian_groups_resize, 1000);
	*/
	
	
	
	for (let i = 0; i < 2; i++)
	{
		for (let j = 0; j < 4; j++)
		{
			for (let k = 0; k < 2; k++)
			{
				coefficients[i][j][k] = Math.random() - .5;	
			}
		}
	}
	
	
	
	//This bizarre ordering lets us do 3 - index to reference an inverse.
	for (let i = 1; i >= 0; i++)
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
	
	
	
	
	
	function draw_quasi_fuchsian_group()
	{
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, canvas_size, canvas_size);
		
		ctx.fillStyle = "rgb(255, 255, 255)";
		
		
	}
	
	draw_quasi_fuchsian_group();
	
	
	
	/*
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
	
	
	
	function init_branch_markers()
	{
		root[0] = Math.floor(canvas_size * 9/10);
		root[1] = Math.floor(canvas_size / 2);
		
		for (let i = 0; i < 2; i++)
		{
			let element = document.createElement("div");
			element.classList.add("branch-marker");
			element.id = `branch-marker-${i}`;
			
			document.querySelector("#branch-selector").appendChild(element);
			
			branch_markers.push(element);
			
			branch_points.push([0, 0]);
		}
		
		branch_points[0][0] = Math.floor(canvas_size * 2/3);
		branch_points[0][1] = Math.floor(canvas_size * 3/7);
		
		branch_points[1][0] = Math.floor(canvas_size * 2/3);
		branch_points[1][1] = Math.floor(canvas_size * 4/7);
		
		for (let i = 0; i < 2; i++)
		{
			let row = (branch_points[i][0] / canvas_size) * branch_selector_height;
			let col = (branch_points[i][1] / canvas_size) * branch_selector_width;
			
			branch_markers[i].style.transform = `translate3d(${col - branch_marker_radius}px, ${row - branch_marker_radius}px, 0)`;
		}
		
		draw_binary_tree();
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
				ctx.fillRect(0, 0, canvas_size, canvas_size);
				
				step++;
			}, 8);
			
			
			
			setTimeout(function()
			{
				clearInterval(refresh_id);
				
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(0, 0, canvas_size, canvas_size);
				
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
		
		branch_points[active_marker][0] = (row / branch_selector_height) * canvas_size;
		branch_points[active_marker][1] = (col / branch_selector_width) * canvas_size;
		
		draw_binary_tree();
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
		
		for (let i = 0; i < 4; i++)
		{
			let row = Math.floor(coefficient_selector_height * coefficients[i][0] / canvas_size);
			let col = Math.floor(coefficient_selector_width * coefficients[i][1] / canvas_size);
			
			coefficient_markers[i].style.transform = `translate3d(${col - coefficient_marker_radius}px, ${row - coefficient_marker_radius}px, 0)`;
		}
	}
	*/



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
}()