# CaloGym - Deployment Scripts

## Cách 1: Chạy production local (đơn giản nhất)

```bash
# 1. Build production
npm run build

# 2. Generate Prisma client
npx prisma generate

# 3. Start production server (port 3000)
npm start
```

Sau đó người khác truy cập qua: `http://<IP-máy-bạn>:3000`

Cần mở port 3000 trên Windows Firewall:
```powershell
New-NetFirewallRule -DisplayName "CaloGym" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## Cách 2: Deploy lên Vercel + Database cloud

### 2a. Đổi database sang Supabase (PostgreSQL free 500MB)

1. Đăng ký tại https://supabase.com
2. Tạo project, lấy connection string
3. Sửa `.env`: `DATABASE_URL="postgresql://..."`  
4. Cài adapter PostgreSQL:
```bash
npm install @prisma/adapter-pg pg
```
5. Push schema: `npx prisma db push`

### 2b. Deploy lên Vercel (free)

1. Push code lên GitHub private repo
2. Vào https://vercel.com → Import GitHub repo
3. Set environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL=https://tên-app.vercel.app`
4. Deploy

Chi phí: **$0** (Vercel free + Supabase free)

## File đã cấu hình sẵn
- `Dockerfile`: Docker production build
- `docker-compose.yml`: MySQL + App (cần sửa thành SQL Server)
- `next.config.ts`: Cấu hình images
- `proxy.ts`: Auth middleware
