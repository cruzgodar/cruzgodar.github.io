function insert_header()
{
	if (page_settings["no_header"])
	{
		return;
	}
	
	
	
	document.querySelector("#spawn-header").insertAdjacentHTML("afterend", `
		<div class="new-aos-section logo" data-aos="fade-in">
			<a href="/home/home.html">
				<img src="/graphics/general-icons/logo.png" alt="Logo" onclick="redirect('/home/home.html')"></img>
			</a>
		</div>
		
		<div style="height: 2vh"></div>
		
		<div data-aos="fade-up">
			<h1 class="heading-text">${page_settings["header_text"]}</h1>
		</div>
    `);
    
    document.querySelector("#spawn-header").remove();
}