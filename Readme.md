# Grammar & Spell Checker Application

A web-based grammar and spell checking application that helps users identify and correct grammatical errors and spelling mistakes in their text. The application provides real-time feedback with suggestions for improvements, making it a valuable tool for writers, students, and professionals.

## Features

- **Real-time Grammar Checking**: Analyze text for grammatical errors and spelling mistakes
- **Interactive Suggestions**: Click-to-apply corrections with detailed explanations
- **Filtering Options**: Filter results by issue type (All Issues, Spelling Only, Grammar Only)
- **Copy Functionality**: Copy all suggestions to clipboard for easy reference
- **Clean Interface**: User-friendly web interface with responsive design
- **Clear Function**: Reset the application with a single click

## API Information

This application uses the **TextGears Grammar Check API** from RapidAPI:

- **API Documentation**: [TextGears API on RapidAPI](https://rapidapi.com/textgears/api/textgears1)
- **API Endpoint**: `https://textgears-textgears-v1.p.rapidapi.com/grammar`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`

### Getting API Keys

1. Visit [RapidAPI TextGears](https://rapidapi.com/textgears/api/textgears1)
2. Sign up for a RapidAPI account if you don't have one
3. Subscribe to the TextGears API (free tier available)
4. Copy your API key from the dashboard

## Project Structure

```
grammar-checker/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript functionality
├── Dockerfile          # Docker configuration
├── .gitignore          # Git ignore file
├── .dockerignore       # Docker ignore file
├── .env                # Environment variables (not used for static web)
└── README.md           # This file
```

## Docker Hub Repository

- **Repository URL**: [https://hub.docker.com/r/appoemaster/summative-gramar-checker](https://hub.docker.com/r/appoemaster/summative-gramar-checker)
- **Image Name**: `appoemaster/summative-gramar-checker`
- **Available Tags**: `v1`, `latest`

## Local Development

### Prerequisites

- Web browser (Chrome, Firefox, Safari, etc.)
- Docker (for containerization)

### Running Locally (Without Docker)

1. Clone the repository:

```bash
git clone <your-repository-url>
cd grammar-checker
```

2. Open `index.html` in your web browser
3. The application should load and be ready to use

### Building Docker Image Locally

```bash
# Build the Docker image
docker build -t appoemaster/summative-gramar-checker:v1 .

# Test the container locally
docker run -p 8080:8080 appoemaster/summative-gramar-checker:v1

# Verify it works
curl http://localhost:8080
# Or open http://localhost:8080 in your browser
```

## Deployment Instructions

### Step 1: Pull Docker Image on Web Servers

SSH into both **web-01** and **web-02** servers and run:

```bash
# Pull the image from Docker Hub
docker pull appoemaster/summative-gramar-checker:v1

# Run the container on each server
docker run -d --name grammar-app --restart unless-stopped \
  -p 8080:8080 appoemaster/summative-gramar-checker:v1
```

### Step 2: Verify Individual Server Access

Ensure each instance is accessible:

- **Web-01**: `http://web-01:8080`
- **Web-02**: `http://web-02:8080`

### Step 3: Configure Load Balancer (HAProxy)

Update the HAProxy configuration file (`/etc/haproxy/haproxy.cfg`) on **lb-01**:

```haproxy
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

### Step 4: Reload HAProxy Configuration

```bash
# Reload HAProxy configuration
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

## Testing Load Balancing

### End-to-End Testing

1. **Test Round-Robin Distribution**:

```bash
# Run multiple requests to verify load balancing
for i in {1..10}; do
  curl -s http://localhost | grep -o "Server: [^<]*" || echo "Request $i completed"
  sleep 1
done
```

2. **Browser Testing**:

   - Access the application through the load balancer: `http://localhost`
   - Check browser developer tools → Network tab to verify responses
   - Submit multiple grammar check requests to test functionality

3. **Evidence Collection**:
   - Monitor HAProxy stats (if enabled)
   - Check server logs on both web-01 and web-02
   - Take screenshots of successful responses from both servers

### Verification Steps

✅ Application loads correctly through load balancer  
✅ Grammar checking functionality works as expected  
✅ Traffic alternates between web-01 and web-02  
✅ Both servers handle requests without errors  
✅ Load balancer health checks pass for both backends

## Security Considerations

### API Key Management

**Current Implementation**: API key is embedded in the client-side JavaScript for demonstration purposes.

**Production Recommendations**:

1. **Environment Variables**: Store API keys as environment variables
2. **Backend Proxy**: Implement a backend service to proxy API requests
3. **Key Rotation**: Regularly rotate API keys
4. **Rate Limiting**: Implement client-side rate limiting

### Hardening Steps (Production Ready)

For a production deployment, consider:

```dockerfile
# In Dockerfile, use environment variables
ENV RAPIDAPI_KEY=""

# Pass API key at runtime
docker run -d --name grammar-app \
  -e RAPIDAPI_KEY="your-api-key-here" \
  -p 8080:8080 appoemaster/summative-gramar-checker:v1
```

## Usage Instructions

1. **Enter Text**: Type or paste text into the input textarea
2. **Check Grammar**: Click "Check Grammar" button to analyze the text
3. **Review Results**: View detected issues with suggestions below
4. **Filter Results**: Use dropdown to filter by issue type (All/Spelling/Grammar)
5. **Copy Suggestions**: Click "Copy Suggestions" to copy all corrections
6. **Clear**: Use "Clear" button to reset the application

## API Credits

This application uses the **TextGears Grammar Check API** provided by TextGears team via RapidAPI. Special thanks to:

- **TextGears**: For providing the grammar checking service
- **RapidAPI**: For hosting and managing the API infrastructure

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Container**: Nginx serving static files
- **Port**: 8080 (configurable)
- **Load Balancing**: HAProxy round-robin distribution

## Troubleshooting

### Common Issues

1. **API Rate Limits**: Free tier has limited requests per day
2. **CORS Issues**: Ensure proper API headers are set
3. **Container Not Starting**: Check port availability (8080)
4. **Load Balancer Issues**: Verify server IP addresses in HAProxy config

### Logs and Debugging

```bash
# Check container logs
docker logs grammar-app

# Check container status
docker ps -a

# Test container health
docker exec -it grammar-app sh
```

## Development Challenges Overcome

1. **API Integration**: Successfully integrated RapidAPI with proper authentication headers
2. **Static File Serving**: Configured Nginx to serve static files efficiently in Docker
3. **Load Balancing**: Properly configured HAProxy for round-robin distribution
4. **Error Handling**: Implemented graceful error handling for API failures
5. **User Experience**: Added loading states and interactive feedback

## Contributing

This project is part of an academic assignment. The code is original work and follows best practices for web development and containerization.

---

**Author**: [Aime SHYAKA]
