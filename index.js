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
		const lastDateObject = new Date(lastDate);
		client = await pool.connect();
		const oldWeatherData = await weather.getOld(client);

		if (weatherData == "IN PROGRESS") {
			console.log("Current weather API call already in progress. Sending old data...");
			return res.send(oldWeatherData);
		}

		const currentDate = new Date();
		if (lastDate && lastDateObject.getTime() > currentDate.getTime() - 300000) {
			// If data is less than 5 minutes old, send without retrieving more
			console.log("The latest weather data is available! Sending now...");
			return res.send(weatherData);
		}

		if (!lastDate)
			console.log("First time running, so no data yet! Initial population, nothing will be returned...");

		// Makes the call to get new data if older than 5 minutes
		console.log("Making API call to get latest weather data...");
		client = await pool.connect();
		await weather.setDataStatus(client);
		require('child_process').fork('get_data.js');

		// Send old data, which will be null on initial population
		return res.send(oldWeatherData);
	})
	.get('/addToDatabase', async (req, res) => {
		console.log("Adding to database...");
		let weatherData = req.query.WeatherData;
		if (!weatherData) return res.render('error');
		res.send(null); // Prevents timeout error from showing in logs

		// https://stackoverflow.com/a/36739415/6456163
		const client = await pool.connect();
		await client.query(`UPDATE data SET weather_data='${weatherData}', 
			WHERE id=(SELECT MAX(id) FROM data);`)
			.then(result => console.log("Successfully added to database!", result))
			.catch(err => console.error(err))
			.finally(() => client.end());
	})
	.get('*', (req, res) => res.render('error'))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));