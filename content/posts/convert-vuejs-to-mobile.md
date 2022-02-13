---
title: "How to Convert a Vue JS SPA to a mobile app"
description: ""
date: 2019-03-09
---

Given the limited time and know how developers have to ship mobile applications, hybrid applications helped in making things easier. Frameworks such as ionic, which was built on apache cordova, help us build mobile apps with HTML,CSS and JS. Normally, Java would be the go-to guy for android development and Objective-C for ios.

Though hybrid frameworks made development easier, it struggled in terms of performance, but the react native framework ranked highly performance wise when compared to 'proper' native applications. React native has been described as not fully native, and not fully hybrid, you can read up the full story [here](https://www.quora.com/Is-React-Native-actually-native-or-hybrid) 

## Building the mobile app of a Vue JS SPA with Cordova ✅

This can be achieved using the [vue-cli-plugin-cordova](https://www.npmjs.com/package/vue-cli-plugin-cordova) plugin.
Firstly, we will have to install [cordova](https://cordova.apache.org/docs/en/latest/) and then add the platforms we will like to build for.

If Cordova is installed, we can confirm

```sh
cordova --version
```

Then, we can install the plugin

```sh
npm i vue-cli-plugin-cordova
```

When this is done, we should see the path to this application in our ***vue.config.js*** file.

```json
module.exports = {
    ...,
    pluginOptions: {
        cordovaPath: "src-cordova"
    }
}
```

Then we can go to that folder, and then add our platforms.

```sh
cordova platform add android
```

We can confirm the platforms, we've added:

```sh
cordova platform ls
```

We should see android as the output. To build this application for Android, we will need to get [Android Studio](https://developer.android.com/studio) and [Gradle](https://gradle.org/) up and running. We can then go to the 'www' folder and make our changes. The different commands to build for our various platforms, are in our package.json file and then we can come to our root directory and run them.

Before building, we should ensure that:
> 🖊  Our router mode is set to hash, no longer history <br>
> 🖊  Our base URL in our vue.config.js file is set to ""

## Building the mobile app of a Vue JS SPA with React Native ✅

First, we install react native and expo

```sh
npm install -g expo-cli react-native
```

Then, we initialize our project

```sh
expo init myProject
```

If you encounter any errors, then you should consider installing an older version of expo(2.11.3)

Then we can go to our ***App.js*** file, and then use the WebView.

```js
import React from 'react';
import { WebView } from 'react-native';

export default class App extends React.Component {
  render() {
    return (
        <WebView
          style={{ flex: 1 }}
          source={{ uri: 'THE_SITE_URL' }}
        />
    );
  }
}

```

There is so much more we can do with the application, but this is basically how it works. All other guides can be gotten from the [documentation](https://facebook.github.io/react-native/docs/getting-started).

Finally, we'll need to create our ***index.js*** entry file in our root directory, and then add then register our **App** component.

```js
    //index.js fie
    import { AppRegistry } from 'react-native';
    import App from './App';

    AppRegistry.registerComponent('NAME_OF_PROJECT', () => App);

```

Check the ***app.json*** file to be sure of the name of your project.

## Conclusion

This was really a hassle for me to do, I hope this helps! and that it takes you a shorter period to work around.

## References

1. [React Native Documentation](https://facebook.github.io/react-native/docs/getting-started)
2. [Medium Blog Post by kyle bremner](https://blog.defining.tech/adding-a-back-button-for-react-native-webview-4a6fa9cd0b0)