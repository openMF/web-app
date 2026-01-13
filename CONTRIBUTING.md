# Contributing to Mifos X Web App

Thank you for your interest in contributing to the Mifos X Web App! We welcome contributions from the community to help improve financial inclusion solutions globally.

To ensure a smooth collaboration process and maintain code quality, we enforce a strict **7-Step Contribution Workflow**. Please read this guide carefully before submitting any code.

## Quick Links

- View the [README](./README.md) or [watch this video](https://youtu.be/OnxxC3K2oro) to get your development environment up and running.
- Sign the [Contribution License Agreement](http://mifos.org/about-us/financial-legal/mifos-contributor-agreement/).
- Always follow the [code of conduct](https://mifos.org/resources/community/code-of-conduct/) - this is important to us.
- Learn more at our [getting started guide](https://mifosforge.jira.com/wiki/spaces/RES/pages/464322561/New+Contributor+Getting+Started+Guide).
- Have a look at our [Wiki](https://github.com/openMF/web-app/wiki).
- Sign up to the [mailing list](https://sourceforge.net/projects/mifos/lists/mifos-developer).

---

## The Golden Rule: Discuss First

> **Do not open a Pull Request without prior discussion.**

We avoid "surprise" contributions. Before writing code, you must validate your idea with the community to ensure it aligns with the roadmap and isn't already in progress.

---

## Step 1: Discuss on Slack

Before you start coding (especially for new features, UI changes, or refactoring), you must signal your intent.

1. **Join the Community:** [Mifos Slack](https://mifos.slack.com)
2. **Find the Channel:** Navigate to `#web-app`
3. **Post Your Proposal:**
   - **Features:** Explain what you want to build and why.
   - **Bugs:** Briefly explain the issue and provide screenshots if applicable.
4. **Wait for Approval:** Do not proceed until a maintainer or community member acknowledges the task is valid and free for you to take.

---

## Step 2: Jira Issue Tracking

All development work is tracked in Jira to manage the release backlog and ensure transparency.

- **System:** [Mifos Jira](https://mifosforge.jira.com)
- **Project:** WEB (Mifos X Web App)
- **Board:** [Board 62](https://mifosforge.jira.com/jira/software/c/projects/WEB/boards/62) (Active Development Board)

### Workflow

1. **Search:** Check the [Jira Board](https://mifosforge.jira.com/jira/software/c/projects/WEB/boards/62) to ensure the ticket doesn't already exist.
2. **Create:** If unique, create a new ticket in Project WEB.
   - **Summary:** `[Component] Concise description` (e.g., `[Client] Fix submit button alignment`)
   - **Description:** Steps to reproduce, expected result, actual result, and environment details.
3. **Assign:**
   - Assign the ticket to yourself if you have permissions.
   - If you lack permissions, comment "I am working on this" on the ticket and ask a maintainer to assign it to you.
4. **Manage Status:**
   - **To Do:** Task is open.
   - **In Progress:** Move here immediately when you begin coding.
   - **In Review:** Move here when you post the PR link in the comments.
   - **Done:** Do not move here. Maintainers will move the ticket to Done after the PR is merged.

---

## Step 3: Branching Strategy

We follow a strict branching model to keep our history clean.

- **Upstream Branch:** Always branch from `dev`. Never branch from `master` or `main`.
- **Naming Convention:** Your branch name must include the Jira Ticket ID.
  - **Format:** `WEB-<ID>-<short-description>`
  - **Example:** `git checkout -b WEB-123-fix-login-button`

### Reserved Branch Names and Tags

The following branch names and tags (and derivatives and extensions e.g., `releasev1.0`) are reserved for use by Mifos Organisation. Any branches created by non-admins with these names will be deleted without notice:

- `main`
- `master`
- `dev`
- `development`
- `sec`
- `security`
- `mifos`
- `release`
- `rel`
- `rc`
- `staging`
- `prod`
- `production`
- `gsoc`

---

## Step 4: UI/UX Consistency

The Web App utilizes Angular Material. Design consistency is critical for user trust in financial software.

### Visual Checks

- **Reference:** Match the Figma mockup or the existing page layout exactly.
- **Grid System:** Spacing must be multiples of 8px (8px, 16px, 24px). Do not use arbitrary values like 10px or 15px.
- **Typography:** Use standard fonts (Roboto) and weights (500 for headers) defined in the SCSS variables.
- **Components:** Always use Angular Material components (e.g., `<mat-select>`, `<mat-card>`) instead of native HTML tags.

### Evidence Requirement

You must attach **"Before"** and **"After"** screenshots to your Pull Request description. PRs involving UI changes without screenshots will be declined.

---

## Step 5: Code Formatting (Prettier)

We use Prettier to enforce a consistent code style automatically. This eliminates "style wars" in code review.

- **Configuration:** The project includes a `.prettierrc` file.
- **Run Prettier:** Before committing, run the following command in the root directory:
  ```bash
  npx prettier --write .
  ```
- **Linting:** Ensure your code passes Angular linting:
  ```bash
  ng lint
  ```

> ⚠️ If the CI build fails due to formatting or linting errors, your PR will not be reviewed.

---

## Step 6: Commit Hygiene (Squash)

We maintain a linear, meaningful git history.

- **One Feature = One PR:** Do not combine unrelated fixes.
- **Squash Requirement:** If your PR contains more than 2 commits, you must squash them.
  - ❌ **Bad History:** `init`, `wip`, `typo`, `fix`, `fix again`
  - ✅ **Good History:** `WEB-123: Implement client search functionality`

**How to Squash:**

```bash
git rebase -i HEAD~N  # Replace N with the number of commits
# Mark the first commit as 'pick' and subsequent commits as 'squash'
git push --force-with-lease
```

---

## Step 7: Pull Request Checklist

When you are ready to submit your PR:

- [ ] **Target:** The `dev` branch.
- [ ] **Title:** Includes the Jira Key (e.g., `WEB-123: Fix login button`).
- [ ] **Description:** Includes a link to the Jira ticket.
- [ ] **Context:** Includes a link to the Slack discussion or summary of approval.
- [ ] **Visuals:** "Before" and "After" screenshots are attached (if UI related).
- [ ] **Quality:** Prettier formatting is applied and `ng lint` passes.

---

## Getting Help

If you get stuck, please reach out in the `#web-app` channel on [Slack](https://mifos.slack.com). We are happy to help you navigate the codebase or troubleshoot environment issues!

---

## Additional Resources

- Learn how to [format pull requests](#best-practices-to-send-pull-requests).
- Read how to [rebase/merge upstream branches](#configuring-remotes).
- Understand our [commit message conventions](./.github/COMMIT_MESSAGE.md).

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
