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
https://logoexecutive.netlify.app/api/business/logo?domain=google&API_KEY=YOUR_API_KEY
https://logoexecutive.netlify.app/api/business/logo?domain=https://google.com&API_KEY=YOUR_API_KEY
https://logoexecutive.netlify.app/api/business/logo?domain=www.google.com&API_KEY=YOUR_API_KEY
```

## 2. Search (Comming soon)

### Basic

The Basic Logo Search API fetches a list of logo URLs that start with the
specified characters. This is useful for displaying a variety of logos that
share a common theme.

**Endpoint:** `/api/logo/search?key={KEY}&API_KEY={YOUR_API_KEY}`

**Method:** GET

**Access:** Paid

| Parameter | Type   | Description                                                    | Required |
| --------- | ------ | -------------------------------------------------------------- | -------- |
| key       | string | The initial character(s) that the logo URLs should begin with. | Yes      |
| API_KEY   | string | The API Key generated from the dashboard.                      | Yes      |

**Example Call:**

```sh
https://logoexecutive.netlify.app/api/business/logo/search?size=36&format=jpg&key=g&API_KEY=YOUR_API_KEY
```

We encourage you to explore and integrate these endpoints into your
applications. If you have any questions or need further assistance, please refer
to the provided examples or contact our support team.
