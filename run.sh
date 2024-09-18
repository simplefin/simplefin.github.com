#!/bin/bash

set -e
TAG="simplefin/website"
docker build -t "$TAG" .
set -x
docker run --rm -it -p 4000:4000 -v "$(pwd):/code" -w /code "$TAG" /usr/local/bin/bundler exec jekyll serve --host 0.0.0.0
