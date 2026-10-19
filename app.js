(() => {
  "use strict";

  const tabs = [...document.querySelectorAll(".journey-step")];
  const panels = [...document.querySelectorAll(".stage-panel")];
  const lab = document.getElementById("light-lab");
  const journeyDisplay = document.querySelector(".journey-display");
  const previous = document.getElementById("prev-step");
  const next = document.getElementById("next-step");
  let stage = 0;

  function selectStage(index, focus = false) {
    stage = Math.max(0, Math.min(tabs.length - 1, index));
    tabs.forEach((tab, i) => {
      const active = i === stage;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      panels[i].classList.toggle("is-active", active);
    });
    lab.dataset.stage = String(stage);
    lab.setAttribute("aria-label", `同轴全息光路示意，当前展示第${stage + 1}站`);
    document.getElementById("display-counter").textContent = `${String(stage + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
    previous.disabled = stage === 0;
    next.disabled = stage === tabs.length - 1;
    if (focus) tabs[stage].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectStage(index));
    tab.addEventListener("keydown", (event) => {
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
      if (delta) { event.preventDefault(); selectStage((stage + delta + tabs.length) % tabs.length, true); }
      if (event.key === "Home") { event.preventDefault(); selectStage(0, true); }
      if (event.key === "End") { event.preventDefault(); selectStage(tabs.length - 1, true); }
    });
  });
  previous.addEventListener("click", () => selectStage(stage - 1));
  next.addEventListener("click", () => selectStage(stage + 1));

  const heroArt = document.getElementById("hero-art");
  const heroIgnite = document.getElementById("hero-ignite");
  const heroAfterlight = document.getElementById("hero-afterlight");
  heroIgnite.addEventListener("click", () => {
    heroArt.classList.add("is-lit");
    heroIgnite.disabled = true;
    heroIgnite.textContent = "光已点亮";
    heroIgnite.setAttribute("aria-label", "光路已经点亮");
    heroIgnite.setAttribute("aria-expanded", "true");
    heroAfterlight.hidden = false;
  });
  document.getElementById("journey-start").addEventListener("click", () => selectStage(0));
  document.getElementById("hero-afterlight-link").addEventListener("click", () => selectStage(0));
  document.getElementById("phenomenon-continue").addEventListener("click", () => selectStage(0));

  function connectStageReturn(id, index) {
    document.getElementById(id).addEventListener("click", () => {
      selectStage(index);
      requestAnimationFrame(() => {
        journeyDisplay.scrollIntoView({ block: "start" });
        tabs[index].focus({ preventScroll: true });
      });
    });
  }
  document.getElementById("view-real-images").addEventListener("click", () => {
    requestAnimationFrame(() => {
      const title = document.getElementById("discussion-title");
      title.scrollIntoView({ block: "start" });
      title.focus({ preventScroll: true });
    });
  });
  connectStageReturn("knowledge-return-record", 2);
  connectStageReturn("knowledge-return-reference", 1);

  const canvas = document.getElementById("fringe-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const reference = document.getElementById("reference-toggle");
  const object = document.getElementById("object-toggle");
  const distance = document.getElementById("distance");
  const feedback = document.getElementById("experiment-feedback");
  const status = document.getElementById("pattern-status");
  const distanceValue = document.getElementById("distance-value");

  function drawPattern() {
    const n = canvas.width;
    const pixels = ctx.createImageData(n, n);
    const z = Number(distance.value);
    const referenceAmplitude = reference.checked ? 1 : 0;
    const objectAmplitude = object.checked ? .45 : 0;
    const maxIntensity = (1 + .45) ** 2;
    const lambda = .0006328;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const radius = Math.hypot(x - n / 2, y - n / 2) / (n / 2) * .42;
        const phase = 2 * Math.PI * ((radius * radius) / (Math.sqrt(z * z + radius * radius) + z)) / lambda;
        const intensity = referenceAmplitude ** 2 + objectAmplitude ** 2 + 2 * referenceAmplitude * objectAmplitude * Math.cos(phase);
        const t = Math.pow(Math.max(0, intensity / maxIntensity), .72);
        const at = (y * n + x) * 4;
        pixels.data[at] = 35 + 220 * t;
        pixels.data[at + 1] = 68 + 164 * t;
        pixels.data[at + 2] = 70 + 130 * t;
        pixels.data[at + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const position = z < 26 ? "偏近" : z > 42 ? "偏远" : "居中";
    distanceValue.textContent = position;
    distance.setAttribute("aria-valuetext", `记录面相对位置：${position}`);
    if (reference.checked && object.checked) {
      status.textContent = "两束光叠加";
      feedback.textContent = "两束光场叠加后，记录的光强中出现明暗条纹。移动相对位置，观察条纹疏密的定性变化。";
    } else if (reference.checked) {
      status.textContent = "仅显示参考光分量";
      feedback.textContent = "仅显示参考光分量时，记录面仍有光强，但没有两束光之间的干涉项。";
    } else if (object.checked) {
      status.textContent = "仅显示物光分量";
      feedback.textContent = "仅显示物光分量时，同样缺少与参考光叠加产生的干涉项。";
    } else {
      status.textContent = "两个分量均隐藏";
      feedback.textContent = "两个分量都不显示时，模型中的记录面没有光强。";
    }
  }
  [reference, object, distance].forEach(input => input.addEventListener("input", drawPattern));
  if (ctx) drawPattern();

  const coreQuestions = [
    { question: "在 Gabor 同轴全息中，参考光与物光主要来自哪里？", options: ["两台互不相关的激光器", "同一束入射光经过样品后的两部分光场", "相机内部生成的两束光", "激光与环境光"], answer: 1, explanation: "未被样品明显扰动的部分可作为参考光；被样品散射或衍射的部分携带样品信息，成为物光。", topic: "参考光与物光", revisit: "#journey", reviewLabel: "回到第二站 · 遇见 ↗", stageIndex: 1 },
    { question: "记录面上的明暗条纹主要由什么产生？", options: ["物光与参考光叠加后的干涉", "相机自动绘制的样品轮廓", "样品自行发光", "透镜的颜色"], answer: 0, explanation: "两部分相干光叠加，强度随相位差变化，于是出现明暗条纹。可返回互动实验，在模型中分别观察两部分光场。", topic: "干涉记录", revisit: "#observe", reviewLabel: "回到干涉互动 ↗" },
    { question: "普通 CCD/CMOS 探测器直接记录的是哪一种量？", options: ["完整的光波相位", "样品真实三维形貌", "到达记录面的光强分布", "两透镜的焦距"], answer: 2, explanation: "探测器直接记录光强。物光与参考光的干涉让相位差影响光强，因此相关线索被间接编码。", topic: "探测器与相位", revisit: "#knowledge", reviewLabel: "查看知识展签 01 ↗", knowledgeIndex: 0 },
    { question: "前后两张实验图像中同一特征移动了 Δp 个像素，进行尺度换算还需要知道什么？", options: ["相机像元尺寸与系统相关倍率", "样品颜色与网页宽度", "激光器的品牌", "题目总分"], answer: 0, explanation: "图像分析练习采用 Δx = Δp · k / M；k 是像元尺寸，M 是系统相关倍率。倍率需要依据具体系统确定。", topic: "图像分析", revisit: "#discussion", reviewLabel: "回到读图讨论 ↗" }
  ];

  const challenge = document.getElementById("challenge");
  const challengeTitle = document.getElementById("challenge-title");
  const challengeLead = document.getElementById("challenge-lead");
  const knowledgeDetails = [...document.querySelectorAll(".knowledge-list details")];
  const quizCount = document.getElementById("quiz-count");
  const quizScore = document.getElementById("quiz-score");
  const progressFill = document.getElementById("progress-fill");
  const quizContent = document.getElementById("quiz-content");
  const quickPractice = document.getElementById("quick-practice-start");
  const corePractice = document.getElementById("core-practice-return");
  const practiceStatus = document.getElementById("practice-status");
  const fullQuizLink = document.getElementById("full-quiz-link");
  const quizCard = document.getElementById("quiz-card");
  let quizMode = "core";
  let questions = coreQuestions;
  let questionIndex = 0;
  let understood = 0;
  let firstTryCorrect = 0;
  let currentHadMistake = false;
  let completed = false;
  let mistakes = [];
  let practiceLoading = false;

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function updateQuizProgress() {
    quizCount.textContent = completed ? (quizMode === "core" ? "基础检测完成" : "进阶练习完成") : `${quizMode === "core" ? "基础理解" : "进阶练习"} ${questionIndex + 1} / ${questions.length}`;
    quizScore.textContent = `已理解 ${understood} / ${questions.length}`;
    progressFill.style.width = `${100 * (completed ? 1 : (questionIndex + 1) / questions.length)}%`;
  }
  function setChallengeState(state) {
    challenge.classList.toggle("is-focused", state !== "core-start");
    updatePracticeActions();
    if (state === "core-start") {
      challengeTitle.innerHTML = "现在，轮到你解释<br>这张条纹了。";
      challengeLead.textContent = "四道固定引导题对应本次探索的关键概念，每题都有解释与回看路径。想换一组题，也可直接选择下方的随机练习。";
      return;
    }
    const copy = {
      "core-question": ["沿着线索，继续推理", "结合刚才的光路与图像，回答眼前这一题。"],
      "advanced-start": ["随机十题，换个角度检验理解", "从50道有明确来源的题目中抽取十题，以原微课为主；知识补充和少量拓展均有标识。每题可回看对应内容。"],
      "advanced-question": ["把概念用起来", "继续完成本页随机练习；每道题都有解释，遇到疑问可以回看相关内容。"],
      correct: ["这一题的线索找到了", "读完解释，再继续沿着光路前进。"],
      incorrect: ["这一步，还可以再想想", "先看题解与相关内容，再回到这道题重新判断。"],
      "core-summary": ["你已经找到光留下的线索", "四道基础题完成。可回顾错题、留在本页随机练习，或打开配套完整题库。"],
      "advanced-summary": ["这一轮进阶练习完成", "回看容易混淆的知识点，或重新抽取十题继续练习。"]
    };
    [challengeTitle.textContent, challengeLead.textContent] = copy[state];
  }
  function updatePracticeActions() {
    quickPractice.disabled = practiceLoading;
    corePractice.disabled = practiceLoading;
    quickPractice.textContent = practiceLoading ? "正在准备随机题…" : quizMode === "core" ? "本页随机练习 10 题 →" : "重新随机抽取 10 题 ↻";
    corePractice.hidden = quizMode !== "advanced";
    quizContent.querySelectorAll("[data-practice-switch]").forEach(button => { button.disabled = practiceLoading; });
  }
  function categoryFor(question) {
    if (question.topic) return {
      topic: question.topic,
      revisit: question.revisit,
      reviewLabel: question.reviewLabel,
      lessonTime: question.lessonTime,
      stageIndex: question.stageIndex,
      knowledgeIndex: question.knowledgeIndex
    };
    const text = question.question;
    if (/背景图像/.test(text)) return { topic: "背景图像与参考光", revisit: "#knowledge", reviewLabel: "查看知识展签 03 ↗", knowledgeIndex: 2 };
    if (/针段红色轮廓|传播波纹/.test(text)) return { topic: "样品如何改变光", revisit: "#journey", reviewLabel: "回到第二站 · 遇见 ↗", stageIndex: 1 };
    if (/记录图像过暗|环境光|透镜表面|扩束准直|光阑|偏振片|激光光源|氦氖|632\.8|焦距|透镜间距|相干长度/.test(text)) return { topic: "光源与器件", revisit: "#lesson", reviewLabel: "回看完整微课 ↗" };
    if (/图像分析|像元|像素|Δx|Δp|倍率|平移台|回程|尺度/.test(text)) return { topic: "图像分析", revisit: "#discussion", reviewLabel: "回到读图讨论 ↗" };
    if (/传统光学全息与数字全息/.test(text)) return { topic: "数字记录", revisit: "#lesson", reviewLabel: "回看完整微课 ↗" };
    if (/CCD|CMOS|探测器|记录面的光强/.test(text)) return { topic: "探测器与相位", revisit: "#knowledge", reviewLabel: "查看知识展签 01 ↗", knowledgeIndex: 0 };
    if (/参考光|物光|直透|独立参考光路/.test(text)) return { topic: "参考光与物光", revisit: "#journey", reviewLabel: "回到第二站 · 遇见 ↗", stageIndex: 1 };
    if (/干涉|相干|振动/.test(text)) return { topic: "干涉记录", revisit: "#observe", reviewLabel: "回到干涉互动 ↗" };
    return { topic: "微课与应用", revisit: "#lesson", reviewLabel: "回看完整微课 ↗" };
  }
  function createReviewLink(target, label) {
    const link = element("a", "", label || target.reviewLabel || "回看相关内容 ↗");
    link.href = target.revisit;
    link.addEventListener("click", () => {
      let preciseTarget;
      let focusTarget;
      let scrollBlock = "center";
      if (Number.isInteger(target.stageIndex)) {
        selectStage(target.stageIndex);
        preciseTarget = panels[target.stageIndex];
        focusTarget = tabs[target.stageIndex];
      } else if (Number.isInteger(target.knowledgeIndex)) {
        preciseTarget = knowledgeDetails[target.knowledgeIndex];
        preciseTarget.open = true;
        focusTarget = preciseTarget.querySelector("summary");
      } else if (target.revisit === "#lesson" && Number.isFinite(target.lessonTime)) {
        lessonWantsToPlay = false;
        if (lessonPendingSeek) lessonPendingSeek.play = false;
        lessonVideo.pause();
        seekLesson(target.lessonTime);
        preciseTarget = lessonPlayer;
        focusTarget = lessonVideo;
      } else if (target.revisit === "#discussion") {
        preciseTarget = document.getElementById("discussion-title");
        focusTarget = preciseTarget;
        scrollBlock = "start";
      }
      if (preciseTarget) requestAnimationFrame(() => {
        preciseTarget.scrollIntoView({ block: scrollBlock });
        focusTarget.focus({ preventScroll: true });
      });
    });
    return link;
  }
  document.querySelectorAll(".discussion-video-return[data-lesson-time]").forEach(link => {
    const replacement = createReviewLink({ revisit: "#lesson", lessonTime: Number(link.dataset.lessonTime) }, link.textContent);
    replacement.className = link.className;
    replacement.dataset.lessonTime = link.dataset.lessonTime;
    link.replaceWith(replacement);
  });
  function sourceClock(seconds) {
    const time = Math.floor(seconds);
    return `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
  }
  function createSourceNote(question) {
    const note = element("p", "quiz-source");
    const knowledgeNavigation = question.sourceType === "knowledge" ? question.source.section.split("；").map(section => ({
      "实验装置与光路": "实验装置",
      "Gabor同轴全息记录原理": "记录原理",
      "实验操作六步": "实验操作",
      "图像比较与尺度换算": "图像分析",
      "关键概念辨析": "关键辨析"
    }[section] || section)).join("、") : "";
    if (question.sourceType === "video") {
      note.append(createReviewLink(question, `依据：微课 ${sourceClock(question.source.start)}—${sourceClock(question.source.end)} · ${question.source.section}`));
    } else {
      const link = element("a", "", `${question.sourceType === "knowledge" ? "配套知识总结" : "拓展依据"} · ${knowledgeNavigation || question.source.section} ↗`);
      link.href = question.source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (question.sourceType === "knowledge") link.title = `新窗口打开后，选择“${knowledgeNavigation}”栏目；对应内容：${question.source.section}`;
      note.append(link);
    }
    note.append(document.createTextNode(` · ${question.source.basis}`));
    if (question.sourceType === "knowledge") note.append(document.createTextNode("（打开后选择对应栏目）"));
    if (question.sourceType === "extension") {
      note.append(element("span", "quiz-source-connection", question.source.connection));
    }
    return note;
  }
  function renderQuestion() {
    completed = false;
    updateQuizProgress();
    setChallengeState(quizMode === "core" ? (questionIndex === 0 && !currentHadMistake ? "core-start" : "core-question") : (questionIndex === 0 ? "advanced-start" : "advanced-question"));
    quizContent.replaceChildren();
    const current = questions[questionIndex];
    const sourceLabels = { video: "微课核心", knowledge: "知识补充", extension: "进阶拓展（非微课核心）" };
    const kicker = element("p", "quiz-kicker", quizMode === "core" ? "基础理解 · 固定四题" : `${sourceLabels[current.sourceType]} · 难度：${current.difficulty}`);
    const heading = element("h3", "quiz-question", current.question);
    const options = element("div", "quiz-options");
    const response = element("div", "quiz-feedback");
    response.hidden = true;
    const actions = element("div", "quiz-actions");
    const optionButtons = current.options.map((option, index) => {
      const button = element("button", "quiz-option");
      button.type = "button";
      const letter = element("span", "quiz-letter", String.fromCharCode(65 + index));
      button.append(letter, document.createTextNode(option));
      button.addEventListener("click", () => {
        optionButtons.forEach(item => item.disabled = true);
        const right = index === current.answer;
        button.classList.add(right ? "is-correct" : "is-wrong");
        response.hidden = false;
        response.replaceChildren();
        const result = element("strong", "", right ? "答对了。" : "再想一想。 ");
        const explanation = element("span", "", current.explanation);
        response.append(result, explanation);
        if (Array.isArray(current.optionExplanations) && current.optionExplanations.length === current.options.length) {
          const details = element("details", "option-explanations");
          details.append(element("summary", "", "逐项看判断依据（A—D）"));
          const list = element("ul");
          current.optionExplanations.forEach((reason, optionIndex) => {
            list.append(element("li", "", `${String.fromCharCode(65 + optionIndex)}：${reason}`));
          });
          details.append(list);
          response.append(details);
        }
        actions.replaceChildren();
        if (right) {
          setChallengeState("correct");
          understood++;
          if (!currentHadMistake) firstTryCorrect++;
          updateQuizProgress();
          const move = element("button", "quiz-next", questionIndex === questions.length - 1 ? "查看学习回顾 →" : "进入下一题 →");
          move.type = "button";
          move.addEventListener("click", () => {
            if (questionIndex === questions.length - 1) renderSummary();
            else { questionIndex++; currentHadMistake = false; renderQuestion(); }
          });
          actions.append(move);
        } else {
          setChallengeState("incorrect");
          const target = categoryFor(current);
          if (!currentHadMistake) mistakes.push(target);
          currentHadMistake = true;
          const review = createReviewLink(target);
          const retry = element("button", "quiz-next", "再试一次 ↻");
          retry.type = "button";
          retry.addEventListener("click", renderQuestion);
          actions.append(review, retry);
        }
      });
      options.append(button);
      return button;
    });
    quizContent.append(kicker, heading);
    if (quizMode !== "core") quizContent.append(createSourceNote(current));
    quizContent.append(options, response, actions);
  }
  function resetQuiz(mode, selected) {
    quizMode = mode;
    questions = selected;
    questionIndex = 0;
    understood = 0;
    firstTryCorrect = 0;
    currentHadMistake = false;
    mistakes = [];
    renderQuestion();
  }
  async function startAdvanced() {
    if (practiceLoading) return;
    practiceLoading = true;
    updatePracticeActions();
    practiceStatus.hidden = true;
    try {
      const response = await fetch("quiz-bank.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("题库暂时无法加载");
      const data = await response.json();
      if (!Array.isArray(data.questions) || data.questions.length !== 50) throw new Error("题库数据不完整");
      resetQuiz("advanced", QuizSampler.sample(data.questions));
    } finally {
      practiceLoading = false;
      updatePracticeActions();
    }
  }
  quickPractice.addEventListener("click", async () => {
    try {
      await startAdvanced();
      quizCard.scrollIntoView({ block: "start" });
    } catch {
      practiceStatus.textContent = "随机题暂时未加载，请重试，或在新窗口打开完整题库。";
      practiceStatus.hidden = false;
    }
  });
  corePractice.addEventListener("click", () => {
    practiceStatus.hidden = true;
    resetQuiz("core", coreQuestions);
    quizCard.scrollIntoView({ block: "start" });
  });
  function renderSummary() {
    completed = true;
    updateQuizProgress();
    setChallengeState(quizMode === "core" ? "core-summary" : "advanced-summary");
    quizContent.replaceChildren();
    const section = element("div", "quiz-summary");
    const heading = element("h3", "", "这一束光，你已经读懂了。 ");
    const paragraph = element("p", "", `本轮 ${questions.length} 题全部完成；其中 ${firstTryCorrect} 题首次作答正确。`);
    section.append(heading, paragraph);
    const unique = [...new Map(mistakes.map(item => [`${item.topic}|${item.revisit}|${item.stageIndex ?? ""}|${item.knowledgeIndex ?? ""}|${item.lessonTime ?? ""}`, item])).values()];
    if (unique.length) {
      section.append(element("p", "", "建议再看一眼这些知识点："));
      const list = element("ul", "review-list");
      unique.forEach(item => { const li = element("li"); li.append(createReviewLink(item, `${item.topic} ↗`)); list.append(li); });
      section.append(list);
    } else section.append(element("p", "", quizMode === "core" ? "四个关键概念掌握得很稳，可以随机抽题或打开完整题库继续巩固。" : "这轮题目全部答对了。可以重新抽题，检验对不同知识点的理解。"));
    const actions = element("div", "quiz-actions");
    const restart = element("button", "quiz-restart", "再做一次基础练习");
    restart.type = "button";
    restart.dataset.practiceSwitch = "";
    restart.addEventListener("click", () => resetQuiz("core", coreQuestions));
    const advanced = element("button", "quiz-next", quizMode === "core" ? "留在本页，随机练习 10 题 →" : "本页再抽 10 题 →");
    advanced.type = "button";
    advanced.dataset.practiceSwitch = "";
    advanced.addEventListener("click", async () => {
      advanced.disabled = true;
      advanced.textContent = "正在准备题目…";
      try { await startAdvanced(); }
      catch { advanced.disabled = false; advanced.textContent = "重新加载随机题"; section.append(element("p", "quiz-error", "随机题暂时未加载，请重试或打开完整题库。")); }
    });
    const fullBank = element("a", "quiz-restart", "打开完整题库 ↗");
    fullBank.href = fullQuizLink.href;
    fullBank.target = "_blank";
    fullBank.rel = "noopener noreferrer";
    fullBank.setAttribute("aria-label", "打开配套完整题库，新窗口打开");
    actions.append(advanced, fullBank, restart);
    section.append(actions);
    quizContent.append(section);
  }

  // The unchanged teaching film is delivered in short, consecutive MP4 files.
  // These durations come from each file's MP4 header and let the controls show
  // one timeline before every segment has downloaded.
  const lessonSegments = [
    { src: "media/lesson-00.mp4", duration: 70.034 },
    { src: "media/lesson-01.mp4", duration: 70 },
    { src: "media/lesson-02.mp4", duration: 65 },
    { src: "media/lesson-03.mp4", duration: 70 },
    { src: "media/lesson-04.mp4", duration: 65 },
    { src: "media/lesson-05.mp4", duration: 70 },
    { src: "media/lesson-06.mp4", duration: 70 },
    { src: "media/lesson-07.mp4", duration: 65 },
    { src: "media/lesson-08.mp4", duration: 8.954 }
  ];
  const lessonStartTimes = [0];
  lessonSegments.forEach(segment => lessonStartTimes.push(lessonStartTimes.at(-1) + segment.duration));
  const lessonDuration = lessonStartTimes.at(-1);
  const lessonPlayer = document.getElementById("lesson-player");
  const lessonVideo = document.getElementById("lesson-video");
  const lessonPlay = document.getElementById("lesson-play");
  const lessonSeek = document.getElementById("lesson-seek");
  const lessonTime = document.getElementById("lesson-time");
  const lessonMute = document.getElementById("lesson-mute");
  const lessonFullscreen = document.getElementById("lesson-fullscreen");
  const lessonStatus = document.getElementById("lesson-status");
  let lessonSegmentIndex = 0;
  let lessonPendingSeek = null;
  let lessonWantsToPlay = false;
  let lessonScrubbing = false;
  let lessonBlobUrl = null;
  let lessonBlobIndex = -1;
  let lessonFetchController = null;
  let lessonLoadVersion = 0;

  function lessonClock(seconds) {
    const whole = seconds >= lessonDuration - 0.001 ? Math.ceil(lessonDuration) : Math.floor(Math.max(0, seconds) + 0.001);
    return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
  }
  function lessonAbsoluteTime() {
    if (lessonPendingSeek) return lessonStartTimes[lessonSegmentIndex] + lessonPendingSeek.time;
    if (lessonSegmentIndex === lessonSegments.length - 1 && lessonVideo.ended) return lessonDuration;
    return Math.min(lessonDuration, lessonStartTimes[lessonSegmentIndex] + (Number.isFinite(lessonVideo.currentTime) ? lessonVideo.currentTime : 0));
  }
  function showLessonStatus(message) {
    lessonStatus.textContent = message;
    lessonStatus.hidden = !message;
  }
  function updateLessonControls(previewTime) {
    const time = Math.min(lessonDuration, Math.max(0, previewTime ?? lessonAbsoluteTime()));
    if (!lessonScrubbing || previewTime !== undefined) lessonSeek.value = String(time);
    lessonSeek.setAttribute("aria-valuetext", `${lessonClock(time)}，共 ${lessonClock(lessonDuration)}`);
    lessonTime.textContent = `${lessonClock(time)} / ${lessonClock(lessonDuration)}`;
    const playing = lessonWantsToPlay || !lessonVideo.paused;
    lessonPlay.textContent = playing ? "❚❚" : "▶";
    lessonPlay.setAttribute("aria-label", playing ? "暂停视频" : "播放视频");
    lessonMute.textContent = lessonVideo.muted ? "🔇" : "🔊";
    lessonMute.setAttribute("aria-label", lessonVideo.muted ? "恢复声音" : "静音");
  }
  function tryPlayLesson() {
    lessonWantsToPlay = true;
    updateLessonControls();
    const request = lessonVideo.play();
    if (request && typeof request.catch === "function") {
      request.catch(() => {
        lessonWantsToPlay = false;
        showLessonStatus("视频暂时无法播放，请检查连接后点击播放重试。");
        updateLessonControls();
      });
    }
  }
  function loadLessonSegment(index, localTime, playAfterLoad) {
    const version = ++lessonLoadVersion;
    if (lessonFetchController) lessonFetchController.abort();
    lessonVideo.pause();
    lessonSegmentIndex = index;
    lessonPendingSeek = {
      time: Math.max(0, Math.min(localTime, lessonSegments[index].duration - 0.05)),
      play: playAfterLoad,
      ready: false
    };
    lessonWantsToPlay = playAfterLoad;
    showLessonStatus(localTime > 0.1 ? "正在读取目标位置…" : playAfterLoad ? "正在接续视频…" : "正在定位视频…");
    if (localTime > 0.1 && lessonBlobUrl && lessonBlobIndex === index) {
      lessonVideo.src = lessonBlobUrl;
      lessonVideo.load();
    } else if (localTime > 0.1) {
      // A simple local preview server may not support HTTP byte ranges. Load
      // only the requested short segment as a Blob so any position is seekable.
      const controller = new AbortController();
      lessonFetchController = controller;
      fetch(lessonSegments[index].src, { signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error("Video segment unavailable");
          return response.blob();
        })
        .then(blob => {
          if (version !== lessonLoadVersion) return;
          const oldUrl = lessonBlobUrl;
          lessonBlobUrl = URL.createObjectURL(blob);
          lessonBlobIndex = index;
          lessonVideo.src = lessonBlobUrl;
          lessonVideo.load();
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          lessonFetchController = null;
        })
        .catch(error => {
          if (version !== lessonLoadVersion || error.name === "AbortError") return;
          lessonFetchController = null;
          lessonPendingSeek = { time: 0, play: playAfterLoad, ready: false };
          lessonVideo.src = lessonSegments[index].src;
          lessonVideo.load();
          showLessonStatus("暂时无法定位到该时间，正在从本段开头继续。");
        });
    } else {
      lessonVideo.src = lessonSegments[index].src;
      lessonVideo.load();
      if (lessonBlobUrl) {
        URL.revokeObjectURL(lessonBlobUrl);
        lessonBlobUrl = null;
        lessonBlobIndex = -1;
      }
    }
    updateLessonControls();
  }
  function seekLesson(absoluteTime) {
    const time = Math.max(0, Math.min(lessonDuration - 0.05, absoluteTime));
    let index = lessonSegments.findIndex((segment, i) => time < lessonStartTimes[i + 1]);
    if (index < 0) index = lessonSegments.length - 1;
    const localTime = time - lessonStartTimes[index];
    let alreadyBuffered = false;
    // Buffered bytes do not guarantee seeking when a preview server has no
    // byte-range support. Only reuse a segment if its seekable range permits it.
    for (let i = 0; i < lessonVideo.seekable.length; i++) {
      if (localTime >= lessonVideo.seekable.start(i) && localTime <= lessonVideo.seekable.end(i)) alreadyBuffered = true;
    }
    if (index === lessonSegmentIndex && !lessonPendingSeek && lessonVideo.readyState >= 1 && alreadyBuffered) {
      lessonVideo.currentTime = localTime;
      updateLessonControls(time);
      return;
    }
    loadLessonSegment(index, localTime, lessonWantsToPlay || !lessonVideo.paused);
  }
  function toggleLessonPlayback() {
    if (lessonWantsToPlay || !lessonVideo.paused) {
      lessonWantsToPlay = false;
      if (lessonPendingSeek) lessonPendingSeek.play = false;
      lessonVideo.pause();
      showLessonStatus("");
      updateLessonControls();
      return;
    }
    if (lessonPendingSeek) {
      lessonWantsToPlay = true;
      lessonPendingSeek.play = true;
      showLessonStatus("正在定位视频…");
      updateLessonControls();
    } else if (lessonVideo.ended && lessonSegmentIndex === lessonSegments.length - 1) {
      loadLessonSegment(0, 0, true);
    } else if (lessonVideo.error) {
      loadLessonSegment(lessonSegmentIndex, lessonVideo.currentTime || 0, true);
    } else {
      tryPlayLesson();
    }
  }

  lessonPlay.addEventListener("click", toggleLessonPlayback);
  lessonVideo.addEventListener("click", toggleLessonPlayback);
  lessonVideo.addEventListener("keydown", event => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleLessonPlayback();
    }
  });
  lessonVideo.addEventListener("loadedmetadata", () => {
    if (!lessonPendingSeek) return;
    const pending = lessonPendingSeek;
    if (pending.time < 0.1) {
      lessonPendingSeek = null;
      if (pending.play) tryPlayLesson();
      else { showLessonStatus(""); updateLessonControls(); }
      return;
    }
    pending.ready = true;
    try {
      lessonVideo.currentTime = Math.min(pending.time, Math.max(0, lessonVideo.duration - 0.05));
    } catch {
      lessonPendingSeek = null;
      lessonWantsToPlay = false;
      showLessonStatus("这一位置暂时无法读取，请点击播放后重试。");
      updateLessonControls();
    }
  });
  lessonVideo.addEventListener("seeked", () => {
    if (!lessonPendingSeek || !lessonPendingSeek.ready) return;
    const pending = lessonPendingSeek;
    lessonPendingSeek = null;
    if (pending.play) tryPlayLesson();
    else { showLessonStatus(""); updateLessonControls(); }
  });
  lessonVideo.addEventListener("timeupdate", () => {
    if (!lessonScrubbing) updateLessonControls();
  });
  lessonVideo.addEventListener("playing", () => {
    lessonWantsToPlay = true;
    lessonVideo.removeAttribute("poster");
    showLessonStatus("");
    updateLessonControls();
  });
  lessonVideo.addEventListener("pause", () => {
    if (!lessonPendingSeek) lessonWantsToPlay = false;
    updateLessonControls();
  });
  lessonVideo.addEventListener("waiting", () => {
    if (lessonWantsToPlay) showLessonStatus("正在缓冲视频…");
  });
  lessonVideo.addEventListener("stalled", () => {
    if (lessonWantsToPlay) showLessonStatus("视频加载较慢，正在继续尝试…");
  });
  lessonVideo.addEventListener("error", () => {
    lessonPendingSeek = null;
    lessonWantsToPlay = false;
    showLessonStatus("视频片段未能加载，请检查连接后点击播放重试。");
    updateLessonControls();
  });
  lessonVideo.addEventListener("ended", () => {
    if (lessonSegmentIndex < lessonSegments.length - 1) {
      loadLessonSegment(lessonSegmentIndex + 1, 0, true);
    } else {
      lessonWantsToPlay = false;
      showLessonStatus("视频播放完毕。点击播放可从头观看。");
      updateLessonControls(lessonDuration);
    }
  });
  lessonSeek.max = String(lessonDuration);
  lessonSeek.addEventListener("input", () => {
    lessonScrubbing = true;
    updateLessonControls(Number(lessonSeek.value));
  });
  lessonSeek.addEventListener("change", () => {
    lessonScrubbing = false;
    seekLesson(Number(lessonSeek.value));
  });
  lessonMute.addEventListener("click", () => {
    lessonVideo.muted = !lessonVideo.muted;
    updateLessonControls();
  });
  lessonFullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (lessonPlayer.requestFullscreen) await lessonPlayer.requestFullscreen();
      else if (lessonVideo.webkitEnterFullscreen) lessonVideo.webkitEnterFullscreen();
      else showLessonStatus("当前浏览器不支持全屏播放。");
    } catch {
      showLessonStatus("当前浏览器未能进入全屏，请在浏览器中继续观看。");
    }
  });
  document.addEventListener("fullscreenchange", () => {
    lessonFullscreen.setAttribute("aria-label", document.fullscreenElement ? "退出全屏" : "全屏播放");
    lessonFullscreen.title = document.fullscreenElement ? "退出全屏" : "全屏播放";
  });
  updateLessonControls();
  renderQuestion();
})();
