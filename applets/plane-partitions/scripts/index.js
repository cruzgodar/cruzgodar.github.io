"use strict";

!async function()
{
	await Site.load_applet("plane-partitions");
	
	const applet = new PlanePartitions(Page.element.querySelector("#output-canvas"), Page.element.querySelector("#numbers-canvas"));
	
	applet.load_promise.then(async () =>
	{
		const plane_partition = applet.generate_random_plane_partition();
		array_data_textarea_element.value = applet.array_to_ascii(plane_partition);
		await applet.add_new_array(0, plane_partition);
	});
	
	const section_names = ["view-controls", "add-array", "edit-array", "remove-array", "algorithms"];
	
	const section_elements = 
	{
		"view-controls": Page.element.querySelectorAll(".view-controls-section"),
		"add-array": Page.element.querySelectorAll(".add-array-section"),
		"edit-array": Page.element.querySelectorAll(".edit-array-section"),
		"remove-array": Page.element.querySelectorAll(".remove-array-section"),
		"algorithms": Page.element.querySelectorAll(".algorithms-section"),
		"examples": Page.element.querySelectorAll(".examples-section")
	}
	
	const category_holder_element = Page.element.querySelector("#category-holder");
	const canvas_landscape_left_element = Page.element.querySelector("#canvas-landscape-left");
	
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
	
	
	
	Page.Load.TextButtons.equalize();
	setTimeout(Page.Load.TextButtons.equalize, 10);
	
	
	
	if (Page.Layout.aspect_ratio > 1)
	{
		Page.Layout.AppletColumns.equalize();
	}
	
	
	
	const category_selector_dropdown_element = Page.element.querySelector("#category-selector-dropdown");
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	const show_dimers_button_element = Page.element.querySelector("#show-dimers-button");
	
	const switch_view_button_element = Page.element.querySelector("#switch-view-button");
	
	const maximum_speed_checkbox_element = Page.element.querySelector("#maximum-speed-checkbox");
	
	const array_data_textarea_element = Page.element.querySelector("#array-data-textarea");
	
	const add_array_button_element = Page.element.querySelector("#add-array-button");
	
	const edit_array_textarea_element = Page.element.querySelector("#edit-array-textarea");
		
	const edit_array_index_input_element = Page.element.querySelector("#edit-array-index-input");
	
	const edit_array_button_element = Page.element.querySelector("#edit-array-button");
	
	const remove_array_index_input_element = Page.element.querySelector("#remove-array-index-input");
	
	const remove_array_button_element = Page.element.querySelector("#remove-array-button");
	
	const algorithm_index_input_element = Page.element.querySelector("#algorithm-index-input");
	
	const hillman_grassl_button_element = Page.element.querySelector("#hillman-grassl-button");
	
	const hillman_grassl_inverse_button_element = Page.element.querySelector("#hillman-grassl-inverse-button");
	
	const pak_button_element = Page.element.querySelector("#pak-button");
	
	const pak_inverse_button_element = Page.element.querySelector("#pak-inverse-button");
	
	const sulzgruber_button_element = Page.element.querySelector("#sulzgruber-button");
	
	const sulzgruber_inverse_button_element = Page.element.querySelector("#sulzgruber-inverse-button");
	
	const rsk_button_element = Page.element.querySelector("#rsk-button");
	
	const rsk_inverse_button_element = Page.element.querySelector("#rsk-inverse-button");
	
	const example_1_button_element = Page.element.querySelector("#example-1-button");
	
	const example_2_button_element = Page.element.querySelector("#example-2-button");
	
	const example_3_button_element = Page.element.querySelector("#example-3-button");
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	
	
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
		
			if (index < applet.arrays.length && index >= 0)
			{
				edit_array_textarea_element.value = applet.array_to_ascii(applet.arrays[index].numbers);
			}
		}
		
		section_elements[visible_section].forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time))
	});
	
	
	
	resolution_input_element.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolution_input_element.value || 2000);
		
		applet.renderer.setSize(applet.resolution, applet.resolution, false);
	});
	
	
	
	show_dimers_button_element.addEventListener("click", () =>
	{
		if (applet.dimers_shown)
		{
			applet.hide_dimers();
		}
		
		else
		{
			applet.show_dimers();
		}
	});
	
	
	
	switch_view_button_element.addEventListener("click", () =>
	{
		if (applet.in_2d_view)
		{
			applet.show_hex_view();
		}
		
		else
		{
			applet.show_2d_view();
		}
	});
	
	
	
	maximum_speed_checkbox_element.addEventListener("input", () =>
	{
		applet.animation_time = maximum_speed_checkbox_element.checked ? 60 : 600;
	});
	
	
	
	add_array_button_element.addEventListener("click", () =>
	{
		applet.add_new_array(applet.arrays.length, applet.parse_array(array_data_textarea_element.value));
	});
	
	
	
	edit_array_index_input_element.addEventListener("input", () =>
	{
		const index = parseInt(edit_array_index_input_element.value || 0);
		
		if (index >= applet.arrays.length || index < 0)
		{
			return;
		}
		
		applet.edit_array_textarea_element.value = applet.array_to_ascii(applet.arrays[index].numbers);
	});
	
	
	
	edit_array_button_element.addEventListener("click", async () =>
	{
		const index = parseInt(edit_array_index_input_element.value || 0);
		
		await applet.edit_array(index, applet.parse_array(edit_array_textarea_element.value));
		
		edit_array_textarea_element.value = applet.array_to_ascii(applet.arrays[index].numbers);
	});
	
	
	
	remove_array_button_element.addEventListener("click", () =>
	{
		applet.remove_array(parseInt(remove_array_index_input_element.value));
	});
	
	
	
	hillman_grassl_button_element.addEventListener("click", () => applet.run_algorithm("hillman_grassl", parseInt(algorithm_index_input_element.value)));
	
	hillman_grassl_inverse_button_element.addEventListener("click", () => applet.run_algorithm("hillman_grassl_inverse", parseInt(algorithm_index_input_element.value)));
	
	pak_button_element.addEventListener("click", () => applet.run_algorithm("pak", parseInt(algorithm_index_input_element.value)));
	
	pak_inverse_button_element.addEventListener("click", () => applet.run_algorithm("pak_inverse", parseInt(algorithm_index_input_element.value)));
	
	sulzgruber_button_element.addEventListener("click", () => applet.run_algorithm("sulzgruber", parseInt(algorithm_index_input_element.value)));
	
	sulzgruber_inverse_button_element.addEventListener("click", () => applet.run_algorithm("sulzgruber_inverse", parseInt(algorithm_index_input_element.value)));
	
	rsk_button_element.addEventListener("click", () => applet.run_algorithm("rsk", parseInt(algorithm_index_input_element.value)));
	
	rsk_inverse_button_element.addEventListener("click", () => applet.run_algorithm("rsk_inverse", parseInt(algorithm_index_input_element.value)));
	
	example_1_button_element.addEventListener("click", () => applet.run_example(1));
	
	example_2_button_element.addEventListener("click", () => applet.run_example(2));
	
	example_3_button_element.addEventListener("click", () => applet.run_example(3));
	
	download_button_element.addEventListener("click", () => applet.need_download = true);
	
	
	
	Page.show();
}()