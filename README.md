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

### Desarrollo Local
- `BUILDERBOT_API_URL`: URL de la API de BuilderBot (default: http://localhost:3001)
- `WHATSAPP_API_URL`: URL de la API de WhatsApp (opcional)
- `BUILDERBOT_WHATSAPP_API_URL`: URL alternativa de WhatsApp API (opcional)

### Producción (Vercel)
- `BUILDERBOT_API_URL`: URL de la API de BuilderBot
- `UPSTASH_REDIS_REST_URL`: URL de Redis Upstash (requerido en producción)
- `UPSTASH_REDIS_REST_TOKEN`: Token de Redis Upstash (requerido en producción)

### Producción (Railway)
- `UPSTASH_REDIS_REST_URL`: **MISMA URL que en Vercel** (requerido para compartir datos)
- `UPSTASH_REDIS_REST_TOKEN`: **MISMO TOKEN que en Vercel** (requerido para compartir datos)
- `VERCEL_WEBHOOK_URL`: URL de Vercel (opcional, solo si quieres reenviar webhooks)
- `BUILDERBOT_API_URL`: URL de la API de BuilderBot (opcional)

**Nota:** 
- BuilderBot envía webhooks a Railway
- Railway procesa y almacena los mensajes en Redis (Upstash compartido)
- Vercel lee los mensajes desde el mismo Redis compartido
- **IMPORTANTE:** Railway y Vercel deben usar las MISMAS credenciales de Redis para compartir datos

## Deploy

### Vercel (Recomendado)
1. Conecta el repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno en **Settings → Environment Variables**:
   - `BUILDERBOT_API_URL`: URL de tu API de BuilderBot
   - `UPSTASH_REDIS_REST_URL`: URL de tu instancia de Redis Upstash (requerido)
   - `UPSTASH_REDIS_REST_TOKEN`: Token de tu instancia de Redis Upstash (requerido)
4. Configura el webhook en BuilderBot/Railway apuntando a: `https://tu-dominio.vercel.app/api/webhooks/builderbot`
5. Deploy automático

### Railway
1. Conecta el repositorio a Railway
2. Railway detectará automáticamente Next.js
3. Configura las variables de entorno en Railway:
   - `UPSTASH_REDIS_REST_URL`: **MISMA URL que configuraste en Vercel** (requerido)
   - `UPSTASH_REDIS_REST_TOKEN`: **MISMO TOKEN que configuraste en Vercel** (requerido)
   - `VERCEL_WEBHOOK_URL`: URL de tu aplicación en Vercel (opcional)
   - `BUILDERBOT_API_URL`: URL de tu API de BuilderBot (opcional)
4. Configura el webhook en BuilderBot apuntando a: `https://tu-app.railway.app/api/webhooks/builderbot`
5. El servidor se iniciará automáticamente

**IMPORTANTE:** Railway y Vercel deben usar las **MISMAS** credenciales de Redis (Upstash) para que ambos puedan leer y escribir en la misma base de datos.

## Webhooks de Builderbot

El webhook está configurado como una API Route de Next.js:
- `POST /api/webhooks/builderbot`

### Flujo de Webhooks y Datos

```
BuilderBot → Railway (/api/webhooks/builderbot) → Redis (Upstash compartido)
                                                         ↓
                                                    Vercel lee desde Redis
```

**Arquitectura:**
- Railway recibe webhooks de BuilderBot y los almacena en Redis
- Vercel lee los mensajes desde el mismo Redis compartido
- Ambos usan las mismas credenciales de Upstash Redis

**Configuración:**
1. En BuilderBot, configura el webhook apuntando a Railway:
   ```
   https://tu-app.railway.app/api/webhooks/builderbot
   ```

2. En Railway, configura la variable `VERCEL_WEBHOOK_URL`:
   ```
   https://tu-dominio.vercel.app
   ```
   (Railway reenviará automáticamente los webhooks a Vercel)

**Eventos soportados:**
- `message.incoming` - Mensaje entrante
- `message.outgoing` - Mensaje saliente
- `message.calling` - Llamada

**Nota:** Si solo usas Vercel (sin Railway), configura el webhook directamente en BuilderBot apuntando a:
```
https://tu-dominio.vercel.app/api/webhooks/builderbot
```

