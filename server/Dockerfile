FROM golang:1.25-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /onepiece ./cmd/onepiece

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /onepiece /onepiece
EXPOSE 8080
ENTRYPOINT ["/onepiece"]
