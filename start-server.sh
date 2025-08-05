#!/bin/bash

echo "Installing server dependencies..."
npm install express cors

echo "Starting mock server..."
node mock-server.cjs
