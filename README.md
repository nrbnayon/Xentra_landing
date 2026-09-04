# Xentra Sports Landing Page

The public landing page for **Xentra Sports**, a sports experience with live match updates, predictions, analytics, secure transactions, and a downloadable Android app.

The site is built with Next.js App Router and includes responsive navigation, a QR-code download flow, contact and update forms, social links, and multilingual content.

## Features

- Responsive landing page for desktop and mobile
- Android APK download from `public/Xentra Sports.apk`
- QR code that points to the hosted APK
- English, Thai, Haitian Kreyòl, French, and Spanish language support
- Built-in translation glossary with Google Cloud Translation API fallback
- About, contact, privacy policy, and terms links
- Production process configuration for PM2 on port `3005`

## Requirements

- Node.js 20 or newer
- npm
- Google Cloud Translation API key for translating content not included in the local glossary

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the development server on the production port:

```bash
npm run dev:3005
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
GOOGLE_TRANSLATE_API_KEY=your_google_cloud_translation_api_key
```

The key is used only by the server-side `POST /api/translate` route. Do not prefix it with `NEXT_PUBLIC_` or commit `.env.local` to source control.

The app can still use translations present in the built-in glossary when the API is unavailable. New translations require the API key.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server on port 3000 |
| `npm run dev:3005` | Start the development server on port 3005 |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server on port 3005 |

Before deploying, run:

```bash
npm run lint
npm run build
```

## Project Structure

```text
app/
  api/translate/route.ts  Google Cloud Translation proxy route
  download/               Download-related route files
  globals.css             Global styles
  layout.tsx              Root layout and metadata
  page.tsx                Xentra Sports landing page
context/
  LanguageContext.tsx     Language state and translation handling
services/
  translationService.ts   Glossary, cache, and API fallback logic
public/                   Logos, icons, images, and Android APK
```

Most page content and sections live in `app/page.tsx`. Shared language behavior belongs in `context/LanguageContext.tsx` and `services/translationService.ts`.

## Production Deployment

The included `deploy.sh` script is intended for the configured Linux server. It pulls `main`, installs dependencies when needed, builds the app, reloads the PM2 process, and checks the service on port `3005`.

Run it from the server checkout:

```bash
chmod +x deploy.sh
./deploy.sh
```

The deployment script expects:

- The repository at `/var/www/Xentra_landing`
- Node.js, npm, PM2, Nginx, and `sudo`
- A configured `.env.local` or server environment containing `GOOGLE_TRANSLATE_API_KEY`
- The PM2 configuration in `ecosystem.config.js`

For production process management without the deployment script:

```bash
npm install
npm run build
pm2 start ecosystem.config.js --env production
```

## Useful Links

- [Xentra Sports privacy policy](https://admin.xentrasports.com/app-privacy-policy)
- [Xentra Sports terms of service](https://admin.xentrasports.com/app-terms-conditions)
- [Next.js documentation](https://nextjs.org/docs)
