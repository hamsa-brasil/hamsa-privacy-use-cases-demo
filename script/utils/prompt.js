const readline = require("node:readline");

const getAnswer = function (question, callback) {
  return new Promise((resolve) => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    prompt.question(question ?? "Qual a sua idade? ", (data) => {
      if (callback) {
        resolve(callback.apply({}, [data]));
      } else {
        resolve(data);
      }
      prompt.close();
    });
  });
};

module.exports = getAnswer;
