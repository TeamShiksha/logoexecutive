# Contributing
When contributing to this repository, please first discuss your changes you with to make via issue, email, or any other method.

## Pull Request Process
Since this is a private repository and members in the project would likely to have read/write access, following the process would help us avoid trivial mistakes which could lead downtime.

### DO NOT DIRECTLY MAKE CHANGES TO THE MAIN BRANCH
We're using main branch as our deployment branch as well as our single source of truth for code changes, so it is really important to maintain integrity of our main branch.

## Before Pull request

The below command will run automatically when you commit any code, to avoid common problems,
such as syntax errors, formatting issues, code style violations, and potential
bugs:

The following command will check and alert on potential errors syntax errors, formatting issues.
```sh
npm run lint
# or
yarn lint
```

To apply a quick fix you can use the following command, but make sure the files that are changed are the ones you're modifying or adding.

```sh
npm run lint:fix-all
# or
yarn lint:fix-all
```

## Scope of the PR
Any PR created should only include changes that are under the scope of the issue or change and any external changes should be avoided. 

## PR Description and Reviews
Any PR which is associated to the issue should have a proper description, following things should be followed while writing description.
- Link issue the PR is related to. If no issue is present create one.
- Keep your code formatted properly so that reviewers can review your changes easily.
- Promptly reply to review comments and follow up on any unresolved issue.
- Avoid unecessary commits.

If the task has been assigned by someone, the person assigning the task should be treated as a feature owner and it should be the responsibility of the person to facilitate the pull requestor withthe process and should be mentioned in the PR review.

## Guide for reviewers
Review process is essential to any project, this also applies to the maintainers and contributors to provide proper feedback and actively participate in the project.
PR reviews have a tendency to become noisy and hence lenghten the timeline of a feature. Applying the following guideline will help us streamline this process.

**Providing docs whenever possible**
This applies to comments that include some kind of a better practice, whenever you are bringing a suggestion do provide a relevant doc that can be used as a reference/citation for the comment. This will help the team as well the pull requestor to better understand the purpose of the comment.

The document provided can be challenged by the team members and this should be done in the commentitself.

**Nit comments**
Suggestions that only deal with the formatting/syntax of the code should be avoided. If somehow the reviewer feels the need to mention it, they can write `NIT:` in the starting of the comment.
NIT comments are optional and if the pull requestor wishes to resolve them they can do so.
