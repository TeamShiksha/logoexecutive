# Firebase Collections Documentation

## Users Collection

The `Users` collection in Firebase Firestore is utilized to store comprehensive user information. Each document in this collection represents a unique user and includes the following fields:

- **userId**: _(String)_ Unique identifier for referencing and identifying individual users.
- **email**: _(String)_ Stores the user's email address, essential for communication and authentication.
- **password**: _(String)_ Securely stores the hashed and salted password to protect user credentials.
- **firstName**: _(String)_ Capture the user's first name.
- **lastName**: _(String)_ Capture the user's last name.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the user account was initially registered.
- **updatedAt**: _(Timestamp)_ Tracks the timestamp of the most recent changes made to the user's information.

## Keys Collection

The `Keys` collection in Firebase Firestore is designed to store API keys created by users. Each document in this collection represents a unique API key and includes the following fields:

- **keyId**: _(String)_ Serves as a unique identifier for referencing and identifying individual API keys.
- **userId**: _(Reference)_ References the user who owns the API key, establishing a link to the corresponding user document in the `Users` collection.
- **key**: _(String)_ Stores the actual API key string for authentication and authorization purposes.
- **keyDescription**: _(String)_ Provides a description of the API key for better understanding and management.
- **usageCount**: _(Number)_ Tracks the number of times the API key has been utilized.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the API key was initially created.
- **updatedAt**: _(Timestamp)_ Tracks the timestamp of the most recent changes made to the API key.

## Subscriptions Collection

The `Subscriptions` collection in Firebase Firestore is specifically designed to store information about user subscriptions. Each document in this collection represents a unique subscription and includes the following fields:

- **subscriptionId**: _(String)_ Serves as a unique identifier for referencing and identifying individual subscriptions.
- **userId**: _(Reference)_ References the user who is subscribed, establishing a link to the corresponding user document in the `Users` collection.
- **subscriptionType**: _(String)_ Describes the type of subscription the user currently holds.
- **keyLimit**: _(Number)_ Specifies the number of keys that can be created in this subscription plan.
- **usageLimit**: _(Number)_ Represents the usage limit associated with the subscription plan.
- **isActive**: _(Boolean)_ Indicates whether the subscription is currently active or not, providing a quick status check.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the subscription was initially created.
- **updatedAt**: _(Timestamp)_ Tracks the timestamp of the most recent changes made to the subscription.

## Images Collection

The `Images` collection in Firebase Firestore is dedicated to storing information about images provided by the API. Each document in this collection represents a unique image and includes the following fields:

- **imageId**: _(String)_ Serves as a unique identifier for referencing and identifying individual images.
- **imageUrl**: _(String)_ Stores the URL of the image, allowing for easy retrieval and display within the application.
- **uploadedAt**: _(Timestamp)_ Records the timestamp of when the image was initially uploaded to the system.
- **ImageUsageCount**: _(Number)_ Tracks the number of times the image has been fetched, providing insights into its popularity or usage.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the image record was initially created.
- **updatedAt**: _(Timestamp)_ Tracks the timestamp of the most recent changes made to the image record.

## ImageLogs Collection

The `ImageLogs` collection in Firebase Firestore is employed to record each time an image is fetched. Each document in this collection represents a unique access log and includes the following fields:

- **logId**: _(String)_ Serves as a unique identifier for referencing and identifying individual access logs.
- **imageId**: _(Reference)_ References the image that was accessed, establishing a link to the corresponding document in the `Images` collection.
- **timestamp**: _(Timestamp)_ Records the timestamp of when the access event occurred.
- **apiKeyId**: _(Reference)_ References the API key used for access, linking to the corresponding document in the `Keys` collection.

## ContactUs Collection

The `ContactUs` collection in Firebase Firestore is designated for storing data related to user interactions through the "Contact Us" feature. Each document in this collection represents a unique contact entry and includes the following fields:

- **contactId**: _(String)_ Serves as a unique identifier for referencing and identifying individual contact entries.
- **name**: _(String)_ Captures the name of the individual who submitted the contact request.
- **email**: _(String)_ Records the email address of the individual for communication purposes.
- **message**: _(String)_ Stores the content of the message submitted through the "Contact Us" form.
- **activityStatus**: _(Boolean)_ Boolean value indicating the current status of the contact entry, useful for tracking the processing status.
- **assignedTo**: _(String)_ Specifies the person or department assigned to handle the contact request.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the contact entry was initially created.
- **updatedAt**: _(Timestamp)_ Tracks the timestamp of the most recent changes made to the contact entry.

## UserToken Collection

The `UserToken` collection in Firebase Firestore is dedicated to storing information related to user tokens. Each document in this collection represents a unique user token entry and includes the following fields:

- **token**: _(String)_ Stores the actual user token string for authentication or authorization purposes.

- **type**: _(String)_ Describes the purpose or type of the user token (e.g., FORGOT, VERIFY).
- **userId**: _(Reference)_ References the user associated with the token, linking to the corresponding user document in the `Users` collection.
- **userTokenId**: _(String)_ Serves as a unique identifier for referencing and identifying individual user tokens.
- **userTokenRef**: _(String)_ References the user token, if applicable.
- **createdAt**: _(Timestamp)_ Records the timestamp of when the token entry was initially created.
- **expireAt**: _(Timestamp)_ Indicates the timestamp when the user token is set to expire.