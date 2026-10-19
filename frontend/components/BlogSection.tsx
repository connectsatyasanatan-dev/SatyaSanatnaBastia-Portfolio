'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Clock, Tag, ArrowRight, TrendingUp } from 'lucide-react'
import portfolioAPI, { BlogPost } from '@/lib/api'
import { FALLBACK_BLOG_POSTS } from '@/lib/fallbackData'
import { BlogSectionSkeleton } from './AppSkeletons'

const BlogSection = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        setHasError(false)
        try {
            const data = await portfolioAPI.getBlogPosts()
            if (data && data.length > 0) {
                setBlogPosts(data)
            } else {
                setBlogPosts(FALLBACK_BLOG_POSTS)
            }
        } catch (error) {
            console.error('Failed to fetch blog posts:', error)
            setBlogPosts(FALLBACK_BLOG_POSTS)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton-blog"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <BlogSectionSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="blog-content"
                    id="blog-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="ide-section-header">
                        <div className="ide-section-header-left">
                            <div className="ide-section-icon-badge emerald">
                                <BookOpen size={20} />
                            </div>
                            <div className="ide-section-titles">
                                <h2 className="ide-section-title">Latest Articles &amp; Insights</h2>
                                <span className="ide-section-tag">// technical_insights.md</span>
                            </div>
                        </div>
                    </div>

                    <div className="articles-grid">
                        {blogPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`article-card ${post.featured ? 'featured' : ''}`}
                            >
                                {/* Featured Badge */}
                                {post.featured && (
                                    <div className="featured-badge">
                                        <div className="badge-content">
                                            <TrendingUp className="w-3 h-3" />
                                            FEATURED
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="article-content">
                                    {/* Date and Read Time */}
                                    <div className="article-meta">
                                        <time dateTime={post.date}>
                                            {new Date(post.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </time>
                                        <div className="read-time">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="article-title">
                                        {post.title}
                                    </h4>

                                    {/* Excerpt */}
                                    <p className="article-excerpt">
                                        {post.excerpt}
                                    </p>

                                    {/* Tags */}
                                    <div className="article-tags">
                                        {post.tags.map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className="article-tag"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Read More */}
                                    <div className="article-footer">
                                        <button className="read-more-btn">
                                            Read Article
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <div className="article-number">
                                            #{post.id.toString().padStart(2, '0')}
                                        </div>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="article-hover-effect"></div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Blog Stats & CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="blog-footer-grid"
                    >
                        {/* Stats */}
                        <div className="blog-stats-card">
                            <h5 className="stats-title">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Writing Stats
                            </h5>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-value">25+</div>
                                    <div className="stat-label">Articles Published</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value primary">50K+</div>
                                    <div className="stat-label">Total Reads</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value secondary">15+</div>
                                    <div className="stat-label">Topics Covered</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value accent">4.8</div>
                                    <div className="stat-label">Avg Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="newsletter-card">
                            <h5 className="newsletter-title">Stay Updated</h5>
                            <p className="newsletter-description">
                                Get the latest articles on web development, best practices, and industry insights delivered to your inbox.
                            </p>
                            <div className="newsletter-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="newsletter-input"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="newsletter-btn"
                                >
                                    Subscribe
                                </motion.button>
                            </div>
                            <p className="newsletter-disclaimer">
                                No spam, unsubscribe anytime. Join 500+ developers.
                            </p>
                        </div>
                    </motion.div>
                </motion.section>
            )}
        </AnimatePresence>
    )
}

export default BlogSection