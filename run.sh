#!/bin/bash

set -e
DOCKERBIN="docker"
if which podman; then
    DOCKERBIN="podman"
elif which docker; then
    DOCKERBIN="docker"
fi
TAG="simplefin/website"
set -x

"$DOCKERBIN" build -t "$TAG" .
"$DOCKERBIN" run --rm -it -p 4000:4000 -v "$(pwd):/code" -w /code "$TAG" /usr/local/bin/bundler exec jekyll serve --host 0.0.0.0
