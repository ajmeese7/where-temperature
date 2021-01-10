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

function findLocations() {
	// Unhide loader and hide previous results
	let spinner = document.getElementsByClassName("spinner-border")[0];
	spinner.style.display = 'block';

	let results = document.getElementById("results");
	results.innerHTML = '';
	results.style.display = 'none';

	// NOTE: Can eventually add location as a param here if desired
	let minTemp = document.getElementById("minTemp").value;
	let maxTemp = document.getElementById("maxTemp").value;
	if (!maxTemp) maxTemp = minTemp;
	let url = encodeURI(`/getWeatherData?minTemp=${minTemp}&maxTemp=${maxTemp}`);

	const client = new HttpClient();
	client.get(url, function(response) {
		let matches = [], nonmatches = [];
		if (response) {
			response = JSON.parse(response);
			response.forEach(location => {
				const temperature = location.temp;
				(temperature >= minTemp && temperature <= maxTemp) ? matches.push(location) : nonmatches.push(location);
			});

			if (matches.length > 0) {
				matches.forEach(match => results.innerHTML += resultCode(match));
			} else {
				// https://stackoverflow.com/a/48236643/6456163
				const middleOfRange = (minTemp*1 + maxTemp*1) / 2;
				nonmatches.sort((a, b) => a.temp - middleOfRange - b.temp - middleOfRange);
				nonmatches = nonmatches.slice(0, 5);

				results.innerHTML += `
					<p id='noResultsTop'>No results match the criteria!</p>
					<p>Here are the closest temperatures to your desired range:</p>
				`;
				nonmatches.forEach(match => results.innerHTML += resultCode(match));
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

const resultCode = (match) => `
	<div class="result">
		<p class="cityName">Name: <b>${match.name}</b></p>
		<p class="cityTemp">Temp: <b>${match.temp}°F</b></p>
	</div>
`;