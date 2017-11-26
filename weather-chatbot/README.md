# Weather chatbot demo

This is a [chatbot application](http://chatbot.coudert.ovh) made entirely of functions.

Features:
- Extract weather intent, location and date from user message using an artificial intelligence API, get meteo from an API and create a human answer (function `getMeteo`)
- HTML chat web-app served through functions (function `renderHTML`)

Requirements:
- An account on wit.ai, a free artifical intelligence API. 
You need to create a new application which contains 3 entities (for more information see [https://wit.ai/docs/quickstart](https://wit.ai/docs/quickstart)): 
	- weather-intent (free-text and keywords type), you can declare "weather" as keyword, and set all weather synonyms
	- wit/datetime
	- wit/location
- An account on apixu.com, a weather API which allow 5000 free calls per Month