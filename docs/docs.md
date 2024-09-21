# Documentation

## 1. Logo Retrieval

### Basic

Our Basic Logo Retrieval service is a simple yet powerful API that fetches the
logo of a specific company using its domain name. The logo returned is in PNG
format.

**Endpoint:** `/api/business/logo?domain={DOMAIN}/API_KEY={YOUR_API_KEY}`

**Method:** GET

**Access:** Free

| Parameter | Type   | Description                                          | Required |
| --------- | ------ | ---------------------------------------------------- | -------- |
| domain    | string | The domain name of the company.                      | Yes      |
| API_KEY   | string | The API Key generated from the dashboard.            | Yes      |

**Example Call:**

```sh
https://api-logoexecutive.vercel.app/api/business/logo?domain=google&API_KEY=YOUR_API_KEY
https://api-logoexecutive.vercel.app/api/business/logo?domain=https://google.com&API_KEY=YOUR_API_KEY
https://api-logoexecutive.vercel.app/api/business/logo?domain=www.google.com&API_KEY=YOUR_API_KEY
```

## 2. Search (Now Available)

### Basic

The Basic Logo Search API allows users to fetch a list of logo URLs that start with the specified characters. This is particularly useful for identifying logos based on a domain name's prefix.

**Endpoint:** `api/business/search?domainKey={KEY}&API_KEY={YOUR_API_KEY}` 

**Method:** GET

**Access:** Paid

| Parameter  | Type   | Description                                                  | Required |
| ---------- | ------ | ------------------------------------------------------------ | -------- |
| domainKey  | string | The starting prefix of the domain name to filter logo URLs.   | Yes      | 
| API_KEY    | string | The API Key generated from the dashboard.                     | Yes      |

**Example Call:**

```sh
https://api-logoexecutive.vercel.app/api/business/search?domainKey=google&API_KEY=YOUR_API_KEY
```

We encourage you to explore and integrate these endpoints into your
applications. If you have any questions or need further assistance, please refer
to the provided examples or contact our support team.
