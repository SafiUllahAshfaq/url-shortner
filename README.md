# url-shortner

## Pre Requisites

1. Docker
2. Docker-compose
3. Node.js, Redis, MongoDB _(if you want to run app without docker)_

## Setup Instructions

1. Clone the repository
2. Run `cd server`
3. Run `docker-compose up --build` _(`--detach` if you want to run app in background)_

## API Documentation

This API documentation provides details about the endpoints available in the Short URL service.

### Base URL

The base URL for all endpoints is `http://locahost:3009/api`.

### Endpoints

#### Create Short URL

**Description:** Create a short URL from the provided original URL.

Request cURL

```curl
curl --location 'http://localhost:3009/api/url' \
--header 'Content-Type: application/json' \
--data '{
    "originalUrl": "https://www.npmjs.com/package/nanoidd"
}'
```

Possible Responses

- If successful

  > STATUS: 200 OK
  >
  > ```json
  > {
  >   "shortUrl": "tier.app/<short-url>"
  > }
  > ```

- If originalUrl not provided in request body

  > STATUS: 400 Bad Request
  >
  > ```json
  > {
  >   "error": "\"originalUrl\" is required"
  > }
  > ```

- If rate limit hit _(60 requests per IP per hour allowed)_

  > STATUS: 429 Too Many Requests
  >
  > ```json
  > Too many requests, please try again later.
  > ```

#### Get Original URL

**Description:** Retrieve the original URL corresponding to the provided short URL.

```curl
curl --location 'http://localhost:3009/api/url/:shortUrl'
```

Possible Responses

- If URL found

  > STATUS: 200 OK
  >
  > ```json
  > {
  >   "originalUrl": "<original-url>",
  >   "visits": 7
  > }
  > ```

- If URL not found

  > STATUS: 404 Not Found
  >
  > ```json
  > {
  >   "error": "URL not found!"
  > }
  > ```

- If rate limit hit _(400 requests per IP per hour allowed)_

  > STATUS: 429 Too Many Requests
  >
  > ```json
  > Too many requests, please try again later.
  > ```

### Notes for reviewer

**I have put inline multiple "NOTE" in the codebase for communicating my decision making. Revieweing them will be super helpful in evaluating what was going on in my mind while attempting this challenge**

#### - Database

- I have decided to go with MongoDB as this is a simple CRUD application and MongoDB is a good fit for such applications
- Being a NoSQL database, it is easy to scale MongoDB horizontally by adding more nodes to the cluster. This will help in scaling the application in future.

#### - Caching

- I am using redis cache to store shortUrl -> originalUrl mapping. This will help in reducing the load on the database and also helps with faster retrieval of originalUrl for a given shortUrl.
- I have put caching only for GET requests as it is the most frequently used endpoint. We can add caching for POST requests as well if required.

#### - Rate Limiting

- For the sake of this assignment, I have used a simple in-memory rate limiter. This will not work in a distributed environment. For a distributed environment, we can use a distributed cache like Redis to store the rate limit data.
- It's a "fixed window" rate limiter but in real world we should use a sliding window or token bucket or some other more sophisticated rate limiter that fits our use case.
- With IP based rate limiting, there are some corner cases that needs to be handled
  - Replaying an http request with same parameters will result in a rate limit hit

#### - Authentication

- Currently, this API does not require any authentication.
- Implementing authentication mechanisms (e.g., API keys, OAuth, JWT) would definitely help to restrict access to certain endpoints or to track API usage by specific users.

---

> **Note**
> Please note that the base URL and other details in the documentation are placeholders. Feel free to change them.
