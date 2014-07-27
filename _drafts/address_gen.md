---
title: Address generation
---

In this tutorial, we'll be creating our own Bitcoin addresses in Ruby.  The easy way involves using the bitcoin-rb gem and calling:

but that doesn't teach us much; and tt's actually not that hard to implement with basic hashing and elliptic curve cryptography libraries.

First, high level of what's going on:

Private keys
	look like:
	Lets you create new transactions, to spend your bitcoins

Public Keys:
	look like:
	Lets you prove that you own bitcoins associated with a certain address

Public Address:
	looks like:
	You give this to people, so that they can send you bitcoins.

The private key deterministically generates the public key which deterministically generates the public address.

These "generation" functions involve one-way functions (once you perform the function, you can't go back and determine the inputs), so it's practically impossible to get the public key from a public address, or a private key from a public key.

Private keys are simply 256 random bits.

Nowadays, public keys are compressed.  A public key is the x,y coordinate of a point on this curve.  Because this curve is symmetric over the x axis, if you have the x coordinate, you're left with only 2 possibilities for the y coordinate, so instead of including the entire y coordinate (a really big number), you just indicate whether the y coordinate is positive or negative.  This saves space on the blockchain.



