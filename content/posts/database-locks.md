---
title: "Locks"
description: ""
date: 2023-02-01
image: "https://res.cloudinary.com/pbaba/image/upload/v1675260880/imattsmart-Vp3oWLsPOss-unsplash_qhhg92.jpg"
---

# Introduction
With single-threaded applications, there is no possibility of concurrent access to the same piece of data. With multi-threaded applications, multiple threads can access the same piece of data. To avoid race conditions, primitives such as atomic operations, mutexes, and other lock-free algorithms can be used to synchronize access to a shared piece of data. 

A multi-process setup, which is done mostly for resilience and reliability, in the case where one pod is in a bad state, the other pods can still be handling requests. For example, running 3 pods or containers in a cluster. In most cases, these pods all use the same storage layer, Eg. a database like postgres, or a cache like redis, and can receive multiple requests that will access the same piece of data. With a multi-process setup, whatever synchronization mechanism we use must live independently of the pods. We'll look at a few ways of synchronizing access to a shared piece of data in a multi-process setup.

## Distributed locking
A distributed locking algorithm like [redlock](https://redis.com/redis-best-practices/communication-patterns/redlock/) (for redis) can be used to ensure that only one pod has write access to the shared piece of data. This means that out of the three pods in our setup, the other two pods will be blocked till this lock is free. The wait time for these other pods will be determined by the lock timeout. 
There are also specialized locking services like chubby.

## Master Election 
At startup, the three pods can elect a master which will be in charge of WRITES and the other pods can do READS. If any pod receives a WRITE request, it has to send this request to the master pod to execute it on its behalf. A consensus algorithm like [raft](https://raft.github.io/#:~:text=Raft%20is%20a%20consensus%20algorithm,pieces%20needed%20for%20practical%20systems.) can help with master election etc.

## Advisory locks 
Advisory locks are postgres way of doing something like distributed locking, think redlock. With advisory locks, you can grab a lock on an arbitrary number. The number should make sense to your application, but it doesn't matter what it is to postgres. it can be one or two 32-bit numbers.

Eg. 
```SQL
select pg_try_advisory_lock(1)
```
This will try to get the lock on the number `1` and will return `t` for true if it can and `f` for false if it can't. This can also be used without the `try` like 
```SQL
select pg_advisory_lock(1)
```
This will wait till the lock timeout to try and get the lock. Depending on what your application logic looks like, any of them can be suitable. 

Advisory locks can be session-based or transaction based. You should be careful with session-based locks as you'll have to explicitly release the locks. Transaction-based locks will be released once the transaction ends (commits or rollbacks).

Example of a transaction-based advisory lock:
```SQL
select pg_advisory_xact_lock(1)
```

There are other kinds of explicit locks, you can have a lock on a whole database table (table lock), a lock on just one record in the table (a row lock) or a lock on a page in memory (a page lock). 

## FOR UPDATE, NOWAIT and SKIP LOCKED
With the `FOR UPDATE` keyword(s) you can tell postgres that for the lifetime of this transaction, the items I selected with `FOR UPDATE` shouldn't be fiddled with by other processes. "fiddling" here can entail both reading or writing or just writing depending on your [isolation level](https://www.postgresql.org/docs/current/transaction-iso.html).
```SQL
BEGIN;
/* Grab the lock for user id 5 */
SELECT firstname, lastname FROM users WHERE id = 5 FOR UPDATE;
/* Do other stuff.... */
COMMIT;
```
If other processes want to update the row with user id `5` then they'll have to wait till this lock is released or till the lock timeout. This can lead to thrashing because the other pending transactions will have to keep retrying while waiting for the lock. 

To finetune that, you can decide to use either `NOWAIT` or `SKIP LOCKED`.
With `NOWAIT` we have:
```SQL
SELECT firstname, lastname FROM users WHERE id = 5 FOR UPDATE NOWAIT;
```
This means that this transaction won't wait for the lock, if it can't grab the lock on the first try then it returns an error. 

With `SKIP LOCKED`:
```SQL
SELECT firstname, lastname FROM users FOR UPDATE SKIP LOCKED;
```
if the result spans multiple rows, then `skip locked` will skip all the locked rows and return the other rows. Eg. if user `5` is still locked then this query will return something like `[1,2,3,4,6]` for example. 

# **References** 
1. [Martin Kleppmann - Redlock](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
2. [Postgres Documentation - Locking](https://www.postgresql.org/docs/current/explicit-locking.html) 
