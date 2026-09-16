FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata \
	&& mkdir -p /app/data /app/uploads
COPY --from=build /api /app/api
ENV PORT=8080
EXPOSE 8080
CMD ["/app/api"]
