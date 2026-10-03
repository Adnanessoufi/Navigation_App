# Backend

Express and TypeScript API for the University Campus Navigation App.

## Responsibilities

- Authentication and user sessions
- Campus place search
- Place creation and moderation
- Favorites
- Reviews
- Photo metadata and Cloudinary upload signatures
- Admin user and place management

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The development server uses port `4000` unless `PORT` is set.

## Environment variables

See `.env.example`.

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES
NODE_ENV
PORT
CLIENT_ORIGIN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Database

The project uses PostgreSQL through Prisma.

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

## Build

```bash
npm run build
npm start
```
