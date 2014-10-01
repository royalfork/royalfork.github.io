function init() {
  $("#txndemo-passphrase").on("input", passphraseChanged);
}

function passphraseChanged () {
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
  $("#txndemo-address").text(key.pub.getAddress(bitcoin.networks.testnet).toString());
}

$(document).ready(init);
