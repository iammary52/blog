import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  profiles?: {
    username: string | null
  } | { username: string | null }[] | null
}

export default function PostCard({ post }: { post: Post }) {
  const excerpt = post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/posts/${post.id}`}>
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group cursor-pointer">
        {post.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{(Array.isArray(post.profiles) ? post.profiles[0]?.username : post.profiles?.username)?.split('@')[0] ?? '익명'}</span>
            <span>{date}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
