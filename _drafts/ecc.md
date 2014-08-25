---
title: Layman's Guide to Elliptic Curve Digital Signatures
js: 
  - /js/ecc-guide.js
  - /js/jquery.flot.js
css:
  - /css/ecc-guide.css
---

In preparation for this post, I've read several research papers, a book, listened to 4 university lectures, spent many hours on IRC, developed elliptic curve libraries in 2 seperate languages, and built my own elliptic curve graphing framework in an attempt to understand how elliptic curves actually work.  This stuff is hard to wrap your head around.  But as one of the fundamental crypto systems which makes Bitcoin a "crypto"-currency, I really wanted to understand the underlying techical aspects which make elliptic curve cryptography secure.  In this post, I'll walk you through the big picture concepts I've accumulated throughout my studies; and illuminate some of the "magic" that makes Bitcoin work.

# Intro to Digital Signatures

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

Elliptic Curves

Not to be confused with an "ellipse," elliptic curves look like:

<div class="plot-container">
  <div id="empty-ec" class="plot-placeholder" style="width:450px;height:450px"></div>
</div>

and has equation:

$$y^2 = x^3 + a*x + b$$

Notice that our basic digital signature algorithm requires addition, so we'll need to be able to do addition on the elliptic curve as well.

To add 2 points on the curve, we:

1. draw a line between them
2. Find where the line intersects the curve
3. reflect the intersection over the y axis.

Purists will note that this isn't *really* addition; we've arbitrarily chosen a series of steps and declared this to be addition.  They are right, but these series of steps give us the following properties, which make it a drop in replacement for "real" addition:
	P1 + P2 = P2 + P1
	P1 + (P2 + P3) = (P1 + P2) + P3

Feel free to click on the graph below and it will calculate addition for you.

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

Now that we have addition, we essentially get multiplication for free.  The difference is that with addition, both additives are points, eg: (0,2) + (1,3) = (5,2).  With multiplication, the multiplier is just a regular number.  So, 2 * (0,2) is equivalent to (0,2) + (0,2).  4 * (0,2) is (0,2) + (0,2) + (0,2) + (0,2).  We run into a slight problem when drawing a line between the same point and itself for step one of our addition formula, sp we draw a tangent line instead, and the rest of the procedure remains the same.  We can do this because as 2 point get closer and closer together on a curve, their intersection line gets closer and closer to a tangent line.


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

The great thing about multiplication is that it lets us compute really big 
