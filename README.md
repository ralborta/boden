# Boden CRM

CRM y Panel de Control para Chatbot de IA construido con Next.js 14, TypeScript y Tailwind CSS.

## Características

- 🎨 Diseño moderno y limpio con Tailwind CSS
- 📊 Dashboard con KPIs y gráficos de funnel
- 🤖 Configuración del asistente de IA (Cerebro)
- 📁 Gestión de base de conocimiento con archivos
- 💬 Centro de conversaciones WhatsApp
- 🔌 Integración con BuilderBot API
- 🚀 Backend API con Fastify para webhooks

## Estructura del Proyecto

El proyecto está dividido en dos partes:

### Frontend (Next.js)
- `src/` - Código del frontend Next.js
- Dashboard, Cerebro IA, WhatsApp, Configuración

### Backend API (Fastify)
- `api/` - Servidor backend con Fastify
- Manejo de webhooks de Builderbot
- Listo para deploy en Railway

## Instalación

### Frontend

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` y configura:
- `BUILDERBOT_API_URL` - URL de la API de BuilderBot
- `WHATSAPP_API_URL` - URL de la API de WhatsApp (opcional)

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Backend API

1. Navega a la carpeta del backend:
```bash
cd api
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

El servidor se iniciará en `http://localhost:8080`

Para producción:
```bash
npm run build
npm start
```

## Tecnologías

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (iconos)

### Backend
- Fastify
- TypeScript
- Node.js 18+

## Variables de Entorno

### Frontend (.env)
- `BUILDERBOT_API_URL`: URL de la API de BuilderBot (default: http://localhost:3001)
- `WHATSAPP_API_URL`: URL de la API de WhatsApp (opcional)

### Backend (api/.env)
- `PORT`: Puerto del servidor (default: 8080)
- `HOST`: Host del servidor (default: 0.0.0.0)

## Deploy

### Frontend (Vercel)
1. Conecta el repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno
4. Deploy automático

### Backend (Railway)
1. Conecta el repositorio a Railway
2. Railway detectará automáticamente el `package.json` en `api/`
3. Configura las variables de entorno
4. El servidor se iniciará automáticamente

## Webhooks de Builderbot

El backend está configurado para recibir webhooks en:
- `POST /webhooks/builderbot`

Eventos soportados:
- `message.incoming` - Mensaje entrante
- `message.outgoing` - Mensaje saliente
- `message.calling` - Llamada

