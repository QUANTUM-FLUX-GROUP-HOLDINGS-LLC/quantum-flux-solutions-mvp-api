# Quantum Flux Solutions - Fintech MVP

## 🚀 Cómo levantar el sistema desde cero

Si acabas de clonar el repositorio o necesitas reiniciar todo el entorno sin miedo a que se rompa, sigue estos pasos exactos:

### 1. Configurar Variables de Entorno
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

    backend/.env: Debes colocar aquí tu URL real de Supabase en DATABASE_URL.

    frontend/.env.local: Si estás en local, déjalo como http://localhost:3001. Si apunta a producción, cambia la URL.

2. Levantar el sistema completo

Hemos creado un script que hace todo el trabajo pesado (instalar, migrar, sembrar datos y levantar ambos servidores):
bash

./start.sh

Este script hará lo siguiente automáticamente:

    Instalar dependencias del Backend.

    Ejecutar Prisma (generate y db push).

    Correr el seed.ts para crear a los usuarios de prueba (Admin, Staff y Clientes).

    Compilar el Backend y levantarlo en el puerto 3001.

    Instalar dependencias del Frontend y levantarlo en el puerto 3000.

3. Usuarios de Prueba

Todos tienen la contraseña: password123
Rol	Email
Admin	admin@test.com
Credit Repair	credit@test.com
Personal Tax	tax@test.com
Business Tax	business@test.com
Bookkeeping	bookkeeper@test.com
Cliente Real	client1@test.com

(Ingresa al CRM de Staff en /staff-login y al portal de clientes en /login)
