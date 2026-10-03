# University Campus Navigation App

A full-stack web application that helps students find places around the University of Debrecen campus.

The app supports searchable campus locations, an interactive Google Map, user accounts, favorites, reviews, place photos, user-submitted locations, and an admin approval workflow.

## Main features

- Search campus places by name or abbreviation
- Filter places by category
- View places on Google Maps
- Register and log in with cookie-based JWT authentication
- Save favorite locations
- Add reviews and ratings
- Upload and display place photos
- Submit new places
- Admin moderation for submitted places
- Admin user management

## Tech stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Google Maps API

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Cloudinary

## Project structure

```text
Navigation_App/
├── BackEnd/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── server.ts
└── FrontEnd/
    └── Campus_map/
        ├── public/
        └── src/
            ├── api/
            ├── components/
            ├── hooks/
            └── lib/
```

## Local development

### Backend

```bash
cd BackEnd
npm install
cp .env.example .env
npm run dev
```

### Frontend

Open another terminal:

```bash
cd FrontEnd/Campus_map
npm install
cp .env.example .env
npm run dev
```

By default, Vite runs on port `5173` and proxies `/api` requests to the backend on port `4000`.

## Environment variables

Backend variables are documented in `BackEnd/.env.example`:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES`
- `NODE_ENV`
- `PORT`
- `CLIENT_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend variables are documented in `FrontEnd/Campus_map/.env.example`:

- `VITE_GOOGLE_MAPS_API_KEY`

## Security notes

- Real `.env` files are ignored and must not be committed.
- Authentication tokens use HTTP-only cookies.
- Photo upload signatures require authentication.
- Credentials that existed in older Git history should be rotated before this repository is made public.

## Project status

The core application is implemented. Production deployment configuration and broader automated testing are still future improvements.
