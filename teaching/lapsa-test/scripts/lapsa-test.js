!function()
{
	let lapsa = null;
	
	
	
	fetch("/teaching/lapsa-test/slides/test.md")
	
	.then((response) => response.text())
	
	.then((text) =>
	{
		lapsa = new Lapsa(text);
	});
}()