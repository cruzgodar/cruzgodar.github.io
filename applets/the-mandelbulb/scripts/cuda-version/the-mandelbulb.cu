#include "lodepng.h"
#include <iostream>
#include <cmath>



__device__ float distance_estimator(float* pos, float cx, float cy, float cz, float* color)
{
	float z[3] = {pos[0], pos[1], pos[2]};
	
	float r = sqrtf(z[0]*z[0] + z[1]*z[1] + z[2]*z[2]);;
	float dr = 1.0f;
	
	color[0] = 1.0f;
	color[1] = 1.0f;
	color[2] = 1.0f;
	
	float color_scale = .5f;
	
	
	
	//32 max iterations.
	for (int i = 0; i < 32; i++)
	{
		if (r > 16.0f)
		{
			break;
		}
		
		float theta = 8.0 * acosf(z[2] / r);
		
		float phi = 8.0 * atan2f(z[1], z[0]);
		
		dr = powf(r, 7.0f) * 8.0f * dr + 1.0f;
		
		float factor = powf(r, 8.0f);
		
		z[0] = factor * cosf(phi) * sinf(theta) + cx;
		z[1] = factor * sinf(phi) * sinf(theta) + cy;
		z[2] = factor * cosf(theta) + cz;
		
		r = sqrtf(z[0]*z[0] + z[1]*z[1] + z[2]*z[2]);
		
		color[0] = (1.0f - color_scale) * color[0] + color_scale * fabsf(z[0] / r);
		color[1] = (1.0f - color_scale) * color[1] + color_scale * fabsf(z[1] / r);
		color[2] = (1.0f - color_scale) * color[2] + color_scale * fabsf(z[2] / r);
		
		color_scale *= .5f;
	}
	
	
	
	float max_color_component = fmaxf(fmaxf(color[0], color[1]), color[2]);
	
	color[0] /= max_color_component;
	color[1] /= max_color_component;
	color[2] /= max_color_component;
	
	return .5f * logf(r) * r / dr;
}



__device__
void raymarch(float x, float y, float cx, float cy, float cz, float* color, float image_size)
{
	//The center of the image plane is (.052368, 1.588541, 1.400874), the right vector is (-.380503, .019914, 0), and the up vector is (-.012847, -.245477, .291128).
	
	float start_pos[3] = {.052368f - .380503f * x - .012847f * y, 1.588541f + .019914f * x - .245477f * y, 1.400874f + .291128f * y};
	
	
	
	//The camera pos is (.0828, 2.17, 1.8925).
	float ray_direction_vec_source[3] = {start_pos[0] - .0828f, start_pos[1] - 2.17f, start_pos[2] - 1.8925f};
	
	float magnitude = sqrtf(ray_direction_vec_source[0]*ray_direction_vec_source[0] + ray_direction_vec_source[1]*ray_direction_vec_source[1] + ray_direction_vec_source[2]*ray_direction_vec_source[2]);
	
	ray_direction_vec_source[0] /= magnitude;
	ray_direction_vec_source[1] /= magnitude;
	ray_direction_vec_source[2] /= magnitude;
	
	float ray_direction_vec[3] = {ray_direction_vec_source[0] * .9f, ray_direction_vec_source[1] * .9f, ray_direction_vec_source[2] * .9f};
	
	
	
	float garbage_color[3] = {0.0f, 0.0f, 0.0f};
	
	
	
	float epsilon = 0.0f;
	
	float t = 0.0f;
	
	float last_distance = 1000.0f;
	
	bool slowed_down = false;
	
	int iteration;
	
	
	
	//512 max marches.
	for (iteration = 0; iteration < 512; iteration++)
	{
		float pos[3] = {start_pos[0] + t * ray_direction_vec[0], start_pos[1] + t * ray_direction_vec[1], start_pos[2] + t * ray_direction_vec[2]};
		
		float distance = min(distance_estimator(pos, cx, cy, cz, color), last_distance);
		last_distance = distance;
		
		if (distance / image_size * 0.5f > epsilon)
		{
			epsilon = distance / image_size * 0.5f;
		}
		
		
		
		if (distance < epsilon)
		{
			//Compute shading.
			
			float pos_x[3] = {pos[0] + .000001f, pos[1], pos[2]};
			float pos_y[3] = {pos[0], pos[1] + .000001f, pos[2]};
			float pos_z[3] = {pos[0], pos[1], pos[2] + .000001f};
			
			float base = distance_estimator(pos, cx, cy, cz, garbage_color);
			
			float x_step = distance_estimator(pos_x, cx, cy, cz, garbage_color);
			float y_step = distance_estimator(pos_y, cx, cy, cz, garbage_color);
			float z_step = distance_estimator(pos_z, cx, cy, cz, garbage_color);
			
			float surface_normal[3] = {x_step - base, y_step - base, z_step - base};
			
			magnitude = sqrtf(surface_normal[0]*surface_normal[0] + surface_normal[1]*surface_normal[1] + surface_normal[2]*surface_normal[2]);
			
			surface_normal[0] /= magnitude;
			surface_normal[1] /= magnitude;
			surface_normal[2] /= magnitude;
			
			
			
			float light_direction[3] = {-pos[0], -pos[1], 5.0f - pos[2]};
			
			magnitude = sqrtf(light_direction[0]*light_direction[0] + light_direction[1]*light_direction[1] + light_direction[2]*light_direction[2]);
			
			light_direction[0] /= magnitude;
			light_direction[1] /= magnitude;
			light_direction[2] /= magnitude;
			
			
			
			float dot_product = surface_normal[0]*light_direction[0] + surface_normal[1]*light_direction[1] + surface_normal[2]*light_direction[2];
			
			float light_scale = 2.0f * fmaxf(dot_product, -.25f * dot_product) * fmaxf(1.0f - iteration / 512.0f, 0.0f);
			
			
			
			float distance_from_camera = sqrtf((pos[0] - .0828f)*(pos[0] - .0828f) + (pos[1] - 2.17f)*(pos[1] - 2.17f) + (pos[2] - 1.8925f)*(pos[2] - 1.8925f));
			
			float fog_scale = exp(-distance_from_camera * .2f);
			
			
			
			color[0] = color[0] * light_scale * fog_scale;
			color[1] = color[1] * light_scale * fog_scale;
			color[2] = color[2] * light_scale * fog_scale;
			
			break;
		}
		
		
		
		else if (last_distance / distance > .9999f && !slowed_down)
		{
			ray_direction_vec[0] = ray_direction_vec_source[0] * .125f;
			ray_direction_vec[1] = ray_direction_vec_source[1] * .125f;
			ray_direction_vec[2] = ray_direction_vec_source[2] * .125f;
			
			slowed_down = true;
		}
		
		else if (last_distance / distance <= .9999f && slowed_down)
		{
			ray_direction_vec[0] = ray_direction_vec_source[0] * .9f;
			ray_direction_vec[1] = ray_direction_vec_source[1] * .9f;
			ray_direction_vec[2] = ray_direction_vec_source[2] * .9f;
			
			slowed_down = false;
		}
		
		
		
		//Clip distance
		else if (t > 100.0)
		{
			color[0] = 0.0f;
			color[1] = 0.0f;
			color[2] = 0.0f;
			
			break;
		}
		
		
		
		t += distance;
	}
	
	
	
	if (iteration == 512)
	{
		color[0] = 0.0f;
		color[1] = 0.0f;
		color[2] = 0.0f;
	}
}



__global__
void generate_mandelbulb(unsigned char* image, int sector_row, int sector_col, float cx, float cy, float cz, int image_size)
{
	float color[3];
	float total_color[3] = {0.0, 0.0, 0.0};
	
	int index = 4 * (256 * blockIdx.x + threadIdx.x);
	
	
	
	//Why yes, that 255 is disturbing. No, I don't have any idea why it doesn't make a gap.
	
	float y = 1.0f - 2.0f * (float) (255 * sector_row + blockIdx.x) / (float) image_size;
	
	float x = 2.0f * (float) (255 * sector_col + threadIdx.x) / (float) image_size - 1.0f;
	
	float step = .5f / (float) image_size;
	
	
	
	raymarch(x - step, y - step, cx, cy, cz, color, (float) image_size);
	
	total_color[0] += color[0];
	total_color[1] += color[1];
	total_color[2] += color[2];
	
	
	
	raymarch(x + step, y - step, cx, cy, cz, color, (float) image_size);
	
	total_color[0] += color[0];
	total_color[1] += color[1];
	total_color[2] += color[2];
	
	
	
	raymarch(x - step, y + step, cx, cy, cz, color, (float) image_size);
	
	total_color[0] += color[0];
	total_color[1] += color[1];
	total_color[2] += color[2];
	
	
	
	raymarch(x + step, y + step, cx, cy, cz, color, (float) image_size);
	
	total_color[0] += color[0];
	total_color[1] += color[1];
	total_color[2] += color[2];
	
	
	
	image[index] = min(total_color[0] / 4.0f * 255.0f, 255.0f);
	image[index + 1] = min(total_color[1] / 4.0f * 255.0f, 255.0f);
	image[index + 2] = min(total_color[2] / 4.0f * 255.0f, 255.0f);
	image[index + 3] = 255;
}



void encode_image(const char* filename, std::vector<unsigned char>& image, unsigned width, unsigned height)
{
	//Encode the image.
	unsigned error = lodepng::encode(filename, image, width, height);

	//If there's an error, display it.
	if(error) std::cout << "encoder error " << error << ": "<< lodepng_error_text(error) << std::endl;
}



int main(void)
{
	int image_size;
	
	int starting_frame;
	
	
	
	std::cout << "Image size: 2^";
	std::cin >> image_size;
	
	image_size = pow(2, image_size);
	
	std::cout << "Starting frame: ";
	std::cin >> starting_frame;
	
	
	
	float cx, cy, cz;
	
	unsigned char* d_image;
	
	char filename[9] = "0000.png";
	
	cudaMallocManaged(&d_image, 4 * 256 * 256 * sizeof(unsigned char));
	
	int num_sectors = image_size / 256;
	
	std::vector<unsigned char> image_vector;
	image_vector.resize((image_size + num_sectors) * (image_size + num_sectors) * 4);
	
	for (int i = 0; i < (image_size + num_sectors) * (image_size + num_sectors); i++)
	{
		image_vector[4 * i] = 0;
		image_vector[4 * i + 1] = 0;
		image_vector[4 * i + 2] = 0;
		image_vector[4 * i + 3] = 255;
	}
	
	
	
	filename[3] = (starting_frame % 10) + 48;
	filename[2] = ((starting_frame / 10) % 10) + 48;
	filename[1] = ((starting_frame / 100) % 10) + 48;
	filename[0] = ((starting_frame / 1000) % 10) + 48;
	
	
	
	for (int frame = starting_frame; frame < 6000; frame++)
	{
		cx = .5f * (cosf(6.283185f * (float) frame / 6000.0f) + sinf(5.0f * 6.283185f * (float) frame / 6000.0f));
		cy = .5f * (cosf(2 * 6.283185f * (float) frame / 6000.0f) + sinf(7.0f * 6.283185f * (float) frame / 6000.0f));
		cz = .5f * (cosf(3 * 6.283185f * (float) frame / 6000.0f) + sinf(11.0f * 6.283185f * (float) frame / 6000.0f));
		
		for (int i = 0; i < num_sectors; i++)
		{
			for (int j = 0; j < num_sectors; j++)
			{
				std::cout << "Frame " << frame << ": sector " << num_sectors * i + j + 1 << " of " << num_sectors * num_sectors << std::endl;
				
				generate_mandelbulb<<<256, 256>>>(d_image, i, j, cx, cy, cz, image_size);
				
				cudaDeviceSynchronize();
				
				
				
				for (int k = 0; k < 256; k++)
				{
					for (int l = 0; l < 256; l++)
					{
						int big_index = 4 * ((image_size + num_sectors) * (256 * i + k) + (256 * j + l));
						int small_index = 4 * (256 * k + l);
						
						image_vector[big_index] = d_image[small_index];
						image_vector[big_index + 1] = d_image[small_index + 1];
						image_vector[big_index + 2] = d_image[small_index + 2];
						image_vector[big_index + 3] = 255;
					}
				}
			}
		}
		
		std::cout << std::endl;
		
		
		
		encode_image(filename, image_vector, image_size + num_sectors, image_size + num_sectors);
		
		
		
		filename[3]++;
		
		if (filename[3] == 58)
		{
			filename[3] = 48;
			
			filename[2]++;
			
			if (filename[2] == 58)
			{
				filename[2] = 48;
				
				filename[1]++;
				
				if (filename[1] == 58)
				{
					filename[1] = 48;
					
					filename[0]++;
				}
			}
		}
	}
	
	
	
	cudaFree(d_image);
	
	return 0;
}