import { $$ } from "./main.mjs";
import { siteSettings } from "./settings.mjs";

let desmosLoaded = false;
let desmosGraphs = {};

let getDesmosData = () => {{}};

export function setGetDesmosData(newGetDesmosData)
{
	getDesmosData = newGetDesmosData;
}



export async function createDesmosGraphs()
{
	if (!desmosLoaded)
	{
		await Site.loadScript("https://www.desmos.com/api/v1.7/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6");
		
		desmosLoaded = true;
	}
	
	for (let key in desmosGraphs)
	{
		try {desmosGraphs[key].destroy()}
		catch(ex) {}
	}
	
	desmosGraphs = {};

	const purple = siteSettings.darkTheme ? "#60c000" : "#772fbf";
	const blue = siteSettings.darkTheme ? "#c06000" : "#2f77bf";
	const red = siteSettings.darkTheme ? "#00c0c0" : "#bf2f2f";
	const green = siteSettings.darkTheme ? "#c000c0" : "#2fbf2f";
	const black = "#000000";
	
	const data = getDesmosData(purple, blue, red, green, black);
	
	for (let key in data)
	{
		data[key].expressions.forEach(expression =>
		{
			expression.latex = expression.latex.replace(/\(/g, String.raw`\left(`);
			expression.latex = expression.latex.replace(/\)/g, String.raw`\right)`);
			
			expression.latex = expression.latex.replace(/\[/g, String.raw`\left[`);
			expression.latex = expression.latex.replace(/\]/g, String.raw`\right]`);
		});
	}
	
	$$(".desmos-container").forEach(element =>
	{
		const options = {
			keypad: false,
			settingsMenu: false,
			zoomButtons: false,
			showResetButtonOnGraphpaper: true,
			border: false,
			expressionsCollapsed: true,
			invertedColors: siteSettings.darkTheme,
			
			xAxisMinorSubdivisions: 1,
			yAxisMinorSubdivisions: 1
		};
		
		if (data[element.id].options)
		{
			for (let key in data[element.id].options)
			{
				options[key] = data[element.id].options[key];
			}
		}
		
		
		
		desmosGraphs[element.id] = Desmos.GraphingCalculator(element, options);
		
		desmosGraphs[element.id].setMathBounds(data[element.id].bounds);
		
		desmosGraphs[element.id].setExpressions(data[element.id].expressions);
		
		desmosGraphs[element.id].setDefaultState(desmosGraphs[element.id].getState());
	});
}



//Usage: Page.Load.exportDesmosScreenshot("");
export function getDesmosScreenshot(id, forPdf = false)
{
	desmosGraphs[id].updateSettings({showGrid: forPdf, xAxisNumbers: forPdf, yAxisNumbers: forPdf});
	
	const expressions = desmosGraphs[id].getExpressions();
	
	for (let i = 0; i < expressions.length; i++)
	{
		expressions[i].lineWidth = forPdf ? 5 : 7.5;
		expressions[i].pointSize = forPdf ? 15 : 27;
		expressions[i].dragMode = "NONE";
	}
	
	desmosGraphs[id].setExpressions(expressions);
	
	desmosGraphs[id].asyncScreenshot({
		width: 500,
		height: 500,
		targetPixelRatio: 8
	}, imageData =>
	{
		const img = document.createElement("img");
		img.width = 4000;
		img.height = 4000;
		img.style.width = "50vmin";
		img.style.height = "50vmin";
		img.src = imageData;
		document.body.appendChild(img);
	});
}