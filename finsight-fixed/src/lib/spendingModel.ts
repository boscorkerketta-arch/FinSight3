// Pure browser-compatible random forest regression (replaces ml-random-forest)
class DecisionTreeNode {
  feature: number | null = null;
  threshold: number | null = null;
  value: number | null = null;
  left: DecisionTreeNode | null = null;
  right: DecisionTreeNode | null = null;
}

class SimpleDecisionTree {
  private maxDepth: number;
  private minSamplesLeaf: number;
  private root: DecisionTreeNode | null = null;

  constructor(opts: { maxDepth?: number; minSamplesLeaf?: number } = {}) {
    this.maxDepth = opts.maxDepth ?? 4;
    this.minSamplesLeaf = opts.minSamplesLeaf ?? 2;
  }

  train(X: number[][], y: number[], indices?: number[]) {
    const idx = indices ?? X.map((_, i) => i);
    this.root = this.buildNode(X, y, idx, 0);
  }

  private buildNode(X: number[][], y: number[], idx: number[], depth: number): DecisionTreeNode {
    const node = new DecisionTreeNode();
    if (idx.length <= this.minSamplesLeaf || depth >= this.maxDepth) {
      node.value = idx.reduce((s, i) => s + y[i], 0) / idx.length;
      return node;
    }
    let bestGain = -Infinity, bestFeature = 0, bestThreshold = 0;
    const nFeatures = X[0].length;
    for (let f = 0; f < nFeatures; f++) {
      const vals = [...new Set(idx.map(i => X[i][f]))].sort((a, b) => a - b);
      for (let t = 0; t < vals.length - 1; t++) {
        const thresh = (vals[t] + vals[t + 1]) / 2;
        const left = idx.filter(i => X[i][f] <= thresh);
        const right = idx.filter(i => X[i][f] > thresh);
        if (left.length < this.minSamplesLeaf || right.length < this.minSamplesLeaf) continue;
        const gain = -this.mse(y, left) * left.length - this.mse(y, right) * right.length;
        if (gain > bestGain) { bestGain = gain; bestFeature = f; bestThreshold = thresh; }
      }
    }
    if (bestGain === -Infinity) {
      node.value = idx.reduce((s, i) => s + y[i], 0) / idx.length;
      return node;
    }
    node.feature = bestFeature; node.threshold = bestThreshold;
    node.left = this.buildNode(X, y, idx.filter(i => X[i][bestFeature] <= bestThreshold), depth + 1);
    node.right = this.buildNode(X, y, idx.filter(i => X[i][bestFeature] > bestThreshold), depth + 1);
    return node;
  }

  private mse(y: number[], idx: number[]) {
    if (!idx.length) return 0;
    const mean = idx.reduce((s, i) => s + y[i], 0) / idx.length;
    return idx.reduce((s, i) => s + (y[i] - mean) ** 2, 0) / idx.length;
  }

  predictOne(x: number[]): number {
    let node = this.root!;
    while (node.value === null) {
      node = x[node.feature!] <= node.threshold! ? node.left! : node.right!;
    }
    return node.value;
  }
}

class RandomForestRegression {
  private trees: SimpleDecisionTree[] = [];
  private nEstimators: number;
  private treeOptions: { maxDepth?: number; minSamplesLeaf?: number };
  private seed: number;

  constructor(opts: { nEstimators?: number; treeOptions?: { maxDepth?: number; minSamplesLeaf?: number }; seed?: number } = {}) {
    this.nEstimators = opts.nEstimators ?? 10;
    this.treeOptions = opts.treeOptions ?? {};
    this.seed = opts.seed ?? 42;
  }

  train(X: number[][], y: number[]) {
    this.trees = [];
    let rng = this.seed;
    const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };
    for (let t = 0; t < this.nEstimators; t++) {
      const idx = Array.from({ length: X.length }, () => Math.floor(rand() * X.length));
      const tree = new SimpleDecisionTree(this.treeOptions);
      tree.train(X, y, idx);
      this.trees.push(tree);
    }
  }

  predict(X: number[][]): number[] {
    return X.map(x => this.trees.reduce((s, t) => s + t.predictOne(x), 0) / this.trees.length);
  }
}

export interface MonthRecord {
  month: number;              // 1–12
  days_in_period: number;
  total_budget: number;
  already_spent_start: number;   // how much was spent before the period (carry-over / opening)
  planned_expenses: number;      // sum of all upcoming large spends that month
  free_balance: number;          // total_budget - already_spent_start - planned_expenses
  unplanned_actual: number;      // surprise spend that actually happened
}

export interface UpcomingExpense {
  label: string;
  amount: number;
  days_from_now: number;
}

export interface SpendingInput {
  total_budget: number;
  already_spent: number;
  days_remaining: number;
  month: number;                                      // current month (1–12)
  upcoming_expenses: UpcomingExpense[];
  override_buffer_pct?: number;                       // Optional override
}

export interface SpendingOutput {
  daily_allowance: number;
  recommended_buffer_pct: number;   // from the ML model
  remaining_balance: number;
  locked_for_upcoming: number;
  buffer_amount: number;
  truly_free_balance: number;
  days_remaining: number;
  is_overspent: boolean;
  model_confidence: 'low' | 'medium' | 'high';
  warning: string;
}

function extractFeatures(record: MonthRecord): [number[], number] {
  const safeFree = Math.max(record.free_balance, 1);
  const unplannedRatio = record.unplanned_actual / safeFree;

  const monthSin = Math.sin(2 * Math.PI * record.month / 12);
  const monthCos = Math.cos(2 * Math.PI * record.month / 12);

  const budgetScale = record.total_budget / 10000;
  const plannedFraction = record.planned_expenses / Math.max(record.total_budget, 1);
  const daysNorm = record.days_in_period / 30;

  return [
    [monthSin, monthCos, budgetScale, plannedFraction, daysNorm],
    unplannedRatio
  ];
}

function buildFeaturesForPrediction(inp: SpendingInput, locked: number): number[] {
  const monthSin = Math.sin(2 * Math.PI * inp.month / 12);
  const monthCos = Math.cos(2 * Math.PI * inp.month / 12);
  const budgetScale = inp.total_budget / 10000;
  const plannedFraction = locked / Math.max(inp.total_budget, 1);
  const daysNorm = inp.days_remaining / 30;

  return [monthSin, monthCos, budgetScale, plannedFraction, daysNorm];
}

export class SpendingModel {
  private rf: RandomForestRegression | null = null;
  private isTrained = false;
  private nSamples = 0;
  private historicalRatios: number[] = [];
  private readonly MIN_TRAIN_SAMPLES = 3;
  private readonly FALLBACK_BUFFER_PCT = 0.12;

  constructor() {
    // Initialize with default options if needed
  }

  fit(records: MonthRecord[]) {
    if (records.length < this.MIN_TRAIN_SAMPLES) {
      this.historicalRatios = records.map(r => extractFeatures(r)[1]);
      this.isTrained = false;
      return {
        status: "insufficient_data",
        samples: records.length,
        needed: this.MIN_TRAIN_SAMPLES,
        fallback_buffer_pct: this.FALLBACK_BUFFER_PCT * 100,
      };
    }

    const X: number[][] = [];
    const y: number[] = [];
    this.historicalRatios = [];

    for (const r of records) {
      const [features, ratio] = extractFeatures(r);
      X.push(features);
      y.push(Math.max(ratio, 0));
      this.historicalRatios.push(ratio);
    }

    this.rf = new RandomForestRegression({
      nEstimators: 100,
      treeOptions: {
        maxDepth: 4,
        minSamplesLeaf: 2
      },
      seed: 42
    });

    this.rf.train(X, y);
    this.isTrained = true;
    this.nSamples = records.length;

    return {
      status: "trained",
      samples: this.nSamples,
      avg_historical_buffer_pct: (y.reduce((a, b) => a + b, 0) / y.length) * 100,
    };
  }

  private recommendBuffer(features: number[]): [number, 'low' | 'medium' | 'high'] {
    if (this.isTrained && this.rf) {
      const pred = this.rf.predict([features])[0];
      let buffer = pred;

      if (this.historicalRatios.length > 0) {
        const sortedRatios = [...this.historicalRatios].sort((a, b) => a - b);
        const p80Index = Math.floor(sortedRatios.length * 0.8);
        const p80 = sortedRatios[p80Index] || 0;
        buffer = Math.max(pred, p80 * 0.6);
      }

      buffer = Math.max(0.05, Math.min(buffer, 0.40));
      const confidence = this.nSamples >= 8 ? "high" : this.nSamples >= 4 ? "medium" : "low";
      return [buffer, confidence];
    } else if (this.historicalRatios.length > 0) {
      const sortedRatios = [...this.historicalRatios].sort((a, b) => a - b);
      const p75Index = Math.floor(sortedRatios.length * 0.75);
      const p75 = sortedRatios[p75Index] || 0;
      const buffer = Math.max(0.05, Math.min(p75, 0.40));
      return [buffer, "low"];
    } else {
      return [this.FALLBACK_BUFFER_PCT, "low"];
    }
  }

  predict(inp: SpendingInput): SpendingOutput {
    if (inp.days_remaining <= 0) {
      throw new Error("days_remaining must be >= 1");
    }

    const remaining_balance = inp.total_budget - inp.already_spent;

    const locked_for_upcoming = inp.upcoming_expenses
      .filter(e => e.days_from_now >= 0 && e.days_from_now <= inp.days_remaining)
      .reduce((sum, e) => sum + e.amount, 0);

    const after_upcoming = remaining_balance - locked_for_upcoming;

    const features = buildFeaturesForPrediction(inp, locked_for_upcoming);
    let [buffer_pct, confidence] = this.recommendBuffer(features);

    if (inp.override_buffer_pct !== undefined && inp.override_buffer_pct !== null) {
      buffer_pct = inp.override_buffer_pct / 100;
      confidence = "high"; // Manual override is "high confidence"
    }

    const buffer_amount = Math.max(after_upcoming * buffer_pct, 0);
    const truly_free = after_upcoming - buffer_amount;

    let daily_allowance = 0;
    let warning = "Looking good.";

    if (truly_free <= 0) {
      daily_allowance = 0;
      warning = "Upcoming expenses + buffer eat your entire remaining balance. Review your plan.";
    } else {
      daily_allowance = Math.floor((truly_free / inp.days_remaining) * 100) / 100;
      if (remaining_balance < 0) {
        warning = "Already overspent your total budget.";
      } else if (daily_allowance < 100) {
        warning = "Daily allowance is tight. Consider pushing a planned expense or reducing buffer.";
      }
    }

    return {
      daily_allowance: Number(daily_allowance.toFixed(2)),
      recommended_buffer_pct: Number((buffer_pct * 100).toFixed(1)),
      remaining_balance: Number(remaining_balance.toFixed(2)),
      locked_for_upcoming: Number(locked_for_upcoming.toFixed(2)),
      buffer_amount: Number(buffer_amount.toFixed(2)),
      truly_free_balance: Number(truly_free.toFixed(2)),
      days_remaining: inp.days_remaining,
      is_overspent: remaining_balance < 0,
      model_confidence: confidence,
      warning: warning,
    };
  }
}
