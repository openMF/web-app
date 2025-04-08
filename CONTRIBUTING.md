# Getting Started

- View the [README](./README.md) or [watch this video](https://youtu.be/OnxxC3K2oro) to get your development environment up and running.
- Learn how to [format pull requests](#submitting-a-pull-request).
- Read how to [rebase/merge upstream branches](#configuring-remotes).
- Understand our [commit message conventions](./.github/COMMIT_MESSAGE.md).
- Sign our [Mifos CLA](http://mifos.org/about-us/financial-legal/mifos-contributor-agreement/).
- Follow our [code of conduct](https://mifos.org/resources/community/code-of-conduct/).
- [Find a Jira ticket to work on](https://mifosforge.jira.com/browse/WEB) and start smashing!
- [Ask a question on Slack](https://app.slack.com/client/T0F5GHE8Y/CJJGJLN10).
- Learn more at our [getting started guide](https://mifosforge.jira.com/wiki/spaces/RES/pages/464322561/New+Contributor+Getting+Started+Guide).
- Have a look at our [Wiki](https://github.com/openMF/web-app/wiki).

Please outline the change you wish to make via a Jira ticket _before_ you start contributing. And please do not create Jira tickets for general support questions, as we want to keep Jira for bug reports and feature requests. If you have got any questions, the quickest way to get an answer is to join the above Slack channel. You can also write an email on our [mailing list](https://sourceforge.net/projects/mifos/lists/mifos-developer). Mifos has quite a few active repositories, and each has its own Slack channel to direct questions to.

Mifos is an inclusive community, committed to creating a safe, positive environment. Read the above Code of Conduct, and please follow it in all your interactions with the project.

## Submitting or Requesting an Issue/Enhancement

### Best Practices for reporting or requesting for Issues/Enhancements:

- Before you submit an issue, please search Jira. Maybe an issue for your problem already exists, and the discussion might inform you of workarounds readily available.
- Include screenshots if any (specially for UI related issues).
- For UI enhancements include mockups to provide a clear idea to the reader.

### Best Practices for getting assigned to work on an Issue/Enhancement:

- If you would like to work on an issue, make sure it is not assigned to someone else.
- If you don't work on a Jira ticket, please unassign yourself.
- Please be sure that you are able to reproduce the issue, before working on it. If not, please ask for clarification by commenting or asking the issue creator.

**Note:** Please do not work on an issue which is assigned to someone else. We don't encourage creating multiple pull requests for the same issue. Also, please allow the assigned person at least 3 days to work on an issue. If there is no progress after this deadline, comment on the issue asking the contributor whether he/she is still working on it. Only if there is no reply after a couple of days, assign the ticket to you and work on it.

### Jira ticket life cycle

- To Do: The issue is not prioritized yet. Make sure it make sense working on it by asking in Slack.
- On Deck: The issue can be worked on, but work hasn't been started. Often the issue has already someone assigned to it.
- In Progress: The issue is being worked on.
- In Review: There is a Pull Request on GitHub or the ticket is on hold, because someone needs to review made changes.
- Done: The Pull Request got merged on GitHub.
- Canceled: The ticket is unnecessary and for some reason (probably in the comments) work on it became unnecessary.

## Submitting a Pull Request

### Best Practices to send Pull Requests:

- Fork the [project](https://github.com/openMF/web-app) on GitHub
- Clone the project locally into your system.

```
git clone https://github.com/your-username/web-app.git
```

- Make sure you are in the `main` branch.

```
git checkout main
```

- Create a new branch with a meaningful name before adding and committing your changes.

```
git checkout -b branch-name
```

- Add the files you changed. (avoid using `git add .`)

```
git add file-name
```

- Follow the style conventions for a [meaningful commit message](./.github/COMMIT_MESSAGE.md).

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

- Follow the Pull request template and submit a pull request with a motive for your change and the method you used to achieve it to be merged with the `main` branch.
- If you can, please submit the pull request with the fix or improvements including tests.
- During review, if you are requested to make changes, rebase your branch and squash the multiple commits into one again. Once you push these changes, the pull request will edit automatically.

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

3. To update your local copy with remote changes, run the following: (This will give you an exact copy of the current remote. You should not have any local changes on your main branch, if you do, use rebase instead.)

```
git fetch upstream
git checkout main
git merge upstream/main
```

4. Push these merged changes to the main branch on your fork. Ensure to pull in upstream changes regularly to keep your forked repository up to date.

```
git push origin main
```

5. Switch to the branch you are using for some piece of work.

```
git checkout branch-name
```

6. Rebase your branch, which means, take in all latest changes and replay your work in the branch on top of this - this produces cleaner versions/history.

```
git rebase main
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

2. Checkout the main branch.

```
git checkout main
```

3. Delete the local branch.

```
git branch -D branch-name
```

4. Update your main branch with the latest upstream version.

```
git pull upstream main
```

## Skipping a Travis CI Build

If running a build is not required for a particular commit (in some cases like an update to README.md), add [ci skip] or [skip ci] to the git commit message. Commits that have [ci skip] or [skip ci] anywhere in the commit messages are ignored by Travis CI.

That's it! Thank you for your contribution!
