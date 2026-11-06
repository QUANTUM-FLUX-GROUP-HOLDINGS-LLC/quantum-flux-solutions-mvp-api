#!/bin/bash

echo "🚀 Iniciando Quantum Flux MVP..."

# Verificar si existen los archivos .env
if [ ! -f backend/.env ]; then
  echo "⚠️  Falta backend/.env. Copiando desde .env.example..."
  cp backend/.env.example backend/.env
  echo "❌ POR FAVOR: Edita backend/.env con tu cadena de conexión real de Supabase y vuelve a correr el script."
  exit 1
fi

if [ ! -f frontend/.env.local ]; then
  echo "⚠️  Falta frontend/.env.local. Copiando desde .env.local.example..."
  cp frontend/.env.local.example frontend/.env.local
fi

echo "📦 Instalando dependencias del Backend..."
cd backend
npm install

echo "🗄️  Sincronizando Base de Datos (Prisma)..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "🌱 Poblando Base de Datos (Seed)..."
npx ts-node prisma/seed.ts

echo "🔨 Compilando Backend..."
npm run build

echo "✅ Backend listo. Iniciando en segundo plano (puerto 3001)..."
npm run start:prod > backend.log 2>&1 &
BACKEND_PID=$!

echo "📦 Instalando dependencias del Frontend..."
cd ../frontend
npm install

echo "✅ Frontend listo. Iniciando en puerto 3000..."
npm run dev

# Al detener el frontend (Ctrl+C), se detiene el backend también
kill $BACKEND_PID
