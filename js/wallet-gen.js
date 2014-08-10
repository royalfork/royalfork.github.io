var priv_key = "e47eaac6a5e0cb54c4ca0448f9bce8ba48ce3da3b6d998c5f89066db64301616"; 
var thing ="0425009f42704de1327c3290df619a309f7029ec5f39a62f1fc5be3f0c2ed6a5e47dd3ce11e32e027bf18179508d7dffdf00b96f91597097b4bd7125faa68dc845"; 
var zeroes = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

function init() {
  $("#passphrase").on("input", passphraseChanged);
  //passphraseChanged({"currentTarget":{"value":"test"}});
  passphraseChanged();
}

function passphraseChanged (evt) {
  var phraseSHA;
  if (!evt || evt.currentTarget.value === "") {
    phraseSHA = zeroes.substr(0,64);
  } else {
    phraseSHA = Crypto.SHA256(evt.currentTarget.value);
  }

  // show private key
  $(".pk").text(phraseSHA);

  //display private key things
  displayPrivateKey(phraseSHA);

  //display public key things (this will call public address things as well)
  displayPublicKeyAndAddress(phraseSHA);
}

// input is private key hex
function displayPublicKeyAndAddress (hx) {
  // convert to int
  var privateKeyBN = BigInteger.fromByteArrayUnsigned(Crypto.util.hexToBytes(hx));
  if (privateKeyBN > 0) {
    var pubKey = getPublicKey(privateKeyBN);
    $(".public-x").addClass("hex-container");
    $(".public-y").addClass("hex-container");
    $(".public-x").text(pubKey.x.toString());
    $(".public-y").text(pubKey.y.toString());

    // unhide things from invalid key
    $(".public-y-even-odd").show();
    $("#parity-arrow").css("visibility", "visible");
    $(".public-key-x-lead").css("visibility", "visible");

    var pub_key;
    if (pubKey.yParity === "even") {
      $(".public-y-even-odd").text("is EVEN.");
      $(".public-y-even-odd").css("color", "forestgreen");
      $(".public-key-x-lead").text("02");
      $(".public-key-x-lead").css("background-color", "forestgreen");
      $("#parity-arrow").attr("class", "green");
      pub_key = "02";
    } else {
      $(".public-y-even-odd").text("is ODD.");
      $(".public-y-even-odd").css("color", "firebrick");
      $(".public-key-x-lead").text("03");
      $(".public-key-x-lead").css("background-color", "firebrick");
      $("#parity-arrow").attr("class", "red");
      pub_key = "03";
    }
    pub_key_x = pubKey.x.toString();
    $(".public-key-x").text(pub_key_x);
    pub_key += pub_key_x;

    // display public address
    displayPublicAddress(pub_key);

  } else {
    // set up for when key is invalid
    $(".public-y-even-odd").hide();
    $("#parity-arrow").css("visibility", "hidden");
    $(".public-x").text("n/a");
    $(".public-y").text("n/a");

    $(".public-key-x-lead").text("N/");
    $(".public-key-x-lead").css("background-color", "white");
    $(".public-key-x").text("A");


    $(".ripe160.hex-padding").text("N/A");
    $(".ripe160.hex-middle").html("&nbsp;N/A");

    $(".address-checksum").text("");
    $(".public-address").text("N/A");
  }
}

function displayPublicAddress (hx) {
  var sha = Crypto.SHA256(Crypto.util.hexToBytes(hx));
  var hash160 = Crypto.RIPEMD160(Crypto.util.hexToBytes(sha));
  $(".ripe160").text(hash160);

  var hashAndBytes = Crypto.util.hexToBytes(hash160);
  hashAndBytes.unshift(0x00);
  var versionAndRipe = Crypto.util.bytesToHex(hashAndBytes);
  var check = computeChecksum(versionAndRipe);
  $(".address-checksum").text(check.checksum);

  var address = Bitcoin.Base58.encode(Crypto.util.hexToBytes(versionAndRipe + check.checksum));
  $(".public-address").text(address);

}

// input is private key hex
function displayPrivateKey (hx) {
  // show checksum
  var pkWIF = "80" + hx + "01";
  var check = computeChecksum(pkWIF);
  $(".checksum-pk").text(check.checksum);
  $("#non-checksum").text(check.nonChecksum);
  pkWIF += check.checksum;

  // show private wif
  var address = Bitcoin.Base58.encode(Crypto.util.hexToBytes(pkWIF));
  $(".private-wif").text(address);
}

// private key converted to big number
function getPublicKey (bn) {
  var curve = getSECCurveByName('secp256k1');
  var curvePt = curve.getG().multiply(bn);
  var x = curvePt.getX().toBigInteger();
  var y = curvePt.getY().toBigInteger();

  // returns x,y as big ints
  return {
    x: Crypto.util.bytesToHex(integerToBytes(x, 32)),
    y: Crypto.util.bytesToHex(integerToBytes(y, 32)),
    yParity: y.isEven() ? "even" : "odd" 
  }
}

function computeChecksum (hx) {
  var firstSHA = Crypto.SHA256(Crypto.util.hexToBytes(hx));
  var secondSHA = Crypto.SHA256(Crypto.util.hexToBytes(firstSHA));
  return {
    checksum: secondSHA.substr(0,8).toUpperCase(),
    nonChecksum: secondSHA.substr(8,secondSHA.length).toUpperCase()
  };
}

function base58 (hx) {
  return Bitcoin.Base58.encode(hx);
}

window.onload = init;
