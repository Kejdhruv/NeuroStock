#!/bin/bash

# Get all changed/untracked files
files=( $(git status -s | awk '{print $2}') )

# How many files to commit at once
batch_size=1000
total=${#files[@]}
start=0

while [ $start -lt $total ]; do
  end=$((start + batch_size))
  if [ $end -gt $total ]; then
    end=$total
  fi
  
  batch=("${files[@]:start:end-start}")
  
  echo "Adding files $start to $((end - 1))..."
  git add "${batch[@]}"
  
  echo "Committing batch..."
  git commit -m "Partial commit: files $start to $((end - 1))"
  
  echo "Pushing to remote..."
  git push
  
  start=$end
done

echo "✅ All files committed and pushed in batches."


