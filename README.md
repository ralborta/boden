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
- `BUILDERBOT_BOT_ID`: ID del bot de BuilderBot (requerido para enviar mensajes)
- `BUILDERBOT_API_KEY`: API Key de BuilderBot (requerido para enviar mensajes)
- `BUILDERBOT_BASE_URL`: URL base de BuilderBot Cloud (opcional, default: https://app.builderbot.cloud)
- `UPSTASH_REDIS_REST_URL`: URL de Redis Upstash (opcional en desarrollo)
- `UPSTASH_REDIS_REST_TOKEN`: Token de Redis Upstash (opcional en desarrollo)

### Producción (Vercel) - REQUERIDAS
- `BUILDERBOT_BOT_ID`: **REQUERIDO** - ID del bot de BuilderBot para enviar mensajes
- `BUILDERBOT_API_KEY`: **REQUERIDO** - API Key de BuilderBot para autenticación
- `UPSTASH_REDIS_REST_URL`: **REQUERIDO** - URL de Redis Upstash para almacenar mensajes
- `UPSTASH_REDIS_REST_TOKEN`: **REQUERIDO** - Token de Redis Upstash para autenticación
- `BUILDERBOT_BASE_URL`: Opcional - URL base de BuilderBot Cloud (default: https://app.builderbot.cloud)

### Producción (Railway) - REQUERIDAS
- `UPSTASH_REDIS_REST_URL`: **REQUERIDO** - **MISMA URL que en Vercel** (para compartir datos)
- `UPSTASH_REDIS_REST_TOKEN`: **REQUERIDO** - **MISMO TOKEN que en Vercel** (para compartir datos)
- `BUILDERBOT_BOT_ID`: Opcional - Solo si Railway también envía mensajes
- `BUILDERBOT_API_KEY`: Opcional - Solo si Railway también envía mensajes
- `VERCEL_WEBHOOK_URL`: Opcional - URL de Vercel (solo si quieres reenviar webhooks)

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
   - `BUILDERBOT_BOT_ID`: **REQUERIDO** - ID del bot de BuilderBot (obtener desde https://app.builderbot.cloud)
   - `BUILDERBOT_API_KEY`: **REQUERIDO** - API Key de BuilderBot (obtener desde https://app.builderbot.cloud)
   - `UPSTASH_REDIS_REST_URL`: **REQUERIDO** - URL de tu instancia de Redis Upstash
   - `UPSTASH_REDIS_REST_TOKEN`: **REQUERIDO** - Token de tu instancia de Redis Upstash
   - `BUILDERBOT_BASE_URL`: Opcional - URL base (default: https://app.builderbot.cloud)
4. Configura el webhook en BuilderBot apuntando a: `https://tu-dominio.vercel.app/api/webhooks/builderbot`
5. Verifica la configuración visitando: `https://tu-dominio.vercel.app/api/health/builderbot`
6. Deploy automático

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

