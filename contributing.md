# Contributing to idio-graphql 

> We are trying to easier to contribute to this package, if anything can be done please file an [issue](https://github.com/danstarns/idio-graphql/issues). 

You can also give someone a shout on [slack](https://idio-graphql.slack.com/).

1. [Submitting an idea](#Submitting-an-idea)
2. [Dev Setup](#Dev-Setup)
3. [Code Style](#Code-style)
4. [Git Commit Style](#Git-commit-style)
5. [Pull Request Checklist](#Pull-Request-Checklist)


# Submitting an idea
If you have an idea, you can either come and chat directly in [slack](https://idio-graphql.slack.com/) about it, or submit a [issue](https://github.com/danstarns/idio-graphql/issues) explaining it.

# Dev Setup

> **Node** 12 >=

After you have forked and cloned the repo. You will need to;

1. Install the following dependencies globally `npm install cross-env eslint --save-dev`
2. Make sure you have a eslint compatible editor. 
3. `npm install`

# Code style
At the moment the package is written in modern vanilla JavaScript, using js-doc where relevant. The eslint is configured to extend [airbnb](https://github.com/airbnb/javascript).

The project holds a prestigious test coverage and it would be greatly appreciated if you could uphold this. The project uses `mocha` and `chai` & coverage is implemented by `nyc`. If you are having trouble testing your feature give someone a shout on [slack](https://idio-graphql.slack.com/).

# Git commit style
Corresponding topic, followed by commit title.

## Topics
1. Dev
2. Test
3. Feature
4. Bug
5. Docs
6. Other

`Topic: ...`

Example: `Test: add test for function`

# Pull Request Checklist
Steps to cover in your pull request. 

- [] update/add relevant tests. 
- [] merge with develop.
- [] create pull request into **develop branch**
