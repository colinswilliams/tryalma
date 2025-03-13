# Alma frontend

## Project setup

```bash
yarn
```

## Run the project

```bash
yarn dev
```

The form loads at `http://localhost:3000/` and on submission of the form it should display the success page.

The admin dashboard is at: `http://localhost:3000/dashboard`, it's behind a login screen (credentials will be shared!)

## Notes

### next/server

For the backend, since I'm already heavily in next.js with this build, I'm using next/server to create routes, save files, and load data.

### Unit testing

I used react testing library and created some fairly straightforward tests for the inputs.

### postgres

For ease, I setup an account with neon.tech. With this demo, that should keep the data in sync. I will share the .env file.

### File storage

For this, I'm using local filesystem storage. I didn't want to put the file in postgres, ideally this would be a part of a fileservice that saves the files in an S3 bucket, Azure Blog Storage or similar. With this said, it should store the files in the `/public/uploads` directory.

### Logo

I used the svg from your website instead of perfectly matching the one in the image provided, I'm guessing the comp has an older version of the logo.

### Webfont

Since the comp is just a flat image, it was clear to me that there's a custom font being used, but without info, I dug a bit, and while it isn't a perfect match to what the image shows, I found that Alma's website is using Gellix. Since that's a licensed font, I'm using Google Font's Roboto here.

### Icons

Similar story here, I downloaded the comp, I used Photoshop to crop the icons, removed the background and saved as a png. Ideally these would be either higher res pngs, or svgs.