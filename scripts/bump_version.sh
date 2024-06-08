#!/bin/bash

LABELS=$1
DIRECTORY=$2
COMMIT_CHANGES=$3

cd $DIRECTORY
if echo "$LABELS" | grep -q "major"
then
  pnpm version major --no-git-tag-version
elif echo "$LABELS" | grep -q "minor"
then
  pnpm version minor --no-git-tag-version
else
  pnpm version patch --no-git-tag-version
fi

# Change back to the original directory
cd $ORIGINAL_DIRECTORY

# If the third argument is true, commit the changes
if [ "$COMMIT_CHANGES" = true ]; then
  git add .
  git commit -m "Bump version"
fi