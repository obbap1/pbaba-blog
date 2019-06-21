<template>
	<div class="author">

		<h1 v-if="showTitle" class="author__site-title">
			Projects
		</h1>

		<p class="author__intro">
			These are a few projects i'm allowed to talk about without ending up in jail 😁
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