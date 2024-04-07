# Documentation

## 1. Logo Retrieval

### Basic

Our Basic Logo Retrieval service is a simple yet powerful API that fetches the
logo of a specific company using its domain name. The logo returned is in PNG
format and has a default size of 24px.

**Endpoint:** `/logo?key={domain name}`

**Method:** GET

**Access:** Free

| Parameter | Type   | Description                                          | Required |
| --------- | ------ | ---------------------------------------------------- | -------- |
| key       | string | The domain name of the company whose logo is needed. | Yes      |

**Example Call:**

```sh
https://logoexecutive.netlify.app/v1/logo?key=google
```

### Custom

The Custom Logo Retrieval service extends the basic service by offering
customization options. Users can specify the size in pixels and the format
(e.g., jpg, png) of the logo, allowing for seamless integration of the logo into
their specific application interfaces.

**Endpoint:** `/logo?size={size}&format={format}&key={domain name}`

**Method:** GET

**Access:** Paid

| Parameter | Type    | Description                                          | Required |
| --------- | ------- | ---------------------------------------------------- | -------- |
| size      | integer | Desired size of the logo in pixels.                  | Yes      |
| format    | string  | Desired format of the logo (e.g., jpg, png).         | Yes      |
| key       | string  | The domain name for which the logo is to be fetched. | Yes      |

**Example Call:**

```sh
https://logoexecutive.netlify.app/v1/logo?size=36&format=jpg&key=google
```

## 2. Search

### Basic

The Basic Logo Search API fetches a list of logo URLs that start with the
specified characters. This is useful for displaying a variety of logos that
share a common theme. The default size of the logos is 32px.

**Endpoint:** `/logo/search?key={character(s)}`

**Method:** GET

**Access:** Paid

| Parameter | Type   | Description                                             | Required |
| --------- | ------ | ------------------------------------------------------- | -------- |
| key       | string | The character(s) with which the logo URLs should start. | Yes      |

**Example Call:**

```sh
https://logoexecutive.netlify.app/v1/logo/search?key=g
```

### Custom

The Custom Logo Search API fetches a list of logo URLs that start with the
specified characters. It allows users to customize the size and format (e.g.,
jpg, png) of the logos, providing greater flexibility and control over the
appearance of the logos in their applications.

**Endpoint:** `/logo/search?size={size}&format={format}&key={character(s)}`

**Method:** GET

**Access:** Paid

| Parameter | Type    | Description                                             | Required |
| --------- | ------- | ------------------------------------------------------- | -------- |
| size      | integer | The size of the logos in pixels.                        | Yes      |
| format    | string  | The format of the logos (e.g., jpg, png).               | Yes      |
| key       | string  | The character(s) with which the logo URLs should start. | Yes      |

**Example Call:**

```sh
https://logoexecutive.netlify.app/v1/logo/search?size=36&format=jpg&key=g
```

We encourage you to explore and integrate these endpoints into your
applications. If you have any questions or need further assistance, please refer
to the provided examples or contact our support team.
