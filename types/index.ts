export type Provider = 'instagram' | 'twitter' | 'youtube'

export type PostStatus =
  | 'draft'
  | 'generating_content'
  | 'content_generated'
  | 'ready_to_publish'
  | 'published'
  | 'failed'

export interface SocialAccount {
  id: string
  user_id: string
  provider: Provider
  provider_account_id: string | null
  provider_username: string | null
  provider_avatar_url: string | null
  access_token: string | null
  is_active: boolean
  connected_at: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  social_account_id: string | null
  platform: Provider
  content: string
  visual_idea: string | null
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  post_id: string
  content_type: string
  generated_text: string
  suggested_hashtags: string | null
  suggested_publish_time: string | null
  seo_title: string | null
  seo_description: string | null
  seo_tags: string | null
  thread_tweets: string[] | null
  generated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration_days: number
  max_platforms: number
  max_posts: number
  features: string[]
}

export interface PostWithGenerated extends Post {
  generated_content?: GeneratedContent | null
  social_account?: SocialAccount | null
}
