var addressCreatedTimer;

function init() {
  $("#txndemo-passphrase").on("input", passphraseChanged);
  //pollTxn("mme39AFcEEebURkLvQ7qSFJbcYwyiAhZ4s");
  //pollTxn("miPwrTQe9zrFy1htLuXbXb7pMoj3rqcW8K");
  pollTxn("n4fQySDDKNxKxf4anvMBwFTdodL2YEf9m2");
}

function passphraseChanged () {
  // we want to know when the user has finished selecting an address, so we can start polling webbtc for a transaction.
  clearTimeout(addressCreatedTimer);

  var val = $("#txndemo-passphrase").val();

  if (val === ""){
    $("#txndemo-priv-key").text("N/A");
    $("#txndemo-address").text("N/A");
    return; 
  }

  // change phrase into private key
  var priv = bitcoin.crypto.sha256(val);
  $("#txndemo-priv-key").text(priv.toString("hex"));

  // change address
  key = bitcoin.ECKey.fromBuffer(priv);
  address = key.pub.getAddress(bitcoin.networks.testnet).toString();
  $("#txndemo-address").text(address);

  addressCreatedTimer = setTimeout(function () { 
    $("#txndemo-passphrase").prop('disabled', true);
    pollTxn(address);
  }, 3000);
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

function endianSwitch (hex) {
  // switches from big->little endian and little-> big endian
  debugger;
  hx = new PopString(hex);
  arr = [];
  while (hx.length() > 0) {
    arr.unshift(hx.pop(2)); 
  }
  return arr.join("");
}

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
function processTxn (data) {
  hex = new PopString(data);

  var txn = {};
  txn.version = hex.pop(8);  // 4 bytes
  txn.num_in  = hex.pop(2); // 1 byte (usually)

  txn.inputs = [];
  for (var i = 0, l = parseInt(txn.num_in); i < l; i ++) {
    var input             = {};
    input.hash        = hex.pop(64);  // 32 bytes
    input.index       = hex.pop(8);  // 4 bytes
    input.script_size = hex.pop(2);  // 1 byte (usually)
    // size of script is variable
    script_size     = parseInt(input.script_size, 16) * 2;
    input.script    = hex.pop(script_size); 
    input.sequence  = hex.pop(8); // 4 bytes

    txn.inputs.push(input);
  }

  txn.num_out = hex.pop(2); // 1 byte (usually)
  txn.outputs = [];
  for (var i = 0, l = parseInt(txn.num_out); i < l; i ++) {
    var output = {};
    output.spend = hex.pop(16); // 8 bytes in satoshis
    output.script_size = hex.pop(2); // 1 byte (usually)
    script_size     = parseInt(output.script_size, 16) * 2;
    output.script    = hex.pop(script_size); 

    txn.outputs.push(output);
  }

  txn.locktime = hex.pop(8); // 4 bytes
}



var timesPolled = {
  current: 0,
  max: 7
};

function pollTxn (addr) {
  //var url = "https://api.chain.com/v1/testnet3/addresses/"+addr+"/transactions?api-key-id=DEMO-4a5e1e4";
  var url = "http://localhost:4000/js/test/resp.json";
  var hex = "http://localhost:4000/js/test/hex";
  //var url2 = "https://bitcoin.toshi.io/api/v0/transactions/58978e746055095a172a85f4563ff89269d66323e5460d1a8b6a9139f90b50e5";
  var jqxhr = $.ajax(hex)
    .done(function(data) {
      if (timesPolled.currnet > timesPolled.max) {
        return console.log("There was a problem with the polling");
      } else if (data.length === 0 ) {
        timesPolled.current++;
        setTimeout(function () {
          pollTxn(addr);
        }, 3000);
      } else {
        processTxn(data);
      }
    })
    .fail(function() {
      console.log( "error" );
    });
    //.always(function() {
      //console.log( "complete" );
    //});
}

$(document).ready(init);
