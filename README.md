# SITDB - Sistem Informasi Tanggap Darurat Bencana

![SITDB Banner](https://via.placeholder.com/1200x400/1e40af/ffffff?text=SITDB+-+Sistem+Informasi+Tanggap+Darurat+Bencana)

Platform pelaporan dan koordinasi tanggap darurat bencana berbasis peta dengan pembaruan realtime untuk respons cepat dan terkoordinasi di Indonesia.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Alur Kerja Sistem](#-alur-kerja-sistem)
- [Panduan Instalasi](#-panduan-instalasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Deployment ke Cloud Run](#-deployment-ke-cloud-run)
- [Testing](#-testing)
- [Keamanan](#-keamanan)

## 🚀 Fitur Utama

### Untuk Masyarakat
- ✅ Pelaporan bencana dengan lokasi GPS
- ✅ Upload foto/video bukti
- ✅ Pelacakan status laporan
- ✅ Notifikasi realtime

### Untuk Relawan
- ✅ Verifikasi laporan
- ✅ Update status penanganan
- ✅ Koordinasi dengan tim

### Untuk Admin BPBD
- ✅ Dashboard statistik lengkap
- ✅ Manajemen pengguna
- ✅ Audit log aktivitas
- ✅ Export data laporan

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Landing    │  │   Map View  │  │  Dashboard  │              │
│  │   Page      │  │  (Leaflet)  │  │   (Admin)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                         │                                        │
│                   Next.js App Router                             │
└─────────────────────────────────────────────────────────────────┘
                          │
                     HTTPS/WSS
                          │
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Auth API   │  │ Reports API │  │  Admin API  │              │
│  │ (NextAuth)  │  │   (CRUD)    │  │  (Stats)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                         │                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Prisma    │  │   Winston   │  │     Zod     │              │
│  │     ORM     │  │   Logger    │  │ Validation  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  PostgreSQL 15                              │ │
│  │  ┌────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────┐ │ │
│  │  │ Users  │  │DisasterReport│  │ReportStatus│  │AuditLog │ │ │
│  │  └────────┘  └──────────────┘  └────────────┘  └─────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, NextAuth.js |
| **Database** | PostgreSQL 15, Prisma ORM |
| **Maps** | Leaflet, OpenStreetMap |
| **Validation** | Zod |
| **Logging** | Winston |
| **Container** | Docker, Docker Compose |
| **Cloud** | Google Cloud Run, Cloud SQL, Secret Manager |
| **Testing** | Jest, ts-jest |

## 🔄 Alur Kerja Sistem

### Flowchart Pelaporan Bencana

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│ Masyarakat│────▶│ Buat Laporan │────▶│   PENDING   │
└──────────┘     │  + Lokasi    │     └──────┬──────┘
                 │  + Foto      │            │
                 └──────────────┘            ▼
                                      ┌──────────────┐
                                      │   Relawan    │
                                      │  Verifikasi  │
                                      └──────┬───────┘
                           ┌─────────────────┼─────────────────┐
                           ▼                 ▼                 ▼
                    ┌──────────┐      ┌────────────┐    ┌──────────┐
                    │ VERIFIED │      │ IN_PROGRESS│    │ REJECTED │
                    └────┬─────┘      └─────┬──────┘    └──────────┘
                         │                  │
                         └────────┬─────────┘
                                  ▼
                           ┌──────────┐
                           │ RESOLVED │
                           └──────────┘
```

### Flowchart Role-Based Access

```
                    ┌──────────────────────┐
                    │    User Login        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌──────────┐     ┌───────────┐    ┌─────────┐
       │MASYARAKAT│     │  RELAWAN  │    │  ADMIN  │
       └────┬─────┘     └─────┬─────┘    └────┬────┘
            │                 │               │
            ▼                 ▼               ▼
    ┌───────────────┐ ┌─────────────────┐ ┌──────────────┐
    │• Buat Laporan │ │• Buat Laporan   │ │• Semua Fitur │
    │• Lihat Laporan│ │• Lihat Laporan  │ │• Kelola User │
    │• Lihat Peta   │ │• Update Status  │ │• Dashboard   │
    │               │ │• Verifikasi     │ │• Audit Log   │
    └───────────────┘ └─────────────────┘ └──────────────┘
```

## 📦 Panduan Instalasi

### Prasyarat

- Node.js 18+ 
- npm atau Yarn
- Docker & Docker Compose (opsional)
- PostgreSQL 15 (jika tidak menggunakan Docker)

### 1. Clone Repository

```bash
git clone <repository-url>
cd STIDB
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# DATABASE_URL="postgresql://user:password@localhost:5432/sitdb?schema=public"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key"
```

### 4A. Jalankan dengan Docker (Recommended)

```bash
# Start PostgreSQL dan aplikasi
docker-compose up -d

# Lihat logs
docker-compose logs -f app
```

### 4B. Jalankan Manual

```bash
# Start PostgreSQL (pastikan sudah running)
# Push schema ke database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Opsional) Seed data demo
npx tsx prisma/seed.ts

# Jalankan development server
npm run dev
```

### 5. Akses Aplikasi

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sitdb.id | admin123 |
| Relawan | relawan@sitdb.id | relawan123 |
| Masyarakat | warga@sitdb.id | masyarakat123 |

## 📱 Panduan Penggunaan

### Masyarakat: Membuat Laporan

1. Login atau daftar akun baru
2. Klik "Laporkan Bencana" di navbar
3. Pilih jenis bencana
4. Isi judul dan deskripsi
5. Pilih tingkat keparahan
6. Pilih lokasi pada peta (atau gunakan GPS)
7. Submit laporan

### Relawan: Memproses Laporan

1. Login dengan akun Relawan
2. Buka Dashboard atau Peta
3. Pilih laporan yang ingin diproses
4. Update status (Verified → In Progress → Resolved)
5. Tambahkan catatan jika perlu

### Admin: Mengelola Sistem

1. Login dengan akun Admin
2. Buka Admin Panel
3. Lihat statistik laporan
4. Kelola pengguna dan ubah role
5. Monitor audit log

## 📡 API Reference

### Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/[...nextauth]` | NextAuth.js handler |

### Disaster Reports

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/api/reports` | ✓ | All | List semua laporan |
| POST | `/api/reports` | ✓ | All | Buat laporan baru |
| GET | `/api/reports/:id` | ✓ | All | Detail laporan |
| PUT | `/api/reports/:id` | ✓ | Owner/Admin | Update laporan |
| DELETE | `/api/reports/:id` | ✓ | Admin | Hapus laporan |
| POST | `/api/reports/:id/status` | ✓ | Relawan/Admin | Update status |

### Admin

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/api/admin/users` | ✓ | Admin | List pengguna |
| PUT | `/api/admin/users` | ✓ | Admin | Update role user |
| GET | `/api/admin/stats` | ✓ | Admin | Dashboard statistics |

### Realtime

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/realtime` | ✓ | SSE stream untuk updates |

## 🗄 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  phone     String?
  role      UserRole @default(MASYARAKAT)
}

model DisasterReport {
  id          String           @id @default(cuid())
  userId      String
  type        DisasterType
  title       String
  description String
  latitude    Float
  longitude   Float
  address     String?
  severity    SeverityLevel
  status      ReportStatusType @default(PENDING)
}

enum UserRole {
  MASYARAKAT
  RELAWAN
  ADMIN
}

enum DisasterType {
  BANJIR | GEMPA | KEBAKARAN | LONGSOR | TSUNAMI | ANGIN_TOPAN | KEKERINGAN | LAINNYA
}

enum SeverityLevel {
  RINGAN | SEDANG | BERAT | KRITIS
}

enum ReportStatusType {
  PENDING | VERIFIED | IN_PROGRESS | RESOLVED | REJECTED
}
```

## ☁ Deployment ke Cloud Run

### Prasyarat

- Google Cloud Account
- gcloud CLI terinstall dan terkonfigurasi
- Cloud SQL PostgreSQL instance

### 1. Setup Secrets di Secret Manager

```bash
# Create secrets
gcloud secrets create sitdb-database-url --data-file=-
gcloud secrets create sitdb-nextauth-secret --data-file=-
gcloud secrets create sitdb-nextauth-url --data-file=-
```

### 2. Deploy via Cloud Build

```bash
# Deploy otomatis via push ke repo yang terhubung
git push origin main

# Atau manual
gcloud builds submit --config cloudbuild.yaml
```

### 3. Manual Deploy

```bash
# Build image
docker build -t gcr.io/PROJECT_ID/sitdb .

# Push ke Container Registry
docker push gcr.io/PROJECT_ID/sitdb

# Deploy ke Cloud Run
gcloud run deploy sitdb \
  --image gcr.io/PROJECT_ID/sitdb \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets="DATABASE_URL=sitdb-database-url:latest,NEXTAUTH_SECRET=sitdb-nextauth-secret:latest,NEXTAUTH_URL=sitdb-nextauth-url:latest"
```

## 🧪 Testing

### Jalankan Tests

```bash
# Run semua tests
npm run test

# Run dengan coverage
npm run test -- --coverage

# Run test spesifik
npm run test -- validation.test.ts
```

### Test Structure

```
tests/
├── setup.ts              # Test setup
└── api/
    └── validation.test.ts # Validation schema tests
```

## 🔒 Keamanan

### Best Practices yang Diterapkan

1. **Environment Variables**: Semua secrets disimpan di environment variables
2. **Secret Manager**: Production menggunakan Google Secret Manager
3. **Password Hashing**: bcrypt dengan salt rounds = 10
4. **JWT Authentication**: Session berbasis JWT via NextAuth.js
5. **Role-Based Access**: Setiap endpoint memvalidasi role pengguna
6. **Input Validation**: Semua input divalidasi dengan Zod schemas
7. **Audit Logging**: Semua aksi penting dicatat ke audit log
8. **HTTPS Only**: Production hanya menerima koneksi HTTPS

### File yang Tidak Boleh Di-commit

```
.env
.env.local
.env.*.local
logs/
```

## 📄 License

MIT License - Bebas digunakan untuk keperluan apapun.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat issue atau pull request.

---

**SITDB** - Dibuat untuk membantu koordinasi tanggap darurat bencana di Indonesia 🇮🇩
