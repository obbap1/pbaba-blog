---
title: "Understand Master-Slave Relationships using the Election Algorithm"
description: ""
date: 2019-08-09
---

# Introduction

While building distributed systems, Transparency is a very important factor. The Engineer has to consider Access transparency, Concurrency transparency, Location transparency, Replication transparency, etc. Replication transparency answers the question, 'Will my data resources always be consistent ?'.

# What is Replication transparency?

With distributed systems, we can access different copies of our resources, which helps with redundancy, backup, speed, etc. Having replicas of a particular resource, also raises the issue of consistency. How do we ensure that all the replicas of a particular resource are consistent at all times? Two-phase commits can help in ensuring that if for any reason, all the replicas of a particular instance don't get updated may be due to timeouts or propagation errors, the instances will be rolled back to their previous state. This means that the update is lost and has to be done again.

Three models help us with handling replicas:

1. Primary-Backup / Master-Backup Model
2. Peer to Peer Model
3. Master-Slave Model

The **_Primary-Backup model_** exposes only one instance to all external processes. This instance is the master instance, and it has read and write permissions. All other instances or replicas have only read permissions. So with this model, we are sure that only one instance can be updated, and then the change is propagated. The drawbacks of this model are that it isn't scalable, because only one instance is exposed and if that instance crashes before propagation happens, we will still encounter inconsistencies.

The **_Peer to Peer_** model gives all the instances read and write permissions. With this model, we will observe performance issues, especially when we need to propagate very large chunks of data. Maintaining global consistency will also be difficult. It is best suited for applications that require low data replication. User-specific applications for example.

The **_Master-Slave_** model has one instance as the Master model, with read and write permissions. The other instances(slaves) have read permissions, but are "hot-spares" in the sense that immediately they notice that the Master node is down, a slave becomes the Master. It is best used for systems where reading operations are higher than writing. Eg. Databases. This is because to write or update an item on a database, it reads first (read-modify-write).

# Which Slave is selected to be the Master?

This is where the Election algorithm comes in. It is used to elect a slave(to be master) after the master node fails.
We have the

1. Bully Election Algorithm
2. Ring Election Algorithm
3. Leader Preelection Algorithm

The **_Bully election_** algorithm takes the node with the highest ID as the next master. Once a node realizes that the master node has failed, the election process starts. If the last node to join the conversation is the node with the highest ID then the election process is going to take some time compared to when the node with the highest ID joins first.

The **_Ring election_** algorithm implements the Bully election algorithm but the nodes are arranged in a logical ring. This means each node sends messages to its neighboring nodes, and not to every node.

The **_Leader Preelection_** algorithm chooses the "backup" master node while the master node is still running. It still implements the election algorithm, but it happens while the master node is still running. This eliminates the overhead that happens with the other methods, but its also a waste of resources because the backup nodes can fail before the master, and then the elections will keep happening.

# Simulating the Election Algorithm

We will be simulating the Bully election algorithm, using four docker containers running NodeJS and rabbitmq. I initially tried using actual VMs, Welp. Good luck with that.

To achieve this simulation, we'll have to:

1. Create a Docker network, which will host all the containers and the rabbitmq server
2. Spin up the rabbitmq server, and bind the port to rabbitmq running on our localhost.
3. Spin up four docker containers from our Dockerfile.
4. Use the Pub/Sub pattern, and the fanout method, so that every node sends messages to every node.

# Create a Docker network

```sh
# The name of this network is election-algorithm_default
docker network create election-algorithm_default

# confirm it exists and copy the network id
docker network ls
```

# The Rabbitmq Server

The Server will use the management alpine, so ports 5672 and 15672 will be used. If any processes are running on this port, you will need to kill them.

```sh
# Run the rabbitmq image in detached mode
docker run -it -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.6-management-alpine

# Confirm its running and copy the container id
docker container ls
```

Now, we can add it to our network, so it can communicate with the containers.

```sh
# connect the rabbitmq server to the network
docker network connect <NETWORK_ID> <CONTAINER_ID>
# Confirm its running
docker inspect election-alogithm_default
# You should see a "containers" key with the rabbitmq server.
```

# Create Dockerfile

In our present directory, We'll need a server.js file and some dependencies.

```sh
npm init && npm i --save amqlib node-cron && touch server.js
```

Then our docker file

```docker
FROM alpine:latest

WORKDIR /usr/src/app
# Install Node js and npm
RUN apk add --update nodejs npm

RUN npm install

COPY . .

CMD ["node","server.js"]
```

Now, we'll need to get the IP address of the Rabbitmq server, because that is what we'll connect our containers to.

```sh
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <CONTAINER_ID>
#OR
docker inspect <CONTAINER_ID> | grep "IPAddress"
```

We should be able to see our IP address from any of those results.

# Server.js

In this file, every node sends a heartbeat to the rabbitmq server, which is a cron job that runs every 10 seconds. Every node can see all the responses and then sort the information according to the container ids. The container with the highest ID is automatically the master, and if that node fails, the next node takes over! We'll store the messages in a set so that there will only be unique ID's.

The server.js file should look like this

```js
// Require libraries
const amqp = require("amqplib/callback_api");
const cron = require("node-cron");
const os = require("os");

//Connect to the IP address of the Rabbitmq container
const url = `amqp://guest:guest@${IP_ADDRESS_OF_THE_RABBITMQ_SERVER}`;

//The transmitter
const sendContainerIdToOthers = () => {
  /**
   * method for sending containerId to other nodes
   * @param {null}
   * @returns {null}
   *
   */
  // This returns the container id
  console.log(`My id is ${os.hostname()}`);

  //Connect to the server
  amqp.connect(url, (error0, connection) => {
    if (error0) throw error0;
    //Create channel
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;
      //Create exchange
      const exchange = "logs";
      //Send Message indicating your ID
      const msg = `My id is ${os.hostname()}`;
      //Use the fanout mechanism
      channel.assertExchange(exchange, "fanout", { durable: false });
      //Publish this message
      channel.publish(exchange, "", Buffer.from(msg));
    });
  });
};

//The receiver
amqp.connect(url, (error0, connection) => {
  if (error0) throw error0;
  connection.createChannel((error1, channel) => {
    if (error1) throw error1;
    const exchange = "logs";
    channel.assertExchange(exchange, "fanout", { durable: false });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) throw error2;
      console.log(`Waiting for messages in ${q.queue}`);
      channel.bindQueue(q.queue, exchange, "");
      //Since we want the IDs to be unique, we'll use a set
      let resultSet = new Set();
      //Clear the set every 15 seconds
      setInterval(() => {
        resultSet = new Set();
      }, 15000);

      channel.consume(
        q.queue,
        msg => {
          if (msg.content) {
            console.log(`received: ${msg.content.toString()}`);
            //Split the response to get the ID
            const id = msg.content
              .toString()
              .split("is")[1]
              .trim();
            //Add ID to the set
            resultSet.add(id);

            console.log("Container id's", resultSet);
            //FInd the master node
            const findMaster = Array.from(resultSet).sort();

            console.log(`Our Master Node is ${findMaster[0]}`);
          }
        },
        {
          noAck: true
        }
      );
    });
  });
});

//Run every 10 seconds
cron.schedule("10 * * * * *", () => sendContainerIdToOthers());
```

# Results

Now we can spin up four servers from the Dockerfile and connect them to the network

```sh
# build the image
docker build --tag=server1 .
# Run this command for three other servers, server2, server3 and server4.

#Run the image and connect the container to the network election-algorithm_default
docker run -it -d --network <NETWORK_ID> server1
# Run this command for three other servers, server2, server3, and server4.

#Confirm they are running
docker container ls | grep server1
```

After 10 Seconds, we can check the logs of any of our nodes

```
docker logs --follow <CONTAINER_ID>
```

Then, we'll see all the nodes join in, and how the master node is changed when a higher node comes in.
![Results](https://res.cloudinary.com/pbaba/image/upload/v1565388893/Screenshot_from_2019-08-09_10-18-13_m8bbcz.png)

If we kill a node, we'll find out the next elected node according to ID, becomes the Master.
![Master](https://res.cloudinary.com/pbaba/image/upload/v1565388895/Screenshot_from_2019-08-09_11-14-12_skixyn.png)

# Conclusion

I just got started with Docker / Distributed systems, I hope this informs you a little. The repo for this is [here](https://github.com/obbap1/election-algorithm).