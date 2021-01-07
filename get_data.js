require('dotenv').config();
const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;

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

// 50 biggest cities in the US, a rather diverse
const cities = [
	'New York City',
	'Los Angeles',
	'Chicago',
	'Houston',
	'Phoenix',
	'Philadelphia',
	'San Antonio',
	'San Diego',
	'Dallas',
	'San Jose',
	'Austin',
	'Jacksonville',
	'Fort Worth',
	'Columbus',
	'Charlotte',
	'San Francisco',
	'Indianapolis',
	'Seattle',
	'Denver',
	'Washington',
	'Boston',
	'El Paso',
	'Nashville',
	'Detroit',
	'Oklahoma City',
	'Portland',
	'Las Vegas',
	'Memphis',
	'Louisville',
	'Baltimore',
	'Milwaukee',
	'Albuquerque',
	'Tuscon',
	'Fresno',
	'Mesa',
	'Sacramento',
	'Atlanta',
	'Kansas City',
	'Colorado Springs',
	'Omaha',
	'Raleigh',
	'Miami',
	'Long Beach',
	'Virginia Beach',
	'Oakland',
	'Minneapolis',
	'Tulsa',
	'Tampa',
	'Arlington',
	'New Orleans',
]

console.log("Beginning to gather city data...");

let weatherData = [];
const client = new HttpClient();
for (let i = 0; i < cities.length; i++) {
	// Note: gonna need list[0].name and list[0].main.temp
	let url = `api.openweathermap.org/data/2.5/weather?q=${encodeURI(cities[i])}&appid=${apiKey}&units=imperial`;
	client.get(url, function(response) {
		response = JSON.parse(response);
		let name = response.name;
		let temp = response.main.temp;
		let cityData = { name: name, temp: temp, };
		weatherData.push(cityData);
	});
}

console.log("City data all retrieved! Returning now...");
url = `https://where-temperature.herokuapp.com/addToDatabase?WeatherData=${JSON.stringify(weatherData)}`;
client.get(url, function(response) {
	console.log("Population request successfully sent to /addToDatabase!");
});