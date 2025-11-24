import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

// Health check
app.get('/', async () => {
  return { ok: true, service: 'boden-api', version: '0.1.0' }
})

// Health check endpoint
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// 🚀 Webhook de Builderbot
app.post('/webhooks/builderbot', async (request, reply) => {
  const body = request.body as any

  // Log para verificar que llega algo
  app.log.info('📩 Webhook Builderbot recibido:', JSON.stringify(body, null, 2))

  const eventName = body?.eventName
  const data = body?.data

  // Aquí luego podés guardar en BD, crear conversación, etc.
  switch (eventName) {
    case 'message.incoming':
      // data.body, data.from, data.name, etc.
      app.log.info('📥 Mensaje entrante:', {
        from: data?.from,
        name: data?.name,
        body: data?.body,
      })
      // TODO: Guardar en BD, crear conversación si no existe, etc.
      break

    case 'message.outgoing':
      // data.answer, data.from, etc.
      app.log.info('📤 Mensaje saliente:', {
        to: data?.to,
        answer: data?.answer,
      })
      // TODO: Actualizar estado del mensaje en BD
      break

    case 'message.calling':
      // llamadas
      app.log.info('📞 Llamada:', {
        from: data?.from,
        type: data?.type,
      })
      // TODO: Manejar llamadas
      break

    default:
      app.log.warn('⚠️ Evento no manejado:', eventName)
  }

  return reply.status(200).send({ ok: true, eventName })
})

// Manejo de errores
app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message,
  })
})

// Manejo de rutas no encontradas
app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
  })
})

// Asegurate de escuchar en PORT (Railway la inyecta)
const PORT = Number(process.env.PORT) || 8080
const HOST = process.env.HOST || '0.0.0.0'

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    console.log(`🚀 Servidor escuchando en http://${HOST}:${PORT}`)
  })
  .catch((err) => {
    console.error('❌ Error al iniciar el servidor:', err)
    process.exit(1)
  })

