# Campus Navigation Frontend

React and TypeScript frontend for the University Campus Navigation App.

## Features

- Campus search and category filtering
- Interactive Google Map
- Login and registration
- Favorites
- Reviews
- Photo gallery and upload
- New-place submission
- Admin pages for place and user management

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Add your Google Maps key to `.env`:

```text
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

During local development, Vite proxies requests beginning with `/api` to the backend on `http://localhost:4000`.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
