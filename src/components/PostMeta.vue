<template>
   <div class="post-meta">
      Posted {{ post.date }}.
      <template v-if="post.timeToRead">
        <strong>{{ post.timeToRead }} min read 🍵.</strong>
      </template>
    </div>
</template>

<script>
export default {
  props: ['post'],
  metaInfo: {
   title: post.title,
   meta: [
     {name: "twitter:card", content:"summary_large_image"},
     {name: "twitter:site", content:"@_obbap"},
     {name: "twitter:creator", content:"@_obbap"},
     {name: "twitter:title", content: post.tags.title},
     {name: "twitter:image", content: post.coverImage},
     {name: "twitter:description", content: post.description},
     {name: 'twitter:image:alt', content: '📖'}
   ]
  }
};
</script>

<style lang="scss">
.post-meta {
  font-size: .8em;
  opacity: .8;
}
</style>