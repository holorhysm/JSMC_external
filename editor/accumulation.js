/** ================================================================
 * JSMC_external - editor/accumulation.js <Module>
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

import { Rational as Q } from "./rational.js";

/**
 * 各小節の拍子を返す関数から、各小節が1小節目の開始位置から何拍後に始まるかを求めます
 * @param {(x: number) => [number, number]} barsFn - 小節番号xを下にがx小節目の拍子(m分のn拍子)を[n, m]で返す関数
 * @param {bigint} max - 最大小節数
 * @returns {Q[]} - 各小節が1小節目の開始位置から何拍後に始まるかを表す配列
 */
const getBarStarts = (barsFn, max) => {
    /** @type {Q[]} - 各小節が1小節目の開始位置から何拍後に始まるかを格納する配列 */
    const barStarts = [];
    /** @desc 0小節目・1小節目は0固定 */
    barStarts.push(new Q(0n));
    barStarts.push(new Q(0n));
    /** @desc 2小節目以降はfor文で順番に足す */
    for (let i = 2n; i <= BigInt(max); i += 1n) {
        // 前の小節の拍子を取得
        const [n, d] = barsFn(Number(i - 1n)).map(n => BigInt(n));
        const prev = new Q(n, d);
        // 前の小節の拍数を計算 ((拍子分子 / 拍子分母) × 4)
        const prevBeats = prev.div(new Q(4n)).mul(new Q(4n));
        // 前の小節の開始位置を取得
        const prevStart = barStarts[Number(i - 1n)];
        // 今の小節の開始位置を計算 (前の小節の開始位置 + 前の小節の拍数)
        const start = prevStart.add(prevBeats);
        // 今の小節の開始位置を格納
        barStarts.push(start);
    }
    return barStarts;
};

/**
 * 昇順で並んだ配列から、指定された値以下の最大の値のインデックスを二分探索で求めます
 * @param {Q[]} arr - 昇順で並んだ配列
 * @param {Q} value - 指定された値
 * @param {number} left - 配列の左端のインデックス
 * @param {number} right - 配列の右端のインデックス
 * @returns {number} - 指定された値以下の最大の値のインデックス
 */
const binSearch = (arr, value, left, right) => {
    if (left === right) {
        return left;
    }
    const mid = Math.floor((left + right) / 2);
    if (+arr[mid] <= +value) {
        return binSearch(arr, value, mid + 1, right);
    } else {
        return binSearch(arr, value, left, mid);
    }
};

/**
 * 各小節の拍子・ノーツがある小節・ノーツの小節内位置から、ノーツが1小節目の開始位置から何拍後にあるかを求めます
 * @param {(x: number) => [number, number]} barsFn - 小節番号xを下にがx小節目の拍子(m分のn拍子)を[n, m]で返す関数
 * @param {number} bar - ノーツがある小節の小節番号
 * @param {number} beats - ノーツの小節内位置 拍数
 * @param {number} basis - ノーツの小節内位置 拍子の分母
 * @returns {Q} - ノーツが1小節目の開始位置から何拍後にあるか
 */
const accumulateBeats = (barsFn, bar, beats, basis) => {
    /** @desc 最大小節数はbar+100か1000のうち大きい方 */
    const maxBar = BigInt(Math.max(bar + 100, 1000));
    /** @type {Q[]} - 各小節が1小節目の開始位置から何拍後に始まるかを格納する配列 */
    const barStarts = getBarStarts(barsFn, maxBar);
    /** @desc ==== ノーツが1小節目の開始位置から何拍後にあるかを求める ==== */
    // ノーツがある小節の開始位置を取得
    const note_barStart = barStarts[bar];
    // ノーツがある小節の開始位置からノーツがある小節の位置までの拍数を計算 ((拍数分子 / 拍子分母) × 4)
    const note_beatsInBar = new Q(beats, basis).mul(new Q(4n));
    // ノーツが1小節目の開始位置から何拍後にあるかを計算 (ノーツがある小節の開始位置 + ノーツがある小節の位置までの拍数)
    return note_barStart.add(note_beatsInBar);
};

/**
 * ノーツが1小節目の開始位置から何拍後にあるかから、各小節の拍子・ノーツがある小節・ノーツの小節内位置を求めます
 * @param {(x: number) => [number, number]} barsFn - 小節番号xを下にがx小節目の拍子(m分のn拍子)を[n, m]で返す関数
 * @param {Q} accumulation - ノーツが1小節目の開始位置から何拍後にあるか
 * @returns {[number, number, number]} - ノーツがある小節の小節番号, ノーツの小節内位置 拍数, ノーツの小節内位置 拍子の分母
 */
const deaccumulateBeats = (barsFn, accumulation) => {
    /** @desc 最大小節数はaccumulation+100か1000のうち大きい方 */
    const maxBar = BigInt(Math.max(+accumulation + 100, 1000));
    /** @type {Q[]} - 各小節が1小節目の開始位置から何拍後に始まるかを格納する配列 */
    const barStarts = getBarStarts(barsFn, maxBar);
    /** @desc ==== ノーツがどこにあるかを求める (※１〜maxBarで二分探索) ==== */
    const bar = binSearch(barStarts, accumulation, 0, barStarts.length - 1);
    // ノーツがある小節の開始位置を取得
    const note_barStart = barStarts[bar];
    // ノーツがある小節の位置までの拍数を計算 (accumulation - ノーツがある小節の開始位置)
    const note_beatsInBar = accumulation.sub(note_barStart);
    // 拍数を分数表記に変換 (拍数 / 4)
    const beats = note_beatsInBar.div(new Q(4n));
    // 分母と分子を個別取得
    const basis = beats.d;
    const beatsNum = beats.n;
    return [Number(bar), Number(beatsNum), Number(basis)];
};

export { accumulateBeats, deaccumulateBeats };
