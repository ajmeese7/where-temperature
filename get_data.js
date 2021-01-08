require('dotenv').config();
const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
const request = require('request');
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
});

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
];

(async () => {
	console.log("Beginning to gather city data...");
	async function gatherWeatherData() {
		let weatherData = [];

		for (let i = 0; i < /*cities.length*/ 3; i++) {
			let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cities[i])}&appid=${apiKey}&units=imperial`;

			// IDEA: Switch these to the bulk 20 at a time requests
			// for a more performant system. Only reason I haven't yet is
			// because you need the city ID's, and that's more of a pain.
			await request(url, { json: true }, (err, res, body) => {
				if (err) { return console.error(err); }

				// TODO: Figure out the bottleneck and why body.main is
				// null as the number of requests increases.
				let cityData = { name: body.name, temp: body.main.temp, };
				weatherData.push(cityData);
			});
		}

		return weatherData;
	}

	await gatherWeatherData().then(data => {
		console.log("Weather data retrieved:", data);
		addToDatabase(data);
	});

	async function addToDatabase(weatherData) {
		// https://stackoverflow.com/a/36739415/6456163
		const client = await pool.connect();
		await client.query(`UPDATE data SET weather_data='${JSON.stringify(weatherData)}'
			WHERE id=(SELECT MAX(id) FROM data);`)
			.then(result => console.log("Successfully added to database!"))
			.catch(err => console.error(err))
			.finally(() => client.end());
	}
})();