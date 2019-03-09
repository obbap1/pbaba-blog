<template>
	<div class="author">

		<g-image alt="Author image" class="author__image" src="~/assets/images/author.jpg" width="180" height="180" blur="5" />

		<h1 v-if="showTitle" class="author__site-title">
			{{ $static.metaData.siteName }}
		</h1>

		<p class="author__intro">
			Hello , i'm an Engineer, i write code and i'm all for Jesus 👑 and Manutd ⚽️⚽️. I'm passionate about Math, Javascript 🔥, Linux etc. and i put down my thoughts here.
		</p>

		<p class="author__links">
			<a href="//twitter.com/_obbap"><i class="fab fa-twitter fa-2x"></i></a>
			<a href="//github.com/obbap1"><i class="fab fa-github-alt fa-2x"></i></a>
			<a href="//dev.to/obbap"><i class="fab fa-dev fa-2x"></i></a>
			<a href="//medium.com/@_Obbap"><i class="fab fa-medium-m fa-2x"></i></a>
			<a href="//linkedin.com/in/paschal-obba-a7222aa2/"><i class="fab fa-linkedin-in fa-2x"></i></a>
			<a href="//quora.com/profile/Obba-Paschal"><i class="fab fa-quora fa-2x"></i></a>
		</p>

	</div>
</template>

<static-query>
query {
  metaData {
    siteName
  }
}
</static-query>

<script>
export default {
  props: ['showTitle'],
};
</script>

<style lang="scss">
.author {
	margin: 0 auto;
	max-width: 500px;
	text-align: center;
	padding: calc(var(--space) / 2) 0;

	&__image {
		border-radius: 100%;
		width: 90px;
		height: 90px;
		margin-bottom: 1em;
	}

	&__intro {
		opacity: .8;
	}

	&__site-title {
		font-size: 1.5em;
	}

	&__links {
		margin-top: -.5em;
		a {
			margin: 0 .5em;
		}
	}
}
</style>