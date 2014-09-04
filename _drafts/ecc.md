---
title: Layman's Guide to Elliptic Curve Digital Signatures
js: 
  - /js/ecc-guide.js
  - /js/jquery.flot.js
css:
  - /css/ecc-guide.css
---

In preparation for this post, I've read several research papers, a book, listened to 4 university lectures, idled away hours on IRC, developed elliptic curve libraries in 2 seperate languages, and built my own elliptic curve graphing framework.  Elliptic curve cryuptography is hard.  As one of the fundamental crypto systems making Bitcoin a "crypto"-currency, I really wanted to understand the underlying technical aspects which make this form of cryptography secure.  This post is an attempt to demystify the elliptic curve digital signing algorithm which underlies bitcoin's psuedoanonymous identity system.

# Explain like I'm young but just a little older than 5

Imagine a classroom of elementary school children who know multiplication but have not yet learned division.  At the beginning of the year, the teacher proclaims "My special number is 5".  One morning, the message "Twas always thus and always thus will be" -- signed "Teacher - 8" appears on the chalkboard.  How do the students know this message came from the teacher and not some movie-quote-loving fraudster?  They multiply the teacher's "special number" - 5 - by the "signature number" - 8 - and if they get the number of characters in the message (40 character message), they deem the signature valid, and are confidant that the message did indeed come from the teacher.  Oblivious to the magic of division, students are unable to produce a valid signature for any arbitrary message, and because the signature is based on the length of the message, the students can't serruptitously change the message. 

This is how the elliptic curve digital signature algorithm works; the "knower" of the private key is endowed with the power of division, while public key holders can only use multiplication to check whether signaturees are valid.

# Why does Bitcoin need digital signatures?

Alice sends 2 bitcoins to Bob's public bitcoin address (1Bob4ddr355).  If Bob sends these 2 bitcoins to Charley (1CharAdresS), he broadcasts a message stating "1Bob4ddr355 sends 2 BTC to 1CharAddreS".  The Bitcoin system must ensure that Bob and only Bob can broadcast this message; if anyone else is able to broadcast this message, or alter it in anyway, Bitcoin breaks irreparably.

# Public Key Cryptography to the Rescue

Bob needs:

*  a private key - sequence of numbers that only Bob knows
*  a public key - another sequence of numbers that Bob can share with anyone
*  a message to be signed

A digital signature system must have the following algorithms:

* To sign:
  * <span style="color:#a12">"This is a message"</span> + <span style="color:#15a">Private Key<sub>Bob</sub></span> = <span style="color:#629">Signature<sub>&nbsp;"This is a message", Bob</sub></span>

* To verify:
  * <span style="color:#a12">"This is a message"</span> + <span style="color:#629">Signature<sub>&nbsp;"This is a message", Bob</sub></span> + <span style="color:#59d">Public Key<sub>Bob</sub></span> = <span style="color:green">True</span>
  * <span style="color:red">"Another message"</span> + <span style="color:#629">Signature<sub>&nbsp;"This is a message", Bob</sub></span> + <span style="color:#59d">Public Key<sub>Bob</sub></span> = <span style="color:red">False</span>
  * <span style="color:#a12">"This is a message"</span> + <span style="color:red">Signature<sub>&nbsp;"This is a message", Chuck</sub></span> + <span style="color:#59d">Public Key<sub>Bob</sub></span> = <span style="color:red">False</span>
  * <span style="color:#a12">"This is a message"</span> + <span style="color:red">Signature<sub>&nbsp;"Another message", Bob</sub></span> + <span style="color:#59d">Public Key<sub>Bob</sub></span> = <span style="color:red">False</span>
  * <span style="color:#a12">"This is a message"</span> + <span style="color:#629">Signature<sub>&nbsp;"This is a message", Bob</sub></span> + <span style="color:red">Public Key<sub>Chuck</sub></span> = <span style="color:red">False</span>

Because it's impossible to create <span style="color:#629">Signature<sub>&nbsp;"This is a message", Bob</sub></span> without Bob's private key, we can be certain that Bob and only Bob digitally signed a message when his public key verifies a signature.

Several mathematical techniques can be used to build such a system, but the current "cutting edge" technology in terms of efficiency and security is elliptic curve cryptography.

# What are Elliptic Curves?

Not to be confused with an "ellipse," elliptic curves look like:


<div class="ec-big-container plot-container">
  <div id="empty-ec" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>The general equation for elliptic curves is:
    $$y^2 = x^3 + a*x + b$$
    </p>

    <p style="margin-top: 20px">This specific elliptic curve has equation:
    $$y^2 = x^3 - 3*x + 4$$
    </p>

    <p style="margin-top: 20px">All elliptic curves are symmetric about the x-axis.</p>
  </div>
</div>

We need the ability to add 2 points on this curve; which works as follows.

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
    <p><i>This graph is interactive, click on the curve to compute different sums.</i></p>
  </div>
</div>

What happens if we want to add a point to itself?  We can't draw a line between a point and itself, so we slightly modify the above operation.

<div class="ec-big-container plot-container">
  <div id="ec-double" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>To double a point (<span class="point-a">Point A</span> + <span class="point-a">Point A</span>)
    <ol>
      <li>Draw a line tangent to the elliptic curve through <span class="point-a">Point A</span></li>
      <li>This line always intersects the elliptic curve at a 2nd point.</li>
      <li>Reflect the the observed intersection point over the x axis to get <span class="sum">2 * Point A</span></li>
    </ol>
    </p>
    <div class="ec-formula">
      2 * <span class="point-a point-a-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-double">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span>
    </div>
    <p><i>The graph is interactive, click on the curve to compute a different double.</i></p>
  </div>
</div>

Using a bit of algebra and calculus, we can derive the following equations to easily add or double points without the necessity of graphs. The equations themselves aren't very interesting, they merely serve to show that point addition and doubling are trivial computational problems.

<div class="ec-equations">
  <p>Given $(x_1, y_1), (x_2, y_2)$: to find $(x_3, y_3) = (x_1, y_1) + (x_2, y_2)$</p>
  <div style="margin-left: 60px">
    <div style="display:inline-block">
      <p>
        $x_3 = s^2 - x_1 - x_2$
      </p>
      <p>$y_3 = s(x_1 - x_3) - y_1$</p>
    </div>

    <div style="display:inline-block;margin:20px 40px">
      $$s =
      \begin{cases}
      \frac {y_2 - y_1}{x_2 - x_1},  & \text{if $(x_1, y_1) \neq (x_2, y_2)$} \\
      \frac {3x^2 + a}{2y_1}, & \text{if $(x_1, y_1) = (x_2, y_2)$}
      \end{cases}$$
    </div>
  </div>
</div>

This gives us the following general equations:

<div class="ec-equations">
  $$\text {Point A} + \text {Point B} = \text {Point C}$$
  $$2 * \text {Point A} = \text {Point 2A}$$
  <p>Because multiplication is just addition many times, we also have multiplication:</p>
  $$\text {Point A} + \text {Point A} + \cdots + \text {Point A} = N * \text {Point A}$$ 
  $$N * \text {Point A} = \text {Point NA}$$
</div>

Let's say we want to figure out "9 * Point A"....how might we do that?

One way to do this:

<ul class="no-list">
  <li>2 * Point A  = Point 2A</li>
  <li>Point 2A + Point A  = Point 3A</li>
  <li>Point 3A + Point A  = Point 4A</li>
  <li>Point 4A + Point A  = Point 5A</li>
  <li>Point 5A + Point A  = Point 6A</li>
  <li>Point 6A + Point A  = Point 7A</li>
  <li>Point 7A + Point A  = Point 8A</li>
  <li>Point 8A + Point A  = Point 9A ... our answer.</li>
</ul>

An easier way: (called the "divide and conquer method")

<ul class="no-list">
  <li>2 * Point A  = Point 2A</li>
  <li>2 * Point 2A = Point 4A</li>
  <li>2 * Point 4A = Point 8A</li>
  <li>Point 8A + Point A = Point 9A ... our answer.</li>
</ul>

Using the divide and conquer method, we compute the product in only 4 steps, instead of 9.  As the multiplier gets bigger and bigger, the time saved using the divide and conquer method increases.  This trick is very important in making elliptic curve cryptography actually work. and is the basis of the public key pair (more on that later).

# A problem

Computers hate decimal places, and the preceeding equations produce numbers with decimals.  Some decimals are irrational (they go on for ever...like 1.4142135623...), and computers don't have the infinite space required to store all these digits.  They can make approximations, but when rounding produces equations that ask if 5.9999999 = 6, what's the computer to do?

The relatively esoteric mathematic concepts of "finite fields" and "modular arithmetic" help us solve this problem.

If you can tell time, you already understand *some* modular arithmetic.  If it's 21:00 (9:00pm), and you must wake up for work in 11 hours, you will set your alarm for 8:00; not 32:00.  The clock resets at 24:00 and we continue counting from 0:00.  This concept, known as "taking the modulus", lets us transform fractions and decimals into whole numbers.


<div class="ec-equations">
  <p>If our modulus is 13 (upper limit is 13), and we wish to transform $\color {#a12}{\frac {1}{7}}$:</p>
  $$\begin{align}
  7 * \color {#a12}{\frac {1}{7}} &= 1 \\
  7 * \color {#a12}{2} \text { mod 13} &= 1 \\ 
  \end{align}$$
  <p>Because these equations both equal 1, we can substitute the fraction $\color {#a12}{\frac {1}{7}}$ with the integer $\color {#a12}{2}$ when operating within a finite field.</p>
</div>

This technique of transforming fractions into integers is used to eliminate all decimals from the above mathematical equations, making our computer very happy.

# Elliptic Curves over Finite Fields

When translating our beloved elliptic curves onto finite fields, graphing all points on the curve becomes a difficult problem. In order to enumerate all points, we add an initial point, called the "generator point" to itself many times. 

An elliptic curve with modulus 29 (upper limit is 29) looks like:

<div class="ec-big-container plot-container">
  <div id="ff-points" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <input type="button" id="generateFFPoints" class="btn btn-default" style="margin-left:25px" value="Generate Points" onclick="generateFFPoints()"/>
    <input type="button" id="clearFFPoints" disabled="true" class="btn btn-default" style="float:right;margin-right:25px" value="Clear Graph" onclick="resetFFPoints()"/>
    <p style="border-bottom:1px solid black; margin: 10px 0">Generated Points</p>
    <div style="display: inline-block; vertical-align: top">
      <ul id="generatedPts0" class="generatedPointColumn"></ul>
    </div>
    <div style="display: inline-block; vertical-align: top">
      <ul id="generatedPts1" class="generatedPointColumn"></ul>
    </div>
    <div style="display: inline-block; vertical-align: top">
      <ul id="generatedPts2" class="generatedPointColumn"></ul>
    </div>
  </div>
</div>

Some peculiar things that you might notice:

* Graph is symmetric about the line x = 14.5.  Like our continuous graphs, each point has a complement on the same x coordinate.
* Not every x coordinate has a point (look at x = 10....there are no points)

We're only able to show all points because the modulus is very small.  When using a much bigger modulus, such as the one bitcoin uses, creating a "full graph" of all points is impossible.

Using our trusty equations from above and a convoluted graphing system which wraps around the axes, we can see that our point doubling operator still works properly.  We can also verify the calculations with the generated points above.

<div class="ec-big-container plot-container">
  <div id="ff-double" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <div class="ec-formula">
      2 * <span class="point-a point-a-ffdouble">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-ffdouble">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span>
    </div>
    <p style="font-family:MathJax_Main;font-size:22px"><span class="point-a point-a-ffdouble">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="point-a point-a-ffdouble-multiplier"></span> * G</p>
    <p style="font-family:MathJax_Main;font-size:22px"><span class="sum sum-ffdouble">(&nbsp;&nbsp;,&nbsp;&nbsp;)</span> = <span class="sum sum-ffdouble-multiplier"></span> * G</p>
    <p style="margin-top:10px;font-family:MathJax_Main;font-size:22px"><span class="sum sum-ffdouble-multiplier"></span> = 2 * <span class="point-a point-a-ffdouble-multiplier"></span> mod 31</p>
    
    <p style="margin-top:20px"><i>The graph is interactive, click on any point to compute it's double.</i></p>
  </div>
</div>

# The Key to Elliptic Curves

We're now ready to discuss public and private keys:

<div class="ec-equations">
  $$\color {#15a} {\text {Private Key}} * G = \color {#59d} {\text {(Public Key)}}$$
  <div style="margin:10px">
    <p><b style="color: #15a">Private key</b> is the generator multiplier (an integer).</p>
    <p><b>G</b> is the generator point, it is publicly known and is the same for everyone.</p> 
    <p><b style="color: #59d">Public key</b> is the point generated by the private key.</p> 
  </div>
</div>

Some intersting things arise from this arrangement:

* If the private key is very large, it's easy to compute the public key using the divide and conquer method, but very difficult for an attacker to brute force.
* Unlike the public key, the private key is just a number.  We're able to perform "normal" math operations on it to build out or digital signature system (we can easily divide, easily multiply, etc.)
* The public key, an elliptic curve point, is restricted to the addition and doubling operations that we've discussed (there is no division of points)

We now have a system fairly similiar to the elementary school classroom scenario above.

# The Digital Signature Algorithm

The signer creates 3 points:

1. <span style="color:#629">Message Point</span>: Convert the message to a number (by taking it's hash), and multiply this number by the generator point  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#629">(Message Point)</span> = <span style="color:#426">Message Hash</span> * G
2. <span style="color:#084">Random Point</span>: We pick a point at random  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#084">(Random Point)</span> = <span style="color:#042">Random Number</span> * G
3. <span style="color:#15a">Random-Public Key Point</span>: We multiply the x-coordinate of the random point by the public key, (remember, the random point's x coordinate is an integer)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#15a">(PK-Random Point)</span> = <span style="color:#084">Random Point X-Coordinate</span> * <span style="color:#147">(Public Key)</span>

The signer then:

* _creates_ a special pathway to the "Random Point" by way of both the "Message Point" and the "PK-Random Point".  We must compute a signature factor such that $$\text {(Signature Factor * Message Point)} + \text {(Signature Factor * Random Public Key Point)} = \text {Random Point}$$
* _gives_ the random point and the signature factor to the verifier, who checks whether the signature factor does work with the signer's public key and the message point to bring us to the random point.

This is secure because:

* Creating a signature factor that verifies against a given public key is impossible to create without the knowledge of the public key's generator.
* The signature factor is also used in conjunction with the message hash, so if the message ever changes, the signature factor will no longer be useful in recreating the "pathway" to the given random point.  As stated above, creating a new signature factor to work with a modified message is out of the question.

// TODO make colors for signature create equation, and put in equation box
// TODO firefox performance

Hopefully the following example can help illuminate this process further.  Notice when the verifier changes parameters, the signature is no longer valid.

<div class="ec-big-container plot-container">
  <h2>The Signer</h2>
  <div id="signature-sign" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>The signer knows:</p>
    <p style="margin-left: 10px;">Generator: <span class="signature-item">1 * G = (0, 2)</span></p>
    <p style="margin-left: 10px;">Private Key: <span class="signature-item"><span style="color: #147">7</span> * G = <span style="color: #147">(17, 9)</span></span></p>
    <p style="margin-left: 10px;">Random Point: <span class="signature-item"><span style="color: #042">9</span> * G = <span style="color: #084">(13, 25)</span></span></p>
    <p style="margin-left: 10px;">Message Hash: <span class="signature-item"><span style="color: #426">14</span></span></p>
    <p style="margin: 10px 0 0 10px;">Signature Factor: $$\color {#a12}{22} = \frac {\color {#426}{14} + \color {#084}{13} * \color {#147}{7}}{\color {#042}{9}}\text{ mod 31}$$</p>
    <div id="signature-box">
      <h6>The Signature</h6>
      <span style="color:#a12">22</span>,  <span style="color:#084">13</span>
    </div>
  </div>
  <h2>The Verifier</h2>
  <div id="signature-verify" class="plot-placeholder" style="width:450px;height:450px"></div>
  <div class="ec-info">
    <p>The verifier knows:</p>
    <p style="margin-left: 10px;">Generator: <span class="signature-item">1 * G = (0, 2)</span></p>
    <p class="sig-verify-pk" style="margin-left: 10px;">Public Key: 
      <select id="sig-verify-pk">
        <option value="7">(17, 9)</option>
        <option value="1">(0, 2)</option>
        <option value="2">(6, 17)</option>
        <option value="3">(22, 1)</option>
        <option value="4">(23, 3)</option>
        <option value="5">(2, 8)</option>
        <option value="6">(7, 6)</option>
        <option value="8">(21, 3)</option>
        <option value="9">(13, 25)</option>
        <option value="10">(3, 15)</option>
        <option value="11">(19, 22)</option>
        <option value="12">(14, 26)</option>
        <option value="13">(28, 8)</option>
        <option value="14">(8, 17)</option>
        <option value="15">(15, 17)</option>
        <option value="16">(15, 12)</option>
        <option value="17">(8, 12)</option>
        <option value="18">(28, 21)</option>
        <option value="19">(14, 3)</option>
        <option value="20">(19, 7)</option>
        <option value="21">(3, 14)</option>
        <option value="22">(13, 4)</option>
        <option value="23">(21, 26)</option>
        <option value="24">(17, 20)</option>
        <option value="25">(7, 23)</option>
        <option value="26">(2, 21)</option>
        <option value="27">(23, 26)</option>
        <option value="28">(22, 28)</option>
        <option value="29">(6, 12)</option>
        <option value="30">(0, 27)</option>
      </select>
    </p>
    <p class="sig-verify-sigf" style="margin-left: 10px;">Signature Factor: 
      <select id="sig-verify-sigf">
        <option value="22">22</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
        <option value="13">13</option>
        <option value="14">14</option>
        <option value="15">15</option>
        <option value="16">16</option>
        <option value="17">17</option>
        <option value="18">18</option>
        <option value="19">19</option>
        <option value="20">20</option>
        <option value="21">21</option>
        <option value="23">23</option>
        <option value="24">24</option>
        <option value="25">25</option>
        <option value="26">26</option>
        <option value="27">27</option>
        <option value="28">28</option>
        <option value="29">29</option>
        <option value="30">30</option>
      </select>
    </p>
    <p class="sig-verify-msgh" style="margin-left: 10px;">Message Hash: 
      <select id="sig-verify-msgh">
        <option value="14">14</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
        <option value="13">13</option>
        <option value="15">15</option>
        <option value="16">16</option>
        <option value="17">17</option>
        <option value="18">18</option>
        <option value="19">19</option>
        <option value="20">20</option>
        <option value="21">21</option>
        <option value="22">22</option>
        <option value="23">23</option>
        <option value="24">24</option>
        <option value="25">25</option>
        <option value="26">26</option>
        <option value="27">27</option>
        <option value="28">28</option>
        <option value="29">29</option>
        <option value="30">30</option>
      </select>
    </p>
    <p id="sig-v-msg-verification" style="margin-left: 10px;">Message Verification Point: $$ \color {#629}{(2, 21)} = \frac {\color {#426}{14}}{\color {#a12}{22}}\text{ mod 31  } * (0,2)  $$</p>
    <p id="sig-v-pk-verification" style="margin-left: 10px;">Public Key Verification Point: $$ \color {#15a}{(8, 17)} = \frac {\color {#084}{13}}{\color {#a12}{22}}\text{ mod 31  } * \color {#147}{(17, 9)}$$</p>
    <p id="sig-v-verification" style="margin-left: 10px;">Verification Point: $$ \color {#629}{(2, 21)} + \color {#15a}{(8, 17)} = \color {#084}{(13, 25)}$$</p>
    <p class="verification-text" style="color:#084">The verification point equals the signer's random point.  This signature is valid.</p> 


  </div>
</div>

# Bitcoin Numbers

To ground all this in reality, here are some real numbers taken directly from bitcoin itself (bitcoin uses the sicp256k1 curve; this curve defines the curve parameters and generator).

<b>Generator Point</b>: Remember, this is the same for everyone.  All other points are children of this base point.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x: 55066263022277343669578718895168534326250603453777594175500187360389116729240 (10^76)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y: 32670510020758816978083085130507043184471273380659243275938904335757337482424 (10^76)

<b>Order</b>: The number of possible points on the curve. There's a nifty formula which calculates this (I have no idea why it works, but it does)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;115792089237316195423570985008687907852837564279074904382605163141518161494337 (10^77)

<b>Private Key</b>:   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;23695310554196047209792918797392416191148132060917476866274911959533140016553

<b>Public Key</b>:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x: 39874617776630327813190058413816560767734954098998567043224950074533143699292  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y: 83115399533222200534442050051826386603242609920409430626876080623730665355556

<b>Signature</b>:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;r: 25282362915497655056329512917121654088602539327808216077267936411779996643728  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;s: 39257440409490934652644589859771879805788241064351461738307073788061051966857

These are truly gargantuan numbers - the number of possible points on the elliptic curve is fairly close to the number of atoms in the observable universe.  A human body contains 7,000,000,000,000,000,000,000,000,000 atoms.  Think about how insignificant in size we are compared to the entire earth, which is insignificant compared to the sun, which is only 1 of hundreds of billions in a single galaxy, which is still only of a hundred billion galaxies in the observable universe.  Computers are fast, but not fast enough to visit even a small fraction of those points on a curve trying to guess at a public key's generator.  It's just impossible.  It's amazing that such security is possible os quickly and accessibly (a phone can do these calculations in fractions of a second); full acollades go out to the brilliant cryptographers, mathematicians, and computer scientists which made all of this possible.

Special Thanks to the following resources which helped me out:
  - Cristof Paar
  - Elliptic Curves Number theory and cryptography - Lawrence Washington
  - University links
  - Flot
  - ECDSA Gem


// highlight KEY IDEAS:
  // - an elliptic curve is nothing more than: Point = Multiplier * Public Generator Point
  // - private key is multiplier, public key is point
  // - given the point, it's impossible to get the multiplier
  // - can do addition, subtraction, multiplication, and division with the multiplier (private key); can only do addition and multiplication with the point (public key)
  // - creating a signature requires division (needs the private key), but verifying the signature only needs addition and multiplication (public key)


