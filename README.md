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

Any changes should committed and pushed to github on a ** [feature_branch] **.

### Staging

If you are ready to release your code changes to staging *(nightingale-pub-alert-staging.herokuapp.com)*

1. Create a branch called **staging** in github from the head of master (if it does not exist).
2. Create a Pull Request to merge your ** [feature_branch] ** on to **staging**.
3. When your PR has been approved and your branch has been merged, circleci will automatically detect your changes and 
build and deploy to the staging heroku app. This configuration has been defined by circle.yml in the project.

https://circleci.com/gh/Financial-Times/nightingale-publish-alert

### Production 

When you/QA are satisfied that your code on staging can be deployed to prod *(nightingale-pub-alert.herokuapp.com)* 

1. Create a Pull Request in github to merge the **staging** branch to **master**
2. To deploy merge your PR branches. Circleci will automatically detect the changes on master and build and deploy
the master branch to the heroku app.



