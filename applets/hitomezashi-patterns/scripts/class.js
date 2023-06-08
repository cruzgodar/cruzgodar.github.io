"use strict";

class HitomezashiPattern extends Applet
{
	do_draw_boundaries = true;
	do_draw_regions = true;
	maximum_speed = false;
	
	resolution = null;
	grid_size = null;
	row_prob = null;
	col_prob = null;
	
	pattern_rows = [];
	pattern_cols = [];
	regions = [];
	regions_ordered = [];
	region_sizes = [];
	num_regions = 0;
	num_unique_region_sizes = 0;
	cells_by_radius = [];
	
	current_row = 1;
	current_col = 1;
	current_region = 0;
	
	line_width = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: 1000,
			canvas_height: 1000,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
	}
	
	
	
	run(resolution = 2000, grid_size = 50, row_prob = .5, col_prob = .5, do_draw_boundaries = true, do_draw_regions = true, maximum_speed = false)
	{
		this.resolution = resolution;
		this.grid_size = grid_size;
		this.row_prob = row_prob;
		this.col_prob = col_prob;
		this.do_draw_boundaries = do_draw_boundaries;
		this.do_draw_regions = do_draw_regions;
		this.maximum_speed = maximum_speed;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		this.wilson.ctx.strokeStyle = "rgb(127, 127, 127)";
		
		this.line_width = this.resolution / this.grid_size / 20;
		
		this.wilson.ctx.lineWidth = this.line_width;
		
		
		
		//These are 0 if there is not a row/col in that position, and 1 if there is.
		this.pattern_rows = new Array(this.grid_size + 1);
		this.pattern_cols = new Array(this.grid_size + 1);
		this.regions = new Array(this.grid_size);
		this.regions_ordered = [];
		this.region_sizes = [];
		this.num_regions = 0;
		this.cells_by_radius = new Array(this.grid_size + 1);
		
		for (let i = 0; i < this.grid_size + 1; i++)
		{
			this.pattern_rows[i] = new Array(this.grid_size + 1);
			this.pattern_cols[i] = new Array(this.grid_size + 1);
			
			for (let j = 0; j < this.grid_size + 1; j++)
			{
				this.pattern_rows[i][j] = 0;
				this.pattern_cols[i][j] = 0;
			}
		}
		
		for (let i = 0; i < this.grid_size; i++)
		{
			this.regions[i] = new Array(this.grid_size);
			
			for (let j = 0; j < this.grid_size; j++)
			{
				this.regions[i][j] = -1;
			}
		}
		
		for (let i = 0; i < this.grid_size + 1; i++)
		{
			this.cells_by_radius[i] = [];
		}
		
		
		
		const middle_row = Math.floor(this.grid_size / 2);
		
		for (let i = 0; i < this.grid_size; i++)
		{
			for (let j = 0; j < this.grid_size; j++)
			{
				this.cells_by_radius[Math.abs(i - middle_row) + Math.abs(j - middle_row)].push([i, j]);
			}
		}
		
		
		
		//Place the rows.
		for (let i = 0; i < this.grid_size + 1; i++)
		{
			const offset = Math.random() < this.row_prob ? 1 : 0;
			
			for (let j = offset; j < this.grid_size; j += 2)
			{
				this.pattern_rows[i][j] = 1;
			}
		}
		
		
		
		//Place the columns.
		for (let i = 0; i < this.grid_size + 1; i++)
		{
			const offset = Math.random() < this.col_prob ? 1 : 0;
			
			for (let j = offset; j < this.grid_size; j += 2)
			{
				this.pattern_cols[j][i] = 1;
			}
		}
		
		
		
		if (this.maximum_speed)
		{
			if (this.do_draw_boundaries)
			{
				this.draw_boundaries();
			}
			
			if (this.do_draw_regions)
			{
				this.identify_regions();
				
				this.draw_regions();
			}
		}
		
		
		
		else
		{
			if (this.do_draw_boundaries)
			{
				this.current_row = 1;
				this.current_col = 1;
				
				this.draw_boundary_row_step();
			}
			
			else if (this.do_draw_regions)
			{
				this.identify_regions();
				
				this.current_region = 0;
				
				this.draw_regions_step();
			}
		}
	}
	
	
	
	draw_boundaries()
	{
		//We don't include things on the boundary, since they don't play nice with the lines already drawn there.
		for (let i = 1; i < this.grid_size; i++)
		{
			for (let j = 0; j < this.grid_size; j++)
			{
				if (this.pattern_rows[i][j])
				{			
					this.wilson.ctx.beginPath();
					this.wilson.ctx.moveTo((this.resolution / this.grid_size) * j, (this.resolution / this.grid_size) * i);
					this.wilson.ctx.lineTo((this.resolution / this.grid_size) * (j + 1), (this.resolution / this.grid_size) * i);
					this.wilson.ctx.stroke();
				}
			}
		}
		
		
		
		for (let i = 0; i < this.grid_size; i++)
		{
			for (let j = 1; j < this.grid_size; j++)
			{
				if (this.pattern_cols[i][j])
				{			
					this.wilson.ctx.beginPath();
					this.wilson.ctx.moveTo((this.resolution / this.grid_size) * j, (this.resolution / this.grid_size) * i);
					this.wilson.ctx.lineTo((this.resolution / this.grid_size) * j, (this.resolution / this.grid_size) * (i + 1));
					this.wilson.ctx.stroke();
				}
			}
		}
	}
	
	
	
	draw_boundary_row_step()
	{
		for (let j = 0; j < this.grid_size; j++)
		{
			if (this.pattern_rows[this.current_row][j])
			{			
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo((this.resolution / this.grid_size) * j, (this.resolution / this.grid_size) * this.current_row);
				this.wilson.ctx.lineTo((this.resolution / this.grid_size) * (j + 1), (this.resolution / this.grid_size) * this.current_row);
				this.wilson.ctx.stroke();
			}
		}
		
		this.current_row++;
		
		if (this.current_row < this.grid_size)
		{
			window.requestAnimationFrame(this.draw_boundary_row_step.bind(this));
		}
		
		else
		{
			window.requestAnimationFrame(this.draw_boundary_col_step.bind(this));
		}
		
	}
	
	draw_boundary_col_step()
	{
		for (let i = 0; i < this.grid_size; i++)
		{
			if (this.pattern_cols[i][this.current_col])
			{			
				this.wilson.ctx.beginPath();
				this.wilson.ctx.moveTo((this.resolution / this.grid_size) * this.current_col, (this.resolution / this.grid_size) * i);
				this.wilson.ctx.lineTo((this.resolution / this.grid_size) * this.current_col, (this.resolution / this.grid_size) * (i + 1));
				this.wilson.ctx.stroke();
			}
		}
		
		this.current_col++;
		
		if (this.current_col < this.grid_size)
		{
			window.requestAnimationFrame(this.draw_boundary_col_step.bind(this));
		}
		
		else if (this.do_draw_regions)
		{
			this.identify_regions();
			
			this.current_region = 0;
			
			setTimeout(this.draw_regions_step.bind(this), 1000);
		}
	}
	
	
	
	identify_regions()
	{
		//This is kind of a mess, but we're just going to floodfill one region at a time and just use constant colors that range from red in the top left to magenta in the bottom right. That's the goal at least.
		
		let start_row = 0;
		let start_col = 0;
		
		while (true)
		{
			let active_squares = [[start_row, start_col]];
			
			this.regions[start_row][start_col] = this.num_regions;
			
			this.regions_ordered.push([[start_row, start_col]]);
			
			
			
			while (active_squares.length !== 0)
			{
				let num_active_squares = active_squares.length;
				
				for (let i = 0; i < num_active_squares; i++)
				{
					const row = active_squares[i][0];
					const col = active_squares[i][1];
					
					if (row > 0 && this.regions[row - 1][col] === -1 && !(this.pattern_rows[row][col]))
					{
						active_squares.push([row - 1, col]);
						
						this.regions[row - 1][col] = this.num_regions;
						
						this.regions_ordered[this.num_regions].push([row - 1, col]);
					}
					
					if (row < this.grid_size - 1 && this.regions[row + 1][col] === -1 && !(this.pattern_rows[row + 1][col]))
					{
						active_squares.push([row + 1, col]);
						
						this.regions[row + 1][col] = this.num_regions;
						
						this.regions_ordered[this.num_regions].push([row + 1, col]);
					}
					
					if (col > 0 && this.regions[row][col - 1] === -1 && !(this.pattern_cols[row][col]))
					{
						active_squares.push([row, col - 1]);
						
						this.regions[row][col - 1] = this.num_regions;
						
						this.regions_ordered[this.num_regions].push([row, col - 1]);
					}
					
					if (col < this.grid_size - 1 && this.regions[row][col + 1] === -1 && !(this.pattern_cols[row][col + 1]))
					{
						active_squares.push([row, col + 1]);
						
						this.regions[row][col + 1] = this.num_regions;
						
						this.regions_ordered[this.num_regions].push([row, col + 1]);
					}
				}
				
				active_squares.splice(0, num_active_squares);
			}
			
			
			
			this.region_sizes.push(this.regions_ordered[this.num_regions].length);
			
			
			
			//Now search radially outward from the center for the next starting square.
			
			let found_new_start = false;
			
			for (let radius = 0; radius <= this.grid_size; radius++)
			{
				for (let i = 0; i < this.cells_by_radius[radius].length; i++)
				{
					const row = this.cells_by_radius[radius][i][0];
					const col = this.cells_by_radius[radius][i][1];
					
					if (this.regions[row][col] === -1)
					{
						start_row = row;
						start_col = col;
						
						found_new_start = true;
						
						break;
					}
				}
				
				if (found_new_start)
				{
					break;
				}
			}
			
			this.num_regions++;
			
			if (!found_new_start)
			{
				break;
			}
		}
		
		
		
		//Get unique values.
		this.region_sizes = [...new Set(this.region_sizes)];
		
		//Sort descending.
		this.region_sizes.sort((a, b) => b - a);
		
		this.num_unique_region_sizes = this.region_sizes.length;
	}
	
	
	
	draw_regions()
	{
		this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
		
		
		
		for (let i = 0; i < this.num_regions; i++)
		{
			const region_length = this.regions_ordered[i].length;
			
			//Cycle colors every 2 * grid_size regions (this is just an experimentally good value).
			const h = (i % (2 * this.grid_size)) / (2 * this.grid_size);
			
			//Color the largest regions darkest, but linearly according to the list of lengths, so that all the medium regions aren't extremely bright when there's a very large region.
			const v = region_length === 1 ? .5 : Math.sqrt(this.region_sizes.indexOf(region_length) / (this.num_unique_region_sizes - 2));
			
			const rgb = this.wilson.utils.hsv_to_rgb(h, 1, v);
			
			this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			
			
			for (let j = 0; j < region_length; j++)
			{
				const row = this.regions_ordered[i][j][0];
				const col = this.regions_ordered[i][j][1];
				
				this.wilson.ctx.fillRect((this.resolution / this.grid_size) * col + this.line_width / 2, (this.resolution / this.grid_size) * row + this.line_width / 2, this.resolution / this.grid_size - this.line_width, this.resolution / this.grid_size - this.line_width);
			}
		}
	}
	
	
	
	draw_regions_step()
	{
		for (let i = 0; i < Math.ceil(this.grid_size / 50); i++)
		{
			const region_length = this.regions_ordered[this.current_region].length;
			
			//Cycle colors every grid_size regions (this is just an experimentally good value).
			const h = (this.current_region % (2 * this.grid_size)) / (2 * this.grid_size);
			
			//Color the largest regions darkest, but linearly according to the list of lengths, so that all the medium regions aren't extremely bright when there's a very large region.
			const v = region_length === 1 ? .5 : Math.sqrt(this.region_sizes.indexOf(region_length) / (this.num_unique_region_sizes - 2));
			
			const rgb = this.wilson.utils.hsv_to_rgb(h, 1, v);
			
			
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			
			for (let j = 0; j < region_length; j++)
			{
				const row = this.regions_ordered[this.current_region][j][0];
				const col = this.regions_ordered[this.current_region][j][1];
				
				this.wilson.ctx.fillRect((this.resolution / this.grid_size) * col, (this.resolution / this.grid_size) * row, this.resolution / this.grid_size, this.resolution / this.grid_size);
			}
			
			
			this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			for (let j = 0; j < region_length; j++)
			{
				const row = this.regions_ordered[this.current_region][j][0];
				const col = this.regions_ordered[this.current_region][j][1];
				
				this.wilson.ctx.fillRect((this.resolution / this.grid_size) * col + this.line_width / 2, (this.resolution / this.grid_size) * row + this.line_width / 2, this.resolution / this.grid_size - this.line_width, this.resolution / this.grid_size - this.line_width);
			}
			
			
			
			this.current_region++;
			
			if (this.current_region === this.num_regions)
			{
				return;
			}
		}
		
		if (this.current_region < this.num_regions)
		{
			window.requestAnimationFrame(this.draw_regions_step.bind(this));
		}
	}
}