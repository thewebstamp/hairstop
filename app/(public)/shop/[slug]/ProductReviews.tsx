// app/(public)/shop/[slug]/ProductReviews.tsx
import { getProductReviews } from '@/lib/data';
import ReviewForm from './ReviewForm';
import HelpfulButton from './HelpfulButton';

export default async function ProductReviews({ productId }: { productId: number }) {
  const { reviews, stats } = await getProductReviews(productId);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-16 pt-12 border-t border-[#f7e7ce]/50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1.5 h-8 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full"></div>
        <h3 className="text-3xl font-bold font-heading tracking-tight text-gray-900">Customer Reviews</h3>
      </div>

      {/* Review Stats - Modern Card Design */}
      <div className="relative overflow-hidden bg-linear-to-br from-[#faf9f6] via-white to-[#f7e7ce]/30 rounded-2xl p-8 mb-10 border border-white/50 shadow-2xl shadow-[#f5c8c8]/20 backdrop-blur-sm">
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-radial-gradient(circle, #f5c8c8 0%, transparent 70%) opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-radial-gradient(circle, #f7e7ce 0%, transparent 70%) opacity-30"></div>
        
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Average Rating - Modern Display */}
          <div className="text-center mb-6 lg:mb-0 lg:mr-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-linear-to-r from-[#800020] to-[#b76e79] blur-xl opacity-30 rounded-full"></div>
              <div className="relative text-6xl font-bold mb-3 text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
                {stats.average_rating.toFixed(1)}
              </div>
            </div>
            <div className="flex items-center justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-3xl transition-transform duration-300 hover:scale-110 ${
                    i < Math.floor(stats.average_rating)
                      ? 'text-[#800020] drop-shadow-lg'
                      : i < stats.average_rating
                      ? 'text-[#b76e79]'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-sm font-medium text-gray-600 px-6 py-2 bg-white/50 rounded-full inline-block backdrop-blur-sm">
              Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution - Modern Bar Chart */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-4">
              {stats.rating_distribution.map((item, index) => (
                <div key={item.rating} className="flex items-center group">
                  <div className="w-16 text-sm font-semibold text-right pr-3 text-gray-700">
                    {item.rating}★
                  </div>
                  <div className="grow relative h-4 bg-linear-to-r from-white to-[#faf9f6] rounded-full mx-3 overflow-hidden border border-white/50 shadow-inner">
                    <div
                      className="h-full bg-linear-to-r from-[#f5c8c8] via-[#b76e79] to-[#800020] rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.percentage}%`,
                        animation: `slideIn ${0.5 + index * 0.1}s ease-out`
                      }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm font-bold text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79]">
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      <ReviewForm productId={productId} />

      {/* Reviews List - Modern Cards */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-linear-to-b from-[#b76e79] to-[#f5c8c8] rounded-full"></div>
          <h4 className="text-xl font-bold text-gray-900">
            Customer Reviews ({reviews.length})
          </h4>
        </div>
        
        {reviews.length === 0 ? (
          <div className="relative overflow-hidden bg-linear-to-br from-[#faf9f6] to-white rounded-2xl p-12 text-center border border-white/50 shadow-lg">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#f7e7ce]/10 to-transparent"></div>
            <div className="relative text-7xl mb-6 animate-float">✨</div>
            <h4 className="text-2xl font-bold mb-3 text-gray-900">No Reviews Yet</h4>
            <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed">
              Be the first to share your thoughts about this product!
              Your review will help others make informed decisions.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="group relative overflow-hidden bg-linear-to-br from-white to-[#faf9f6] rounded-2xl p-8 border border-[#f7e7ce]/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#800020] to-transparent rounded-full"></div>
                </div>

                <div className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Display Name with Badge */}
                        <div className="relative">
                          <h5 className="font-bold text-xl bg-linear-to-r from-[#800020] to-[#b76e79] bg-clip-text text-transparent">
                            {review.display_name || review.user_name || 'Anonymous'}
                          </h5>
                          {review.verified_purchase && (
                            <div className="absolute -top-2 -right-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-linear-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating Stars with Date */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xl transition-all duration-300 hover:scale-125 ${
                                i < review.rating 
                                  ? 'text-[#800020] drop-shadow-md' 
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Review Comment */}
                      <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line pl-4 border-l-2 border-[#f5c8c8]">
                        {review.comment}
                      </p>
                    </div>

                    {/* Helpful Button - Modern Placement */}
                    <div className="lg:self-start">
                      <HelpfulButton reviewId={review.id} initialHelpful={review.helpful} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}