/** ================================================================
 * JSMC_external - editor/accumulation.js
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

/**
 * 各小節の拍子・ノーツがある小節・ノーツの小節内位置から、ノーツが1小節目の開始位置から何拍後にあるかを求めます
 * @param {(x: number) => [number, number]} barsFn - 小節番号xを下にがx小節目の拍子(m分のn拍子)を[n, m]で返す関数
 * @param {number} bar - ノーツがある小節の小説番号
 * @param {number} beats - ノーツの小節内位置 拍数
 * @param {number} basis - ノーツの小節内位置 拍子の分母
 * @returns {[number, number]} - ノーツが1小節目の開始位置から何拍後にあるか(分子, 分母)
 */
const accumulateBeats = (barsFn, bar, beats, basis) => {
    // 最大小節数はbar+100か1000のうち大きい方
    const maxBar = Math.max(bar, 1000);
    // 各小節が1小節目の開始位置から何拍後に開始するかを求めて配列に格納
    const barStarts = [];
    for (let i = 0; i <= maxBar; i++) {
        if (i <= 1) {
            barStarts.push(0);
        }
        // 前の小節の拍子を取得
        const [n, m] = barsFn(i - 1);
        // 前の小節の拍数は
    }
};
