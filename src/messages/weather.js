const Constants = require('../data/constants');
const axios = require('axios');
const moment = require('moment');
const Utils = require("../util")
const parseArgs = require('minimist')
const ArgumentParser = require('argparse').ArgumentParser;

ArgumentParser.prototype.error = function (err) {
    var message;
    if (err instanceof Error) {
      if (this.debug === true) {
        throw err;
      }
      message = err.message;
    } else {
      message = err;
    }
    // var msg = format('%s: error: %s', this.prog, message) + c.EOL;
    var msg = "gay"
  
    if (this.debug === true) {
      throw new Error(msg);
    }
  
    this.printUsage(process.stderr);
    throw "Invalid command"
    // return this.exit(2, msg);
  };

const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp:true,
    description: 'Argparse example'
});



parser.addArgument(
    [ '-d', '--day' ],
    {
        help: 'bar foo',
        required: false
    }
);

parser.addArgument(
    'place',
    {
        help: 'bar foo',
        nargs: '*'
    }
);


exports.weatherCheck = async (api, event) => {
    console.log("im checking da weather")

    // 1. check for arguments
    const messageBody = event.body;
    const args = event.body.split("!weather ");
    const cmdArgs = event.body.split(" ");
    cmdArgs.shift();

    let argv;

    try {
        console.log(cmdArgs)
        argv = parser.parseArgs(cmdArgs);
    } catch (e) {
        console.error(e)
        api.sendMessage("bruh", event.threadID)
        return;
    }
    console.log(argv)
    
        

    // const argv = parseArgs(event.body.split(" "));
    // console.log(argv)

    // console.log(args)
    if (args.length < 2) {
        console.warn("No argument provided with weather command")
        api.sendMessage("Please provide an argument with the place you want to know the weather", event.threadID)
        return;
    }

    const locationQuery = argv.place.join(" ");

    // 2. Geocode place | append with australia
    // Get the API key 
    const geocodeApiKey = await Utils.getSecret('geocode-api-key')

    console.log("Calling geocode API with query of " + locationQuery)
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationQuery}, Australia&key=${geocodeApiKey}`)

    if (!res.data.results.length) {
        console.warn(`Could not find location for ${locationQuery}`)
        api.sendMessage(`❗ Could not find location for "${locationQuery}" ❗`, event.threadID)
        return;
    }
    const geocodedData = res.data.results[0];
    console.log(`Got geocoded data of ${locationQuery} at ${geocodedData.geometry.location.lat} and ${geocodedData.geometry.location.lng}`)
    api.sendMessage(`Checking weather for ${geocodedData.formatted_address}`, event.threadID)

    // 3. call weather api with lat and long 
    // Get API key

    const weatherApiKey = await Utils.getSecret('weather-api-key')

    const weatherQueryParams = {
        lat: geocodedData.geometry.location.lat,
        lon: geocodedData.geometry.location.lng,
        exclude: 'current,minutely,hourly',
        units: 'metric',
        appid: weatherApiKey
    }
    const weatherForecast = await axios.get(`https://api.openweathermap.org/data/2.5/onecall`, {params: weatherQueryParams})
    console.log("Got weather forecast data")

    for (let day of weatherForecast.data.daily) {
        // -d option
        if (argv.day) {
            if (argv.day.toLowerCase() === moment.unix(day.dt).format("dddd").toLowerCase() ) {
                api.sendMessage(formatWeatherMessage(day), event.threadID);
                break;
            }
        } else {
            api.sendMessage(formatWeatherMessage(day), event.threadID);
            await sleep(500)
        }

        
    }


    // 3. add other cool stuff


        // const words = message.body.toLowerCase().split(" ");

        // // Angry react
        // if ( ( words.some(word => word.match(/\blo[!$*lo l]*\b/gm)) || words.includes("lmao") || words.includes("idm"))) {
        //     console.log("Sending reaction...");
        //     api.setMessageReaction("😠", message.messageID);
        // }
};

function formatWeatherMessage(day) {
    const dayOfWeek = moment.unix(day.dt).format("dddd");
    const dayTemp = Math.round(day.temp.day);
    const dayFeelsLike = Math.round(day.feels_like.day);
    const weatherDesc = day.weather[0].description;
    const emoji = day.weather[0].id > 800 ? weather_emoji[9] : weather_emoji[Math.floor(day.weather[0].id/100)]

    const message = `${dayOfWeek}, ${emoji} ${weatherDesc}, ${dayTemp}°, feels like ${dayFeelsLike}°`;
    return message;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const weather_emoji = {
    1: '?',
    2: '⛈',
    3: '🌦',
    5: '🌧',
    6: '🌨',
    7: '🌫',
    8: '☀',
    9: '☁'
}