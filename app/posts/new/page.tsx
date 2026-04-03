'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하여야 합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile, { upsert: true })

      if (uploadError) {
        setError(`이미지 업로드 실패: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      image_url = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('posts').insert({
      title,
      content,
      image_url,
      user_id: user.id,
    })

    if (insertError) {
      setError(`게시글 저장 실패: ${insertError.message}`)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Blog</Link>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {loading ? '저장 중...' : '게시하기'}
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이미지 업로드 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors overflow-hidden bg-white"
          >
            {imagePreview ? (
              <Image src={imagePreview} alt="preview" fill className="object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">🖼️</div>
                <p className="text-sm text-gray-400">클릭하여 사진 추가 (선택, 최대 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {imagePreview && (
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              사진 제거
            </button>
          )}

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
            className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-200"
          />

          <div className="border-t border-gray-100" />

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            required
            rows={16}
            className="w-full text-base text-gray-700 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 leading-relaxed"
          />
        </form>
      </main>
    </div>
  )
}
