import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    // Verificar que las variables estén configuradas
    if (!redisUrl || !redisToken) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Redis no está configurado',
          details: {
            hasUrl: !!redisUrl,
            hasToken: !!redisToken,
            urlValid: redisUrl ? redisUrl.startsWith('https://') : false,
            tokenLength: redisToken ? redisToken.length : 0,
          },
          suggestion: 'Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en las variables de entorno',
        },
        { status: 500 }
      )
    }

    // Intentar conectar a Redis
    const redis = new Redis({ url: redisUrl, token: redisToken })

    // Hacer una prueba simple: PING
    try {
      const pingResult = await redis.ping()
      
      // Si PING funciona, hacer una prueba de escritura/lectura
      const testKey = 'boden:health:test'
      const testValue = `test-${Date.now()}`
      
      await redis.set(testKey, testValue, { ex: 10 }) // Expira en 10 segundos
      const readValue = await redis.get(testKey)
      await redis.del(testKey) // Limpiar

      if (readValue === testValue) {
        return NextResponse.json({
          status: 'success',
          message: 'Redis está configurado correctamente',
          details: {
            ping: pingResult,
            writeReadTest: 'passed',
            url: redisUrl.substring(0, 30) + '...', // Mostrar solo parte de la URL
            tokenConfigured: true,
            environment: process.env.VERCEL ? 'Vercel' : process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local',
          },
        })
      } else {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Redis responde pero la prueba de escritura/lectura falló',
            details: {
              ping: pingResult,
              writeReadTest: 'failed',
            },
          },
          { status: 500 }
        )
      }
    } catch (redisError) {
      const errorMessage = redisError instanceof Error ? redisError.message : String(redisError)
      
      return NextResponse.json(
        {
          status: 'error',
          message: 'Error al conectar con Redis',
          error: errorMessage,
          details: {
            isUpstashError: errorMessage.includes('UpstashError'),
            isWrongPass: errorMessage.includes('WRONGPASS'),
            suggestion: errorMessage.includes('WRONGPASS')
              ? 'El token de Redis es incorrecto. Verifica UPSTASH_REDIS_REST_TOKEN en las variables de entorno'
              : 'Verifica que UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN sean correctos',
          },
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error inesperado',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}



