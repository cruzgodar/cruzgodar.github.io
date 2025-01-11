export class InputElement
{
	element;
	name;
	disabled = false;

	constructor({ element, name })
	{
		this.element = element;
		this.name = name;
	}
}