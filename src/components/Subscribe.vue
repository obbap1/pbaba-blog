<template>
  <div class="subscribe">
    <h3>Subscribe</h3>
    <p v-if="submitted" class="subscribe-success">Thanks! Check your inbox to confirm your subscription.</p>
    <template v-else>
      <p>Get new posts fresh off the press delivered to your inbox!</p>
      <form
        action="https://buttondown.com/api/emails/embed-subscribe/obba"
        method="post"
        target="buttondown-frame"
        class="embeddable-buttondown-form"
        @submit="onSubmit"
      >
        <label for="bd-email" class="sr-only">Enter your email</label>
        <div class="subscribe-row">
          <input
            id="bd-email"
            v-model="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            :disabled="!isProduction"
            required
          />
          <input type="hidden" name="embed" value="1" />
          <input type="submit" value="Subscribe" :disabled="!isProduction" />
        </div>
        <p v-if="error" class="subscribe-error">{{ error }}</p>
        <p v-if="!isProduction" class="subscribe-error">
          Subscriptions are disabled outside the live site.
        </p>
        <p class="subscribe-footer">
          <a href="https://buttondown.com/refer/obba" target="_blank">Powered by Buttondown.</a>
        </p>
      </form>
    </template>
    <iframe name="buttondown-frame" class="sr-only" title="Subscribe" @load="onFrameLoad" />
  </div>
</template>

<script>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCTION_HOSTNAME = "paschal.dev";

export default {
  name: "Subscribe",
  data() {
    return {
      email: "",
      error: "",
      submitted: false,
      awaitingResponse: false,
      isProduction: false,
    };
  },
  mounted() {
    this.isProduction = typeof window !== "undefined" && window.location.hostname === PRODUCTION_HOSTNAME;
  },
  methods: {
    onSubmit(event) {
      if (!this.isProduction) {
        event.preventDefault();
        return;
      }
      const value = this.email.trim();
      if (!EMAIL_PATTERN.test(value) || value.length > 254) {
        event.preventDefault();
        this.error = "Please enter a valid email address.";
        return;
      }
      this.error = "";
      this.awaitingResponse = true;
    },
    onFrameLoad() {
      if (this.awaitingResponse) {
        this.awaitingResponse = false;
        this.submitted = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.subscribe {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid var(--footer-link-color);

  h3 {
    margin-bottom: 4px;
  }

  p {
    margin-top: 0;
  }
}

.subscribe-row {
  display: flex;
  gap: 8px;

  input[type="email"] {
    flex: 1;
    padding: 8px 10px;
    font-size: 1em;
    border: 1px solid var(--footer-link-color);
    border-radius: 4px;
    background-color: var(--app-background-color);
    color: var(--app-font-color);
  }

  input[type="submit"] {
    padding: 8px 16px;
    font-size: 1em;
    border: 1px solid var(--link-color);
    border-radius: 4px;
    background-color: var(--link-color);
    color: var(--app-background-color);
    cursor: pointer;

    &:hover {
      opacity: 0.85;
    }
  }
}

.subscribe-error {
  color: #d64545;
  font-size: 0.85em;
}

.subscribe-footer {
  font-size: 0.75em;

  a {
    color: var(--footer-link-color);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media only screen and (max-width: 500px) {
  .subscribe-row {
    flex-direction: column;
  }
}
</style>
