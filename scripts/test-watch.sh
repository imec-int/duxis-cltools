#!/usr/bin/env bash

nodemon \
  --watch js \
  --watch tests \
  --ext js,jsx,json,yml \
  --exec 'mocha --bail --recursive tests'
