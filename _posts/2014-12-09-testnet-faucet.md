---
title: Testnet Faucet API
js: 
  - /js/faucet.js 
css:
  - /css/faucet.css
excerpt: <p>Testnet is an almost-exact clone of bitcoin, except the bitcoins on testnet are valueless (the testnet blockchain resets every once in a while).  It's much smaller than the bitcoin block chain, and allows developers (and beta testers) to test out apps without the risk of losing money if something goes wrong. I've provided an API which lets you transfer testnet bitcoins to an address of your choosing.</p>
image: /assets/imgs/thumbs/faucet.png
---

Testnet is an almost-exact clone of bitcoin, except the bitcoins on testnet are valueless (the testnet blockchain resets every once in a while).  It's much smaller than the bitcoin block chain, and allows developers (and beta testers) to test out apps without the risk of losing money if something goes wrong.  You can read more about testnet [here](https://en.bitcoin.it/wiki/Testnet).

I've provided an API which lets you transfer testnet bitcoins to an address of your choosing.  It's limited by IP address, so you'll need to respect the limits.  For non-developers, the documentation demo below serves as a web-based faucet. If you'd like to donate back to the faucet, send coins to  **motBKJbh4a67dNYeESjkkKbyfArrBwijN2**.  Happy developing :)

### http://faucet.royalforkblog.com

<div ng-controller="FaucetCtrl" class="documentation">
  <div class="resource get">
    / <span class="description">Get current withdrawal limit.</span>
    <div class="content">
      Limits are places on withdrawals.  Each IP may make many withdrawals, but the aggregate amount withdrawn over any time period is limited.  This limit refreshes at regular intervals.
      <div class="responses">
        <h4>Response Messages</h4>
        <table>
          <thead>
            <tr>
              <th class="code">HTTP Status Code</th>
              <th class="type">Data Type</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>200</td>
              <td>application/json</td>
              <td><pre>{ "ip" : "127.0.0.1", "limit": "10000000" }</pre></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Demo button -->
      <div class="demo-btn" ng-class="{ 'pending' : demoGetResp === -1 }">
        <input type="submit" class="btn" value="Demo" ng-click="demoGet()" />
        <a ng-show="demoGetResp && demoGetResp !== -1" 
          href="" ng-click="demoGetResp = undefined">Hide</a>
      </div>

      <!-- Demo Response -->
      <div ng-show="demoGetResp && demoGetResp !== -1">
        <h4>Request URL</h4>
        <pre>`` demoGetResp.url ``</pre>
        <h4>Response Code</h4>
        <pre>`` demoGetResp.code ``</pre>
        <h4>Response Data</h4>
        <pre>`` demoGetResp.resp ``</pre>
      </div>

    </div>
  </div>

  <div class="resource postReq">
    / <span class="description">Make withdrawal.</span>
    <div class="content">
      Limits are places on withdrawals.  Each IP may make many withdrawals, but the aggregate amount withdrawn over any time period is limited.  This limit refreshes at regular intervals.
      <div class="parameters">
        <h4>Parameters</h4>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Data Type</th>
              <th>Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>address</td>
              <td>String</td>
              <td><input type="text" name="" id="" placeholder="Required" ng-model="post.address" /></td>
              <td>Transfer bitcoins to this testnet address.</td>
            </tr>
            <tr>
              <td>amount</td>
              <td>Integer</td>
              <td><input type="text" name="" id="" placeholder="Required" ng-model="post.amount" /></td>
              <td>Amount, in Satoshis, of transfer (must be below limit or this will return an error).</td>
            </tr>
          </tbody>
        </table>
        
      </div>
      <div class="responses">
        <h4>Response Messages</h4>
        <table>
          <thead>
            <tr>
              <th class="code">HTTP Status Code</th>
              <th class="type">Data Type</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>200</td>
              <td>application/json</td>
              <td><pre>{ "id" : "Transaction ID", "limit": "9000000" }</pre></td>
            </tr>
            <tr>
              <td>403</td>
              <td>application/json</td>
              <td><pre>{ "error" : "Request exceeds limit", "limit": "10000000" }</pre></td>
            </tr>
            <tr>
              <td>406</td>
              <td>application/json</td>
              <td><pre>{ "error" : "Missing required parameters" }</pre></td>
            </tr>
            <tr>
              <td>422</td>
              <td>application/json</td>
              <td><pre>{ "error" : "Bitcoin error message" }</pre></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Demo button -->
      <div class="demo-btn" ng-class="{ 'pending' : demoPostResp === -1 }">
        <input type="submit" class="btn" value="Demo" ng-click="demoPost()" />
        <a ng-show="demoPostResp && demoPostResp !== -1" 
          href="" ng-click="demoPostResp = undefined">Hide</a>
      </div>

      <!-- Demo Response -->
      <div ng-show="demoPostResp && demoPostResp !== -1">
        <h4>Request URL</h4>
        <pre>`` demoPostResp.url ``</pre>
        <h4>Response Code</h4>
        <pre>`` demoPostResp.code ``</pre>
        <h4>Response Data</h4>
        <pre>`` demoPostResp.resp | json ``</pre>
      </div>
    </div>
  </div>
  
</div>


The faucet itself is written in node.js, and the code is available at [https://github.com/royalfork/testnet-faucet](https://github.com/royalfork/testnet-faucet).
