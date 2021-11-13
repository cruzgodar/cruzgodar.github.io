!function()
{
	let lapsa = null;
	
	
	
	fetch("/teaching/lapsa-test/pages/test.md")
	
	.then((response) => response.text())
	
	.then((text) =>
	{
		lapsa = new Lapsa(text, {debug: true});
	});
}()