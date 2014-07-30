---
title: Tutorial - Address Generation
---

TODO
  - styles for header text and notes
  - read through, edit.

In this tutorial, we'll be creating our own Bitcoin addresses in Ruby.  The easy way involves using the bitcoin-rb gem:

{% highlight ruby %}
require 'bitcoin'
key = Bitcoin::generate_key
address = Bitcoin::pubkey_to_address(key[1])
# address => 16aqnGNe8GXKajL6Hjj6fGpPBqve8QnNfd 
{% endhighlight %}

This doesn't teach us much; so we'll do it ourselves using only basic hashing and elliptic curve cryptography libraries.

# Introduction

First, a high level of what's going on:

  - We have 3 main components:

    1. Private keys - Lets you sign new transactions, thereby spending your bitcoins.

    2. Public Keys - Proves that you own bitcoins associated with a certain address

    3. Public Address - You give this to people, so that they can send you bitcoins.

  - The private key deterministically generates the public key which deterministically generates the public address.

  - These "generation" functions involve one-way functions (once you perform the function, you can't go back and determine the inputs). It's practically impossible to get the public key from a public address, or a private key from a public key.

  - Private keys are simply 256 random bits.

  - Nowadays, public keys are compressed.  Unlike a private key which is a random integer, a public key is a point on an elliptic curve: <img style="float: left" src="/assets/imgs/elliptic-curve.png" />
    Because this curve is symmetric about the x axis, given any x coordinate, there exist only 2 possibilities for the y coordinate. Instead of including the entire y coordinate (a really big number), compressed public keys simply indicate whether the y coordinate is positive or negative, thus saving space on the blockchain.  The public address of a compressed public key is different than the public address of the uncompressed public key.

Disclaimer: I am not a cryptographer and any such cryptography advice or implementations should be accepted as academic experimentation and not crypto best practices.

I've included some "boring" helper functions in order to make this all work (hex converters, string converters, base58 encoding).  The 'utils.rb' file can be downloaded [here](/assets/data/utils.rb).

# Private Key:

Step 1. Generate 256 Random bits.  

You can get this from /dev/urandom, flip a coin 256 times, roll a 16-sided dice 64 times, point a webcam at your lavalamp, etc, but here, we'll just take a hash of a simple phrase (did I mention that this implementation should only be accepted as academic experimentation?)

Note: The elliptic curve is defined over a prime field, so our private key must be less than our chosen prime.

{% highlight ruby %}
require digest
passphrase = "bitcoins are cool"
priv_key = Digest::SHA256.digest(passphrase)
p = 2**256 - 2**32 - 2**9 - 2**8 - 2**7 - 2**6 - 2**4 - 1
if priv_key.to_bignum > p
  raise "Private key invalid" 
end
# priv_key.to_hex => 9e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a52
{% endhighlight %}

Just to be clear, the private key can be exressed in multiple ways:
  Binary: 1001111001010010010011011110010001111000100101110000101010010110001000011100000011100101001010001001000010000000010111010101111100101000111000110110001000001000100100101011101001101011111110100111000000011011000000100110110001101110111000010000101001010010
  Integer: 71610849129504069670807627525562295685404995395280754758942009276479161043538
  Hex: 9e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a52

These are merely different representations of the same thing, and are all equivalent.  As we proceed, we'll need to jump around different representations depending on what we're doing.  Don't be alarmed.

We could actually stop here.  These 256 random bits ARE your private key.  BUT, if you want to use this key with any mainstream bitcoin application, the private key must be in wallet import format (WIF format).  To do that:

Step 2. Prepend Version, append compression flag

The version number depends on the network.

Bitcoin = 0x80
Testnet = 0xEF (Testnet is a "bitcoin playground" where developers can test their applications against a live bitcoin-like network where no money is involved)

Compression Flag = 0x01
* Note: this is to make private keys completely deterministic.  As stated above, compressed and uncompressed public keys generate different public addresses.  The compression flag signals which of those addresses this private key should generate

{% highlight ruby %}
# Note: adding the "b" makes a binary representation of our byte before concatenating, to avoid encoding issues
priv_key_and_version = "\x80".b + priv_key + "\x01".b
# priv_key_and_version.to_hex => 809e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a5201
{% endhighlight %}

Step 3. Add Checksum

Checksum is the first 4 bytes of the double sha256 hash of our input.  It is used to ensure that every bit is correct; if a single bit is off, we will know about it.

{% highlight ruby %}
def cat_checksum (input)
  firstSHA  = Digest::SHA256.digest(input)
  secondSHA = Digest::SHA256.digest(firstSHA)
  input + secondSHA[0,4]
end

priv_key_and_version_and_checksum = cat_checksum(priv_key_and_version)
# priv_key_and_version_and_checksum.to_hex => 809e524de478970a9621c0e52890805d5f28e3620892ba6bfa701b026c6ee10a520140d9c9e7
{% endhighlight %}

Step 4. Base58 Encoding

We currently have 38bytes (304 1s and 0s) of data. Using the digits 0-9. we can express this data as a 92 digit long integer.  Using 16 possible characters 0-9,A-F, we express this in 76 characters as shown above.  If we use 58 possible characters, the data can be expressed in only 52 characters.  The characters used for Base58 are:
	- 1-9 		 (9)
	- a-z EXCEPT l 	 (25)
	- A-Z EXCEPT I,O (24)

I've included the bitcoin-ruby base58 encoder in our utility package.

{% highlight ruby %}
privateWIF = priv_key_and_version_and_checksum.to_base58
# privateWIF => L2XU3tBMCgmAb16LRcrPenccYdUCGKgahkW1oZ4diHuk3dvb6WDL
{% endhighlight %}

# Public Key

Step 5. Evaluate k(public) = k(private) * G

This is where Elliptic Curve Cryptography comes in.  I'll go into how this all works in a later post, but for now, we'll simply use this equation.

We have the private key from the first step; it's an integer that is 77 digits long (71610849129504069670807627525562295685404995395280754758942009276479161043538).

G is called a "generator point", and is a certain point on the elliptic curve.  
  It has x coordinate: 
  and y coordinate: 

When we multiply the generator point with our private key, we get a new point on the curve (with x and y coordinates).  This point acts as our public key.  Because you can't easily "divide" points on an elliptic curve, it's computationally impractical to generate the private key given our knowledge of the public key and the generator point.

Note: We're using the ["ecdsa" gem](https://github.com/DavidEGrayson/ruby_ecdsa) because the OpenSSL library is poorly documented and confusing.

Note: Secp256k1 is a NIST predefined curve. Every application which uses secp256k1 curves use the same generator point.

{% highlight ruby %}
curve = ECDSA::Group::Secp256k1
pub_key = curve.generator.multiply_by_scalar(priv_key.to_bignum)
# pub_key.x => 107755497148048731412938604358975700840069163823903109146820905484112739528923
# pub_key.y => 24245920055987556528993042428760322520988269343242132634556250883291122420691
{% endhighlight %}

Step 6. Compress

As hte image shows, elliptic curves are symmetric about the x-axis.  This means that if we know the x-coordinate of a point on the curve, there are only 2 possible values for the y-coordinate.  If the y-coordinate is even, our public key is of the form.

  \x02 + x coordinate

If the y-coordinate is odd, our public key is of the form:

  \x03 + x coordinate

{% highlight ruby %}
# pub.x is a Bignum, so we must concatenate our compression byte with the hex representation of pub_key.x
if pub_key_point.y % 2 == 0 # y is even
  leader = "\x02"
else
  leader = "\x03"
end
pub_key = leader + [pub_key_point.x.to_hex].pack("H*")
# pub_key.to_hex => 03ee3b7337eb52d1e8bd7ee271db9aa43a67750ff483870ab2753d2e13922970db 
{% endhighlight %}

We now have our public key.

# Public Address

Step 7.  Hash public key

Next, we hash the public key.  This compresses our key from 256 bits to 160.

{% highlight ruby %}
pub_key_sha256 = Digest::SHA256.digest(pub_key_with_lead)
pub_key_hash = Digest::RMD160.digest(pub_key_sha256)
# pub_key_hash.to_hex => 5355f7bb58765e07a20f978b6e2437e99a5e92d3
{% endhighlight %}

Step 8.  Prepend version, append checksum

The version number depends on the network, and is different than the version used in step 2.

Bitcoin = 0x00
Testnet = 0x6F

Checksum is computed the same way it was in step 3.

{% highlight ruby %}
pub_key_hash_and_version_and_checksum = cat_checksum("\x00" + pub_key_hash) 
# pub_key_hash_and_version_and_checksum.to_hex => 005355f7bb58765e07a20f978b6e2437e99a5e92d3f612577e
{% endhighlight %}

Step 9.  Base58 Encode.

{% highlight ruby %}
pub_addr = pub_key_hash_and_version_and_checksum.to_base58 
# pub_addr => 18be54dbyAth7CR4ymeoQBpzwinLW5Qe1K
{% endhighlight %}

We can now share this address with our friends, convert it to a QR code, get it tatooed on our bodies, and watch the bitcoins rush in.

===

Download the code [here](/assets/data/address-gen.rb).

References/Additional Reading

- [Andreas Antonopoulos on Bitcoin Wallet Encryption &#124; youtube.com](https://www.youtube.com/watch?v=PdGRmshPXdo)
- [Generating a Bitcoin Address with JavaScript &#124; procbits.com](http://procbits.com/2013/08/27/generating-a-bitcoin-address-with-javascript)
- [Elliptic Curve Crtyptography &#124; wikipedia.org](https://en.wikipedia.org/wiki/Elliptic_curve_cryptography)
- [Introducing Ruby ECDSA Gem &#124; davidgrayson.com](http://blog.davidegrayson.com/2014/04/introducing-ruby-ecdsa-gem.html)
- [Ruby ECDSA &#124; github.com](https://github.com/DavidEGrayson/ruby_ecdsa)
- [Why does Bitcoin use 2 hash functions? &#124; stackexchange.com](https://bitcoin.stackexchange.com/questions/9202/why-does-bitcoin-use-two-hash-functions-sha-256-and-ripemd-160-to-create-an-ad)
- [List of Address Prefixes &#124; bitcoin.it](https://en.bitcoin.it/wiki/List_of_address_prefixes)
- [Technical Background of Bitcoin Addresses](https://en.bitcoin.it/wiki/Technical_background_of_Bitcoin_addresses)
