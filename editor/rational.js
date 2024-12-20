/** ================================================================
 * JSMC_external - editor/rational.js <Module>
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

/** @type {(a: bigint, b: bigint) => bigint} - 最大公約数を求める */
const gcd = (a, b) => b === 0n ? a : a < b ? gcd(b, a) : gcd(b, a % b);

/** @type {(x: bigint) => bigint} - 絶対値を求める */
const abs = x => x < 0n ? -x : x;

/** @type {(x: bigint) => 1n|0n|-1n} - 符号を求める */
const sign = x => x === 0n ? 0n : x < 0n ? -1n : 1n;

/**
 * 有理数クラス
 * @param {bigint|number} n - 分子
 * @param {bigint|number} [d=1n] - 分母
 */
const Rational = class {
    /**
     * @param {bigint|number} n - 分子
     * @param {bigint|number} [d=1n] - 分母
     */
    constructor(n, d = 1n) {
        const N = BigInt(n);
        const D = BigInt(d);
        const g = gcd(abs(N), abs(D));
        const s = sign(N * D);
        this.n = s * abs(N) / g;
        this.d = abs(D) / g;
    }
    /** @type {() => number} - number変換 */
    valueOf() {
        return Number(this.n) / Number(this.d);
    }
    /** @type {() => string} - string変換 */
    toString() {
        return `${this.n}/${this.d}`;
    }
    /** @type {(x: Rational, y: Rational) => Rational} - (静) 加算 x + y */
    static add(x, y) {
        return new Rational(x.n * y.d + y.n * x.d, x.d * y.d);
    }
    /** @type {(x: Rational, y: Rational) => Rational} - (静) 減算 x - y */
    static sub(x, y) {
        return new Rational(x.n * y.d - y.n * x.d, x.d * y.d);
    }
    /** @type {(x: Rational, y: Rational) => Rational} - (静) 乗算 x * y */
    static mul(x, y) {
        return new Rational(x.n * y.n, x.d * y.d);
    }
    /** @type {(x: Rational, y: Rational) => Rational} - (静) 除算 x / y */
    static div(x, y) {
        return new Rational(x.n * y.d, x.d * y.n);
    }
    /** @type {(x: Rational, y: Rational) => Rational} - (静) 剰余 x % y */
    static mod(x, y) {
        return Rational.sub(x, Rational.mul(Rational.div(x, y), y));
    }
    /** @type {(x: Rational) => Rational} - (静) 符号反転 -x */
    static neg(x) {
        return new Rational(-x.n, x.d);
    }
    /** @type {(x: Rational) => Rational} - (静) 絶対値 |x| */
    static abs(x) {
        return new Rational(abs(x.n), x.d);
    }
    /** @type {(y: Rational) => Rational} - (動) 加算 this + y */
    add(y) {
        return Rational.add(this, y);
    }
    /** @type {(y: Rational) => Rational} - (動) 減算 this - y */
    sub(y) {
        return Rational.sub(this, y);
    }
    /** @type {(y: Rational) => Rational} - (動) 乗算 this * y */
    mul(y) {
        return Rational.mul(this, y);
    }
    /** @type {(y: Rational) => Rational} - (動) 除算 this / y */
    div(y) {
        return Rational.div(this, y);
    }
    /** @type {(y: Rational) => Rational} - (動) 剰余 this % y */
    mod(y) {
        return Rational.mod(this, y);
    }
};

export { Rational };
