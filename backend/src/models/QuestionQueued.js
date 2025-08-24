const Question = require("./Question");
const { agenda, waitForJobResult } = require("../jobs/fetchJob");

// Helper do kolejkowania dowolnego pobrania
function queueFetch(method, ...args) {
  return new Promise(async (resolve, reject) => {
    const jobName = "fetch questions";
    let query = {},
      projection = null,
      options = {};
    if (method === "find") {
      [query, projection, options] = args;
    } else if (method === "findOne") {
      [query, projection, options] = args;
      options.limit = 1;
    } else if (method === "countDocuments") {
      [query] = args;
    } else {
      return resolve(await Question[method](...args));
    }

    if (method === "find" || method === "findOne") {
      options = safeOptions(options);
    }

    const job = await agenda.now(jobName, {
      query,
      projection,
      options,
      method,
    });

    try {
      const result = await waitForJobResult(job);
      if (method === "findOne") return resolve(result[0] || null);
      if (method === "countDocuments") return resolve(result); // <-- już liczba!
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

function safeOptions(options = {}) {
  const out = { ...options };
  if (out.skip !== undefined) {
    out.skip = Math.max(0, Math.min(out.skip, 17825792));
  }
  if (out.limit !== undefined) {
    out.limit = Math.max(1, Math.min(out.limit, 500));
  }
  return out;
}

const QuestionQueued = new Proxy(Question, {
  get(target, prop) {
    // Kolejkuj tylko wybrane metody
    if (["find", "findOne", "countDocuments"].includes(prop)) {
      return (...args) => queueFetch(prop, ...args);
    }
    // Pozostałe metody bez zmian
    return target[prop];
  },
});

module.exports = QuestionQueued;
