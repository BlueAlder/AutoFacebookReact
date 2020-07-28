const Constants = require('../data/constants');
const axios = require('axios');
const moment = require('moment');


exports.weatherCheck = async (api, event) => {
    console.log("im checking da weather")

    // 1. check for arguments
    const args = event.body.split("!weather ");
    console.log(args)
    if (args.length < 2) {
        console.warn("No argument provided with weather command")
        api.sendMessage("Please provide an argument with the place you want to know the weather", event.threadID)
        return;
    }

    const locationQuery = args[1];

    // 2. Geocode place | append with australia
    console.log("Calling geocode API with query of " + locationQuery)
    const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationQuery}, Australia&key=AIzaSyCSRenlPS-LjXZKHByxrvozCgqc5ba0vtc`)
    const geocodedData = res.data.results[0];
    console.log(`Got geocoded data of ${locationQuery} at ${geocodedData.geometry.location.lat} and ${geocodedData.geometry.location.lng}`)


    // 3. call weather api with lat and long 
    const weatherQueryParams = {
        lat: geocodedData.geometry.location.lat,
        lon: geocodedData.geometry.location.lng,
        exclude: 'current,minutely,hourly',
        units: 'metric',
        // TODO add this as a secret
        appid: '83a9f8de7381ce88de206a3b9cb3afb2'
    }
    const weatherForecast = await axios.get(`https://api.openweathermap.org/data/2.5/onecall`, {params: weatherQueryParams})
    console.log(weatherForecast.data)

    for (let day of weatherForecast.data.daily) {
        const dayOfWeek = moment.unix(day.dt).format("dddd");
        const dayTemp = day.temp.day;
        const dayFeelsLike = day.feels_like.day;
        const weatherDesc = day.weather[0].description;

        const message = `${dayOfWeek} it will be ${weatherDesc} at ${dayTemp} degrees and feels like ${dayFeelsLike}`
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