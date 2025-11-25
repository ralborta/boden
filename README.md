# Boden CRM

CRM y Panel de Control para Chatbot de IA construido con Next.js 14, TypeScript y Tailwind CSS.

## Características

- 🎨 Diseño moderno y limpio con Tailwind CSS
- 📊 Dashboard con KPIs y gráficos de funnel
- 🤖 Configuración del asistente de IA (Cerebro)
- 📁 Gestión de base de conocimiento con archivos
- 💬 Centro de conversaciones WhatsApp
- 🔌 Integración con BuilderBot API
- 🚀 Webhooks de Builderbot con Next.js API Routes

## Instalación

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

## Tecnologías

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
- Next.js API Routes (para webhooks)

## Variables de Entorno

- `BUILDERBOT_API_URL`: URL de la API de BuilderBot (default: http://localhost:3001)
- `WHATSAPP_API_URL`: URL de la API de WhatsApp (opcional)
- `UPSTASH_REDIS_REST_URL`: URL del endpoint REST de Upstash Redis (opcional)
- `UPSTASH_REDIS_REST_TOKEN`: Token del endpoint de Upstash Redis (opcional)

Si configurás las variables de Upstash Redis, las conversaciones y mensajes de WhatsApp se persisten allí. Si no, la app usa un almacén en memoria pensado solo para desarrollo local.

## Deploy

### Vercel (Recomendado)
1. Conecta el repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno
4. Deploy automático

### Railway
1. Conecta el repositorio a Railway
2. Railway detectará automáticamente Next.js
3. Configura las variables de entorno
4. El servidor se iniciará automáticamente

## Webhooks de Builderbot

El webhook está configurado como una API Route de Next.js:
- `POST /api/webhooks/builderbot`

**URL del webhook para Builderbot:**
```
https://tu-dominio.vercel.app/api/webhooks/builderbot
```
o
```
https://tu-app.railway.app/api/webhooks/builderbot
```

**Eventos soportados:**
- `message.incoming` - Mensaje entrante
- `message.outgoing` - Mensaje saliente
- `message.calling` - Llamada

Configura esta URL en Builderbot como webhook para recibir eventos en tiempo real.

