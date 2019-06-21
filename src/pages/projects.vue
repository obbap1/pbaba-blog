<template>
  <Layout :show-logo="true">
    <!-- Author intro -->
    <ProjectIntro :show-title="true" />
    
    <!-- List posts -->
    <div class="posts">
      <ProjectCard v-for="(project,index) in Projects" :key="index" :post="project"/>
    </div>

  </Layout>
</template>

<page-query>
{
  posts: allPost {
    edges {
      node {
        id
        title
        path
        coverImage
        tags {
          id
          title
          path
        }
        date (format: "D. MMMM YYYY")
        timeToRead
        description
        ...on Post {
            id
            title
            path
        }
      }
    }
  }
}
</page-query>

<script>
import Author from '~/components/Author.vue';
import ProjectCard from '~/components/ProjectCard.vue';
import ProjectIntro from '~/components/ProjectIntro.vue';
import Projects from '../projects';

export default {
  components: {
    Author,
    ProjectCard,
    ProjectIntro
  },
  metaInfo: {
    title: 'Daily Chronicles',
    link: [
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.7.2/css/all.css', integrity: 'sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr', crossorigin: 'anonymous' },
    ],
  },
  data(){
      return {
          Projects
      }
  }
};
</script>
