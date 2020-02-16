# Contributing to idio-graphql 🚀

> We are trying to easier to contribute to this package, if anything can be done please file an issue. 

You can also give someone a shout on [slack](https://idio-graphql.slack.com/).

1. [Picking a existing task](#Picking-a-existing-task)
1. [Submitting an idea](#Submitting-an-idea)
1. [Dev Setup](#Dev-Setup)
1. [Git Commit Style](#Git-commit-style)
1. [Pull Request Checklist](#Pull-Request-Checklist)

# Picking a existing task 
There may be existing tasks [here](https://github.com/danstarns/idio-graphql/projects/1). If you want to take it on, file an issue relating to the task, broadcasting your working on it, this is the time to ask any questions.It is picked it up, the card will move into progress. When your done, file a PR and merge into develop. Make sure your branch is same as the task title `idio-000-test-task`.

# Submitting an idea
If you have an idea, you can either come and chat directly in [slack](https://idio-graphql.slack.com/) about it, or submit a issue explaining it. You will need to specify;

1. **Why**: why you think your idea should be created & implemented.
2. **Example**: If applicable, if the idea changes the api, please provide pseudo code example of how your example would work.
3. **Additional context**: Add any other context.


Furthermore, A task will be created [here](https://github.com/danstarns/idio-graphql/projects/1), you can start hacking 💻


# Dev Setup

> **Node** 12 >=

After you have forked and cloned the repo. You will need to;

1. Create a branch after the task title `idio-000-test-task` **(from develop)**
2. Install the following dependencies globally `npm install cross-env eslint --save-dev`
3. Make sure you have a eslint compatible editor. 
4. `npm install`

# Code style
At the moment the package is written in modern vanilla JavaScript, using js-doc where relevant. The eslint is configured to extend [airbnb](https://github.com/airbnb/javascript). The task [here](https://github.com/danstarns/idio-graphql/projects/1) mentions to make the package more TypeScript compatible. 

The project holds a prestigious test coverage and it would be greatly appreciated if you could uphold this, where applicable, with your PR. The project uses `mocha` and `chai` & coverage is implemented by `nyc`. If you are having trouble testing your feature give someone a shout on [slack](https://idio-graphql.slack.com/).

# Git commit style
Each commit should prefixed with a task title where relevant & a corresponding topic, followed by a commit title.

## Topics
1. Dev
2. Test
3. Feature
4. Bug
5. Docs
6. Other

`Task:Topic: Title...`

Example: `idio-000-test-task:Test: add test of my function`

> Some commits wont be associated to a task

Example: `Test: add test for function`

# Pull Request Checklist
Steps to cover in your pull request. 

- [] update/add relevant tests. 
- [] merge with develop.
- [] create pull request into **develop branch**
