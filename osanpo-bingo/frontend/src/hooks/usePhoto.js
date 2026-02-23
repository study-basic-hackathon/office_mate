/**
 * usePhoto
 * Supabase Storage への写真アップロードをまとめたフック
 */
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePhoto() {
  const [uploading, setUploading] = useState(false)

  /**
   * File オブジェクトを Supabase Storage にアップロードし、公開 URL を返す
   * @param {File}   file
   * @param {string} roomCode
   * @param {number} cellIndex
   * @returns {Promise<string>} 公開 URL
   */
  const uploadPhoto = useCallback(async (file, roomCode, cellIndex) => {
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${roomCode}/${cellIndex}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('bingo-photos')          // Storage バケット名
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('bingo-photos')
        .getPublicUrl(path)

      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploadPhoto, uploading }
}
