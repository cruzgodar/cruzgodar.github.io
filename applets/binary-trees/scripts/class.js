"use strict";

class BinaryTree extends Applet
{
	root = [];
	branch_points = [];
	
	num_preview_iterations = 5;
	
	web_worker = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: 2000,
			canvas_height: 2000,
			
			
			
			use_draggables: true,
			
			draggables_mousedown_callback: this.on_grab_draggable.bind(this),
			draggables_touchstart_callback: this.on_grab_draggable.bind(this),
			
			draggables_mousemove_callback: this.on_drag_draggable.bind(this),
			draggables_touchmove_callback: this.on_drag_draggable.bind(this),
			
			draggables_mouseup_callback: this.on_release_draggable.bind(this),
			draggables_touchend_callback: this.on_release_draggable.bind(this),
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.change_aspect_ratio.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvas_width, this.wilson.canvas_height);
		
		this.init_branch_markers();
	}
	
	
	
	preview(root, branch_points)
	{
		this.root = root;
		this.branch_points = branch_points;
		
		
			
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvas_width, this.wilson.canvas_height);
		
		
		
		let angles = [Math.atan2(this.branch_points[0][0] - this.root[0], this.branch_points[0][1] - this.root[1]), Math.atan2(this.branch_points[1][0] - this.root[0], this.branch_points[1][1] - this.root[1])];
		
		let angle_step = (angles[0] - angles[1]) / 2;
		
		
		
		let distances = [Math.sqrt((this.branch_points[0][0] - this.root[0])*(this.branch_points[0][0] - this.root[0]) + (this.branch_points[0][1] - this.root[1])*(this.branch_points[0][1] - this.root[1])), Math.sqrt((this.branch_points[1][0] - this.root[0])*(this.branch_points[1][0] - this.root[0]) + (this.branch_points[1][1] - this.root[1])*(this.branch_points[1][1] - this.root[1]))];
		
		let starting_points = [this.root];
		
		let scale = 1;
		
		
		
		for (let iteration = 0; iteration < this.num_preview_iterations; iteration++)
		{
			let new_starting_points = [];
			
			let new_angles = [];
			
			
			
			this.wilson.ctx.lineWidth = 20 * scale + 1;
			
			const r = Math.sqrt(scale) * 139;
			const g = Math.sqrt(scale) * 69 + (1 - Math.sqrt(scale)) * 128;
			const b = Math.sqrt(scale) * 19;
			this.wilson.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
			
			
			
			for (let i = 0; i < starting_points.length; i++)
			{
				let start_x = starting_points[i][1];
				let start_y = starting_points[i][0];
				let end_x = starting_points[i][1] + distances[0] * scale * Math.cos(angles[2*i]);
				let end_y = starting_points[i][0] + distances[0] * scale * Math.sin(angles[2*i]);
				
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(start_x, start_y);
				this.wilson.ctx.lineTo(end_x, end_y);
				this.wilson.ctx.stroke();
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i] - angle_step);
				new_angles.push(angles[2*i] + angle_step);
				
				
				
				start_x = starting_points[i][1];
				start_y = starting_points[i][0];
				end_x = starting_points[i][1] + distances[1] * scale * Math.cos(angles[2*i + 1]);
				end_y = starting_points[i][0] + distances[1] * scale * Math.sin(angles[2*i + 1]);
				
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo(start_x, start_y);
				this.wilson.ctx.lineTo(end_x, end_y);
				this.wilson.ctx.stroke();
				
				new_starting_points.push([end_y, end_x]);
				
				new_angles.push(angles[2*i + 1] - angle_step);
				new_angles.push(angles[2*i + 1] + angle_step);
			}
			
			
			
			starting_points = new_starting_points;
			
			angles = new_angles;
			
			scale *= .675;
		}
	}
	
	
	
	animate(root, branch_points)
	{
		this.root = root;
		this.branch_points = branch_points;
		
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		this.web_worker = new Worker(`/applets/binary-trees/scripts/worker.${DEBUG ? "" : "min."}js`);
		
		Page.temporary_web_workers.push(this.web_worker);
		
		
		
		this.web_worker.onmessage = (e) =>
		{
			if (e.data[0] === "done")
			{
				setTimeout(() =>
				{
					Page.set_element_styles(".wilson-draggable", "opacity", 1);
				}, 500);
				
				return;
			}
			
			
			
			this.wilson.ctx.strokeStyle = e.data[4];
			this.wilson.ctx.lineWidth = e.data[5];
			
			this.wilson.ctx.beginPath();
			this.wilson.ctx.moveTo(e.data[0], e.data[1]);
			this.wilson.ctx.lineTo(e.data[2], e.data[3]);
			this.wilson.ctx.stroke();
		}
		
		
		
		this.web_worker.postMessage([this.root, this.branch_points]);
	}
	
	
	
	init_branch_markers()
	{
		this.wilson.draggables.add(-1/7, -1/3);
		this.wilson.draggables.add(1/7, -1/3);
		
		
		
		this.root = this.wilson.utils.interpolate.world_to_canvas(0, -4/5);
		
		this.branch_points[0] = this.wilson.utils.interpolate.world_to_canvas(-1/7, -1/3);
		this.branch_points[1] = this.wilson.utils.interpolate.world_to_canvas(1/7, -1/3);
		
		
		
		this.preview(this.root, this.branch_points);
	}
	
	
	
	on_grab_draggable(active_draggable, x, y, event)
	{
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		Page.set_element_styles(".wilson-draggable", "opacity", 1);
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.wilson.canvas_width, this.wilson.canvas_height);
		
		this.preview(this.root, this.branch_points);
	}
	
	
	
	on_drag_draggable(active_draggable, x, y, event)
	{
		this.branch_points[active_draggable] = this.wilson.utils.interpolate.world_to_canvas(x, y);
		
		this.preview(this.root, this.branch_points);
	}
	
	
	
	on_release_draggable(active_draggable, x, y, event)
	{
		document.body.style.WebkitUserSelect = "";
		
		Page.set_element_styles(".wilson-draggable", "opacity", 0);
		
		
		
		let step = 0;
		
		const that = this;
		
		const refresh_id = setInterval(() =>
		{
			let alpha = step / 37;
			that.wilson.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvas_width, that.wilson.canvas_height);
			
			step++;
		}, 8);
		
		
		
		setTimeout(() =>
		{
			clearInterval(refresh_id);
			
			that.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			that.wilson.ctx.fillRect(0, 0, that.wilson.canvas_width, that.wilson.canvas_height);
			
			that.animate(that.root, that.branch_points);
		}, Site.opacity_animation_time);
	}
	
	
	
	change_aspect_ratio()
	{
		try {this.web_worker.terminate()}
		catch(ex) {}
		
		Page.set_element_styles(".wilson-draggable", "opacity", 1);
		
		
		
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				this.wilson.change_canvas_size(2000, 2000 / Page.Layout.aspect_ratio);
			}
			
			else
			{
				this.wilson.change_canvas_size(2000 * Page.Layout.aspect_ratio, 2000);
			}
		}
		
		else
		{
			this.wilson.change_canvas_size(2000, 2000);
		}
		
		this.wilson.draggables.recalculate_locations();
		
		
		
		this.root = this.wilson.utils.interpolate.world_to_canvas(0, -4/5);
		
		this.branch_points[0] = this.wilson.utils.interpolate.world_to_canvas(...this.wilson.draggables.world_coordinates[0]);
		this.branch_points[1] = this.wilson.utils.interpolate.world_to_canvas(...this.wilson.draggables.world_coordinates[1]);
		
		this.preview(this.root, this.branch_points);
	}
}