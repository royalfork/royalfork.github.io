---
title: Address Generation - Tutorial
---

In this tutorial, we'll be creating our own Bitcoin addresses in Ruby.  The easy way involves using the bitcoin-rb gem and calling:

but that doesn't teach us much; and tt's actually not that hard to implement with basic hashing and elliptic curve cryptography libraries.

First, high level of what's going on:

Private keys
	look like:
	Lets you sign new transactions, to spend your bitcoins.

Public Keys:
	look like:
	Lets you prove that you own bitcoins associated with a certain address

Public Address:
	looks like:
	You give this to people, so that they can send you bitcoins.

The private key deterministically generates the public key which deterministically generates the public address.

These "generation" functions involve one-way functions (once you perform the function, you can't go back and determine the inputs), so it's practically impossible to get the public key from a public address, or a private key from a public key.

Private keys are simply 256 random bits.

Nowadays, public keys are compressed.  A public key is the x,y coordinate of a point on this curve.  Because this curve is symmetric over the x axis, if you have the x coordinate, you're left with only 2 possibilities for the y coordinate, so instead of including the entire y coordinate (a really big number), you just indicate whether the y coordinate is positive or negative.  This saves space on the blockchain.  The public address of a compressed public key is different than the public address of the uncompressed public key.

Disclaimer: I am not a cryptographer and any such cryptography advice or implementations should be accepted as academic experimentation and not crypto best practices.

Some helper functions and library includes to make this all work:

```ruby
require 'digest'
require "ecdsa"

class Bignum
  def to_hex
    self.to_s(16)
  end
end

class String
  def to_hex
    self.unpack("H*").first
  end

  # taken from bitcoin-ruby project
  def to_base58
    hex_val = self.to_hex
    leading_zero_bytes  = (hex_val.match(/^([0]+)/) ? $1 : '').size / 2
    int_val = hex_val.to_i(16) 
    alpha = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    base58_val, base = '', alpha.size
    while int_val > 0
      int_val, remainder = int_val.divmod(base)
      base58_val = alpha[remainder] + base58_val
    end
    ("1"*leading_zero_bytes) + base58_val
  end

  def to_bignum
    self.to_hex.to_i(16)
  end
end
```

Private Key:

Step 1. Generate 256 Random bits.  

You can get this from /dev/urandom, flip a coin 256 times, roll a 16-sided dice 64 times, point a webcam at your lavalamp, etc, but here, we'll just take a hash of a simple phrase (did I mention that this implementation should only be accepted as academic experimentation?)

```ruby
require digest
passphrase = "bitcoins are cool"
priv_key = Digest::SHA256.digest(passphrase)
# priv_key.to_hex => 9e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a52 (32bytes)
```

We could actually stop here.  These 256 random bits ARE your private key.  BUT, if you want to use this key with any mainstream bitcoin application, the private key must be in wallet import format (WIF format).  To do that:

Step 2. Prepend Version, append compression flag

The version number depends on the network.

Bitcoin = 0x80
Testnet = 0xEF (Testnet is a "bitcoin playground" where developers can test their applications against a live bitcoin-like network where no money is involved)

Compression Flag = 0x01
* Note: this is to make private keys completely deterministic.  As stated above, compressed and uncompressed public keys generate different public addresses.  The compression flag signals which of those addresses this private key should generate

```ruby
# Note: adding the "b" makes a binary representation of our byte before concatenating, to avoid encoding issues
priv_key_and_version = "\x80".b + priv_key + "\x01".b
# priv_key_and_version => 809e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a5201 (34 bytes)
```

Step 3. Add Checksum

Checksum is the first 4 bytes of the double sha256 hash of our input.  It is used to ensure that every bit is correct; if a single bit is off, we will know about it.

```ruby
def cat_checksum (input)
  firstSHA  = Digest::SHA256.digest(input)
  secondSHA = Digest::SHA256.digest(firstSHA)
  input + secondSHA[0,4]
end

priv_key_and_version_and_checksum = cat_checksum(priv_key_and_version)
# priv_key_and_version_and_checksum => 809e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a520140d9c9e7 (38 bytes)
```

Step 4. Base58 Encoding

We currently have 38bytes (304 1s and 0s) of data. Using the digits 0-9. we can express this data as a 92 digit long integer.  Using 16 possible characters 0-9,A-F, we express this in 76 characters as shown above.  If we use 58 possible characters, the data can be expressed in only 52 characters.  The characters used for Base58 are:
	- 1-9 		 (9)
	- a-z EXCEPT l 	 (25)
	- A-Z EXCEPT I,O (24)

I ripped off the Base58 


