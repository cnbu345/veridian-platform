// src/app/dashboar/feedback/new/ProvideFeedbackModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Send,
  Star,
  ThumbsUp,
  MessageSquare,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Briefcase,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

interface FeedbackType {
  id: string
  name: string
  description: string
  category: 'nps' | 'csat' | 'feature_request' | 'support' | 'general' | 'account_review'
  icon?: string
  color?: string
}

interface ProvideFeedbackModalProps {
  user: any
  feedbackTypes: FeedbackType[]
}

export default function ProvideFeedbackModal({ user, feedbackTypes }: ProvideFeedbackModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'form' | 'review'>('type')
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null)
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [csatScore, setCsatScore] = useState<number | null>(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [featureRequest, setFeatureRequest] = useState({
    title: '',
    category: 'feature',
    impact: '',
    priority: 'medium'
  })
  const [generalCategory, setGeneralCategory] = useState('')

  // Filter out support and account_review since they have their own dedicated flows
  const activeFeedbackTypes = feedbackTypes.filter(type => 
    !['support', 'account_review'].includes(type.category)
  )

  const getTypeIcon = (category: string) => {
    switch(category) {
      case 'nps': return <Star className="w-6 h-6" />
      case 'csat': return <ThumbsUp className="w-6 h-6" />
      case 'feature_request': return <Lightbulb className="w-6 h-6" />
      case 'support': return <MessageSquare className="w-6 h-6" />
      case 'account_review': return <Briefcase className="w-6 h-6" />
      default: return <FileText className="w-6 h-6" />
    }
  }

  const getTypeColor = (category: string) => {
    switch(category) {
      case 'nps': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'csat': return 'bg-green-100 text-green-700 border-green-200'
      case 'feature_request': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'support': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'account_review': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const handleSubmit = async () => {
    if (!selectedType) return

    setSubmitting(true)
    try {
      const payload: any = {
        feedback_type_id: selectedType.id,
        comments: comments.trim() || null
      }

      // Add type-specific data
      if (selectedType.category === 'nps' && npsScore !== null) {
        payload.nps_score = npsScore
      } else if (selectedType.category === 'csat' && csatScore !== null) {
        payload.csat_score = csatScore
      } else if (selectedType.category === 'feature_request') {
        if (!featureRequest.title.trim()) {
          toast.error('Please provide a feature title')
          setSubmitting(false)
          return
        }
        payload.metadata = {
          feature_title: featureRequest.title,
          feature_category: featureRequest.category,
          impact: featureRequest.impact,
          priority: featureRequest.priority
        }
      } else if (selectedType.category === 'general') {
        payload.metadata = {
          category: generalCategory || 'uncategorized'
        }
      }

      const response = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit feedback')
      }

      toast.success('Thank you for your feedback!')
      router.push('/dashboard/feedback')
      router.refresh()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    router.push('/dashboard/feedback')
  }

  const canContinue = () => {
    if (!selectedType) return false
    
    switch(selectedType.category) {
      case 'nps':
        return npsScore !== null
      case 'csat':
        return csatScore !== null
      case 'feature_request':
        return featureRequest.title.trim() !== ''
      case 'general':
        return comments.trim() !== ''
      default:
        return false
    }
  }

  const getReviewContent = () => {
    if (!selectedType) return null

    switch(selectedType.category) {
      case 'nps':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-navy-500 mb-1">Your Score</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-2xl font-bold",
                  npsScore && npsScore >= 9 ? 'text-green-600' :
                  npsScore && npsScore >= 7 ? 'text-amber-600' :
                  'text-red-600'
                )}>
                  {npsScore}/10
                </span>
                <span className="text-sm text-navy-500">
                  ({npsScore && npsScore >= 9 ? 'Promoter' : npsScore && npsScore >= 7 ? 'Passive' : 'Detractor'})
                </span>
              </div>
            </div>
            {comments && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Comments</p>
                <p className="text-navy-700 bg-white p-3 rounded-lg border border-slate-200">
                  {comments}
                </p>
              </div>
            )}
          </div>
        )

      case 'csat':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-navy-500 mb-1">Your Rating</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-6 h-6",
                      csatScore && star <= csatScore ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
            </div>
            {comments && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Comments</p>
                <p className="text-navy-700 bg-white p-3 rounded-lg border border-slate-200">
                  {comments}
                </p>
              </div>
            )}
          </div>
        )

      case 'feature_request':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-navy-500 mb-1">Feature Title</p>
              <p className="text-navy-700 font-medium">{featureRequest.title}</p>
            </div>
            <div>
              <p className="text-sm text-navy-500 mb-1">Category</p>
              <p className="text-navy-700 capitalize">{featureRequest.category}</p>
            </div>
            {featureRequest.impact && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Business Impact</p>
                <p className="text-navy-700">{featureRequest.impact}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-navy-500 mb-1">Priority</p>
              <p className="text-navy-700 capitalize">{featureRequest.priority}</p>
            </div>
          </div>
        )

      case 'general':
        return (
          <div className="space-y-3">
            {comments && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Your Feedback</p>
                <p className="text-navy-700 bg-white p-3 rounded-lg border border-slate-200">
                  {comments}
                </p>
              </div>
            )}
            {generalCategory && (
              <div>
                <p className="text-sm text-navy-500 mb-1">Category</p>
                <p className="text-navy-700 capitalize">{generalCategory}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-start justify-center py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-navy-900 to-navy-800 border-b border-navy-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gold-500">Share Your Feedback</h2>
              <p className="text-navy-300 mt-1">Help us improve your Veridian experience</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-navy-300 hover:text-gold-500" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2",
              step === 'type' ? 'text-gold-600' : 'text-navy-400'
            )}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'type' ? 'bg-gold-600 text-white' : 'bg-slate-200 text-navy-500'
              )}>1</div>
              <span className="text-sm font-medium">Select Type</span>
            </div>
            <div className="w-8 h-px bg-slate-300" />
            <div className={cn(
              "flex items-center gap-2",
              step === 'form' ? 'text-gold-600' : 'text-navy-400'
            )}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'form' ? 'bg-gold-600 text-white' : 'bg-slate-200 text-navy-500'
              )}>2</div>
              <span className="text-sm font-medium">Your Feedback</span>
            </div>
            <div className="w-8 h-px bg-slate-300" />
            <div className={cn(
              "flex items-center gap-2",
              step === 'review' ? 'text-gold-600' : 'text-navy-400'
            )}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'review' ? 'bg-gold-600 text-white' : 'bg-slate-200 text-navy-500'
              )}>3</div>
              <span className="text-sm font-medium">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'type' && (
            <div className="space-y-6">
              <p className="text-navy-600">What type of feedback would you like to share?</p>
              
              <div className="grid gap-4">
                {activeFeedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type)
                      // Reset form fields when changing type
                      setNpsScore(null)
                      setCsatScore(null)
                      setComments('')
                      setFeatureRequest({
                        title: '',
                        category: 'feature',
                        impact: '',
                        priority: 'medium'
                      })
                      setGeneralCategory('')
                      setStep('form')
                    }}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                      "hover:border-gold-400 hover:shadow-md",
                      selectedType?.id === type.id ? 'border-gold-600 bg-gold-50' : 'border-slate-200'
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      getTypeColor(type.category)
                    )}>
                      {getTypeIcon(type.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy-900 mb-1">{type.name}</h3>
                      <p className="text-sm text-navy-600">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'form' && selectedType && (
            <div className="space-y-6">
              {/* NPS Survey */}
              {selectedType.category === 'nps' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-medium text-navy-900 mb-4">
                      How likely are you to recommend Veridian Group to other enterprise leaders?
                    </p>
                    
                    <div className="grid grid-cols-11 gap-1 mb-4">
                      {[0,1,2,3,4,5,6,7,8,9,10].map((score) => (
                        <button
                          key={score}
                          onClick={() => setNpsScore(score)}
                          className={cn(
                            "aspect-square rounded-lg text-sm font-medium transition-all",
                            npsScore === score
                              ? score >= 9 
                                ? 'bg-green-600 text-white'
                                : score >= 7
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-red-600 text-white'
                              : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
                          )}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs text-navy-500">
                      <span>Not likely</span>
                      <span>Extremely likely</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      What's the primary reason for your score? (Optional)
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                      placeholder="Your feedback helps us understand what we're doing well and where we can improve..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* CSAT Survey */}
              {selectedType.category === 'csat' && (
                <div className="space-y-6">
                  <p className="text-lg font-medium text-navy-900 mb-4">
                    How would you rate your recent experience?
                  </p>
                  
                  <div className="flex justify-center gap-3 mb-6">
                    {[1,2,3,4,5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setCsatScore(score)}
                        className={cn(
                          "w-16 h-16 rounded-xl text-xl font-bold transition-all",
                          csatScore === score
                            ? 'bg-gold-600 text-white'
                            : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-navy-500">
                    <span>Very dissatisfied</span>
                    <span>Very satisfied</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Tell us more about your experience (Optional)
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                      placeholder="What went well? What could be improved?"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Feature Request */}
              {selectedType.category === 'feature_request' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Feature Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={featureRequest.title}
                      onChange={(e) => setFeatureRequest({ ...featureRequest, title: e.target.value })}
                      placeholder="e.g., Batch report generation"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Category
                    </label>
                    <select
                      value={featureRequest.category}
                      onChange={(e) => setFeatureRequest({ ...featureRequest, category: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="feature">New Feature</option>
                      <option value="improvement">Improvement to Existing Feature</option>
                      <option value="integration">Integration</option>
                      <option value="report">New Report Type</option>
                      <option value="api">API Enhancement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Business Impact
                    </label>
                    <textarea
                      value={featureRequest.impact}
                      onChange={(e) => setFeatureRequest({ ...featureRequest, impact: e.target.value })}
                      rows={3}
                      placeholder="How would this feature benefit your compliance workflow?"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Priority for Your Organization
                    </label>
                    <select
                      value={featureRequest.priority}
                      onChange={(e) => setFeatureRequest({ ...featureRequest, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="low">Low - Nice to have</option>
                      <option value="medium">Medium - Would improve workflow</option>
                      <option value="high">High - Important for compliance</option>
                      <option value="critical">Critical - Regulatory requirement</option>
                    </select>
                  </div>
                </div>
              )}

              {/* General Feedback */}
              {selectedType.category === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={6}
                      placeholder="Please share your thoughts, suggestions, or concerns..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Category (Optional)
                    </label>
                    <select
                      value={generalCategory}
                      onChange={(e) => setGeneralCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    >
                      <option value="">Select a category...</option>
                      <option value="usability">Usability</option>
                      <option value="performance">Performance</option>
                      <option value="content">Content/Reports</option>
                      <option value="billing">Billing/Pricing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('type')}
                  className="px-6 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  disabled={!canContinue()}
                  className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'review' && selectedType && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    getTypeColor(selectedType.category)
                  )}>
                    {getTypeIcon(selectedType.category)}
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{selectedType.name}</p>
                    <p className="text-sm text-navy-500">Review your feedback before submitting</p>
                  </div>
                </div>

                {getReviewContent()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-lg hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trust Message */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-center text-navy-500">
            Your feedback is confidential and helps us improve your experience. 
            A member of our enterprise team may follow up if you've requested a response.
          </p>
        </div>
      </div>
    </div>
  )
}