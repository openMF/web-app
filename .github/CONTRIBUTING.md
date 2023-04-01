# Getting Started

- View the [README](../README.md) or [watch this video](https://youtu.be/OnxxC3K2oro) to get your development environment up and running. 
- Learn how to [format pull requests](#submitting-a-pull-request).
- Read how to [rebase/merge upstream branches](#configuring-remotes).
- Understand our [commit message conventions](https://github.com/openMF/web-app/blob/master/.github/COMMIT_MESSAGE.md).
- Sign our [Mifos CLA](http://mifos.org/about-us/financial-legal/mifos-contributor-agreement/).
- Follow our [code of conduct](CODE_OF_CONDUCT.md).
- [Find an issue to work on](https://github.com/openMF/web-app/issues) and start smashing!
- [Ask a question on Gitter](https://gitter.im/openMF/web-app).
- Learn more at our [getting started guide](https://mifosforge.jira.com/wiki/spaces/RES/pages/464322561/New+Contributor+Getting+Started+Guide).

# Contributing Guidelines [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openMF/web-app/issues)

When contributing to this repository, please first discuss the change you wish to make via an issue.

Make sure you read the [Wiki](https://github.com/openMF/web-app/wiki).

Do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests. If you have got any questions, please email to our [mailing list](https://sourceforge.net/projects/mifos/lists/mifos-developer). You can also join our [gitter channel](https://gitter.im/openMF/web-app) to chat about your queries in real-time. 

Each active repository has its own channel to direct questions to. Also join the [official gitter channel](https://gitter.im/openMF/mifos) of Mifos.

Remember that this is an inclusive community, committed to creating a safe, positive environment. See the whole [Code of Conduct](CODE_OF_CONDUCT.md) and please follow it in all your interactions with the project.


## Submitting or Requesting an Issue/Enhancement

### Best Practices for reporting or requesting for Issues/Enhancements:
  - Before you submit an issue, please search the issue tracker, maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.
  - Follow the Issue Template while creating the issue.
  - Include Screenshots if any (specially for UI related issues).
  - For UI enhancements or workflows, include mockups to get a clear idea.

### Best Practices for getting assigned to work on an Issue/Enhancement:
- If you would like to work on an issue, inform in the issue ticket by commenting on it.
- Please be sure that you are able to reproduce the issue, before working on it. If not, please ask for clarification by commenting or asking the issue creator.

**Note:** Please do not work on an issue which is already being worked on by another contributor. We don't encourage creating multiple pull requests for the same issue. Also, please allow the assigned person at least 2 days to work on the issue (The time might vary depending on the difficulty). If there is no progress after the deadline, please comment on the issue asking the contributor whether he/she is still working on it. If there is no reply, then feel free to work on the issue.


## Submitting a Pull Request

### Best Practices to send Pull Requests:
  - Fork the [project](https://github.com/openMF/web-app) on GitHub
  - Clone the project locally into your system.
```
git clone https://github.com/your-username/web-app.git
```
  - Make sure you are in the `master` branch.
```
git checkout master
```
  - Create a new branch with a meaningful name before adding and committing your changes.
```
git checkout -b branch-name
```
  - Add the files you changed. (avoid using `git add .`)
```
git add file-name
```
  - Follow the style conventions for a [meaningful commit message](COMMIT_MESSAGE.md).
```
git commit
```
  - If you forgot to add some changes, you can edit your previous commit message.
```
git commit --amend
```
  - Squash multiple commits to a single commit. (example: squash last two commits done on this branch into one)
```
git rebase --interactive HEAD~2 
```
  - Push this branch to your remote repository on GitHub.
```
git push origin branch-name
```
  - If any of the squashed commits have already been pushed to your remote repository, you need to do a force push.
```
git push origin remote-branch-name --force
```
  - Follow the Pull request template and submit a pull request with a motive for your change and the method you used to achieve it to be merged with the `master` branch.
  - If you can, please submit the pull request with the fix or improvements including tests.
  - During review, if you are requested to make changes, rebase your branch and squash the multiple commits into one. Once you push these changes the pull request will edit automatically.


## Configuring remotes
When a repository is cloned, it has a default remote called `origin` that points to your fork on GitHub, not the original repository it was forked from. To keep track of the original repository, you should add another remote called `upstream`.

1. Set the `upstream`.
```
git remote add upstream https://github.com/openMF/web-app.git
```
2. Use `git remote -v` to check the status. The output must be something like this:
```
  > origin    https://github.com/your-username/web-app.git (fetch)
  > origin    https://github.com/your-username/web-app.git (push)
  > upstream  https://github.com/openMF/web-app.git (fetch)
  > upstream  https://github.com/openMF/web-app.git (push)
```
3. To update your local copy with remote changes, run the following: (This will give you an exact copy of the current remote. You should not have any local changes on your master branch, if you do, use rebase instead.)
```
git fetch upstream
git checkout master
git merge upstream/master
```
4. Push these merged changes to the master branch on your fork. Ensure to pull in upstream changes regularly to keep your forked repository up to date.
```
git push origin master
```
5. Switch to the branch you are using for some piece of work.
```
git checkout branch-name
```
6. Rebase your branch, which means, take in all latest changes and replay your work in the branch on top of this - this produces cleaner versions/history.
```
git rebase master
```
7. Push the final changes when you're ready.
```
git push origin branch-name
```

## After your Pull Request is merged
After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository.

1. Delete the remote branch on GitHub.
```
git push origin --delete branch-name
```
2. Checkout the master branch.
```
git checkout master
```
3. Delete the local branch.
```
git branch -D branch-name
```
4. Update your master branch with the latest upstream version.
```
git pull upstream master
```


## Skipping a Travis CI Build
If running a build is not required for a particular commit (in some cases like an update to README.md), add [ci skip] or [skip ci] to the git commit message. Commits that have [ci skip] or [skip ci] anywhere in the commit messages are ignored by Travis CI.


That's it! Thank you for your contribution!
