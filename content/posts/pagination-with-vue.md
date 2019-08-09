---
title:  Handling Pagination with Vue JS and Pouch DB 
date: 2019-06-21
published: true
tags: ['VueJS', 'PouchDB','Performance', 'Caching']
series: false
cover_image: 
canonical_url: false
description: "When the responses from a server come after just one request, and we have to paginate on the front end, its easier to handle. This is because we have all the data..."
---

# Introduction ☕️
When the responses from a server come after just one request, and we have to paginate on the front end, its easier to handle. This is because we have all the data on the client side, so we just display a range of indexes on a particular page. So if the response is an array of 400 items, we can display 20 items per page. But if for some reason, the responses from the server can't come in a single request, we'll need to use pagination or an infinite scroll. This depends on the use case. So what are the performance issues with pagination? and how do we solve them? Let's dive in.

# The Problem 🍉
Let's say we have an endpoint that returns a payload like: 
```js
{
    totalNumber: 1000,
    data: [0,....,20],
    pageNumber: 1
}
```
From the object, we can see how much data we have in total, and the particular page we are on, so we know the range of page numbers we have. If each response returns an array with 20 elements, then we have (1000 / 20) i.e 50 pages. 

<div>
    <table style="border: 1px solid red;">
        <tr style="border: 1px solid red;" >
            <td style="border: 1px solid red;" >1</td>
            <td style="border: 1px solid red;">2</td>
            <td style="border: 1px solid red;">3</td>
            <td style="border: 1px solid red;">...</td>
            <td style="border: 1px solid red;">50</td>
        </tr>
    </table>
</div>

With pagination, if we click on '1', it fetches the first twenty elements. Page 2 fetches the next twenty, coming back to page 1 fetches the first twenty elements again. So going back and forth is going to be really slow and nothing short of a hassle. 

# PouchDB: A solution
For handling storage on the client(browser), we have the local storage, session storage, indexed DB, cookies, etc. [Pouch DB](https://pouchdb.com/) actually uses IndexedDB under the hood. Its mostly used on offline apps for automatic synchronization with the Live database, most likely Couch DB. 

We'll be using Vue JS to explain how this works. Firstly, we'll install the packages needed.

```
npm i --save vuejs-paginate pouchdb-browser pouch-vue pouchdb-find pouchdb-live-find axios

vue create pouchdb-app
```
In our main.js file, we'll install and initialize the database.

```js
// main.js 
import Vue from 'vue';
import Paginate from 'vuejs-paginate';
import PouchDB from 'pouchdb-browser';
import * as pouchVue from 'pouch-vue';

PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-live-find'));

Vue.component('paginate', Paginate);

Vue.use(pouchVue, {
    pouch: PouchDB, 
    defaultDB: 'users_database' //You can give it any name 
});

// .............
```
Moving on to the vue file, where we display all our users. Assuming the response from our endpoint is something like this.
```js
{
    total:'',
    pageNumber:'',
    users:[
        {
            firstname: '',
            lastname:''
        },
        {
            firstname: '',
            lastname:''
        },
    ]
}
```
We can display our first batch of users on the vue file.
```html
<!-- users.vue -->
<div>
    <!--
        getUsers: {
            users: [],
            total: '' ,
            pageNumber: '' 
        }
    -->
    <v-data-table
        :headers="headers"
        :items="getUsers.users"  
        v-if="getUsers.users"
        hide-actions
    >
        <template slot="items" slot-scope="props">
        <td>{{ props.item.firstname}} {{props.item.lastname}}</td>
        </template>
    </v-data-table>
    <paginate
            :page-count="pageCount"
            :click-handler="fetchNext"
            :prev-text="'Prev'"
            :next-text="'Next'"
        />
</div>

```

Firstly, there is a table to display the first and last names of all the users. This table is from [Vuetify](https://vuetifyjs.com/en/). 

Secondly, we have the ***paginate*** component, which has the ***page-count*** prop, this shows the number of paginated pages we have. If the response has a total of 400 users, and we receive 20 users on every request, the page-count will be (400 / 20) 20. The ***click-handler*** prop, accepts a function that runs when any page is clicked. The ***prev-text*** and ***next-text*** props just accept the text to be displayed for the previous and next pages. 

![The flow](https://res.cloudinary.com/pbaba/image/upload/v1561991050/RBE8Xtr5PTvu_1_jnf18u.jpg)

Using the diagram above, we will create a ***getAllUsers*** action, that fetches the first batch of users, commits them to state and then stores them in PouchDB. We can also access Pouch DB from our single file component(SFC) using ***this.$pouch*** . This will be done on the ***created()*** lifecycle hook in the ***users.vue*** file. 

```html
//....
<script>
    //...users.vue
    import {mapActions, mapGetters} from 'vuex'; //Using vuex for our store
    export default {
        data(){
            return {
                headers: [
                    {
                        text: 'Name',
                        value: 'firstname',
                        align: 'left'
                    }
                ]
            }
        },
        created(){
            this.getAllUsers({
                pageNumber: 1, // Fetch first page
                pouch: this.$pouch //pass pouch db reference to action
            })
        },
        methods:{
            ...mapActions(['getAllUsers'])
        },
        computed:{
            ...mapGetters(['getUsers'])
        }
    }
</script>

```
Now we'll write the getAllUsers action, and other elements needed to complete our store.

```js
//store.js
import Vue from 'vue';

//mutation type
const UPDATE_ALL_USERS = 'UPDATE_ALL_USERS';

//state
const state = {
    allUsers: null,
};

const getters = {
    getUsers: state => state.allUsers
}

const actions = {
    getAllUsers({commit}, data){
        // retrieve the pouch db reference and page number we just sent
        const {pageNumber, pouch} = data;

        //Using axios
        Vue.axios.get(`allUsers/?page=${pageNumber}`)
            .then(res =>{
                console.log('data retrieved');
                /*
                    res: {
                        users:
                        total:
                        pageNumber:
                    }
                */
                // store data in pouch db
                pouch.put({
                    _id: `${pageNumber}`,
                    users: res.data.users
                })
                .then(()=>{
                    console.log('your data has been stored');
                })
                .catch(e => console.log(e))
            });
        commit(UPDATE_ALL_USERS, res.data);
    }
}

const mutations = {
    [UPDATE_ALL_USERS](state, data){
        state.allUsers = data;
    }
}
```
So after it fetches a particular batch of users from the server, it caches it in pouch db, with the ***pageNumber*** variable as the id, and the users as the actual data. 

Finally, we'll need to write the fetchNext function that occurs every time a particular page is clicked. So if the page is clicked, we'll check our cache, if it's there, display the result and if not call the getAllUsers action which will fetch from the server and then cache.

```html
<!--users.vue-->
<script>
//.... This is a continuation of the users.vue file above
    methods: {
        fetchNext(event){
            // event is the particular number clicked
            this.$pouch.get(`${event}`)
                .then((doc) => {
                    //if it is found, store in the cachedUsers variable
                    this.cachedUsers = doc.users;
                })
                .catch(e => {
                    //if that page wasn't found, run the getAllUsers function
                    if(e.name === 'not_found'){
                        return this.getAllUsers({
                            pageNumber: event,
                            pouch: this.$pouch
                        })
                    }
                })
        }
    }
</script>

```
We need the ***cachedUsers*** variable because the ***getUsers*** variable is just a getter, and if the users are found in our cache, we need to be able to set our variable to that value. 

```html
<script>
    //.....
    computed:{
        ...mapGetters(['getUsers']),
        cachedUsers: {
            get(){
                // return the getter
                return this.getUsers
            },
            set(value){
                //use the setter
                this.getUsers.users = value;
            }
        },
        pageCount(){
            // get the total number of users and the amount of users per page to get the number of pages.
            const {total, users} = this.cachedUsers;
            //fix to one decimal space
            const numberOfPages = (Number(total) / users.length).toFixed(1);
            //if there is a decimal value, increase the number of pages by 1.
            return Number(numberOfPages.split('.')[1]) > 0
                ? Math.round(Number(numberOfPages)) + 1
                : Math.round(Number(numberOfPages));
        }
    }
</script>
```

# Conclusion ✂️
This just shows one of the ways we can handle pagination on the front end, it also ensures things are fast. It helped me recently, and it can be written with any framework. Understanding the concept is what is important, and I hope you did. Thanks for reading!