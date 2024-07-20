onmessage = (e) =>
{
	fetch(e.data[0])
		.then(response => response.text())
		.then(text => postMessage([text]));
};