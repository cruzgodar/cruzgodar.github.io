"use strict";

class DominoShuffling extends Applet
{
	resolution = 2000;
	diamond_size = 20;
	
	use_smooth_colors = true;
	
	//As a fraction of domino size
	margin_size = .05;
	
	aztec_diamond = [];
	new_diamond = [];
	
	hue = [];
	new_hue = [];
	
	age = [];
	new_age = [];
	
	current_diamond_size = 1;
	frame = 0;
	frames_per_animation_step = 1;
	draw_diamond_with_holes = true;
	
	last_timestamp = -1;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const options =
		{
			renderer: "cpu",
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(this.canvas, options);
	}
	
	
	
	run(resolution, diamond_size, use_smooth_colors)
	{
		this.resolution = resolution;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.diamond_size = diamond_size;
		
		this.frames_per_animation_step = Math.ceil(100 / this.diamond_size);
		
		if (this.diamond_size > 30)
		{
			this.draw_diamond_with_holes = false;
		}
		
		else
		{
			this.draw_diamond_with_holes = true;
		}
		
		this.use_smooth_colors = use_smooth_colors;
		
		
		
		this.aztec_diamond = new Array(this.diamond_size * 2);
		this.new_diamond = new Array(this.diamond_size * 2);
		
		this.age = new Array(this.diamond_size * 2);
		this.new_age = new Array(this.diamond_size * 2);
		
		this.hue = new Array(this.diamond_size * 2);
		this.new_hue = new Array(this.diamond_size * 2);
		
		for (let i = 0; i < this.diamond_size * 2; i++)
		{
			this.aztec_diamond[i] = new Array(this.diamond_size * 2);
			this.new_diamond[i] = new Array(this.diamond_size * 2);
			
			this.age[i] = new Array(this.diamond_size * 2);
			this.new_age[i] = new Array(this.diamond_size * 2);
			
			this.hue[i] = new Array(this.diamond_size * 2);
			this.new_hue[i] = new Array(this.diamond_size * 2);
			
			for (let j = 0; j < this.diamond_size * 2; j++)
			{
				this.aztec_diamond[i][j] = 0;
				this.age[i][j] = 0;
				this.hue[i][j] = 0;
			}
		}
		
		//Initialize the size 1 diamond.
		if (Math.random() < .5)
		{
			//Horizontal
			this.aztec_diamond[this.diamond_size - 1][this.diamond_size - 1] = -1;
			this.aztec_diamond[this.diamond_size][this.diamond_size - 1] = 1;
			
			this.age[this.diamond_size - 1][this.diamond_size - 1] = 1;
			this.age[this.diamond_size][this.diamond_size - 1] = 1;
			
			if (this.use_smooth_colors)
			{
				this.hue[this.diamond_size - 1][this.diamond_size - 1] = .75 - Math.atan2(-.5, -.5) / (2 * Math.PI);
				this.hue[this.diamond_size][this.diamond_size - 1] = .75 - Math.atan2(.5, -.5) / (2 * Math.PI);
			}
			
			else
			{
				this.hue[this.diamond_size - 1][this.diamond_size - 1] = 0;
				this.hue[this.diamond_size][this.diamond_size - 1] = .5;
			}
		}
		
		else
		{
			//Vertical
			this.aztec_diamond[this.diamond_size - 1][this.diamond_size - 1] = -2;
			this.aztec_diamond[this.diamond_size - 1][this.diamond_size] = 2;
			
			this.age[this.diamond_size - 1][this.diamond_size - 1] = 1;
			this.age[this.diamond_size - 1][this.diamond_size] = 1;
			
			if (this.use_smooth_colors)
			{
				this.hue[this.diamond_size - 1][this.diamond_size - 1] = .75 - Math.atan2(-.5, -.5) / (2 * Math.PI);
				this.hue[this.diamond_size - 1][this.diamond_size] = .75 - Math.atan2(-.5, .5) / (2 * Math.PI);
			}
			
			else
			{
				this.hue[this.diamond_size - 1][this.diamond_size - 1] = .25;
				this.hue[this.diamond_size - 1][this.diamond_size] = .75;
			}
		}
		
		
		
		this.current_diamond_size = 1;
		
		this.frame = this.frames_per_animation_step - 1;
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	draw_frame(timestamp)
	{
		const time_elapsed = timestamp - this.last_timestamp;
		
		this.last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		this.frame++;
		
		if (this.frame === this.frames_per_animation_step)
		{
			this.frame = 0;
			
			this.move_dominos();
			
			this.fill_spaces();
			
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
			
			this.draw_diamond();
		}
		
		
			
		if (this.animation_paused)
		{
			return;
		}
		
		
		
		if (this.frame === 0 && this.current_diamond_size === this.diamond_size - 1)
		{
			this.wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			this.wilson.ctx.fillRect(0, 0, this.resolution, this.resolution);
			
			this.draw_diamond();
			
			return;
		}
		
		else
		{
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	draw_diamond()
	{
		for (let i = -this.current_diamond_size; i < this.current_diamond_size; i++)
		{
			for (let j = -this.current_diamond_size; j < this.current_diamond_size; j++)
			{
				const row = i + this.diamond_size;
				const col = j + this.diamond_size;
				
				if (this.aztec_diamond[row][col] !== 0)
				{
					if (Math.abs(this.aztec_diamond[row][col]) === 1)
					{
						this.draw_domino(row, col, true);
					}
					
					else
					{
						this.draw_domino(row, col, false);
					}
				}
			}
		}
	}
	
	
	
	draw_domino(row, col, is_horizontal)
	{
		const h = this.hue[row][col];
		
		const s = 1 - .8 * Math.pow((this.age[row][col] - 1) / this.current_diamond_size, 4);
		
		const rgb = this.wilson.utils.hsv_to_rgb(h, s, 1);
		
		this.wilson.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		const x = this.resolution * (.1 + (col + this.margin_size) / (this.diamond_size * 2) * .8);
		const y = this.resolution * (.1 + (row + this.margin_size) / (this.diamond_size * 2) * .8);
		
		if (is_horizontal)
		{
			this.wilson.ctx.fillRect(x, y, this.resolution * (2 - 2 * this.margin_size) / (this.diamond_size * 2) * .8, this.resolution * (1 - 2 * this.margin_size) / (this.diamond_size * 2) * .8);
		}
		
		else
		{
			this.wilson.ctx.fillRect(x, y, this.resolution * (1 - 2 * this.margin_size) / (this.diamond_size * 2) * .8, this.resolution * (2 - 2 * this.margin_size) / (this.diamond_size * 2) * .8);
		}
	}
	
	
	
	move_dominos()
	{
		for (let i = 0; i < this.diamond_size * 2; i++)
		{
			for (let j = 0; j < this.diamond_size * 2; j++)
			{
				this.new_diamond[i][j] = 0;
				this.new_age[i][j] = 0;
				this.new_hue[i][j] = 0;
			}
		}
		
		
		
		//First deal with cancellations.
		for (let i = 0; i < 2 * this.diamond_size; i++)
		{
			for (let j = 0; j < 2 * this.diamond_size; j++)
			{
				if (this.aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(this.aztec_diamond[i][j]) === 1)
					{
						//If there's something there already, delete it.
						if (this.aztec_diamond[i + this.aztec_diamond[i][j]][j] === -this.aztec_diamond[i][j])
						{
							this.aztec_diamond[i + this.aztec_diamond[i][j]][j] = 0;
							this.aztec_diamond[i][j] = 0;
						}
					}
					
					else
					{
						//If there's something there already, delete it.
						if (this.aztec_diamond[i][j + Math.sign(this.aztec_diamond[i][j])] === -this.aztec_diamond[i][j])
						{
							this.aztec_diamond[i][j + Math.sign(this.aztec_diamond[i][j])] = 0;
							this.aztec_diamond[i][j] = 0;
						}
					}
				}
			}
		}
		
		
		
		//Now it's safe to move the dominos that can move.
		for (let i = 0; i < 2 * this.diamond_size; i++)
		{
			for (let j = 0; j < 2 * this.diamond_size; j++)
			{
				if (this.aztec_diamond[i][j] !== 0)
				{
					if (Math.abs(this.aztec_diamond[i][j]) === 1)
					{
						this.new_diamond[i + this.aztec_diamond[i][j]][j] = this.aztec_diamond[i][j];
						this.new_age[i + this.aztec_diamond[i][j]][j] = this.age[i][j];
						this.new_hue[i + this.aztec_diamond[i][j]][j] = this.hue[i][j];
					}
					
					else
					{
						this.new_diamond[i][j + Math.sign(this.aztec_diamond[i][j])] = this.aztec_diamond[i][j];
						this.new_age[i][j + Math.sign(this.aztec_diamond[i][j])] = this.age[i][j];
						this.new_hue[i][j + Math.sign(this.aztec_diamond[i][j])] = this.hue[i][j];
					}
				}
			}
		}
		
		
		
		
		for (let i = 0; i < this.diamond_size * 2; i++)
		{
			for (let j = 0; j < this.diamond_size * 2; j++)
			{
				this.aztec_diamond[i][j] = this.new_diamond[i][j];
				this.age[i][j] = this.new_age[i][j];
				this.hue[i][j] = this.new_hue[i][j];
			}
		}
		
		this.current_diamond_size++;
	}
		
	
	
	fill_spaces()
	{
		//Now the diamond has a bunch of 2x2 holes in it, and we need to fill them with two parallel dominos each.
		for (let i = -this.current_diamond_size; i < this.current_diamond_size; i++)
		{
			for (let j = -this.current_diamond_size; j < this.current_diamond_size; j++)
			{
				if (Math.abs(i + .5) + Math.abs(j + .5) <= this.current_diamond_size && Math.abs(i + 1.5) + Math.abs(j + .5) <= this.current_diamond_size && Math.abs(i + .5) + Math.abs(j + 1.5) <= this.current_diamond_size && Math.abs(i + 1.5) + Math.abs(j + 1.5) <= this.current_diamond_size)
				{
					const row = i + this.diamond_size;
					const col = j + this.diamond_size;
					
					//The extra checks are needed because we only record the top/bottom square of a domino.
					if (this.aztec_diamond[row][col] === 0 && this.aztec_diamond[row + 1][col] === 0 && this.aztec_diamond[row][col + 1] === 0 && this.aztec_diamond[row + 1][col + 1] === 0 && Math.abs(this.aztec_diamond[row - 1][col]) !== 2 && Math.abs(this.aztec_diamond[row - 1][col + 1]) !== 2 && Math.abs(this.aztec_diamond[row][col - 1]) !== 1 && Math.abs(this.aztec_diamond[row + 1][col - 1]) !== 1)
					{
						this.fill_space(row, col);
					}
				}
			}
		}
	}
	
	
	
	fill_space(row, col)
	{
		if (Math.random() < .5)
		{
			//Horizontal
			this.aztec_diamond[row][col] = -1;
			this.aztec_diamond[row + 1][col] = 1;
			
			this.age[row][col] = this.current_diamond_size;
			this.age[row + 1][col] = this.current_diamond_size;
			
			if (this.use_smooth_colors)
			{
				this.hue[row][col] = .75 - Math.atan2(row + .5 - this.diamond_size, col + .5 - this.diamond_size) / (2 * Math.PI);
				this.hue[row + 1][col] = .75 - Math.atan2(row + 1.5 - this.diamond_size, col + .5 - this.diamond_size) / (2 * Math.PI);
			}
			
			else
			{
				this.hue[row][col] = 0;
				this.hue[row + 1][col] = .5;
			}
		}
		
		else
		{
			//Vertical
			this.aztec_diamond[row][col] = -2;
			this.aztec_diamond[row][col + 1] = 2;
			
			this.age[row][col] = this.current_diamond_size;
			this.age[row][col + 1] = this.current_diamond_size;
			
			if (this.use_smooth_colors)
			{
				this.hue[row][col] = .75 - Math.atan2(row + .5 - this.diamond_size, col + .5 - this.diamond_size) / (2 * Math.PI);
				this.hue[row][col + 1] = .75 - Math.atan2(row + .5 - this.diamond_size, col + 1.5 - this.diamond_size) / (2 * Math.PI);
			}
			
			else
			{
				this.hue[row][col] = .25;
				this.hue[row][col + 1] = .75;
			}
		}
	}
}