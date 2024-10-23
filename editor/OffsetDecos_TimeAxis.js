/** ================================================================
 * JSMC_external
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */
//@ts-check

//@ts-ignore
globalThis.RationalNumber = class RationalNumber {
    /* ======== constructor ======== */
    /**
     * 有理数を生成する
     * @param {!(number|bigint)} top - 分子
     * @param {!(number|bigint)} bottom - 分母(≠0)
     */
    constructor(top, bottom) {
        /** @type {bigint} - 分子の入力をBigIntにしたもの */
        const topBigInt = BigInt(top);
        /** @type {bigint} - 分母の入力をBigIntにしたもの */
        const bottomBigInt = BigInt(bottom);
        /** もし分母が0ならエラーを投げる */
        if (bottomBigInt === 0n) throw new Error('[AXT RationalNumber] not allowed to divide by 0');
        /** @type {bigint} - 符号 */
        const sign = BigInt(this.#Math.sign(topBigInt) * this.#Math.sign(bottomBigInt));
        /** @type {bigint} - 分子の絶対値 */
        const topBigIntAbs = this.#Math.abs(topBigInt);
        /** @type {bigint} - 分母の絶対値 */
        const bottomBigIntAbs = this.#Math.abs(bottomBigInt);
        /** @type {bigint} - 最大公約数 */
        const gcd = this.#getGCD(topBigIntAbs, bottomBigIntAbs);
        /** @type {bigint} - 約分後の分子 */
        const topAfterReduce = topBigIntAbs / gcd;
        /** @type {bigint} - 約分後の分母 */
        const bottomAfterReduce = bottomBigIntAbs / gcd;
        /** @description - インスタンスのプロパティを設定 */
        /** @type {bigint} - 分母 */
        this.top = topAfterReduce;
        /** @type {bigint} - 分子 */
        this.bottom = bottomAfterReduce;
        /** @type {bigint} - 符号 */
        this.sign = sign;
    }
    /* ======== Private Class Field ======== */
    /**
     * 既約分数にするために、2数の最大公約数を求める
     * @param {bigint} a - 最大公約数を求めたい数
     * @param {bigint} b - 最大公約数を求めたい数
     * @returns {bigint} 最大公約数 (ただし、bが0の場合はa)
     */
    #getGCD(a, b) {
        if (b === 0n) return a;
        const r = a % b;
        return r === 0n ? b : this.#getGCD(b, r);
    }
    /**
     * NumberだったらMath.XXXX()で使える各種関数のうち、RationalNumberで使うもののBigInt移植実装
     * @type {Object}
     */
    #Math = {
        /**
         * BigIntの絶対値を求める
         * @param {bigint} bigInt - 絶対値を求めたいBigInt
         * @returns {bigint} 絶対値
         */
        abs: function (bigInt) {
            return bigInt < 0n ? -bigInt : bigInt;
        },
        /**
         * BigIntの符号を求める
         * @param {bigint} bigInt - 符号を求めたいBigInt
         * @returns {bigint} 符号 (1n: 正, -1n: 負, 0n: 0)
         */
        sign: function (bigInt) {
            return bigInt === 0n ? 0n : (bigInt < 0n) ? -1n : 1n;
        },
    };
    /* ======== 各種Primitiveへの変換 ======== */
    /**
     * 文字列に変換する
     * @returns {string} 有理数を表す文字列
     */
    toString() {
        return `${this.sign < 0n ? '-' : ''}${this.top}${this.bottom !== 1n ? `/${this.bottom}` : ''}`;
    }
    /**
     * 数値に変換する
     * @returns {number} 有理数を浮動小数点数に変換したもの
     */
    valueOf() {
        return Number(this.sign) * Number(this.top) / Number(this.bottom);
    }
    /* ======== 前置記法(ポーランド記法)による演算 (staticメソッド) ======== */
    /**
     * 有理数の加算
     * @param {RationalNumber} a - 加算する有理数
     * @param {RationalNumber} b - 加算する有理数
     * @returns {RationalNumber} 加算結果
     */
    static Add(a, b) {
        return new RationalNumber(a.top * b.bottom * a.sign + b.top * a.bottom * b.sign, a.bottom * b.bottom);
    }
    /**
     * 有理数の減算
     * @param {RationalNumber} a - 減算される有理数
     * @param {RationalNumber} b - 減算する有理数
     * @returns {RationalNumber} 減算結果
     */
    static Sub(a, b) {
        return this.Add(a, new RationalNumber(-b.top, b.bottom));
    }
    /**
     * 有理数の乗算
     * @param {RationalNumber} a - 乗算する有理数
     * @param {RationalNumber} b - 乗算する有理数
     * @returns {RationalNumber} 乗算結果
     */
    static Mul(a, b) {
        return new RationalNumber(a.top * b.top * a.sign * b.sign, a.bottom * b.bottom);
    }
    /**
     * 有理数の除算
     * @param {RationalNumber} a - 除算される有理数
     * @param {RationalNumber} b - 除算する有理数
     * @returns {RationalNumber} 除算結果
     */
    static Div(a, b) {
        return this.Mul(a, new RationalNumber(b.bottom, b.top));
    }
    /* ======== 中置記法による演算 (プロトタイプメソッドチェーン) ======== */
    /**
     * 有理数の加算
     * @param {RationalNumber} b - 加算する有理数
     * @returns {RationalNumber} 加算結果
     */
    plus(b) {
        return RationalNumber.Add(this, b);
    }
    /**
     * 有理数の減算
     * @param {RationalNumber} b - 減算する有理数
     * @returns {RationalNumber} 減算結果
     */
    minus(b) {
        return RationalNumber.Sub(this, b);
    }
    /**
     * 有理数の乗算
     * @param {RationalNumber} b - 乗算する有理数
     * @returns {RationalNumber} 乗算結果
     */
    times(b) {
        return RationalNumber.Mul(this, b);
    }
    /**
     * 有理数の除算
     * @param {RationalNumber} b - 除算する有理数
     * @returns {RationalNumber} 除算結果
     */
    div(b) {
        return RationalNumber.Div(this, b);
    }
}

/**
 * @typedef {Object} Holorhysm_ChartDeco - 譜面ファイルのうち、1つのデコレーターを表すオブジェクト
 * @property {string|[number, string]} color - デコレーターの色。グラデの場合はCanvasGradient: addColorStop()の引数と同じ形のArrayで指定
 * @property {Holorhysm_ChartDeco_PosInfo} start - 開始位置の情報
 * @property {Holorhysm_ChartDeco_PosInfo} end - 終了位置の情報
 * @property {{left: string, right: string}} easing - (左|右)側の接続イージング
 * @property {number} speed - ノーツの単体ソフラン倍率
 */
/**
 * @typedef {Object} Holorhysm_ChartDeco_PosInfo - 譜面ファイルのうち、1つのデコレーターの配置に関する情報を表すオブジェクト
 * @property {[number, number]} where - デコレーターの[左端, 右端]の位置。-3〜3
 * @property {[number, number, number]} when - デコレーターのタイミング。[小節, 分子, 分母]
 * @property {RationalNumber} offset - デコレーターの開始位置が1小節目の開始位置から何拍後ろか (コード内で生成)
 */

/** @type {number} */
const beatsAdd = Number(prompt("何拍ずらす？"));
/** @type {(x: number) => [number, number]} */
// @ts-ignore
const beatsSettings = new Function("x", `return ${prompt('譜面の beats の値を入力してください。("は含まない)')};`);
/** @type {(str: string, len: number) => string} */
const padStart = (str, len) => str.toString().padStart(len);
/** @type {(num: number, digits: number, len: number) => string} */
const toFixed = (num, digits, len) => num.toFixed(digits).padStart(len);
/** @type {Holorhysm_ChartDeco[]} デコレーター */
// @ts-ignore
const decorators = Function(`return ${input}`)();

/** @desc - 各小節の開始位置が1小節目の開始位置から何拍後ろかを求める */
/** @type {number} ノーツの最終小節 + beatsAdd * 32(猶予) */
const endBar = Math.max(...decorators.map(d => d.when[0])) + beatsAdd * 32;
/** @type {RationalNumber[]} i小節目の開始位置が1小節目の開始位置から何拍後ろか */
const barOffset = [new RationalNumber(0, 1), new RationalNumber(0, 1) /*2小節目以降は↓のfor文で生成*/];
for (let i = 1, j = new RationalNumber(0, 1); i < endBar; i++) {
    const beatsArr = beatsSettings(i).map(x => new RationalNumber(x, 1));
    const beats = beatsArr[0].div(beatsArr[1].div(new RationalNumber(4, 1)));
    j = j.plus(beats);
    barOffset.push(j);
}

/** @desc - 各デコレーターのstartとendのwhenを拍数換算してoffsetに代入 */
decorators.some(deco => {
    /** @type {!RationalNumber} - そのデコレーターの開始位置の1小節目の開始位置から何拍後ろか */
    deco.start.offset = barOffset[deco.start.when[0]].plus(RationalNumber.Div(new RationalNumber(deco.start.when[1], 1), new RationalNumber(deco.start.when[2], 4)));
    /** @type {!RationalNumber} - そのデコレーターの終了位置の1小節目の開始位置から何拍後ろか */
    deco.end.offset = barOffset[deco.end.when[0]].plus(RationalNumber.Div(new RationalNumber(deco.end.when[1], 1), new RationalNumber(deco.end.when[2], 4)));
});

/** @desc - デコレーターのstartとendのoffsetを指定拍数ずらす */
decorators.some(deco => {
    deco.start.offset = deco.start.offset.plus(new RationalNumber(beatsAdd, 1));
    deco.end.offset = deco.end.offset.plus(new RationalNumber(beatsAdd, 1));
});

/** @desc - デコレーターのstartとendのwhenを再生成する */
decorators.some(deco => {
    /** @type {number} - そのデコレーターの開始位置の小節 */
    deco.start.when[0] = barOffset.findIndex(x => x.valueOf() > deco.start.offset.valueOf()) - 1;
    /** @type {RationalNumber} - そのデコレーターの開始位置の拍数 */
    const startOffsetInBar = deco.start.offset.minus(barOffset[deco.start.when[0]]);
    /** @type {number} - そのデコレーターの開始位置の分子 */
    deco.start.when[1] = Number(startOffsetInBar.top);
    /** @type {number} - そのデコレーターの開始位置の分母 */
    deco.start.when[2] = Number(startOffsetInBar.bottom) * 4;
    /** @type {number} - そのデコレーターの終了位置の小節 */
    deco.end.when[0] = barOffset.findIndex(x => x.valueOf() > deco.end.offset.valueOf()) - 1;
    /** @type {RationalNumber} - そのデコレーターの終了位置の拍数 */
    const endOffsetInBar = deco.end.offset.minus(barOffset[deco.end.when[0]]);
    /** @type {number} - そのデコレーターの終了位置の分子 */
    deco.end.when[1] = Number(endOffsetInBar.top);
    /** @type {number} - そのデコレーターの終了位置の分母 */
    deco.end.when[2] = Number(endOffsetInBar.bottom) * 4;
});

/** @desc - デコレーターを出力 */
// @ts-ignore - 諸事情でreturnなので許しを乞う
return `[
${decorators.map(deco => `        {
            "color": ${JSON.stringify(deco.color)},
            "start": { "where": [${toFixed(deco.start.where[0], 2, 5)}, ${toFixed(deco.start.where[1], 2, 5)}], "when": [${toFixed(deco.start.when[0], 0, 3)}, ${toFixed(deco.start.when[1], 0, 3)}, ${toFixed(deco.start.when[2], 0, 3)}], },
            "end":   { "where": [${toFixed(deco.end.where[0], 2, 5)}, ${toFixed(deco.end.where[1], 2, 5)}], "when": [${toFixed(deco.end.when[0], 0, 3)}, ${toFixed(deco.end.when[1], 0, 3)}, ${toFixed(deco.end.when[2], 0, 3)}], },
            "easing": { "left": "${deco.easing.left}", "right": "${deco.easing.right}", }, "speed": ${deco.speed},
        },
`).join('')}
]`;
