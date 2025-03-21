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
				: `${this.files.length} files`;

			if (!this.disabled)
			{
				this.onInput(this.files);
			}
		});
	}
}