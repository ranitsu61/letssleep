import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// SleepyDawn: single-file React component
// - Uses Tailwind CSS classes (no Tailwind import here; your project must have Tailwind configured)
// - Persists posts/likes/comments to localStorage
// - Soft dawn theme with animated stars and floating sheep

export default function SleepyDawnApp() {
  const STORAGE_KEY = 'sleepy_posts_v1';
  const LIKES_KEY = 'sleepy_likes_v1';

  const [posts, setPosts] = useState([]);
  const [likedByMe, setLikedByMe] = useState({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.length) {
      setPosts(parsed);
    } else {
      // seed demo post for first-time visitors
      const seed = [
        {
          id: 'seed-1',
          title: '꿀잠을 부르는 루틴',
          body: '잠들기 30분 전 디지털 기기 사용 줄이기, 따뜻한 차 한 잔, 얕은 스트레칭이 도움이 돼요. 여러분만의 루틴을 댓글로 공유해보세요!',
          ts: Date.now(),
          likes: 3,
          comments: [
            { id: 'c1', text: '저는 책 읽는 게 좋아요 😊', ts: Date.now() - 100000 },
          ],
        },
      ];
      setPosts(seed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    }

    const rawLikes = localStorage.getItem(LIKES_KEY);
    setLikedByMe(rawLikes ? JSON.parse(rawLikes) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likedByMe));
  }, [likedByMe]);

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function addPost(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const newPost = {
      id: makeId(),
      title: title.trim(),
      body: body.trim(),
      ts: Date.now(),
      likes: 0,
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setTitle('');
    setBody('');
  }

  function toggleLike(postId) {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, likes: (p.likes || 0) + (likedByMe[postId] ? -1 : 1) } : p))
    );
    setLikedByMe(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  function addComment(postId, text, clearFn) {
    if (!text || !text.trim()) return;
    const comment = { id: makeId(), text: text.trim(), ts: Date.now() };
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)));
    if (clearFn) clearFn();
  }

  // visual helpers
  const starCount = 40;
  const stars = Array.from({ length: starCount }).map((_, i) => ({
    id: i,
    size: 6 + Math.round(Math.random() * 6),
    top: Math.round(Math.random() * 100),
    left: Math.round(Math.random() * 100),
    delay: Math.random() * 6,
    dur: 3 + Math.random() * 4,
    opacity: 0.4 + Math.random() * 0.6,
  }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-b from-[#0f172a] via-[#102541] to-[#f6f1ff] relative overflow-hidden text-gray-900">
      {/* Background stars */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2b4a] to-[#f6f1ff] opacity-95"></div>
        {stars.map(s => (
          <span
            key={s.id}
            className="block rounded-full bg-white absolute"
            style={{
              width: s.size / 2 + 'px',
              height: s.size / 2 + 'px',
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.08)',
              animation: `twinkle ${s.dur}s infinite ease-in-out ${s.delay}s`,
            }}
          />
        ))}

        {/* sheep silhouettes floating */}
        <motion.div
          className="absolute left-8 top-8 text-2xl select-none opacity-90"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <SheepSVG />
        </motion.div>
        <motion.div
          className="absolute right-10 top-28 text-3xl select-none opacity-95"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 7.5, repeat: Infinity }}
        >
          <SheepSVG />
        </motion.div>
      </div>

      <header className="w-full max-w-3xl mt-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🌙</div>
          <div>
            <h1 className="text-2xl font-semibold text-white">폭신한 새벽: 청소년 수면 지원</h1>
            <p className="text-sm text-white/80">글을 올리고 서로 좋아요와 댓글로 응원해요 — 편안한 밤을 위한 작은 습관들</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl mt-6 mb-20">
        <form onSubmit={addPost} className="bg-white/80 rounded-2xl p-4 shadow-md">
          <label className="block text-sm text-gray-700 font-medium">제목</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full mt-1 p-2 rounded-md border border-gray-200"
            aria-label="post title"
          />

          <label className="block text-sm text-gray-700 font-medium mt-3">내용</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="나만의 수면 루틴, 팁, 질문을 공유해보세요"
            className="w-full mt-1 p-2 rounded-md border border-gray-200 min-h-[88px]"
            aria-label="post body"
          />

          <div className="flex items-center justify-end mt-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#9b8cff] to-[#6ad1f7] text-white shadow hover:brightness-95"
            >
              공유하기
            </button>
          </div>
        </form>

        <section className="mt-6 space-y-4">
          {posts.length === 0 && <p className="text-white/80">아직 글이 없어요 — 첫 글을 남겨주세요!</p>}

          {posts.map(post => (
            <article key={post.id} className="bg-white/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-xs text-gray-500">{new Date(post.ts).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border ${likedByMe[post.id] ? 'bg-pink-100/80 border-pink-300' : 'bg-white/0 border-gray-200'}`}
                    aria-pressed={!!likedByMe[post.id]}
                  >
                    <span className="text-lg">💖</span>
                    <span className="text-sm font-medium">{post.likes || 0}</span>
                  </button>
                </div>
              </div>

              <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.body}</p>

              <div className="mt-4 border-t pt-3 space-y-3">
                <CommentList post={post} onAddComment={(text, clearFn) => addComment(post.id, text, clearFn)} />
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-sm text-white/90">편안한 밤 되세요 — 하나의 작은 습관이 큰 변화를 만듭니다 ✨</div>
      </footer>

      <style>{`
        @keyframes twinkle {
          0% { transform: scale(0.8); opacity: .2 }
          50% { transform: scale(1.2); opacity: 1 }
          100% { transform: scale(0.8); opacity: .2 }
        }
      `}</style>
    </div>
  );
}

function CommentList({ post, onAddComment }) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    onAddComment(text, () => setText(''));
  }

  return (
    <div>
      <div className="space-y-2">
        {(post.comments || []).slice().reverse().map(c => (
          <div key={c.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">🐑</div>
            <div className="bg-gray-100 rounded-xl p-2 flex-1">
              <p className="text-sm text-gray-700">{c.text}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(c.ts).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="댓글 쓰기..."
          className="flex-1 p-2 rounded-full border border-gray-200"
          aria-label="comment input"
        />
        <button className="px-4 py-2 rounded-full bg-[#ffd8e8]">전송</button>
      </form>
    </div>
  );
}

function SheepSVG() {
  // Simple stylized sheep SVG — small and lightweight
  return (
    <svg width="76" height="48" viewBox="0 0 76 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g>
        <ellipse cx="36" cy="24" rx="24" ry="14" fill="white" opacity="0.95" />
        <circle cx="20" cy="18" r="6" fill="#fff" />
        <circle cx="22" cy="17" r="2" fill="#111827" />
        <rect x="48" y="26" width="6" height="10" rx="2" fill="#f3f4f6" transform="rotate(-12 48 26)" />
        <rect x="34" y="26" width="6" height="10" rx="2" fill="#f3f4f6" transform="rotate(12 34 26)" />
      </g>
    </svg>
  );
}
