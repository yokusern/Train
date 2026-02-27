import React from 'react';

export default function PricingTable() {
    const plans = [
        {
            name: 'Free',
            price: '¥0',
            period: '/mo',
            description: 'Zero upfront cost. Best for testing the waters.',
            features: [
                'Pay-per-match (¥3,000/match)',
                'Unlimited event & job postings',
                'Basic company profile',
                'Standard support'
            ],
            highlight: false,
        },
        {
            name: 'Standard',
            price: '¥5,000',
            period: '/mo',
            description: 'Flat rate for unlimited hiring potential.',
            features: [
                'Unlimited matching (No per-match fee)',
                'Unlimited event & job postings',
                'Enhanced visibility on Train Board',
                'Priority support'
            ],
            highlight: true,
            badge: 'Most Popular'
        },
        {
            name: 'Scout',
            price: '¥30,000',
            period: '/mo',
            description: 'Full-service concierge recruitment.',
            features: [
                'Everything in Standard Plan',
                'Concierge Recruitment Service',
                'Admin scouts students on your behalf',
                'Targeted persona matching',
            ],
            highlight: false,
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-16 px-4">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-800 dark:text-white">
                    Accelerate your <span className="text-primary">Hiring</span>.
                </h2>
                <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                    Choose a plan that fits your business scale. No hidden fees. Pay only for what brings value.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
                {plans.map((plan) => (
                    <div key={plan.name}
                        className={`relative rounded-3xl p-8 transition-all duration-300 ${plan.highlight ? 'bg-primary text-white scale-105 shadow-[0_20px_50px_-15px_rgba(45,140,255,0.5)] z-10' : 'glass hover-up text-slate-800 dark:text-white'}`}>

                        {plan.badge && (
                            <div className="absolute top-0 right-10 -translate-y-1/2 bg-yellow-400 text-slate-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                                {plan.badge}
                            </div>
                        )}

                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="mb-4">
                            <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                            <span className={`text-sm font-medium ${plan.highlight ? 'text-white/80' : 'text-slate-400'}`}>{plan.period}</span>
                        </div>
                        <p className={`text-sm mb-8 font-medium ${plan.highlight ? 'text-white/90' : 'text-slate-500'}`}>
                            {plan.description}
                        </p>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <svg className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-white' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className={`text-sm font-semibold ${plan.highlight ? 'text-white/95' : 'text-slate-600 dark:text-slate-300'}`}>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-4 rounded-full font-bold transition-all ${plan.highlight ? 'bg-white text-primary hover:bg-slate-50' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'}`}>
                            Get Started
                        </button>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <div className="inline-flex flex-col items-center p-8 rounded-3xl glass backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white relative z-10">Not sure which plan to choose?</h3>
                    <p className="text-slate-500 mb-6 font-medium relative z-10">Our recruitment experts are here to help you structure your perfect hiring flow.</p>
                    <button className="relative z-10 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                        <span>📅</span> Book a Zoom Consultation
                    </button>
                </div>
            </div>
        </div>
    );
}
