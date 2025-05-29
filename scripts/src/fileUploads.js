import { InputElement } from "./inputElement.js";

export class FileUpload extends InputElement
{
	buttonElement;
	onInput;
	files;

	constructor({
		element,
		name,
		onInput = () => {},
	}) {
		super({ element, name });
		this.onInput = onInput;

		this.buttonElement = this.element.previousElementSibling;
		this.buttonElement.innerHTML = this.name
			+ " <span style=\"font-size: 12px; margin-right: -2px\">&#x25B2;</span>";

		this.buttonElement.addEventListener("click", () => this.element.click());

		this.element.addEventListener("change", async (e) =>
		{
			this.files = e.target.files;

			if (!this.files.length)
			{
				return;
			}

			this.buttonElement.innerHTML = this.files.length === 1
				? this.files[0].name
				: this.files.length === 2
					? `${this.files[0].name} and ${this.files[1].name}`
					: `${this.files[0].name} and ${this.files.length - 1} other files`;

			if (!this.disabled)
			{
				this.onInput(this.files);

				console.log(this.files);
			}
		});
	}

	async setFiles(urls)
	{
		const dataTransfer = new DataTransfer();

		for (const url of urls)
		{
			const response = await fetch(url);
			const blob = await response.blob();
			const file = new File([blob], url.split("/").pop(), { type: blob.type });
			dataTransfer.items.add(file);
		}

		this.files = dataTransfer.files;
	}
}