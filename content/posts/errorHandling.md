---
title:  Handling Ever Increasing Server Logs 
date: 2019-05-19
published: true
tags: ['JavaScipt', 'Servers','Linux', 'Computer Science']
series: false
cover_image: https://res.cloudinary.com/pbaba/image/upload/v1558194878/ales-krivec-3535-unsplash_p56dfa.jpg
canonical_url: false
description: "I thought the game of thrones would be the most stressful thing i came across this week, but searching through logs, handling errors can be very tedious, and knowing what exactly is happening on your server is keen to finding solutions. So let's find out how we can handle..."
---

# **Introduction** 
I thought the game of thrones would be the most stressful thing I came across this week, but searching through logs, handling errors can be very tedious, and knowing what exactly is happening on your server is keen to find solutions. So let's find out how we can handle our server outputs.

![Image for Logs](https://res.cloudinary.com/pbaba/image/upload/v1558194878/ales-krivec-3535-unsplash_p56dfa.jpg)

## ***PM2***
[PM2](http://pm2.keymetrics.io/) is an advanced, production process manager for Node.js [1]. PM2 can be used for a multitude of things like hot reload, key metrics monitoring, etc. but it's also very useful for Log management.

So we can install PM2 on our NGINX server for instance, with:

```sh
npm i pm2 -g
```

So if we connect to our server, maybe via SSH on our terminal.

```sh
ssh -i "privatekey.pem" username@server-host-name

# Navigate to the pm2 folder
cd .pm2/logs

# List the files 
ls 

>server-out.log
>server-error.log

```
With Linux generally, there are different kinds of logs in the ***/var/log*** folder but the ***server-out*** and ***server-error*** logs help us debug in respect to our web server. The server-out.log outputs the console.log lines and the server-error.log outputs the errors our server encounters.

Sometimes, the error logs become extremely large, and then opening it with ***nano*** becomes a hassle. We can use the zip and wget packages to get the file locally.

```sh
sudo apt-get install zip

# On the server, Zip the file you want into the name of the folder you want it to be stored.

zip server-error.log server-error.zip

#On our client, install wget
sudo apt-get install wget

#Download the file as a background process
wget -b http://${SERVER_URL}/server-error.zip
```

## ***PAPER TRAIL***
[Paper trail](https://help.papertrailapp.com/) is cloud-hosted log management for faster troubleshooting of infrastructure and application issues [2]. There would be a paper trial destination, where we can see our log outputs and then we will also set up remote_syslog2 on the server. Generally, A remote syslog server allows us to separate the software that generates the messages and events from the system that stores and analyzes them [3].

```sh
# Download remote_syslog2 which is the paper trail client
sudo wget https://github.com/papertrial/remote_syslog2/releases/download/${VERSION}/${DEBIAN_FILE}

# Install the deb file with the package manager
sudo dpkg -i <DEBIAN_FILE>

# Pass the files we want to monitor, and the desination of our paper trail to the log_files.yml file.
sudo bash -c "cat > /etc/log_files.yml"  <<EOF
files:
  - /.pm2/logs/server-error.log
  - /.pm2/logs/server-out.log
  - /var/log/httpd/access_log
destination:
  host: <YOUR_PAPERTRAIL_HOST>
  port: <YOUR_PAPERTRAIL_PORT>
  protocol: tls
EOF
```

## ***JFILE***
The [JFile](https://www.npmjs.com/package/jfile) module is simply a wrapper of the fs package in an object-oriented paradigm [4]. 

```js
npm install JFile

//For exmple = new JFile(__dirname + "/file.txt")
const myFile = new JFile(__dirname + `${WHERE_YOU_WANT_THE_LOGS_STORED}`);

async function harryPotter(){
    const x = await fetch('http://example.com');

    // Add what you want to the myFile variable.
    myFile.text = 'Function harry potter has been called';
}
```

## ***BUNYAN***
[Bunyan](https://www.npmjs.com/package/bunyan) is a simple and fast JSON logging library [5]. Basically, it makes your errors look beautiful and more detailed.

```js
const bunyan = require('bunyan');
const log = bunyan.createLogger({name:'hello'})

const findMyPizza = (err,location) => {
    if(err){
        log.info(err)
    } else {
        log.info('Yas');
    }

}
```
The default output has keys like name, hostname, pid, level etc.

## ***ZAPIER HOOKS + SLACK***
[Zapier](https://zapier.com/) is a really nice tool for automating processes and workflows. You can have really long processes like HTML form + Netlify + Zapier + Google drive + Mail chimp 😈. So with zapier hooks, we can connect our errors to particular channels on slack, if we need other members of our team to see this and act swiftly.

```js
 const errorObject = {
    Error: "We've been hacked!!!",
    Time: new Date(),
  };
  request.post(
    { url: `${LINK_TO_ZAPIER_HOOK}`, form: errorObject },
    (error, response, body) => {
        ...
    }
  );
```
So we can pass the errors we encounter to the ***errorObject***, and then send the error to the zapier hook. The rest of the setup is handled on zapier directly.

# **Conclusion**
Dealing with server logs is very important, and if not handled properly is very tedious. I hope this reduces the time you'll spend next time.

# **References**

[1] [PM2 Documentation.](pm2.keymetrics.co) <br>
[2] [Papertrail documentation.](https://www.solarwinds.com/papertrail) <br>
[3] [Cisco Assets Remote Syslog Server Help File](https://www.cisco.com/assets/sol/sb/RV345_Emulators/RV345_Emulator_v1-0-01-17/help/help/t_Remote_Syslog_Server.html) <br>
[4] [JFile Documentation.](https://www.npmjs.com/package/jfile) <br>
[5] [Bunyan Documentation.](https://www.npmjs.com/package/bunyan)