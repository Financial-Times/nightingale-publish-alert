# Nightingale Publish Alert

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
