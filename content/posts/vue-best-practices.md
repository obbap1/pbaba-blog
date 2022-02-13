---
title: "Write better Vue JS code"
description: ""
date:  2019-09-27
---

# Introduction

Architecture might not matter at the start of a project, but the ease at which components can be added or removed without breaking stuff shows how well the codebase was structured. Let's look at ways to make our Vue JS code better.

## Use State, Map Getters and Actions.

Using state and the maps (i.e mapGetters, mapActions, mapState, etc) provided by Vuex makes code very reusable. Hard coding state to the data() object in your SFC because its "faster" will raise difficulties if some of those values are needed in the future.

```html
<!-- first.vue -->
<template>
  <h3>{{firstname}}{{lastname}}</h3>
</template>

<script>
  export default {
    data() {
      return {
        firstname: "",
        lastname: ""
      };
    },
    methods: {
      async getFullName() {
        const { firstname, lastname } = await fetchNameFromApi();
        this.firstname = firstname;
        this.lastname = lastname;
      }
    },
    created() {
      this.getFullName();
    }
  };
</script>
```

**_Project Manager_**: We need the firstname and lastname to show up on two more pages.

With that request, you'll keep copying, pasting, importing and exporting from different files.

Better Still,

```js
const state = {
  firstname: "",
  lastname: ""
};

const actions = {
  async getFullName({ commit, dispatch }, data) {
    getFullNameFromApi().then(res => {
      commit(mutate.FULL_NAME, res.body);
    });
  }
};

const mutations = {
  //Set default mutation types in another file
  [mutate.UPDATE_FULL_NAME](state, data) {
    state.firstname = data.firstName;
    state.lastname = data.lastName;
  }
};

const getters = {
  firstName: state => state.firstname,
  lastName: state => state.lastname
};

const FullName = {
  state,
  actions,
  mutations,
  getters
};

export default FullName;
```

Then on our **_first.vue_** component,

```html
<template>
  <h3>{{firstName}}{{lastName}}</h3>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
   methods:{
   ...mapActions(['getFullName']);
   },
   created(){
   this.getFullName();
   },
   computed:{
   ...mapGetters(['firstName', 'lastName']);
   }
  }
</script>
```

Now, if we need to include a new component that needs the first and last names of our user, we can easily map the getters and the actions.

This also helps us avoid things like:

```js
const firstname = this.$store.state.fullName.firstName;
const lastname = this.$store.state.fullNme.lastName;
```

We can simply use getters

```js
computed:{
 ...mapGetters(['firstName','lastName'])
}
```

Finally, this helps us abstract business logic from the SFC and makes testing easier. Allow the Store to handle all the logic, and the SFC should just handle stuff tightly coupled to it, like the state of alert buttons/snack bars, etc.

## Filters over Mixins.

Mixins lead to implicit dependencies, namespace clashes, etc. You can find more about that [here](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html). Some Mixins can be converted to Filters.

```js
//dateMixin.js
export default {
  methods: {
    formatDate(date) {
      return date.split("T")[0];
    }
  }
};
```

In our SFC, we have:

```html
<template>
  <h3>{{formatDate(date)}}</h3>
</template>

<script>
  import dateMixin from "./dateMixin";

  export default {
    mixins: [dateMixin],
    data() {
      return {
        date: "2019-08-07T00:00:00"
      };
    }
  };
</script>
```

With filters,

```js
//main.js
import Vue from "vue";

Vue.filter("formatDate", value => value.split("T")[0]);
```

In our SFC,

```html
<template>
  <h3>{{date | formatDate}}</h3>
</template>

<script>
  export default {
    data() {
      return {
        date: "2019-08-07T00:00:00"
      };
    }
  };
</script>
```

## Use Modules to separate the different services on your application.

Instead of having everything needed by our state in one object, we can segregate them into modules.

Instead of

```js
const state = {
  token: "",
  amount: "",
  firstname: "",
  lastname: "",
  email: "",
  isLoggedIn: ""
};
```

We can divide our services into authentication, profile-management and wallet.

Our folder structure would look like

```
modules
 authentication
    index.js
 profile-management
    index.js
 wallet
    index.js
```

In the index.js file, we can have the state that matters to that service.

```js
//modules/authentication/index.js

const state = {
 token: '',
 isLoggedIn:''
}

...

```

Then when we initialize our store, we can add all the modules.

```js
export const store = new Vuex.store({
 state: {
    //something general
    isAppBusy: false
 },
 modules:{
    authentication,
    profile-management,
    wallet
 }
});
```

# Conclusion

These are my thoughts on how to make the structure of Vue code better. If you have extra additions or subtractions, I'll like to see it in the comments 😄.