# Boden CRM

CRM y Panel de Control para Chatbot de IA construido con Next.js 14, TypeScript y Tailwind CSS.

## Características

- 🎨 Diseño moderno y limpio con Tailwind CSS
- 📊 Dashboard con KPIs y gráficos de funnel
- 🤖 Configuración del asistente de IA (Cerebro)
- 📁 Gestión de base de conocimiento con archivos
- 🔌 Integración con BuilderBot API

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` y configura `BUILDERBOT_API_URL` con la URL de tu API de BuilderBot.

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   └── builderbot/
│   │       ├── files/
│   │       │   └── route.ts
│   │       └── prompt/
│   │           └── route.ts
│   ├── cerebro/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    └── Sidebar.tsx
```

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide React (iconos)

## Variables de Entorno

- `BUILDERBOT_API_URL`: URL de la API de BuilderBot (default: http://localhost:3001)

