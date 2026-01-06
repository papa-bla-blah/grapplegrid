# Git Quick Reference for GrappleGrid

## Daily Workflow

### 1. Check What Changed
```bash
git status                    # See modified files
git diff                      # See line-by-line changes
git diff src/App.js          # See changes in specific file
```

### 2. Save Your Work
```bash
git add .                     # Stage all changes
git add src/App.js           # Stage specific file
git commit -m "Your message" # Commit with message
```

### 3. View History
```bash
git log --oneline            # Compact history
git log --oneline -5         # Last 5 commits
git log --graph --all        # Visual branch history
```

## Branching for Experiments

### Create Branch for Testing
```bash
# Example: Testing different budget
git checkout -b experiment/budget-40

# Make changes, test, commit
git add .
git commit -m "Test 5x5 with 40pt budget instead of 50"

# Switch back to master
git checkout master
```

### Keep or Discard Experiment
```bash
# If experiment worked - merge it
git merge experiment/budget-40

# If experiment failed - just switch back to master
git checkout master
# The experiment branch still exists if you want to revisit
```

### Delete Branches
```bash
git branch -d experiment/budget-40     # Delete merged branch
git branch -D experiment/budget-40     # Force delete unmerged branch
```

## Time Travel (Viewing Old Versions)

### See Old Code Without Changing Anything
```bash
# List commits
git log --oneline

# View old version (replace abc1234 with actual commit hash)
git show abc1234:src/App.js
```

### Restore Old Version
```bash
# Restore one file from earlier commit
git checkout abc1234 -- src/App.js

# Now commit if you want to keep it
git commit -m "Reverted App.js to earlier version"
```

### Go Back Completely
```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Undo last commit and discard changes (CAREFUL!)
git reset --hard HEAD~1
```

## Comparing Versions

### Compare Changes
```bash
# Compare current file to last commit
git diff HEAD src/App.js

# Compare two commits
git diff abc1234 def5678

# Compare current to specific commit
git diff abc1234 HEAD
```

## Common Scenarios

### "I want to try something risky"
```bash
git checkout -b experiment/risky-change
# Make changes, test
# If good: git checkout master && git merge experiment/risky-change
# If bad: git checkout master (changes preserved in branch)
```

### "I made a mistake in my last commit message"
```bash
git commit --amend -m "Better commit message"
```

### "I want to save work but not commit yet"
```bash
git stash                    # Save changes temporarily
# Do other work, switch branches, etc.
git stash pop                # Restore saved changes
```

### "I want to see what was changed in a commit"
```bash
git show abc1234             # Show full commit details
```

### "I want to start fresh from last commit"
```bash
git reset --hard HEAD        # CAREFUL: Destroys uncommitted changes
git clean -fd                # Remove untracked files
```

## Branch Strategy for Development

### Main Branches
- **master**: Stable, working version
- **develop**: Integration branch for features

### Feature Branches
- **feature/scoring-system**: New feature development
- **experiment/budget-test**: Testing game balance
- **bugfix/column-constraint**: Fix specific bugs

### Workflow
```bash
# Start new feature
git checkout -b feature/ai-opponent

# Work and commit regularly
git add .
git commit -m "Add basic AI decision logic"
git commit -m "Improve AI strategy selection"
git commit -m "Add AI difficulty levels"

# Test thoroughly, export data, analyze

# If successful - merge to master
git checkout master
git merge feature/ai-opponent

# If not ready - keep in feature branch
# Can switch back anytime: git checkout feature/ai-opponent
```

## Tips

### Good Commit Messages
```bash
# Bad
git commit -m "fixed stuff"
git commit -m "updates"

# Good
git commit -m "Reduce 5x5 budget from 50 to 45 points"
git commit -m "Fix column constraint validation for zeros"
git commit -m "Add CSV export with score statistics"
```

### Commit Often
- Commit after each logical change
- Easier to find bugs
- Easier to undo specific changes
- Better history for review

### Before Big Changes
```bash
# Always create a branch first
git checkout -b experiment/big-change
# Now you can easily go back if needed
```

## Emergency Commands

### "I deleted everything by accident!"
```bash
git checkout HEAD .          # Restore all files from last commit
```

### "I committed to wrong branch!"
```bash
# Copy commit hash (abc1234)
git log --oneline

# Switch to correct branch
git checkout correct-branch

# Apply commit
git cherry-pick abc1234

# Switch back and remove commit
git checkout wrong-branch
git reset --hard HEAD~1
```

### "Help, I broke everything!"
```bash
# See all commits including "lost" ones
git reflog

# Find the commit before you broke things (def5678)
git reset --hard def5678
```

## Useful Aliases (Optional)

Add to ~/.gitconfig:
```bash
[alias]
    s = status
    co = checkout
    br = branch
    ci = commit
    l = log --oneline --graph --all
    last = log -1 HEAD
```

Then use:
```bash
git s         # Instead of git status
git co master # Instead of git checkout master
git l         # Pretty history graph
```
