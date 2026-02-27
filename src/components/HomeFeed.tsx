import React from 'react';

export default function HomeFeed() {
  const postings = [
    {
      id: 1,
      type: 'Job',
      company: 'TechNova',
      title: 'Frontend Developer Intern (React)',
      reward: '¥1,500/hr',
      tags: ['Web Dev', 'Remote'],
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'Event',
      company: 'Marketing Pros',
      title: 'Next-Gen SEO Strategies Workshop',
      reward: 'Free Entry',
      tags: ['Marketing', 'Tokyo'],
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'Job',
      company: 'DesignWorks',
      title: 'UI/UX Designer for Web3 App',
      reward: '¥100,000 / project',
      tags: ['Design', 'Figma'],
      time: '1 day ago',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">
          <span className="text-primary">Train</span> Board
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full glass text-sm font-semibold hover-up text-primary">All</button>
          <button className="px-4 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Jobs</button>
          <button className="px-4 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Events</button>
        </div>
      </div>

      <div className="space-y-6">
        {postings.map((post) => (
          <div key={post.id} className="glass rounded-3xl p-6 hover-up flex flex-col md:flex-row gap-6 relative overflow-hidden group">
            {/* Optional decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500"></div>
            
            <div className="flex-1 space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${post.type === 'Job' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-600'}`}>
                  {post.type}
                </span>
                <span className="text-sm font-medium text-slate-500">{post.company}</span>
                <span className="text-sm text-slate-400 ml-auto">{post.time}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{post.title}</h2>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{post.reward}</p>
              
              <div className="flex gap-2 pt-2">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end md:justify-center relative z-10">
              <button className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-[0_10px_20px_-10px_rgba(45,140,255,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(45,140,255,0.8)] hover:scale-105 transition-all duration-300">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
