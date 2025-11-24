# Boden API

Backend API para Boden CRM - Manejo de Webhooks de Builderbot

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:8080`

## Build

```bash
npm run build
```

## Producción

```bash
npm start
```

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 8080)
- `HOST`: Host del servidor (default: 0.0.0.0)

## Endpoints

### Health Check

- `GET /` - Estado del servicio
- `GET /health` - Health check detallado

### Webhooks

- `POST /webhooks/builderbot` - Recibe webhooks de Builderbot

## Eventos de Builderbot Soportados

- `message.incoming` - Mensaje entrante
- `message.outgoing` - Mensaje saliente
- `message.calling` - Llamada

## Deploy en Railway

1. Conecta el repositorio a Railway
2. Railway detectará automáticamente el `package.json` en la carpeta `api/`
3. Configura las variables de entorno necesarias
4. El servidor se iniciará automáticamente

