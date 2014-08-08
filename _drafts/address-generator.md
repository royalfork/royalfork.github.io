---
title: Address Generator
js: 
  - /js/btc.min.js
  - /js/wallet-gen.js 
css: 
  - /css/wallet-gen.css
---

<div class="private">
<h2 class="section-header">Generate Private Key</h2>
<div class="private-key">
  <div class="container">
    <input id="passphrase" type="text" name="passphrase" placeholder="Type passphrase here...">
    <div>
      <img src="/assets/imgs/wallet-gen/sha-expand.svg" />
    </div>
    <div class="hex-container hex-padding pk"></div>
    <div class="information information-arrow-left-bottom step1"><span class="title">1.</span> Private key is 256 random bits.</div>
  </div>
</div>

<div class="wif-container">
  <div>
    <div class="container">
      <div class="hex-container">
        <div class="version hex-left">80</div>
        <div class="pk hex-middle"></div>
        <div class="compression-flag hex-middle">01</div>
        <div class="checksum-pk checksum hex-right"></div>
      </div>
      <div class="information step2 information-arrow-bottom-left"><span class="title">2.</span> Prepend version number.</div>
      <div class="information step3 information-arrow-bottom-right"><span class="title">3.</span> Append compression flag.</div>
      <div class="information step4 information-arrow-bottom-left"><span class="title">4.</span> Append checksum. Checksum is the first 4 bytes of double sha256 hash of whatever is being checkedsum'ed.</div>
    </div>
  </div>

  <div>
    <div class="container">
      <img src="/assets/imgs/wallet-gen/base58-wif.svg" />
      <div>
        <div class="private-wif hex-container hex-padding"></div>
      </div>
      <div class="information information-arrow-left-top step5"><span class="title">5.</span> Base58 encoded data is easier to read and manage.  The "double-arrows" indicate this is reversible.</div>
    </div>
  </div>
</div>
</div>

<div class="public">
<h2 class="section-header">Generate Public Key</h2>
<div class="public-equation">
  <div class="pub-key-label">k</div> = <span class="hex-container hex-padding pk"></span> * 
  <img src="/assets/imgs/wallet-gen/elliptic-curve.gif" />
  <div class="information information-arrow-left-top step6"><span class="title">6.</span> Multiply the private key by the elliptic curve generator point to get the public key.  The public key is a point on the elliptic curve and has x and y coordinates.
  </div>
</div>

<div>
  <div class="container">
    <img class="public-key-split" src="/assets/imgs/wallet-gen/public-graphic.svg" />
    <div class="public-coords">
      <div class="public-coord-x">
        x = <span class="hex-container hex-padding public-x"></span>
      </div>
      <div class="public-coord-y">
        y = <span class="hex-container hex-padding public-y"></span><span class="public-y-even-odd"></span>
      </div>
    </div>
  </div>
</div>

<div class="public-key">
<div>
  <div>

    <svg id="parity-arrow" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
       width="573.125px" height="33px" viewBox="0 0 573.125 33" enable-background="new 0 0 573.125 33" xml:space="preserve">
    <line fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="570.125" y1="3" x2="570.125" y2="18"/>
    <line fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="570.125" y1="18" x2="5.125" y2="18"/>
    <g>
      <g>
        
          <line fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="5.125" y1="18" x2="5.125" y2="30.714"/>
        <g>
          <polygon points="1.734,26.73 5.125,30.123 8.516,26.73 8.516,29.609 5.125,33 1.734,29.609 			"/>
        </g>
      </g>
    </g>
    </svg>
  </div>
  <div class="hex-container">
    <div class="public-key-x-lead hex-left"></div>
    <div class="public-key-x hex-right"></div>
  </div>

  <div class="information step7"><span class="title">7.</span> Use parity of y coordinate and full x coordinate to represent the public key.</div>
</div>

<div>
  <div class="container">
    <img class="address-hash" src="/assets/imgs/wallet-gen/address-hash.svg" />
    <div class="ripe-hash">
      <div class="ripe160 hex-container hex-padding"></div>
    </div>
    <div class="information step8 information-arrow-left-top"><span class="title">8.</span> Hash public key twice.  This obfuscates the public key and shortens it.</div>
  </div>
</div>
</div>

<div class="public-address-container">
  <div class="container">
    <div class="hex-container">
      <div class="hex-left version">00</div>
      <div class="ripe160 hex-middle"></div>
      <div class="hex-right checksum address-checksum"></div>
    </div>
    <div class="information information-arrow-bottom-middle step9"><span class="title">9.</span> Prepend version (version number is different than in step 2)</div>
    <div class="information information-arrow-bottom-middle step10"><span class="title">10.</span> Append checksum (same method as step 4)</div>
  </div>
  <div>
    <div class="container">
      <img src="/assets/imgs/wallet-gen/base58-address.svg" />
      <div>
        <div class="hex-container hex-padding public-address"></div>
      </div>
      <div class="information information-arrow-left-top step11"><span class="title">11.</span> After another base58 encoding, we have our public address :)</div>
    </div>
  </div>
</div>
</div>
