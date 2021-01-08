<p align="center">
  <h1 align="center">⛈️Where Temperature⛈️</h1>
</p>

<p align="center">
  <a href="https://github.com/ajmeese7/where-temperature/search?l=javascript">
    <img src="https://img.shields.io/badge/language-JavaScript-yellow" alt="JavaScript" />
  </a>
  <a href="https://github.com/ajmeese7/where-temperature/blob/master/LICENSE.md">
    <img src="https://img.shields.io/github/license/ajmeese7/where-temperature" alt="License" />
  </a>
  <a href="https://github.com/ajmeese7/where-temperature/stargazers">
    <img src="https://img.shields.io/github/stars/ajmeese7/where-temperature" alt="Stars" />
  </a>
  <a href="https://github.com/ajmeese7/where-temperature/network/members">
    <img src="https://img.shields.io/github/forks/ajmeese7/where-temperature" alt="Forks" />
  </a>
  <a href="https://github.com/ajmeese7/where-temperature/stargazers">
    <img src="https://img.shields.io/static/v1?label=%F0%9F%8C%9F&message=If%20Useful&style=style=flat&color=BC4E99" alt="Leave a Star!"/>
  </a>
</p>

<p align="center">Find a location that is currently in your desired temperature range.</p>

## Developing
You can replicate the PostgreSQL table structure by running the following query
on your local Postgres server:

```sql
CREATE TABLE data (
    id SERIAL PRIMARY KEY,
    weather_data text,
    date TIMESTAMP default CURRENT_TIMESTAMP
);
```

To start up the Express server, run `npm run devstart`. This will start it with
Nodemon, so the server will automatically restart whenever you make changes to
important files. You can view it at `localhost:5000`.

To start a local Postgres server, run `psql postgresql://[user[:password]@][netloc][:port][/dbname]`,
filling in your server's information where appropriate.

You should create a `.env` file with the following values assigned:
- DATABASE_URL
- OPEN_WEATHER_MAP_API_KEY
	- This project uses the [Current Weather API](https://openweathermap.org/current#min) from
	Open Weather Map to get the weather data.
	- You can sign up for a free API key [here](https://home.openweathermap.org/api_keys).
