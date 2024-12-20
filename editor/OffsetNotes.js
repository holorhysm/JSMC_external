/** ================================================================
 * JSMC_external - editor/OffsetNotes.js <Script>
 * 左右方向にノーツをずらします (1次関数を用いた変換)
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

(async (input) => {
    /** ======== 傾きと切片の入力から、変換関数を作る ======== */
    /** @type {string?} prompt入力 : 傾き */
    const prompt_slope = prompt("傾きを入力してください。");
    /** @type {string?} prompt入力 : 切片 */
    const prompt_intercept = prompt("切片を入力してください。");
    /** @type {number} 傾き */
    const slope = Number(prompt_slope || "1");
    /** @type {number} 切片 */
    const intercept = Number(prompt_intercept || "0");
    /** @type {(x: number) => number} 変換関数 */
    const convert = x => slope * x + intercept;
    /** ======== inputをもとにノーツの配列を作る ======== */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = new Function(`"use strict"; return [${input}]`)();
    /** ======== ノーツのwhere[0]とwhere[1]をそれぞれ変換 ======== */
    notes.forEach(note => {
        note.where[0] = convert(note.where[0]);
        note.where[1] = convert(note.where[1]);
    });
    /** ======== ノーツのwhereを昇順にソートする ======== */
    notes.forEach(note => {
        if (note.where[0] > note.where[1]) {
            [note.where[0], note.where[1]] = [note.where[1], note.where[0]];
        }
    });
    /** ======== ノーツを整形して出力 ======== */
    const formatNote = await import("./format.js").then(module => module.formatNote);
    return notes.map(note => formatNote(note)).join("\n");
})
