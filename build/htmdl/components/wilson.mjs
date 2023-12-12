// Options:
// -g: GLSL. Includes a link about the GLSL docs.
export function wilson(options)
{
	if (options.includes("g"))
	{
		// eslint-disable-next-line max-len
		return "<p class='body-text'>This applet was made with <a href='/projects/wilson/'>Wilson</a>, a library I wrote to make high-performance, polished applets easier to create. Much of the code implementing complex functions was contributed by <a href='https://ahuchala.com'>Andy Huchala.</a> (<a data-card-id='glsl-docs'>View the documentation!</a>)</p>";
	}

	// eslint-disable-next-line max-len
	return "<p class='body-text'>This applet was made with <a href='/projects/wilson/'>Wilson</a>, a library I wrote to make high-performance, polished applets easier to create.</p>";
}