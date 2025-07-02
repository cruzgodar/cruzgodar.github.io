export class InputElement
{
	element;
	name;
	disabled = false;
	loaded;
	loadResolve;

	constructor({ element, name })
	{
		this.element = element;
		this.name = name;
		this.loaded = new Promise(resolve => this.loadResolve = resolve);
	}
}