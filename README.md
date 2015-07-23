# Nightingale Publish Alert

Gets the latest notifications from ft api and loads the images, passing the png's through png-stamper.herokuapp.com, looking for the ones that have been published via Nightingale, then outputs those for review on Asana.

## Configuration

Create an .env file on the root directory of the app with the following variables:

```
FT_API_KEY=<the FT api key>
FT_API_URL=<the url of the FT api endpoint>
STAMPER_URL=<the url of an instance of png-stamper>
```
