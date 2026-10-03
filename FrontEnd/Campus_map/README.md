# Frontend

This is the frontend of my University Campus Navigation App.

I used React, TypeScript, Vite and Tailwind CSS.

The frontend includes:

- Search
- Filters
- Google Maps
- Login and registration
- Favorites
- Reviews
- Photo upload
- Add place page
- Admin pages

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Then add your Google Maps API key inside your local `.env` file.

```text
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

The frontend sends `/api` requests to the backend running on port `4000`.

## Build

```bash
npm run build
```
