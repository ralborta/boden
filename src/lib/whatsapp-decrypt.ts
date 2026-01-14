import crypto from 'crypto'

/**
 * Desencripta archivos de media de WhatsApp usando mediaKey
 * WhatsApp usa AES-256-CBC para encriptar archivos de media
 */
export function decryptWhatsAppMedia(
  encryptedData: Buffer,
  mediaKey: string,
  mediaType: 'image' | 'video' | 'document' | 'audio' | 'sticker' = 'image'
): Buffer {
  try {
    // Convertir mediaKey de base64 a Buffer
    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64')
    
    // WhatsApp usa HKDF para derivar las claves de encriptación
    // HKDF con SHA-256, info específico según el tipo de media
    const info = getMediaInfo(mediaType)
    
    // Derivar la clave de encriptación usando HKDF
    const derivedKey = hkdf(mediaKeyBuffer, 112, info) // 112 bytes = 32 (IV) + 80 (cipher key)
    
    // Extraer IV (primeros 32 bytes) y cipher key (siguientes 80 bytes, pero solo usamos 32)
    const iv = derivedKey.slice(0, 32)
    const cipherKey = derivedKey.slice(32, 64)
    
    // Desencriptar usando AES-256-CBC
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv)
    
    // WhatsApp agrega 10 bytes de padding al inicio que debemos remover
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ])
    
    // Remover los primeros 10 bytes (padding de WhatsApp)
    return decrypted.slice(10)
  } catch (error) {
    console.error('[WhatsApp Decrypt] Error desencriptando:', error)
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
 */
function hkdf(ikm: Buffer, length: number, info: Buffer): Buffer {
  const hashAlg = 'sha256'
  const hashLen = 32 // SHA-256 produce 32 bytes
  
  // HKDF-Extract: PRK = HMAC-Hash(salt, IKM)
  // WhatsApp usa un salt vacío (0 bytes)
  const salt = Buffer.alloc(0)
  const prk = crypto.createHmac(hashAlg, salt).update(ikm).digest()
  
  // HKDF-Expand: OKM = T(1) || T(2) || ... || T(N)
  const n = Math.ceil(length / hashLen)
  const okm = Buffer.alloc(length)
  
  let previous = Buffer.alloc(0)
  for (let i = 0; i < n; i++) {
    const t = crypto.createHmac(hashAlg, prk)
      .update(Buffer.concat([previous, info, Buffer.from([i + 1])]))
      .digest()
    
    t.copy(okm, i * hashLen)
    previous = t
  }
  
  return okm
}
