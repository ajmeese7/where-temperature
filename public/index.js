// Waits until the document's elements are available
document.addEventListener("DOMContentLoaded", function(event) {
	let findButton = document.getElementById("findButton");
	findButton.disabled = true;

	// Disables button if minTemp empty; otherwise enabled
	let minTemp = document.getElementById("minTemp");
	minTemp.oninput = () => {
		if (!!minTemp.value) return findButton.disabled = false;
		findButton.disabled = true;
	};
});

function findLocations() {
	// Unhide loader and hide previous results
	let spinner = document.getElementsByClassName("spinner-border")[0];
	spinner.style.display = 'block';

	let results = document.getElementById("matches");
	results.style.display = 'none';
	//results.style.visibility = "hidden";

	// NOTE: Can eventually add location as a param here if desired
	let minTemp = document.getElementById("minTemp").value;
	let maxTemp = document.getElementById("maxTemp").value;
	if (!maxTemp) maxTemp = minTemp;
	let url = encodeURI(`/getWeatherData?minTemp=${minTemp}&maxTemp=${maxTemp}`);

	const client = new HttpClient();
	client.get(url, function(response) {
		console.log("RESPONSE to findLocations .get():", response);
		if (!response) console.log("Response is showing as NULL!!!");
		
		let matches = [], nonmatches = [];
		if (response) {
			response = JSON.parse(response);
			response.forEach(location => {
				// IDEA: Split into matches and non-matches, and if matches is null, go with the
				// closest absolute value in the non-matches as a suggestion
				const [name, temperature] = location;
				console.log(`Name: ${name}, Temperature: ${temperature}`);

				// TODO: Test logic
				(temperature >= minTemp && temperature <= maxTemp) ? matches.push(location) : nonmatches.push(location);
			});

			if (matches.length > 0) {
				matches.forEach((match) => {
					const [name, temperature] = match;
					results.innerHTML += `
						<p>Name: ${name}</p>
						<p>Temp: ${temperature}</p>
					`;
				});
			} else {
				// https://stackoverflow.com/a/48236643/6456163
				nonmatches.sort(function(a, b) {
					return Math.abs(num-a) - Math.abs(num-b);
				});
				nonmatches = nonmatches.slice(0, 5);
				results.innerHTML += "<p>No results match the criteria! Here are the closest temperatures to your desired range:</p>";
				
				nonmatches.forEach((match) => {
					const [name, temperature] = match;
					results.innerHTML += `
						<p>Name: ${name}</p>
						<p>Temp: ${temperature}</p>
					`;
				});
			}
		} else {
			// For initial population, need to retrieve the new data
			console.log("Possibly initial population? The returned data is null...");
			results.innerHTML = "Please refresh the page :)";
		}

		// Hide loader and unhide new results
		spinner.style.display = 'none';
		results.style.display = 'block';
	});
}

// https://stackoverflow.com/a/22076667/6456163
const HttpClient = function() {
	this.get = function(aUrl, aCallback) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() { 
			if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
				aCallback(anHttpRequest.responseText);
		}

		anHttpRequest.open( "GET", aUrl, true );            
		anHttpRequest.send( null );
	}
}