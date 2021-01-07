async function setDataStatus(client) {
  await client.query("INSERT INTO data (weather_data) VALUES ('IN PROGRESS');")
    // Only sends the menu each time a new menu is gotten
    .then(result => console.log("Set data status as gathering!"))
    .catch(err => console.error(err))
    .finally(() => client.end());
}

// Selects most recent weather data and its date
function getWeatherData(client) {
  const data = async () => {
    var result;
    await client.query(`SELECT date, weather_data FROM data ORDER BY date DESC LIMIT 1;`)
      .then(res => result = res.rows[0])
      .catch(err => console.error(err))
      .finally(() => client.end());

    // Returns in format that allows for destructuring assignment
    return result ? [result.date, result.weather_data] : [0,0];
  }

  return (async () => await data() )();
}

// TODO: Can the `const data` be abstracted to a function?
function getOldWeatherData(client) {
  const data = async () => {
    var result;
    await client.query(`SELECT weather_data FROM data ORDER BY date DESC LIMIT 2;`)
      .then(res => result = res.rows.length > 1 ? res.rows[1] : null)
      .catch(err => console.error(err))
      .finally(() => client.end());

    return result ? result.weather_data : 0;
  }

  return (async () => await data() )();
}

exports.setDataStatus = setDataStatus;
exports.get = getWeatherData;
exports.getOld = getOldWeatherData;