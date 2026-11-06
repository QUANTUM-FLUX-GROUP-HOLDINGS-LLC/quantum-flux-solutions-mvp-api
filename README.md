# Quantum Flux Solutions - Fintech MVP

Monorepo para Credit Repair, Taxes (Personal & Business), y Bookkeeping services (U.S. Only).

## 🏗️ Arquitectura del Proyecto (CRÍTICO LEER)
Este proyecto sigue una **Arquitectura Dirigida por Características (Feature-Driven)**.
*   `backend/`: NestJS con módulos separados (`src/credit`, `src/tax-business`, etc.). Prisma ORM para la base de datos.
*   `frontend/`: Next.js (Pages Router). 
    *   `src/pages/`: Solo contiene "wrappers" de 9 líneas para el enrutamiento.
    *   `src/modules/`: Toda la lógica de negocio, componentes y CSS de cada módulo vive aquí de forma aislada.
    *   **REGLA DE ORO:** No crear archivos monolíticos. Si vas a cambiar la vista de Tax Business, hazlo en `src/modules/tax-business/`.

---

## 🚀 Cómo levantar el sistema desde cero

### Requisitos Previos
*   Node.js (v20 o superior)
*   Git
*   Una base de datos PostgreSQL (ej. Supabase)

### Paso 1: Configurar Variables de Entorno
Copia los archivos de ejemplo y edítalos con tus credenciales reales.
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```
*   **`backend/.env`**: Debes colocar aquí tu URL real de Supabase en `DATABASE_URL` y tus llaves de Stripe.
*   **`frontend/.env.local`**: Si estás en local, déjalo como `NEXT_PUBLIC_API_URL="http://localhost:3001"`.

### Paso 2: Opción A - Levantar automáticamente (Recomendado)
Hemos creado un script de arranque que instala, migra, siembra y levanta ambos servidores de una vez:
```bash
chmod +x start.sh
./start.sh
```

### Paso 2: Opción B - Levantar manualmente (Paso a paso)
Si prefieres hacerlo manualmente o el script falla, ejecuta estos comandos en dos terminales separadas.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts  # Crea los usuarios de prueba
npm run start:dev           # Levanta el backend en http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev                 # Levanta el frontend en http://localhost:3000
```

---

## 🧪 Usuarios de Prueba
El script de `seed.ts` crea los siguientes usuarios. Todos tienen la contraseña: **`password123`**

| Rol | Email | Acceso |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `/staff-login` |
| **Credit Repair** | `credit@test.com` | `/staff-login` |
| **Personal Tax** | `tax@test.com` | `/staff-login` |
| **Business Tax** | `business@test.com` | `/staff-login` |
| **Bookkeeping** | `bookkeeper@test.com` | `/staff-login` |
| **Cliente Real** | `client1@test.com` | `/login` |

---

## 🛡️ Notas para Desarrolladores / IA
1.  **No tocar Prisma sin consenso:** Si necesitas agregar una tabla o campo, actualiza `schema.prisma`, corre `npx prisma db push` y actualiza `seed.ts` inmediatamente.
2.  **Mantener el aislamiento:** Cualquier nuevo componente de UI debe ir dentro de su respectivo `src/modules/[modulo]/components/`.
3.  **Variables de Entorno:** Nunca subas archivos `.env` a GitHub. Usa siempre los `.example`.
