// Recordar - Gives a 0.0-1.0 range, the higher the more you remember it
const bound = num => Math.min(Math.max(0, num), 1);

const defaults = {

  // The half-life of each answer. Set higher for easier sets or fast learners
  halflife: 3600,

  // The minimum that each try will bias the solution (min, 1)
  minimum: 0.5,

  factor_forget: true,
  factor_accuracy: true,
  factor_random: true
};

// The main function. Accepts options and then a list of the actual tries
// recordar({})([{}, {}, {}]).then(score => { ... });
const recordar = (tries = [], options = {}) => new Promise((resolve, reject) => {
  if (!(tries instanceof Array)) {
    throw new Error('The parameter should be an array of tries');
  }
  if(tries.length === 0) {
    return resolve(0.5);
  }

  recordar.options = Object.assign({}, recordar.options, options);

  Object.keys(recordar.factors).reduce((all, key) => {
    if (!recordar.options['factor_' + key]) return all;
    return all.then(glo => recordar.factors[key](tries).then(local => {
      return glo * local * 2;
    }));
  }, Promise.resolve(0.5)).then(sol => resolve(bound(sol)));
});


recordar.options = defaults;


// Every one of the factors range from 0 to 1, averagin around 0.5
// Since they have to be multiplied together, each is duplicated before
recordar.factors = {};

// Time factor; the longer the time, the more you don't know
recordar.factors.forget = tries => new Promise((resolve, reject) => {
  if (!tries.length) return resolve(0.5);

  let last = tries.map(w => w.time).sort().shift();
  if (!last) return resolve(0.5);
  // Wolfram Alpha: 1 - ln(x) / (2 * ln(3600)) from 0 to 10000
  // 0.5 ~= 1 - ln(x) / 2 * ln(const)
  let selffactor = 2 * Math.log(recordar.options.halflife);
  let solution = 1 - Math.log((new Date() - last) / 1000) / selffactor;
  resolve(bound(solution));
});

// Accuracy factor; the more errors you make, the less that you know
// Old errors/rights account less than newer ones
recordar.factors.accuracy = tries => new Promise((resolve, reject) => {
  if (!tries.length) return resolve(1);

  // Forget 50% in e ^ (-A * t)
  let coeffs = {
    hour: 0.0002,  // 1h
    day: 0.000008  // 24h
  };

  let size = (all, one) => {
    let timediff = (new Date() - one.time) / 1000;
    let remember = Math.pow(Math.E, (-coeffs.day * timediff));
    // Force each try to always influence even if it's just a bit
    remember = Math.max(remember, recordar.options.minimum);
    return all + remember;
  };

  var good = tries.filter(n => n.type === 'good').reduce(size, 1);
  var bad = tries.filter(n => n.type === 'bad').reduce(size, 1);
  var total = 0.5 + 0.5 * (good - bad) / (good + bad);
  resolve(bound(total));
});

// Position of the index vs total size
// TODO: dynamic range depending on the dataset size
// TODO: push this up
// recordar.factors.index = function(word, i, all) {
//   return 1.2 - 0.4 * (word.index / all.length);
// };

// Make it slightly random
recordar.factors.random = () => new Promise((resolve, reject) => {
  resolve(0.2 * Math.random() + 0.4);
});



if (typeof module !== 'undefined') {
  module.exports = recordar;
}
