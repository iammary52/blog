import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, image_url, created_at, user_id')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const isOwner = user?.id === post.user_id
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Blog</Link>
          {isOwner && <DeleteButton postId={post.id} imageUrl={post.image_url} />}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <article>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{date}</span>
            </div>
          </div>

          {post.image_url && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            ← 목록으로
          </Link>
        </div>
      </main>
    </div>
  )
}
