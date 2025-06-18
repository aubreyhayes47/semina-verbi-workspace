#!/bin/sh
# Remove .env from all git history using git-filter-repo
# Usage: sh remove-env-history.sh

# 1. Ensure git-filter-repo is installed
if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo not found. Please install it with: pip install git-filter-repo"
  exit 1
fi

echo "Backing up current repository to ../semina-verbi-workspace-backup..."
cp -r . ../semina-verbi-workspace-backup

echo "Removing .env from all git history..."
git filter-repo --path .env --invert-paths

echo "Expiring reflog and running aggressive garbage collection..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Force-pushing cleaned history to origin/main..."
git push --force

echo "Done. All collaborators must re-clone the repository."
