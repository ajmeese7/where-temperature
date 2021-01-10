require('dotenv').config();
const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
const axios = require('axios').default;
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
});

var Bottleneck = require('bottleneck');
const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 500,
});

// Biggest cities in the US, a rather diverse selection
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

console.log("Beginning to gather city data...");
const weatherData = [];

limiter.schedule(() => {
	const allTasks = cities.map(city => getCityData(city));
	return Promise.all(allTasks);
})
.then(() => {
	addToDatabase(weatherData);
});

async function getCityData(city) {
	try {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(city)}&appid=${apiKey}&units=imperial`;
		const res = await axios.get(url);
		let cityData = { name: res.data.name, temp: res.data.main.temp, };
		weatherData.push(cityData);
  } catch (error) {
		console.error(`Problem with city ${city}!`);
  }
}

async function addToDatabase(weatherData) {
	// https://stackoverflow.com/a/36739415/6456163
	const client = await pool.connect();
	await client.query(`UPDATE data SET weather_data='${JSON.stringify(weatherData)}'
		WHERE id=(SELECT MAX(id) FROM data);`)
		.then(result => console.log("Successfully added to database!"))
		.catch(err => console.error(err))
		.finally(() => client.end());
}