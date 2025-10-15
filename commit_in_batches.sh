#!/bin/bash

# Get list of staged files
files=( $(git diff --cached --name-only) )

batch_size=1000
total=${#files[@]}
start=0

while [ $start -lt $total ]; do
  end=$((start + batch_size))
  if [ $end -gt $total ]; then
    end=$total
  fi

  batch=("${files[@]:start:end-start}")

  # Unstage everything first to handle next batch cleanly
  git reset

  # Stage this batch again
  git add "${batch[@]}"

  # Commit the batch
  git commit -m "Partial commit: files $start to $((end - 1))"
  
  # Push if you want
  git push

  start=$end
done

echo "✅ All staged files committed in batches."



