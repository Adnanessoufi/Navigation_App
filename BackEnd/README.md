# Backend

This is the backend of my University Campus Navigation App.

I used Node.js, Express, TypeScript, Prisma and PostgreSQL. The API starts from `src/server.ts`.

The backend handles:

- Login and registration
- User sessions
- Searching places
- Adding new places
- Favorites
- Reviews
- Place photos
- Admin approval
- Admin user management

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

It runs on port `4000` by default.

## Database

I use PostgreSQL with Prisma.

Some useful commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## Production build

```bash
npm run build
npm start
```
