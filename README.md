# University Campus Navigation App

I made this project to help students at the University of Debrecen find places around campus more easily.

Sometimes students know a building or a place only by its name or abbreviation, so I wanted to make one simple app where they can search for it and see it directly on the map.

## What I added

- Search places by name or abbreviation
- Filter places by category
- Show places on Google Maps
- Register and log in
- Save favorite places
- Add reviews and ratings
- Upload photos for places
- Add new places
- Admin approval for new places
- Admin user management

## Technologies I used

### Frontend

- React
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
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Cloudinary

## Project structure

```text
Navigation_App/
├── BackEnd/
│   ├── prisma/
│   └── src/
└── FrontEnd/
    └── Campus_map/
        ├── public/
        └── src/
```

## How to run it

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

The frontend runs on port `5173` and sends API requests to the backend on port `4000`.

## Environment variables

I do not keep real API keys or secrets inside the repository.

For the backend, copy:

```text
BackEnd/.env.example
```

For the frontend, copy:

```text
FrontEnd/Campus_map/.env.example
```

Then add your own values.

## Current status

The main functions of the project are working. I still want to improve deployment and testing later.
