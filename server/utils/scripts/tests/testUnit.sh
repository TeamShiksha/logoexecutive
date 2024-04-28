#!/bin/bash

# set 'test' environment
export NODE_ENV='test'

# get project_id value from firestore config

echo 'Start firestore emulator and run unit tests:'
firebase emulators:exec 'yarn test' --project=logoexecutive-d1e9a