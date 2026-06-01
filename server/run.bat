@echo off
set DATABASE_URL=postgres://onepiece:onepiece@localhost:5432/onepiece
set PORT=8080
set WEB_URL=http://localhost:3000
set LOG_FORMAT=text

go run ./cmd/onepiece
