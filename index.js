const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000; // Heroku or local
const weather = require('./weather');
var app = express();

require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
});

app
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', (req, res) => res.render('index'))
	.get('/index', (req, res) => res.render('index'))
	.use((req, res, next) => {
		// CORS headers
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	})
	.get('/getWeatherData', async (req, res) => {
		let client = await pool.connect();
		const [lastDate, weatherData] = await weather.get(client);
		const oldWeatherData = await weather.getOld(client);
		console.log("Weather data:", weatherData);
		console.log("OLD weather data:", oldWeatherData);

		if (weatherData == "IN PROGRESS") {
			console.log("Current weather API call already in progress. Sending old data...");
			return res.send(oldWeatherData);
		}

		// Doesn't insert the menu if it is a weekend or the same date as the last one;
		// NOTE/TODO: Will probably have to adjust to be the same millis format on both
		console.log("LAST DATE:", lastDate);
		console.log("Last date NOW:", lastDate.now());
		const currentDate = new Date();
		if (lastDate && lastDate.now() + 300000 < currentDate.now()) {
			// If data is less than 5 minutes old, send without retrieving more
			console.log("The latest weather data is available! Sending now...");
			return res.send(weatherData);
		} else {
			if (!lastDate)
				console.log("First time running, so no data yet! Initial population, nothing will be returned...");

			// Makes the call to get new data if older than 5 minutes
			client = await pool.connect();

			// TODO: Retrieve new data here, then use same callback method.
			// How do I send the data to the user though, in the browser
			// without async?
			await weather.setRecordingStatus(client);
			require('child_process').fork('get_data.js');
			console.log("Making API call to get latest weather data...");

			// Send old data, which will be null on initial population
			return res.send(oldWeatherData);
		}
	})
	.get('/addToDatabase', async (req, res) => {
		let weatherData = req.query.WeatherData;
		if (!weatherData) return res.render('error');
		res.send(null); // Prevents timeout error from showing in logs

		// https://stackoverflow.com/a/36739415/6456163
		const client = await pool.connect();
		await client.query(`UPDATE data SET weather_data='${weatherData}', 
			WHERE id=(SELECT MAX(id) FROM data);`)
			.then(result => {})
			.catch(err => console.error(err))
			.finally(() => client.end());
	})
	.get('*', (req, res) => res.render('error'))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));