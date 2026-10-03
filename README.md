# University Campus Navigation App

I made this project to help students at the University of Debrecen find places around the campus more easily.

Students sometimes know a building only by its name or abbreviation, so I wanted to make one place where they can search for it and see it directly on the map.

I built it as a full-stack university project.

## What it does

- Search for places by name or abbreviation
- Filter places by category
- Show the place on Google Maps
- Create an account and log in
- Save favorite places
- Add reviews and ratings
- Upload photos
- Add new places
- Admin can approve new places and manage users

## Technologies I used

For the frontend, I used React, TypeScript, Vite, Tailwind CSS, React Router, Axios and Google Maps API.

For the backend, I used Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt and Cloudinary.

## How to run it

Backend:

```bash
cd BackEnd
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd FrontEnd/Campus_map
npm install
cp .env.example .env
npm run dev
```

The frontend runs on port `5173` and the backend runs on port `4000`.

## API keys and environment variables

I keep the real API keys and secrets in local `.env` files, so they are not uploaded to GitHub.

I added these two example files only to show what values are needed:

```text
BackEnd/.env.example
FrontEnd/Campus_map/.env.example
```

Create a `.env` file in the same folder and add your own values there.
