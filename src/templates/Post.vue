<template>
  <Layout>
    <div class="post-title">
      <h1 class="post-title__text">
        {{ $page.post.title }}
      </h1>
      
      <PostMeta :post="$page.post" />

    </div>
    
    <div class="post content-box">
      <div class="post__header">
        <g-image alt="Cover image" v-if="$page.post.coverImage" :src="$page.post.coverImage" />
      </div>

      <div class="post__content" v-html="$page.post.content" />

      <div class="post__footer">
        <PostTags :post="$page.post" />
      </div>
    </div>

    <div class="post-comments">
      <!-- Add comment widgets here -->
      <div id="disqus_thread"></div>  
      <h3 id="newsletter"><strong>Subscribe to my Newsletter.</strong></h3>  
       
      <form action="https://usebasin.com/f/a04accbf7cb5" method="POST">
        <p>
          <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="Email" 
          />
        </p>
        <div class="g-recaptcha" data-sitekey="6Lew3SMUAAAAAJ82QoS7gqOTkRI_dhYrFy1f7Sqy"></div>
        <p>

          <button type="submit">Subscribe</button>
        </p>
        <h6>Subscribe to get my latest content by email, i wont send you spam.</h6>
    </form>
  </div>

    <Author class="post-author" />
  </Layout>
</template>

<script>
import PostMeta from '~/components/PostMeta';
import PostTags from '~/components/PostTags';
import Author from '~/components/Author.vue';

export default {
  components: {
    Author,
    PostMeta,
    PostTags,
  },
  metaInfo() {
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: 'description',
          content: this.$page.post.description,
        },
      ],
    };
  },
  mounted() {
    const d = window.document;
    const s = d.createElement('script');
    s.src = 'https://paschal-dev.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  },

};
</script>

<page-query>
query Post ($path: String!) {
  post: post (path: $path) {
    title
    path
    date (format: "D. MMMM YYYY")
    timeToRead
    tags {
      id
      title
      path
    }
    description
    content
  }
}
</page-query>

<style lang="scss">
.post-title {
  padding: calc(var(--space) / 2) 0 calc(var(--space) / 2);
  text-align: center;
}

.post {

  &__header {
    width: calc(100% + var(--space) * 2);
    margin-left: calc(var(--space) * -1);
    margin-top: calc(var(--space) * -1);
    margin-bottom: calc(var(--space) / 2);
    overflow: hidden;
    border-radius: var(--radius) var(--radius) 0 0;
    
    img {
      width: 100%;
    }

    &:empty {
      display: none;
    }
  }

  &__content {
    h2:first-child {
      margin-top: 0;
    }

    p {
      font-size: 1.2em;
      color: var(--title-color);
    }

    img {
      width: calc(100% + var(--space) * 2);
      margin-left: calc(var(--space) * -1);
      display: block;
      max-width: none;
    }
  }
}

form{
  margin-top: 60px;
  text-align: center;
}
form p input{
  width: calc(var(--space) * +8);
  height: 50px;
}
form p button{
  padding: 10px;
}
h6 {
  font-size: 13px;
  font-style: italic;
}
#newsletter{
  text-align: center;
}

.post-comments {
  padding: calc(var(--space) / 2);
  margin-left: calc(var(--space) * +1);
  margin-top: calc(var(--space) * +1);
  margin-bottom: calc(var(--space) * +1);
  margin-right: calc(var(--space) * +1);
  &:empty {
    display: none;
  }
}

.post-author {
  margin-top: calc(var(--space) / 2);
}
</style>