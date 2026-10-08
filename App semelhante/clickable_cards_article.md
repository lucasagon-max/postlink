This is a simple guide about how you can create clickable social cards on social media for your links.

Here is an example how clickable social cards look on Facebook, X (Twitter) and Threads.

![Example of social cards on Facebook, X (Twitter) and Threads](https://social.cards/assets/upload/2024/02/social-cards-on-facebook-x-twitter-threads.jpg)

## Solution

All you need to do is to add the following code to your `<head>` section for every page you want to target.

```html
<!-- For Facebook, LinkedIn and other platforms -->
<meta property="og:title" content="YOUR_PAGE_TITLE" />
<meta property="og:site_name" content="YOUR_SITE_NAME" />
<meta property="og:url" content="YOUR_PAGE_URL" />
<meta property="og:description" content="YOUR_PAGE_DESCRIPTION" />
<meta property="og:type" content="article" />
<meta property="og:image" content="YOUR_1200x630_IMAGE">

<!-- For Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@YOUR_TWITTER_USERNAME" />
<meta name="twitter:creator" content="@YOUR_TWITTER_USERNAME" />
<meta name="twitter:title" content="YOUR_PAGE_TITLE" />
<meta name="twitter:description" content="YOUR_PAGE_DESCRIPTION" />
<meta name="twitter:image" content="YOUR_1200x630_IMAGE">
```

Of course, you need to change the `YOUR_` values with your own values.

## The image

The most important thing about these values is the image. If you want a big beautiful image for your link, we recommend to use an image with a resolution of `1200px x 630px`.

> If you need to quickly create a social card for your links, you can check our [editor for social cards](https://social.cards/) for free.

## Full example

After you add the code snippet above, your HTML page should look like this.

```html
<!DOCTYPE html>
<html>
  <head>
	<!-- Your metadata -->

	<!-- Metadata for social cards -->
	<meta property="og:title" content="Create social cards" />
	<meta property="og:site_name" content="SocialCards" />
	<meta property="og:url" content="https://social.cards" />
	<meta property="og:description" content="Create professional social media posts to increase your engagement." />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="https://social.cards/assets/public/img/social-card.png">

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@socialdotcards" />
	<meta name="twitter:creator" content="@socialdotcards" />
	<meta name="twitter:title" content="SocialCards" />
	<meta name="twitter:description" content="Create professional social media posts to increase your engagement." />
	<meta name="twitter:image" content="https://social.cards/assets/public/img/social-card.png">

	<!-- Other stuff -->
  </head>
  <body>
    <!-- Your content -->
  </body>
</html>

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