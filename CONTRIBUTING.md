# Contributing to Ft_transcendence

## Getting Started

- clone the repository
- git switch to your branch : `git checkout feature/<your-feature>`

	**features :**
			- `chat_matchmaking`
			- `game`
			- `scnd_game`
			- `user_mgmnt`
	
- Keep your branch updated:

   ```bash
   git fetch origin
   git merge origin/develop
   ```
## Branch Strategy

### Branch Structure

```
main (production-ready code)
  └── develop (integration branch)
       ├── feature/chat_matchmaking
       ├── feature/game
       ├── feature/scnd_game
       └── feature/user_mgmnt
```
### Working on Your Feature

1. **Always work on your assigned feature branch**
2. **Keep your branch updated with develop:**
   ```bash
   git checkout feature/<your-feature>
   git fetch origin
   git merge origin/develop
   ```

3. **Commit your changes regularly** (see commit style below)

4. **Push your changes:**
   ```bash
   git push origin feature/<your-feature>
   ```
### Branch Protection Rules

- **main** and **develop** branches are protected
- Direct pushes to these branches are **not allowed**
- All changes must go through Pull Requests
- PRs(pull request) require two member approvals before merging

## Commmit style :
	<type>(<scope>): <subject>

**Types:** 
	`feat, fix, docs, style, chor, test, refactor, ci`
### Scope

The scope should indicate which feature or component is affected:
- `game`
- `chat`
- `matchmaking`
- `user`
- `auth`
- `ui`
- `api`

**examples :**
```
feat(game): add game logic

fix(chat): resolve connection timeout

docs(readme): update installation steps
```
## Best Practices for Writing Commit Messages
- Use the imperative mood (e.g., "fix bug," not "fixed bug")
- Keep the subject line under 50 characters
- Don't end the subject with a period

## Pull Request Process

### Creating a Pull Request

1. **Ensure your branch is up to date:**
   ```bash
   git checkout feature/<your-feature>
   git fetch origin
   git merge origin/develop
   ```

2. **Push your latest changes:**
   ```bash
   git push origin feature/<your-feature>
   ```

3. **Create a PR on GitHub:**
   - Go to the repository on GitHub
   - Click "Pull Requests" → "New Pull Request"
   - **Base branch:** `develop`
   - **Compare branch:** `feature/<your-feature>`
   - Add a descriptive title and description
## Testing

### Automated Testing

- **GitHub Actions** will automatically run tests when you create or update a PR
- Tests must pass before your PR can be merged
- Check the "Actions" tab on GitHub to see test results
### Running Tests Locally

Before pushing, run tests locally to catch issues early:

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- <test-file>

# Run tests in watch mode
npm test -- --watch
```
### Writing Tests

- in the tests/ folder, add a file for each feature <feature>.test.ts (run with Jest)
- Write tests for new features
- Update tests when modifying existing functionality
- Aim for meaningful test coverage
- Test both success and failure cases

## Code Review Guidelines

### For Authors

When submitting a PR:
- Keep PRs focused and reasonably sized
- Provide clear descriptions and context
- Respond to feedback promptly
- Don't take feedback personally - we're all learning!

### For Reviewers

When reviewing a PR:
- Review within **24-48 hours** when possible
- Be constructive and respectful in feedback
- Check for:
  - Code functionality and correctness
  - Following of project conventions
  - Potential bugs or edge cases
  - Code readability and maintainability
  - Test coverage

### Review Response Time

- Aim to review PRs within **1-2 days**
- If you can't review in time, let the team know
- Authors should address feedback within **1-2 days**

## Merging Strategy

### When Your Feature is Complete

1. **Create a PR from your feature branch to `develop`**
2. **Get approval from at least one teammate**
3. **Ensure all tests pass**
4. **The DevOps lead will merge your PR**

### Final Integration

Once all features are complete and tested:
- All feature branches will be merged into `develop`
- After final testing, `develop` will be merged into `main`
- `main` represents production-ready code

## Getting Help

If you have questions or run into issues:
- Ask in the team chat(discord)
- Reach out to the DevOps lead

## Quick Reference

```bash
# Setup
git clone <repo-url>
git checkout feature/<your-feature>

# Daily workflow
git fetch origin
git merge origin/develop
# ... make changes ...
git add .
git commit -m "type(scope): description"
git push origin feature/<your-feature>

# Create PR on GitHub
# Base: develop ← Compare: feature/<your-feature>
```
Happy coding :D