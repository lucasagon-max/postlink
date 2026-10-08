Documentation

# Create links with preview using the API

Learn how to build, automate, and scale your social image workflows with
SocialCards.


Links with preview are the links shared on social media and displayed as a card with an image. Here is an example:

![Example of a Facebook post with a link with preview](https://social.cards/assets/upload/2024/12/link-with-preview-on-facebook.jpg)

To create links with preview through the API, you can do a **POST** HTTP request to the `http://social.cards/api/links/full` endpoint. You need two things:

- **Authorization** header
- Body with a JSON like this:

```json
{
	"url": "https://example.com",
	"title": "My title",
	"description": "My description",
	"imgGuid": "IMG_GUID",
	"variables": {
		"title": "My title"
	}
}
```

To get the **imgGuid** parameter, open a saved image and you will be redirected to an URL like this: `https://social.cards/img/IMG_GUID`. **IMG\_GUID** is the imgGuid parameter.

Here is full cURL example:

```bash
curl -X POST "http://social.cards/api/links/full" \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer YOUR_API_TOKEN" \
	-d '{ "url": "https://example.com", "title": "My title", "description": "My description", "imgGuid": "IMG_GUID", "variables": { "title": "My title" } }'
```

Sign in to save images, links, and API settings.


Sign in with Google
Sign in with
GitHub Sign in with
Email

 I don't have an accountYour email

Your password

 Forgot password?


CloseSign in