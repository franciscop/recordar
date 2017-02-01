// let recordar = require('./index.js');
const recordar = require('./index');
const time = require('to-date');

const good = (ago = 10) => ({ type: 'good', time: time(ago).seconds.ago });
const bad = (ago = 10) => ({ type: 'bad', time: time(ago).seconds.ago });

describe('constructor', () => {
  it('can build with nothing', () => {
    return recordar().then(score => expect(score).toBe(0.5));
  });

  it('ignores a number for options', () => {
    return recordar([], 1);
  });

  it('can build with empty array', () => {
    return recordar([]).then(score => expect(score).toBe(0.5));
  });

  it('does not accept numbers', () => {
    return recordar(1).catch(err => expect(err).toBeDefined());
  });

  it('does not accept strings', () => {
    return recordar('a').catch(err => expect(err).toBeDefined());
  });

  it('does not accept objects', () => {
    return recordar({}).catch(err => expect(err).toBeDefined());
  });
});


describe('factors:forget', () => {
  it('is 0.5 for half-life', () => {
    return recordar.factors.forget([good(3600)]).then(sol => {
      expect(sol).toBeGreaterThan(0.4);
      expect(sol).toBeLessThan(0.6);
    });
  });
});


describe('bound checking', () => {
  it('never goes below 0', () => {
    return recordar([good(1000000000)]).then(min => expect(min).toBe(0));
  });
});


describe('comparing instances', () => {
  beforeAll(() => {
    recordar.options.factor_random = false;
  });
  afterAll(() => {
    recordar.options.factor_random = true;
  });

  it('older are forgotten more than recent', () => {
    let solutions = [recordar([good(100)]), recordar([good(10)])];
    return Promise.all(solutions).then(([older, recent]) => {
      expect(older).toBeLessThan(recent);
    });
  });

  it('handles failures vs correct', () => {
    let solutions = [recordar([good(10)]), recordar([bad(10)])];
    return Promise.all(solutions).then(([ok, no]) => {
      expect(no).toBeLessThan(ok);
    });
  });

  it('handles multiple failures', () => {
    let a = recordar([bad(10)]);
    let b = recordar([bad(10), bad(10)]);
    let c = recordar([bad(10), bad(10), bad(10)]);
    let d = recordar([bad(10), bad(10), bad(10), bad(10)]);
    let e = recordar([bad(10), bad(10), bad(10), bad(10), bad(10)]);
    let f = recordar([bad(10), bad(10), bad(10), bad(10), bad(10), bad(10)]);

    let solutions = [a, b, c, d, e, f];
    return Promise.all(solutions).then(([a, b, c, d, e, f]) => {
      expect(a).toBeGreaterThan(b);
      expect(b).toBeGreaterThan(c);
      expect(c).toBeGreaterThan(d);
      expect(d).toBeGreaterThan(e);
      expect(e).toBeGreaterThan(f);
    });
  });
});



describe('Real life examples and bug fixes', () => {
  it('score too low:sort inverted for accuracy', () => {
    let data = [
      {"type":"good", "time": new Date("2016-11-27T15:17:50.000Z")},
      {"type":"good", "time": new Date("2016-12-15T07:17:35.000Z")},
      {"type":"good", "time": new Date("2017-02-01T23:20:58.000Z")},
      {"type":"good", "time": new Date("2017-02-01T23:21:01.000Z")},
      {"type":"good", "time": new Date("2017-02-01T23:21:10.000Z")}
    ];
    recordar(data).then(score => {
      expect(score).toBeGreaterThan(0.5);
    });
  });
});
