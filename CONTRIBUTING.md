# Getting Started

- View the [README](./README.md) or [watch this video](https://youtu.be/OnxxC3K2oro) to get your development environment up and running.
- Sign the [Contribution License Agreement](http://mifos.org/about-us/financial-legal/mifos-contributor-agreement/).
- Always follow the [code of conduct](https://mifos.org/resources/community/code-of-conduct/) - this is important to us. We are proud to be open, tolerant and providing a positive environment.
- Introduce yourself or ask a question on the [#webapp channel on Slack](https://app.slack.com/client/T0F5GHE8Y/CJJGJLN10).
- Find a [Jira](https://mifosforge.jira.com/browse/WEB) ticket to work on and start smashing!
- Sign up to the [mailing list](https://sourceforge.net/projects/mifos/lists/mifos-developer).
- Learn more at our [getting started guide](https://mifosforge.jira.com/wiki/spaces/RES/pages/464322561/New+Contributor+Getting+Started+Guide).
- Have a look at our [Wiki](https://github.com/openMF/web-app/wiki).

Tips for working with the web app repository:

- Learn how to [format pull requests](#submitting-a-pull-request).
- Read how to [rebase/merge upstream branches](#configuring-remotes).
- Understand our [commit message conventions](./.github/COMMIT_MESSAGE.md).

## Our processes

### Reporting or requesting Issues/Enhancements

- Before you submit an issue in Jira, please browse existing issues or ask on Slack. Maybe an issue for your problem already exists, or the discussion might inform you of workarounds readily available.
- Include screenshots if helpful (specially for UI related issues).
- For UI enhancements include mockups to provide a clear idea to the reader.

### Getting assigned and working on an Issue/Enhancement

- Always outline the change you wish to make via a Jira ticket _before_ contributing.
- Do not create Jira tickets for support questions. Jira is for bug reports and feature requests. (If you have questions, ask in the above Slack channel or write an email on the named mailing list.)
- If you would like to work on a Jira issue, make sure it is not assigned to someone else. (We do not appreciate pull requests for issues that are assigned to someone else or do not refer to a Jira ticket.)
- If you want to take over a ticket, ask the assignee in a comment (utilizing the "@" prefix), if you can. Wait 3 days, before you assign the ticket to yourself.
- If you don't work on a Jira ticket, unassign yourself.

## Jira

Our Jira tickets follow the following life cycle:

- To Do: The issue is not prioritized yet. Make sure it makes sense working on it by asking in Slack.
- On Deck: The issue can be worked on, but work hasn't been started. Often the issue has already someone assigned to it.
- In Progress: The issue is being worked on.
- In Review: There is a Pull Request on GitHub or the ticket is on hold, because someone needs to review made changes.
- Done: The Pull Request got merged on GitHub.
- Canceled: The ticket is unnecessary and for some reason (probably in the comments) work on it became unnecessary.

Updating the Jira ticket is the responsibility of the person working on it. Make in particular sure the Status field is up-to-date.

## Git and Github

### Best Practices to send Pull Requests

- Fork the [project](https://github.com/openMF/web-app) on GitHub
- Clone the project locally into your system.

```
git clone https://github.com/your-username/web-app.git
```

- We use the `main` branch for releases, hotfixes and special purposes. All regular work on releases flows into the `dev` branch.

```
git checkout dev
```

- Create a new branch with a meaningful name before adding and committing your changes.

```
git checkout -b branch-name
```

- Add the files you changed. (Better don't use `git add .`)

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

- Squash multiple commits to a single commit. (Example: squash last two commits done on this branch into one.)

```
git rebase --interactive HEAD~2
```

- Push this branch to your remote repository on GitHub.

```
git push --set-upstream origin branch-name
```

- If any of the squashed commits have already been pushed to your remote repository, you need to do a force push.

```
git push origin remote-branch-name --force
```

- Follow the Pull request template and submit a pull request with a motive for your change and the method you used to achieve it to be merged with the `dev` branch.
- If possible, please submit the pull request along with tests.
- During review, if you are requested to make changes, rebase your branch and squash commits into one again. Once you push these changes, the pull request will edit automatically.

### Configuring remotes

When a repository is cloned, it has a default remote called `origin` that points to your fork on GitHub, not the original repository it was forked from. To keep track of the original repository, you can add another remote called `upstream`.

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

3. To update your local copy with remote changes, run the following: (This will give you an exact copy of the current remote. You should not have any local changes on your dev branch, if you do, use rebase instead.)

```
git fetch upstream
git checkout dev
git merge upstream/dev
```

4. Push these merged changes to the dev branch on your fork. (Ensure to pull in upstream changes regularly to keep your forked repository up to date. Or you use the "Sync fork" button on top of the Github page of your fork, followed by `git pull`.)

```
git push origin dev
```

5. Switch to the branch you are using for some piece of work.

```
git checkout branch-name
```

6. Rebase your branch, which means, take in all latest changes and replay your work in the branch on top of this - this produces cleaner versions/history.

```
git rebase dev
```

7. Push the final changes when you're ready.

```
git push origin branch-name
```

### After your Pull Request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the dev (upstream) repository.

1. Delete the remote branch on GitHub.

```
git push origin --delete branch-name
```

2. Checkout the dev branch.

```
git checkout dev
```

3. Delete the local branch.

```
git branch -D branch-name
```

4. Update your dev branch with the latest upstream version.

```
git pull upstream dev
```

### Skipping a Travis CI Build

If running a build is not required for a particular commit (in some cases like an update to README.md), add [ci skip] or [skip ci] to the git commit message. Commits that have [ci skip] or [skip ci] anywhere in the commit messages are ignored by Travis CI.

**_Thank you for contributing!_**
