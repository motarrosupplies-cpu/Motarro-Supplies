// Test script for blog API endpoints
// Run this with: node test-blog-api.js

const API_BASE = 'http://localhost:3000/api/blog';

async function testBlogAPI() {
  console.log('Testing Blog API endpoints...\n');

  try {
    // Test 1: GET all blog posts
    console.log('1. Testing GET /api/blog');
    const getResponse = await fetch(API_BASE);
    console.log('Status:', getResponse.status);
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('Error:', errorText);
    } else {
      const posts = await getResponse.json();
      console.log('Success: Found', posts.length, 'blog posts');
    }

    // Test 2: Create a new blog post
    console.log('\n2. Testing POST /api/blog');
    const newPost = {
      title: 'Test Blog Post',
      excerpt: 'This is a test blog post',
      content: '<h1>Test Content</h1><p>This is test content for the blog post.</p>',
      slug: 'test-blog-post-' + Date.now(),
      category: 'Testing',
      author: 'Test Author',
      publishDate: new Date().toISOString().split('T')[0],
      readTime: '2 min read',
      tags: ['test', 'api'],
      status: 'draft',
      featured: false,
      metaTitle: 'Test Blog Post Meta Title',
      metaDescription: 'Test blog post meta description',
      seoKeywords: ['test', 'blog', 'api']
    };

    const postResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });

    console.log('Status:', postResponse.status);
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.log('Error:', errorText);
    } else {
      const createdPost = await postResponse.json();
      console.log('Success: Created post with ID:', createdPost.id);
      
      // Test 3: Update the blog post
      console.log('\n3. Testing PUT /api/blog/' + createdPost.id);
      const updatedPost = {
        ...newPost,
        title: 'Updated Test Blog Post',
        status: 'published'
      };

      const putResponse = await fetch(`${API_BASE}/${createdPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });

      console.log('Status:', putResponse.status);
      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        console.log('Error:', errorText);
      } else {
        const updatedData = await putResponse.json();
        console.log('Success: Updated post title to:', updatedData.title);
      }

      // Test 4: Delete the blog post
      console.log('\n4. Testing DELETE /api/blog/' + createdPost.id);
      const deleteResponse = await fetch(`${API_BASE}/${createdPost.id}`, {
        method: 'DELETE',
      });

      console.log('Status:', deleteResponse.status);
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.log('Error:', errorText);
      } else {
        console.log('Success: Deleted test post');
      }
    }

  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

// Run the test
testBlogAPI();
