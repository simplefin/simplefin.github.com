FROM ubuntu:22.04
RUN apt-get update -q && \
  apt-get install -y ruby-full build-essential zlib1g-dev
RUN gem install jekyll bundler
RUN bundler config --global silence_root_warning true
COPY Gemfile .
RUN bundler install
RUN bundle install

EXPOSE 4000

