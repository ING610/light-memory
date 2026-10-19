(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QuizSampler = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const sourceTypes = Object.freeze(["video", "knowledge", "extension"]);
  const difficulties = Object.freeze(["基础", "理解", "进阶"]);
  const sourceQuota = Object.freeze([7, 2, 1]);
  const difficultyQuota = Object.freeze([4, 4, 2]);

  function combination(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let count = 1;
    for (let i = 1; i <= k; i++) count = Math.round(count * (n - i + 1) / i);
    if (!Number.isSafeInteger(count)) throw new Error("题库组合数超出安全范围，请缩小题库后重试。");
    return count;
  }

  function prepare(bank) {
    if (!Array.isArray(bank)) throw new Error("题库数据应为题目数组。");
    const cells = sourceTypes.map(() => difficulties.map(() => []));
    const ids = new Set();
    bank.forEach(question => {
      if (!question || typeof question.id !== "string" || !question.id.trim() || ids.has(question.id)) {
        throw new Error("题目编号缺失或重复，请检查题库数据。");
      }
      ids.add(question.id);
      const source = sourceTypes.indexOf(question.sourceType);
      const difficulty = difficulties.indexOf(question.difficulty);
      if (source < 0 || difficulty < 0) throw new Error(`${question.id} 的来源或难度标记不完整。`);
      cells[source][difficulty].push(question);
    });
    const capacity = cells.map(row => row.map(cell => cell.length));
    const tables = [];
    let totalWeight = 0;

    // Each table represents product(C(cell size, cell quota)) distinct sets.
    // The first two rows determine the last row under the fixed column quotas.
    for (let vb = 0; vb <= Math.min(sourceQuota[0], capacity[0][0]); vb++) {
      for (let vu = 0; vu <= Math.min(sourceQuota[0] - vb, capacity[0][1]); vu++) {
        const va = sourceQuota[0] - vb - vu;
        if (va > capacity[0][2]) continue;
        for (let kb = 0; kb <= Math.min(sourceQuota[1], capacity[1][0]); kb++) {
          for (let ku = 0; ku <= Math.min(sourceQuota[1] - kb, capacity[1][1]); ku++) {
            const ka = sourceQuota[1] - kb - ku;
            if (ka > capacity[1][2]) continue;
            const extension = [difficultyQuota[0] - vb - kb, difficultyQuota[1] - vu - ku, difficultyQuota[2] - va - ka];
            if (extension.some((count, i) => count < 0 || count > capacity[2][i]) || extension.reduce((sum, count) => sum + count, 0) !== sourceQuota[2]) continue;
            const counts = [[vb, vu, va], [kb, ku, ka], extension];
            let weight = 1;
            counts.forEach((row, source) => row.forEach((count, difficulty) => {
              weight *= combination(capacity[source][difficulty], count);
            }));
            totalWeight += weight;
            if (!Number.isSafeInteger(weight) || !Number.isSafeInteger(totalWeight)) throw new Error("题库组合数超出安全范围，请缩小题库后重试。");
            tables.push({ counts, weight });
          }
        }
      }
    }
    if (!tables.length) throw new Error("题库暂不能同时满足来源 7/2/1 与难度 4/4/2，请检查题目配置。");
    const reachableIds = bank.filter(question => {
      const source = sourceTypes.indexOf(question.sourceType);
      const difficulty = difficulties.indexOf(question.difficulty);
      return tables.some(table => table.counts[source][difficulty] > 0);
    }).map(question => question.id);
    return { cells, capacity, tables, totalWeight, reachableIds };
  }

  function analyze(bank) {
    const plan = prepare(bank);
    return {
      size: bank.length,
      sourceTypes: [...sourceTypes], difficulties: [...difficulties],
      sourceQuota: [...sourceQuota], difficultyQuota: [...difficultyQuota],
      capacity: plan.capacity, tables: plan.tables, totalWeight: plan.totalWeight,
      reachableIds: plan.reachableIds,
      unreachableIds: bank.map(question => question.id).filter(id => !plan.reachableIds.includes(id))
    };
  }

  function sample(bank, random = Math.random) {
    if (typeof random !== "function") throw new Error("随机数来源应为函数。");
    const plan = prepare(bank);
    function draw() {
      const value = random();
      if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("随机数必须位于 0（含）到 1（不含）之间。");
      return value;
    }
    function shuffle(items) {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(draw() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
    let ticket = Math.floor(draw() * plan.totalWeight);
    let chosen;
    for (const table of plan.tables) {
      if (ticket < table.weight) { chosen = table; break; }
      ticket -= table.weight;
    }
    const selected = [];
    chosen.counts.forEach((row, source) => row.forEach((count, difficulty) => {
      if (count) selected.push(...shuffle(plan.cells[source][difficulty]).slice(0, count));
    }));
    // Weighted tables + uniform subsets within each table give each valid set
    // the same selection probability; shuffle again to randomize presentation.
    return shuffle(selected);
  }

  return Object.freeze({ analyze, sample });
});
