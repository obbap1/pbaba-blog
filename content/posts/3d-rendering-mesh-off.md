---
title: "Tetrahedron with Mesh and OFF"
description: ""
date: 2024-07-17
image: https://res.cloudinary.com/pbaba/image/upload/v1721205181/michael-dziedzic-nc11Hg2ja-s-unsplash_jeto7j.jpg
---

## Introduction
I'm reading on surface geometry<sup>[1]</sup>, as an entrypoint into ray tracing. I've also been reading on web GPU fundamentals, GPUs generally and how computer graphics work. 

## Tetrahedron
A tetrahedron has four triangular faces. This means it has four vertices, you can think of them as X, Y, Z and origin coordinates. It also has six edges. 

Triangles are important in computer graphics because any surface can be built as a set of triangles called a mesh. 

## OFF and Mesh
OFF<sup>[2]</sup> is a simple binary protocol that lets you define your vertices and faces. In the case of a tethrahedron, the off file looks like:
```off
OFF
4 4 0
1.0 0.0 0.0 
0.0 1.0 0.0 
0.0 0.0 1.0 
0.0 0.0 0.0
3 0 1 2
3 0 2 3
3 0 1 3
3 1 2 3

```
`4 4 0` - means 4 vertices, 4 faces and 0 edges (ignored). <br>

The next four lines define the co-ordinates of the vertices. <br>

Eg. `1.0 0.0 0.0` - means the (X, Y, Z) coordinates. <br>

The subsequent four lines define each face and which vertices combine to form it. <br>
Eg `3 0 1 2` - means this face is a combination of 3 vertices. Vertices at index 0, 1 and 2. 

[Mesh](https://www.meshlab.net/) is the library used to import and render the OFF file. Other file formats exist like OBJ. 

The rendered tetrahedron looks like:

![tetrahedron](https://res.cloudinary.com/pbaba/image/upload/v1721203830/Screen_Recording_2024-07-17_at_09.06.49_tcuctk.gif)

## References
1. https://graphicscodex.com/app/app.html?page=_rn_surfc
2. http://www.geomview.org/docs/html/OFF.html