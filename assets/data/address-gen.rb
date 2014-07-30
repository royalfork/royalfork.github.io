require 'digest'
require "ecdsa"

# utilities
class Bignum
  def to_hex
    self.to_s(16)
  end
end

class String
  def to_hex
    self.unpack("H*").first
  end

  # taken from bitcoin-ruby project
  def to_base58
    hex_val = self.to_hex
    leading_zero_bytes  = (hex_val.match(/^([0]+)/) ? $1 : '').size / 2
    int_val = hex_val.to_i(16) 
    alpha = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    base58_val, base = '', alpha.size
    while int_val > 0
      int_val, remainder = int_val.divmod(base)
      base58_val = alpha[remainder] + base58_val
    end
    ("1"*leading_zero_bytes) + base58_val
  end

  def to_bignum
    self.to_hex.to_i(16)
  end
end

# Step 1
# generate 256 random bits
passphrase = "bitcoins are cool"
priv_key = Digest::SHA256.digest(passphrase)

# Step 2
# add version number to our bits, append compression flag
# Bitcoin: 0x80
# Testnet: 0xEF
# Note: adding the "b" makes a binary representation of our byte before
# concatenating, to avoid "encoding" issues
priv_key_and_version = "\x80".b + priv_key + "\x01".b

# Step 3
# implement checksum
# Checksum is the first 4 bytes of the double sha256 hash of our input
def cat_checksum (input)
  firstSHA  = Digest::SHA256.digest(input)
  secondSHA = Digest::SHA256.digest(firstSHA)
  input + secondSHA[0,4]
end
priv_key_and_version_and_checksum = cat_checksum(priv_key_and_version)

# Step 4
# Base58 encode the version, priv key, and checksum
# Note: WIF = wallet import format
privateWIF = priv_key_and_version_and_checksum.to_base58
puts "Private key: \t" + privateWIF

# Now, lets create our public key, and public address

# Step 5
# kpub = kpriv * G
curve = ECDSA::Group::Secp256k1
pub_key_point = curve.generator.multiply_by_scalar(priv_key.to_bignum)

# Step 6
# uncompressed, pub key is in form 0x04 + x + y
# compressed, pub key is in form 
#   0x02 + x if y is event 
#   0x03 + x if y is odd 
# Getting encodings right is difficult...pub.x is a Bignum.  Bignum + Bignum is
# a biggernum, which isn't really what we want.  We want string concatenation.  To do that,
# we translate to hex, concatenate the hex, and pack it back into a string to
# concatenate with our leading byte
if pub_key_point.y % 2 == 0 # y is even
  leader = "\x02"
else
  leader = "\x03"
end
pub_key = leader + [pub_key_point.x.to_hex].pack("H*")
puts pub_key.to_hex

# Step 7
# ripe160(sha256(pub_key))
pub_key_sha256 = Digest::SHA256.digest(pub_key)
pub_key_hash = Digest::RMD160.digest(pub_key_sha256)

# Step 8
# prepend version to our double hashed pub key, append checksum
# Bitcoin: 0x00
# Testnet: 0x6f
pub_key_hash_and_version = "\x00" + pub_key_hash
# add checksum
pub_key_hash_and_version_and_checksum = cat_checksum(pub_key_hash_and_version) 

# Step 9
# base58 encode version, hash, checksum
pub_addr = pub_key_hash_and_version_and_checksum.to_base58 
puts "Public Add: \t" + pub_addr
