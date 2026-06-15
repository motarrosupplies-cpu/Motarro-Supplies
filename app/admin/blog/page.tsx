"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { BlogContentEditor } from "@/components/admin/blog-content-editor"
import { toast } from "sonner"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  category: string
  author: string
  publish_date: string
  read_time: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  images?: string[]
  image_url?: string
  meta_title?: string
  meta_description?: string
  seo_keywords?: string[]
}

const categories = [
  "Printing Techniques",
  "Corporate Branding", 
  "Sustainability",
  "Event Marketing",
  "Fashion Tips",
  "Industry Insights",
  "How-to Guides"
]

const statusOptions = [
  { value: 'draft', label: 'Draft', icon: Clock, color: 'text-yellow-600' },
  { value: 'published', label: 'Published', icon: CheckCircle, color: 'text-green-600' },
  { value: 'archived', label: 'Archived', icon: AlertCircle, color: 'text-gray-600' }
]

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editingPost, setEditingPost] = useState<Partial<BlogPost>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch blog posts from API on mount only; refresh when tab becomes visible ONLY if no modal is open
  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      if (isCreateDialogOpen || isEditDialogOpen) return
      fetchPosts()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (isCreateDialogOpen || isEditDialogOpen) return
      fetchPosts()
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isCreateDialogOpen, isEditDialogOpen])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      // Add cache-busting to ensure fresh data
      const response = await fetch(`/api/blog?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      const data = await response.json()
      console.log('Admin fetched blog posts:', data.length, 'posts')
      setPosts(data)
      setFilteredPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter posts based on search and filters
  useEffect(() => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(post => post.status === selectedStatus)
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery, selectedCategory, selectedStatus])

  const handleCreatePost = async () => {
    try {
      const imagesToSave = editingPost.images || []
      console.log('[Blog Admin] Creating post with images:', {
        imagesCount: imagesToSave.length,
        images: imagesToSave,
        editingPostImages: editingPost.images
      })

      const newPost = {
        title: editingPost.title || "",
        excerpt: editingPost.excerpt || "",
        content: editingPost.content || "",
        slug: editingPost.slug || "",
        category: editingPost.category || "Printing Techniques",
        author: editingPost.author || "MOTARRO Supplies Team",
        publishDate: editingPost.publish_date || new Date().toISOString().split('T')[0],
        readTime: editingPost.read_time || "5 min read",
        tags: editingPost.tags || [],
        status: editingPost.status || "draft",
        featured: editingPost.featured || false,
        images: imagesToSave,
        metaTitle: editingPost.meta_title || "",
        metaDescription: editingPost.meta_description || "",
        seoKeywords: editingPost.seo_keywords || []
      }

      console.log('[Blog Admin] Submitting post data:', {
        title: newPost.title,
        imagesCount: newPost.images.length,
        images: newPost.images
      })

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create blog post')
      }

      const createdPost = await response.json()
      toast.success("Blog post created successfully!")
      
      // Reset form state
      setEditingPost({})
      setIsCreateDialogOpen(false)
      
      // Refresh the list to ensure sync
      setTimeout(() => {
        fetchPosts()
      }, 500)
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create blog post')
    }
  }

  const handleUpdatePost = async () => {
    if (!selectedPost) return

    try {
      // Use editingPost.images if it exists, otherwise keep existing images
      const imagesToSave = editingPost.images !== undefined 
        ? editingPost.images 
        : (selectedPost.images || [])
      
      console.log('[Blog Admin] Updating post with images:', {
        postId: selectedPost.id,
        existingImagesCount: selectedPost.images?.length || 0,
        newImagesCount: imagesToSave.length,
        images: imagesToSave,
        editingPostImages: editingPost.images
      })

      const updatedPost = {
        title: editingPost.title || selectedPost.title,
        excerpt: editingPost.excerpt || selectedPost.excerpt,
        content: editingPost.content || selectedPost.content,
        slug: editingPost.slug || selectedPost.slug,
        category: editingPost.category || selectedPost.category,
        author: editingPost.author || selectedPost.author,
        publishDate: editingPost.publish_date || selectedPost.publish_date || new Date().toISOString().split('T')[0],
        readTime: editingPost.read_time || selectedPost.read_time,
        tags: editingPost.tags || selectedPost.tags,
        status: editingPost.status || selectedPost.status,
        featured: editingPost.featured !== undefined ? editingPost.featured : selectedPost.featured,
        images: imagesToSave,
        metaTitle: editingPost.meta_title || selectedPost.meta_title,
        metaDescription: editingPost.meta_description || selectedPost.meta_description,
        seoKeywords: editingPost.seo_keywords || selectedPost.seo_keywords
      }
      
      console.log('[Blog Admin] Submitting update with data:', {
        postId: selectedPost.id,
        title: updatedPost.title,
        imagesCount: updatedPost.images.length,
        images: updatedPost.images,
        publishDate: updatedPost.publishDate
      })

      const response = await fetch(`/api/blog/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog post')
      }

      const updatedData = await response.json()
      toast.success("Blog post updated successfully!")
      
      // Reset form state
      setEditingPost({})
      setSelectedPost(null)
      setIsEditDialogOpen(false)
      
      // Refresh the list to ensure sync
      setTimeout(() => {
        fetchPosts()
      }, 500)
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update blog post')
    }
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return

    try {
      const response = await fetch(`/api/blog/${selectedPost.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog post')
      }

      toast.success("Blog post deleted successfully!")
      
      // Refresh the list to ensure sync
      setTimeout(() => {
        fetchPosts()
      }, 500)
      
      setSelectedPost(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog post')
    }
  }

  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setEditingPost(post)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setIsDeleteDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    if (!statusOption) return null
    
    const Icon = statusOption.icon
    return <Icon className={`h-4 w-4 ${statusOption.color}`} />
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status)
    if (!statusOption) return null

    return (
      <Badge variant={status === 'published' ? 'default' : 'secondary'}>
        {statusOption.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts, content, and SEO optimization</p>
        </div>
        <Dialog 
          open={isCreateDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setTimeout(() => {
                setEditingPost({})
                setIsCreateDialogOpen(false)
              }, 100)
            } else {
              setEditingPost({})
              setIsCreateDialogOpen(true)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            onInteractOutside={(e) => {
              if (!document.hasFocus()) e.preventDefault()
            }}
            onFocusOutside={(e) => {
              if (!document.hasFocus()) e.preventDefault()
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            {isCreateDialogOpen && (
              <BlogPostForm
                post={editingPost}
                setPost={setEditingPost}
                onSubmit={handleCreatePost}
                categories={categories}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center justify-center">
              {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    {post.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.publish_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {post.category}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(post)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          // Only reset state when actually closing (not just re-rendering)
          if (!open) {
            // Small delay to allow form submission to complete
            setTimeout(() => {
              setEditingPost({})
              setSelectedPost(null)
              setIsEditDialogOpen(false)
            }, 100)
          } else {
            setIsEditDialogOpen(true)
          }
        }}
      >
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (!document.hasFocus()) e.preventDefault()
          }}
          onFocusOutside={(e) => {
            if (!document.hasFocus()) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          {isEditDialogOpen && (
            <BlogPostForm
              post={editingPost}
              setPost={setEditingPost}
              onSubmit={handleUpdatePost}
              categories={categories}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePost}>
                Delete Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Blog Post Form Component
interface BlogPostFormProps {
  post: Partial<BlogPost>
  setPost: (post: Partial<BlogPost>) => void
  onSubmit: () => void
  categories: string[]
  isEdit?: boolean
}

function BlogPostForm({ post, setPost, onSubmit, categories, isEdit = false }: BlogPostFormProps) {
  // Initialize tags and keywords from post data, but preserve user input
  const [tagsInput, setTagsInput] = useState(() => {
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
      return post.tags.join(', ')
    }
    return ""
  })
  const [seoKeywordsInput, setSeoKeywordsInput] = useState(() => {
    if (post.seo_keywords && Array.isArray(post.seo_keywords) && post.seo_keywords.length > 0) {
      return post.seo_keywords.join(', ')
    }
    return ""
  })

  // Sync tags/keywords when post changes (but only if we don't have user input)
  useEffect(() => {
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0 && !tagsInput) {
      setTagsInput(post.tags.join(', '))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.tags])

  useEffect(() => {
    if (post.seo_keywords && Array.isArray(post.seo_keywords) && post.seo_keywords.length > 0 && !seoKeywordsInput) {
      setSeoKeywordsInput(post.seo_keywords.join(', '))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.seo_keywords])

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setPost({ ...post, tags })
  }

  const handleSeoKeywordsChange = (value: string) => {
    setSeoKeywordsInput(value)
    const keywords = value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
    setPost({ ...post, seo_keywords: keywords })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full" key={isEdit && post.id ? `tabs-${post.id}` : 'tabs-new'}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4" forceMount>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={post.title || ""}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                placeholder="Enter post title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={post.slug || ""}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                placeholder="post-url-slug"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Excerpt *</label>
            <Textarea
              value={post.excerpt || ""}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              placeholder="Brief description of the post..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content *</label>
            <BlogContentEditor
              value={post.content || ""}
              onChange={(html) => setPost({ ...post, content: html })}
              placeholder="Write your blog post content here. Use Insert image for inline images."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Images</label>
            <ImageUpload
              key={isEdit && post.id ? `edit-${post.id}` : 'create'}
              onImagesChange={(images) => {
                console.log('[BlogPostForm] Images changed:', {
                  imagesCount: images.length,
                  images: images,
                  postId: post.id,
                  isEdit
                });
                setPost({ ...post, images });
              }}
              maxFiles={10}
              initialImages={post.images || []}
              folder="blog"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Upload images for your blog post. Drag and drop to reorder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={post.category || ""} onValueChange={(value) => setPost({ ...post, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={post.author || ""}
                onChange={(e) => setPost({ ...post, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Enter tags separated by commas..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas
            </p>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4" forceMount>
          <div>
            <label className="text-sm font-medium">Meta Title</label>
            <Input
              value={post.meta_title || ""}
              onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
              placeholder="SEO title for search engines..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Meta Description</label>
            <Textarea
              value={post.meta_description || ""}
              onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
              placeholder="SEO description for search engines..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">SEO Keywords</label>
            <Input
              value={seoKeywordsInput}
              onChange={(e) => handleSeoKeywordsChange(e.target.value)}
              placeholder="Enter keywords separated by commas..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple keywords with commas
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4" forceMount>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Publish Date</label>
              <Input
                type="date"
                value={post.publish_date || ""}
                onChange={(e) => setPost({ ...post, publish_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Read Time</label>
              <Input
                value={post.read_time || ""}
                onChange={(e) => setPost({ ...post, read_time: e.target.value })}
                placeholder="5 min read"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={post.status || "draft"} onValueChange={(value) => setPost({ ...post, status: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={post.featured || false}
                onChange={(e) => setPost({ ...post, featured: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Post
              </label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4" forceMount>
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="text-lg font-semibold mb-2">Post Preview</h3>
            <div className="space-y-2">
              <p><strong>Title:</strong> {post.title || "No title"}</p>
              <p><strong>Excerpt:</strong> {post.excerpt || "No excerpt"}</p>
              <p><strong>Category:</strong> {post.category || "No category"}</p>
              <p><strong>Author:</strong> {post.author || "No author"}</p>
              <p><strong>Status:</strong> {post.status || "No status"}</p>
              <p><strong>Featured:</strong> {post.featured ? "Yes" : "No"}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => onSubmit()}>
          {isEdit ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </div>
  )
}
