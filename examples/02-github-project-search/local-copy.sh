#!/bin/bash

rm -rf node_modules/react-redux-model/lib/*
cd ../..
npm run build
cp -rf lib examples/02-github-project-search/node_modules/react-redux-model
