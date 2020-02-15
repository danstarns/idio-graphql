# Contributing to idio-graphql 🚀

> Im trying to make it easier to contribute to this package, if i can do anything please file an issue. 

You can also give me a shout on [slack](https://idio-graphql.slack.com/).

1. [Picking a existing task](#Picking-a-existing-task)
1. [Submitting an idea](#Submitting-an-idea)
1. [Dev Setup](#Dev-Setup)
1. [Git Commit Style](#Git-commit-style)
1. [Pull Request Checklist](#Pull-Request-Checklist)

# Picking a existing task 
There may be existing bugs or tasks [here](https://github.com/danstarns/idio-graphql/projects/1). If you want to take it on, file an issue relating to the task, broadcasting your working on it. Once i have picked it up, ill move the card into progress. When your done, file a PR and merge into develop. Make sure your branch is same as the task title `idio-000-test-task`.

# Submitting an idea
If you have an idea, you can either come and chat directly in slack about it, or submit a issue explaining it. You will need to specify;

1. **Why**: why you think your idea should be created & implemented.
2. **Example**: If applicable, if the idea changes the api, please provide pseudo code example of how your example would work.
3. **Additional context**: Add any other context.


When all details are specified ill create a task for it & you can start implementing your idea.


# Dev Setup

> **Node** 12 >=

After you have forked and cloned the repo. You will need to;

1. Create a branch after the task title `idio-000-test-task`
2. Install the following dependencies globally `npm install cross-env eslint`
3. Make sure you have a eslint compatible editor. 
4. `npm install`

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
