# Nightingale Publish Alert

Gets the latest notifications from ft api and loads the images, passing the png's through png-stamper.herokuapp.com, looking for the ones that have been published via Nightingale, then outputs those for review on Asana.

## Configuration

Create an .env file on the root directory of the app with the following variables:

```
FT_API_KEY=<the FT api key>
FT_API_URL=<the url of the FT api endpoint>
STAMPER_URL=<the url of an instance of png-stamper>
PORT=80 # port to run the health checks on
LEVEL={debug, info, verbose, err, warn} # level of debug to run on (default is info)
ASANA_API_KEY=<the asana api key>
ASANA_API_URL=<the asana api url>
ASANA_WORKSPACE_ID=<the workspace id to post alerts to>
ASANA_PROJECT_ID=<the project id to post alerts to>
```

## Running

Use `foreman start` to start up the service. This will load the .env file and start up the service.

## Deployment

See DEPLOYMENT.md



