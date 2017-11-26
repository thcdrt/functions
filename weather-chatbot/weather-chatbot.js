const request = require('request');
const fs = require('fs');

const htmlFileName = "chat.html"

exports.getMeteo = function(event, callback) {
  console.log("Message reçu:", event.data);

  if (event.method =="GET") {
    renderHTML(callback);
  }
  else if (event.method =="POST") {
    extractLocationAndDateFromMessage(event.data, callback);
  }
}

function renderHTML(callback){
  fs.readFile(htmlFileName, 'utf8', function (err,data) {
    if (err) {
      return callback('Erreur interne')
    }
    var data = data.replace('{{ chatbot_url }}', process.env.CHATBOT_URL);
    callback(null, data)
  });
}

function extractLocationAndDateFromMessage(userMsg, callback){
  const witAPIUrl = "https://api.wit.ai/message";

  const req = {
    method: 'GET',
    uri: witAPIUrl,
    qs:  { q:userMsg },
    headers: { 'Authorization': 'Bearer ' + process.env.WIT_TOKEN }
	};

  request(req, function (err, resp) {
    if (err) {
      console.log('error:', err)
      return callback(`Erreur interne`);;
    }

    var intent = JSON.parse(resp.body);

    if (intent.entities.weather_intent == null) {
    	return callback(`Désolé je n'ai pas compris votre question.`);
    }

    var location = intent.entities.location;
    if (location == null) {
    	return callback(`Où ça ?`);
    }

    var dateTime = intent.entities.datetime;
    if (dateTime == null) {
    	return callback(`Quand ?`);
    }

    extractMeteoFromLocationAndDate(location[0].value, new Date((dateTime[0].value).split('+')[0]), callback);
  })
}

function extractMeteoFromLocationAndDate(location, date, callback){
  const apixuAPIUrl  = "https://api.apixu.com/v1/forecast.json";

  var unixDate = (date.getTime() / 1000);
  var queryParameters = { key:process.env.APIXU_TOKEN, q:location, lang:'fr', unixdt:unixDate };
  const req = {
    method: 'GET',
    uri: apixuAPIUrl,
    qs: queryParameters
  };

  request(req, function (err, resp) {
    var userResp = new Object();
    if (err) {
      console.log('error:', err);
      return callback(`Erreur interne"`);
    }
    if (resp.statusCode != 200) {
      console.log('error: ' + resp.statusCode + ' ' + resp.body);
      return callback(`Erreur interne"`);
    }

    var weather = JSON.parse(resp.body);

    var location = weather.location;
    if (location == null || location.name == null ) {
    	return callback(`Ville non trouvée`);
    }
    var city = location.name;
    var region = location.region;
    var country = location.country;

    var dayForecast = weather.forecast.forecastday[0].day;
    if (dayForecast == null) {
    	return callback(`Date trop éloignée`);
    }
    var condition = dayForecast.condition.text;
    var minTemp = dayForecast.mintemp_c;
    var maxTemp = dayForecast.maxtemp_c;

    userResp.message = 'Le ' + date.getDate().toString() + '/' + date.getMonth().toString() + '/' + date.getFullYear().toString() + ' le temps sera ' + condition.toLowerCase() + ' à ' + city + ', ' + region + ', ' + country + '. La température minimale sera de ' + minTemp.toString() + '°c, et la température maximale sera de ' + maxTemp.toString() + '°c.';
    userResp.condition_icon = (dayForecast.condition.icon).replace("//", "http://");

    callback(null, JSON.stringify(userResp));
  })
}