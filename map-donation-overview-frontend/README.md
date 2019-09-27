Frontend
========

This component shows the map with the aggregated data.

### Getting started
1. Create and host the backend component as described in its own directory's README.
2. Create a Google Maps API key and adjust it in `index.html`.
3. Open `index.ts` and adjust the values of `CANTONS_KLM_URL` and `DATA_URL`, whereas the 
   former refers to the XML holding the canton polygon data, and the latter refers to the API
   endpoint providing the aggregated donation data.
4. Execute `npm install`
5. Execute `npm run dev` and check in your browser that everything looks as required.
6. Run `npm run prod` which generates all files you need to place in a webserver. 
