/** ================================================================
 * JSMC_external
 * copyright (c) 2024- Ayasaka-Koto, All rights reserved.
================================================================= */
let a = +prompt("傾き", -1), b = +prompt("切片", 0), p = (s, d) => s.padStart(d), x = (n, t, d) => p(n.toFixed(t), d), o = Function(`return ${input}`)(); o.some(n => { n.where = n.where.map(v => v * a + b).sort((a, b) => a - b) }); return `[\n` + o.map(n => `        { "type": ${p(`"${n.type}`, 8)}", "where": [${x(n.where[0], 2, 5)}, ${x(n.where[1], 2, 5)}], "when": [${x(n.when[0], 0, 3)}, ${x(n.when[1], 0, 2)}, ${x(n.when[2], 0, 2)}], "speed": ${x(n.speed, 2, 4)}, },`).join("\n") + `\n]`;
