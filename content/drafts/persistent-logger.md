---
title: "Persistent Logger"
description: ""
date:  2023-12-06
---

# Introduction
I have been reading #[Kafka: The Definitive Guide](https://www.amazon.co.uk/Kafka-Definitive-Guide-Neha-Narkhede/dp/1491936169) and working with some logging pipelines recently and separating the pipeline into producers, brokers and consumers help with scalability and autonomy. Eg. You can scale the number of consumers independently, and finetune performance for your producers (Eg. Increase RAM, Increase TCP send buffer size etc).

This post isn't really about logging, its more about concurrency