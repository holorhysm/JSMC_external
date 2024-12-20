/** ================================================================
 * JSMC_external - editor/OffsetNotes_TimeAxis.js <Script>
 * 時間方向にノーツをずらします
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */

//@ts-check

/**
 * @typedef {Object} Holorhysm_ChartNote - 譜面ファイルのうち、1つのノーツを表すオブジェクト
 * @property {"push"|"hover"|"isolate"} type - ノーツの種類
 * @property {[number, number]} where - ノーツの[左端, 右端]の位置。-3〜3
 * @property {[number, number, number]} when - ノーツのタイミング。[小節, 分子, 分母]
 * @property {number} speed - ノーツの単体ソフラン倍率
 * @property {Q?} startAt - ノーツが1小節目の開始位置から何拍後にあるか
 */

(async (input) => {
    /** @desc - 各種moduleをDynamic Import */
    const moduleDirectory = "./"; // テスト中は"./"、本番では"https://……"に変更
    const formatNote = await import(moduleDirectory + "format.js").then(module => module.formatNote);
    const Q = await import(moduleDirectory + "rational.js").then(module => module.Rational);
    const accumulateBeats = await import(moduleDirectory + "accumulation.js").then(module => module.accumulateBeats);
    const deaccumulateBeats = await import(moduleDirectory + "accumulation.js").then(module => module.deaccumulateBeats);
    // test
    console.log(formatNote);
    console.log(Q);
    console.log(accumulateBeats);
    console.log(deaccumulateBeats);
    /** @desc - 入力文字列から Holorhysm_ChartNote[] を生成 */
    /** @type {Holorhysm_ChartNote[]} */
    const notes = new Function(`"use strict"; return [${input}]`)();
    /** @desc - barsFnをprompt入力でもらう */
    const barsFn = new Function(`"use strict"; return ${prompt(`譜面の beats の値を入力してください。("は含まない)`)}`)();
    /** @desc - notes[].startAtをwhenから生成 */
    notes.forEach(note => {
        note.startAt = accumulateBeats(barsFn, ...note.when);
    });
    /** @desc - notes[].startAtに加算する量をpromptでもらう(整数ならn、分数ならn/m形式) */
    const offsetInput = prompt("ずらす拍数を入力してください。(整数なら「3」、分数なら「5/2」のように入力)");
    const offset = new Q(...(`${offsetInput}/1`).split("/").map(x => BigInt(x)));
    /** @desc - notes[].startAtにoffsetを加算 */
    notes.forEach(note => {
        note.startAt = Q.add(note.startAt, offset);
    });
    /** @desc - notes[].whenをstartAtから生成 */
    notes.forEach(note => {
        note.when = deaccumulateBeats(barsFn, note.startAt);
    });
    /** @desc - notes[] を整形して出力 */
    return notes.map(note => formatNote(note)).join(",\n");
})();
