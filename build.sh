#!/bin/bash

# This should get you from a fresh git clone of the repo to a running app from nothing else.

# Requirements
#####
# The only requirements should be :
# - node (and npm)
#
# In addition declared dependencies in package.json and bower.json, the following requirements will be installed by this script if not already installed:
# - TypeScript transpiler
# - tsd and various TypeScript definitions declared in tsd.json

# Ensure that node is installed. If not give the user a friendly message:
echo "Checking for npm..."
command -v npm > /dev/null || { echo >&2 "npm not installed. Install node.js at http://nodejs.org and run this again."; exit 1; }
echo "Checking for npm complete."

# npm: Ensure npm dependencies are installed
#  Installs node-related dependencies from npm (typescript, and gulp build tool-related packages are also installed via npm)
#  The actual packages installed are declared in package.json.
echo "Installing npm packages declared in package.json..."
npm install
echo "Installing npm packages complete."

# tsd: NOTE: Installing TypeScript definition files not really needed. Generally those are to be committed to the source repo.
echo "Checking for typings..."
command -v typings > /dev/null || { echo "typings not installed. installing..."; npm install -g typings; }
echo "Checking / installing tsd complete."
# typings install angular2 es6-promise rx rx-lite -sor
typings update

# echo "Checking for gulp..."
# command -v gulp > /dev/null || { echo "gulp not installed. installing..."; npm install -g gulp-cli; }
# echo "Checking / installing gulp complete."
#
# # gulp: gulp is the build tool that runs the build script gulpfile.coffee and the with no arguments the default task registered therein.
# gulp
