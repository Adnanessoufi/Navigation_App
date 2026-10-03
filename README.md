# University Campus Navigation App

A full-stack campus navigation application developed for students at the University of Debrecen. The project helps users find campus places by name or abbreviation and view location information on an interactive map.

## Features

- Searchable campus places and abbreviations
- Google Maps integration
- User accounts and authentication
- Favorites
- Reviews and ratings
- Place photos
- User-submitted places with approval status
- Admin approval workflow

## Tech stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Google Maps API
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
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

## Local setup

### Backend

```bash
cd BackEnd
npm install
cp .env.example .env
npm run dev
```

Configure the values in `.env` before starting the server.

### Frontend

```bash
cd FrontEnd/Campus_map
npm install
cp .env.example .env
npm run dev
```

## Environment variables

Secrets and local environment files are intentionally excluded from Git. Use the provided `.env.example` files as templates.

## Purpose

This project was created to reduce the confusion students can face when navigating a large university campus, especially when buildings and locations are commonly referenced by abbreviations.
