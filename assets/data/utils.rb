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

