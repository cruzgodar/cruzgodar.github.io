"use strict";

!async function()
{
	await Site.load_applet("plane-partitions");
	
	const applet = new PlanePartitions(Page.element.querySelector("#output-canvas"), Page.element.querySelector("#numbers-canvas"));
	
	applet.load_promise.then(() =>
	{
		applet.add_new_array(0, applet.generate_random_plane_partition());
	});
	
	Page.show();
}()
	/*
	



const section_names = ["view-controls", "add-array", "edit-array", "remove-array", "algorithms"];

const section_elements = 
{
	"view-controls": document.body.querySelectorAll(".view-controls-section"),
	"add-array": document.body.querySelectorAll(".add-array-section"),
	"edit-array": document.body.querySelectorAll(".edit-array-section"),
	"remove-array": document.body.querySelectorAll(".remove-array-section"),
	"algorithms": document.body.querySelectorAll(".algorithms-section"),
	"examples": document.body.querySelectorAll(".examples-section")
}

const category_holder_element = document.body.querySelector("#category-holder");
const canvas_landscape_left_element = document.body.querySelector("#canvas-landscape-left");

let visible_section = "view-controls";

section_names.forEach(section_name =>
{
	if (section_name !== visible_section)
	{
		section_elements[section_name].forEach(element =>
		{
			element.style.opacity = 0;
		});
	}	
});

section_elements[visible_section].forEach(element => canvas_landscape_left_element.appendChild(element));



if (APPLET_VERSION)
{
	Page.Load.TextButtons.equalize();
	setTimeout(Page.Load.TextButtons.equalize, 10);
}



if (Page.Layout.aspect_ratio > 1)
{
	Page.Layout.AppletColumns.equalize();
}



let category_selector_dropdown_element = document.body.querySelector("#category-selector-dropdown");

let resolution_input_element = document.body.querySelector("#resolution-input");

let show_dimers_button_element = document.body.querySelector("#show-dimers-button");

let switch_view_button_element = document.body.querySelector("#switch-view-button");

let maximum_speed_checkbox_element = document.body.querySelector("#maximum-speed-checkbox");

let array_data_textarea_element = document.body.querySelector("#array-data-textarea");

let add_array_button_element = document.body.querySelector("#add-array-button");

let edit_array_textarea_element = document.body.querySelector("#edit-array-textarea");
	
let edit_array_index_input_element = document.body.querySelector("#edit-array-index-input");

let edit_array_button_element = document.body.querySelector("#edit-array-button");

let remove_array_index_input_element = document.body.querySelector("#remove-array-index-input");

let remove_array_button_element = document.body.querySelector("#remove-array-button");

let algorithm_index_input_element = document.body.querySelector("#algorithm-index-input");

let hillman_grassl_button_element = document.body.querySelector("#hillman-grassl-button");

let hillman_grassl_inverse_button_element = document.body.querySelector("#hillman-grassl-inverse-button");

let pak_button_element = document.body.querySelector("#pak-button");

let pak_inverse_button_element = document.body.querySelector("#pak-inverse-button");

let sulzgruber_button_element = document.body.querySelector("#sulzgruber-button");

let sulzgruber_inverse_button_element = document.body.querySelector("#sulzgruber-inverse-button");

let rsk_button_element = document.body.querySelector("#rsk-button");

let rsk_inverse_button_element = document.body.querySelector("#rsk-inverse-button");

let godar_1_button_element = document.body.querySelector("#godar-1-button");

let godar_1_inverse_button_element = document.body.querySelector("#godar-1-inverse-button");

let example_1_button_element = document.body.querySelector("#example-1-button");

let example_2_button_element = document.body.querySelector("#example-2-button");

let example_3_button_element = document.body.querySelector("#example-3-button");

let need_download = false;

let download_button_element = document.body.querySelector("#download-button");



	category_selector_dropdown_element.addEventListener("input", async () =>
	{
		await Promise.all(Array.from(section_elements[visible_section]).map(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time)));
		
		section_elements[visible_section].forEach(element => category_holder_element.appendChild(element));
		
		section_elements[visible_section].forEach(element => element.classList.remove("move-to-left"));
		section_elements[visible_section].forEach(element => element.classList.remove("move-to-right"));
		
		visible_section = category_selector_dropdown_element.value;
		
		section_elements[visible_section].forEach(element => canvas_landscape_left_element.appendChild(element));
		
		Page.Load.TextButtons.equalize();
		setTimeout(Page.Load.TextButtons.equalize, 10);
		
		if (Page.Layout.aspect_ratio > 1)
		{
			Page.Layout.AppletColumns.equalize();
		}
		
		if (visible_section === "edit-array")
		{
			let index = parseInt(edit_array_index_input_element.value || 0);
		
			if (index < arrays.length && index >= 0)
			{
				edit_array_textarea_element.value = array_to_ascii(arrays[index].numbers);
			}
		}
		
		section_elements[visible_section].forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time))
	});
	
	
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 2000);
		
		renderer.setSize(resolution, resolution, false);
	});
	
	
	
	show_dimers_button_element.addEventListener("click", () =>
	{
		if (dimers_shown)
		{
			hide_dimers();
		}
		
		else
		{
			show_dimers();
		}
	});
	
	
	
	switch_view_button_element.addEventListener("click", () =>
	{
		if (in_2d_view)
		{
			show_hex_view();
		}
		
		else
		{
			show_2d_view();
		}
	});
	
	
	
	maximum_speed_checkbox_element.addEventListener("input", () =>
	{
		animation_time = maximum_speed_checkbox_element.checked ? 60 : 600;
	});
	
	
	
	array_data_textarea_element.value = generate_random_plane_partition();
	
	
	
	add_array_button_element.addEventListener("click", () =>
	{
		add_new_array(arrays.length, parse_array(array_data_textarea_element.value));
	});
	
	
	
	edit_array_index_input_element.addEventListener("input", () =>
	{
		let index = parseInt(edit_array_index_input_element.value || 0);
		
		if (index >= arrays.length || index < 0)
		{
			return;
		}
		
		edit_array_textarea_element.value = array_to_ascii(arrays[index].numbers);
	});
	
	
	
	edit_array_button_element.addEventListener("click", edit_array);
	
	
	
	remove_array_button_element.addEventListener("click", () =>
	{
		remove_array(parseInt(remove_array_index_input_element.value));
	});
	
	
	
	hillman_grassl_button_element.addEventListener("click", () => run_algorithm("hillman_grassl"));
	
	hillman_grassl_inverse_button_element.addEventListener("click", () => run_algorithm("hillman_grassl_inverse"));
	
	pak_button_element.addEventListener("click", () => run_algorithm("pak"));
	
	pak_inverse_button_element.addEventListener("click", () => run_algorithm("pak_inverse"));
	
	sulzgruber_button_element.addEventListener("click", () => run_algorithm("sulzgruber"));
	
	sulzgruber_inverse_button_element.addEventListener("click", () => run_algorithm("sulzgruber_inverse"));
	
	rsk_button_element.addEventListener("click", () => run_algorithm("rsk"));
	
	rsk_inverse_button_element.addEventListener("click", () => run_algorithm("rsk_inverse"));
	
	godar_1_button_element.addEventListener("click", () => run_algorithm("godar_1"));
	
	godar_1_inverse_button_element.addEventListener("click", () => run_algorithm("godar_1_inverse"));
	
	example_1_button_element.addEventListener("click", () => run_example(1));
	
	example_2_button_element.addEventListener("click", () => run_example(2));
	
	example_3_button_element.addEventListener("click", () => run_example(3));
	
	
	
	download_button_element.addEventListener("click", () =>
	{
		need_download = true;
	});
*/