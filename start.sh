#!/bin/bash
export NODE_ENV=production
npm run build && node dist/index.js
