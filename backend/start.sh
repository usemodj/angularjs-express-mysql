#!/bin/bash
NODE_ENV=production PORT=3000 pm2 start $(dirname "$0")/bin/forever

