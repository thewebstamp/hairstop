// app/(public)/shop/[slug]/ReviewForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Send, CheckCircle, AlertCircle, User, Mail, MessageSquare } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      setIsSubmitting(false);
      return;
    }

    if (comment.length < 10) {
      setError('Review must be at least 10 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          userName: name.trim(),
          userEmail: email.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Reset form on success
      if (!session?.user) {
        setName('');
        setEmail('');
      }
      setComment('');
      setRating(5);
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
      // Refresh the page to show new review
      setTimeout(() => window.location.reload(), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (ratingValue: number) => {
    const labels: Record<number, string> = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    };
    return labels[ratingValue] || '';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#eee7d0] to-[#f7e7ce]/30 p-8 mb-10 border border-white/50 shadow-2xl shadow-[#800020]/5 backdrop-blur-sm">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-radial-gradient(circle, #f5c8c8 0%, transparent 70%) opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-radial-gradient(circle, #f7e7ce 0%, transparent 70%) opacity-20"></div>
      </div>

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-8 bg-linear-to-b from-[#800020] to-[#b76e79] rounded-full"></div>
          <h4 className="text-2xl font-bold tracking-tight bg-linear-to-r from-[#800020] to-[#b76e79] bg-clip-text text-transparent">
            {session?.user ? `Share Your Thoughts, ${session.user.name}!` : 'Share Your Experience'}
          </h4>
        </div>
        <p className="text-gray-600 ml-5 pl-5 border-l-2 border-[#f5c8c8]">
          Your review helps others make better decisions
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="relative mb-6 p-5 rounded-2xl bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-emerald-400 to-emerald-500"></div>
          <div className="flex items-center gap-3 pl-4">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-700">Thank you for your review!</p>
              <p className="text-sm text-emerald-600">It will appear shortly after moderation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="relative mb-6 p-5 rounded-2xl bg-linear-to-r from-rose-50 to-rose-100 border border-rose-200 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-rose-400 to-rose-500"></div>
          <div className="flex items-center gap-3 pl-4">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <p className="font-medium text-rose-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative space-y-8">
        {/* Rating Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#800020]" fill="#800020" />
            <label className="font-semibold text-gray-900">
              Your Rating <span className="text-rose-500">*</span>
            </label>
          </div>
          
          <div className="bg-linear-to-br from-white to-[#faf9f6] rounded-2xl p-6 border border-white/50 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="relative p-1 transition-all duration-300 transform hover:scale-125 active:scale-95"
                  >
                    <div className={`text-5xl transition-all duration-300 ${
                      star <= (hoverRating || rating) 
                        ? 'text-transparent bg-clip-text bg-linear-to-r from-[#800020] to-[#b76e79] drop-shadow-lg' 
                        : 'text-gray-200'
                    }`}>
                      ★
                    </div>
                    {star <= (hoverRating || rating) && (
                      <div className="absolute inset-0 bg-linear-to-r from-[#800020] to-[#b76e79] blur-lg opacity-30 -z-10 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="sm:ml-6">
                <div className="px-4 py-2.5 rounded-full bg-linear-to-r from-[#800020] to-[#b76e79] inline-block">
                  <span className="text-lg font-bold text-white">
                    {getRatingLabel(rating)} • {rating}/5
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 && 'You absolutely loved it!'}
                  {rating === 4 && 'You really liked it'}
                  {rating === 3 && 'It met your expectations'}
                  {rating === 2 && 'It could be better'}
                  {rating === 1 && 'It fell short of expectations'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#800020]" />
              <label className="font-semibold text-gray-900">
                Your Name <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative w-full px-5 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white/50 focus:border-[#b76e79] focus:ring-4 focus:ring-[#b76e79]/20 outline-none transition-all duration-300"
                placeholder="Enter your name"
                required
                disabled={!!session?.user}
              />
            </div>
            {session?.user && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#800020]"></span>
                Your name is taken from your account
              </p>
            )}
          </div>

          {/* Email Field (only for non-logged in users) */}
          {!session?.user && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#800020]" />
                <label className="font-semibold text-gray-900">
                  Email Address
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full px-5 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white/50 focus:border-[#b76e79] focus:ring-4 focus:ring-[#b76e79]/20 outline-none transition-all duration-300"
                  placeholder="your@email.com (optional)"
                />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#800020]"></span>
                Your email will not be published or shared
              </p>
            </div>
          )}
        </div>

        {/* Comment Field */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#800020]" />
            <label className="font-semibold text-gray-900">
              Your Review <span className="text-rose-500">*</span>
            </label>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-[#f5c8c8] to-[#f7e7ce] rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="relative w-full px-5 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white/50 focus:border-[#b76e79] focus:ring-4 focus:ring-[#b76e79]/20 outline-none resize-none transition-all duration-300"
              rows={6}
              placeholder="Share your detailed experience with this product... What did you like? What could be improved?"
              required
              minLength={10}
            />
          </div>
          
          {/* Character Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-full max-w-48 bg-linear-to-r from-white to-[#faf9f6] rounded-full overflow-hidden border border-white/50 shadow-inner">
                <div 
                  className="h-2 bg-linear-to-r from-[#800020] via-[#b76e79] to-[#f5c8c8] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((comment.length / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm font-medium">
                <span className={comment.length >= 10 ? 'text-emerald-600' : 'text-gray-600'}>
                  {comment.length}/10
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {comment.length > 1000 ? (
                <span className="text-amber-600 font-medium">{comment.length}/1000 characters</span>
              ) : (
                'Minimum 10 characters required'
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-[#f7e7ce]/50">
          <button
            type="submit"
            disabled={isSubmitting || comment.length < 10 || !name.trim()}
            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-4 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {/* Button Background */}
            <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
              isSubmitting || comment.length < 10 || !name.trim()
                ? 'bg-linear-to-r from-gray-300 to-gray-400'
                : 'bg-linear-to-r from-[#800020] via-[#b76e79] to-[#800020] group-hover:shadow-2xl group-hover:shadow-[#800020]/40'
            }`}></div>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Button Content */}
            {isSubmitting ? (
              <>
                <div className="relative w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="relative text-white font-bold">Submitting Your Review...</span>
              </>
            ) : (
              <>
                <Send className="relative w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                <span className="relative text-white font-bold">Submit Review</span>
              </>
            )}
            
            {/* Success Check (on hover when valid) */}
            {!isSubmitting && comment.length >= 10 && name.trim() && (
              <div className="relative ml-2 w-5 h-5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
          
          {/* Form Requirements */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              name.trim() 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${name.trim() ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              <span className={`text-sm font-medium ${name.trim() ? 'text-emerald-700' : 'text-amber-700'}`}>
                {name.trim() ? '✓ Name provided' : 'Name required'}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              comment.length >= 10 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${comment.length >= 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              <span className={`text-sm font-medium ${comment.length >= 10 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {comment.length >= 10 ? `✓ Review (${comment.length} chars)` : `Review (${comment.length}/10 chars)`}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
              rating > 0 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${rating > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              <span className={`text-sm font-medium ${rating > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {rating > 0 ? `✓ ${rating}/5 rating` : 'Rating required'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}