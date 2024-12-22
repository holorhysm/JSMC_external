/** ================================================================
 * JSMC_external - editor/accumulation.js <Module>
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

/** @desc - 有理数([分子, 分母])の計算関連メソッドがcalc_Q.jsにあるので、それをimport */
import * as Q from "./calc_Q.js";

/**
 * 各小節の拍子を返す関数 → i小節目の開始位置が1小節目開始位置から何拍後にあるか(配列)
 * @param {(x: number) => [number, number]} beatsFn - 各小節の拍子を([分子, 分母]で)返す関数
 * @param {number|bigint} [max=1000n] - 最大小節数
 * @returns {[bigint, bigint][]} - i小節目の開始位置が1小節目開始位置から何拍後にあるか(配列)
 */
const getBarsAcc = (beatsFn, max = 1000n) => {
    /** @type {bigint} - 何小節目まで求めるか */
    const terminate = BigInt(max);
    /** @type {[bigint, bigint][]} - 各小節の開始位置が1小節目開始位置から何拍後にあるか */
    // 0小節目・1小節目は0拍後とする
    const acc = [[0n, 1n], [0n, 1n]];
    // 2小節目以降の開始位置は1つずつ計算していく
    for (let i = 1n; i < terminate; i++) {
        // i+1小節目の開始位置は、i小節目の開始位置にi小節目の拍数を足したもの
        const start_i = acc[Number(i)];
        const beat_i = beatsFn(Number(i)).map(x => BigInt(x));
        const start_i1 = Q.add(start_i[0], start_i[1], beat_i[0] * 4n, beat_i[1]);
        acc.push(start_i1);
    }
    return acc;
};

/**
 * 各小節の拍子を返す関数・各小節のBPMを返す関数 → i小節目の開始位置が1小節目開始位置から何秒後にあるか(配列)
 * @param {(x: number) => [number, number]} beatsFn - 各小節の拍子を([分子, 分母]で)返す関数
 * @param {(x: number) => number} tempoFn - 各小節のテンポを返す関数
 * @param {number|bigint} [max=1000n] - 最大小節数
 * @returns {[bigint, bigint][]} - i小節目の開始位置が1小節目開始位置から何秒後にあるか(配列, 各要素は[分子, 分母])
 */
const getBarsAccTime = (beatsFn, tempoFn, max = 1000n) => {
    /** @type {bigint} - 何小節目まで求めるか */
    const terminate = BigInt(max);
    /** @type {[bigint, bigint][]} - 各小節の開始位置が1小節目開始位置から何秒後にあるか */
    // 0小節目・1小節目は0秒後とする
    const acc = [[0n, 1n], [0n, 1n]];
    // 2小節目以降の開始位置は1つずつ計算していく
    for (let i = 1n; i < terminate; i++) {
        // i+1小節目の開始位置は、i小節目の開始位置にi小節目の時間を足したもの
        const start_i = acc[Number(i)];
        const beat_i = beatsFn(Number(i)).map(x => BigInt(x));
        const tempo_i = (x => [x.n, x.d])(Q.approximation(tempoFn(Number(i))));
        // BPM=t, m分のn拍子の小節の長さ(秒)は (240n)/(mt)
        const length_i = Q.div(...Q.mul(240n, 1n, beat_i[0], 1n), ...Q.mul(beat_i[1], 1n, tempo_i[0], tempo_i[1]));
        const start_i1 = Q.add(start_i[0], start_i[1], length_i[0], length_i[1]);
        acc.push(start_i1);
    }
    return acc;
};

/**
 * 各小節の拍子を返す関数・ノーツがある小節・ノーツの小節内位置 → ノーツが1小節目開始位置から何拍後にあるか
 * @param {(x: number) => [number, number]} beatsFn - 各小節の拍子を([分子, 分母]で)返す関数
 * @param {number} bar - ノーツがある小節
 * @param {number} beatN - ノーツの小節内位置の分子
 * @param {number} beatD - ノーツの小節内位置の分母
 * @returns {[bigint, bigint]} - ノーツが1小節目開始位置から何拍後にあるか([分子, 分母]で)
 */
const accumulation = (beatsFn, bar, beatN, beatD) => {
    /** @type {[bigint, bigint][]} - 各小節の開始位置が1小節目開始位置から何拍後にあるか */
    const barsAcc = getBarsAcc(beatsFn, bar + 100);
    /** @type {[bigint, bigint]} - ノーツがある小節が1小節目開始位置から何拍後にあるか */
    const note_barStart = barsAcc[bar];
    /** @type {[bigint, bigint]} - ノーツの位置が小節開始位置から何拍後にあるか */
    const note_beat = [BigInt(beatN) * 4n, BigInt(beatD)];
    /** @type {[bigint, bigint]} - ノーツが1小節目開始位置から何拍後にあるか */
    const note_total = Q.add(note_barStart[0], note_barStart[1], note_beat[0], note_beat[1]);
    return note_total;
};

/**
 * 各小節の拍子を返す関数・各小節のBPMを返す関数・ノーツがある小節・ノーツの小節内位置 → ノーツが1小節目開始位置から何秒後にあるか
 * @param {(x: number) => [number, number]} beatsFn - 各小節の拍子を([分子, 分母]で)返す関数
 * @param {(x: number) => number} tempoFn - 各小節のテンポを返す関数
 * @param {number} bar - ノーツがある小節
 * @param {number} beatN - ノーツの小節内位置の分子
 * @param {number} beatD - ノーツの小節内位置の分母
 * @returns {[bigint, bigint]} - ノーツが1小節目開始位置から何秒後にあるか([分子, 分母]で)
 */
const accumulationTime = (beatsFn, tempoFn, bar, beatN, beatD) => {
    /** @type {[bigint, bigint]} - ノーツがある小節のBPM([分子, 分母]で) */
    const tempo = (x => [x.n, x.d])(Q.approximation(tempoFn(bar)));
    /** @type {[bigint, bigint][]} - 各小節の開始位置が1小節目開始位置から何秒後にあるか */
    const barsAccTime = getBarsAccTime(beatsFn, tempoFn, bar + 100);
    /** @type {[bigint, bigint]} - ノーツがある小節が1小節目開始位置から何秒後にあるか */
    const note_barStart = barsAccTime[bar];
    /** @type {[bigint, bigint]} - ノーツの位置が小節開始位置から何拍後にあるか */
    const note_beat = [BigInt(beatN) * 4n, BigInt(beatD)];
    /** @type {[bigint, bigint]} - ノーツの位置が小節開始位置から何秒後にあるか */
    const note_beatTime = Q.div(60n * note_beat[0], note_beat[1], ...tempo);
    /** @type {[bigint, bigint]} - ノーツが1小節目開始位置から何秒後にあるか */
    const note_total = Q.add(note_barStart[0], note_barStart[1], note_beatTime[0], note_beatTime[1]);
    return note_total;
}

/**
 * 各小節の拍子を返す関数・ノーツが1小節目開始位置から何拍後にあるか → ノーツがある小節・ノーツの小節内位置
 * @param {(x: number) => [number, number]} beatsFn - 各小節の拍子を([分子, 分母]で)返す関数
 * @param {[bigint, bigint]} beats - ノーツが1小節目開始位置から何拍後にあるか([分子, 分母]で)
 * @returns {[number, number, number]} - ノーツがある小節・ノーツの小節内位置([小節, 分子, 分母]で)
 */
const distribution = (beatsFn, beats) => {
    /** @type {[bigint, bigint][]} - 各小節の開始位置が1小節目開始位置から何拍後にあるか */
    const barsAcc = getBarsAcc(beatsFn, 1000);
    /** @type {bigint} - ノーツがある小節 (→ barsAcc[i] < beats を満たす最大のi) */
    const bar = BigInt(barsAcc.findIndex(b => Q.sub(beats[0], beats[1], b[0], b[1])[0] < 0n) - 1);
    /** @type {[bigint, bigint]} - ノーツがある小節が1小節目開始位置から何拍後にあるか (→ beats - barsAcc[bar]) */
    const barStartBeats = Q.sub(beats[0], beats[1], barsAcc[Number(bar)][0], barsAcc[Number(bar)][1]);
    /** @type {[bigint, bigint]} - ノーツの小節内位置 (拍数を4で割ればいい) */
    const beat = Q.div(barStartBeats[0], barStartBeats[1], 4n, 1n);
    return [Number(bar), Number(beat[0]), Number(beat[1])];
};

/** @desc - export */
export { getBarsAcc, getBarsAccTime, accumulation, accumulationTime, distribution };
