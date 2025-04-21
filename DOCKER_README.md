# SentimentSage Docker Setup with Nginx

This document explains how to run SentimentSage using Docker with Nginx as a reverse proxy for improved performance.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
sentimentsage/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   └── ...
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── production.conf
├── docker-compose.yml
├── docker-compose.dev.yml
└── DOCKER_README.md
```

## Development Environment

To run the application in development mode:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Start the frontend development server with hot-reloading
- Start the backend Flask server in development mode
- Configure Nginx as a reverse proxy

Access the application at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- Nginx (proxied): http://localhost

## Production Environment

To build and run the application for production:

```bash
docker-compose up --build
```

This will:
- Build the frontend for production
- Run the backend with Gunicorn
- Configure Nginx with optimized settings for production

Access the application at:
- Nginx (proxied): http://localhost

## Performance Benefits

Using Nginx as a reverse proxy provides several performance benefits:

1. **Static File Serving**: Nginx efficiently serves static files (HTML, CSS, JS, images) with proper caching headers
2. **Compression**: Automatic gzip compression reduces bandwidth usage and improves load times
3. **Load Balancing**: Can distribute requests across multiple backend instances if needed
4. **Caching**: Implements browser caching for static assets
5. **Security**: Adds security headers and limits direct access to the application servers

## Configuration

### Nginx Configuration

The main Nginx configuration is in `nginx/nginx.conf`. Key features:

- Gzip compression for faster content delivery
- Optimized cache headers for static assets
- Proxy settings for API requests
- Security headers

### Production Configuration

For production deployment, use the `nginx/production.conf` which includes:

- SSL/TLS configuration (requires valid certificates)
- HTTP to HTTPS redirection
- Enhanced security headers
- Content Security Policy

## Customization

To customize the Nginx configuration:

1. Edit the appropriate configuration file (`nginx.conf` or `production.conf`)
2. Rebuild the Nginx container:
   ```bash
   docker-compose build nginx
   docker-compose up -d nginx
   ```

## Troubleshooting

### Checking Nginx Logs

```bash
docker-compose logs nginx
```

### Testing Nginx Configuration

```bash
docker-compose exec nginx nginx -t
```

### Reloading Nginx Configuration

```bash
docker-compose exec nginx nginx -s reload
```
