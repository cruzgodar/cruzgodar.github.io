import { sitemap } from "../scripts/src/sitemap.mjs";
import { getModifiedDate, write } from "./file-io.mjs";

export async function buildXmlSitemap()
{
	let xmlSitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
		+ "\n\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";

	for (const key in sitemap)
	{
		const lastModifiedDate = await getModifiedDate(key);

		const year = lastModifiedDate.getUTCFullYear();
		const month = lastModifiedDate.getUTCMonth() + 1;
		const day = lastModifiedDate.getUTCDate();

		const priority = key === "/home/"
			? "1.0"
			: key.includes("debug")
				? "0.0"
				: "0.5";

		xmlSitemap += `
		
	<url>
		<loc>https://www.cruzgodar.com${key}</loc>
		<lastmod>${year}-${month}-${day}</lastmod>
		<priority>${priority}</priority>
	</url>`;
	}

	xmlSitemap += "\n</urlset>";

	await write("/sitemap.xml", xmlSitemap);
}