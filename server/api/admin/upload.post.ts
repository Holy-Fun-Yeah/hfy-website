/**
 * POST /api/admin/upload
 *
 * Upload images to Supabase Storage.
 * Admin-only endpoint.
 *
 * Supports two upload types:
 * - blog: Stored in `blog/img/{filename}` - for blog post images
 * - events: Stored in `events/banner/{filename}` - for event banners
 *
 * Flow:
 * 1. Admin selects image in editor
 * 2. Frontend sends multipart/form-data with image + type
 * 3. Server uploads to Supabase Storage
 * 4. Returns public URL for use in upsert request
 *
 * Request:
 * - Content-Type: multipart/form-data
 * - Fields:
 *   - file: The image file (required)
 *   - type: 'blog' | 'events' (required)
 *   - filename: Optional custom filename (auto-generated if not provided)
 *
 * Response:
 * - url: Public URL of uploaded image
 * - path: Storage path (e.g., 'blog/img/my-image.jpg')
 */

import { createClient } from '@supabase/supabase-js'

import { env } from '../../env'
import { defineApiHandler, Errors } from '../../lib'
import { requireAdmin } from '../../utils/auth'

// Allowed upload types and their storage paths
const UPLOAD_PATHS = {
  blog: 'blog/img',
  events: 'events/banner',
} as const

type UploadType = keyof typeof UPLOAD_PATHS

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Storage bucket name
const STORAGE_BUCKET = 'public'

// Note: Form fields are parsed manually from multipart data
// Type validation is done inline during parsing

/**
 * Generate a unique filename with timestamp
 */
function generateFilename(originalName: string, customName?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  // Get extension from original filename
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'

  if (customName) {
    // Sanitize custom name: lowercase, replace spaces with hyphens, remove special chars
    const sanitized = customName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 100)
    return `${sanitized}-${timestamp}.${ext}`
  }

  // Generate name from original with timestamp
  const baseName = originalName
    .split('.')
    .slice(0, -1)
    .join('.')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50)

  return `${baseName || 'image'}-${timestamp}-${random}.${ext}`
}

export default defineApiHandler(async (event) => {
  // Require admin access
  await requireAdmin(event)

  // Ensure Supabase is configured
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Storage service not configured')
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw Errors.badRequest('No form data provided')
  }

  // Extract file and fields from form data
  let file: { filename?: string; type?: string; data: Buffer } | null = null
  let uploadType: UploadType | null = null
  let customFilename: string | undefined

  for (const field of formData) {
    if (field.name === 'file' && field.data) {
      file = {
        filename: field.filename,
        type: field.type,
        data: field.data,
      }
    } else if (field.name === 'type') {
      const typeValue = field.data.toString()
      if (typeValue === 'blog' || typeValue === 'events') {
        uploadType = typeValue
      }
    } else if (field.name === 'filename') {
      customFilename = field.data.toString()
    }
  }

  // Validate file
  if (!file || !file.data) {
    throw Errors.badRequest('No file provided')
  }

  if (
    !file.type ||
    !ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])
  ) {
    throw Errors.badRequest(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`)
  }

  if (file.data.length > MAX_FILE_SIZE) {
    throw Errors.badRequest(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate upload type
  if (!uploadType) {
    throw Errors.badRequest('Upload type is required (blog or events)')
  }

  // Generate filename
  const filename = generateFilename(file.filename || 'image.jpg', customFilename)
  const storagePath = `${UPLOAD_PATHS[uploadType]}/${filename}`

  // Create Supabase admin client
  const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Upload to Supabase Storage
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file.data, {
      contentType: file.type,
      cacheControl: '3600', // 1 hour cache
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    // Handle specific errors
    if (error.message.includes('already exists')) {
      // File exists, try with a new random suffix
      const retryFilename = generateFilename(file.filename || 'image.jpg')
      const retryPath = `${UPLOAD_PATHS[uploadType]}/${retryFilename}`

      const { error: retryError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(retryPath, file.data, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (retryError) {
        console.error('Storage upload error (retry):', retryError)
        throw Errors.internal('Failed to upload file')
      }

      // Get public URL for retry upload
      const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(retryPath)

      return {
        message: 'File uploaded successfully',
        url: urlData.publicUrl,
        path: retryPath,
        filename: retryFilename,
        size: file.data.length,
        mimeType: file.type,
      }
    }

    console.error('Storage upload error:', error)
    throw Errors.internal('Failed to upload file')
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

  return {
    message: 'File uploaded successfully',
    url: urlData.publicUrl,
    path: storagePath,
    filename,
    size: file.data.length,
    mimeType: file.type,
  }
})
