String.prototype.maskIt = function (placeholder = "*") {
  const value = this;
  const randomRange = Array.from({ length: 2 })
    .map(() => Math.round(Math.random() * value.length))
    .sort((a, b) => a - b);
  return value.split("").reduce((c, a, i) => {
    c += i >= randomRange[0] && i <= randomRange[1] ? a : placeholder;
    return c;
  }, "");
};

const maskValue = (val = "", placeholder = "*") => {
  return val.maskIt(placeholder);
};

module.exports = { maskValue };
