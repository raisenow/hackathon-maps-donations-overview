Backend
=======

This directory figures as the backend component providing data to the frontend.

## Getting Started
1. Create an API providing the donation amount and total number of donations aggregated by canton.
   Use the provided components documented below, which help you get started.
2. Reference the provided API in the frontend.
3. Place the `cantons.kml` in a webserver and reference this in the frontend component.


## Provided Components
Initially, this was implemented as an AWS Lambda endpoint. Since we were
using proprietary packages and direct access to our search cluster, we cannot share
this code. 

We do, however, share all code enabling you to create such an endpoint by yourself:

### Map Data
The `cantons.kml` file contains the canton polygons of Switzerland, which are required
by the frontend during page load. Thus, make them accessible in a webserver in the document root.

### Donation Data
The `response.json` file holds some dummy data required by the frontend to 
colour the map. In particular, the structure of this file is as follows:

```
{
  "maxAmount": <integer>, 
  "aggregations": { 
    {
        "<cantonName>": {
          "name": "<cantonName>",
          "numberOfDonations": <integer>,
          "donationAmount": <integer>
        },

        // ...

    }
}
```

whereas:
* `maxAmount`: The highest donation amount among all cantons. This can be used as reference for coloring.
* `aggregations`: Holds the donation data aggregated by canton.
* `<cantonName>`: The name of the canton as used by the frontend to match the appropriate polygon for coloring.
* `numberOfDonations`: The total number of donations made in that canton.
* `donationAmount`: The total donation amount made in that canton with `numberOfDonations` donations.

### Map of ZipCodes to Canton Names
Usually, the donation holds the ZIP code of the payer's address, on which basis the data is aggregated to
each canton. To ease linking ZIP codes to the canton names required by the frontend, use the map in `canton-map.json`. 
