# BilimSpace LMS Pro Deploy

Moodle-ға ұқсас, бірақ жеңілдетілген мектепке арналған оқу платформасы.

## Ішінде не бар
- толық қазақша интерфейс
- директор / мұғалім / оқушы рөлдері
- admin panel
- директордың мұғалімге тапсырма беруі
- курс, сабақ, тапсырма, бағалау
- фото, видео, PDF, Word, архив және басқа файлдарды жүктеу
- PostgreSQL-ға дайын Prisma конфигі
- Render / Railway / Vercel / Docker deploy конфигі
- сабақ кестесі жоқ
- ата-ана кабинеті жоқ

## Стек
- Backend: Express, Prisma, PostgreSQL, JWT, Multer
- Frontend: React, Vite, React Router
- Deploy: Render, Railway, Vercel, Docker

## Локалды іске қосу (PostgreSQL)

### 1) Backend .env
`backend/.env`

```env
PORT=5000
JWT_SECRET=super-secret-key-change-me
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bilimspace?schema=public"
CLIENT_URLS=http://localhost:5173,http://localhost:8080
UPLOAD_DIR=./src/uploads
```

### 2) PostgreSQL қосу
Жергілікті PostgreSQL ішінде `bilimspace` базасын аш.

### 3) Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### 4) Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker арқылы іске қосу
```bash
docker compose up --build
```

Адрестер:
- frontend: `http://localhost:8080`
- backend: `http://localhost:5000`
- health: `http://localhost:5000/api/health`

## Demo аккаунттар
- директор: `admin@school.local` / `Admin123!`
- мұғалім: `teacher@school.local` / `Teacher123!`
- оқушы: `student@school.local` / `Student123!`

## Render deploy
Бұл репода root деңгейінде `render.yaml` бар.

### Қадамдар
1. GitHub-қа репоны жүкте.
2. Render ішінде **New > Blueprint** таңда.
3. Осы репоны қос.
4. Render автоматты түрде:
   - `bilimspace-postgres` PostgreSQL базасын
   - `bilimspace-backend` web service-ін
   жасайды.
5. Deploy аяқталған соң backend URL-ін көшір.
6. `CLIENT_URLS` мәніне кейін Vercel доменіңді жаз.

## Railway deploy
Root-та `railway.json` бар.

### Қадамдар
1. GitHub-қа репоны жүкте.
2. Railway ішінде жаңа жоба ашып, репоны байланыстыр.
3. Service root ретінде осы репоны таңда.
4. Environment Variables қос:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLIENT_URLS`
   - `UPLOAD_DIR=./src/uploads`
5. PostgreSQL plugin/service қос.
6. `DATABASE_URL`-ді Railway Postgres connection string-ке байла.

## Vercel deploy (frontend)
Frontend папкасында `vercel.json` бар.

### Қадамдар
1. Vercel-де **New Project** аш.
2. Осы репоны таңда.
3. **Root Directory** ретінде `frontend` таңда.
4. Environment Variables:
   - `VITE_API_URL=https://your-backend-domain/api`
   - `VITE_UPLOADS_URL=https://your-backend-domain`
5. Deploy жаса.
6. Шыққан Vercel доменін backend-тегі `CLIENT_URLS` ішіне қос.

## Production ескерту
Файл жүктеу қазір жергілікті дискке сақталады (`UPLOAD_DIR`).

- Docker/өз VPS үшін бұл жарайды.
- Render немесе Railway сияқты платформаларда ephemeral disk болуы мүмкін, сондықтан ұзақ мерзімге сақтау үшін кейін `S3`, `Cloudinary`, `Supabase Storage` немесе Render persistent disk қолданған дұрыс.

## Маңызды маршруттар
- `/` — басты бет
- `/dashboard` — рөлге байланысты кабинет
- `/admin` — admin panel
- `/director-tasks` — директор тапсырмалары
- `/courses/:id` — курс беті
- `/api/health` — health endpoint
