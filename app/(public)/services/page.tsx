// app/services/page.tsx - REDESIGNED VERSION
import Image from 'next/image';

export const metadata = {
    title: 'Special Services | Hair Stop',
    description: 'Premium hair services at Hair Stop: hair revamping, wig making, and professional hair maintenance & massage. We are keepers of your luxury hair.',
    keywords: ['hair maintenance', 'wig making', 'hair revamping', 'hair massage', 'luxury hair services', 'Nigeria hair care', 'human hair maintenance'],
};

export default function ServicesPage() {
    const services = [
        {
            id: 'revamping',
            title: 'Hair Revamping',
            description: 'Breathe new life into your tired or damaged hair extensions. Our experts restore the original beauty and quality of your hair pieces.',
            features: [
                'Color correction & redyeing',
                'Split ends repair & trimming',
                'Curl pattern restoration',
                'Deep conditioning treatments',
                'Texture revitalization',
            ],
            image: '/images/hairstop.jpg',
            icon: '🔄',
            color: 'from-[#800020] to-[#a00030]',
            accent: 'bg-[#800020]'
        },
        {
            id: 'wig-making',
            title: 'Custom Wig Making',
            description: 'Get a perfectly fitted, custom-designed wig that complements your face shape, style, and personality. Crafted with precision and artistry.',
            features: [
                'Custom measurements & fitting',
                'Lace front & closure customization',
                'Styling & cut to suit your face',
                'Ventilation & hand-tying services',
                'Wig repairs & alterations',
            ],
            image: '/images/hairstop.jpg',
            icon: '👑',
            color: 'from-[#f5c8c8] to-[#f7e7ce]',
            accent: 'bg-[#f5c8c8]'
        },
        {
            id: 'maintenance',
            title: 'Hair Maintenance & Massage',
            description: 'Professional maintenance combined with therapeutic scalp massage to promote hair health, growth, and longevity of your hair pieces.',
            features: [
                'Scalp analysis & treatment',
                'Therapeutic scalp massage',
                'Steam treatment & deep conditioning',
                'Hair & scalp detoxification',
                'Personalized maintenance plans',
            ],
            image: '/images/hairstop.jpg',
            icon: '💆‍♀️',
            color: 'from-[#800020] to-[#b76e79]',
            accent: 'bg-[#800020]'
        },
    ];

    const maintenancePlans = [
        {
            name: 'Essential Care',
            price: '₦15,000',
            period: '/month',
            features: [
                'Monthly deep conditioning',
                'Scalp health check',
                'Basic styling refresh',
                'Priority booking',
            ],
            featured: false,
        },
        {
            name: 'Premium Maintenance',
            price: '₦35,000',
            period: '/quarter',
            features: [
                'Quarterly comprehensive maintenance',
                'Full hair & scalp analysis',
                'Therapeutic scalp massage',
                'Steam treatment included',
                'Free minor repairs',
            ],
            featured: true,
        },
        {
            name: 'Luxury Preservation',
            price: '₦120,000',
            period: '/year',
            features: [
                'Bi-monthly maintenance sessions',
                'Annual full revamp service',
                'Unlimited consultation',
                'Free product kit',
                'Emergency service priority',
            ],
            featured: false,
        },
    ];

    const phoneNumber = '09036981564';

    return (
        <div className="min-h-screen bg-linear-to-b from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8]/30">
            {/* Minimal Hero Section */}
            <section className="relative min-h-[50vh] max-h-[50vh] flex items-center justify-center overflow-hidden">
                {/* Background with logo pattern */}
                <div className="absolute inset-0 bg-linear-to-br from-[#faf9f6] via-[#f7e7ce] to-[#f5c8c8] opacity-90">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url(/images/logo1.png)`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: '200px 200px',
                            backgroundPosition: 'center'
                        }} />
                    </div>
                </div>

                {/* Subtle decorative elements */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#800020] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#800020] to-transparent" />

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                    <div className="inline-block mb-2">
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-2 relative">
                            <Image
                                src="/images/logo1.png"
                                alt="Hair Stop Logo"
                                width={96}
                                height={96}
                                className="rounded-full border-4 border-white shadow-xl"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#800020] mb-3 leading-tight">
                        Premium <span className="text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b83a4d]">Hair Services</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Beyond selling hair—we maintain, revitalize, and preserve your luxury investments
                    </p>
                </div>
            </section>

            {/* Our Special Services */}
            <section className="py-16 md:py-24 px-4" id="services">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="group relative bg-linear-to-br from-white to-[#faf9f6] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-[#f5c8c8]/50"
                            >
                                {/* Service Header */}
                                <div className={`h-2 ${service.accent}`} />

                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="text-4xl mb-4">{service.icon}</div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                {service.title}
                                            </h3>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl bg-linear-to-r ${service.color} text-white flex items-center justify-center text-xl`}>
                                            →
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-8 leading-relaxed text-[17px]">
                                        {service.description}
                                    </p>

                                    <ul className="space-y-3 mb-10">
                                        {service.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] flex items-center justify-center mr-3 mt-1 shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-[#800020]" />
                                                </div>
                                                <span className="text-gray-700 text-[16px]">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href={`tel:${phoneNumber}`}
                                        className="inline-flex items-center justify-center w-full bg-linear-to-r from-[#800020] to-[#a00030] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call to Book
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Maintenance Plans - No CTA */}
            <section className="py-16 md:py-24 px-4 bg-linear-to-b from-white to-[#faf9f6]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl mb-6">
                            <span className="text-2xl">📅</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#800020] mb-4">
                            Automated Maintenance Plans
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Periodic care plans to protect your hair investment at discounted prices
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {maintenancePlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-linear-to-br from-white to-[#faf9f6] rounded-3xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] ${plan.featured ? 'border-[#800020] shadow-2xl' : 'border-[#f5c8c8] shadow-xl'
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute top-0 right-0">
                                        <div className="relative">
                                            <div className="w-32 h-8 bg-linear-to-r from-[#800020] to-[#a00030] transform rotate-45 translate-x-8 translate-y-4" />
                                            <div className="absolute top-2 right-4 text-white text-xs font-bold">
                                                MOST POPULAR
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {plan.name}
                                    </h3>

                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-[#800020]">{plan.price}</span>
                                        <span className="text-gray-600 text-lg">{plan.period}</span>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] flex items-center justify-center mr-3 mt-1 shrink-0">
                                                    <svg className="w-3 h-3 text-[#800020]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* No CTA button - Just informational */}
                                    <div className="text-center pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">
                                            Contact us for enrollment
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Concise Philosophy Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
                        <div className="w-full lg:w-1/2">
                            <div className="relative h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl group">
                                <Image
                                    src="/images/hairstop.jpg"
                                    alt="Hair Stop Philosophy"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="w-12 h-1 bg-white mb-4" />
                                    <p className="text-white text-lg font-semibold">Our Commitment to Your Hair</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-3xl p-8 md:p-10 shadow-xl">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-2xl mb-6">
                                    <span className="text-2xl">💎</span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold text-[#800020] mb-6">
                                    We Are Keepers of Luxury Hair
                                </h3>

                                <div className="space-y-4 text-gray-700">
                                    <p className="text-lg leading-relaxed">
                                        At Hair Stop, we believe in being more than just sellers—we are dedicated keepers of your luxury hair investments.
                                    </p>
                                    <p className="text-lg leading-relaxed">
                                        Each hair bundle, wig, and frontal represents craftsmanship, beauty, and trust. We provide lifelong care to ensure your premium hair maintains its luster, strength, and beauty.
                                    </p>
                                    <p className="text-lg leading-relaxed">
                                        When you invest with us, you gain a partner committed to preserving the quality and longevity of your luxury hair.
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-[#f5c8c8]">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="text-2xl font-bold text-[#800020]">Luxury Hair Care</div>
                                            <div className="text-gray-600">Preserved with Excellence</div>
                                        </div>
                                        <a
                                            href={`tel:${phoneNumber}`}
                                            className="inline-flex items-center justify-center bg-linear-to-r from-[#800020] to-[#a00030] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#800020]/20 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call for Consultation
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Footer Note */}
            <section className="py-12 px-4 bg-linear-to-r from-[#faf9f6] to-[#f7e7ce] border-t border-[#f5c8c8]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-r from-[#800020] to-[#a00030] text-white rounded-full mb-4">
                        <span className="text-lg">⭐</span>
                    </div>
                    <h4 className="text-xl font-bold text-[#800020] mb-3">Premium Hair Services</h4>
                    <p className="text-gray-600 mb-6">
                        Your luxury hair deserves expert care. Let us be your partners in preserving beauty and quality.
                    </p>
                    <div className="text-lg font-bold text-[#800020]">
                        <a href={`tel:${phoneNumber}`} className="hover:text-[#a00030] transition-colors">
                            📞 {phoneNumber}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}