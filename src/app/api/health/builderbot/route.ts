import { NextResponse } from 'next/server'

/**
 * Endpoint de diagnóstico para verificar la configuración de BuilderBot
 * GET /api/health/builderbot
 */
export async function GET() {
  const BOT_ID = process.env.BUILDERBOT_BOT_ID || 
                 process.env.BUILDERBOT_BOTID || 
                 process.env.BUILDERBOT_ID || 
                 process.env.BOT_ID || 
                 process.env.BUILDERBOT_TEST_BOT_ID || 
                 ''
  
  const API_KEY = process.env.BUILDERBOT_API_KEY || 
                  process.env.BUILDERBOT_KEY || 
                  process.env.BB_API_KEY || 
                  process.env.BUILDERBOT_TEST_API_KEY || 
                  ''
  
  const BASE_URL = process.env.BUILDERBOT_BASE_URL || 'https://app.builderbot.cloud'

  const hasBOT_ID = !!BOT_ID && BOT_ID.trim().length > 0
  const hasAPI_KEY = !!API_KEY && API_KEY.trim().length > 0
  const isConfigured = hasBOT_ID && hasAPI_KEY

  const config = {
    configured: isConfigured,
    botId: {
      present: hasBOT_ID,
      length: BOT_ID.length,
      preview: hasBOT_ID ? `${BOT_ID.substring(0, 8)}...${BOT_ID.substring(BOT_ID.length - 4)}` : 'NO CONFIGURADO',
      sources: {
        BUILDERBOT_BOT_ID: !!process.env.BUILDERBOT_BOT_ID,
        BUILDERBOT_BOTID: !!process.env.BUILDERBOT_BOTID,
        BUILDERBOT_ID: !!process.env.BUILDERBOT_ID,
        BOT_ID: !!process.env.BOT_ID,
        BUILDERBOT_TEST_BOT_ID: !!process.env.BUILDERBOT_TEST_BOT_ID,
      },
    },
    apiKey: {
      present: hasAPI_KEY,
      length: API_KEY.length,
      preview: hasAPI_KEY ? `${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}` : 'NO CONFIGURADO',
      sources: {
        BUILDERBOT_API_KEY: !!process.env.BUILDERBOT_API_KEY,
        BUILDERBOT_KEY: !!process.env.BUILDERBOT_KEY,
        BB_API_KEY: !!process.env.BB_API_KEY,
        BUILDERBOT_TEST_API_KEY: !!process.env.BUILDERBOT_TEST_API_KEY,
      },
    },
    baseUrl: BASE_URL,
    endpoint: isConfigured ? `${BASE_URL}/api/v2/${BOT_ID}/messages` : 'N/A',
  }

  return NextResponse.json(config, {
    status: isConfigured ? 200 : 503,
  })
}

