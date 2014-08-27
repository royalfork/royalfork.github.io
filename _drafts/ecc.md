---
title: Layman's Guide to Elliptic Curve Digital Signatures
js: 
  - /js/ecc-guide.js
  - /js/jquery.flot.js
css:
  - /css/ecc-guide.css
---

In preparation for this post, I've read several research papers, a book, listened to 4 university lectures, spent many hours on IRC, developed elliptic curve libraries in 2 seperate languages, and built my own elliptic curve graphing framework in an attempt to understand how elliptic curves actually work.  This stuff is hard to wrap your head around.  But as one of the fundamental crypto systems which makes Bitcoin a "crypto"-currency, I really wanted to understand the underlying techical aspects which make elliptic curve cryptography secure.  In this post, I'll walk you through the big picture concepts I've accumulated throughout my studies; and illuminate some of the "magic" that makes Bitcoin work.

# What are Digital Signatures?

When most people hear "cryptography", they immediately think of secret messages and encryption.  While cryptography *is* used for encryption and decryption, bitcoin heavily relies on a differenty cryptography application known as digital signatures.

Alice needs some mechanism that lets her say "I approve of this message."  In the physical world, when Alice writes her signature on a contract or bank check, others *know* that Alice has "approved the message"; as no one besides Alice can produce that signature.  In the digital world, everything exists as 0's and 1's which can be trivially copied.  How might Alice "sign" something in the digital world such that others can be sufficiently confident that Alice has "approved the message"?

The answer is public key cryptography.  Alice has:

  *  a private key - sequence of numbers that only Alice knows

  *  a public key - another sequence of numbers that Alice can share with anyone

  *  a message that she wants to "approve", or sign

Broadly speaking, the "approval verification" or digital signature system will have the following algorithms:

To sign:
Message1 + Private Key(alice) = Signature(message1, alice)

* To verify:
    - Message1 + Signature(message1, alice) + Public Key(alice) = True

If any of these parts are changed, the signature is not authentic for that message.

  - Message1 + Signature(message1, chuck) + Public Key(alice) = False
  - Message1 + Signature(message1, alice) + Public Key(chuck) = False
  - Message2 + Signature(message1, alice) + Public Key(alice) = False

Notice that it's impossible to create Signature(message1, alice) unless you have the private key for Alice.  Thus, if we have a signature that can be verified with Alice's public key, we know that the message was signed by alice and only Alice.

What are Elliptic Curves?

Not to be confused with an "ellipse," elliptic curves look like:

<div class="plot-container">
  <div id="empty-ec" class="plot-placeholder" style="width:450px;height:450px"></div>
</div>

this elliptic curve has equation:

$$y^2 = x^3 + a*x + b$$

Notice that our digital signature algorithm requires addition (Message1 + Signature(message1, alice) + Public Key(alice) = True), so we'll need to be able to do addition on the elliptic curve as well.


<div class="ec-big-container plot-container">
  <div id="ec-addition" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>To add 2 points (<span class="point-a">Point A</span>, and <span class="point-b">Point B</span>)
    <ol>
      <li>Draw a line between <span class="point-a">Point A</span> and <span class="point-b">Point B</span></li>
      <li>This line always intersects the elliptic curve at a 3rd point.</li>
      <li>Reflect the the observed intersection point over the x axis to get the <span class="sum">sum of Point A and Point B</span></li>
    </ol>
    </p>
    <div class="ec-formula">
      <span class="point-a">(-2.0, 1.4)</span> + <span class="point-b point-b-add">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-add">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span>
    </div>
    <p>The graph is interactive, click on the curve to compute different sums.</p>
  </div>
</div>

Purists will note that this isn't *really* addition; we've just arbitrarily graphed some lines and declared this to be addition.  That is exactly right, but because this operation has gives us the same properties as addition, we can use it as a drop-in replacement.
  P1 + P2 = P2 + P1
	P1 + (P2 + P3) = (P1 + P2) + P3


What happens if we want to add a point to iteslef?  We can't really draw a line between a point and itself, so we slightly modify the above operation.

<div class="ec-big-container plot-container">
  <div id="ec-double" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>To double a point (2 * <span class="point-a">Point A</span>, which is equivalent to <span class="point-a">Point A</span> + <span class="point-a">Point A</span>)
    <ol>
      <li>Draw a line tangent to the elliptic curve through <span class="point-a">Point A</span></li>
      <li>This line always intersects the elliptic curve at a 2nd point.</li>
      <li>Reflect the the observed intersection point over the x axis to get <span class="sum">2 * Point A</span></li>
    </ol>
    </p>
    <div class="ec-formula">
      2 * <span class="point-a point-a-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span>
    </div>
    <p>The graph is interactive, click on the curve to compute a different double.</p>
  </div>
</div>

The Key to Elliptic Curves

To summarize the above, we have operations that let us do the following:
  Point A + Point B = Point C
  2 * Point A = Point D

Let's say we want to figure out 9 * Point A....how might we do that?
  One way to do this:
    2 * Point A  = Point 2A
    Point 2A + Point A  = Point 3A
    Point 3A + Point A  = Point 4A
    Point 4A + Point A  = Point 5A
    Point 5A + Point A  = Point 6A
    Point 6A + Point A  = Point 7A
    Point 7A + Point A  = Point 8A
    Point 8A + Point A  = Point 9A ... our answer.

  An easier way: (called the "divide and conquer method")
    2 * Point A  = Point 2A
    2 * Point 2A = Point 4A
    2 * Point 4A = Point 8A
    Point 8A + Point A = Point 9A ... our answer.

Using the divide and conquer method, we compute the product in only 4 steps, instead of the expected 9.  This trick is really important in making elliptic curve cryptography secure.  Since elliptic curves don't have a divide method, it's *really hard* to determine what factor was used to arrive at a specific point.

  Example:
  Let's say I wish to compute: 314159265 * (0,2)
  Using the divide and conquer method, I perform X operations, and arrive at (X, Y)
  If I tell you the starting point (0,2) and the ending point (X,Y), you would have to perform all 314159265 operations before you know which factor I used in my calculation.

This trick is the basis of the public key pair.

(show public key equation)

My private key is the private factor.
My public key is the private factor * some generator point.

Some intersting things arise from this arrangement:
  - If the private key is very large, it's easy to compute the public key using the divide and conquer method, but very difficult for an attacker to brute force.
  - Unlike the public key, the private key is just a number, so we can perform "normal" math operations on it to build out or digital signature system (we can easily divide, easily multiply, etc.)

A problem

As can be seen in the preceeding calculations, decimals are all over the place.  Computers hate decimal places.  Some decimals are irrational (meaning they go on for ever...like 1.4142135623...), and computers don't have the infinite space require to store all these digits.  They can make approximations, but when rounding produces equations that ask if 5.9999999 = 6, what's the computer to do?  Similarly, computers can't compute on truly gargantuam numbers either (numbers with hundreds of digits are ok, but when numbers have thousands or millions of digits, we run into problems).

The relatively esoteric mathematic concepts of "finite fields" and "modular arithmetic" help us solve these problems.  

If you can tell time, you already understand *some* modular arithmetic.  If it's 21:00 (9:00pm), and you must feed your cat in 11 hours, you will be feeding your cat at 8:00; not 32:00.  The clock resets at 24:00 back to 0:00.  We use this same technique (called "taking the modulus") in our elliptic curve equations to prohibit numbers from getting too large; we set an upper limit on how big numbers get and reset them back to 0 when they exceed that limit.

Unfortunately, we still have our decimal problem (21.593 hours + 11 hours is still 8.593 hours).  Observing that the "division" and "square root" operations are the ones which actually cause the decimals; we'll just redefine those operations to give us non-decimal answers!  This sounds a bit like cheating, but because the math works out, it's ok.

The expression "12 mod 9 = 3" means that 12 becomes 3 when our upper limit is 9.

So:

(4 + 7) mod 9 = 2

(4 - 7) mod 9 = 6 (negative numbers "wrap around" the opposite way)

(4 * 7) mod 9 = 1

(4 / 7) mod 9 = ? --- remember, we don't want decimal places

(4 / 7) mod 9 = (4 * 1/7) mod 9

The trick:
7 * 1/7 = 1
(7 * 4) mod 9 = 1

Because division is nothin more than a multiplicative inverse, modular arithmetic lets up replace 1/7 with 4.  Substituting the above equation:
  (4 * 4) mod 9 = 7

Taking a similiar approach with square roots (sqrt(7) mod 9 = 4, because 4^2 mod 9 = 7), we've now have a way to completely eradicate decimals, big numbers, and negative numbers from our calculations; making our computer very happy.

# Elliptic Curves over Finite Fields

An elliptic curve with modulus 29 (upper limit is 29) looks like:

<div class="plot-container">
  <div id="ff-points" class="plot-placeholder" style="width:450px;height:450px"></div>
</div>

Some peculiar things that you might notice:
  - the graph is symmetric about the line x = 14.5.  Like our continuous graphs, each point has a friend on the same x coordinate.
  - Not every x coordinate has a point (look at x = 10....there are no points)

This last property is particularly interesting, and raises the question, how exactly was this graph made?  We start with a point that is known to be in the finite field, on the elliptic curve (0,2), and set that as our generator point.  We then enumerate all multiple of this generator point.
  1 * G = (0, 2)
  2 * G = (6, 17)
  3 * G = (22, 1)
  4 * G = (23, 3)
  5 * G = (2, 8)
  6 * G = (7, 6)
  7 * G = (17, 9)
  8 * G = (21, 3)
  9 * G = (13, 25)
  10 * G = (3, 15)
  11 * G = (19, 22)
  12 * G = (14, 26)
  13 * G = (28, 8)
  14 * G = (8, 17)
  15 * G = (15, 17)
  16 * G = (15, 12)
  17 * G = (8, 12)
  18 * G = (28, 21)
  19 * G = (14, 3)
  20 * G = (19, 7)
  21 * G = (3, 14)
  22 * G = (13, 4)
  23 * G = (21, 26)
  24 * G = (17, 20)
  25 * G = (7, 23)
  26 * G = (2, 21)
  27 * G = (23, 26)
  28 * G = (22, 28)
  29 * G = (6, 12)
  30 * G = (0, 27)
  31 * G = Infinity (remember, if we add 2 points that are on the same x coordinate, we get infinity)

This then cycles back around: 32 * G = 1 * G = (0,2), 33 * G = 2 * G = (6, 17), etc.

We're only able to do this because we have a very small number of elements.  When using a much bigger modulus, creating a "full graph" of all points is impossible.

To demonstrate that we can still perform our elliptic curve functions on a finite field, we have point doubling:

<div class="ec-big-container plot-container">
  <div id="ff-double" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>To double a point (2 * <span class="point-a">Point A</span>, which is equivalent to <span class="point-a">Point A</span> + <span class="point-a">Point A</span>)
    <ol>
      <li>Draw a line tangent to the elliptic curve through <span class="point-a">Point A</span></li>
      <li>This line always intersects the elliptic curve at a 2nd point.</li>
      <li>Reflect the the observed intersection point over the x axis to get <span class="sum">2 * Point A</span></li>
    </ol>
    </p>
    <div class="ec-formula">
      2 * <span class="point-a point-a-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span>
    </div>
    <p>The graph is interactive, click on the curve to compute a different double.</p>
  </div>
</div>

Unlike 

// TODO include equations after graphs
// small note on inifinity in group addition
// describe ecc over finite fields
// describe the digital signature algorithm

