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


  // it('returns by failures', () => {
  //   let set = [
  //     point('set:0:a', [good(10)]),
  //     point('set:0:b', [good(10)]),
  //     point('set:0:c', [good(10)]),
  //     point('set:0:d', [good(10)]),
  //     point('set:0:e', [bad(10)])
  //   ];
  //   expect(recordar(set).word).toBe('e');
  // });
  //
  // it('returns by time', () => {
  //   let set = [
  //     point('set:0:a', [good(10)]),
  //     point('set:0:b', [good(10)]),
  //     point('set:0:c', [good(10)]),
  //     point('set:0:d', [good(10)]),
  //     point('set:0:e', [good(10000)])
  //   ];
  //   expect(recordar(set).word).toBe('e');
  // });
  //
  // it('half-life can be adjusted', () => {
  //   let data = point('set:0:a', [good(10)]);
  //   recordar.options.halflife = 3600;
  //   let chance = recordar.factors.forget(point('', [ good({ hours: 1 }) ]));
  //   expect(Math.round(chance * 100)).toBe(100);
  //
  //   recordar.options.halflife = 24 * 3600;
  //   chance = recordar.factors.forget(point('', [ good(24 * 3600) ]));
  //   expect(Math.round(chance * 100)).toBe(100);
  //
  //   recordar.options.halflife = 3600;
  // });
  //
  // it('recent events are more relevant', () => {
  //   let set = [
  //     recordar.factors.accuracy(point('set:0:a', [bad(1)])),
  //     recordar.factors.accuracy(point('set:0:a', [bad({ hours: 1 })])),
  //     recordar.factors.accuracy(point('set:0:a', [bad({ hours: 12 })])),
  //     recordar.factors.accuracy(point('set:0:a', [bad({ days: 1 })]))
  //   ];
  //
  //   // Older events are closer to 1 (less relevant)
  //   for (let i = 1; i < set.length; i++) {
  //     closerToOne(set[i], set[i-1]);
  //   }
  //
  //   set = [
  //     recordar.factors.accuracy(point('set:0:a', [good(1)])),
  //     recordar.factors.accuracy(point('set:0:a', [good({ hours: 1 })])),
  //     recordar.factors.accuracy(point('set:0:a', [good({ hours: 12 })])),
  //     recordar.factors.accuracy(point('set:0:a', [good({ days: 1 })]))
  //   ];
  //
  //   for (let i = 1; i < set.length; i++) {
  //     closerToOne(set[i], set[i-1]);
  //   }
  // });
  //
  // it('is more important arecent mistake than old success', () => {
  //   let datapoint = point('set:0:a', [bad(10), good({ days: 1 })]);
  //   let factor = recordar.factors.accuracy(datapoint);
  //   expect(factor).toBeLessThan(1.5);
  //   expect(1).toBeLessThan(factor);
  // });
  //
  // it('is more important a recent success than an old mistake', () => {
  //   let datapoint = point('set:0:a', [good(10), bad({ days: 1 })]);
  //   let factor = recordar.factors.accuracy(datapoint);
  //   expect(factor).toBeLessThan(1);
  //   expect(0.5).toBeLessThan(factor);
  // });





  // describe('some persona tests', () => {
  //
  //   it('recent good nullify really old bad', () => {
  //     let chance = recordar([
  //       point('set:0:a', [good(10), bad({ days: 1 })])
  //     ]).chance;
  //
  //     // console.log(chance);
  //     expect(chance < 0.2).toBe(true);
  //   });
  //
  //   it('old enough and super old are the same', () => {
  //     let chance = recordar([
  //       point('set:0:a', [good({ days: 20 }), bad({ days: 20 })])
  //     ]).chance;
  //
  //     let chanceb = recordar([
  //       point('set:0:a', [good({ days: 100 }), bad({ days: 100 })])
  //     ]).chance;
  //
  //     // console.log(Math.round(chance * 10), Math.round(chanceb * 10));
  //     expect(Math.round(chance * 10)).toBe(Math.round(chanceb * 10));
  //   });
  //
  //   it('many good nullify bad', () => {
  //     let chance = recordar([
  //       point('set:0:a', [good(10), good(10), good(10), good(10), bad(10)])
  //     ]).chance;
  //
  //     // console.log(chance);
  //     expect(chance < 0.5).toBe(true);
  //   });
  // });
});
