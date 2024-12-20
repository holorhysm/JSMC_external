/** ================================================================
 * JSMC_external - editor/cal_Q.js <Module>
 * 有理数の計算を行う関数を提供します
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

/** @type {(a: bigint, b: bigint) => [(1n|0n|-1n), 1n]} - (a/b)の符号を求める */
const sign = (a, b) => {
    const times = a * b;
    return times > 0n ? [1n, 1n] : times < 0n ? [-1n, 1n] : [0n, 1n];
};
/** @type {(a: bigint, b: bigint) => [bigint, bigint]} - (a/b)の絶対値を求める */
const abs_Q = (a, b) => {
    return [abs_Z(a), abs_Z(b)];
};
/** @type {(x: bigint) => bigint} - xの絶対値を求める */
const abs_Z = x => x < 0n ? -x : x;
/** @type {(a: bigint, b: bigint) => bigint} - aとbの最大公約数を求める */
const gcd = (a, b) => b === 0n ? a : a < b ? gcd(b, a) : gcd(b, a % b);

/** @type {(a: bigint, b: bigint) => [bigint, bigint]} - a/bを約分して符号を分子側に持ってきたものを[分子, 分母]の形で返す */
const simplify = (a, b) => {
    const s = sign(a, b);
    const g = gcd(...abs_Q(a, b));
    return [s[0] * (abs_Z(a) / g), s[1] * (abs_Z(b) / g)];
};

/** @type {(a: bigint, b: bigint, c: bigint, d: bigint) => [bigint, bigint]} (a/b) + (c/d) を[分子, 分母]の形で返す */
const add = (a, b, c, d) => simplify(a * d + b * c, b * d);
/** @type {(a: bigint, b: bigint, c: bigint, d: bigint) => [bigint, bigint]} (a/b) - (c/d) を[分子, 分母]の形で返す */
const sub = (a, b, c, d) => simplify(a * d - b * c, b * d);
/** @type {(a: bigint, b: bigint, c: bigint, d: bigint) => [bigint, bigint]} (a/b) * (c/d) を[分子, 分母]の形で返す */
const mul = (a, b, c, d) => simplify(a * c, b * d);
/** @type {(a: bigint, b: bigint, c: bigint, d: bigint) => [bigint, bigint]} (a/b) / (c/d) を[分子, 分母]の形で返す */
const div = (a, b, c, d) => simplify(a * d, b * c);

/** @type {(a: bigint, b: bigint) => number} - a/b を小数で返す */
const toNumber = (a, b) => Number(a) / Number(b);

/** @desc export */
export { sign, abs_Q, abs_Z, gcd, simplify, add, sub, mul, div, toNumber };
