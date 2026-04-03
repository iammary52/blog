import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      image_url,
      created_at,
      profiles (
        username
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">최근 글</h1>
          <p className="text-sm text-gray-400 mt-1">모든 사람의 이야기를 읽어보세요</p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">아직 게시글이 없습니다.</p>
            <p className="text-sm mt-2">첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
