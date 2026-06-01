#!/bin/sh
export DATABASE_URL=postgres://onepiece:onepiece@localhost:5432/onepiece
export PORT=8080
export WEB_URL=http://localhost:3000
export LOG_FORMAT=text

go run ./cmd/onepiece
