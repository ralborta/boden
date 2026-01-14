import crypto from 'crypto'

/**
 * Desencripta archivos de media de WhatsApp usando mediaKey
 * WhatsApp usa AES-256-CBC para encriptar archivos de media
 * 
 * Referencia: https://deepwiki.com/wppconnect-team/wppconnect/8.1-media-encryption-and-decryption
 */
export function decryptWhatsAppMedia(
  encryptedData: Buffer,
  mediaKey: string,
  mediaType: 'image' | 'video' | 'document' | 'audio' | 'sticker' = 'image'
): Buffer {
  try {
    console.log('[WhatsApp Decrypt] Iniciando desencriptación:', {
      encryptedSize: encryptedData.length,
      mediaKeyLength: mediaKey.length,
      mediaType,
    })

    // Convertir mediaKey de base64 a Buffer
    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64')
    
    if (mediaKeyBuffer.length !== 32) {
      throw new Error(`mediaKey debe tener 32 bytes, tiene ${mediaKeyBuffer.length}`)
    }
    
    // WhatsApp usa HKDF para derivar las claves de encriptación
    // HKDF con SHA-256, info específico según el tipo de media
    const info = getMediaInfo(mediaType)
    
    // Derivar la clave de encriptación usando HKDF
    // WhatsApp genera 112 bytes: 16 (IV) + 32 (cipher key) + 64 (MAC key)
    const derivedKey = hkdf(mediaKeyBuffer, 112, info)
    
    // Extraer componentes según documentación de WhatsApp:
    // - IV: primeros 16 bytes
    // - Cipher Key: bytes 16-48 (32 bytes)
    // - MAC Key: bytes 48-112 (64 bytes)
    const iv = derivedKey.slice(0, 16)
    const cipherKey = derivedKey.slice(16, 48)
    const macKey = derivedKey.slice(48, 112)
    
    console.log('[WhatsApp Decrypt] Claves derivadas:', {
      ivLength: iv.length,
      cipherKeyLength: cipherKey.length,
      macKeyLength: macKey.length,
    })
    
    // Verificar integridad usando MAC (opcional pero recomendado)
    // WhatsApp agrega un MAC al final del archivo encriptado
    // Por ahora omitimos la verificación MAC para simplificar
    
    // Desencriptar usando AES-256-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv)
    decipher.setAutoPadding(true) // AES-CBC usa PKCS7 padding automáticamente
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ])
    
    console.log('[WhatsApp Decrypt] Archivo desencriptado, tamaño:', decrypted.length, 'bytes')
    
    // WhatsApp NO agrega padding al inicio según la documentación más reciente
    // El padding es manejado automáticamente por AES-CBC
    // Retornar el archivo desencriptado completo
    return decrypted
  } catch (error) {
    console.error('[WhatsApp Decrypt] Error desencriptando:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw new Error(`Error al desencriptar media: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Obtiene el info string para HKDF según el tipo de media
 */
function getMediaInfo(mediaType: 'image' | 'video' | 'document' | 'audio' | 'sticker'): Buffer {
  const infoMap = {
    image: Buffer.from('WhatsApp Image Keys'),
    video: Buffer.from('WhatsApp Video Keys'),
    document: Buffer.from('WhatsApp Document Keys'),
    audio: Buffer.from('WhatsApp Audio Keys'),
    sticker: Buffer.from('WhatsApp Image Keys'), // Stickers usan el mismo que imágenes
  }
  return infoMap[mediaType]
}

/**
 * Implementación de HKDF (HMAC-based Key Derivation Function)
 * WhatsApp usa HKDF-SHA-256 para derivar claves
 * RFC 5869: https://tools.ietf.org/html/rfc5869
 */
function hkdf(ikm: Buffer, length: number, info: Buffer): Buffer {
  const hashAlg = 'sha256'
  const hashLen = 32 // SHA-256 produce 32 bytes
  
  // HKDF-Extract: PRK = HMAC-Hash(salt, IKM)
  // WhatsApp usa un salt vacío (0 bytes) según documentación
  const salt = Buffer.alloc(0)
  const prk = crypto.createHmac(hashAlg, salt).update(ikm).digest()
  
  // HKDF-Expand: OKM = T(1) || T(2) || ... || T(N)
  // T(0) = empty string
  // T(i) = HMAC-Hash(PRK, T(i-1) || info || i)
  const n = Math.ceil(length / hashLen)
  const okm = Buffer.alloc(length)
  
  let previous = Buffer.alloc(0)
  for (let i = 0; i < n; i++) {
    const t = crypto.createHmac(hashAlg, prk)
      .update(Buffer.concat([previous, info, Buffer.from([i + 1])]))
      .digest()
    
    // Copiar al buffer de salida (puede ser parcial en la última iteración)
    const bytesToCopy = Math.min(hashLen, length - (i * hashLen))
    t.copy(okm, i * hashLen, 0, bytesToCopy)
    previous = t
  }
  
  return okm
}
