'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ postId, imageUrl }: { postId: string; imageUrl: string | null }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)

    // 이미지가 있으면 Storage에서도 삭제
    if (imageUrl) {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/post-images/')
      if (pathParts.length > 1) {
        await supabase.storage.from('post-images').remove([pathParts[1]])
      }
    }

    await supabase.from('posts').delete().eq('id', postId)
    router.push('/')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">정말 삭제할까요?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm text-red-500 font-medium hover:text-red-700 transition-colors"
        >
          {loading ? '삭제 중...' : '삭제'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-400 hover:text-red-400 transition-colors"
    >
      삭제
    </button>
  )
}
