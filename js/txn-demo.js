// TODO generate address automatically (to prevent address reuse)
var addressCreatedTimer;
var key;
var has_ws=0;

app.controller('TxnBuilder', function($scope, $timeout, $http, $q) {
  var key;
  $scope.key = {};
  $scope.spend = {};
  $scope.change = {};

  $scope.spend.recipient = "1rforkNZxTNDejYtWMY2DEyFTvg8vgK1K";

  //generateKey(Math.random().toString(36).substring(2));
  setKey(bitcoin.ECKey.fromWIF("L2WmFR8WMr5GSprjt7UTA7WQ23WDEZPVRimrZv1dmz7e4JzxqSNq"));

  var utxo = new Transaction("b138360800cdc72248c3ca8dfd06de85913d1aac7f41b4fa54eb1f5a4a379081");
  utxo.hex = "0100000001f3f6a909f8521adb57d898d2985834e632374e770fd9e2b98656f1bf1fdfd427010000006b48304502203a776322ebf8eb8b58cc6ced4f2574f4c73aa664edce0b0022690f2f6f47c521022100b82353305988cb0ebd443089a173ceec93fe4dbfe98d74419ecc84a6a698e31d012103c5c1bc61f60ce3d6223a63cedbece03b12ef9f0068f2f3c4a7e7f06c523c3664ffffffff0260e31600000000001976a914977ae6e32349b99b72196cb62b5ef37329ed81b488ac063d1000000000001976a914f76bc4190f3d8e2315e5c11c59cfc8be9df747e388ac00000000";
  utxo.processData(utxo.hex);
  $scope.utxo = utxo;
  $scope.output = utxo.getOutputForAddress($scope.key.addr);
  $scope.spender = 60;

  // switches from big->little endian and little-> big endian
  function endianSwitch (hex) {
    // hex must have even number length
    if (hex.length % 2 !== 0) {
      hex = "0" + hex;
    }
    hx = new PopString(hex);
    arr = [];
    while (hx.length() > 0) {
      arr.unshift(hx.pop(2)); 
    }
    return arr.join("");
  }

  function PopString (_str) {
    this.str = _str;
    this.pop = function (num) {
      var tmp = this.str.slice(0, num);
      this.str = this.str.slice(num);
      return tmp; 
    }

    this.length = function (){
      return this.str.length;
    }
  }


  function setKey (key) {
    $scope.key.key = key;
    $scope.key.priv = key.d.toString(16);
    $scope.key.pub = key.pub.toHex();  
    $scope.key.addr = key.pub.getAddress().toString();
    $scope.key.addr_dec = bitcoin.base58check.decode($scope.key.addr).toString('hex').substr(2);
  }

  //function startWebsocket(address) {
    //var conn = new WebSocket("wss://ws.chain.com/v2/notifications");
    //conn.onopen = function (ev) {
      //var req = {type: "new-transaction", block_chain: "testnet3"};
      //conn.send(JSON.stringify(req));
    //};
    //conn.onmessage = function (ev) {
      //var x = JSON.parse(ev.data);
      //console.log(x);
      //if (x.payload.transaction.outputs) {
        //for (var i = 0, l = x.payload.transaction.outputs.length; i < l; i ++) {
          //var v = x.payload.transaction.outputs[i];
          ////console.log(v);
          //if (v.addresses) {
            //for (var j = 0, k = v.addresses.length; j < k; j ++) {
              //var a = v.addresses[j];
              //if (a === address) {
                //console.log("Transaction found: " + v.transaction_hash);
                //conn.close();
                //var utxo = new Transaction(v.transaction_hash);
                //utxo.getData().then(function() {
                  //$scope.utxo = utxo;
                  //$scope.output = utxo.getOutputForAddress($scope.key.addr);
                //});
              //}
            //}
          //}
        //}
      //}
    //};
  //}

  //function sendBtc (amount, addr) {
    //$.post("http://faucet.xeno-genesis.com/request", { address: addr, amount: amount }, function() {
      //console.log(arguments);
    //});
  //}

  // Txn Format
  // ===
  // version - 4 bytes
  // input count - 1 byte (usually, actually varInt)
  // inputs - (each input has below format)
  //  txn hash - 32 bytes
  //  output index - 4 bytes
  //  unlocking script size - 1 byte (usually)
  //  unlocking script - defined above
  //  sequence - 4 bytes
  // output count - 1 byte (usually, actually varInt
  // outputs - (each output has below format)
  //  amount (in satoshis) - 8 bytes
  //  locking script size - 1 byte (usually)
  //  locking script - defined above
  // locktime - 4 bytes
  function Transaction (hash) {

    this.hash = hash; 

    this.getData = function() {
      var that = this;
      return $q(function(resolve, reject) {
        $http.get("https://testnet3.toshi.io/api/v0/transactions/" + that.hash + ".hex").success(function(hex) {
        //$http.get("/assets/data/" + that.hash + ".hex").success(function(hex) {
          that.hex = hex;
        }).then(function() {
          that.processData(that.hex);
          resolve();
        });
      });
    }

    this.getOutputForAddress = function (addr) {
      var dec = bitcoin.base58check.decode(addr).toString('hex').substr(2);
      for (var i = 0, l = this.outputs.length; i < l; i ++) {
        var v = this.outputs[i];
        if (v.script.indexOf(dec) !== -1) {
          v.hash = this.hash;
          v.index = i;
          return v;
        }
      }
      return false;
    }

    this.processData = function (_hex) {
      var hex = new PopString(_hex);

      this.version = hex.pop(8);  // 4 bytes
      this.num_in  = hex.pop(2); // 1 byte (usually)

      this.inputs = [];
      for (var i = 0, l = parseInt(this.num_in); i < l; i ++) {
        var input             = {};
        input.hash        = hex.pop(64);  // 32 bytes
        input.index       = hex.pop(8);  // 4 bytes
        input.script_size = hex.pop(2);  // 1 byte (usually)
        // size of script is variable
        script_size     = parseInt(input.script_size, 16) * 2;
        input.script    = hex.pop(script_size); 
        input.sequence  = hex.pop(8); // 4 bytes

        this.inputs.push(input);
      }

      this.num_out = hex.pop(2); // 1 byte (usually)
      this.outputs = [];
      for (var i = 0, l = parseInt(this.num_out); i < l; i ++) {
        var output = {};
        output.spend = hex.pop(16); // 8 bytes in satoshis
        output.script_size = hex.pop(2); // 1 byte (usually)
        script_size     = parseInt(output.script_size, 16) * 2;
        output.script    = hex.pop(script_size); 

        this.outputs.push(output);
      }

      this.locktime = hex.pop(8); // 4 bytes
    }
  }


  $scope.toBtc = function(satoshi) {
    return parseFloat((satoshi*Math.pow(10, -8)).toPrecision(8));
  };

  //$scope.sendClicked = function(amount, addr) {
    //startWebsocket(addr);
    //sendBtc(amount, addr);
  //};

  $scope.getSatoshi = function(spend) {
    return parseInt(endianSwitch(spend), 16);
  }
  $scope.getSize = function(size) {
    return parseInt(size, 16);
  }
  $scope.sat2Hex = function(sat) {
    var zero = "0000000000000000";
    var a = endianSwitch(sat.toString(16));
    return a + zero.substr(0, 16 - a.length);
  }

  $scope.endianSwitch = function(hex) {
    return endianSwitch(hex);
  }

  $scope.$watch(function() {
    return $scope.spender;
  }, function(val) {
    if (val && $scope.output) {
      val = parseInt(val);
      var total = $scope.getSatoshi($scope.output.spend);
      var spend = parseInt((total * (val / 100)).toPrecision(8));
      if (val === 1) {
        spend = 10000;
      }
      if (spend > total - 20000) {
        spend = total - 20000;
      }
      $scope.spend.amount = spend;
      $scope.change.amount = total - spend - 10000;
      $scope.change.recipient = $scope.key.addr;

      $scope.txn = buildTxn($scope.output, [$scope.spend, $scope.change], $scope.key.key);
    }
  });

  // only works with single input
  function buildTxn(input, outputs, key) {
    var txb = new bitcoin.TransactionBuilder();

    txb.addInput(input.hash, input.index);

    for (var i = 0, l = outputs.length; i < l; i ++) {
      var o = outputs[i];
      txb.addOutput(o.recipient, o.amount);
    }

    txb.sign(0, key);
    var txn = txb.build();
    var a = new Transaction(txn.getHash().toString('hex'));
    a.processData(txn.toHex());
    return a;
  }

});

app.filter('decAddress', function() {
  return function(input) {
    if (input) {
      try {
        return bitcoin.base58check.decode(input).toString('hex').substr(2)
      }
      catch (err) {
        return " ? "; 
      }
    };
    return " ? ";
  };
});

app.directive('showTxnHex', function() {
  return {
    scope: { showTxnHex: '=' },
    link: function (scope, elem, attrs) {
      scope.$watch('showTxnHex', function(txn) {
        if (txn) {
          elem[0].innerHTML = "";
          //elem.text(JSON.stringify(value));
          var $txn_container = $("<span />", { 
            "class":"txndemo-hex-container", 
          });

          if (txn.version) {
            $txn_container.append(
              $("<span />", { 
                "class":"txndemo-hex-version", 
                text: txn.version })
            );
          }
          if (txn.num_in) {
            $txn_container.append(
              $("<span />", { 
                "class":"txndemo-hex-num_in", 
                text: txn.num_in })
            );
          }
          if (txn.inputs) {
            for (var i = 0, l = txn.inputs.length; i < l; i ++) {
              var $input_container = $("<span />", { 
                "class":"txndemo-hex-input-container", 
              });
              var input = txn.inputs[i];
              $input_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-input-hash", 
                  text: input.hash })
              );
              $input_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-input-index", 
                  text: input.index })
              );
              $input_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-input-script_size", 
                  text: input.script_size })
              );
              $input_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-input-script", 
                  text: input.script })
              );
              $input_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-input-sequence", 
                  text: input.sequence })
              );

              $txn_container.append($input_container);
            }
          }

          if (txn.num_out) {
            $txn_container.append(
              $("<span />", { 
                "class":"txndemo-hex-num_out", 
                text: txn.num_out })
            );
          }
          
          if (txn.outputs) {
            for (var i = 0, l = txn.outputs.length; i < l; i ++) {
              var output = txn.outputs[i];
              var $output_container = $("<span />", { 
                "class":"txndemo-hex-output-container", 
              });
              $output_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-output-spend", 
                  text: output.spend })
              );
              $output_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-output-script_size", 
                  text: output.script_size })
              );
              $output_container.append(
                $("<span />", { 
                  "class":"txndemo-hex-output-script", 
                  text: output.script })
              );
              $txn_container.append($output_container);
            }
          }

          if (txn.locktime) {
            $txn_container.append(
              $("<span />", { 
                "class":"txndemo-hex-locktime", 
                text: txn.locktime })
            );
          }

          elem.append($txn_container);

        }
      },true);
    }
  }
});
