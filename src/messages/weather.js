const Constants = require('../data/constants');
const axios = require('axios');
const moment = require('moment');
const Utils = require("../util")


exports.weatherCheck = async (api, event) => {
    console.log("im checking da weather")

    // 1. check for arguments
    const args = event.body.split("!weather ");
    // console.log(args)
    if (args.length < 2) {
        console.warn("No argument provided with weather command")
        api.sendMessage("Please provide an argument with the place you want to know the weather", event.threadID)
        return;
    }

    const locationQuery = args[1];

    // 2. Geocode place | append with australia
    // Get the API key 
    const geocodeApiKey = await Utils.getSecret('geocode-api-key')

    console.log("Calling geocode API with query of " + locationQuery)
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationQuery}, Australia&key=${geocodeApiKey}`)
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
        const dayOfWeek = moment.unix(day.dt).format("dddd");
        const dayTemp = Math.round(day.temp.day);
        const dayFeelsLike = Math.round(day.feels_like.day);
        const weatherDesc = day.weather[0].description;
        const emoji = day.weather[0].id > 800 ? weather_emoji[9] : weather_emoji[Math.floor(day.weather[0].id/100)]

        const message = `${dayOfWeek}, ${emoji} ${weatherDesc}, ${dayTemp}°, feels like ${dayFeelsLike}°`
        api.sendMessage(message, event.threadID);
        await sleep(500)
    }


    // 3. add other cool stuff


        // const words = message.body.toLowerCase().split(" ");

        // // Angry react
        // if ( ( words.some(word => word.match(/\blo[!$*lo l]*\b/gm)) || words.includes("lmao") || words.includes("idm"))) {
        //     console.log("Sending reaction...");
        //     api.setMessageReaction("😠", message.messageID);
        // }
};


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