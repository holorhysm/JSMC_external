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

/** @type {(a: number) => ({n: bigint, d:bigint})} - aの十分な近似値を表す、分母がなるべく小さい有理数(n/d)を生成する */
const approximation = (a) => {
    /** @description - aが0の場合 → 0/1を返す */
    if (a === 0) return { "n": 0n, "d": 1n };
    /** @description - aが負数の場合 → 絶対値の近似に-1を掛ける */
    if (a < 0) return ((abs) => ({ "n": -1n * abs.n, "d": abs.d }))(approximation(-a));
    /** @description - aが正数の場合(↑に当てはまらない場合) → 分母の候補を1から順番に試す */
    /** @type {bigint} - 分母の最大値 */
    const maxDenominator = BigInt(16 * 9 * 25 * 1001);
    /** @type {{n: bigint, d: bigint}} - 現時点で返す値の候補 */
    let result = { "n": 0n, "d": 1n };
    /** @type {number} - resultとaの誤差 */
    let error = Math.abs(a - Number(result.n) / Number(result.d));
    /** @description - 分母を1から順番に試す */
    for (let d = 1n; d < maxDenominator; d++) {
        /** @type {number} - a/dを四捨五入した値を求める */
        const n = Math.round(a * Number(d));
        /** @description - n/dがaに十分近い(===で等価と判定される)場合 → n/dを返す */
        if (n / Number(d) === a) {
            return { "n": BigInt(n), "d": d };
        }
        /** @description - n/dとaの誤差が現時点での最小誤差より小さい場合 → resultとerrorを更新する */
        if (Math.abs(a - n / Number(d)) < error) {
            result = { "n": BigInt(n), "d": d };
            error = Math.abs(a - Number(result.n) / Number(result.d));
        }
    }
    /** @description - ===で等価と判定されるところまで誤差が縮まらなかったら現時点の最小誤差で返す */
    return result;
}

/** @desc export */
export { sign, abs_Q, abs_Z, gcd, simplify, add, sub, mul, div, toNumber, approximation };
