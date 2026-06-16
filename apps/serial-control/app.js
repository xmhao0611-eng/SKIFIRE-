const STORAGE_KEY = "serialNovelControl:v1";
const USAGE_STORAGE_KEY = "serialNovelControl:usage:v1";
const USAGE_LAST_IMPORT_KEY = "serialNovelControl:usage:lastImportBatch:v1";
const AI_TASK_STORAGE_KEY = "serialNovelControl:aiTasks:v1";
const USAGE_RECORD_LIMIT = 1000;
const AI_TASK_RECORD_LIMIT = 30;
const CODEX_RECOMMENDED_MODEL = "gpt-5.5";
const DEFAULT_CODEX_REASONING_EFFORT = "high";
const CORPUS_SCALE_TASK = "corpusScale";
const MEMORY_CARD_REFRESH_GAP = 4;
const UPDATE_NOTICE_ITEMS = [
  "新增 AI诊断修复中心一级页面：质量门、长篇体检、发布检查和大纲检查的问题可以统一转成任务，再分流到正文修复、大纲补充、记忆卡补充、方向避坑和作者确认。",
  "修改任务清单新增 AI 处理面板：可勾选待办后生成修改方案、按任务修正文，并让 AI 复查任务是否解决。",
  "Codex websocket 断开但 HTTP fallback 已产出可用内容时，不再误判为生成失败；AI资料库扫描上下文进一步压缩。",
  "AI资料库快速更新稳定性增强：每批最多读取 2 章，断流后保留已完成批次，并提示先打开项目再更新。",
  "写作首页新增质量债务状态卡：未处理修改任务和保存记录待复查会在生成前直接提醒。",
  "AI资料库新增质量债务卡：汇总未处理修改任务和保存记录待复查，生成前更容易先处理质量风险。",
  "AI资料库面板新增保存记录待复查提示：如果章节保存时仍带高优先级修改任务，会在章节兑现核对和风险区直接显示。",
  "本章兑现记录新增未处理高优先级修改任务字段：保存章节后，AI资料库可回读哪些 P0 待办仍需补偿或复查。",
  "保存前质量门新增未处理高优先级修改任务提示：长篇体检或发布检查留下的 P0 待办会在正文入库前提醒，并沿用“确认仍保存”二次确认。",
  "修改任务清单新增“应用复查结论”：长篇体检或发布检查复查后，可把已解决、不适用、仍存在等结论回填到任务状态。",
  "长篇体检和发布检查新增未处理修改任务复查：会要求 AI 判断待办已解决、仍存在、部分解决或不适用，并继续产出结构化修改任务。",
  "未处理修改任务会反哺后续 AI：正文生成、润色、长篇体检和发布检查会看到当前待办，减少同类问题反复出现。",
  "长篇体检和发布检查的修改任务支持结构化提取：按“问题/影响/怎么改/优先级/验证”输出时，会自动生成更完整的待办。",
  "修改任务清单升级：保存前质量门会把规则报告腔、系统式章末、连续重复句等问题转成更具体的改写任务。",
  "正文生成新增流程循环防护：要求规则胜利必须落到人物选择、身体代价、空间变化或读者奖励，减少只绕术语不推进剧情。",
  "保存前质量门新增规则术语密度、系统提示式章末和连续重复句检查，避免流程报告腔正文直接入库。",
  "续写进度锚点修正：项目摘要会优先使用正文库最新章节，并提示旧 currentChapter 字段与正文库不一致的风险。",
  "保存前质量门新增正文包装检查：会提示“好的，以下是正文”等 AI 前言，避免说明文字混进章节正文。",
  "保存前质量门修正“现场感”识别：避免把“意味着”里的单字误当感官细节，并继续提示说明书式正文。",
  "保存前质量门新增“小说感”检查：会提示对话/人物交锋过少、场景物件和感官细节偏少，减少说明书式正文入库。",
  "打开项目和导入项目会先检查未保存章节、未入库生成正文和 AI 运行状态，避免误替换当前写作现场。",
  "数据安全增强：浏览器缓存损坏会提示从项目库恢复，导入坏备份不会覆盖当前项目，生成正文保存会等待项目库同步结果。",
  "正文生成会在“必须出现/读者奖励”未填写时，从章节方向里自动提取核心目标、读者奖励和章末钩子作为质量锚点。",
  "AI 任务状态栏会显示上次发送前快照是否写入项目库；刷新、断电或浏览器崩溃后，更容易判断数据有没有保存住。",
  "AI 长任务发送前会先保存浏览器状态并静默写入项目库；刷新、断电或浏览器崩溃后，最新输入和章节编辑内容更容易恢复。",
  "保存前质量门新增计划兑现检查：会提示必须出现/读者奖励和章节方向关键词是否落地，减少正文偏离原计划。",
  "正文生成统计修正：AI 返回错误日志、技能失败提示或截断提示时，会在入账前拦截并按失败任务统计，不再污染成功率。",
  "使用统计增强：服务端最近 AI 任务会记录 Token 用量，优先读取模型真实 usage，没有真实 usage 时才估算，并在刷新后合并回使用统计。",
  "服务端新增最近 AI 请求记录：刷新或断电后仍可查看后台最近任务状态，且只保存元数据和错误摘要，不保存 API Key、完整提示词或正文。",
  "浏览器端行为自测钩子改为页面内 1 像素可点击按钮，自动验证能用真实点击触发自测流程。",
  "浏览器端行为自测改为页面内隐藏钩子执行，验证工具可以点击自测按钮并读取结果，确认真实页面运行时没有回归。",
  "新增浏览器端行为自测：可直接验证错误输出拦截、两章拆分、计划章续写和 AI资料库待扫描规则，减少关键写作链路回归。",
  "AI资料库增量扫描补强：旧项目里缺少章节 hash 记录的已写章节会重新进入更新队列，避免资料库误判为已完整覆盖。",
  "修正结构刷新完成时机：整理大纲只生成结果不会提前算完成，必须应用整理结果后才记录结构刷新。",
  "新增修改任务清单：保存前质量门、长篇体检和发布检查里的问题可以转成待处理任务，并标记已处理或忽略。",
  "保存前质量门新增语义风险检查：会提示章节推进、读者奖励、章末压力、重复句和解释腔风险，减少水文和 AI 套话入库。",
  "AI 调用新增全局运行保护：一个 AI 任务未完成时会阻止启动第二个 AI 任务，避免大纲、资料库、体检和正文生成结果互相覆盖。",
  "AI资料库面板新增“章节兑现核对”摘要，可以直接看到章节方向是否兑现、是否偏航和需要补偿的伏笔。",
  "AI资料库更新会读取章节备注里的“本章兑现记录”，并生成章节方向兑现核对，后续大纲、记忆卡和正文生成能看到哪些计划已兑现、哪些需要补偿。",
  "生成正文保存入正文库时，会自动在章节备注里追加“本章兑现记录”，方便后续核对章节方向、必须出现内容和 AI资料库更新。",
  "正文生成稳定性补强：生成正文会读取 AI资料库里的人物状态库；正文库 6 章以上但资料库为空时会先暂停生成，避免人物关系和设定漂移。",
  "AI 稳定性补强：服务端会拦截旧版 $novel-writing 技能不可用提示，其他模型接口也会按功能类型使用更长的后台等待时间。",
  "AI 长任务新增本地状态记录：刷新页面后也能看到上次 AI 调用是完成、失败还是可能被刷新中断。",
  "保存前质量门升级为二次确认：生成正文存在警告时，第一次点击保存只提示问题，必须点“确认仍保存”才会写入正文库。",
  "章节方向新增生命周期提示：可区分可使用、仍可用、已用完和需重推，保存章节后首页推荐会随正文库进度更新。",
  "AI资料库和最近章节参考的长章节摘录改为开头 + 中段采样 + 结尾，减少中段伏笔、道具来源和人物状态变化漏读。",
  "长篇项目生成前会检查 AI资料库状态：正文库已有较多章节但资料库为空时，会明确提示先快速更新，减少伏笔和人物状态漏读。",
  "生成前检查新增输出预算风险提示：两章模式或短篇目标过高但最大输出偏低时，会先提示改成单章或提高最大输出。",
  "生成正文保存入正文库后会自动同步到项目库，减少断电或浏览器数据丢失导致章节回退的风险。",
  "验证脚本新增前端结构防回归检查：会拦截重复 HTML id 和重复顶层函数，避免大纲确认等流程再次被同名函数覆盖。",
  "保存前质量门新增联动入口：可把当前生成正文连同质量门意见直接送去润色、发布检查，或打开长篇体检。",
  "生成正文后新增保存前质量门：自动提示可保存、建议检查或不建议保存，覆盖分章、长度、标题、结尾和常见 AI 痕迹。",
  "生成正文失败后新增恢复面板：可直接省量重试、单章重试、查看最近 Codex 日志或复制错误详情。",
  "AI 生成会识别输出截断、内容过滤、Codex 空输出和上下文窗口爆掉，不再把失败内容当正文保存。",
  "正文库待写计划会优先成为下一章：生成、推断和保存正文会从最小的空计划章节继续，不再被后续待写计划推到末尾。",
  "正文库“AI 输出写入本章”增加正文安全校验，避免把体检报告、检查文本或失败日志误写进章节正文。",
  "长篇体检补充开头前三章参考，能更准确检查开篇抓人、三章契约和早期读者承诺。",
  "5万字维护拆分为结构体检和结构刷新：体检不再冒充已刷新，大纲/AI资料库/章节方向更新才会推进刷新进度。",
  "生成正文增加结果校验：AI 返回技能不可用、调试包装或 Codex 错误日志时，不再误判为正文。",
  "正文库编辑器增加统一静默保存：生成、体检、保存项目库前会先纳入当前未保存章节。",
  "保存章节增加重复保护：同一份生成正文不会因为重复点击再次写入正文库。",
  "正文生成会读取 AI资料库快速更新的新增资料，避免深度整理前漏掉新近章节事实。",
  "新增长篇质量体检：高级工具里可以按 3 万字体检、5 万字结构刷新思路检查追读欲、人物、设定、AI痕迹和付费风险。",
  "长篇体检新增“送去润色”：体检报告可直接作为精修上下文处理当前章节。",
  "服务端兼容旧项目：直接调用本地 API 时也会把旧“未来5章建议”标记为历史参考。",
  "旧项目兼容优化：旧版“未来5章建议”发送给 AI 前会标记为历史参考，避免把新版标准模式带回五章流程。",
  "维护正文生成链路：移除旧版不可达的正文生成分支，降低后续改提示词时的误判风险。",
  "生成正文增加安全保护：生成中、检查文本或失败日志不能再误保存进正文库。",
  "统一写作首页提示词：复制提示词和真实生成正文使用同一套上下文顺序。",
  "写作首页整体视觉重构：新增当前任务数据、AI参考状态卡、五步流程状态、生成设置摘要和正文结果快捷按钮。",
  "正文库二到五阶段补齐：章节目录更紧凑，中屏默认收起右侧信息栏，小屏可收起章节目录并优先显示正文编辑区。",
  "正文库界面重构：去掉顶部大空白，改为左侧章节目录、中间正文写作区、右侧章节信息的紧凑三栏写作台。",
  "使用统计修正：正文库历史正文默认改为正文库规模，不再计入总 Token；需要时可手动打开假设生成成本。",
  "使用统计升级：新增项目库历史回填预览、确认导入、撤销上次导入，并区分真实统计、实时估算和历史回填。",
  "优化使用统计页面：改成紧凑仪表盘、空状态提示和历史估算导入，减少大面积空白。",
  "新增使用统计一级菜单：自动记录各功能输入、输出和总 Token，支持 24小时、7天、30天和全部筛选。",
  "作者确认区升级为结构化解析：问题、AI建议、作者需要决定会分开保存和显示，并兼容旧版待确认条目。",
  "根据确认优化大纲时会把结构化确认项带入提示词，减少 AI 误解作者选择。",
  "正文库升级为三栏写作台：左侧章节目录、中间正文编辑、右侧章节信息和快捷操作，并新增专注模式。",
  "正文库统计改为输入停顿后刷新，减少长正文编辑时的卡顿。",
  "修复检查大纲后处理失败：大纲确认区和 AI资料库的小节提取函数拆分命名，避免同名函数互相覆盖导致 title.replace 报错。",
  "优化检查大纲容错：AI 已返回检查结果后，即使确认项解析异常，也不会再把结果覆盖成生成失败。",
  "修复检查大纲生成失败：检查模式改用轻量上下文，只发送项目大纲、AI资料库/正文依据摘录和小说理解摘要，避免长上下文导致 Codex 异常退出。",
  "优化 Codex 失败提示：遇到 3221225786 等子进程异常退出时，会直接说明可能是上下文过重或连接中断，并保留完整日志。",
  "修复大纲作者确认区：支持更多“需要确认”标题写法，确认项有内容时自动展开，并正确显示待确认/已处理状态。",
  "新增 AI 请求防卡住保护：如果网页等待时间异常过长，会自动停止等待并释放页面状态，不会自动降级模型。",
  "服务端新增旧技能名兜底清洗：即使旧项目或旧页面仍发送旧技能触发语，进入 Codex 前也会替换为内置小说写作流程。",
  "修复生成正文误触发旧技能检查的问题：网页端现在使用内置小说写作流程，不再依赖当前 Codex 会话是否加载写作技能。",
  "UI 重构：侧边栏瘦身，主题颜色改成色卡弹层，写作首页默认只看当前任务、AI 参考和下一步按钮。",
  "新增极简模式：隐藏手动流程、生成设置、诊断和高级参数，只保留日常写作必须看到的数据。",
  "正文库编辑区升级为更接近写作软件的布局，AI 接口默认只显示当前服务、当前模型和是否可用。",
  "AI资料库改为快速更新：默认只处理正文库新增章节，不再自动全量深度整理。",
  "新增深度整理入口：需要合并人物、伏笔、世界观和剧情资料时再手动执行。",
  "AI资料库面板显示预计调用次数、待整理章节和四类资料库状态。",
  "新增创作策略：标准模式看未来4章、推断下2章；长线模式看未来8章、推断下4章。",
  "小说记忆卡允许落后正文 4 章，超过后才提示重新分析。",
  "恢复侧边栏版本更新通知，方便确认当前电脑装的是不是最新版。",
  "更新完成后会重新生成一键式安装包，便于复制到其他电脑使用。"
];

const themeGroups = [
  {
    title: "深色主题",
    themes: [
      { id: "hermes-orange", name: "爱马仕橙", primary: "#FF8A00", background: "#070504", text: "#FFF2DF" },
      { id: "prada-blue", name: "普拉达蓝", primary: "#0175CC", background: "#030608", text: "#FCF5E2" },
      { id: "periwinkle", name: "长春花蓝", primary: "#5357A0", background: "#05050C", text: "#FCF5E2" },
      { id: "peacock-blue", name: "孔雀蓝", primary: "#0B7E9D", background: "#02090B", text: "#F9F6E5" },
      { id: "gucci-green", name: "古驰绿", primary: "#1F4433", background: "#040705", text: "#FFFBF0" },
      { id: "lanshan-deep", name: "蓝山深色", primary: "#495D84", background: "#070A0F", text: "#FFFCEE" },
      { id: "wheat-blue-deep", name: "麦秆黄深色", primary: "#2F6593", background: "#060B10", text: "#FFF4D8" },
      { id: "water-gold-deep", name: "水色金粉深色", primary: "#8FACA5", background: "#07100E", text: "#FFF2E1" },
      { id: "china-red-deep", name: "中国红深色", primary: "#A23025", background: "#130403", text: "#FFF1E8" },
      { id: "liuli-gold-deep", name: "琉璃鹿角深色", primary: "#2B509E", background: "#060914", text: "#FFF0D5" },
      { id: "monkey-gray-deep", name: "猴毛灰深色", primary: "#95846E", background: "#0D0B09", text: "#F5F0EA" },
      { id: "lotus-green-deep", name: "薄荷绿深色", primary: "#196840", background: "#04100A", text: "#F3DDCE" },
      { id: "teal-coral-deep", name: "莺绿珊瑚深色", primary: "#024943", background: "#03100F", text: "#F99B66" },
      { id: "ink-lime-deep", name: "墨绿荧光深色", primary: "#1E2822", background: "#070C09", text: "#CFDA79" }
    ]
  },
  {
    title: "明亮主题",
    themes: [
      { id: "candy-pop", name: "泡泡玛特红黄蓝", primary: "#FEDD44", background: "#FDFCDF", text: "#3B2930" },
      { id: "rose-garden", name: "粉绿紫", primary: "#FFAEDC", background: "#FDF9E0", text: "#4A2C4A" },
      { id: "mint-orange", name: "薄荷橙绿", primary: "#FFF07F", background: "#FFF8D2", text: "#214139" },
      { id: "rose-teal", name: "玫瑰青绿", primary: "#FF739E", background: "#FFF3EF", text: "#3E2321" },
      { id: "bubblegum-blue", name: "泡泡糖蓝粉", primary: "#FEACDC", background: "#FFF5F7", text: "#3B2440" },
      { id: "sea-cream", name: "奶油海蓝", primary: "#FCFCD8", background: "#FFFFEC", text: "#17345D" },
      { id: "lavender-night", name: "薰衣草夜蓝", primary: "#7F598C", background: "#F6F0FA", text: "#243E56" },
      { id: "teal-magenta", name: "青绿洋红", primary: "#5FE6D8", background: "#F5FFFC", text: "#522146" },
      { id: "lanshan-light", name: "蓝山象牙白", primary: "#495D84", background: "#FFFCEE", text: "#253A5A" },
      { id: "wheat-blue-light", name: "麦秆黄柔蓝", primary: "#2F6593", background: "#FCECD0", text: "#173A58" },
      { id: "water-gold-light", name: "水色金粉", primary: "#8FACA5", background: "#FDF2E1", text: "#315B55" },
      { id: "china-red-light", name: "中国红凝脂", primary: "#A23025", background: "#F5F2EB", text: "#5A1E18" },
      { id: "liuli-gold-light", name: "琉璃鹿角金", primary: "#2B509E", background: "#DEBF95", text: "#17356B" },
      { id: "monkey-gray-light", name: "猴毛灰芡实白", primary: "#95846E", background: "#E2E1E6", text: "#534738" },
      { id: "lotus-green-light", name: "薄荷绿初桃粉红", primary: "#196840", background: "#F3DDCE", text: "#174F33" },
      { id: "teal-coral-light", name: "莺绿野蔷薇红", primary: "#024943", background: "#F99B66", text: "#063B36" },
      { id: "ink-lime-light", name: "墨绿荧光玫红", primary: "#1E2822", background: "#CFDA79", text: "#142119" }
    ]
  }
];

const themeMetaById = new Map(themeGroups.flatMap((group) => group.themes.map((theme) => [theme.id, theme])));
const themeIds = new Set(themeMetaById.keys());

const providerPresets = {
  codex: {
    endpoint: "codex://exec",
    model: CODEX_RECOMMENDED_MODEL,
    reasoningEffort: DEFAULT_CODEX_REASONING_EFFORT,
    noKey: true
  },
  openai: {
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4.1-mini"
  },
  deepseek: {
    endpoint: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat"
  },
  siliconflow: {
    endpoint: "https://api.siliconflow.cn/v1/chat/completions",
    model: "Qwen/Qwen2.5-7B-Instruct"
  },
  dashscope: {
    endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    model: "qwen-plus"
  },
  moonshot: {
    endpoint: "https://api.moonshot.ai/v1/chat/completions",
    model: "moonshot-v1-8k"
  },
  zhipu: {
    endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4-flash"
  },
  groq: {
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant"
  },
  together: {
    endpoint: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
  },
  mistral: {
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest"
  },
  xai: {
    endpoint: "https://api.x.ai/v1/chat/completions",
    model: "grok-3-mini"
  },
  fireworks: {
    endpoint: "https://api.fireworks.ai/inference/v1/chat/completions",
    model: "accounts/fireworks/models/llama-v3p1-8b-instruct"
  },
  perplexity: {
    endpoint: "https://api.perplexity.ai/chat/completions",
    model: "sonar"
  },
  openrouter: {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "openai/gpt-4.1-mini"
  },
  lmstudio: {
    endpoint: "http://127.0.0.1:1234/v1/chat/completions",
    model: "local-model",
    noKey: true
  },
  ollama: {
    endpoint: "http://127.0.0.1:11434/v1/chat/completions",
    model: "qwen2.5",
    noKey: true
  },
  custom: {
    endpoint: "",
    model: ""
  },
  mock: {
    endpoint: "mock://echo",
    model: "mock-model",
    noKey: true
  }
};

const codexReasoningOptions = [
  { value: "low", name: "低", hint: "速度优先，适合连接测试和简单修正。" },
  { value: "medium", name: "中", hint: "均衡稳定，适合普通分析和润色。" },
  { value: "high", name: "高", hint: "推荐日常连载，适合正文、记忆卡和章节方向。" },
  { value: "xhigh", name: "超高", hint: "深度推理，适合整理大纲、长篇体检和复杂修复。" }
];

const codexReasoningValueSet = new Set(codexReasoningOptions.map((item) => item.value));

const codexPresetOptions = [
  {
    id: "quality-serial",
    title: "高质量连载",
    subtitle: "正文生成、章节方向",
    model: "gpt-5.5",
    reasoningEffort: "high",
    profileId: "draft"
  },
  {
    id: "deep-structure",
    title: "深度整理",
    subtitle: "大纲、长篇体检、AI修复",
    model: "gpt-5.5",
    reasoningEffort: "xhigh",
    profileId: "deep"
  },
  {
    id: "balanced-save",
    title: "均衡省量",
    subtitle: "普通分析、短任务",
    model: "gpt-5.4",
    reasoningEffort: "medium",
    profileId: "analysis"
  },
  {
    id: "quick-check",
    title: "快速检查",
    subtitle: "测试、轻量校对",
    model: "gpt-5.4",
    reasoningEffort: "low",
    profileId: "default"
  }
];

const modelTaskOptions = [
  { task: "outline", name: "整理大纲", hint: "故事骨架和项目大纲" },
  { task: "analysis", name: "小说理解", hint: "记忆卡、连载风险和后续建议" },
  { task: "planning", name: "章节方向", hint: "按创作策略推断后续章节" },
  { task: "quick", name: "生成正文", hint: "长正文输出" },
  { task: "polish", name: "正文润色", hint: "标准润色和精修润色" },
  { task: "shortReview", name: "短篇检查", hint: "短篇闭环检查" },
  { task: "quality", name: "长篇体检", hint: "追读、人物、设定和AI痕迹" },
  { task: "ending", name: "完结规划", hint: "完结诊断、伏笔回收和倒排大纲" },
  { task: "release", name: "发布检查", hint: "发文前风险检查" },
  { task: "feedback", name: "读者反馈", hint: "读者信号分析" },
  { task: "recovery", name: "断更恢复", hint: "停更后接续方案" }
];

const modelStrategyLabels = {
  economy: "省钱模式",
  balanced: "均衡模式",
  quality: "高质量模式",
  custom: "自定义模式"
};

const defaultModelBindings = {
  dashboard: "analysis",
  diagnosis: "deep",
  arc: "deep",
  outline: "deep",
  analysis: "analysis",
  planning: "analysis",
  quick: "draft",
  manuscript: "draft",
  polish: "polish",
  shortReview: "analysis",
  quality: "deep",
  ending: "deep",
  release: "deep",
  feedback: "analysis",
  recovery: "analysis",
  test: "default",
  api: "default"
};

const modelStrategyBindings = {
  economy: {
    ...defaultModelBindings,
    quick: "default",
    manuscript: "default",
    polish: "default",
    shortReview: "default",
    quality: "analysis"
  },
  balanced: defaultModelBindings,
  quality: {
    ...defaultModelBindings,
    outline: "draft",
    analysis: "draft",
    planning: "draft",
    quick: "draft",
    manuscript: "draft",
    polish: "polish",
    shortReview: "polish",
    quality: "draft",
    ending: "draft",
    release: "draft",
    feedback: "draft",
    recovery: "draft"
  }
};

function createModelProfile(id, name, source = {}) {
  const provider = source.provider || source.apiProvider || "codex";
  const preset = providerPresets[provider] || providerPresets.codex;
  const sourceModel = source.model || source.apiModel || preset.model || "";
  const model = provider === "codex" && codexModelIsDefault(sourceModel)
    ? CODEX_RECOMMENDED_MODEL
    : sourceModel;
  const reasoningEffort = normalizeCodexReasoningEffort(source.reasoningEffort || source.codexReasoningEffort || preset.reasoningEffort);
  return {
    id,
    name,
    provider,
    endpoint: source.endpoint || source.apiEndpoint || preset.endpoint || "",
    model,
    apiKey: source.apiKey || "",
    codexCommand: source.codexCommand || "auto",
    codexProfile: source.codexProfile || "",
    reasoningEffort,
    systemPrompt: source.systemPrompt || source.apiSystemPrompt || "",
    temperature: Number(source.temperature ?? source.apiTemperature ?? 0.7),
    maxTokens: Number(source.maxTokens ?? source.apiMaxTokens ?? 1600)
  };
}

function createBaseModelProfiles(source = {}) {
  return [
    createModelProfile("default", "默认模型", { ...source, reasoningEffort: source.reasoningEffort || source.codexReasoningEffort || DEFAULT_CODEX_REASONING_EFFORT }),
    createModelProfile("analysis", "稳定分析模型", { ...source, reasoningEffort: "high" }),
    createModelProfile("deep", "深度整理模型", { ...source, reasoningEffort: "xhigh" }),
    createModelProfile("draft", "正文长文模型", { ...source, reasoningEffort: "high" }),
    createModelProfile("polish", "润色精修模型", { ...source, reasoningEffort: "medium" })
  ];
}

const defaults = {
  projectTitle: "",
  projectMode: "serial",
  genre: "",
  platform: "",
  theme: "hermes-orange",
  simpleMode: false,
  cadence: "日更",
  targetWords: 2500,
  corePromise: "",
  economyMode: true,
  recentContextChars: 5000,
  quickMode: "draft",
  quickDraftScope: "two",
  creativeStrategy: "standard",
  quickTitle: "",
  quickSourceText: "",
  quickAnalysis: "",
  quickAnalysisChapter: 0,
  quickAnalysisSourceLabel: "",
  quickAnalysisUpdatedAt: "",
  outlineMode: "initial",
  projectOutline: "",
  outlineResult: "",
  outlineCheckResult: "",
  outlineAuthorNotes: "",
  outlineConfirmations: [],
  outlineConfirmationParseError: "",
  outlineEvidenceCards: "",
  outlineEvidencePendingCards: "",
  outlineEvidencePendingFromChapter: 0,
  outlineEvidencePendingToChapter: 0,
  outlineEvidencePendingUpdatedAt: "",
  outlineEvidenceUpdatedToChapter: 0,
  outlineEvidenceUpdatedAt: "",
  outlineEvidenceChapterHashes: {},
  outlineEvidenceDirtyChapterIds: [],
  outlineEvidenceArcSummaries: "",
  outlineEvidenceGlobalSummary: "",
  outlineEvidenceCharacterIndex: "",
  outlineEvidenceForeshadowIndex: "",
  outlineEvidenceCompressedAt: "",
  outlineEvidenceCompressedToChapter: 0,
  aiKnowledgeOutput: "",
  aiKnowledgeUpdatedAt: "",
  quickBrief: "",
  quickBriefStartChapter: 0,
  quickBriefEndChapter: 0,
  quickBriefAnchorChapter: 0,
  quickBriefUpdatedAt: "",
  quickLastHook: "",
  quickMustHave: "",
  quickOutput: "",
  quickOutputSavedHash: "",
  shortReviewResult: "",
  shortReviewStatus: "pending",
  polishMode: "standard",
  polishSource: "",
  polishReviewContext: "",
  polishOutput: "",
  qualityAuditResult: "",
  qualityAuditUpdatedAt: "",
  revisionTasks: [],
  revisionSelectedTaskIds: [],
  revisionAiOutput: "",
  revisionAiDraft: "",
  revisionAiResultType: "",
  lastQualityAuditWords: 0,
  lastStructuralAuditWords: 0,
  lastStructuralRefreshWords: 0,
  advancedVisible: false,
  currentChapter: 1,
  bufferCount: 0,
  releaseStatus: "planned",
  projectState: "",
  seasonPromise: "",
  seasonSpan: "",
  firstHooks: "",
  endingStage: "serial",
  endingRemainingChapters: "",
  endingType: "爽文收束",
  endingAllowNewHooks: false,
  endingMustPayoff: "",
  endingCharacterClosures: "",
  endingAuthorDecisions: "",
  endingTaskMode: "diagnosis",
  endingLibraryScanResult: "",
  endingDiagnosis: "",
  endingPayoffResult: "",
  endingReverseOutline: "",
  endingReadinessResult: "",
  chapterPov: "",
  hookType: "发现",
  readerReward: "",
  previousHook: "",
  releaseDraft: "",
  readerFeedback: "",
  hiatusLength: "",
  lastPublished: "",
  hiatusContext: "",
  apiProvider: "codex",
  apiEndpoint: providerPresets.codex.endpoint,
  apiModel: providerPresets.codex.model,
  codexCommand: "auto",
  codexProfile: "",
  codexReasoningEffort: DEFAULT_CODEX_REASONING_EFFORT,
  codexPresetId: "quality-serial",
  apiKey: "",
  saveApiKey: false,
  smartAiSettings: true,
  apiTemperature: 0.7,
  apiMaxTokens: 1600,
  apiSystemPrompt: "你是一个专业的连载小说编辑和写作助手。请用中文回答，重视读者奖励、章末钩子、伏笔回收和连续性。",
  activeModelProfileId: "default",
  modelStrategy: "balanced",
  modelProfiles: createBaseModelProfiles({
    apiProvider: "codex",
    apiEndpoint: providerPresets.codex.endpoint,
    apiModel: providerPresets.codex.model
  }),
  moduleModelBindings: { ...defaultModelBindings },
  lastAiCall: null,
  lastPreAiSaveAt: "",
  lastPreAiSaveTask: "",
  lastPreAiSaveStatus: "",
  lastPreAiSaveError: "",
  aiOutput: "",
  projectId: "",
  updatedAt: "",
  activeChapterId: "chapter-1",
  chapters: [
    {
      id: "chapter-1",
      number: 1,
      title: "第1章",
      status: "planned",
      draft: "",
      notes: ""
    }
  ],
  pipeline: [
    { chapter: "第1章", movement: "", reward: "", status: "brief" },
    { chapter: "第2章", movement: "", reward: "", status: "planned" },
    { chapter: "第3章", movement: "", reward: "", status: "planned" }
  ],
  ledger: [
    { promise: "", planted: "", window: "", status: "open" }
  ],
  checklist: {
    anchor: false,
    movement: false,
    reward: false,
    hook: false,
    continuity: false,
    payoff: false,
    nextPressure: false,
    characterMotivation: false,
    dialogueVoice: false,
    settingContinuity: false,
    languageTexture: false,
    readerPull: false
  }
};

const fieldIds = [
  "projectTitle",
  "projectMode",
  "genre",
  "platform",
  "theme",
  "simpleMode",
  "cadence",
  "targetWords",
  "corePromise",
  "economyMode",
  "recentContextChars",
  "quickMode",
  "quickDraftScope",
  "creativeStrategy",
  "quickTitle",
  "quickSourceText",
  "quickAnalysis",
  "outlineMode",
  "projectOutline",
  "outlineResult",
  "outlineAuthorNotes",
  "quickBrief",
  "quickLastHook",
  "quickMustHave",
  "quickOutput",
  "shortReviewResult",
  "polishMode",
  "polishSource",
  "polishOutput",
  "qualityAuditResult",
  "revisionAiOutput",
  "currentChapter",
  "bufferCount",
  "releaseStatus",
  "projectState",
  "seasonPromise",
  "seasonSpan",
  "firstHooks",
  "endingStage",
  "endingRemainingChapters",
  "endingType",
  "endingAllowNewHooks",
  "endingMustPayoff",
  "endingCharacterClosures",
  "endingAuthorDecisions",
  "endingLibraryScanResult",
  "endingDiagnosis",
  "endingPayoffResult",
  "endingReverseOutline",
  "endingReadinessResult",
  "chapterPov",
  "hookType",
  "readerReward",
  "previousHook",
  "releaseDraft",
  "readerFeedback",
  "hiatusLength",
  "lastPublished",
  "hiatusContext",
  "apiProvider",
  "apiEndpoint",
  "apiModel",
  "codexCommand",
  "codexProfile",
  "codexReasoningEffort",
  "apiKey",
  "saveApiKey",
  "smartAiSettings",
  "apiTemperature",
  "apiMaxTokens",
  "apiSystemPrompt",
  "aiOutput"
];

const checklistLabels = {
  anchor: "开头快速回看当前局势",
  movement: "本章改变局势、关系、信息或危险",
  reward: "读者奖励明确落在正文里",
  hook: "结尾钩子具体而非空泛",
  continuity: "新增连续性事实已记录",
  payoff: "新增承诺有回收窗口",
  nextPressure: "下一章有明确起手压力",
  characterMotivation: "人物行为动机和代价成立",
  dialogueVoice: "对话符合身份和当前情绪",
  settingContinuity: "设定、道具、伤势和时间线一致",
  languageTexture: "没有明显AI套话和报告式解释",
  readerPull: "普通读者有点下一章的理由"
};

const advancedToolPanels = new Set(["advancedTools", "arc", "ending", "polish", "release", "feedback", "recovery", "quality"]);

let loadStateWarning = null;
let state;
let usageRecords = loadUsageRecords();
let aiTaskRecords = loadAiTaskRecords();
let serverAiTaskSnapshot = null;
let usageRange = "24h";
let usageImportPreview = null;
let lastUsageImportBatch = loadLastUsageImportBatch();
let promptUpdateTimer = 0;
let usageEstimateTimer = 0;
let persistTimer = 0;
let memorySummaryTimer = 0;
let chapterFilterTimer = 0;
let chapterStatsTimer = 0;
let chapterEditorAutosaveTimer = 0;
let autoProjectLoadAttempted = false;
let quickDraftBusy = false;
let activeAiCall = null;
let draftQualityWarnConfirmHash = "";
let chapterCache = createChapterCache();
let usageEstimateCache = createUsageEstimateCache();
let apiAvailability = { status: "unknown", message: "点“检测可用性”确认当前服务。" };
let codexConnection = {
  installed: false,
  versionOk: false,
  path: "",
  version: "",
  execReady: false,
  generationReady: false,
  lastProbeModel: "",
  lastProbeReasoningEffort: "",
  lastProbeAt: "",
  lastProbeError: "",
  lastProbeContent: "",
  actualModel: "",
  failureType: "",
  failureTitle: "",
  failureAdvice: "",
  lastProbeLogPath: "",
  statusLevel: "unknown"
};
const QUICK_SOURCE_INLINE_LIMIT = 12000;
const PERSIST_DELAY_MS = 800;
const USAGE_ESTIMATE_DELAY_MS = 700;
const MEMORY_SUMMARY_DELAY_MS = 180;
const CHAPTER_FILTER_DELAY_MS = 160;
const CHAPTER_STATS_DELAY_MS = 180;
const CHAPTER_AUTOSAVE_DELAY_MS = 1200;
const EVIDENCE_FAST_UPDATE_THRESHOLD = 4;
const OUTLINE_EVIDENCE_BATCH_SIZE = 2;
const OUTLINE_EVIDENCE_CHAPTER_LIMIT = 1800;
const OUTLINE_EVIDENCE_MAX_LENGTH = 30000;
const OUTLINE_EVIDENCE_COMPRESSION_BATCH_LIMIT = 15000;
const OUTLINE_EVIDENCE_INDEX_MAX_LENGTH = 24000;
const OUTLINE_CHECK_EVIDENCE_MAX_LENGTH = 6200;
const OUTLINE_CHECK_OUTLINE_MAX_LENGTH = 7600;
const OUTLINE_CHECK_ANALYSIS_MAX_LENGTH = 1800;
const USAGE_ESTIMATE_FIELDS = new Set([
  "projectMode",
  "targetWords",
  "economyMode",
  "recentContextChars",
  "quickDraftScope",
  "creativeStrategy",
  "quickSourceText",
  "projectOutline",
  "outlineResult",
  "quickAnalysis",
  "quickBrief",
  "endingStage",
  "endingRemainingChapters",
  "endingType",
  "endingMustPayoff",
  "endingCharacterClosures",
  "endingAuthorDecisions",
  "endingLibraryScanResult",
  "endingDiagnosis",
  "endingPayoffResult",
  "endingReverseOutline",
  "endingReadinessResult",
  "smartAiSettings",
  "apiMaxTokens"
]);

function $(selector) {
  return document.querySelector(selector);
}

function isShortStory() {
  return state.projectMode === "short";
}

function localDateLabel(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isLonglineStrategy() {
  return !isShortStory() && state.creativeStrategy === "longline";
}

function strategyDisplayName() {
  if (isShortStory()) return "短篇模式";
  return isLonglineStrategy() ? "长线模式" : "标准模式";
}

function memoryFutureCount() {
  return isLonglineStrategy() ? 8 : 4;
}

function memoryFutureLabel() {
  return isLonglineStrategy() ? "未来8章趋势" : "未来4章建议";
}

function directionChapterCount() {
  return isLonglineStrategy() ? 4 : 2;
}

function directionLabel() {
  return isLonglineStrategy() ? "下四章方向" : "下两章方向";
}

function directionShortLabel() {
  return isLonglineStrategy() ? "四章方向" : "两章方向";
}

function strategyStatusText() {
  if (isShortStory()) return "短篇模式：直接生成完整故事骨架";
  return isLonglineStrategy()
    ? "记忆卡看未来8章趋势；推断下4章，正文仍默认只写前2章。"
    : "记忆卡看未来4章建议；推断下2章，适合日常省量更新。";
}

function setLabelText(label, text) {
  if (!label) return;
  const first = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (first) {
    first.textContent = `\n                    ${text}\n                    `;
  }
}

function updateProjectModeUi() {
  const short = isShortStory();
  const strategyName = strategyDisplayName();
  const directionName = directionLabel();
  const directionShort = directionShortLabel();
  const futureName = memoryFutureLabel();
  document.documentElement.dataset.projectMode = short ? "short" : "serial";
  setText("quickPanelTitle", short ? "短篇故事工作台" : "续写工作台");
  setText("workflowHeadline", short ? "按 4 步完成一篇短篇" : "按顺序点 5 个按钮即可");
  setText("workflowRoute", short ? "设定 → 骨架 → 正文 → 检查" : `大纲 → 记忆卡 → 最新章节 → ${directionShort} → 正文`);
  setText("generateOutlineLabel", short ? "整理设定" : "整理大纲");
  setText("generateOutlineHint", short ? "确定短篇骨架" : "确定故事骨架");
  setText("analyzeNovelLabel", short ? "分析已有文" : "分析记忆卡");
  setText("analyzeNovelHint", short ? "判断缺口和结尾" : futureName);
  setText("inferNextLabel", short ? "生成骨架" : `推断${directionName}`);
  setText("inferNextHint", short ? "含草稿理解" : (isLonglineStrategy() ? "前2章详细，后2章预留" : "生成连续方向"));
  setText("quickGenerateLabel", short ? "生成短篇" : "生成正文");
  setText("quickGenerateHint", short ? "完整一篇故事" : "默认一次两章");
  setText("quickSaveLabel", short ? "检查短篇" : "保存章节");
  setText("quickSaveHint", short ? "闭环和结尾" : "自动入正文库");
  setText("contextBoardTitle", short ? "短篇生成依据" : "生成前请看这里");
  setText("briefProgressLabel", short ? "短篇骨架" : directionName);
  setText("quickLatestEyebrow", short ? "短篇素材" : "最新章节");
  setText("libraryProgressLabel", short ? "短篇保存" : "正文库进度");
  setText("analysisProgressLabel", short ? "草稿理解" : "记忆卡覆盖");
  setText("quickSourceHeading", short ? "已有短篇草稿" : "已有小说/前文");
  setText("useChaptersAsSourceBtn", short ? "带入已保存短篇" : "从正文库汇总");
  setText("quickSourceNote", short ? "短篇模式下，这里只作为补充素材；如果已经保存过短篇，也可以直接带入已保存短篇。" : "如果正文已经在正文库里，生成时会自动读取正文库，不需要把整本书展开在这里。");
  setLabelText($("#quickSourceTextLabel"), short ? "把已有短篇草稿放这里" : "把没写完的小说放这里");
  setText("quickStatus", short ? "短篇模式：按 4 步生成，保存短篇在正文框右上角。" : "先确认正文库最新章节，再按 5 步生成。");
  const analyzeButton = $("#analyzeNovelBtn");
  const inferButton = $("#inferNextBtn");
  const generateButton = $("#quickGenerateBtn");
  const finalButton = $("#quickSaveChapterBtn");
  const shortSaveButton = $("#shortSaveStoryBtn");
  const shortReviewPanel = $("#shortReviewPanel");
  if (analyzeButton) analyzeButton.hidden = short;
  if (inferButton) inferButton.dataset.step = short ? "02" : "03";
  if (generateButton) generateButton.dataset.step = short ? "03" : "04";
  if (finalButton) finalButton.dataset.step = short ? "04" : "05";
  if (shortSaveButton) shortSaveButton.hidden = !short;
  if (shortReviewPanel) shortReviewPanel.hidden = !short;
  const help = $("#quickHelpList");
  if (help) {
    help.innerHTML = short
      ? `<li>先填写作品名、类型、核心看点和目标字数。</li>
                  <li>把已有短篇草稿放进“已有小说/前文”，没有草稿也可以只填设定。</li>
                  <li>按“整理设定 → 生成骨架 → 生成短篇 → 检查短篇”的顺序执行。</li>
                  <li>“生成骨架”会自动分析已有草稿，不需要单独点分析。</li>
                  <li>检查通过后，点正文框右上角“保存短篇”放入正文库。</li>`
      : `<li>先确认项目和正文库，系统会自动读取最新章节。</li>
                  <li>按 5 步从左到右执行：大纲、记忆卡、${directionShort}、正文、入库。</li>
                  <li>当前为${strategyName}：${strategyStatusText()}</li>
                  <li>生成正文时会按“大纲 → 记忆卡 → 最新章节 → ${directionName}”的顺序判断。</li>
                  <li>已有正文可以粘到下方，也可以点“从正文库汇总”。</li>`;
  }
  const sourceList = $("#contextSourceList");
  if (sourceList) {
    sourceList.innerHTML = short
      ? `<div><span>1</span><strong>故事设定</strong><small>控制题材、风格和冲突</small></div>
                <div><span>2</span><strong>已有草稿</strong><small>生成骨架时自动理解</small></div>
                <div><span>3</span><strong>完整短篇骨架</strong><small>控制开端到结尾闭环</small></div>
                <div><span>4</span><strong>成稿检查</strong><small>检查闭环、反转和结尾</small></div>`
      : `<div><span>1</span><strong>项目大纲</strong><small>控制主线和伏笔</small></div>
                <div><span>2</span><strong>小说记忆卡</strong><small>控制风险和${futureName}</small></div>
                <div><span>3</span><strong>正文库最新章节</strong><small>控制真实续写起点</small></div>
                <div><span>4</span><strong>${directionName}</strong><small>${isLonglineStrategy() ? "前2章执行，后2章牵引" : "控制连续两章承接"}</small></div>`;
  }
  setText("outlineCardEyebrow", short ? "故事设定" : "项目大纲");
  setText("outlineCardTitle", short ? "核心设定和故事骨架" : "故事骨架和长期方向");
  setText("outlineCardAction", short ? "编辑设定" : "编辑大纲");
  setText("analysisCardEyebrow", short ? "短篇理解" : "小说记忆卡");
  setText("analysisCardTitle", short ? "已有正文、缺口和风险" : `下一步、风险和${futureName}`);
  setText("analysisCardAction", short ? "编辑理解" : "编辑记忆卡");
  setText("briefCardEyebrow", short ? "短篇方案" : directionName);
  setText("briefCardTitle", short ? "开端、转折、高潮和结尾" : (isLonglineStrategy() ? "前两章详细，后两章预留" : "下一章和下下章承接"));
  setText("briefCardAction", short ? "编辑方案" : "编辑方向");
  setText("outlineDrawerTitle", short ? "短篇核心设定" : "只保留故事骨架");
  setText("analysisDrawerTitle", short ? "已有正文理解" : `下一步、风险和${futureName}`);
  setText("briefDrawerTitle", short ? "完整短篇路线" : `生成正文前的${directionName}`);

  setLabelText($("#projectOutlineLabel"), short ? "故事设定/骨架" : "项目大纲");
  setLabelText($("#outlineResultLabel"), short ? "设定整理结果" : "大纲整理结果");
  setLabelText($("#quickAnalysisLabel"), short ? "短篇理解结果" : "小说理解结果");
  setLabelText($("#quickBriefLabel"), short ? "完整短篇方案" : directionName);

  const titleInput = $("#projectTitle");
  if (titleInput) titleInput.placeholder = short ? "未命名短篇" : "未命名连载";
  setLabelText($("#quickTitleLabel"), short ? "短篇标题" : "章节标题");
  setLabelText($("#quickMustHaveLabel"), short ? "短篇必须出现" : "本章必须出现");
  const genreInput = $("#genre");
  if (genreInput) genreInput.placeholder = short ? "悬疑 / 都市 / 科幻 / 治愈 / 惊悚" : "都市 / 玄幻 / 悬疑 / 科幻";
  const platformInput = $("#platform");
  if (platformInput) platformInput.placeholder = short ? "投稿平台 / 自用 / 小红书 / 公众号" : "起点 / 番茄 / 晋江 / 自定义";
  const corePromise = $("#corePromise");
  if (corePromise) corePromise.placeholder = short ? "这篇短篇最打动人的看点是什么？" : "读者每章回来想获得什么？";
  const quickMustHave = $("#quickMustHave");
  if (quickMustHave) {
    quickMustHave.placeholder = short
      ? "可不填。例如：必须出现的意象、反转、台词、道具、情绪落点或结尾画面"
      : "可不填。例如：人物、道具、伏笔、爽点、感情推进、结尾钩子";
  }
  const projectOutline = $("#projectOutline");
  if (projectOutline) {
    projectOutline.placeholder = short
      ? "短篇只写 7 板块：题材风格、主角和处境、核心冲突、故事骨架、关键反转、高潮与结尾、情绪落点。关键信息建议标【已确定/推断/待确认】。"
      : "只写 7 板块：核心卖点、世界观/背景、主要人物、人物关系、阶段主线、未回收伏笔、长期结局。关键信息建议标【已确定/推断/待确认】和来源。不要写未来章节建议。";
  }
  const outlineResult = $("#outlineResult");
  if (outlineResult) {
    outlineResult.placeholder = short
      ? "点击“整理设定”后，结果会先放在这里。确认无误后点“应用整理结果”。"
      : "点击“整理大纲”后，结果会先放在这里。确认无误后点“应用整理结果”。检查模式只输出冲突和需要确认，不会自动改大纲。";
  }
  const quickAnalysis = $("#quickAnalysis");
  if (quickAnalysis) {
    quickAnalysis.placeholder = short
      ? "短篇模式会在“生成骨架”时自动理解已有草稿。需要手动调整时，也可以在这里补充已写内容、缺失环节、最大风险和补全建议。"
      : `点“分析记忆卡”后，这里会出现下一步最该做什么、最大连载风险、${futureName}和续写记忆卡。你也可以手动修改。`;
  }
  const quickSourceText = $("#quickSourceText");
  if (quickSourceText) {
    quickSourceText.placeholder = short
      ? "可以粘贴已有短篇草稿、故事设定、人物小传或想保留的片段。生成骨架时会自动判断缺口和结尾方向。"
      : "可以粘贴整本已写正文、最近几章、故事大纲或人物设定。内容越完整，AI 越能判断下一章该怎么接。";
  }
  const quickBrief = $("#quickBrief");
  if (quickBrief) {
    quickBrief.placeholder = short
      ? "点“生成骨架”后会自动填入：开端、发展、转折、高潮、结尾和情绪落点。"
      : `点“推断${directionName}”后会自动填入。${isLonglineStrategy() ? "前两章会写详细执行方案，第三、四章只做方向预留。" : "也可以自己写：下一章和下下章分别推进什么、出现什么冲突、结尾留什么钩子。"}`;
  }
  const quickOutput = $("#quickOutput");
  if (quickOutput) {
    quickOutput.placeholder = short
      ? "点击“生成短篇”后，完整短篇会出现在这里。建议先点“检查短篇”，确认闭环和结尾后再保存。"
      : "点击“生成正文”后，内容会出现在这里。两章模式会用 ===下一章=== 分隔，满意后点“保存章节”会自动拆分入库。";
  }
  const draftScope = $("#quickDraftScope");
  if (draftScope) {
    draftScope.disabled = short;
    if (short) draftScope.value = "one";
    const scopeLabel = draftScope.closest("label");
    if (scopeLabel) scopeLabel.hidden = short;
  }
  const strategySelect = $("#creativeStrategy");
  if (strategySelect) {
    const strategyLabel = strategySelect.closest("label");
    if (strategyLabel) strategyLabel.hidden = short;
    strategySelect.disabled = short;
  }
  const cadence = $("#cadence");
  if (cadence) {
    const cadenceLabel = cadence.closest("label");
    if (cadenceLabel) cadenceLabel.hidden = short;
  }
  setLabelText($("#targetWords")?.closest("label"), short ? "目标字数" : "每章字数");
  const outlineMode = $("#outlineMode");
  if (outlineMode) {
    const labels = short
      ? {
          initial: "初次整理：从设定/草稿整理完整短篇骨架",
          update: "更新设定：保留手动设定，只补充新增变化",
          check: "检查设定：只找冲突和需要确认，不改设定"
        }
      : {
          initial: "初次整理：从正文整理完整项目大纲",
          update: "更新大纲：保留手动设定，只补充新增变化",
          check: "检查大纲：只找冲突和需要确认，不改大纲"
        };
    Array.from(outlineMode.options).forEach((option) => {
      if (labels[option.value]) option.textContent = labels[option.value];
    });
  }
  updateWorkbenchFocus();
}

function hasContent(value) {
  return Boolean(String(value || "").trim());
}

function currentDraftOutputText() {
  return String($("#quickOutput")?.value || state.quickOutput || "").trim();
}

function isDraftStatusText(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  return /^(正在生成|生成失败|生成前检查|检查通过|生成已暂停|接口测试失败|Codex 生成失败|AI 请求失败|润色失败|分析失败|生成大纲失败|最近 Codex 错误日志)/.test(text)
    || isLegacySkillUnavailableText(text)
    || isInvalidDraftGenerationOutput(text)
    || text.includes("生成已暂停，请先处理以上问题")
    || text.includes("检查通过，正在发送给 AI");
}

function isDraftOutputReady(value = currentDraftOutputText()) {
  return hasContent(value) && !quickDraftBusy && !isDraftStatusText(value);
}

function hasUnsavedGeneratedOutput(value = currentDraftOutputText()) {
  const text = String(value || "").trim();
  return isDraftOutputReady(text) && state.quickOutputSavedHash !== shortHash(text);
}

function isInvalidDraftGenerationOutput(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  return isLegacySkillUnavailableText(text)
    || text.includes("You are being called from the Serial Novel Control web UI")
    || (text.includes("$novel-writing") && (text.includes("没有可用") || text.includes("无法按") || text.includes("技能流程")))
    || /当前会话.{0,30}没有可用.{0,30}novel-writing/i.test(text)
    || /无法.{0,20}技能流程.{0,20}生成正文/.test(text)
    || (lower.includes("unexpected argument") && lower.includes("usage: codex exec"))
    || (lower.includes("codex ran out of room") && lower.includes("context window"))
    || text.includes("模型输出被截断")
    || text.includes("Codex 上下文窗口已满")
    || text.includes("没有返回正文内容")
    || text.includes("最近 Codex 错误日志");
}

function draftOutputValidationMessage(value) {
  if (!isInvalidDraftGenerationOutput(value)) return "";
  if (isLegacySkillUnavailableText(value) || String(value || "").includes("$novel-writing")) {
    return "AI 返回的是旧版 $novel-writing 技能不可用提示，不是正文。请刷新页面后重新生成；如果仍出现，说明接口没有按网页生成流程执行。";
  }
  if (String(value || "").includes("You are being called from the Serial Novel Control web UI")) {
    return "AI 返回了调试包装文本，不是正文。请重新生成；软件已阻止把这类文本保存进正文库。";
  }
  if (String(value || "").toLowerCase().includes("context window")) {
    return "本次上下文仍然过大，Codex 没有返回正文。请先压缩大纲、记忆卡或 AI资料库后再生成。";
  }
  if (String(value || "").includes("模型输出被截断")) {
    return "模型输出被截断，不是完整正文。请调高生成正文最大输出，或改成一次只写一章后重试。";
  }
  return "AI 返回的内容像错误日志或接口说明，不是可保存正文。";
}

function aiContentValidationMessage(content, options = {}, data = {}) {
  if (typeof options.validateContent !== "function") return "";
  return String(options.validateContent(content, data) || "").trim();
}

function draftPartWordCount(part) {
  return String(part || "").replace(/\s/g, "").length;
}

function draftHasChapterHeading(part) {
  return /^#{0,3}\s*第\s*[\d一二两三四五六七八九十百千万〇零]+\s*章/m.test(String(part || ""));
}

function draftWrapperQualityItems(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  const firstLine = text.split(/\n+/).map((line) => line.trim()).find(Boolean) || "";
  const head = text.slice(0, 500);
  const items = [];
  const wrapperStart = /^(好的|当然|没问题|可以|以下是|下面是|这是|我将|我会|已根据|根据你提供|按照你的要求|正文如下|章节如下)[，,。.!！\s:：]/.test(firstLine);
  const wrapperBody = /^(好的|当然|没问题|以下是|下面是|这是).{0,40}(正文|章节|续写|草稿)/.test(firstLine)
    || /^(我将|我会|已根据|根据你提供|按照你的要求).{0,60}(生成|续写|写出|正文|章节)/.test(firstLine);
  if ((wrapperStart || wrapperBody) && !draftHasChapterHeading(firstLine)) {
    items.push({
      level: "warn",
      message: "正文开头像 AI 说明/前言，建议删除“好的、以下是正文”等包装文字后再保存。"
    });
  }
  if (/^(分析|思路|大纲|检查|报告|说明|改写建议|润色建议|发布检查)\s*[:：]/m.test(head) && !draftHasChapterHeading(firstLine)) {
    items.push({
      level: "warn",
      message: "正文开头像分析或报告标题，建议确认没有把提示词、检查结果或说明文本混进正文。"
    });
  }
  return items;
}

function countPattern(text, pattern) {
  const matches = String(text || "").match(pattern);
  return matches ? matches.length : 0;
}

function draftSemanticSignals(part) {
  const text = String(part || "");
  const tail = text.slice(-420);
  return {
    movement: countPattern(text, /决定|发现|确认|拿到|获得|失去|暴露|进入|离开|打开|关闭|突破|逃出|追上|包围|反杀|杀死|受伤|死亡|交易|达成|破坏|升级|回收|揭开|真相|秘密|证据|钥匙|名单|物资|药|枪|门|锁|系统|权限|基地|安全屋|避难所|危机|代价|选择|背叛|合作|信任|矛盾|冲突/g),
    reward: countPattern(text, /终于|原来|答案|真相|线索|证据|钥匙|名单|物资|药|安全|救下|活下来|反杀|赢|拿到|获得|打开|突破|升级|回收|兑现|证明|确认|机会|希望|喘息|松了口气/g),
    pressure: countPattern(text.slice(-360), /但是|然而|可|忽然|突然|门外|身后|脚步|声音|警报|倒计时|血|枪|锁|人影|来了|不对|不能|必须|危险|死|秘密|真相|名单|钥匙|问题|没有结束|还没结束|下一秒|就在这时/g),
    dialogue: countPattern(text, /[“「][^”」]{2,120}[”」]/g),
    sceneDetail: countPattern(text, /门|窗|墙|桌|椅|灯|雨|风|雪|雾|血|汗|脚步|枪声|广播|屏幕|手机|纸|钥匙|名单|车|电梯|走廊|仓库|房间|街|楼|基地|安全屋|避难所|冷风|冷汗|发冷|冰冷|热浪|滚烫|黑暗|漆黑|亮光|灯亮|红光|白光|灰尘|潮湿|疼痛|痛感|气味|味道|血腥味|霉味|烟味|药味|尘土|烟尘/g),
    actionEmotion: countPattern(text, /皱眉|咬牙|握紧|抬头|低头|后退|停住|推开|伸手|按住|看见|听见|闻到|喘|发抖|僵住|沉默|笑|哭|怒|怕|疼|盯着|转身|靠近|离开/g),
    exposition: countPattern(text, /这意味着|也就是说|换句话说|问题在于|问题是|重点是|事实上|从某种意义上|更准确地说|不是因为|而是因为|他很清楚|她很清楚/g),
    aiTexture: countPattern(text, /深吸一口气|空气凝固|嘴角微扬|眼神复杂|心里一紧|沉默了片刻|气氛一瞬间|某种意义上|无法形容|说不出的/g),
    ruleLoop: countPattern(text, /记录|复核|校验|流程|字段|责任|签收|保留|封存|归档|对象|来源|申请|权限|待确认|待启动|系统提示|系统弹出/g),
    reportLine: countPattern(text, /(^|\n)\s*(当前|来源|记录|复核|校验|申请|对象|状态|结论|处理方式|确认|更新)\s*[：:]/g),
    physicalTemplate: countPattern(text, /眼神|脸色|盯着|沉默|声音压低|冷声道|笑了一声|平静道|声音落下/g),
    systemHook: countPattern(tail, /系统提示|系统弹出|待确认|待启动|申请|进入.{0,10}流程|是否|当前状态|记录刷新/g)
  };
}

function repeatedSentenceRisk(part) {
  const sentences = String(part || "")
    .split(/[。！？!?；;…\n]+/)
    .map((sentence) => sentence.replace(/\s+/g, "").trim())
    .filter((sentence) => sentence.length >= 10 && sentence.length <= 80);
  const seen = new Map();
  let previous = "";
  let currentRun = 0;
  let longestRun = 0;
  sentences.forEach((sentence) => {
    seen.set(sentence, (seen.get(sentence) || 0) + 1);
    if (sentence === previous) {
      currentRun += 1;
    } else {
      previous = sentence;
      currentRun = 1;
    }
    longestRun = Math.max(longestRun, currentRun);
  });
  const repeated = Array.from(seen.entries()).filter(([, count]) => count > 1);
  return {
    repeatedCount: repeated.reduce((sum, [, count]) => sum + count - 1, 0),
    longestRun,
    examples: repeated.slice(0, 2).map(([sentence]) => sentence)
  };
}

function draftSemanticQualityItems(part, index, target) {
  const count = draftPartWordCount(part);
  const label = isShortStory() ? "短篇" : `第 ${index} 段`;
  const signals = draftSemanticSignals(part);
  const repeat = repeatedSentenceRisk(part);
  const items = [];
  const push = (level, message) => items.push({ level, message });
  if (count >= Math.max(700, Math.floor(target * 0.45))) {
    if (signals.movement < 3) {
      push("warn", `${label}的状态变化/剧情推进信号偏少，建议确认不是只在解释或原地情绪循环。`);
    } else {
      push("pass", `${label}有可识别的行动、信息或关系推进信号。`);
    }
    if (signals.reward < 2) {
      push("warn", `${label}的读者奖励不够明显，建议确认是否兑现了线索、资源、反击、答案或情绪释放。`);
    } else {
      push("pass", `${label}能识别到读者奖励或信息回报。`);
    }
    if (signals.dialogue < 1 && signals.actionEmotion < 3) {
      push("warn", `${label}对话/人物交锋信号偏少，可能像说明书。建议增加符合人物身份的短对话、动作或情绪反应。`);
    } else {
      push("pass", `${label}有人物交锋、动作或情绪反应信号。`);
    }
    if (signals.sceneDetail < 4) {
      push("warn", `${label}场景物件/感官细节偏少，建议补一点可见物、声音、触感或空间位置，让正文更有小说现场感。`);
    } else {
      push("pass", `${label}有可识别的场景物件或感官细节。`);
    }
  }
  if (!isShortStory() && count >= 500) {
    if (signals.pressure < 1) {
      push("warn", `${label}章末压力不明显，建议确认结尾有没有新危险、悬念、选择或下一章起手压力。`);
    } else {
      push("pass", `${label}结尾有可识别的压力或钩子信号。`);
    }
  }
  if (signals.exposition >= 5) {
    push("warn", `${label}解释性连接词较多，可能显得报告式或水文，建议删减重复说明。`);
  }
  if (signals.aiTexture >= 3) {
    push("warn", `${label}常见 AI 套话密度偏高，建议送去润色或手动替换。`);
  }
  const formalDensityLimit = Math.max(24, Math.floor(count / 85));
  if (signals.ruleLoop + signals.reportLine >= formalDensityLimit) {
    push("warn", `${label}规则术语密度偏高，容易变成流程报告腔。建议每3-5条规则信息后落到人物选择、身体代价、敌方损失或场景变化。`);
  }
  const physicalTemplateLimit = Math.max(10, Math.floor(count / 140));
  if (signals.physicalTemplate >= physicalTemplateLimit) {
    push("warn", `${label}通用情绪动作偏多，建议减少“眼神、脸色、盯着、沉默”等泛化反应，改成人物专属动作。`);
  }
  if (!isShortStory() && signals.systemHook >= 2) {
    push("warn", `${label}章末钩子偏系统提示/待确认，建议把钩子落成真实危险、人物选择、敌方动作或可见奖励。`);
  }
  if (repeat.longestRun >= 8) {
    push("block", `${label}存在连续重复句风险，最长连续重复 ${repeat.longestRun} 句，建议先删除重复段落再保存。`);
  } else if (repeat.longestRun >= 3) {
    push("warn", `${label}存在连续重复句风险，最长连续重复 ${repeat.longestRun} 句，建议检查是否误复制。`);
  }
  if (repeat.repeatedCount >= 2) {
    push("warn", `${label}存在重复句风险：${repeat.examples.join(" / ")}。`);
  }
  return items;
}

function fulfillmentCleanupText(value) {
  return String(value || "")
    .replace(/第\s*[\d一二两三四五六七八九十百千万〇零]+\s*章/g, " ")
    .replace(/必须出现|读者奖励|本章|章节|方向|剧情|目标|建议|需要|承接|推进|兑现|确认|发现|决定|继续|开始|通过|进行|然后|最后|当前|下一章/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fulfillmentKeywordFragments(value) {
  const cleaned = fulfillmentCleanupText(value);
  const fragments = [];
  cleaned
    .split(/[\s,，、；;。.!！?？:：|/\\()\[\]【】《》"'“”‘’]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      if (item.length >= 2 && item.length <= 12) fragments.push(item);
      if (/[\u3400-\u9fff]/.test(item) && item.length > 2) {
        for (let index = 0; index <= item.length - 2; index += 1) {
          fragments.push(item.slice(index, index + 2));
        }
      }
    });
  return Array.from(new Set(fragments))
    .filter((item) => item.length >= 2 && !/^[第章节本]+$/.test(item))
    .slice(0, 16);
}

function fulfillmentTerms(value, max = 8) {
  return String(value || "")
    .split(/[\n\r,，、；;。.!！?？|/\\]+/)
    .map((item) => item.replace(/^[-*\d.、\s]+/, "").trim())
    .filter((item) => item.length >= 2)
    .slice(0, max);
}

function fulfillmentTermHit(text, term) {
  const normalizedText = String(text || "").replace(/\s+/g, "");
  const normalizedTerm = String(term || "").replace(/\s+/g, "");
  if (!normalizedText || !normalizedTerm) return false;
  if (normalizedText.includes(normalizedTerm)) return true;
  return fulfillmentKeywordFragments(term).some((fragment) => normalizedText.includes(fragment));
}

function missingFulfillmentTerms(text, terms) {
  return (terms || []).filter((term) => !fulfillmentTermHit(text, term));
}

function draftPartChapterNumber(index) {
  const start = Number(state.quickBriefStartChapter || 0) || nextChapterNumber();
  return start + Math.max(0, Number(index || 1) - 1);
}

function simpleChineseNumber(value) {
  const map = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const number = Number(value || 0);
  if (number >= 0 && number <= 10) return map[number];
  return String(number);
}

function briefSegmentForChapter(number) {
  const brief = String(state.quickBrief || "");
  if (!brief || !number) return "";
  const offset = Math.max(1, Number(number || 0) - (Number(state.quickBriefStartChapter || 0) || nextChapterNumber()) + 1);
  const ordinal = simpleChineseNumber(offset);
  const marker = new RegExp(`第\\s*(?:${number}|${offset}|${ordinal})\\s*章[\\s\\S]*?(?=\\n\\s*\\d+\\.|\\n\\s*第\\s*[\\d一二两三四五六七八九十百千万〇零]+\\s*章|$)`);
  const matched = brief.match(marker);
  return matched ? matched[0].trim() : "";
}

function normalizeDirectionAnchorLine(value) {
  return String(value || "")
    .replace(/^[-*•\d.、\s]+/, "")
    .replace(/^(标题建议|本章核心目标|核心目标|开头承接点|如何承接[^:：]*|人物推进|伏笔\/信息推进|信息推进|读者奖励|章末钩子|必须出现|需要避免的跑偏点)\s*[:：-]?\s*/i, "")
    .trim();
}

function directionAnchorTextFromValue(value, max = 8) {
  const source = String(value || "").trim();
  if (!source) return "";
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const anchors = [];
  const anchorPattern = /本章核心目标|核心目标|读者奖励|章末钩子|必须出现|伏笔\/信息推进|信息推进|人物推进/;
  const stopPattern = /标题建议|开头承接点|需要避免|两章连续性|四章连续性|项目大纲分析|小说理解结果分析|最近章节承接|第[一二三四五六七八九十\d]+章推断/;
  lines.forEach((line, index) => {
    if (!anchorPattern.test(line)) return;
    const current = normalizeDirectionAnchorLine(line);
    if (current && current.length >= 2) anchors.push(current);
    for (let offset = 1; offset <= 2; offset += 1) {
      const nextLine = lines[index + offset] || "";
      if (!nextLine || anchorPattern.test(nextLine) || stopPattern.test(nextLine)) break;
      const normalized = normalizeDirectionAnchorLine(nextLine);
      if (normalized && normalized.length >= 2) anchors.push(normalized);
    }
  });
  return Array.from(new Set(anchors))
    .slice(0, max)
    .join("；");
}

function directionAnchorTextFromBrief(max = 8) {
  return directionAnchorTextFromValue(state.quickBrief, max);
}

function directionAnchorTextForChapter(number, max = 6) {
  return directionAnchorTextFromValue(briefSegmentForChapter(number), max) || directionAnchorTextFromBrief(max);
}

function draftRequiredAnchorText() {
  const explicit = [state.quickMustHave, state.readerReward]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join("、");
  return explicit || directionAnchorTextFromBrief();
}

function draftPlanFulfillmentItems(parts) {
  const items = [];
  const add = (level, message) => items.push({ level, message });
  const fullText = (parts || []).join("\n\n");
  const requiredText = draftRequiredAnchorText();
  const requiredTerms = fulfillmentTerms(requiredText, 10);
  if (requiredTerms.length) {
    const missing = missingFulfillmentTerms(fullText, requiredTerms);
    if (missing.length) {
      add("warn", `必须出现/读者奖励未明显命中：${missing.slice(0, 6).join("、")}。保存前建议确认是否已经兑现，或改写得更明确。`);
    } else {
      add("pass", "必须出现/读者奖励已有明显命中。");
    }
  }
  if (!isShortStory() && (state.quickBrief || "").trim()) {
    (parts || []).forEach((part, index) => {
      const chapterNumber = draftPartChapterNumber(index + 1);
      const anchorText = directionAnchorTextForChapter(chapterNumber, 6);
      const segment = anchorText || briefSegmentForChapter(chapterNumber);
      const terms = fulfillmentTerms(segment, 6).filter((term) => !/^第\s*\d+\s*章$/.test(term));
      if (!terms.length) return;
      const missing = missingFulfillmentTerms(part, terms);
      if (missing.length === terms.length) {
        add("warn", `第${chapterNumber}章方向关键词未明显命中：${terms.slice(0, 4).join("、")}。建议核对是否偏离章节方向。`);
      } else {
        add("pass", `第${chapterNumber}章方向与正文有关键词重合。`);
      }
    });
  }
  return items;
}

function draftTargetChapterNumbers(parts) {
  const numbers = (parts || [])
    .map((part, index) => {
      const fallback = draftPartChapterNumber(index + 1);
      return Number(chapterNumberFromGeneratedChapter(part, fallback) || fallback || 0);
    })
    .filter((number) => number > 0);
  return Array.from(new Set(numbers));
}

function revisionTaskAppliesToDraft(task, targetNumbers) {
  const chapterNumber = Number(task?.chapterNumber || 0);
  if (!chapterNumber) return true;
  if (!targetNumbers.length) return true;
  return targetNumbers.includes(chapterNumber);
}

function draftRevisionTaskQualityItems(parts) {
  const targetNumbers = draftTargetChapterNumbers(parts);
  const blockers = (Array.isArray(state.revisionTasks) ? state.revisionTasks : [])
    .filter((task) => task && task.status === "todo" && task.severity === "block")
    .filter((task) => revisionTaskAppliesToDraft(task, targetNumbers))
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")))
    .slice(0, 6);
  if (!blockers.length) return [];
  const taskText = blockers.map((task) => {
    const chapter = Number(task.chapterNumber || 0) ? `第${task.chapterNumber}章` : "全局";
    const review = task.reviewStatus === "todo" ? "（复查仍需处理）" : "";
    return `${chapter}${review}：${compactLine(task.title || task.detail || "未命名任务", 70)}`;
  }).join("；");
  return [{
    level: "warn",
    source: "revisionTaskGate",
    message: `当前生成范围仍有未处理高优先级修改任务：${taskText}。保存前建议先处理，或确认本次正文已经修复/任务不适用后再点“确认仍保存”。`
  }];
}

function draftQualityReport(value = currentDraftOutputText()) {
  const text = String(value || "").trim();
  const items = [];
  const add = (level, message) => items.push({ level, message });
  if (!text) {
    return {
      level: "idle",
      title: "等待正文",
      summary: "生成正文后会自动检查章节完整度、保存风险和明显 AI 痕迹。",
      items: []
    };
  }
  const validationMessage = draftOutputValidationMessage(text);
  if (validationMessage || isDraftStatusText(text)) {
    add("block", validationMessage || "当前内容是生成状态、检查文本或失败日志。");
    return {
      level: "block",
      title: "不建议保存",
      summary: "当前内容不是可入库正文，已阻止保存。",
      items
    };
  }
  const parts = isShortStory() ? [text] : splitGeneratedChapters(text);
  const expected = isShortStory() ? 1 : (shouldDraftTwoChapters() ? 2 : 1);
  const target = Math.max(300, Number(state.targetWords || defaults.targetWords || 2500));
  const partCounts = parts.map(draftPartWordCount);
  const total = partCounts.reduce((sum, value) => sum + value, 0);
  if (!parts.length || total < 300) {
    add("block", "正文长度过短，疑似没有生成完整内容。");
  } else {
    add("pass", `已识别 ${parts.length} 段正文，共 ${total} 字。`);
  }
  draftWrapperQualityItems(text).forEach((item) => add(item.level, item.message));
  if (!isShortStory() && parts.length !== expected) {
    add("warn", `当前设置为${quickDraftScopeLabel()}，但识别到 ${parts.length} 章；保存前建议确认分章。`);
  } else {
    add("pass", isShortStory() ? "短篇模式不要求分章。" : "章节数量与当前生成范围匹配。");
  }
  const shortParts = partCounts
    .map((count, index) => ({ count, index: index + 1 }))
    .filter((item) => item.count < Math.max(500, Math.floor(target * 0.35)));
  if (shortParts.length) {
    add("warn", `第 ${shortParts.map((item) => item.index).join("、")} 段偏短，可能需要补足场景推进或情绪收束。`);
  } else {
    add("pass", "单章长度没有明显偏短。");
  }
  if (!isShortStory()) {
    const missingHeading = parts
      .map((part, index) => ({ ok: draftHasChapterHeading(part), index: index + 1 }))
      .filter((item) => !item.ok);
    if (missingHeading.length) {
      add("warn", `第 ${missingHeading.map((item) => item.index).join("、")} 段缺少“第X章”标题，保存时可能只能使用自动标题。`);
    } else {
      add("pass", "章节标题格式可识别。");
    }
  }
  const ending = text.slice(-1);
  if (!/[。！？!?」』”’…]$/.test(ending)) {
    add("warn", "结尾不像自然段落收束，建议确认是否被截断。");
  } else {
    add("pass", "结尾标点看起来是自然收束。");
  }
  const aiTraceCount = countPattern(text, /深吸一口气|空气凝固|嘴角微扬|眼神复杂|心里一紧/g);
  if (aiTraceCount >= 2) {
    add("warn", `检测到 ${aiTraceCount} 处常见模板化表达，建议送去润色或手动替换。`);
  }
  parts.forEach((part, index) => {
    draftSemanticQualityItems(part, index + 1, target).forEach((item) => add(item.level, item.message));
  });
  draftPlanFulfillmentItems(parts).forEach((item) => add(item.level, item.message));
  draftRevisionTaskQualityItems(parts).forEach((item) => items.push(item));
  const hasBlock = items.some((item) => item.level === "block");
  const hasWarn = items.some((item) => item.level === "warn");
  return {
    level: hasBlock ? "block" : (hasWarn ? "warn" : "pass"),
    title: hasBlock ? "不建议保存" : (hasWarn ? "建议检查后保存" : "可保存"),
    summary: hasBlock
      ? "当前内容存在明确保存风险。"
      : (hasWarn ? "正文可用，但保存前建议处理提示项。" : "本地质量门未发现明显保存风险。"),
    items
  };
}

function renderDraftQualityGate(value = currentDraftOutputText(), options = {}) {
  const panel = $("#draftQualityPanel");
  if (!panel) return;
  const report = draftQualityReport(value);
  panel.dataset.level = report.level;
  panel.hidden = report.level === "idle";
  setText("draftQualityTitle", report.title);
  setText("draftQualitySummary", report.summary);
  const list = $("#draftQualityList");
  if (list) {
    list.innerHTML = report.items.map((item) => `<li data-level="${escapeAttr(item.level)}">${escapeHtml(item.message)}</li>`).join("");
  }
  const forceSave = $("#draftQualityForceSaveBtn");
  if (forceSave) {
    forceSave.hidden = !(report.level === "warn" && options.allowForceSave);
  }
}

function draftQualityActionText() {
  syncFields();
  const text = currentDraftOutputText();
  if (!text) {
    setStatus("生成正文里还没有内容");
    return "";
  }
  if (!isDraftOutputReady(text)) {
    setStatus("当前内容是生成状态、检查文本或失败日志，不能送去处理");
    return "";
  }
  return text;
}

function draftQualityContextText(text) {
  const report = draftQualityReport(text);
  const lines = report.items.map((item) => `- ${item.level.toUpperCase()}：${item.message}`).join("\n") || "- 暂无提示项。";
  return `【保存前质量门结果】\n结论：${report.title}\n说明：${report.summary}\n${lines}`;
}

function revisionStatusLabel(status) {
  return {
    todo: "待处理",
    done: "已处理",
    ignored: "忽略"
  }[status] || "待处理";
}

function revisionSourceLabel(source) {
  return {
    qualityGate: "保存前质量门",
    qualityAudit: "长篇体检",
    releaseCheck: "发布检查",
    manual: "手动任务"
  }[source] || source || "修改任务";
}

const revisionRouteLabels = {
  chapter: "正文修复",
  outline: "大纲补充",
  memory: "记忆卡补充",
  direction: "方向避坑",
  confirm: "作者确认",
  later: "暂缓处理"
};

function revisionRouteLabel(route) {
  return revisionRouteLabels[route] || revisionRouteLabels.chapter;
}

function inferRevisionTaskRoute(task) {
  const text = [
    task?.targetRoute,
    task?.title,
    task?.detail,
    task?.sourceLabel,
    task?.source
  ].filter(Boolean).join(" ");
  if (/作者|确认|待确认|拍板|决定|二选一|取舍|可变项/.test(text)) return "confirm";
  if (/大纲|主线|阶段|分卷|核心卖点|世界观|背景|长期|结局|结构|设定冲突|战力体系|时间线|规则边界/.test(text)) return "outline";
  if (/记忆卡|小说理解|人物状态|人物关系|已发生|当前状态|未回收|伏笔|道具|伤势|事实库|资料库/.test(text)) return "memory";
  if (/下一章|后续|以后|未来|生成|方向|避坑|不要再|继续|每章|长期避免|跑偏/.test(text)) return "direction";
  if (/暂缓|忽略|观察|不急|以后再看/.test(text)) return "later";
  return "chapter";
}

function normalizeRevisionTaskRoute(value, task) {
  const route = String(value || "").trim();
  return Object.prototype.hasOwnProperty.call(revisionRouteLabels, route)
    ? route
    : inferRevisionTaskRoute(task);
}

state = loadState();

function revisionRouteOptions(selected) {
  return Object.keys(revisionRouteLabels)
    .map((route) => `<option value="${route}" ${selected === route ? "selected" : ""}>${revisionRouteLabel(route)}</option>`)
    .join("");
}

function revisionRouteCounts(tasks = state.revisionTasks || []) {
  return tasks.reduce((acc, task) => {
    if (task.status !== "todo") return acc;
    const route = normalizeRevisionTaskRoute(task.targetRoute, task);
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});
}

function buildRevisionTask({ source, sourceLabel, severity, title, detail, chapterNumber }) {
  const now = new Date().toISOString();
  return normalizeRevisionTask({
    id: `revision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "todo",
    source,
    sourceLabel: sourceLabel || revisionSourceLabel(source),
    severity: severity || "warn",
    chapterNumber: Number(chapterNumber || 0),
    title,
    detail,
    createdAt: now,
    updatedAt: now
  });
}

function addRevisionTasks(tasks, label = "修改任务") {
  const normalized = (tasks || []).map((task, index) => normalizeRevisionTask(task, index)).filter(Boolean);
  if (!normalized.length) {
    setStatus(`${label}里没有可加入的待办`);
    return 0;
  }
  const existing = new Set((state.revisionTasks || []).map((task) => [
    task.source,
    task.chapterNumber || 0,
    compactLine(task.title, 120),
    compactLine(task.detail, 180)
  ].join("|")));
  let added = 0;
  normalized.forEach((task) => {
    const key = [
      task.source,
      task.chapterNumber || 0,
      compactLine(task.title, 120),
      compactLine(task.detail, 180)
    ].join("|");
    if (existing.has(key)) return;
    existing.add(key);
    state.revisionTasks.push(task);
    added += 1;
  });
  state.revisionTasks = (state.revisionTasks || []).slice(-120);
  renderRevisionTasks();
  persist();
  setStatus(added ? `已加入 ${added} 条${label}` : `${label}没有新增待办`);
  return added;
}

function qualityGateRevisionAction(item) {
  const message = String(item?.message || "");
  const titleDetail = (title, detail, severity = item?.level || "warn") => ({ title, detail, severity });
  if (message.includes("连续重复句风险")) {
    return titleDetail(
      "删除连续重复段落",
      "先定位质量门提示的重复句，删除误复制段落，只保留一次完整事件链；删除后补一两句承接，确认章末钩子仍成立。",
      item?.level === "block" ? "block" : "warn"
    );
  }
  if (message.includes("规则术语密度偏高")) {
    return titleDetail(
      "把流程规则落成可见行动和代价",
      "保留必要规则信息，但每3-5条流程/复核/记录信息后，补上人物选择、身体代价、敌方损失、空间变化或明确读者奖励。"
    );
  }
  if (message.includes("章末钩子偏系统提示/待确认")) {
    return titleDetail(
      "重写章末钩子为真实危险或人物选择",
      "不要只用系统提示、待确认、进入流程收尾；改成枪声、追兵、暴露、关键人选择、真相露出或临时胜利后的反扑。"
    );
  }
  if (message.includes("通用情绪动作偏多")) {
    return titleDetail(
      "替换泛化情绪动作",
      "减少“眼神、脸色、盯着、沉默”等通用反应，改成人物专属动作、具体物件反应、判断失误或身体细节。"
    );
  }
  if (message.includes("对话/人物交锋信号偏少")) {
    return titleDetail(
      "补人物交锋和短对话",
      "给当前场景加入符合身份和压力的短对话、动作交锋或立场选择，让章节不是单纯说明。"
    );
  }
  if (message.includes("场景物件/感官细节偏少")) {
    return titleDetail(
      "补小说现场感",
      "补2-3个不可替换的现场细节，例如地面、光源、气味、设备噪声、伤口、站位或手里物件。"
    );
  }
  if (message.includes("解释性连接词较多")) {
    return titleDetail(
      "压缩解释腔",
      "删掉重复的“这意味着、也就是说、问题在于”，把结论落到角色动作、误判、选择或对话停顿里。"
    );
  }
  if (message.includes("读者奖励不够明显")) {
    return titleDetail(
      "补清楚本章读者奖励",
      "明确本章给读者的回报：线索、物资、反击、答案、情绪释放或阶段性胜利，避免只铺垫不兑现。"
    );
  }
  if (message.includes("章末压力不明显")) {
    return titleDetail(
      "强化章末压力",
      "结尾补一个新危险、未完成动作、信息差、选择压力或下一章起手冲突。"
    );
  }
  if (message.includes("必须出现/读者奖励未明显命中")) {
    return titleDetail(
      "补齐必须出现和读者奖励",
      "回看章节方向里的核心目标、读者奖励和章末钩子，把缺失项补进正文，不要只换标题。"
    );
  }
  if (message.includes("方向关键词未明显命中")) {
    return titleDetail(
      "校准章节方向",
      "核对当前正文是否真的执行了下两章方向；如果偏航，补回目标场景、关键人物、伏笔或读者奖励。"
    );
  }
  if (message.includes("AI 说明/前言") || message.includes("分析或报告标题")) {
    return titleDetail(
      "删除AI包装文字",
      "删除“好的、以下是正文、分析、报告”等非小说正文内容，确保开头直接进入章节标题或故事场景。"
    );
  }
  return titleDetail(message, `保存前质量门：${message}`);
}

function qualityGateRevisionTaskFromItem(item, chapterNumber) {
  const action = qualityGateRevisionAction(item);
  return buildRevisionTask({
    source: "qualityGate",
    severity: action.severity,
    chapterNumber,
    title: action.title,
    detail: `质量门原始提示：${item.message}\n处理建议：${action.detail}`
  });
}

function revisionTasksFromQualityGate() {
  const text = currentDraftOutputText();
  if (!text) return [];
  const report = draftQualityReport(text);
  const chapterNumber = isShortStory() ? 0 : nextChapterNumber();
  return report.items
    .filter((item) => (item.level === "warn" || item.level === "block") && item.source !== "revisionTaskGate")
    .map((item) => qualityGateRevisionTaskFromItem(item, chapterNumber))
    .filter(Boolean);
}

function cleanRevisionLine(line) {
  return String(line || "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\s*(?:[-*•]|\d+[.、)]|[（(]?\d+[）)])\s*/, "")
    .replace(/^(?:问题|风险|建议|必须改|待处理|修改任务)\s*[:：]\s*/, "")
    .trim();
}

function revisionFieldKey(label) {
  const value = String(label || "").trim();
  if (/^(问题|任务|风险)$/.test(value)) return "problem";
  if (/^(位置|章节)$/.test(value)) return "location";
  if (value === "影响") return "impact";
  if (/^(怎么改|处理建议|修改建议|建议)$/.test(value)) return "fix";
  if (value === "优先级") return "priority";
  if (/^(验证|复查)$/.test(value)) return "verify";
  return "";
}

function revisionFieldPairsFromLine(line) {
  const cleaned = String(line || "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\s*(?:[-*•]|\d+[.、)]|[（(]?\d+[）)])\s*/, "")
    .trim();
  if (!cleaned) return [];
  const labels = "处理建议|修改建议|怎么改|优先级|问题|任务|风险|位置|章节|影响|建议|验证|复查";
  const pattern = new RegExp(`(?:^|[|｜；;]\\s*)(${labels})\\s*[:：]\\s*([\\s\\S]*?)(?=\\s*(?:[|｜；;]\\s*)?(?:${labels})\\s*[:：]|$)`, "g");
  const pairs = [];
  let match;
  while ((match = pattern.exec(cleaned)) !== null) {
    const key = revisionFieldKey(match[1]);
    const value = String(match[2] || "").trim();
    if (key && value) pairs.push([key, value]);
  }
  return pairs;
}

function structuredRevisionBlocksFromText(text) {
  const blocks = [];
  let current = null;
  const commit = () => {
    if (current && (current.problem || current.fix || current.impact)) {
      blocks.push(current);
    }
    current = null;
  };
  String(text || "").split(/\r?\n/).forEach((rawLine) => {
    const line = String(rawLine || "").trim();
    if (!line) {
      if (current?.problem && current?.fix) commit();
      return;
    }
    const pairs = revisionFieldPairsFromLine(line);
    if (!pairs.length) {
      if (current && !/^#{1,6}\s*/.test(line)) {
        current.extra = [current.extra, cleanRevisionLine(line)].filter(Boolean).join("\n");
      }
      return;
    }
    pairs.forEach(([key, value]) => {
      if (key === "problem" && current && (current.problem || current.fix || current.impact)) commit();
      if (!current) current = {};
      if (key === "problem") current.problem = cleanRevisionLine(value);
      else current[key] = cleanRevisionLine(value);
    });
  });
  commit();
  return blocks;
}

function revisionSeverityFromStructuredBlock(block) {
  const text = [block?.priority, block?.problem, block?.impact, block?.fix].filter(Boolean).join(" ");
  if (/P0|高风险|严重|必须|阻断|不可|崩|不能/.test(text)) return "block";
  return "warn";
}

function chapterNumberFromRevisionLocation(location, fallback = 0) {
  const match = String(location || "").match(/第\s*(\d+)\s*章/);
  return match ? Number(match[1]) : Number(fallback || 0);
}

function revisionTaskFromStructuredBlock(block, source, sourceLabel) {
  const title = compactLine(block.problem || block.fix || block.impact || "", 120);
  if (!title || title.length < 4) return null;
  const fallbackChapter = Number(currentChapterRecord()?.number || 0);
  const detail = [
    block.location ? `位置：${block.location}` : "",
    block.impact ? `影响：${block.impact}` : "",
    block.fix ? `怎么改：${block.fix}` : "",
    block.priority ? `优先级：${block.priority}` : "",
    block.verify ? `验证：${block.verify}` : "",
    block.extra ? `补充：${block.extra}` : ""
  ].filter(Boolean).join("\n");
  return buildRevisionTask({
    source,
    sourceLabel,
    severity: revisionSeverityFromStructuredBlock(block),
    chapterNumber: chapterNumberFromRevisionLocation(block.location, fallbackChapter),
    title,
    detail: detail || `${sourceLabel}：${title}`
  });
}

function revisionTasksFromStructuredText(text, source, sourceLabel) {
  return structuredRevisionBlocksFromText(text)
    .map((block) => revisionTaskFromStructuredBlock(block, source, sourceLabel))
    .filter(Boolean)
    .slice(0, 20);
}

function revisionTasksFromText(text, source, sourceLabel) {
  const structured = revisionTasksFromStructuredText(text, source, sourceLabel);
  if (structured.length) return structured;
  const important = /必须|建议|风险|问题|缺少|不足|不够|需要|修改|重写|水文|AI|套话|重复|崩|伏笔|动机|奖励|章末|钩子|连续|设定|人物|冲突|节奏|读者|付费|追读/;
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(cleanRevisionLine)
    .filter((line) => line.length >= 8 && line.length <= 160)
    .filter((line) => important.test(line))
    .slice(0, 20);
  return lines.map((line) => buildRevisionTask({
    source,
    sourceLabel,
    severity: /必须|严重|阻断|崩|不能|不可/.test(line) ? "block" : "warn",
    chapterNumber: Number(currentChapterRecord()?.number || 0),
    title: line,
    detail: `${sourceLabel}：${line}`
  })).filter(Boolean);
}

function todoRevisionTasks(limit = 8) {
  const tasks = Array.isArray(state.revisionTasks) ? state.revisionTasks : [];
  return tasks
    .filter((task) => task.status === "todo")
    .slice()
    .sort((a, b) => {
      const severityScore = (task) => task.severity === "block" ? 0 : 1;
      const severityDiff = severityScore(a) - severityScore(b);
      if (severityDiff) return severityDiff;
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    })
    .slice(0, limit);
}

function revisionTaskLineForPrompt(task, index) {
  const severity = task.severity === "block" ? "P0" : "P1";
  const chapter = task.chapterNumber ? `第${task.chapterNumber}章 · ` : "";
  const source = task.sourceLabel || revisionSourceLabel(task.source);
  const route = revisionRouteLabel(normalizeRevisionTaskRoute(task.targetRoute, task));
  const detail = compactLine(String(task.detail || "").replace(/\n+/g, "；"), 180);
  return `${index + 1}. [${severity}] ${chapter}${task.title || "未命名任务"}（来源：${source}；处理去向：${route}）${detail ? `\n   处理依据：${detail}` : ""}`;
}

function revisionTasksContextForPrompt(title = "当前未处理修改任务", limit = 8) {
  const tasks = todoRevisionTasks(limit);
  if (!tasks.length) return "";
  return `${title}：\n${tasks.map(revisionTaskLineForPrompt).join("\n")}\n\n执行要求：本次任务要优先避免新增这些问题；如果任务涉及当前章节或当前生成范围，请在不改变既定剧情和人物关系的前提下处理。`;
}

function revisionTasksReviewInstructionForPrompt(limit = 8) {
  const tasks = todoRevisionTasks(limit);
  if (!tasks.length) return "";
  return `未处理修改任务复查要求：
1. 必须新增一个板块“未处理修改任务复查”。
2. 对上方每条未处理修改任务逐条判断：已解决 / 仍存在 / 部分解决 / 不适用。
3. 每条必须写明证据：引用当前章节、最近章节、质量门结果或上下文里能证明判断的具体依据；证据不足时标“证据不足”。
4. 如果结论是“仍存在”或“部分解决”，必须在“可执行修改任务”或“发布前必须改”里继续给出结构化任务，字段仍使用：问题、影响、怎么改、优先级、验证。
5. 不要因为任务出现在列表里就默认已解决，必须用正文证据判断。`;
}

function revisionReviewStatusFromText(text) {
  const line = String(text || "");
  if (!line.trim()) return "unknown";
  if (/不适用|无需处理|无需修改|不再适用/.test(line)) return "ignored";
  if (/部分解决|部分已解决|部分处理|部分修复|尚未完全解决/.test(line)) return "todo";
  if (/已解决|已经解决|已处理|已经处理|已修复|已经修复|已消除|已兑现/.test(line)) return "done";
  if (/仍存在|仍然存在|未解决|没有解决|未处理|没有处理|继续存在|还存在|证据不足|无法确认/.test(line)) return "todo";
  return "unknown";
}

function revisionReviewStatusLabel(status) {
  return {
    done: "已解决",
    ignored: "不适用",
    todo: "仍需处理",
    unknown: "未识别"
  }[status] || "未识别";
}

function revisionReviewSectionFromText(text) {
  const source = String(text || "");
  const start = source.indexOf("未处理修改任务复查");
  if (start < 0) return "";
  const lines = source.slice(start).split(/\r?\n/);
  const section = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index > 0 && /^#{1,6}\s+/.test(line) && !line.includes("未处理修改任务复查")) break;
    if (index > 0 && /^(可执行修改任务|发布前必须改|检查项|待检查章节|修改建议)[:：]?\s*$/.test(line.trim())) break;
    section.push(line);
  }
  return section.join("\n").trim();
}

function revisionReviewEntriesFromText(text) {
  const section = revisionReviewSectionFromText(text);
  if (!section) return [];
  const entries = [];
  section.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.includes("未处理修改任务复查要求")) return;
    if (/^#{1,6}\s*.*未处理修改任务复查/.test(line)) return;
    const match = line.match(/^(?:[-*]\s*)?(?:任务\s*)?(?:第\s*)?(\d+)(?:\s*条)?[.、):：\s-]+(.+)$/);
    if (match) {
      entries.push({ number: Number(match[1]), text: match[2].trim() });
      return;
    }
    if (entries.length && !/^#{1,6}\s+/.test(line)) {
      entries[entries.length - 1].text = `${entries[entries.length - 1].text} ${line}`.trim();
    }
  });
  return entries.filter((entry) => revisionReviewStatusFromText(entry.text) !== "unknown");
}

function revisionReviewMatchKey(text) {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "")
    .toLowerCase();
}

function findRevisionTaskForReviewEntry(entry, tasks) {
  if (entry.number && tasks[entry.number - 1]) return tasks[entry.number - 1];
  const entryKey = revisionReviewMatchKey(entry.text);
  if (!entryKey) return null;
  return tasks.find((task) => {
    const titleKey = revisionReviewMatchKey(task.title);
    if (titleKey && titleKey.length >= 6 && entryKey.includes(titleKey)) return true;
    const detailKey = revisionReviewMatchKey(compactLine(task.detail, 40));
    return detailKey && detailKey.length >= 10 && entryKey.includes(detailKey.slice(0, 18));
  }) || null;
}

function applyRevisionTaskReviewResult(text, options = {}) {
  const entries = revisionReviewEntriesFromText(text);
  const result = { entries: entries.length, done: 0, ignored: 0, kept: 0, unmatched: 0 };
  if (!entries.length) {
    if (!options.silent) setStatus("没有找到“未处理修改任务复查”结论");
    return result;
  }
  const tasks = todoRevisionTasks(Math.max(20, entries.length));
  const now = new Date().toISOString();
  entries.forEach((entry) => {
    const task = findRevisionTaskForReviewEntry(entry, tasks);
    if (!task) {
      result.unmatched += 1;
      return;
    }
    const reviewStatus = revisionReviewStatusFromText(entry.text);
    task.reviewStatus = reviewStatus;
    task.reviewNote = compactLine(entry.text, 260);
    task.reviewedAt = now;
    task.updatedAt = now;
    if (reviewStatus === "done") {
      task.status = "done";
      result.done += 1;
    } else if (reviewStatus === "ignored") {
      task.status = "ignored";
      result.ignored += 1;
    } else if (reviewStatus === "todo") {
      task.status = "todo";
      result.kept += 1;
    }
  });
  if (options.render !== false) renderRevisionTasks();
  if (options.persistChanges !== false) persist();
  if (!options.silent) {
    setStatus(`已应用复查结论：已解决 ${result.done} 条，不适用 ${result.ignored} 条，仍需处理 ${result.kept} 条，未匹配 ${result.unmatched} 条`);
  }
  return result;
}

function latestRevisionReviewSourceText() {
  syncFields();
  const candidates = [
    $("#revisionAiOutput")?.value,
    state.revisionAiOutput,
    $("#aiOutput")?.value,
    state.aiOutput,
    $("#qualityAuditResult")?.value,
    state.qualityAuditResult,
    state.releaseDraft
  ].filter(Boolean);
  return candidates.join("\n\n");
}

function applyRevisionTaskReviewFromLatestResult() {
  applyRevisionTaskReviewResult(latestRevisionReviewSourceText());
}

function renderRevisionDiagnosisUi() {
  const tasks = Array.isArray(state.revisionTasks) ? state.revisionTasks : [];
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const routeCounts = revisionRouteCounts(tasks);
  setText("quickRevisionTaskSummary", todoTasks.length ? `${todoTasks.length} 个待处理问题` : "暂无待办");
  setText("diagnosisTodoCount", String(todoTasks.length));
  setText("diagnosisBlockCount", String(todoTasks.filter((task) => task.severity === "block").length));
  setText("diagnosisOutlineCount", String(routeCounts.outline || 0));
  setText("diagnosisConfirmCount", String(routeCounts.confirm || 0));
}

function renderRevisionTasks() {
  const summary = $("#revisionTaskSummary");
  const list = $("#revisionTaskList");
  const tasks = Array.isArray(state.revisionTasks) ? state.revisionTasks : [];
  renderRevisionDiagnosisUi();
  if (!summary || !list) return;
  const validIds = new Set(tasks.map((task) => task.id));
  state.revisionSelectedTaskIds = (state.revisionSelectedTaskIds || []).filter((id) => validIds.has(id));
  const selectedIds = new Set(state.revisionSelectedTaskIds || []);
  const todo = tasks.filter((task) => task.status === "todo").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const ignored = tasks.filter((task) => task.status === "ignored").length;
  summary.textContent = tasks.length ? `待处理 ${todo} · 已处理 ${done} · 忽略 ${ignored}` : "暂无待办";
  if (!tasks.length) {
    list.textContent = "暂无修改任务。";
    renderRevisionAiPanel();
    return;
  }
  list.innerHTML = tasks.slice().reverse().map((task) => {
    const chapter = task.chapterNumber ? `第${task.chapterNumber}章 · ` : "";
    const checked = selectedIds.has(task.id) ? "checked" : "";
    const route = normalizeRevisionTaskRoute(task.targetRoute, task);
    const review = task.reviewNote
      ? `<small class="revision-task-review">复查：${escapeHtml(revisionReviewStatusLabel(task.reviewStatus))} · ${escapeHtml(compactLine(task.reviewNote, 90))}</small>`
      : "";
    return `
      <div class="revision-task-row" data-status="${escapeAttr(task.status)}" data-revision-id="${escapeAttr(task.id)}">
        <label class="revision-task-check" title="选择给 AI 处理">
          <input type="checkbox" data-revision-select="${escapeAttr(task.id)}" ${checked} />
        </label>
        <div class="revision-task-title">
          <strong>${escapeHtml(task.title)}</strong>
          <small>${escapeHtml(chapter + (task.sourceLabel || revisionSourceLabel(task.source)))} · ${escapeHtml(task.severity === "block" ? "高风险" : "提示")} · ${escapeHtml(revisionRouteLabel(route))}</small>
          ${review}
        </div>
        <select data-revision-route="${escapeAttr(task.id)}" aria-label="处理去向">
          ${revisionRouteOptions(route)}
        </select>
        <select data-revision-status="${escapeAttr(task.id)}" aria-label="修改任务状态">
          ${["todo", "done", "ignored"].map((status) => `<option value="${status}" ${task.status === status ? "selected" : ""}>${revisionStatusLabel(status)}</option>`).join("")}
        </select>
        <button type="button" data-revision-delete="${escapeAttr(task.id)}">删除</button>
      </div>`;
  }).join("");
  renderRevisionAiPanel();
}

function selectedRevisionTasks() {
  const selectedIds = new Set(state.revisionSelectedTaskIds || []);
  return (state.revisionTasks || []).filter((task) => selectedIds.has(task.id));
}

function revisionTasksForAi(limit = 5) {
  const selected = selectedRevisionTasks().filter((task) => task.status === "todo");
  if (selected.length) return selected.slice(0, limit);
  const chapter = currentChapterRecord();
  const todo = todoRevisionTasks(24);
  const chapterTasks = chapter
    ? todo.filter((task) => Number(task.chapterNumber || 0) === Number(chapter.number || 0))
    : [];
  return Array.from(new Map([...chapterTasks, ...todo].map((task) => [task.id, task])).values()).slice(0, limit);
}

function revisionAiSelectionText(tasks = revisionTasksForAi(5)) {
  if (!tasks.length) return "暂无可处理任务";
  const selectedCount = selectedRevisionTasks().filter((task) => task.status === "todo").length;
  const prefix = selectedCount ? `已选 ${selectedCount} 项` : `未勾选，默认取前 ${tasks.length} 项待处理任务`;
  return `${prefix} · 本次处理 ${tasks.length} 项`;
}

function renderRevisionAiPanel() {
  const panel = $("#revisionAiPanel");
  if (!panel) return;
  const output = $("#revisionAiOutput");
  if (output && output.value !== state.revisionAiOutput) output.value = state.revisionAiOutput || "";
  const tasks = revisionTasksForAi(5);
  setText("revisionAiSummary", revisionAiSelectionText(tasks));
  const hint = $("#revisionAiHint");
  if (hint) {
    hint.textContent = tasks.length
      ? "建议一次只处理 3-5 条，先生成修改方案，再决定是否让 AI 修正文。"
      : "暂无可处理任务。可先从质量门、长篇体检或发布检查转入任务。";
  }
  const canRun = tasks.length > 0;
  ["revisionAiClassifyBtn", "revisionAiPlanBtn", "revisionAiRewriteBtn", "revisionAiReviewBtn", "revisionAiOutlinePatchBtn", "revisionAiMemoryPatchBtn"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = !canRun;
  });
  const applyButton = $("#revisionAiApplyDraftBtn");
  if (applyButton) applyButton.disabled = !(state.revisionAiResultType === "rewrite" && String(state.revisionAiDraft || "").trim());
  const outlineButton = $("#revisionAiApplyOutlinePatchBtn");
  if (outlineButton) outlineButton.disabled = !(state.revisionAiResultType === "outlinePatch" && String(state.revisionAiOutput || "").trim());
  const memoryButton = $("#revisionAiApplyMemoryPatchBtn");
  if (memoryButton) memoryButton.disabled = !(state.revisionAiResultType === "memoryPatch" && String(state.revisionAiOutput || "").trim());
}

function updateRevisionTaskSelection(id, checked) {
  if (!id) return;
  const selected = new Set(state.revisionSelectedTaskIds || []);
  if (checked) selected.add(id);
  else selected.delete(id);
  state.revisionSelectedTaskIds = Array.from(selected);
  renderRevisionAiPanel();
  persist();
}

function setRevisionAiOutput(text, resultType = "") {
  state.revisionAiOutput = String(text || "");
  if (resultType !== "rewrite") state.revisionAiDraft = "";
  state.revisionAiResultType = resultType;
  const output = $("#revisionAiOutput");
  if (output) output.value = state.revisionAiOutput;
  renderRevisionAiPanel();
}

function revisionAiTaskBlock(tasks) {
  return tasks.map(revisionTaskLineForPrompt).join("\n");
}

function currentChapterRevisionContext() {
  const chapter = currentChapterRecord();
  const editorDraft = ($("#chapterEditorDraft")?.value || "").trim();
  const draft = editorDraft || String(chapter?.draft || "").trim();
  const notes = ($("#chapterEditorNotes")?.value || chapter?.notes || "").trim();
  return [
    `当前章节：${chapter ? chapterLabel(chapter) : "暂无当前章节"}`,
    `章节状态：${chapter?.status || "unknown"}`,
    notes ? `章节备注：\n${trimHeadTailForPrompt(notes, 1800, "章节备注")}` : "",
    draft ? `当前章节正文：\n${draft}` : "当前章节正文：暂无"
  ].filter(Boolean).join("\n\n");
}

function buildRevisionTaskClassifyPrompt(tasks = revisionTasksForAi(8)) {
  return `${builtinWritingFlowHeader("quality")}

你是连载小说修稿统筹。请只处理下面的修改任务，不要续写正文。

请输出以下板块：
## 任务分类
按“正文修复 / 大纲补充 / 记忆卡补充 / 方向避坑 / 作者确认 / 暂缓处理”分类。
## 本次建议优先级
从中挑出最适合本次处理的 3-5 条，并说明原因。
## 风险提醒
指出哪些任务如果不处理，会影响追读、人物一致性或设定稳定。
## 建议处理链路
用“任务 -> 去向 -> 下一步按钮”的格式说明应该点修正文、大纲补充、记忆卡补充还是复查。

作品信息：
${summarizeProject()}

待处理任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}`;
}

function buildRevisionTaskPlanPrompt(tasks = revisionTasksForAi(5)) {
  return `${builtinWritingFlowHeader("quality")}

你是资深小说编辑。请根据下面的待处理任务，给出可执行的修稿方案，不要直接重写正文。

必须输出：
## 修改方案
逐条对应任务，包含：
- 问题是什么
- 影响什么
- 建议改哪里
- 怎么改
- 改完怎么验证

约束：
1. 不改变原剧情走向、人物关系、叙事视角和章节结构。
2. 不新增重要情节，不删除关键信息。
3. 如果任务不适合当前章节处理，要标记“后续生成规避”。

${currentChapterRevisionContext()}

待处理任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}`;
}

function buildRevisionTaskOutlinePatchPrompt(tasks = revisionTasksForAi(5)) {
  const source = outlineCheckEvidenceContextForPrompt();
  return `${builtinWritingFlowHeader("outline")}

你是连载小说结构编辑。请根据选中的修改任务，生成“项目大纲补充建议”。不要续写正文，不要直接重写完整大纲。

使用规则：
1. 只处理适合沉淀到项目大纲的问题：核心卖点、世界观/背景、主要人物、人物关系、分卷/阶段主线、未回收伏笔、长期结局或回收方向。
2. 已写正文事实优先级高于旧大纲；旧大纲里的作者明确设定不要擅自覆盖。
3. 不确定内容必须标【待确认】；合理推断必须标【推断】；已写正文或作者已明确内容标【已确定】。
4. 本次只做大纲补丁，不输出未来章节建议、下一章建议、最大连载风险或续写记忆卡。
5. 如果某个任务其实应该修正文或记忆卡，请放进“非大纲任务去向”。

请严格输出：
## 大纲补充建议
### 1. 核心卖点
### 2. 世界观/背景
### 3. 主要人物
### 4. 人物关系
### 5. 分卷/阶段主线
### 6. 未回收伏笔
### 7. 长期结局或回收方向

## 本次依据
写明来自哪个任务、正文依据或 AI资料库依据。

## 与现有大纲冲突
没有就写“暂无明确冲突”。

## 需要作者确认
列出需要作者拍板的内容；没有就写“暂无”。

## 非大纲任务去向
列出不适合写进大纲的任务应该去哪里处理。

作品信息：
${summarizeProject()}

当前项目大纲：
${compactMarkdownSectionsForPrompt(state.projectOutline || "暂无项目大纲", OUTLINE_CHECK_OUTLINE_MAX_LENGTH, "项目大纲")}

AI资料库/正文依据：
${source || "暂无资料库依据"}

最近两个章节参考：
${recentTwoChaptersReference(1600) || "暂无最近章节"}

选中的修复任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}`;
}

function buildRevisionTaskMemoryPatchPrompt(tasks = revisionTasksForAi(5)) {
  return `${builtinWritingFlowHeader("analysis")}

你是连载小说记忆卡维护员。请根据选中的修改任务，生成“小说记忆卡补充建议”。不要续写正文，不要改项目大纲。

记忆卡只记录已经发生、已经确认、当前状态和需要后续避免的问题。禁止把未来建议写成已发生事实。

请严格输出：
## 记忆卡补充建议
### 已发生事实
### 人物当前状态
### 人物关系变化
### 未回收伏笔/债务
### 后续生成避坑
### 需要作者确认

要求：
1. 每条尽量写来源：修改任务/正文章节/AI资料库/推断。
2. 不确定的内容标【推断】或【待确认】。
3. 不要覆盖现有记忆卡，只输出可追加的补丁。

作品信息：
${summarizeProject()}

当前小说记忆卡：
${trimHeadTailForPrompt(state.quickAnalysis || "暂无小说记忆卡", 3600, "小说记忆卡")}

AI资料库/正文依据：
${outlineCheckEvidenceContextForPrompt() || "暂无资料库依据"}

最近两个章节参考：
${recentTwoChaptersReference(1600) || "暂无最近章节"}

选中的修复任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}`;
}

function buildRevisionTaskRewritePrompt(tasks = revisionTasksForAi(5)) {
  return `${builtinWritingFlowHeader("polish")}

你是一名资深小说编辑。请只根据下面选中的修改任务，对当前章节正文做定向修正。

必须保留：
原剧情主线、人物关系、章节结构、段落顺序、叙事视角、原故事节奏、原情绪走向、原有伏笔、原有信息释放顺序、人物性格和说话方式。

允许：
修正错别字、病句、标点、重复表达；优化句子节奏；适度增强画面感、动作、神态、心理和氛围；让对话更自然。

严格禁止：
禁止改变剧情走向。
禁止新增重要情节。
禁止删掉关键情节。
禁止改变人物人设和人物关系。
禁止新增原文没有的人物、设定或伏笔。
禁止过度华丽化。
禁止替我续写后续剧情。

输出要求：
只输出修正后的完整章节正文，不要解释，不要列清单，不要加“以下是修改版”等前言。

${currentChapterRevisionContext()}

本次必须解决的修改任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}`;
}

function buildRevisionTaskReviewPrompt(tasks = revisionTasksForAi(8), revisedText = "") {
  const targetText = String(revisedText || state.revisionAiDraft || $("#chapterEditorDraft")?.value || currentChapterRecord()?.draft || "").trim();
  return `${builtinWritingFlowHeader("quality")}

你是连载小说修稿复查员。请对照待处理任务，检查当前正文是否已经解决问题。

必须输出且只输出以下板块：
## 未处理修改任务复查
逐条按任务顺序判断：已解决 / 仍存在 / 部分解决 / 不适用。
每条必须写证据。证据不足时写“证据不足”，不要默认通过。

待处理任务：
${revisionAiTaskBlock(tasks) || "暂无任务"}

待复查正文：
${targetText || "暂无正文"}`;
}

function revisionAiFailMessage(label, error) {
  return `${label}失败：\n${error.message || String(error)}`;
}

async function classifyRevisionTasksWithAi() {
  const tasks = revisionTasksForAi(8);
  if (!tasks.length) {
    setStatus("暂无可分类的修改任务");
    return;
  }
  await persistBeforeAiTask("quality", { sync: false });
  setRevisionAiOutput("正在让 AI 分类修改任务...", "classify");
  setStatus("正在分类修改任务");
  try {
    const content = await callAi(buildRevisionTaskClassifyPrompt(tasks), { task: "quality", maxTokens: 2200 });
    setRevisionAiOutput(content, "classify");
    persist();
    setStatus("修改任务分类完成");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("AI分类任务", error), "classify");
    setStatus("AI分类任务失败");
  }
}

async function generateRevisionTaskPlan() {
  const tasks = revisionTasksForAi(5);
  if (!tasks.length) {
    setStatus("暂无可生成方案的修改任务");
    return;
  }
  await persistBeforeAiTask("quality", { sync: false });
  setRevisionAiOutput("正在生成修改方案...", "plan");
  setStatus("正在生成修改方案");
  try {
    const content = await callAi(buildRevisionTaskPlanPrompt(tasks), { task: "quality", maxTokens: 2600 });
    setRevisionAiOutput(content, "plan");
    persist();
    setStatus("修改方案已生成");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("生成修改方案", error), "plan");
    setStatus("生成修改方案失败");
  }
}

async function generateRevisionTaskOutlinePatch() {
  const tasks = revisionTasksForAi(5);
  if (!tasks.length) {
    setStatus("暂无可生成大纲补充的修改任务");
    return;
  }
  await persistBeforeAiTask("outline", { sync: false });
  setRevisionAiOutput("正在生成大纲补充建议...", "outlinePatch-running");
  setStatus("正在生成大纲补充建议");
  try {
    const content = await callAi(buildRevisionTaskOutlinePatchPrompt(tasks), { task: "outline", maxTokens: 3200 });
    setRevisionAiOutput(content, "outlinePatch");
    persist();
    setStatus("大纲补充建议已生成，可送入大纲整理结果后再确认应用");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("生成大纲补充", error), "outlinePatchError");
    setStatus("生成大纲补充失败");
  }
}

async function generateRevisionTaskMemoryPatch() {
  const tasks = revisionTasksForAi(5);
  if (!tasks.length) {
    setStatus("暂无可生成记忆卡补充的修改任务");
    return;
  }
  await persistBeforeAiTask("analysis", { sync: false });
  setRevisionAiOutput("正在生成记忆卡补充建议...", "memoryPatch-running");
  setStatus("正在生成记忆卡补充建议");
  try {
    const content = await callAi(buildRevisionTaskMemoryPatchPrompt(tasks), { task: "analysis", maxTokens: 2800 });
    setRevisionAiOutput(content, "memoryPatch");
    persist();
    setStatus("记忆卡补充建议已生成，可确认后追加到小说记忆卡");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("生成记忆卡补充", error), "memoryPatchError");
    setStatus("生成记忆卡补充失败");
  }
}

async function rewriteCurrentChapterForRevisionTasks() {
  const tasks = revisionTasksForAi(5);
  const draft = ($("#chapterEditorDraft")?.value || currentChapterRecord()?.draft || "").trim();
  if (!tasks.length) {
    setStatus("暂无可处理的修改任务");
    return;
  }
  if (!draft) {
    setStatus("当前章节没有正文，无法按任务修正");
    return;
  }
  await persistBeforeAiTask("polish", { sync: false });
  setRevisionAiOutput("正在按修改任务修正文，请稍等...", "rewrite-running");
  setStatus("正在按任务修正文");
  try {
    const content = await callAi(buildRevisionTaskRewritePrompt(tasks), {
      task: "polish",
      maxTokens: Math.max(polishMaxTokens(draft), 2600)
    });
    state.revisionAiDraft = content;
    setRevisionAiOutput(content, "rewrite");
    persist();
    setStatus("AI修正文已生成，请检查后再应用到当前章节");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("AI修正文", error), "rewrite");
    setStatus("AI修正文失败");
  }
}

async function reviewRevisionTasksWithAi() {
  const tasks = revisionTasksForAi(8);
  if (!tasks.length) {
    setStatus("暂无可复查的修改任务");
    return;
  }
  const reviewTarget = state.revisionAiResultType === "rewrite" ? state.revisionAiDraft : "";
  await persistBeforeAiTask("quality", { sync: false });
  setRevisionAiOutput("正在复查修改任务...", "review");
  setStatus("正在复查修改任务");
  try {
    const content = await callAi(buildRevisionTaskReviewPrompt(tasks, reviewTarget), { task: "quality", maxTokens: 2200 });
    setRevisionAiOutput(content, "review");
    persist();
    setStatus("修改任务复查完成；确认无误后可点“应用复查结论”");
  } catch (error) {
    setRevisionAiOutput(revisionAiFailMessage("AI复查任务", error), "review");
    setStatus("AI复查任务失败");
  }
}

function applyRevisionAiDraftToCurrentChapter() {
  const text = String($("#revisionAiOutput")?.value || state.revisionAiDraft || "").trim();
  const editor = $("#chapterEditorDraft");
  if (!text || !editor) {
    setStatus("暂无可应用的 AI 修正文");
    return;
  }
  if (chapterEditorAutosaveTimer) {
    clearTimeout(chapterEditorAutosaveTimer);
    chapterEditorAutosaveTimer = 0;
  }
  editor.value = text;
  updateChapterStats();
  markChapterEditorDirty();
  setStatus("AI修正文已放入当前章节编辑区，请确认后点击保存章节");
}

function applyRevisionOutlinePatchToResult() {
  const text = String($("#revisionAiOutput")?.value || state.revisionAiOutput || "").trim();
  if (!text) {
    setStatus("暂无可送入大纲整理结果的内容");
    return;
  }
  const prefix = "## AI诊断修复中心：大纲补充建议";
  state.outlineResult = `${prefix}\n\n${text}`;
  const output = $("#outlineResult");
  if (output) output.value = state.outlineResult;
  openMemoryDrawer("outline");
  persist();
  scheduleMemorySummaryUpdate();
  setStatus("已送入大纲整理结果；请在项目大纲抽屉里确认后再应用");
}

function applyRevisionMemoryPatchToAnalysis() {
  const text = String($("#revisionAiOutput")?.value || state.revisionAiOutput || "").trim();
  if (!text) {
    setStatus("暂无可追加到记忆卡的内容");
    return;
  }
  const patch = `\n\n## AI诊断修复中心补充\n${text}`.trim();
  state.quickAnalysis = [state.quickAnalysis, patch].filter(Boolean).join("\n\n");
  const output = $("#quickAnalysis");
  if (output) output.value = state.quickAnalysis;
  openMemoryDrawer("analysis");
  persist();
  scheduleMemorySummaryUpdate();
  updateWorkbenchFocus();
  setStatus("已追加到小说记忆卡；建议检查后再生成章节方向");
}

function addDraftQualityRevisionTasks() {
  addRevisionTasks(revisionTasksFromQualityGate(), "质量门待办");
}

function addQualityAuditRevisionTasks() {
  syncFields();
  addRevisionTasks(revisionTasksFromText(state.qualityAuditResult, "qualityAudit", "长篇体检"), "体检待办");
}

function addReleaseRevisionTasks() {
  syncFields();
  const sourceText = [state.aiOutput, state.releaseDraft].filter(Boolean).join("\n\n");
  addRevisionTasks(revisionTasksFromText(sourceText, "releaseCheck", "发布检查"), "发布检查待办");
}

function updateRevisionTaskStatus(id, status) {
  const task = (state.revisionTasks || []).find((item) => item.id === id);
  if (!task || !["todo", "done", "ignored"].includes(status)) return;
  task.status = status;
  task.updatedAt = new Date().toISOString();
  renderRevisionTasks();
  persist();
}

function updateRevisionTaskRoute(id, route) {
  const task = (state.revisionTasks || []).find((item) => item.id === id);
  if (!task || !Object.prototype.hasOwnProperty.call(revisionRouteLabels, route)) return;
  task.targetRoute = route;
  task.updatedAt = new Date().toISOString();
  renderRevisionTasks();
  persist();
}

function deleteRevisionTask(id) {
  const before = (state.revisionTasks || []).length;
  state.revisionTasks = (state.revisionTasks || []).filter((task) => task.id !== id);
  if (state.revisionTasks.length !== before) {
    renderRevisionTasks();
    persist();
    setStatus("已删除修改任务");
  }
}

function clearDoneRevisionTasks() {
  const before = (state.revisionTasks || []).length;
  state.revisionTasks = (state.revisionTasks || []).filter((task) => task.status === "todo");
  renderRevisionTasks();
  persist();
  setStatus(`已清理 ${before - state.revisionTasks.length} 条已处理/忽略任务`);
}

function useDraftQualityForPolish() {
  const text = draftQualityActionText();
  if (!text) return;
  const report = draftQualityReport(text);
  state.polishSource = text;
  state.polishReviewContext = draftQualityContextText(text);
  state.polishMode = report.level === "pass" ? "standard" : "intensive";
  const input = $("#polishSource");
  const mode = $("#polishMode");
  if (input) input.value = text;
  if (mode) mode.value = state.polishMode;
  renderPolishReviewContext();
  setAdvancedVisible(true);
  switchTab("polish");
  persist();
  setStatus(report.level === "pass" ? "已带入润色，并附带质量门结果" : "已带入精修润色，并附带质量门问题");
}

function useDraftQualityForRelease() {
  const text = draftQualityActionText();
  if (!text) return;
  state.releaseDraft = `${draftQualityContextText(text)}\n\n【待检查章节】\n${text}`;
  const input = $("#releaseDraft");
  if (input) input.value = state.releaseDraft;
  setAdvancedVisible(true);
  switchTab("release");
  updatePrompt("release");
  persist();
  setStatus("已送到发布检查，并附带保存前质量门结果");
}

function openQualityAuditFromDraftGate() {
  const text = draftQualityActionText();
  if (!text) return;
  setAdvancedVisible(true);
  switchTab("quality");
  updateQualityAuditUi();
  setStatus("已打开长篇体检；需要消耗 AI 时再点“开始体检”");
}

function draftRecoveryAdvice(message) {
  const text = String(message || "");
  const lower = text.toLowerCase();
  if (text.includes("输出被截断") || text.includes("最大输出")) {
    return {
      title: "输出被截断",
      advice: "模型已经写到输出上限。优先点“单章重试”，或到 AI 接口的高级参数里提高生成正文最大输出。"
    };
  }
  if (text.includes("上下文") || lower.includes("context window") || lower.includes("too large")) {
    return {
      title: "上下文过大",
      advice: "当前发送资料太重。优先点“省量重试”；如果仍失败，再改成单章生成。"
    };
  }
  if (lower.includes("stream disconnected") || lower.includes("reconnecting") || lower.includes("network")) {
    return {
      title: "连接中断",
      advice: "这是临时连接或长任务中断。可以直接重试；连续失败时建议先省量重试。"
    };
  }
  if (text.includes("没有返回正文内容") || text.includes("空输出")) {
    return {
      title: "没有拿到正文",
      advice: "Codex 没有返回可用正文。先查看日志确认原因，再用省量或单章方式重试。"
    };
  }
  return {
    title: "生成失败",
    advice: "先查看日志确认原因，再选择省量重试或单章重试。软件不会把失败内容保存进正文库。"
  };
}

function showDraftRecoveryPanel(message) {
  const panel = $("#draftRecoveryPanel");
  if (!panel) return;
  const info = draftRecoveryAdvice(message);
  setText("draftRecoveryTitle", info.title);
  setText("draftRecoveryAdvice", info.advice);
  panel.hidden = false;
}

function hideDraftRecoveryPanel() {
  const panel = $("#draftRecoveryPanel");
  if (panel) panel.hidden = true;
}

async function retryDraftWithEconomy() {
  syncFields();
  state.economyMode = true;
  const economy = $("#economyMode");
  if (economy) economy.checked = true;
  const recent = $("#recentContextChars");
  if (recent && Number(recent.value || 0) > 5000) {
    recent.value = "5000";
    state.recentContextChars = "5000";
  }
  setStatus("已切换省量设置，重新生成正文");
  await generateQuickDraft();
}

async function retryDraftSingleChapter() {
  syncFields();
  state.quickDraftScope = "one";
  const scope = $("#quickDraftScope");
  if (scope) scope.value = "one";
  updateProjectModeUi();
  setStatus("已切换为单章生成，重新生成正文");
  await generateQuickDraft();
}

async function viewLastCodexLog() {
  const output = $("#quickOutput");
  try {
    const data = await appFetch("/api/codex/last-error");
    if (!data.exists) {
      setStatus("暂无 Codex 错误日志");
      if (output) output.value += "\n\n暂无 Codex 错误日志。";
      return;
    }
    const header = `最近 Codex 错误日志：${data.path}\n更新时间：${data.updatedAt}\n大小：${data.size} bytes${data.truncated ? "，已显示末尾部分" : ""}`;
    if (output) output.value = `${header}\n\n${data.content || "日志为空"}`;
    state.quickOutput = output?.value || state.quickOutput;
    updateQuickOutputStats();
    setStatus("已显示最近 Codex 错误日志");
  } catch (error) {
    setStatus("读取 Codex 错误日志失败：" + error.message);
  }
}

function copyDraftErrorDetails() {
  const output = $("#quickOutput");
  const text = output?.value || state.quickOutput || "";
  if (!text.trim()) {
    setStatus("没有可复制的错误详情");
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => setStatus("错误详情已复制")).catch(() => fallbackCopy(output));
    return;
  }
  fallbackCopy(output);
  setStatus("错误详情已复制");
}

function setQuickDraftBusy(busy) {
  quickDraftBusy = Boolean(busy);
  ["quickGenerateBtn", "quickSaveOutputBtn", "quickSaveChapterBtn", "shortSaveStoryBtn"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = quickDraftBusy;
  });
  updateWorkbenchFocus();
  updateWorkflowSteps();
}

function projectModeSummaryLabel() {
  if (isShortStory()) return "短篇";
  return endingIsActive() ? endingStageText() : "连载";
}

function draftScopeSummaryLabel() {
  if (isShortStory()) return "完整短篇";
  return state.quickDraftScope === "one" ? "一次一章" : "一次两章";
}

function serviceSummaryLabel() {
  if (state.apiProvider === "codex") {
    const status = codexConnection.generationReady
      ? "真实可生成"
      : (codexConnection.lastProbeAt || codexConnection.failureTitle
        ? "真实生成失败"
        : (codexConnection.installed && codexConnection.versionOk ? "已安装未真实测试" : "未安装"));
    return `${providerDisplayName()} ${status}`;
  }
  const labels = {
    available: "可用",
    unavailable: "不可用",
    unknown: "待检测"
  };
  return `${providerDisplayName()} ${labels[apiAvailability.status] || labels.unknown}`;
}

function updateGenerationSettingsSummary() {
  const economy = state.economyMode ? "省量模式" : "标准上下文";
  const scope = draftScopeSummaryLabel();
  const words = isShortStory() ? `目标${state.targetWords || defaults.targetWords}字` : `${state.targetWords || defaults.targetWords}字/章`;
  const model = serviceSummaryLabel();
  const strategy = strategyDisplayName();
  const summary = `${economy} · ${scope} · ${words} · ${strategy} · ${model}`;
  setText("generationSettingsSummary", summary);
  setText("generationSummaryText", summary);
}

function setWorkflowStepState(id, status, label) {
  const button = document.getElementById(id);
  if (!button) return;
  button.dataset.status = status;
  button.dataset.stateLabel = label;
}

function updateWorkflowSteps(action = resolveWorkbenchAction()) {
  const short = isShortStory();
  const output = currentDraftOutputText();
  const outputReady = isDraftOutputReady(output);
  const outlineReady = hasContent(state.projectOutline);
  const outlineResultReady = hasContent(state.outlineResult);
  const analysisReady = hasContent(state.quickAnalysis) || short;
  const briefReady = hasContent(state.quickBrief);

  const outlineStatus = action.id === "outline" || action.id === "applyOutline"
    ? "current"
    : (outlineReady ? "done" : (outlineResultReady ? "warn" : "waiting"));
  setWorkflowStepState("generateOutlineBtn", outlineStatus, outlineReady ? "已完成" : (outlineResultReady ? "待确认" : "待处理"));

  const analysisStatus = short
    ? "hidden"
    : (action.id === "analysis" ? "current" : (state.quickAnalysis ? "done" : "waiting"));
  setWorkflowStepState("analyzeNovelBtn", analysisStatus, state.quickAnalysis ? "已完成" : "待分析");

  const briefStatus = action.id === "brief"
    ? "current"
    : (briefReady ? (briefLifecycleInfo().ready ? "done" : "warn") : "waiting");
  const briefLifecycle = briefLifecycleInfo();
  setWorkflowStepState("inferNextBtn", briefStatus, briefReady ? briefLifecycle.stateLabel : "可执行");

  const draftStatus = action.id === "draft" || action.id === "waiting"
    ? "current"
    : (outputReady ? "done" : (short ? (briefReady ? "ready" : "waiting") : (outlineReady && analysisReady && briefReady ? "ready" : "waiting")));
  setWorkflowStepState("quickGenerateBtn", draftStatus, outputReady ? "已生成" : (draftStatus === "ready" ? "可执行" : "等待前置"));

  const saveStatus = action.id === "save" || action.id === "review" || action.id === "polish"
    ? "current"
    : (outputReady ? "ready" : "waiting");
  setWorkflowStepState("quickSaveChapterBtn", saveStatus, outputReady ? (short ? "待检查" : "可入库") : "等待正文");
}

function openGenerationSettings() {
  const details = $(".generation-settings");
  if (details) details.open = true;
  details?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openKnowledgeDetails() {
  const settings = $(".generation-settings");
  const details = $("#knowledgeDetails");
  if (settings) settings.open = true;
  if (details) details.open = true;
  document.body.classList.add("knowledge-drawer-open");
}

function closeKnowledgeDetails() {
  const details = $("#knowledgeDetails");
  const settings = $(".generation-settings");
  if (details) details.open = false;
  if (settings) settings.open = false;
  document.body.classList.remove("knowledge-drawer-open");
}

function endingStageText(stage = state.endingStage) {
  const labels = {
    serial: "连载中",
    preparing: "准备完结",
    ending: "完结中",
    completed: "已完结"
  };
  return labels[stage] || labels.serial;
}

function endingIsActive() {
  return ["preparing", "ending", "completed"].includes(state.endingStage);
}

function endingRemainingText() {
  const value = Number(state.endingRemainingChapters || 0);
  if (!Number.isFinite(value) || value <= 0) return "未设置";
  return `还剩约 ${value} 章`;
}

function countNonEmptyLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function endingPayoffSummaryText() {
  const manual = countNonEmptyLines(state.endingMustPayoff);
  if (manual) return `${manual} 条待回收`;
  if (hasContent(state.endingPayoffResult)) return "AI 已整理";
  if (hasContent(state.endingLibraryScanResult)) return "正文库已扫描";
  return "未整理";
}

function endingPlannedChapters() {
  return sortedChapters().filter((chapter) => {
    if (chapterWordCount(chapter) > 0) return false;
    if (!["planned", "brief"].includes(String(chapter.status || "planned"))) return false;
    return String(chapter.notes || "").includes("【完结倒排计划】");
  });
}

function endingLibrarySummaryText() {
  const stats = chapterStats();
  if (!stats.drafted) return "暂无正文";
  return `已写 ${stats.drafted} 章`;
}

function endingPlanChapterSummaryText() {
  const count = endingPlannedChapters().length;
  return count ? `${count} 章` : "0 章";
}

function endingLibraryHintText() {
  const latest = lastDraftedChapter();
  if (!latest) return "正文库还没有有效正文。请先导入或保存章节，再扫描完结线索。";
  const plans = endingPlannedChapters().length;
  const scan = hasContent(state.endingLibraryScanResult) ? "已扫描正文库线索" : "尚未扫描正文库线索";
  return `${chapterLabel(latest)} 是当前续写起点；${scan}；已写入 ${plans} 个完结计划章节。`;
}

function endingContextBlock() {
  const hasEndingData = endingIsActive() ||
    hasContent(state.endingLibraryScanResult) ||
    hasContent(state.endingMustPayoff) ||
    hasContent(state.endingCharacterClosures) ||
    hasContent(state.endingAuthorDecisions) ||
    hasContent(state.endingDiagnosis) ||
    hasContent(state.endingPayoffResult) ||
    hasContent(state.endingReverseOutline);
  if (!hasEndingData) return "";
  return `完结规划约束：
作品阶段：${endingStageText()}
预计剩余章数：${endingRemainingText()}
结局类型：${state.endingType || "未设置"}
是否允许新增关键伏笔：${state.endingAllowNewHooks ? "允许，但必须克制并服务完结" : "不允许，优先回收已有伏笔"}
必须回收伏笔：
${state.endingMustPayoff || state.endingPayoffResult || "暂未整理"}
必须交代人物：
${state.endingCharacterClosures || "暂未整理"}
作者确认/最终决定：
${state.endingAuthorDecisions || "暂无"}
正文库扫描结果：
${state.endingLibraryScanResult || "暂无"}
完结诊断：
${state.endingDiagnosis || "暂无"}
倒排完结大纲：
${state.endingReverseOutline || "暂无"}`;
}

function updateEndingUi() {
  const active = endingIsActive();
  const stageText = endingStageText();
  const remainingText = endingRemainingText();
  setText("endingStageSummary", stageText);
  setText("endingRemainingSummary", remainingText);
  setText("endingPayoffSummary", endingPayoffSummaryText());
  setText("endingReverseSummary", hasContent(state.endingReverseOutline) ? "已生成" : "未生成");
  setText("endingLibrarySummary", endingLibrarySummaryText());
  setText("endingPlanChapterSummary", endingPlanChapterSummaryText());
  setText("endingLibraryHint", endingLibraryHintText());
  setText("endingProgressSummary", active
    ? `当前处于${stageText}，正文生成会优先收束主线、回收伏笔，并减少新坑。`
    : "尚未开启完结模式。开启后，正文生成会增加收尾约束。");
  setText("focusEndingState", active ? `${stageText} · ${remainingText}` : stageText);
  setText("focusEndingHint", active ? endingPayoffSummaryText() : "可开启完结规划");
  const endingCard = $(".ending-focus-card");
  if (endingCard) {
    endingCard.hidden = isShortStory();
    readinessClass(endingCard, active);
  }
}

function readinessClass(element, ready) {
  if (!element) return;
  element.classList.toggle("is-ready", Boolean(ready));
  element.classList.toggle("is-waiting", !ready);
}

function shortReviewStatusText() {
  const status = normalizeShortReviewStatus(state.shortReviewStatus || (state.shortReviewResult ? inferShortReviewStatus(state.shortReviewResult) : "pending"));
  const labels = {
    pending: "未检查",
    running: "检查中",
    save: "可保存",
    polish: "建议精修",
    rewrite: "结构需重改"
  };
  return labels[status] || labels.pending;
}

function resolveWorkbenchAction() {
  const short = isShortStory();
  const outline = hasContent(state.projectOutline);
  const outlineResult = hasContent(state.outlineResult);
  const analysis = hasContent(state.quickAnalysis);
  const brief = hasContent(state.quickBrief);
  const outputText = String($("#quickOutput")?.value || state.quickOutput || "").trim();
  const outputBusy = quickDraftBusy || /^(正在生成)/.test(outputText);
  const output = isDraftOutputReady(outputText);
  const review = hasContent($("#shortReviewResult")?.value || state.shortReviewResult);
  const reviewStatus = normalizeShortReviewStatus(state.shortReviewStatus || (review ? inferShortReviewStatus(state.shortReviewResult) : "pending"));

  if (outputBusy) {
    return { id: "waiting", label: "生成中", hint: "请等待结果", status: "正文正在生成，完成后会自动进入下一步。" };
  }

  if (short) {
    if (!outline && !outlineResult) {
      return { id: "outline", label: "整理设定", hint: "先确定短篇骨架", status: "先把故事设定整理成可执行骨架。" };
    }
    if (!brief) {
      return { id: "brief", label: "生成骨架", hint: "自动理解草稿", status: "让 AI 把设定和草稿整理成完整短篇路线。" };
    }
    if (!output) {
      return { id: "draft", label: "生成短篇", hint: "按骨架写完整故事", status: "根据短篇骨架直接生成一篇完整正文。" };
    }
    if (!review || reviewStatus === "pending") {
      return { id: "review", label: "检查短篇", hint: "判断能否保存", status: "先检查闭环、反转、结尾和节奏，再决定保存或精修。" };
    }
    if (reviewStatus === "running") {
      return { id: "waiting", label: "检查中", hint: "请等待结果", status: "短篇正在检查，完成后再决定保存或精修。" };
    }
    if (reviewStatus === "save") {
      return { id: "save", label: "保存短篇", hint: "放入作品库", status: "检查结果可保存，可以把短篇放入作品库。" };
    }
    if (reviewStatus === "rewrite") {
      return { id: "brief", label: "重做骨架", hint: "先修结构问题", status: "结构问题优先处理，建议回到骨架重新整理。" };
    }
    return { id: "polish", label: "送去精修", hint: "带检查意见润色", status: "结构基本成立，下一步适合进入精修润色。" };
  }

  if (!outline && outlineResult && state.outlineMode !== "check") {
    return { id: "applyOutline", label: "应用大纲", hint: "确认整理结果", status: "先把整理结果应用到项目大纲，再继续写正文。" };
  }
  if (!outline) {
    return { id: "outline", label: "整理大纲", hint: "先确定长期主线", status: "先整理项目大纲，避免正文跑偏。" };
  }
  if (!analysis) {
    return { id: "analysis", label: "分析记忆卡", hint: "找风险和下一步", status: "分析前文和正文库，让 AI 明确下一步该做什么。" };
  }
  const analysisLag = analysisLagInfo();
  if (analysisLag.due) {
    return {
      id: "analysis",
      label: "更新记忆卡",
      hint: `已落后 ${analysisLag.lag} 章`,
      status: `小说记忆卡已落后正文 ${analysisLag.lag} 章，超过4章缓冲，建议先重新分析。`
    };
  }
  if (!brief) {
    return { id: "brief", label: `推断${directionLabel()}`, hint: "确定承接路线", status: `先锁定${directionLabel()}，再生成正文。` };
  }
  if (briefIsOutdatedForNextChapter()) {
    const next = nextChapterNumber();
    return {
      id: "brief",
      label: `重推${directionLabel()}`,
      hint: `当前应写第${next}章`,
      status: `${directionLabel()}已不匹配当前正文库进度，建议先重新推断再生成正文。`
    };
  }
  if (!output) {
    const debt = revisionDebtMetrics();
    if (debt.total) {
      return {
        id: "draft",
        label: "生成正文",
        hint: `带${debt.total}项风险避坑`,
        status: `资料已准备，但还有${revisionDebtDisplay(debt).hint}。生成会带入这些待办，建议先复查后再保存。`
      };
    }
    return { id: "draft", label: "生成正文", hint: "按方向继续写", status: "资料已准备，可以直接生成新章节正文。" };
  }
  return { id: "save", label: "保存章节", hint: "自动放入正文库", status: "正文已生成，满意后保存到正文库。" };
}

function updateWorkbenchFocus() {
  const action = resolveWorkbenchAction();
  const short = isShortStory();
  const latest = lastDraftedChapter();
  const manual = String(state.quickSourceText || "").trim();
  const outlineReady = hasContent(state.projectOutline || state.outlineResult);
  const analysisReady = hasContent(state.quickAnalysis);
  const briefReady = hasContent(state.quickBrief);
  const sourceReady = short ? Boolean(manual || latest) : Boolean(latest);
  const debtDisplay = revisionDebtDisplay();
  const targetTitle = short
    ? (state.quickTitle || state.projectTitle || "新的短篇故事")
    : `第${nextChapterNumber()}章`;

  setText("workflowEyebrow", "当前写作任务");
  setText("workflowHeadline", short ? "写一篇完整短篇" : "续写下一段连载");
  setText("focusModeLabel", short ? "当前要写" : "当前要续写");
  setText("focusTitle", short ? targetTitle : `继续写${targetTitle}`);
  setText("focusSubtitle", action.status);
  setText("focusPrimaryLabel", action.label);
  setText("focusPrimaryHint", action.hint);
  setText("taskProjectValue", state.projectTitle || (short ? "未命名短篇" : "未命名作品"));
  setText("taskModeValue", projectModeSummaryLabel());
  setText("taskLatestValue", latest ? chapterLabel(latest) : (short ? "暂无短篇" : "暂无正文"));
  const memory = memoryCoverageLabel();
  const brief = briefRangeLabel();
  setText("taskMemoryValue", memory.value);
  setText("taskDirectionValue", brief.value);

  setText("focusOutlineLabel", short ? "故事设定" : "项目大纲");
  setText("focusOutlineState", outlineReady ? `${compactCount(state.projectOutline || state.outlineResult)} 字` : (short ? "待设定" : "待整理"));
  setText("focusOutlineHint", short ? "题材、冲突、结尾" : "主线、人物、伏笔");

  setText("focusAnalysisLabel", short ? "草稿理解" : "记忆卡");
  setText("focusAnalysisState", analysisReady ? "已准备" : (short ? "可自动理解" : "待分析"));
  setText("focusAnalysisHint", short ? "缺口和风险" : "下一步和风险");

  setText("focusBriefLabel", short ? "短篇骨架" : directionShortLabel());
  setText("focusBriefState", briefReady ? (short ? "已生成" : briefRangeLabel().value) : (short ? "待生成" : "待推断"));
  setText("focusBriefHint", short ? "开端到结尾" : (isLonglineStrategy() ? "前2章执行" : "承接路线"));

  setText("focusSourceLabel", short ? "短篇素材" : "续写起点");
  if (short) {
    setText("focusSourceState", manual ? `${manual.replace(/\s/g, "").length} 字草稿` : (latest ? "已保存短篇" : "无草稿"));
    setText("focusSourceHint", latest ? (latest.title || "作品库素材") : "可只用设定");
  } else {
    setText("focusSourceState", latest ? chapterLabel(latest) : "等待正文库");
    setText("focusSourceHint", latest ? "自动读取结尾" : "可先粘贴前文");
  }

  readinessClass($("[data-open-memory='outline']"), outlineReady);
  readinessClass($("[data-open-memory='analysis']"), analysisReady || (short && briefReady));
  readinessClass($("[data-open-memory='brief']"), briefReady);
  readinessClass($(".workbench-readiness-card.is-static"), sourceReady);
  setText("focusDebtState", debtDisplay.value);
  setText("focusDebtHint", debtDisplay.hint);
  const debtCard = $(".quality-debt-focus-card");
  if (debtCard) {
    debtCard.classList.toggle("is-ready", !debtDisplay.hasRisk);
    debtCard.classList.toggle("is-waiting", false);
    debtCard.classList.toggle("is-risk", debtDisplay.hasRisk);
  }
  updateWorkflowSteps(action);
  updateGenerationSettingsSummary();
  updateEndingUi();
}

function runWorkbenchPrimaryAction() {
  const action = resolveWorkbenchAction();
  const handlers = {
    outline: () => generateProjectOutline(),
    applyOutline: () => applyOutlineResult(),
    analysis: () => analyzeNovelSource(),
    brief: () => inferNextChapter(),
    draft: () => generateQuickDraft(),
    review: () => reviewShortStoryDraft(),
    polish: () => useShortStoryForIntensivePolish(),
    save: () => saveQuickDraftAsChapter(),
    waiting: () => setStatus("当前任务正在执行，请稍等")
  };
  try {
    const result = handlers[action.id]?.();
    if (result && typeof result.catch === "function") {
      result.catch((error) => setStatus(`${action.label}失败：${error.message}`));
    }
  } catch (error) {
    setStatus(`${action.label}失败：${error.message}`);
  }
}

function openDetails(selector) {
  const details = $(selector);
  if (details) details.open = true;
}

function builtinWritingFlowHeader(kind = "serial") {
  if (kind === "short") return "请按内置短篇故事写作流程处理我的项目。";
  if (kind === "ending") return "请按内置连载小说写作流程处理我的完结规划。";
  return "请按内置连载小说写作流程处理我的项目。";
}

function sanitizeLegacySkillReferences(value) {
  return String(value || "")
    .replace(/使用\s+\$novel-writing\s+处理我的连载小说完结规划。/g, builtinWritingFlowHeader("ending"))
    .replace(/使用\s+\$novel-writing\s+处理我的短篇故事项目。/g, builtinWritingFlowHeader("short"))
    .replace(/使用\s+\$novel-writing\s+处理我的连载小说项目。/g, builtinWritingFlowHeader("serial"))
    .replace(/未来\s*5\s*章建议/g, "旧版未来5章建议（仅作历史参考，按当前创作策略执行）")
    .replace(/未来五章建议/g, "旧版未来5章建议（仅作历史参考，按当前创作策略执行）")
    .replace(/\$novel-writing/g, "内置小说写作流程");
}

function isLegacySkillUnavailableText(value) {
  const text = String(value || "");
  return text.includes("novel-writing")
    && (text.includes("没有可用的") || text.includes("无法按该技能流程") || text.includes("技能流程生成正文"));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeState({});
    const saved = JSON.parse(raw);
    loadStateWarning = null;
    return normalizeState(saved);
  } catch (error) {
    loadStateWarning = error.message || String(error);
    return normalizeState({});
  }
}

function sanitizeModelProfile(profile, fallback, index) {
  const source = profile && typeof profile === "object" ? profile : {};
  const provider = source.provider || source.apiProvider || fallback.provider || "codex";
  const preset = providerPresets[provider] || providerPresets.codex;
  const id = String(source.id || fallback.id || `profile-${index + 1}`).replace(/[^\w-]/g, "-") || `profile-${index + 1}`;
  const sourceModel = String(source.model || source.apiModel || fallback.model || preset.model || "");
  const model = provider === "codex" && codexModelIsDefault(sourceModel)
    ? CODEX_RECOMMENDED_MODEL
    : sourceModel;
  return {
    id,
    name: String(source.name || fallback.name || `模型方案 ${index + 1}`),
    provider,
    endpoint: String(source.endpoint || source.apiEndpoint || fallback.endpoint || preset.endpoint || ""),
    model,
    apiKey: String(source.apiKey || ""),
    codexCommand: String(source.codexCommand || fallback.codexCommand || "auto"),
    codexProfile: String(source.codexProfile || fallback.codexProfile || ""),
    reasoningEffort: normalizeCodexReasoningEffort(source.reasoningEffort || source.codexReasoningEffort || fallback.reasoningEffort),
    systemPrompt: sanitizeLegacySkillReferences(source.systemPrompt || source.apiSystemPrompt || fallback.systemPrompt || ""),
    temperature: Number(source.temperature ?? source.apiTemperature ?? fallback.temperature ?? 0.7),
    maxTokens: Number(source.maxTokens ?? source.apiMaxTokens ?? fallback.maxTokens ?? 1600)
  };
}

function normalizeModelProfiles(savedProfiles, source) {
  const fallbackProfiles = createBaseModelProfiles(source);
  const rawProfiles = Array.isArray(savedProfiles) && savedProfiles.length ? savedProfiles : fallbackProfiles;
  const seen = new Set();
  const profiles = rawProfiles.map((profile, index) => {
    const fallback = fallbackProfiles[index] || fallbackProfiles[0];
    let normalized = sanitizeModelProfile(profile, fallback, index);
    while (seen.has(normalized.id)) normalized.id = `${normalized.id}-${index + 1}`;
    seen.add(normalized.id);
    return normalized;
  });
  if (!profiles.some((profile) => profile.id === "default")) {
    profiles.unshift(createModelProfile("default", "默认模型", source));
  }
  ["analysis", "deep", "draft", "polish"].forEach((id) => {
    if (!profiles.some((profile) => profile.id === id)) {
      const fallback = fallbackProfiles.find((profile) => profile.id === id) || createModelProfile(id, id, source);
      profiles.push(fallback);
    }
  });
  return profiles;
}

function normalizeModelBindings(savedBindings, profiles) {
  const ids = new Set(profiles.map((profile) => profile.id));
  const bindings = { ...defaultModelBindings, ...(savedBindings || {}) };
  Object.keys(bindings).forEach((task) => {
    if (!ids.has(bindings[task])) bindings[task] = ids.has(defaultModelBindings[task]) ? defaultModelBindings[task] : "default";
  });
  return bindings;
}

function normalizeRevisionTask(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const title = compactLine(item.title || item.detail || "", 120);
  const detail = String(item.detail || item.title || "").trim();
  if (!title && !detail) return null;
  const status = ["todo", "done", "ignored"].includes(item.status) ? item.status : "todo";
  const normalized = {
    id: String(item.id || `revision-${Date.now()}-${index}`).replace(/[^\w-]/g, "-"),
    status,
    source: String(item.source || "manual"),
    sourceLabel: String(item.sourceLabel || "手动任务"),
    severity: String(item.severity || "warn"),
    chapterNumber: Number(item.chapterNumber || 0),
    title,
    detail,
    reviewStatus: ["done", "ignored", "todo", "unknown"].includes(item.reviewStatus) ? item.reviewStatus : "",
    reviewNote: compactLine(String(item.reviewNote || ""), 260),
    reviewedAt: String(item.reviewedAt || ""),
    createdAt: String(item.createdAt || new Date().toISOString()),
    updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString())
  };
  normalized.targetRoute = normalizeRevisionTaskRoute(item.targetRoute, normalized);
  return normalized;
}

function applyProfileToState(profile, target = state) {
  if (!profile) return;
  target.apiProvider = profile.provider || "codex";
  target.apiEndpoint = profile.endpoint || providerPresets[target.apiProvider]?.endpoint || "";
  const sourceModel = profile.model || providerPresets[target.apiProvider]?.model || "";
  target.apiModel = target.apiProvider === "codex" && codexModelIsDefault(sourceModel)
    ? CODEX_RECOMMENDED_MODEL
    : sourceModel;
  target.apiKey = profile.apiKey || "";
  target.codexCommand = profile.codexCommand || "auto";
  target.codexProfile = profile.codexProfile || "";
  target.codexReasoningEffort = normalizeCodexReasoningEffort(profile.reasoningEffort || target.codexReasoningEffort);
  if (profile.systemPrompt) target.apiSystemPrompt = profile.systemPrompt;
  target.apiTemperature = Number(profile.temperature ?? target.apiTemperature ?? defaults.apiTemperature);
  target.apiMaxTokens = Number(profile.maxTokens ?? target.apiMaxTokens ?? defaults.apiMaxTokens);
}

function normalizeState(saved) {
  const normalized = { ...structuredClone(defaults), ...saved };
  if (!["serial", "short"].includes(normalized.projectMode)) normalized.projectMode = defaults.projectMode;
  if (!["standard", "longline"].includes(normalized.creativeStrategy)) normalized.creativeStrategy = defaults.creativeStrategy;
  normalized.codexReasoningEffort = normalizeCodexReasoningEffort(normalized.codexReasoningEffort);
  if (normalized.codexPresetId !== "custom" && !codexPresetOptions.some((item) => item.id === normalized.codexPresetId)) normalized.codexPresetId = defaults.codexPresetId;
  if (!["serial", "preparing", "ending", "completed"].includes(normalized.endingStage)) normalized.endingStage = defaults.endingStage;
  if (!["libraryScan", "diagnosis", "payoffs", "reverse", "readiness"].includes(normalized.endingTaskMode)) normalized.endingTaskMode = defaults.endingTaskMode;
  normalized.pipeline = Array.isArray(saved.pipeline) && saved.pipeline.length ? saved.pipeline : structuredClone(defaults.pipeline);
  normalized.ledger = Array.isArray(saved.ledger) && saved.ledger.length ? saved.ledger : structuredClone(defaults.ledger);
  normalized.chapters = Array.isArray(saved.chapters) && saved.chapters.length ? saved.chapters : structuredClone(defaults.chapters);
  normalized.outlineConfirmations = Array.isArray(saved.outlineConfirmations)
    ? saved.outlineConfirmations.map((item, index) => normalizeOutlineConfirmation(item, index)).filter(Boolean)
    : [];
  normalized.outlineConfirmationParseError = String(normalized.outlineConfirmationParseError || "");
  normalized.outlineEvidenceCards = String(normalized.outlineEvidenceCards || "");
  normalized.outlineEvidencePendingCards = String(normalized.outlineEvidencePendingCards || "");
  normalized.outlineEvidencePendingFromChapter = Number(normalized.outlineEvidencePendingFromChapter || 0);
  normalized.outlineEvidencePendingToChapter = Number(normalized.outlineEvidencePendingToChapter || 0);
  normalized.outlineEvidencePendingUpdatedAt = String(normalized.outlineEvidencePendingUpdatedAt || "");
  normalized.outlineEvidenceUpdatedToChapter = Number(normalized.outlineEvidenceUpdatedToChapter || 0);
  normalized.outlineEvidenceUpdatedAt = String(normalized.outlineEvidenceUpdatedAt || "");
  normalized.outlineEvidenceChapterHashes = normalized.outlineEvidenceChapterHashes && typeof normalized.outlineEvidenceChapterHashes === "object" && !Array.isArray(normalized.outlineEvidenceChapterHashes)
    ? Object.fromEntries(Object.entries(normalized.outlineEvidenceChapterHashes).map(([key, value]) => [String(key), String(value || "")]).filter(([, value]) => value))
    : {};
  normalized.outlineEvidenceDirtyChapterIds = Array.isArray(normalized.outlineEvidenceDirtyChapterIds)
    ? Array.from(new Set(normalized.outlineEvidenceDirtyChapterIds.map((value) => String(value || "").trim()).filter(Boolean)))
    : [];
  normalized.outlineEvidenceArcSummaries = String(normalized.outlineEvidenceArcSummaries || "");
  normalized.outlineEvidenceGlobalSummary = String(normalized.outlineEvidenceGlobalSummary || "");
  normalized.outlineEvidenceCharacterIndex = String(normalized.outlineEvidenceCharacterIndex || "");
  normalized.outlineEvidenceForeshadowIndex = String(normalized.outlineEvidenceForeshadowIndex || "");
  normalized.outlineEvidenceCompressedAt = String(normalized.outlineEvidenceCompressedAt || "");
  normalized.outlineEvidenceCompressedToChapter = Number(normalized.outlineEvidenceCompressedToChapter || 0);
  normalized.aiKnowledgeOutput = String(normalized.aiKnowledgeOutput || "");
  normalized.aiKnowledgeUpdatedAt = String(normalized.aiKnowledgeUpdatedAt || "");
  normalized.quickOutputSavedHash = String(normalized.quickOutputSavedHash || "");
  normalized.qualityAuditResult = String(normalized.qualityAuditResult || "");
  normalized.qualityAuditUpdatedAt = String(normalized.qualityAuditUpdatedAt || "");
  normalized.revisionTasks = Array.isArray(saved.revisionTasks)
    ? saved.revisionTasks.map((item, index) => normalizeRevisionTask(item, index)).filter(Boolean).slice(-120)
    : [];
  const revisionTaskIds = new Set(normalized.revisionTasks.map((task) => task.id));
  normalized.revisionSelectedTaskIds = Array.isArray(saved.revisionSelectedTaskIds)
    ? Array.from(new Set(saved.revisionSelectedTaskIds.map((id) => String(id || "")).filter((id) => revisionTaskIds.has(id))))
    : [];
  normalized.revisionAiOutput = String(normalized.revisionAiOutput || "");
  normalized.revisionAiDraft = String(normalized.revisionAiDraft || "");
  normalized.revisionAiResultType = String(normalized.revisionAiResultType || "");
  normalized.lastQualityAuditWords = Number(normalized.lastQualityAuditWords || 0);
  normalized.lastStructuralAuditWords = Number(normalized.lastStructuralAuditWords || 0);
  normalized.lastStructuralRefreshWords = Number(normalized.lastStructuralRefreshWords || 0);
  if (!normalized.chapters.some((chapter) => chapter.id === normalized.activeChapterId)) {
    normalized.activeChapterId = normalized.chapters[0]?.id || "chapter-1";
  }
  normalized.checklist = { ...structuredClone(defaults.checklist), ...(saved.checklist || {}) };
  if (!themeIds.has(normalized.theme)) normalized.theme = defaults.theme;
  ["quickAnalysisChapter", "quickBriefStartChapter", "quickBriefEndChapter", "quickBriefAnchorChapter"].forEach((key) => {
    normalized[key] = Number(normalized[key] || 0);
  });
  normalized.advancedVisible = Boolean(saved.advancedVisible);
  normalized.simpleMode = Boolean(saved.simpleMode);
  normalized.endingAllowNewHooks = Boolean(saved.endingAllowNewHooks);
  normalized.quickMode = "draft";
  normalized.saveApiKey = Boolean(saved.saveApiKey);
  normalized.modelProfiles = normalizeModelProfiles(saved.modelProfiles, normalized);
  if (!normalized.modelProfiles.some((profile) => profile.id === normalized.activeModelProfileId)) {
    normalized.activeModelProfileId = "default";
  }
  normalized.moduleModelBindings = normalizeModelBindings(saved.moduleModelBindings, normalized.modelProfiles);
  if (!Object.prototype.hasOwnProperty.call(modelStrategyLabels, normalized.modelStrategy)) {
    normalized.modelStrategy = "balanced";
  }
  if (!normalized.saveApiKey) normalized.apiKey = "";
  if (!normalized.saveApiKey) normalized.modelProfiles.forEach((profile) => {
    profile.apiKey = "";
  });
  applyProfileToState(normalized.modelProfiles.find((profile) => profile.id === normalized.activeModelProfileId), normalized);
  normalized.apiSystemPrompt = sanitizeLegacySkillReferences(normalized.apiSystemPrompt);
  normalized.promptOutput = sanitizeLegacySkillReferences(normalized.promptOutput);
  if (isLegacySkillUnavailableText(normalized.quickOutput)) normalized.quickOutput = "";
  if (isLegacySkillUnavailableText(normalized.aiOutput)) normalized.aiOutput = "";
  return normalized;
}

function persist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = 0;
  }
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(), null, 2));
    setStatus("已保存 " + new Date().toLocaleTimeString());
  } catch (error) {
    console.error("保存到浏览器本地失败", error);
    setStatus("浏览器本地保存失败：请先点“保存到项目库”或“导出”备份。");
  }
}

function schedulePersist(delay = PERSIST_DELAY_MS) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = 0;
    persist();
  }, delay);
}

function persistableState() {
  const copy = structuredClone(state);
  delete copy._projectRecovery;
  if (!copy.saveApiKey) {
    copy.apiKey = "";
    copy.modelProfiles = (copy.modelProfiles || []).map((profile) => ({ ...profile, apiKey: "" }));
  }
  return copy;
}

function showLoadStateWarning() {
  if (!loadStateWarning) return;
  const message = `浏览器缓存读取失败：已临时打开空白项目。请先从项目库打开项目或导入备份，确认无误前不要保存覆盖。原因：${loadStateWarning}`;
  setStatus(message);
  const target = $("#saveState");
  if (target) target.textContent = message;
}

function hydrate() {
  applyTheme(state.theme);
  applySimpleMode();
  updateProjectModeUi();
  setAdvancedVisible(state.advancedVisible);
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === "quickSourceText") {
      hydrateQuickSourceText(el);
      return;
    }
    if (el.type === "checkbox") {
      el.checked = Boolean(state[id]);
    } else {
      el.value = state[id] ?? "";
    }
  });
  renderThemeCards();
  renderModelControls();
  renderUsageStats();
  renderUsageImportPreview();
  renderAiTaskStatus();
  applyQuickDisclosureDefaults();
  renderOutlineConfirmations();
  updateOutlineEvidenceUi();
  updateMemorySummaryCards();
  renderPipeline();
  renderLedger();
  renderChecklist();
  renderRevisionTasks();
  updateQualityAuditUi();
  renderChapterLibrary();
  switchTab(activePanelId());
  updateQuickOutputStats();
  renderShortReviewStatus();
  renderPolishReviewContext();
  updateEndingUi();
  updateQuickSourceSummary();
  deferUsageEstimate();
  refreshAppStatus();
  refreshProjectLibrary()
    .then((projects) => maybeAutoLoadSingleProject(projects))
    .catch(() => {});
  setTimeout(refreshServerAiTasks, 500);
  setTimeout(refreshDiagnostics, 800);
  setTimeout(showLoadStateWarning, 100);
}

function applyQuickDisclosureDefaults() {
  const hasOutlineReview = Boolean(
    (state.outlineCheckResult || "").trim() ||
    (state.outlineAuthorNotes || "").trim() ||
    (state.outlineConfirmations || []).length
  );
  const hasPolish = Boolean((state.polishSource || "").trim() || (state.polishOutput || "").trim());
  const hasOptional = Boolean(
    (state.quickTitle || "").trim() ||
    (state.quickMustHave || "").trim()
  );
  const generation = $(".generation-settings");
  const polish = $(".polish-accordion");
  const optional = $(".optional-fields");
  if (generation) generation.open = hasOptional;
  if (polish) polish.open = hasPolish;
  if (optional) optional.open = hasOptional;
}

async function appFetch(path, options = {}) {
  if (location.protocol === "file:") {
    throw new Error("请通过 http://127.0.0.1:8787/ 打开 app。");
  }
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data;
}

function aiFetchTimeoutMs(task, maxTokens) {
  const taskTimeouts = {
    quick: 16 * 60 * 1000,
    outline: 14 * 60 * 1000,
    analysis: 12 * 60 * 1000,
    planning: 12 * 60 * 1000,
    polish: 12 * 60 * 1000,
    quality: 12 * 60 * 1000,
    ending: 14 * 60 * 1000,
    manuscript: 12 * 60 * 1000,
    release: 8 * 60 * 1000,
    feedback: 8 * 60 * 1000,
    recovery: 10 * 60 * 1000,
    shortReview: 10 * 60 * 1000,
    test: 90 * 1000,
    api: 10 * 60 * 1000
  };
  const base = taskTimeouts[task] || taskTimeouts.api;
  return Number(maxTokens || 0) >= 6500 ? Math.max(base, 16 * 60 * 1000) : base;
}

async function fetchJsonWithTimeout(path, options = {}, timeoutMs = 600000, label = "请求") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `${label}失败`);
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${label}等待超过 ${Math.round(timeoutMs / 1000)} 秒，网页已停止等待。Codex 可能还在后台收尾；如果再次卡住，请先刷新页面后重试。`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function renderVersionNotice(status = {}) {
  const title = $("#versionNoticeTitle");
  const list = $("#versionNoticeList");
  const meta = $("#versionNoticeMeta");
  const version = status.version || "未知版本";
  if (title) title.textContent = `v${version}`;
  if (list) {
    list.innerHTML = UPDATE_NOTICE_ITEMS.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }
  if (meta) {
    meta.textContent = `安装包：dist\\novel-writer-installer-${version}.zip。发到其他电脑后解压，双击“一键解包安装.cmd”。`;
  }
}

async function refreshAppStatus() {
  const target = $("#appStatus");
  if (!target) return;
  try {
    const status = await appFetch("/api/app/status");
    mergeCodexConnection(status.codex || {});
    const codexLabel = codexConnection.generationReady
      ? "真实可生成"
      : (codexConnection.lastProbeAt || codexConnection.failureTitle
        ? "真实失败"
        : (codexConnection.installed && codexConnection.versionOk ? "已安装未测试" : "未找到"));
    target.textContent = `App ${status.version} · 项目 ${status.projectCount} · Codex ${codexLabel}`;
    renderVersionNotice(status);
    if (state.apiProvider === "codex") {
      setApiAvailability(
        codexConnection.generationReady ? "available" : ((codexConnection.lastProbeAt || codexConnection.failureTitle) ? "unavailable" : "unknown"),
        codexConnection.generationReady
          ? `Codex 真实连通测试已通过：${codexConnection.actualModel || codexConnection.lastProbeModel || "模型已确认"}。`
          : ((codexConnection.lastProbeAt || codexConnection.failureTitle)
            ? (codexConnection.failureAdvice || codexConnection.failureTitle || "Codex 真实连通失败，请调整模型方案后重测。")
            : "Codex 已安装不等于可生成，请点击“真实连通测试”。")
      );
    }
  } catch {
    target.textContent = "App 状态：需要通过本地服务打开";
    renderVersionNotice();
    if (state.apiProvider === "codex") setApiAvailability("unavailable", "需要通过本地服务打开网页端。");
  }
}

function setDiagnosticCard(statusId, hintId, status, text, hint) {
  const statusEl = document.getElementById(statusId);
  const hintEl = document.getElementById(hintId);
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.dataset.status = status;
  }
  if (hintEl) hintEl.textContent = hint;
}

function formatDiagnostics(data) {
  const app = data.app || {};
  const server = data.server || {};
  const python = data.python || {};
  const codex = data.codex || {};
  const projects = data.projects || {};
  const launcher = data.launcher || {};
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
  return [
    "小说控制台诊断信息",
    `时间：${new Date().toLocaleString()}`,
    "",
    `版本：${app.version || "未知"}`,
    `网页地址：${server.url || app.url || "未知"}`,
    `端口：${server.port || app.port || "未知"}`,
    `服务进程：${server.pid || app.pid || "未知"}`,
    `启动时间：${server.startedAt || "未知"}`,
    `安装目录：${server.root || app.root || "未知"}`,
    "",
    `Python：${python.available ? "可用" : "不可用"} ${python.version || ""}`,
    `Python 路径：${python.executable || "未知"}`,
    "",
    `Codex 安装：${codex.installed ? "已安装" : "未找到"}`,
    `Codex 版本检测：${codex.versionOk ? "正常" : "异常"}`,
    `Codex 真实连通：${codex.generationReady ? "可生成" : (codex.lastProbeAt ? "失败" : "未测试")}`,
    `Codex 路径：${codex.path || "未找到"}`,
    `Codex 版本/错误：${codex.version || codex.error || "无"}`,
    `最近测试模型：${codex.lastProbeModel || "无"}`,
    `Codex 实际模型：${codex.actualModel || "未知"}`,
    `Codex 失败类型：${codex.failureType || "无"}`,
    `Codex 失败标题：${codex.failureTitle || "无"}`,
    `Codex 处理建议：${codex.failureAdvice || "无"}`,
    `Codex 最近日志：${codex.lastProbeLogPath || "无"}`,
    `最近测试时间：${codex.lastProbeAt || "无"}`,
    `最近测试错误：${codex.lastProbeError || "无"}`,
    "",
    `项目库：${projects.writable ? "可写" : "不可写"}`,
    `项目库路径：${projects.dir || app.projectsDir || "未知"}`,
    `项目数量：${projects.count ?? app.projectCount ?? "未知"}`,
    "",
    `启动器：${launcher.exeExists ? "已生成" : "未生成"}`,
    `启动器路径：${launcher.exe || "未知"}`,
    `桌面入口：${launcher.desktopShortcutExists ? "已放到桌面" : "未检测到"}`,
    "",
    "建议：",
    ...recommendations.map((item, index) => `${index + 1}. ${item}`)
  ].join("\n");
}

async function refreshDiagnostics() {
  const output = $("#diagnosticOutput");
  if (output) output.value = "正在检查系统状态...";
  try {
    const data = await appFetch("/api/system/diagnostics");
    const app = data.app || {};
    const server = data.server || {};
    const codex = data.codex || {};
    const python = data.python || {};
    const projects = data.projects || {};
    mergeCodexConnection(codex);
    setDiagnosticCard(
      "diagWebStatus",
      "diagWebHint",
      "ok",
      `正常 · ${app.version || "未知版本"}`,
      `端口 ${server.port || app.port || 8787}，进程 ${server.pid || app.pid || "未知"}`
    );
    setDiagnosticCard(
      "diagCodexStatus",
      "diagCodexHint",
      codex.generationReady ? "ok" : (codex.installed ? "warn" : "warn"),
      codex.generationReady
        ? "真实可生成"
        : ((codex.lastProbeAt || codex.failureTitle) ? "真实失败" : (codex.installed ? "已安装未确认" : "未找到")),
      codex.generationReady
        ? `${codex.actualModel || codex.lastProbeModel || codex.version || "Codex"} · ${codex.lastProbeAt || ""}`
        : (codex.failureAdvice || codex.failureTitle || codex.lastProbeError || codex.error || codex.version || "请做真实连通测试")
    );
    setDiagnosticCard(
      "diagPythonStatus",
      "diagPythonHint",
      python.available ? "ok" : "warn",
      python.available ? `可用 · ${python.version || ""}` : "不可用",
      python.executable || "未检测到 Python 路径"
    );
    setDiagnosticCard(
      "diagProjectStatus",
      "diagProjectHint",
      projects.writable ? "ok" : "warn",
      projects.writable ? "可读写" : "不可写",
      `${projects.count ?? 0} 个项目 · ${projects.dir || ""}`
    );
    if (output) output.value = formatDiagnostics(data);
  } catch (error) {
    setDiagnosticCard("diagWebStatus", "diagWebHint", "warn", "异常", error.message);
    if (output) output.value = `系统诊断失败：${error.message}`;
  }
}

function copyDiagnostics() {
  const output = $("#diagnosticOutput");
  if (!output) return;
  if (!output.value.trim()) {
    refreshDiagnostics();
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(output.value).then(() => setStatus("诊断信息已复制")).catch(() => fallbackCopy(output));
    return;
  }
  fallbackCopy(output);
}

function selectedProjectLibraryTitle() {
  const select = $("#projectLibrary");
  if (!select?.value) return "";
  const selected = select?.selectedOptions?.[0];
  return (selected?.textContent || select?.value || "").replace(/\s+·.*$/, "").trim();
}

function currentProjectIsBlankForAutoLoad() {
  const stats = chapterStats();
  return !String(state.projectTitle || "").trim()
    && !String(state.projectOutline || "").trim()
    && !stats.drafted
    && !hasUnsavedGeneratedOutput()
    && !chapterEditorHasUnsavedChanges()
    && !quickDraftBusy
    && !activeAiCall
    && !loadStateWarning;
}

function showOpenProjectBeforeEvidenceMessage(projectTitle = "") {
  const title = projectTitle || selectedProjectLibraryTitle() || "项目库里的作品";
  const message = `当前还没有打开“${title}”。请先点左侧“打开选中项目”，再更新 AI资料库。`;
  setStatus(message);
  const output = $("#outlineResult");
  if (output) {
    output.value = [
      message,
      "",
      "检测到项目库中有作品，但当前控制台正文库为 0 章。",
      "为了避免空项目覆盖旧数据，本次没有执行更新。"
    ].join("\n");
  }
}

async function maybeAutoLoadSingleProject(projects = []) {
  if (autoProjectLoadAttempted || location.protocol === "file:") return false;
  if (!Array.isArray(projects) || projects.length !== 1) return false;
  autoProjectLoadAttempted = true;
  if (!currentProjectIsBlankForAutoLoad()) return false;
  const select = $("#projectLibrary");
  if (!select) return false;
  select.value = projects[0].id;
  await loadSelectedProject({ skipConfirm: true, source: "auto" });
  return true;
}

async function refreshProjectLibrary() {
  const select = $("#projectLibrary");
  if (!select || location.protocol === "file:") return [];
  try {
    const data = await appFetch("/api/projects");
    const previousValue = select.value;
    select.innerHTML = "";
    if (!data.projects.length) {
      select.innerHTML = '<option value="">暂无项目</option>';
      return data.projects;
    }
    data.projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      const suffix = project.status === "damaged"
        ? " · 文件损坏"
        : (project.recoveredFromBackup ? " · 已从备份恢复" : "");
      option.textContent = `${project.title}${suffix}`;
      option.title = project.loadError || project.backupPath || "";
      if (project.status === "damaged") option.disabled = !project.backupAvailable;
      select.appendChild(option);
    });
    if (previousValue && Array.from(select.options).some((option) => option.value === previousValue)) {
      select.value = previousValue;
    }
    return data.projects;
  } catch {
    select.innerHTML = '<option value="">项目库不可用</option>';
    return [];
  }
}

async function saveProjectToLibrary() {
  syncFields();
  flushCurrentChapterEditor();
  state.projectId = state.projectId || sanitizeFileName(state.projectTitle || "untitled");
  state.updatedAt = new Date().toISOString();
  const result = await appFetch("/api/projects/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(persistableState())
  });
  $("#saveState").textContent = result.biblePath
    ? `已保存到项目库：${result.id}，项目圣经已刷新`
    : (result.bibleError ? `已保存到项目库：${result.id}，项目圣经刷新失败：${result.bibleError}` : `已保存到项目库：${result.id}`);
  await refreshProjectLibrary();
  await refreshAppStatus();
}

async function refreshProjectBible() {
  syncFields();
  flushCurrentChapterEditor();
  updateProjectBiblePreview();
  state.projectId = state.projectId || sanitizeFileName(state.projectTitle || "untitled");
  state.updatedAt = new Date().toISOString();
  const result = await appFetch("/api/projects/bible", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(persistableState())
  });
  const target = $("#saveState");
  if (target) target.textContent = `项目圣经已刷新：${result.id}`;
  updateProjectBiblePreview();
  setStatus("项目圣经已刷新，文件已写入项目库目录");
}

async function persistBeforeAiTask(task = "ai", options = {}) {
  if (options.sync !== false) syncFieldsForAiSnapshot();
  flushCurrentChapterEditor();
  state.projectId = state.projectId || sanitizeFileName(state.projectTitle || "untitled");
  state.updatedAt = new Date().toISOString();
  state.lastPreAiSaveAt = state.updatedAt;
  state.lastPreAiSaveTask = String(task || "ai");
  state.lastPreAiSaveStatus = "browser";
  state.lastPreAiSaveError = "";
  persist();
  if (location.protocol === "file:" || options.projectLibrary === false) {
    return { ok: true, target: "browser" };
  }
  try {
    await appFetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persistableState())
    });
    state.lastPreAiSaveStatus = "project-library";
    persist();
    return { ok: true, target: "project-library" };
  } catch (error) {
    state.lastPreAiSaveStatus = "browser-only";
    state.lastPreAiSaveError = error.message || String(error);
    persist();
    console.warn("AI task pre-save failed", error);
    return { ok: false, target: "browser", error };
  }
}

async function silentSaveProjectSnapshotToLibrary(reason = "snapshot") {
  if (location.protocol === "file:") return { ok: false, skipped: true };
  flushCurrentChapterEditor();
  state.projectId = state.projectId || sanitizeFileName(state.projectTitle || "untitled");
  state.updatedAt = new Date().toISOString();
  try {
    await appFetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persistableState())
    });
    return { ok: true };
  } catch (error) {
    console.warn(`${reason} project snapshot failed`, error);
    return { ok: false, error };
  }
}

async function autoSaveProjectLibraryAfterChapterSave(reason = "chapter-save") {
  if (location.protocol === "file:") return { ok: false, skipped: true, error: new Error("file:// 模式不可用") };
  try {
    await saveProjectToLibrary();
    setStatus(reason === "generated-draft"
      ? "章节已保存到正文库，并已同步项目库和项目圣经"
      : "已同步到项目库");
    return { ok: true };
  } catch (error) {
    setStatus(`章节已保存到浏览器，但项目库同步失败：${error.message}`);
    const target = $("#saveState");
    if (target) target.textContent = `章节已保存到浏览器，但项目库同步失败：${error.message}`;
    return { ok: false, error };
  }
}

function unsavedReplacementReasons() {
  const reasons = [];
  if (quickDraftBusy || activeAiCall) reasons.push("AI任务正在运行");
  if (chapterEditorHasUnsavedChanges()) reasons.push("正文库当前章节有未保存修改");
  if (hasUnsavedGeneratedOutput()) reasons.push("生成正文尚未保存入正文库");
  if (loadStateWarning) reasons.push("浏览器缓存刚出现读取异常");
  return reasons;
}

function confirmProjectReplacement(actionLabel = "替换当前项目") {
  const reasons = unsavedReplacementReasons();
  if (!reasons.length) return { ok: true, reasons };
  if (reasons.includes("AI任务正在运行")) {
    const message = `当前${reasons.join("、")}，不能${actionLabel}。请等待任务结束并保存后再操作。`;
    setStatus(message);
    const target = $("#saveState");
    if (target) target.textContent = message;
    return { ok: false, reasons, blocked: true };
  }
  const ok = confirm(`${actionLabel}会替换当前控制台内容。\n\n检测到：${reasons.join("、")}。\n\n建议先保存到项目库或导出备份。继续？`);
  if (!ok) {
    const message = `已取消${actionLabel}，当前项目未变更。`;
    setStatus(message);
    const target = $("#saveState");
    if (target) target.textContent = message;
    return { ok: false, reasons, canceled: true };
  }
  flushCurrentChapterEditor();
  return { ok: true, reasons, confirmed: true };
}

async function loadSelectedProject(options = {}) {
  const id = $("#projectLibrary").value;
  if (!id) return;
  if (!options.skipConfirm) {
    const replacement = confirmProjectReplacement("打开项目");
    if (!replacement.ok) return;
  }
  const loaded = await appFetch(`/api/projects/${encodeURIComponent(id)}`);
  const recovery = loaded._projectRecovery;
  state = normalizeState(loaded);
  loadStateWarning = null;
  invalidateChapterCache();
  usageEstimateCache = createUsageEstimateCache();
  persist();
  hydrate();
  $("#saveState").textContent = options.source === "auto"
    ? `已自动打开项目：${state.projectTitle || id}`
    : `已打开项目：${state.projectTitle || id}`;
  if (recovery) {
    $("#saveState").textContent = `已从备份打开项目：${state.projectTitle || id}，请检查后保存一次`;
  }
}

function createChapterCache() {
  return {
    sorted: null,
    stats: null,
    visible: null,
    source: {
      withNotes: null,
      withoutNotes: null
    },
    sourceLength: {
      withNotes: null,
      withoutNotes: null
    },
    filterTextById: new Map()
  };
}

function createUsageEstimateCache() {
  return {
    dirty: true,
    text: "",
    reason: "init",
    updatedAt: 0
  };
}

function markUsageEstimateDirty(reason = "unknown") {
  usageEstimateCache.dirty = true;
  usageEstimateCache.reason = reason;
}

function restoreChapterSourceCache(previous, mode) {
  if (!previous) return;
  if (mode === "none") {
    chapterCache.source = { ...previous.source };
    chapterCache.sourceLength = { ...previous.sourceLength };
    return;
  }
  if (mode === "notes") {
    chapterCache.source.withoutNotes = previous.source.withoutNotes;
    chapterCache.sourceLength.withoutNotes = previous.sourceLength.withoutNotes;
  }
}

function invalidateChapterCache(options = {}) {
  const sourceMode = options.sourceMode || "all";
  const previous = chapterCache;
  chapterCache = createChapterCache();
  restoreChapterSourceCache(previous, sourceMode);
  if (sourceMode !== "none" && sourceMode !== "notes") {
    markUsageEstimateDirty("chapter-source");
  }
}

function chapterSourceChangeMode(previous, next, isNew = false) {
  if (isNew) return "all";
  if (String(previous?.draft || "") !== String(next?.draft || "")) return "all";
  if (
    Number(previous?.number || 0) !== Number(next?.number || 0) ||
    String(previous?.title || "") !== String(next?.title || "")
  ) {
    return "all";
  }
  if (String(previous?.notes || "") !== String(next?.notes || "")) return "notes";
  return "none";
}

function ensureChapterCollection() {
  if (!Array.isArray(state.chapters) || !state.chapters.length) {
    state.chapters = structuredClone(defaults.chapters);
    state.activeChapterId = state.chapters[0].id;
    invalidateChapterCache();
    return;
  }
  if (!state.chapters.some((chapter) => chapter.id === state.activeChapterId)) {
    state.activeChapterId = state.chapters[0]?.id || "chapter-1";
  }
}

function currentChapterRecord() {
  ensureChapterCollection();
  return state.chapters.find((chapter) => chapter.id === state.activeChapterId) || state.chapters[0];
}

function compareChapters(a, b) {
  return Number(a.number || 0) - Number(b.number || 0);
}

function chapterLabel(chapter) {
  return `第${chapter.number || "?"}章 ${chapter.title || "未命名"}`.trim();
}

function chapterStatusText(status) {
  const labels = {
    planned: "计划",
    brief: "大纲",
    drafted: "已入库",
    "needs-review": "待质检",
    reviewed: "已质检",
    "needs-fix": "需修复",
    revised: "已修",
    queued: "待发",
    published: "已发",
    final: "已完成"
  };
  return labels[status] || status || "计划";
}

function chapterWordCount(chapter) {
  if (chapter?.id && chapterCache.stats?.wordById?.has(chapter.id)) {
    return chapterCache.stats.wordById.get(chapter.id);
  }
  return String(chapter?.draft || "").replace(/\s/g, "").length;
}

function chapterStats() {
  if (chapterCache.stats) return chapterCache.stats;
  const stats = {
    totalWords: 0,
    drafted: 0,
    latest: null,
    maxNumber: 0,
    maxDraftedNumber: 0,
    wordById: new Map()
  };
  sortedChapters().forEach((chapter) => {
    const words = String(chapter?.draft || "").replace(/\s/g, "").length;
    stats.wordById.set(chapter.id, words);
    stats.totalWords += words;
    stats.maxNumber = Math.max(stats.maxNumber, Number(chapter.number || 0));
    if (words > 0) {
      stats.drafted += 1;
      stats.latest = chapter;
      stats.maxDraftedNumber = Math.max(stats.maxDraftedNumber, Number(chapter.number || 0));
    }
  });
  chapterCache.stats = stats;
  return stats;
}

function chapterStatusClass(status) {
  return `status-${String(status || "planned").replace(/[^a-z0-9-]/gi, "").toLowerCase()}`;
}

function chapterCanonText(chapter) {
  const words = chapterWordCount(chapter);
  if (!words) return "未入库";
  const status = String(chapter?.status || "drafted");
  if (status === "needs-fix") return "需修复";
  if (["reviewed", "final", "published"].includes(status)) return "已质检";
  if (["drafted", "revised", "queued"].includes(status)) return "正史";
  return "已入库";
}

function chapterMemorySourceText(chapter) {
  return chapterWordCount(chapter) > 0 ? "AI资料库来源" : "";
}

function chapterFilterText(chapter) {
  if (chapter?.id && chapterCache.filterTextById.has(chapter.id)) {
    return chapterCache.filterTextById.get(chapter.id);
  }
  const text = [
    chapterLabel(chapter),
    chapterStatusText(chapter.status),
    chapterCanonText(chapter),
    chapterMemorySourceText(chapter),
    chapter.status || "",
    chapter.notes || ""
  ]
    .join(" ")
    .toLowerCase();
  if (chapter?.id) chapterCache.filterTextById.set(chapter.id, text);
  return text;
}

function currentChapterFilters() {
  return {
    query: ($("#chapterSearchInput")?.value || "").trim().toLowerCase(),
    status: $("#chapterStatusFilter")?.value || "all"
  };
}

function chapterPassesLibraryFilters(chapter, filters = currentChapterFilters()) {
  const { query, status } = filters;
  if (status !== "all" && String(chapter.status || "planned") !== status) return false;
  if (query && !chapterFilterText(chapter).includes(query)) return false;
  return true;
}

function visibleChaptersForLibrary() {
  const filters = currentChapterFilters();
  const key = `${filters.status}\n${filters.query}`;
  if (chapterCache.visible?.key === key) return chapterCache.visible.chapters;
  const chapters = sortedChapters().filter((chapter) => chapterPassesLibraryFilters(chapter, filters));
  chapterCache.visible = { key, chapters };
  return chapters;
}

function renderChapterSelect() {
  const select = $("#chapterLibrary");
  if (!select) return;
  const fragment = document.createDocumentFragment();
  select.innerHTML = "";
  sortedChapters().forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter.id;
    option.textContent = chapterLabel(chapter);
    option.selected = chapter.id === state.activeChapterId;
    fragment.appendChild(option);
  });
  select.appendChild(fragment);
}

function renderChapterLibrary(options = {}) {
  ensureChapterCollection();
  renderChapterSelect();
  renderChapterCards();
  updateChapterLibrarySummary();
  renderTxtExportOptions();
  if (options.editor !== false) renderChapterEditor();
  updateWritingContextBoard();
}

function renderChapterCards() {
  const root = $("#chapterCardList");
  if (!root) return;
  root.innerHTML = "";
  const latest = chapterStats().latest;
  const visibleChapters = visibleChaptersForLibrary();
  if (!visibleChapters.length) {
    root.innerHTML = `<div class="chapter-list-empty">没有匹配的章节</div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  visibleChapters.forEach((chapter) => {
    const card = document.createElement("button");
    const active = chapter.id === state.activeChapterId;
    const words = chapterWordCount(chapter);
    const isLatest = latest?.id === chapter.id;
    const canonText = chapterCanonText(chapter);
    const memorySourceText = chapterMemorySourceText(chapter);
    card.className = `chapter-card ${active ? "is-active" : ""} ${isLatest ? "is-latest" : ""}`;
    card.type = "button";
    card.dataset.chapterId = chapter.id;
    card.dataset.words = String(words);
    card.title = chapterLabel(chapter);
    card.setAttribute("role", "option");
    card.setAttribute("aria-selected", active ? "true" : "false");
    card.setAttribute("aria-label", `${chapterLabel(chapter)}，${chapterStatusText(chapter.status)}，${words}字`);
    card.innerHTML = `
      <span class="chapter-card-body">
        <span class="chapter-card-top">
          <span class="chapter-card-index">第${escapeHtml(chapter.number || "?")}章</span>
          <span class="chapter-card-badges">
            ${isLatest ? `<span class="latest-chapter-badge">最新</span>` : ""}
            <span class="chapter-status ${chapterStatusClass(chapter.status)}">${escapeHtml(chapterStatusText(chapter.status))}</span>
          </span>
        </span>
        <strong class="chapter-card-title">${escapeHtml(chapter.title || "未命名")}</strong>
        <span class="chapter-card-meta">
          <span>${words} 字</span>
          ${canonText ? `<span class="chapter-canon-badge">${escapeHtml(canonText)}</span>` : ""}
          ${memorySourceText ? `<span class="chapter-memory-badge">${escapeHtml(memorySourceText)}</span>` : ""}
          ${chapter.notes ? `<span>有备注</span>` : ""}
        </span>
      </span>
    `;
    fragment.appendChild(card);
  });
  root.appendChild(fragment);
  scrollActiveChapterIntoView(root);
}

function updateChapterLibrarySummary() {
  const title = $("#chapterLibraryTitle");
  const summary = $("#chapterLibrarySummary");
  const stats = chapterStats();
  const visible = visibleChaptersForLibrary().length;
  const latest = stats.latest ? chapterLabel(stats.latest) : "暂无";
  if (title) title.textContent = `共 ${state.chapters.length} 章`;
  if (summary) summary.textContent = `显示 ${visible}/${state.chapters.length} 章 · 已写 ${stats.drafted} 章 · 正文 ${stats.totalWords} 字 · 最新 ${latest}`;
}

function refreshChapterListView() {
  renderChapterCards();
  updateChapterLibrarySummary();
}

function scheduleChapterListRefresh() {
  if (chapterFilterTimer) clearTimeout(chapterFilterTimer);
  chapterFilterTimer = setTimeout(() => {
    chapterFilterTimer = 0;
    refreshChapterListView();
  }, CHAPTER_FILTER_DELAY_MS);
}

function renderTxtExportOptions() {
  const select = $("#txtExportChapterSelect");
  if (!select) return;
  const selectedIds = new Set(Array.from(select.selectedOptions || []).map((option) => option.value));
  if (!selectedIds.size && state.activeChapterId) selectedIds.add(state.activeChapterId);
  const fragment = document.createDocumentFragment();
  select.innerHTML = "";
  sortedChapters().forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter.id;
    option.textContent = chapterLabel(chapter);
    option.selected = selectedIds.has(chapter.id);
    fragment.appendChild(option);
  });
  select.appendChild(fragment);
}

function renderChapterEditor() {
  const chapter = currentChapterRecord();
  if (!chapter) return;
  $("#chapterEditorNumber").value = chapter.number || 1;
  $("#chapterEditorStatus").value = chapter.status || "planned";
  $("#chapterEditorTitle").value = chapter.title || "";
  $("#chapterEditorDraft").value = chapter.draft || "";
  $("#chapterEditorNotes").value = chapter.notes || "";
  updateChapterEditorHeading(chapter);
  updateChapterStats();
  updateChapterSaveState();
}

function updateChapterEditorHeading(chapter = currentChapterRecord()) {
  const heading = $("#chapterEditorHeading");
  if (heading) heading.textContent = chapterLabel(chapter);
}

function setChapterFocusMode(enabled) {
  document.body.classList.toggle("chapter-focus-mode", Boolean(enabled));
  const button = $("#chapterFocusBtn");
  if (button) button.textContent = enabled ? "退出专注" : "专注";
}

function toggleChapterFocusMode() {
  setChapterFocusMode(!document.body.classList.contains("chapter-focus-mode"));
}

function isNarrowChapterLayout() {
  return window.matchMedia?.("(max-width: 860px)")?.matches || false;
}

function isMediumChapterLayout() {
  return window.matchMedia?.("(max-width: 1420px)")?.matches || false;
}

function isChapterSidePanelOpen() {
  if (document.body.classList.contains("chapter-side-open")) return true;
  if (document.body.classList.contains("chapter-side-collapsed")) return false;
  return !isMediumChapterLayout();
}

function setChapterSideCollapsed(collapsed) {
  document.body.classList.toggle("chapter-side-collapsed", Boolean(collapsed));
  document.body.classList.toggle("chapter-side-open", !collapsed);
  const button = $("#chapterSideToggleBtn");
  if (button) button.textContent = collapsed ? "章节信息" : "收起信息";
}

function toggleChapterSidePanel() {
  setChapterSideCollapsed(isChapterSidePanelOpen());
}

function setChapterLibraryOpen(open) {
  document.body.classList.toggle("chapter-library-open", Boolean(open));
  document.body.classList.toggle("chapter-library-collapsed", !open);
  const button = $("#chapterLibraryToggleBtn");
  if (button) button.textContent = open ? "收起目录" : "章节目录";
}

function toggleChapterLibraryPanel() {
  setChapterLibraryOpen(!document.body.classList.contains("chapter-library-open"));
}

function updateChapterResponsiveControls() {
  const sideButton = $("#chapterSideToggleBtn");
  if (sideButton) sideButton.textContent = isChapterSidePanelOpen() ? "收起信息" : "章节信息";
  const libraryButton = $("#chapterLibraryToggleBtn");
  if (libraryButton) libraryButton.textContent = document.body.classList.contains("chapter-library-open") ? "收起目录" : "章节目录";
  if (!isNarrowChapterLayout()) {
    document.body.classList.remove("chapter-library-open", "chapter-library-collapsed");
  }
}

function formatChapterSaveTime(date = new Date()) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function readChapterEditorForDirtyCheck() {
  const number = Number($("#chapterEditorNumber")?.value || 1);
  return {
    id: state.activeChapterId || `chapter-${Date.now()}`,
    number,
    title: $("#chapterEditorTitle")?.value.trim() || "",
    status: $("#chapterEditorStatus")?.value || "planned",
    draft: $("#chapterEditorDraft")?.value || "",
    notes: $("#chapterEditorNotes")?.value || ""
  };
}

function normalizeChapterForDirtyCheck(chapter) {
  return {
    id: chapter?.id || "",
    number: Number(chapter?.number || 0),
    title: chapter?.title || "",
    status: chapter?.status || "planned",
    draft: chapter?.draft || "",
    notes: chapter?.notes || ""
  };
}

function chapterEditorHasUnsavedChanges() {
  const chapter = currentChapterRecord();
  if (!chapter) return false;
  return !sameChapterRecord(normalizeChapterForDirtyCheck(chapter), readChapterEditorForDirtyCheck());
}

function flushCurrentChapterEditor(options = {}) {
  if (!$("#chapterEditorDraft") || !currentChapterRecord()) return false;
  if (!chapterEditorHasUnsavedChanges()) return false;
  if (chapterEditorAutosaveTimer) {
    clearTimeout(chapterEditorAutosaveTimer);
    chapterEditorAutosaveTimer = 0;
  }
  return saveCurrentChapter({
    silent: true,
    skipRender: true,
    persist: false,
    ...options
  });
}

function setChapterSaveState(kind, text) {
  const target = $("#chapterSaveState");
  if (!target) return;
  target.dataset.state = kind;
  target.textContent = text;
}

function updateChapterSaveState(options = {}) {
  if (options.savedNow) {
    setChapterSaveState("saved", `已保存 ${formatChapterSaveTime()}`);
    return;
  }
  if (chapterEditorHasUnsavedChanges()) {
    setChapterSaveState("dirty", "未保存修改");
    return;
  }
  setChapterSaveState("saved", "已保存");
}

function markChapterEditorDirty() {
  updateChapterEditorHeading(readChapterEditor());
  updateChapterSaveState();
}

function scheduleChapterEditorAutosave() {
  if (chapterEditorAutosaveTimer) clearTimeout(chapterEditorAutosaveTimer);
  chapterEditorAutosaveTimer = setTimeout(() => {
    chapterEditorAutosaveTimer = 0;
    if (!chapterEditorHasUnsavedChanges()) return;
    saveCurrentChapter({ silent: true, skipRender: true });
  }, CHAPTER_AUTOSAVE_DELAY_MS);
}

function scrollActiveChapterIntoView(root = $("#chapterCardList")) {
  if (!root) return;
  requestAnimationFrame(() => {
    root.querySelector(".chapter-card.is-active")?.scrollIntoView({ block: "nearest" });
  });
}

function syncActiveChapterUi() {
  const select = $("#chapterLibrary");
  if (select && select.value !== state.activeChapterId) select.value = state.activeChapterId;
  const root = $("#chapterCardList");
  if (!root) return;
  root.querySelectorAll("[data-chapter-id]").forEach((card) => {
    const active = card.dataset.chapterId === state.activeChapterId;
    card.classList.toggle("is-active", active);
    card.setAttribute("aria-selected", active ? "true" : "false");
  });
  scrollActiveChapterIntoView(root);
}

function readChapterEditor() {
  const number = Number($("#chapterEditorNumber").value || 1);
  return {
    id: state.activeChapterId || `chapter-${Date.now()}`,
    number,
    title: $("#chapterEditorTitle").value.trim() || `第${number}章`,
    status: $("#chapterEditorStatus").value,
    draft: $("#chapterEditorDraft").value,
    notes: $("#chapterEditorNotes").value
  };
}

function sameChapterRecord(left, right) {
  return Boolean(left && right) &&
    String(left.id || "") === String(right.id || "") &&
    Number(left.number || 0) === Number(right.number || 0) &&
    String(left.title || "") === String(right.title || "") &&
    String(left.status || "planned") === String(right.status || "planned") &&
    String(left.draft || "") === String(right.draft || "") &&
    String(left.notes || "") === String(right.notes || "");
}

function saveCurrentChapter(options = {}) {
  const next = readChapterEditor();
  const index = state.chapters.findIndex((chapter) => chapter.id === next.id);
  let changed = false;
  let sourceMode = "none";
  if (index >= 0) {
    sourceMode = chapterSourceChangeMode(state.chapters[index], next);
    changed = !sameChapterRecord(state.chapters[index], next);
    if (changed) state.chapters[index] = next;
  } else {
    state.chapters.push(next);
    changed = true;
    sourceMode = chapterSourceChangeMode(null, next, true);
  }
  state.activeChapterId = next.id;
  state.currentChapter = next.number;
  if (changed) invalidateChapterCache({ sourceMode });
  if (changed && sourceMode !== "none" && chapterWordCount(next) > 0) markChapterEvidenceDirty(next);
  updateChapterEditorHeading(next);
  updateChapterStats();
  if (changed && sourceMode !== "none" && sourceMode !== "notes") deferUsageEstimate("chapter-save");
  if (options.persist !== false) persist();
  if (!options.skipRender) {
    if (changed) {
      renderChapterLibrary({ editor: false });
    } else {
      syncActiveChapterUi();
      updateWritingContextBoard();
    }
  }
  updateChapterSaveState({ savedNow: true });
  updateQualityAuditUi();
  if (!options.silent) $("#saveState").textContent = `章节已保存：${chapterLabel(next)}`;
  return changed;
}

function createNewChapter() {
  saveCurrentChapter({ silent: true, skipRender: true, persist: false });
  const nextNumber = maxChapterNumber() + 1;
  const chapter = {
    id: `chapter-${Date.now()}`,
    number: nextNumber,
    title: `第${nextNumber}章`,
    status: "planned",
    draft: "",
    notes: ""
  };
  state.chapters.push(chapter);
  state.activeChapterId = chapter.id;
  invalidateChapterCache({ sourceMode: "none" });
  renderChapterLibrary();
  persist();
  $("#saveState").textContent = `已新建章节：${chapterLabel(chapter)}`;
}

function selectChapterById(chapterId) {
  if (!chapterId || chapterId === state.activeChapterId) return;
  const chapterChanged = saveCurrentChapter({ silent: true, skipRender: true, persist: false });
  state.activeChapterId = chapterId;
  persist();
  if (chapterChanged) {
    renderChapterLibrary();
  } else {
    syncActiveChapterUi();
    renderChapterEditor();
    updateWritingContextBoard();
  }
  schedulePromptUpdate("manuscript");
}

function writeAiOutputToChapter() {
  const output = $("#aiOutput").value.trim();
  if (!output) {
    $("#saveState").textContent = "没有可写入本章的 AI 正文";
    return;
  }
  const validationMessage = draftOutputValidationMessage(output);
  if (validationMessage) {
    $("#saveState").textContent = `AI 输出不是可写入正文：${validationMessage}`;
    return;
  }
  const draft = $("#chapterEditorDraft");
  draft.value = draft.value.trim() ? `${draft.value.trim()}\n\n${output}` : output;
  updateChapterStats();
  updateChapterSaveState();
  saveCurrentChapter();
}

function exportCurrentChapterMarkdown() {
  saveCurrentChapter();
  const chapter = currentChapterRecord();
  const markdown = `# ${chapterLabel(chapter)}\n\n状态：${chapter.status || "planned"}\n\n${chapter.draft || ""}\n\n## 章节备注\n\n${chapter.notes || ""}\n`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${sanitizeFileName(chapterLabel(chapter))}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadTextFile(content, fileName) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = sanitizeFileName(fileName);
  link.click();
  URL.revokeObjectURL(link.href);
}

function chapterToPlainText(chapter) {
  return `${chapterLabel(chapter)}\n\n${(chapter.draft || "").trim()}`.trim();
}

function exportChaptersAsTxt(chapters, fileName) {
  const exportable = chapters
    .slice()
    .sort(compareChapters)
    .filter((chapter) => (chapter.draft || "").trim());
  if (!exportable.length) {
    $("#saveState").textContent = "没有可导出的章节正文";
    return;
  }
  const title = state.projectTitle || "未命名小说";
  const body = exportable.map(chapterToPlainText).join("\n\n\n");
  downloadTextFile(`${title}\n\n${body}\n`, fileName);
  const menu = $("#chapterExportMenu");
  if (menu) menu.open = false;
  $("#saveState").textContent = `已导出 TXT：${exportable.length} 个章节`;
}

function exportCurrentChapterTxt() {
  saveCurrentChapter();
  const chapter = currentChapterRecord();
  exportChaptersAsTxt([chapter], `${chapterLabel(chapter)}.txt`);
}

function exportSelectedChaptersTxt() {
  const ids = Array.from($("#txtExportChapterSelect")?.selectedOptions || []).map((option) => option.value);
  saveCurrentChapter();
  const chapters = state.chapters.filter((chapter) => ids.includes(chapter.id));
  if (!chapters.length) {
    $("#saveState").textContent = "请先在“批量选择章节”里选择章节";
    return;
  }
  exportChaptersAsTxt(chapters, `${state.projectTitle || "未命名小说"}-选中章节.txt`);
}

function exportAllChaptersTxt() {
  saveCurrentChapter();
  exportChaptersAsTxt(state.chapters, `${state.projectTitle || "未命名小说"}-全本.txt`);
}

function deleteCurrentChapter() {
  if (state.chapters.length <= 1) {
    $("#saveState").textContent = "至少保留一个章节";
    return;
  }
  const chapter = currentChapterRecord();
  if (!confirm(`删除 ${chapterLabel(chapter)}？`)) return;
  state.chapters = state.chapters.filter((item) => item.id !== chapter.id);
  state.activeChapterId = state.chapters[0].id;
  invalidateChapterCache();
  deferUsageEstimate("delete-chapter");
  persist();
  renderChapterLibrary();
}

function updateChapterStats() {
  const target = $("#chapterStats");
  const text = $("#chapterEditorDraft")?.value || "";
  const count = text.replace(/\s/g, "").length;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
  if (target) target.textContent = `当前章 ${count} 字 · ${lines} 行`;
  const draftStats = $("#chapterDraftStats");
  if (draftStats) draftStats.textContent = `${count} 字 · ${lines} 行`;
}

function scheduleChapterStatsUpdate() {
  if (chapterStatsTimer) clearTimeout(chapterStatsTimer);
  chapterStatsTimer = setTimeout(() => {
    chapterStatsTimer = 0;
    updateChapterStats();
  }, CHAPTER_STATS_DELAY_MS);
}

function updateDraftBoundaryNotice(value = $("#quickOutput")?.value || state.quickOutput || "") {
  const target = $("#draftBoundaryNotice");
  if (!target) return;
  const text = String(value || "").trim();
  if (!text) {
    target.dataset.status = "idle";
    target.textContent = "生成正文会先停留在草稿区；保存到正文库后，才会成为正史并进入 AI资料库。";
    return;
  }
  if (!isDraftOutputReady(text)) {
    target.dataset.status = "blocked";
    target.textContent = "当前内容是生成状态、检查文本或失败日志，不会写入正文库，也不会进入 AI资料库。";
    return;
  }
  if (state.quickOutputSavedHash === shortHash(text)) {
    target.dataset.status = "saved";
    target.textContent = isShortStory()
      ? "这份短篇已保存；再次保存前请先修改正文或重新生成。"
      : "这份正文已保存到正文库：现在是正史章节，更新 AI资料库时会被读取。";
    return;
  }
  target.dataset.status = "draft";
  target.textContent = isShortStory()
    ? "当前是未保存短篇草稿；满意后请保存，避免刷新或切换项目时丢失。"
    : "当前是未入库草稿：AI资料库不会读取它。满意后请点击“保存到正文库”。";
}

function updateQuickOutputStats() {
  const target = $("#quickOutputStats");
  if (!target) return;
  const text = $("#quickOutput")?.value || state.quickOutput || "";
  const count = text.replace(/\s/g, "").length;
  if (!count) {
    target.textContent = "字数：0";
    setText("quickOutputState", "等待生成");
    updateDraftBoundaryNotice(text);
    renderDraftQualityGate(text);
    updateWorkbenchFocus();
    return;
  }
  if (isShortStory()) {
    target.textContent = `字数：${count}`;
    setText("quickOutputState", "短篇正文已生成");
    updateDraftBoundaryNotice(text);
    renderDraftQualityGate(text);
    updateWorkbenchFocus();
    return;
  }
  const chapterCount = splitGeneratedChapters(text).length;
  target.textContent = chapterCount > 1 ? `字数：${count} · ${chapterCount} 章` : `字数：${count}`;
  setText("quickOutputState", chapterCount > 1 ? `已生成 ${chapterCount} 章` : "已生成 1 章");
  updateDraftBoundaryNotice(text);
  renderDraftQualityGate(text);
  updateWorkbenchFocus();
}

function normalizeShortReviewStatus(status) {
  return ["pending", "running", "save", "polish", "rewrite"].includes(status) ? status : "pending";
}

function inferShortReviewStatus(text) {
  const value = String(text || "");
  if (!value.trim()) return "pending";
  if (/结构需重改|需重改|重构|闭环不成立|主线不成立|核心冲突未完成|必须重写|大改/.test(value)) return "rewrite";
  if (/建议精修|进入精修|可进入精修|需要精修|先精修|精修/.test(value)) return "polish";
  if (/可保存|可以保存|可直接保存|可以直接保存|可作为草稿保存|可以作为完整故事/.test(value)) return "save";
  return "polish";
}

function renderShortReviewStatus() {
  const target = $("#shortReviewStatus");
  if (!target) return;
  let status = normalizeShortReviewStatus(state.shortReviewStatus || "pending");
  if (status === "pending" && String(state.shortReviewResult || "").trim()) {
    status = inferShortReviewStatus(state.shortReviewResult);
  }
  state.shortReviewStatus = status;
  const labels = {
    pending: "未检查",
    running: "检查中",
    save: "可保存",
    polish: "建议精修",
    rewrite: "结构需重改"
  };
  target.dataset.status = status;
  target.textContent = labels[status] || labels.pending;
}

function setShortReviewStatus(status) {
  state.shortReviewStatus = normalizeShortReviewStatus(status);
  renderShortReviewStatus();
  updateWorkbenchFocus();
}

function renderPolishReviewContext() {
  const hint = $("#polishReviewContextHint");
  if (!hint) return;
  const context = String(state.polishReviewContext || "").trim();
  const hasContext = Boolean(context);
  if (hasContext) {
    hint.textContent = context.includes("长篇体检")
      ? "已带入长篇体检报告，精修会优先处理体检指出的追读、人物、设定和AI痕迹问题。"
      : "已带入短篇检查意见，精修会优先处理检查指出的问题。";
  }
  hint.hidden = !hasContext;
}

function hydrateQuickSourceText(el) {
  const value = String(state.quickSourceText || "");
  const shouldLoad = value.length > 0 && value.length <= QUICK_SOURCE_INLINE_LIMIT;
  el.dataset.loaded = shouldLoad ? "true" : "false";
  el.value = shouldLoad ? value : "";
}

function ensureQuickSourceLoaded() {
  const input = $("#quickSourceText");
  if (!input || input.dataset.loaded === "true") return;
  input.value = state.quickSourceText || "";
  input.dataset.loaded = "true";
}

function updateQuickSourceSummary() {
  const target = $("#quickSourceSummary");
  if (!target) return;
  const manualLength = String(state.quickSourceText || "").trim().length;
  const chapterCount = chapterStats().drafted;
  if (manualLength) {
    target.textContent = manualLength > QUICK_SOURCE_INLINE_LIMIT
      ? `已保存 ${manualLength} 字，展开后加载`
      : `${manualLength} 字`;
    return;
  }
  if (isShortStory()) {
    target.textContent = chapterCount ? `可参考正文库 ${chapterCount} 篇/段` : "未填写";
    return;
  }
  target.textContent = chapterCount ? `将自动读取正文库 ${chapterCount} 章` : "未填写";
}

function fieldValue(el) {
  if (el.type === "number") return Number(el.value || 0);
  if (el.type === "checkbox") return el.checked;
  return el.value;
}

function syncField(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (id === "quickSourceText" && el.dataset.loaded !== "true") return false;
  const next = fieldValue(el);
  const changed = state[id] !== next;
  state[id] = next;
  if (changed && id === "quickOutput") state.quickOutputSavedHash = "";
  return changed;
}

function syncFields() {
  fieldIds.forEach(syncField);
}

const aiSnapshotSkipFields = new Set([
  "quickOutput",
  "shortReviewResult",
  "polishOutput",
  "qualityAuditResult",
  "revisionAiOutput",
  "outlineResult",
  "endingLibraryScanResult",
  "endingDiagnosis",
  "endingPayoffResult",
  "endingReverseOutline",
  "endingReadinessResult",
  "aiOutput"
]);

function syncFieldsForAiSnapshot() {
  fieldIds.forEach((id) => {
    if (!aiSnapshotSkipFields.has(id)) syncField(id);
  });
}

function applyTheme(theme) {
  const nextTheme = themeIds.has(theme) ? theme : defaults.theme;
  document.documentElement.dataset.theme = nextTheme;
  updateThemeCurrentName(nextTheme);
}

function updateThemeCurrentName(themeId) {
  const target = $("#themeCurrentName");
  const meta = themeMetaById.get(themeId);
  if (target) target.textContent = meta ? `${meta.name} ${meta.primary}` : "爱马仕橙 #FF8A00";
}

function applySimpleMode() {
  document.body.classList.toggle("simple-ui", Boolean(state.simpleMode));
  const toggle = $("#simpleModeToggle");
  const status = $("#simpleModeStatus");
  if (toggle) toggle.checked = Boolean(state.simpleMode);
  if (status) status.textContent = state.simpleMode ? "极简模式" : "完整模式";
}

function openThemeDrawer() {
  renderThemeCards();
  const drawer = $("#themeDrawer");
  if (drawer) drawer.hidden = false;
}

function closeThemeDrawer() {
  const drawer = $("#themeDrawer");
  if (drawer) drawer.hidden = true;
}

function modelProfiles() {
  if (!Array.isArray(state.modelProfiles) || !state.modelProfiles.length) {
    state.modelProfiles = createBaseModelProfiles(state);
  }
  return state.modelProfiles;
}

function modelProfileById(id) {
  return modelProfiles().find((profile) => profile.id === id) || modelProfiles()[0];
}

function activeModelProfile() {
  return modelProfileById(state.activeModelProfileId || "default");
}

function profileLabel(profile) {
  if (!profile) return "未选择模型";
  const provider = providerPresets[profile.provider] ? profile.provider : "custom";
  const model = profile.model || providerPresets[provider]?.model || "未填写模型";
  return `${profile.name} · ${provider} / ${model}`;
}

function selectedModelProfileForTask(task = "api") {
  const profileId = state.moduleModelBindings?.[task] || state.moduleModelBindings?.api || state.activeModelProfileId || "default";
  return modelProfileById(profileId);
}

function syncActiveModelProfileFromFields() {
  const profile = activeModelProfile();
  if (!profile) return;
  profile.provider = state.apiProvider || "codex";
  profile.endpoint = state.apiEndpoint || providerPresets[profile.provider]?.endpoint || "";
  const sourceModel = state.apiModel || providerPresets[profile.provider]?.model || "";
  profile.model = profile.provider === "codex" && codexModelIsDefault(sourceModel)
    ? CODEX_RECOMMENDED_MODEL
    : sourceModel;
  if (profile.provider === "codex") state.apiModel = profile.model;
  profile.apiKey = state.apiKey || "";
  profile.codexCommand = state.codexCommand || "auto";
  profile.codexProfile = state.codexProfile || "";
  profile.reasoningEffort = normalizeCodexReasoningEffort(state.codexReasoningEffort || profile.reasoningEffort);
  profile.systemPrompt = state.apiSystemPrompt || "";
  profile.temperature = Number(state.apiTemperature || defaults.apiTemperature);
  profile.maxTokens = Number(state.apiMaxTokens || defaults.apiMaxTokens);
}

function applyProfileToFields(profile) {
  applyProfileToState(profile);
  ["apiProvider", "apiEndpoint", "apiModel", "apiKey", "codexCommand", "codexProfile", "codexReasoningEffort", "apiSystemPrompt", "apiTemperature", "apiMaxTokens"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state[id] ?? "";
  });
}

function renderModelProfileOptions() {
  const select = $("#modelProfileSelect");
  if (!select) return;
  const profiles = modelProfiles();
  select.innerHTML = profiles.map((profile) => (
    `<option value="${escapeAttr(profile.id)}">${escapeHtml(profile.name)} · ${escapeHtml(codexRuntimeSummary(profile))}</option>`
  )).join("");
  select.value = state.activeModelProfileId || profiles[0]?.id || "default";
  const nameInput = $("#modelProfileName");
  if (nameInput) nameInput.value = activeModelProfile()?.name || "";
  const reasoningInput = $("#codexReasoningEffort");
  if (reasoningInput) reasoningInput.value = activeCodexReasoningEffort();
}

function renderModelBindingControls() {
  const root = $("#modelBindingGrid");
  if (!root) return;
  const profiles = modelProfiles();
  root.innerHTML = modelTaskOptions.map((item) => {
    const value = state.moduleModelBindings?.[item.task] || defaultModelBindings[item.task] || "default";
    const options = profiles.map((profile) => (
      `<option value="${escapeAttr(profile.id)}" ${profile.id === value ? "selected" : ""}>${escapeHtml(profile.name)}</option>`
    )).join("");
    const selected = modelProfileById(value);
    const selectedModel = selected?.model || "未填写模型";
    const modelText = selected?.provider === "codex" ? codexModelDisplay(selectedModel) : selectedModel;
    const reasoningText = selected?.provider === "codex" ? ` · ${codexReasoningLabel(selected.reasoningEffort)}推理` : "";
    const warning = selected?.provider === "codex" && codexModelIsDefault(selectedModel)
      ? '<b class="model-binding-warning">默认模型无法确认具体名称</b>'
      : "";
    return `
      <label class="model-binding-card">
        <span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.hint)}</small>
        </span>
        <select data-model-binding="${escapeAttr(item.task)}">${options}</select>
        <em>${escapeHtml(`${modelText}${reasoningText}`)}</em>
        ${warning}
      </label>
    `;
  }).join("");
}

function renderModelStrategyButtons() {
  document.querySelectorAll("[data-model-strategy]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.modelStrategy === state.modelStrategy);
  });
}

function renderCodexRuntimeControls() {
  const activeProfile = activeModelProfile();
  const activeModel = normalizeCodexModel(state.apiModel || activeProfile?.model || CODEX_RECOMMENDED_MODEL);
  const activeReasoning = activeCodexReasoningEffort(activeProfile);
  const reasoningInput = $("#codexReasoningEffort");
  if (reasoningInput) reasoningInput.value = activeReasoning;
  const reasoningHint = $("#codexReasoningHint");
  if (reasoningHint) reasoningHint.textContent = codexReasoningHint(activeReasoning);
  document.querySelectorAll("[data-codex-preset]").forEach((button) => {
    const preset = codexPresetOptions.find((item) => item.id === button.dataset.codexPreset);
    const active = Boolean(preset && preset.model === activeModel && preset.reasoningEffort === activeReasoning);
    button.classList.toggle("is-active", active || button.dataset.codexPreset === state.codexPresetId);
    const status = button.querySelector("small[data-preset-status]");
    if (status) status.textContent = active ? "当前组合" : "点击切换";
  });
  document.querySelectorAll("[data-codex-model]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.codexModel === activeModel);
  });
  const profileText = $("#codexProfileSummary");
  if (profileText) profileText.textContent = activeProfile?.name || "默认模型";
  const reasoningStatus = $("#apiCurrentReasoning");
  if (reasoningStatus) reasoningStatus.textContent = `${codexReasoningLabel(activeReasoning)}推理`;
  const routeGrid = $("#codexRouteSummaryGrid");
  if (routeGrid) {
    const routeTasks = ["outline", "analysis", "planning", "quick", "polish", "quality", "ending"];
    routeGrid.innerHTML = routeTasks.map((task) => {
      const item = modelTaskOptions.find((option) => option.task === task);
      const profile = selectedModelProfileForTask(task);
      return `
        <article class="codex-route-card">
          <span>${escapeHtml(item?.name || task)}</span>
          <strong>${escapeHtml(profile?.name || "默认模型")}</strong>
          <small>${escapeHtml(codexRuntimeSummary(profile))}</small>
        </article>
      `;
    }).join("");
  }
}

function modelRouteSummary() {
  const draft = selectedModelProfileForTask("quick");
  const polish = selectedModelProfileForTask("polish");
  const draftModel = codexRuntimeSummary(draft);
  const polishModel = codexRuntimeSummary(polish);
  return `正文：${draft?.name || "默认模型"} / ${draftModel}；润色：${polish?.name || "默认模型"} / ${polishModel}`;
}

function renderModelControls() {
  renderModelProfileOptions();
  renderModelBindingControls();
  renderModelStrategyButtons();
  renderCodexRuntimeControls();
  updateApiHelp();
  updateLastAiCallUi();
}

function selectModelProfile(profileId) {
  const profile = modelProfileById(profileId);
  if (!profile) return;
  state.activeModelProfileId = profile.id;
  applyProfileToFields(profile);
  apiAvailability = { status: "unknown", message: "已切换模型方案，请重新检测可用性。" };
  renderModelControls();
  persist();
}

function createNewModelProfile() {
  syncFields();
  syncActiveModelProfileFromFields();
  const id = `profile-${Date.now().toString(36)}`;
  const profile = createModelProfile(id, `模型方案 ${modelProfiles().length + 1}`, state);
  state.modelProfiles.push(profile);
  state.activeModelProfileId = id;
  applyProfileToFields(profile);
  state.modelStrategy = "custom";
  renderModelControls();
  persist();
}

function deleteActiveModelProfile() {
  const profile = activeModelProfile();
  if (!profile || profile.id === "default") {
    setStatus("默认模型方案不能删除");
    return;
  }
  state.modelProfiles = modelProfiles().filter((item) => item.id !== profile.id);
  Object.keys(state.moduleModelBindings || {}).forEach((task) => {
    if (state.moduleModelBindings[task] === profile.id) state.moduleModelBindings[task] = "default";
  });
  state.activeModelProfileId = "default";
  applyProfileToFields(activeModelProfile());
  state.modelStrategy = "custom";
  renderModelControls();
  persist();
}

function saveActiveModelProfile() {
  syncFields();
  const profile = activeModelProfile();
  const name = ($("#modelProfileName")?.value || profile?.name || "").trim();
  if (profile && name) profile.name = name;
  syncActiveModelProfileFromFields();
  renderModelControls();
  persist();
  setStatus("模型方案已保存");
}

function applyModelStrategy(strategy) {
  if (!modelStrategyBindings[strategy]) return;
  state.modelStrategy = strategy;
  state.moduleModelBindings = { ...state.moduleModelBindings, ...modelStrategyBindings[strategy] };
  renderModelControls();
  persist();
}

function setCodexRuntime(model, reasoningEffort, profileId = "") {
  const normalizedModel = normalizeCodexModel(model);
  const normalizedReasoning = normalizeCodexReasoningEffort(reasoningEffort);
  state.apiProvider = "codex";
  state.apiEndpoint = providerPresets.codex.endpoint;
  state.apiModel = normalizedModel;
  state.codexReasoningEffort = normalizedReasoning;
  if (profileId && modelProfileById(profileId)) {
    state.activeModelProfileId = profileId;
  }
  const profile = activeModelProfile();
  if (profile) {
    profile.provider = "codex";
    profile.endpoint = providerPresets.codex.endpoint;
    profile.model = normalizedModel;
    profile.reasoningEffort = normalizedReasoning;
  }
  ["apiProvider", "apiEndpoint", "apiModel", "codexReasoningEffort"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = state[id] ?? "";
  });
  apiAvailability = { status: "unknown", message: "已切换 Codex 模型或推理等级，请重新做真实连通测试。" };
  renderModelControls();
  updateGenerationSettingsSummary();
  persist();
}

function applyCodexPreset(presetId) {
  const preset = codexPresetOptions.find((item) => item.id === presetId);
  if (!preset) return;
  state.codexPresetId = preset.id;
  setCodexRuntime(preset.model, preset.reasoningEffort, preset.profileId);
}

function chooseCodexModel(model) {
  state.codexPresetId = "custom";
  setCodexRuntime(model, state.codexReasoningEffort || activeCodexReasoningEffort());
}

function recordAiCall(meta, profile, settings, usageContext = {}) {
  state.lastAiCall = {
    at: new Date().toISOString(),
    provider: meta?.provider || profile?.provider || "unknown",
    model: meta?.model || profile?.model || "",
    profileName: meta?.profileName || profile?.name || "",
    task: meta?.task || settings?.task || "api",
    taskLabel: meta?.taskLabel || settings?.label || "general",
    reasoningEffort: meta?.reasoningEffort || profile?.reasoningEffort || "",
    temperature: meta?.temperature ?? settings?.temperature,
    maxTokens: meta?.maxTokens ?? settings?.maxTokens,
    codexDefault: Boolean(meta?.codexDefault)
  };
  updateLastAiCallUi();
  if (usageContext.track !== false) {
    recordUsageEvent(buildUsageRecord({
      meta,
      profile,
      settings,
      ...usageContext
    }));
  }
}

function updateLastAiCallUi() {
  const target = $("#aiCallMeta");
  if (!target) return;
  const call = state.lastAiCall;
  if (!call) {
    target.textContent = "还没有调用记录。生成或测试后，这里会显示实际使用的服务和模型。";
    return;
  }
  const task = modelTaskOptions.find((item) => item.task === call.task)?.name || call.taskLabel || call.task;
  const model = call.codexDefault ? CODEX_RECOMMENDED_MODEL : (call.model || "未填写模型");
  const reasoning = call.provider === "codex" && call.reasoningEffort ? ` · ${codexReasoningLabel(call.reasoningEffort)}推理` : "";
  target.textContent = `上次调用：${task} · ${call.profileName || "未命名方案"} · ${call.provider} / ${model}${reasoning} · 最大输出 ${call.maxTokens || "-"}。`;
}

function loadAiTaskRecords() {
  try {
    const now = Date.now();
    const payload = JSON.parse(localStorage.getItem(AI_TASK_STORAGE_KEY) || "[]");
    if (!Array.isArray(payload)) return [];
    let changed = false;
    const records = payload
      .filter(Boolean)
      .map((record) => {
        const normalized = { ...record };
        if (normalized.status === "running") {
          normalized.status = "interrupted";
          normalized.finishedAt = normalized.finishedAt || now;
          normalized.error = normalized.error || "页面刷新、浏览器关闭或连接中断，任务结果未回到网页。";
          changed = true;
        }
        return normalized;
      })
      .slice(0, AI_TASK_RECORD_LIMIT);
    if (changed) localStorage.setItem(AI_TASK_STORAGE_KEY, JSON.stringify(records));
    return records;
  } catch {
    return [];
  }
}

function saveAiTaskRecords() {
  try {
    localStorage.setItem(AI_TASK_STORAGE_KEY, JSON.stringify(aiTaskRecords.slice(0, AI_TASK_RECORD_LIMIT)));
  } catch {
    // AI task history is diagnostic only; writing should continue even if storage is full.
  }
}

function startAiTaskRecord(meta, profile, settings, inputText = "") {
  const startedAt = Date.now();
  const record = {
    id: `ai-task-${startedAt}-${Math.random().toString(36).slice(2, 8)}`,
    status: "running",
    startedAt,
    at: new Date(startedAt).toISOString(),
    projectTitle: state.projectTitle || state.quickTitle || "未命名",
    task: settings?.task || meta?.task || "api",
    taskLabel: meta?.taskLabel || settings?.label || "",
    provider: meta?.provider || profile?.provider || "unknown",
    model: meta?.model || profile?.model || "",
    profileName: meta?.profileName || profile?.name || "",
    reasoningEffort: meta?.reasoningEffort || profile?.reasoningEffort || "",
    maxTokens: meta?.maxTokens ?? settings?.maxTokens,
    promptChars: String(inputText || "").replace(/\s/g, "").length,
    attempt: 1
  };
  aiTaskRecords = [record, ...aiTaskRecords.filter((item) => item.id !== record.id)].slice(0, AI_TASK_RECORD_LIMIT);
  saveAiTaskRecords();
  renderAiTaskStatus();
  return record.id;
}

function updateAiTaskRecord(id, patch = {}) {
  if (!id) return;
  aiTaskRecords = aiTaskRecords.map((record) => record.id === id ? { ...record, ...patch } : record);
  saveAiTaskRecords();
  renderAiTaskStatus();
}

function finishAiTaskRecord(id, status, patch = {}) {
  if (!id) return;
  const record = aiTaskRecords.find((item) => item.id === id);
  const finishedAt = Date.now();
  updateAiTaskRecord(id, {
    status,
    finishedAt,
    durationMs: record?.startedAt ? finishedAt - Number(record.startedAt) : 0,
    ...patch
  });
}

function formatAiTaskDuration(ms) {
  const seconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
  if (!seconds) return "0秒";
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}分${rest}秒` : `${minutes}分钟`;
}

function preAiSaveStatusText() {
  const savedAt = String(state.lastPreAiSaveAt || "").trim();
  if (!savedAt) return "";
  const savedDate = new Date(savedAt);
  const savedTime = Number.isNaN(savedDate.getTime()) ? savedAt : savedDate.toLocaleString("zh-CN", { hour12: false });
  const task = usageTaskName(state.lastPreAiSaveTask || "ai", "");
  const statusMap = {
    "project-library": "已写入项目库",
    "browser-only": "仅浏览器保存",
    browser: "已保存到浏览器"
  };
  const status = statusMap[state.lastPreAiSaveStatus] || "已记录";
  const error = state.lastPreAiSaveError ? `；项目库异常：${String(state.lastPreAiSaveError).slice(0, 40)}` : "";
  return ` · 发送前快照：${task} ${status} ${savedTime}${error}`;
}

function renderAiTaskStatus() {
  const target = $("#aiTaskStatus");
  if (!target) return;
  const latest = aiTaskRecords[0];
  const serverLatest = Array.isArray(serverAiTaskSnapshot?.records) ? serverAiTaskSnapshot.records[0] : null;
  const serverHint = serverLatest
    ? ` · 服务端最近：${usageTaskName(serverLatest.task, serverLatest.taskLabel)} ${serverLatest.status === "success" ? "完成" : "失败"}`
    : "";
  const preSaveHint = preAiSaveStatusText();
  if (!latest) {
    target.dataset.status = "idle";
    target.textContent = serverLatest
      ? `AI任务：本机暂无网页记录${serverHint}${preSaveHint}。`
      : `AI任务：暂无运行记录${preSaveHint}。`;
    return;
  }
  const name = usageTaskName(latest.task, latest.taskLabel);
  const model = latest.model ? ` · ${latest.model}` : "";
  target.dataset.status = latest.status || "idle";
  if (latest.status === "running") {
    target.textContent = `AI任务运行中：${name}${model} · 已发送约${latest.promptChars || 0}字${preSaveHint}。`;
    return;
  }
  if (latest.status === "success") {
    target.textContent = `上次AI完成：${name} · 用时${formatAiTaskDuration(latest.durationMs)}${serverHint}${preSaveHint}。`;
    return;
  }
  if (latest.status === "interrupted") {
    target.textContent = `上次AI可能中断：${name}。刷新或断电前任务未返回，建议查看对应输出区或重试${serverHint}${preSaveHint}。`;
    return;
  }
  target.textContent = `上次AI失败：${name} · ${String(latest.error || "未知错误").slice(0, 60)}${serverHint}${preSaveHint}`;
}

async function refreshServerAiTasks() {
  if (location.protocol === "file:") return;
  try {
    serverAiTaskSnapshot = await appFetch("/api/ai/tasks");
    mergeServerAiTasksIntoUsage(serverAiTaskSnapshot?.records);
  } catch {
    serverAiTaskSnapshot = null;
  }
  renderAiTaskStatus();
}

function loadUsageRecords() {
  try {
    const payload = JSON.parse(localStorage.getItem(USAGE_STORAGE_KEY) || "[]");
    if (!Array.isArray(payload)) return [];
    const normalized = normalizeUsageRecords(payload.filter(Boolean));
    if (normalized.changed) {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(normalized.records.slice(-USAGE_RECORD_LIMIT)));
    }
    return normalized.records;
  } catch {
    return [];
  }
}

function normalizeUsageRecords(records = []) {
  const result = [];
  const legacyChapterHistory = [];
  let changed = false;
  records.forEach((record) => {
    if (record?.origin === "history" && record?.task === "chapterHistory") {
      legacyChapterHistory.push(record);
      changed = true;
      return;
    }
    result.push(record);
  });
  if (legacyChapterHistory.length && !result.some((record) => record.task === CORPUS_SCALE_TASK && record.origin === "scale")) {
    const outputTokens = legacyChapterHistory.reduce((sum, record) => sum + Number(record.outputTokens || 0), 0);
    const importedTotal = legacyChapterHistory.reduce((sum, record) => sum + Number(record.totalTokens || 0), 0);
    result.push({
      id: `usage-corpus-legacy-${Date.now()}`,
      at: new Date().toISOString(),
      projectTitle: legacyChapterHistory[0]?.projectTitle || "未命名",
      provider: "project-scale",
      model: "corpus",
      profileName: "正文库规模",
      task: CORPUS_SCALE_TASK,
      taskLabel: "正文库规模（由旧历史正文转换）",
      status: "success",
      inputTokens: 0,
      outputTokens,
      totalTokens: 0,
      cachedTokens: 0,
      usageSource: "scale",
      origin: "scale",
      excludedFromTotals: true,
      legacyRecordCount: legacyChapterHistory.length,
      hypotheticalTotalTokens: importedTotal,
      historyKey: `corpus-scale:legacy:${shortHash(String(importedTotal))}`,
      durationMs: 0,
      error: "旧版正文库历史正文已自动转为规模参考，不计入总消耗。",
      codexDefault: false
    });
  }
  return { records: result, changed };
}

function saveUsageRecords() {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usageRecords.slice(-USAGE_RECORD_LIMIT)));
  } catch {
    // localStorage may be full or blocked; usage stats should never break writing.
  }
}

function loadLastUsageImportBatch() {
  try {
    const payload = JSON.parse(localStorage.getItem(USAGE_LAST_IMPORT_KEY) || "null");
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function saveLastUsageImportBatch(batch) {
  lastUsageImportBatch = batch || null;
  try {
    if (lastUsageImportBatch) {
      localStorage.setItem(USAGE_LAST_IMPORT_KEY, JSON.stringify(lastUsageImportBatch));
    } else {
      localStorage.removeItem(USAGE_LAST_IMPORT_KEY);
    }
  } catch {
    // Usage import metadata is optional.
  }
}

function estimateTextTokens(text) {
  const value = String(text || "");
  if (!value) return 0;
  const cjk = (value.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  const asciiWords = (value.match(/[A-Za-z0-9_]+/g) || []).reduce((sum, item) => sum + item.length, 0);
  const whitespace = (value.match(/\s/g) || []).length;
  const other = Math.max(0, value.length - cjk - asciiWords - whitespace);
  return Math.max(1, Math.ceil(cjk + asciiWords / 4 + whitespace / 6 + other / 2));
}

function firstUsageNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

function extractActualUsageTokens(raw, meta = {}) {
  const candidates = [
    meta?.usage,
    raw?.usage,
    raw?.usageMetadata,
    raw?.response?.usage,
    raw?.data?.usage
  ].filter(Boolean);
  for (const usage of candidates) {
    const input = firstUsageNumber(
      usage.input_tokens ??
      usage.prompt_tokens ??
      usage.promptTokenCount ??
      usage.inputTokens ??
      usage.cache_read_input_tokens ??
      usage.input_token_count
    );
    const output = firstUsageNumber(
      usage.output_tokens ??
      usage.completion_tokens ??
      usage.candidatesTokenCount ??
      usage.outputTokens ??
      usage.output_token_count
    );
    const cached = firstUsageNumber(
      usage.cached_tokens,
      usage.cachedTokens,
      usage.cachedContentTokenCount,
      usage.cache_read_input_tokens,
      usage.prompt_tokens_details?.cached_tokens,
      usage.input_tokens_details?.cached_tokens,
      usage.input_token_details?.cached_tokens
    );
    const total = firstUsageNumber(
      usage.total_tokens ??
      usage.totalTokenCount ??
      usage.totalTokens ??
      usage.total_token_count
    );
    if (input || output || total || cached) {
      return {
        input: Math.max(0, Math.round(input || Math.max(0, total - output))),
        output: Math.max(0, Math.round(output || Math.max(0, total - input))),
        cached: Math.max(0, Math.round(cached)),
        total: Math.max(0, Math.round(total || input + output))
      };
    }
  }
  return null;
}

function usageTaskName(task, fallback = "") {
  const mapped = modelTaskOptions.find((item) => item.task === task)?.name;
  if (mapped) return mapped;
  const extra = {
    dashboard: "总览分析",
    manuscript: "正文库修订",
    chapterHistory: "正文库历史正文",
    corpusScale: "正文库规模",
    api: "AI接口直接生成",
    test: "AI接口测试"
  };
  return extra[task] || fallback || task || "未知功能";
}

function usageProjectTitle(project) {
  return String(project?.projectTitle || project?.quickTitle || project?.title || "未命名").trim() || "未命名";
}

function usageProjectId(project, fallback = "") {
  return sanitizeFileName(String(project?.projectId || fallback || usageProjectTitle(project) || "project"));
}

function usageText(value) {
  return String(value || "").trim();
}

function usageJoin(parts) {
  return (parts || []).map(usageText).filter(Boolean).join("\n\n---\n\n");
}

function usageClip(value, maxLength = 6000, label = "内容") {
  const text = usageText(value);
  if (!text || text.length <= maxLength) return text;
  return trimHeadTailForPrompt(text, maxLength, label);
}

function projectChaptersForUsage(project) {
  return Array.isArray(project?.chapters)
    ? project.chapters.slice().sort((a, b) => Number(a?.number || 0) - Number(b?.number || 0))
    : [];
}

function projectChapterWordsForUsage(chapter) {
  return String(chapter?.draft || "").replace(/\s/g, "").length;
}

function projectChapterLabelForUsage(chapter) {
  return `第${chapter?.number || "?"}章 ${chapter?.title || "未命名"}`.trim();
}

function projectChapterExcerptForUsage(chapter, maxLength = 2200) {
  const body = usageClip(chapter?.draft || "", maxLength, projectChapterLabelForUsage(chapter));
  const notes = usageText(chapter?.notes);
  return usageJoin([
    `# ${projectChapterLabelForUsage(chapter)}`,
    notes ? `备注：${usageClip(notes, 500, "章节备注")}` : "",
    body
  ]);
}

function projectChapterIndexForUsage(project, limit = 120) {
  const chapters = projectChaptersForUsage(project).filter((chapter) => projectChapterWordsForUsage(chapter) > 0);
  const rows = chapters.slice(-limit).map((chapter) => {
    const notes = usageText(chapter.notes);
    return `第${chapter.number || "?"}章：${chapter.title || "未命名"}，${projectChapterWordsForUsage(chapter)}字${notes ? `，备注：${compactLine(notes, 120)}` : ""}`;
  });
  return rows.join("\n");
}

function projectRecentChaptersForUsage(project, count = 2, maxLength = 5200) {
  const chapters = projectChaptersForUsage(project).filter((chapter) => projectChapterWordsForUsage(chapter) > 0).slice(-count);
  return chapters.map((chapter) => projectChapterExcerptForUsage(chapter, Math.max(1200, Math.floor(maxLength / Math.max(1, chapters.length))))).join("\n\n---\n\n");
}

function buildCorpusScale(project = state, projectId = "") {
  const drafted = projectChaptersForUsage(project).filter((chapter) => projectChapterWordsForUsage(chapter) > 0);
  const latest = drafted[drafted.length - 1];
  const outputTokens = drafted.reduce((sum, chapter) => {
    return sum + estimateTextTokens(`# ${projectChapterLabelForUsage(chapter)}\n\n${chapter.draft || ""}`);
  }, 0);
  const chapterWords = drafted.reduce((sum, chapter) => sum + projectChapterWordsForUsage(chapter), 0);
  return {
    projectId: projectId || usageProjectId(project),
    projectTitle: usageProjectTitle(project),
    chapters: drafted.length,
    chapterWords,
    outputTokens,
    latestChapter: latest ? projectChapterLabelForUsage(latest) : "暂无",
    updatedAt: project?.updatedAt || ""
  };
}

function corpusScaleHistoryKey(scale) {
  return `corpus-scale:${scale?.projectId || scale?.projectTitle || "project"}`;
}

function projectInfoForUsage(project) {
  return [
    `作品名：${usageProjectTitle(project)}`,
    project?.projectMode ? `模式：${project.projectMode}` : "",
    project?.genre ? `类型：${project.genre}` : "",
    project?.platform ? `平台：${project.platform}` : "",
    project?.corePromise ? `核心卖点：${usageClip(project.corePromise, 900, "核心卖点")}` : "",
    project?.updateFrequency ? `更新频率：${project.updateFrequency}` : "",
    project?.targetWords ? `每章字数：${project.targetWords}` : ""
  ].filter(Boolean).join("\n");
}

function usageHistoryKey(projectId, key, inputText, outputText) {
  return `history:${projectId || "project"}:${key}:${shortHash(`${inputText || ""}\n---\n${outputText || ""}`)}`;
}

function createHistoricalCandidate(project, projectId, key, task, label, inputParts, outputText) {
  const output = usageText(outputText);
  if (output.length < 12) return null;
  const input = usageJoin(inputParts);
  return {
    project,
    projectId,
    key,
    task,
    label,
    inputText: input,
    text: output,
    historyKey: usageHistoryKey(projectId, key, input, output)
  };
}

function buildHistoricalUsageCandidates(project = state, options = {}) {
  const projectId = usageProjectId(project, options.projectId || state.projectId);
  const includeChapterCost = Boolean(options.includeChapterCost);
  const info = projectInfoForUsage(project);
  const outline = usageText(project.projectOutline || project.outlineResult);
  const outlineCheck = usageText(project.outlineCheckResult);
  const analysis = usageText(project.quickAnalysis);
  const planning = usageText(project.quickBrief);
  const evidence = usageText(project.outlineEvidenceCards);
  const chapterIndex = projectChapterIndexForUsage(project, 160);
  const recent = projectRecentChaptersForUsage(project, 2, 6200);
  const candidates = [];
  const add = (...args) => {
    const candidate = createHistoricalCandidate(project, projectId, ...args);
    if (candidate) candidates.push(candidate);
  };

  add("project-outline", "outline", "项目大纲历史内容", [info, evidence, outlineCheck, chapterIndex, recent], outline);
  add("outline-check", "outline", "检查大纲历史结果", [info, outline, evidence, chapterIndex, analysis], outlineCheck);
  add("analysis", "analysis", "小说记忆卡历史结果", [info, outline, evidence || chapterIndex, recent], analysis);
  add("planning", "planning", "章节方向历史结果", [info, outline, analysis, recent], planning);
  add("quick-output", "quick", "生成正文历史结果", [info, outline, analysis, planning, recent], project.quickOutput);
  add("short-review", "shortReview", "短篇检查历史结果", [info, outline, project.quickOutput, project.shortSourceText], project.shortReviewResult);
  add("polish-output", "polish", "正文润色历史结果", [info, project.polishSource, project.polishReviewContext], project.polishOutput);
  add("ending-library", "ending", "完结线索扫描历史结果", [info, outline, analysis, evidence || chapterIndex], project.endingLibraryScanResult);
  add("ending-diagnosis", "ending", "完结诊断历史结果", [info, outline, analysis, project.endingLibraryScanResult], project.endingDiagnosis);
  add("ending-payoff", "ending", "伏笔回收历史结果", [info, outline, analysis, project.endingLibraryScanResult], project.endingPayoffResult);
  add("ending-reverse", "ending", "倒排完结大纲历史结果", [info, outline, analysis, project.endingPayoffResult], project.endingReverseOutline);
  add("ending-readiness", "ending", "完结检查历史结果", [info, outline, analysis, project.endingReverseOutline], project.endingReadinessResult);
  add("ai-output", "api", "AI接口历史输出", [info, project.aiPrompt, outline, analysis], project.aiOutput);

  if (includeChapterCost) {
    const drafted = projectChaptersForUsage(project).filter((chapter) => projectChapterWordsForUsage(chapter) > 0);
    for (let index = 0; index < drafted.length; index += 2) {
      const chunk = drafted.slice(index, index + 2);
      const first = chunk[0];
      const last = chunk[chunk.length - 1];
      const previous = drafted.slice(Math.max(0, index - 2), index)
        .map((chapter) => projectChapterExcerptForUsage(chapter, 1800))
        .join("\n\n---\n\n");
      const output = chunk.map((chapter) => `# ${projectChapterLabelForUsage(chapter)}\n\n${chapter.draft || ""}`).join("\n\n---\n\n");
      add(
        `chapters-${first?.number || index + 1}-${last?.number || index + chunk.length}`,
        "chapterHistory",
        `正文库假设生成 第${first?.number || "?"}-${last?.number || "?"}章`,
        [info, outline, analysis, planning, previous || recent],
        output
      );
    }
  }

  return candidates;
}

function buildUsageImportPreview(project = state, options = {}) {
  const projectId = usageProjectId(project, options.projectId || state.projectId);
  const includeChapterCost = Boolean(options.includeChapterCost);
  const candidates = buildHistoricalUsageCandidates(project, { projectId, includeChapterCost });
  const chapterCostCandidates = buildHistoricalUsageCandidates(project, { projectId, includeChapterCost: true })
    .filter((candidate) => candidate.task === "chapterHistory");
  const existing = new Set(usageRecords.map((record) => record.historyKey).filter(Boolean));
  const fresh = candidates.filter((candidate) => !existing.has(candidate.historyKey));
  const drafted = projectChaptersForUsage(project).filter((chapter) => projectChapterWordsForUsage(chapter) > 0);
  const summarizeCandidates = (items) => items.reduce((acc, candidate) => {
    const input = estimateTextTokens(candidate.inputText);
    const output = estimateTextTokens(candidate.text);
    acc.input += input;
    acc.output += output;
    acc.total += input + output;
    const key = candidate.task || "api";
    if (!acc.byTask[key]) acc.byTask[key] = { task: key, label: usageTaskName(key, candidate.label), count: 0, total: 0 };
    acc.byTask[key].count += 1;
    acc.byTask[key].total += input + output;
    return acc;
  }, { input: 0, output: 0, total: 0, byTask: {} });
  const totals = summarizeCandidates(fresh);
  const allTotals = summarizeCandidates(candidates);
  const chapterCostTotals = summarizeCandidates(chapterCostCandidates);
  const corpusScale = buildCorpusScale(project, projectId);
  return {
    project,
    projectId,
    projectTitle: usageProjectTitle(project),
    source: options.source || "project",
    candidates,
    fresh,
    duplicateCount: candidates.length - fresh.length,
    includeChapterCost,
    corpusScale,
    chapters: drafted.length,
    chapterWords: drafted.reduce((sum, chapter) => sum + projectChapterWordsForUsage(chapter), 0),
    outlineWords: usageText(project.projectOutline || project.outlineResult).replace(/\s/g, "").length,
    analysisWords: usageText(project.quickAnalysis).replace(/\s/g, "").length,
    planningWords: usageText(project.quickBrief).replace(/\s/g, "").length,
    totals,
    allTotals,
    chapterCostTotals
  };
}

function buildUsageRecord(context = {}) {
  const meta = context.meta || {};
  const profile = context.profile || {};
  const settings = context.settings || {};
  const promptText = String(context.inputText ?? context.prompt ?? "");
  const content = String(context.content ?? "");
  const actual = extractActualUsageTokens(context.raw, meta);
  const inputTokens = actual ? actual.input : estimateTextTokens(promptText);
  const outputTokens = actual ? actual.output : estimateTextTokens(content);
  return {
    id: `usage-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    projectTitle: state.projectTitle || "未命名",
    provider: meta.provider || profile.provider || "unknown",
    model: meta.model || profile.model || "",
    profileName: meta.profileName || profile.name || "",
    task: meta.task || settings.task || activePanelId() || "api",
    taskLabel: meta.taskLabel || settings.label || "",
    status: context.status || "success",
    inputTokens,
    outputTokens,
    totalTokens: actual ? actual.total : inputTokens + outputTokens,
    cachedTokens: actual?.cached || 0,
    usageSource: actual ? "actual" : "estimated",
    origin: context.origin || "live",
    durationMs: Math.max(0, Math.round(Number(context.durationMs || 0))),
    error: context.error ? String(context.error).slice(0, 260) : "",
    codexDefault: Boolean(meta.codexDefault),
    serverTaskId: context.serverTaskId || context.serverTask?.id || "",
    historyKey: context.historyKey || (context.serverTaskId || context.serverTask?.id ? `server-task:${context.serverTaskId || context.serverTask?.id}` : "")
  };
}

function normalizeServerTaskDate(value) {
  const text = String(value || "").trim();
  if (!text) return new Date().toISOString();
  const normalized = text.includes("T") ? text : text.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function serverTaskToUsageRecord(task) {
  if (!task?.id) return null;
  const inputTokens = Number(task.inputTokens || 0) || estimateTextTokens("x".repeat(Number(task.promptChars || 0) + Number(task.systemPromptChars || 0)));
  const outputTokens = Number(task.outputTokens || 0) || estimateTextTokens("x".repeat(Number(task.outputChars || 0)));
  return {
    id: `usage-${task.id}`,
    at: normalizeServerTaskDate(task.finishedAt || task.startedAt),
    projectTitle: state.projectTitle || "未命名",
    provider: task.provider || task.rawProvider || "unknown",
    model: task.model || "",
    profileName: task.profileName || "",
    task: task.task || "api",
    taskLabel: task.taskLabel || "",
    status: task.status === "failed" ? "failed" : "success",
    inputTokens,
    outputTokens,
    totalTokens: Number(task.totalTokens || 0) || inputTokens + outputTokens,
    cachedTokens: 0,
    usageSource: task.usageSource || "server-estimated",
    origin: "server",
    historyKey: `server-task:${task.id}`,
    serverTaskId: task.id,
    durationMs: Math.max(0, Math.round(Number(task.durationMs || 0))),
    error: task.error ? String(task.error).slice(0, 260) : "",
    codexDefault: task.endpointKind === "codex"
  };
}

function mergeServerAiTasksIntoUsage(records) {
  if (!Array.isArray(records) || !records.length) return 0;
  const existing = new Set(usageRecords.flatMap((record) => [
    record.historyKey,
    record.serverTaskId ? `server-task:${record.serverTaskId}` : ""
  ]).filter(Boolean));
  const imported = [];
  records.forEach((task) => {
    const historyKey = task?.id ? `server-task:${task.id}` : "";
    if (!historyKey || existing.has(historyKey)) return;
    const record = serverTaskToUsageRecord(task);
    if (!record) return;
    imported.push(record);
    existing.add(historyKey);
  });
  if (!imported.length) return 0;
  usageRecords.push(...imported);
  if (usageRecords.length > USAGE_RECORD_LIMIT) {
    usageRecords = usageRecords.slice(-USAGE_RECORD_LIMIT);
  }
  saveUsageRecords();
  renderUsageStats();
  return imported.length;
}

function historicalUsageCandidates() {
  syncFields();
  return buildHistoricalUsageCandidates(state, { projectId: state.projectId || state.projectTitle });
}

function buildHistoricalUsageRecord(candidate, index = 0, batchId = "") {
  const inputTokens = estimateTextTokens(candidate.inputText);
  const outputTokens = estimateTextTokens(candidate.text);
  const historyKey = candidate.historyKey || usageHistoryKey(candidate.projectId, candidate.key, candidate.inputText, candidate.text);
  return {
    id: `usage-history-${shortHash(historyKey)}`,
    at: new Date(Date.now() - index * 1000).toISOString(),
    projectTitle: usageProjectTitle(candidate.project || state),
    provider: "history",
    model: "estimated",
    profileName: "历史回填估算",
    task: candidate.task || "api",
    taskLabel: candidate.label || "",
    status: "success",
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    cachedTokens: 0,
    usageSource: "estimated",
    origin: "history",
    historyKey,
    historyBatchId: batchId,
    sourceAccuracy: "history-estimate",
    durationMs: 0,
    error: "",
    codexDefault: false
  };
}

function currentUsageImportOptions() {
  return {
    includeChapterCost: Boolean($("#includeCorpusGenerationCost")?.checked)
  };
}

function buildCorpusScaleRecord(scale, batchId = "") {
  const historyKey = corpusScaleHistoryKey(scale);
  return {
    id: `usage-corpus-${shortHash(historyKey)}`,
    at: new Date().toISOString(),
    projectTitle: scale.projectTitle || "未命名",
    provider: "project-scale",
    model: "corpus",
    profileName: "正文库规模",
    task: CORPUS_SCALE_TASK,
    taskLabel: "正文库规模",
    status: "success",
    inputTokens: 0,
    outputTokens: Number(scale.outputTokens || 0),
    totalTokens: 0,
    cachedTokens: 0,
    usageSource: "scale",
    origin: "scale",
    excludedFromTotals: true,
    historyKey,
    historyBatchId: batchId,
    sourceAccuracy: "corpus-scale",
    corpusChapters: Number(scale.chapters || 0),
    corpusWords: Number(scale.chapterWords || 0),
    latestChapter: scale.latestChapter || "",
    durationMs: 0,
    error: "正文库规模只用于展示已有正文体量，默认不计入总 Token。",
    codexDefault: false
  };
}

function upsertCorpusScaleRecord(scale, batchId = "") {
  if (!scale || !scale.chapters) return null;
  const historyKey = corpusScaleHistoryKey(scale);
  const record = buildCorpusScaleRecord(scale, batchId);
  const index = usageRecords.findIndex((item) => item.historyKey === historyKey || (item.task === CORPUS_SCALE_TASK && item.projectTitle === record.projectTitle));
  if (index >= 0) {
    usageRecords[index] = { ...usageRecords[index], ...record };
  } else {
    usageRecords.push(record);
  }
  return record;
}

function importUsagePreview(preview) {
  if (!preview?.fresh?.length && !preview?.corpusScale?.chapters) {
    setStatus(preview?.candidates?.length ? "这些历史估算已经导入过，没有新增记录" : "当前项目还没有可导入的历史生成内容");
    renderUsageStats();
    return;
  }
  const batchId = `usage-import-${Date.now()}-${shortHash(preview.projectId || preview.projectTitle)}`;
  const existing = new Set(usageRecords.map((record) => record.historyKey).filter(Boolean));
  const records = preview.fresh
    .map((candidate, index) => buildHistoricalUsageRecord(candidate, index, batchId))
    .filter((record) => !existing.has(record.historyKey));
  const scaleRecord = upsertCorpusScaleRecord(preview.corpusScale, batchId);
  if (!records.length && !scaleRecord) {
    setStatus("这些历史估算已经导入过，没有新增记录");
    renderUsageStats();
    return;
  }
  usageRecords.push(...records);
  if (usageRecords.length > USAGE_RECORD_LIMIT) {
    usageRecords = usageRecords.slice(-USAGE_RECORD_LIMIT);
  }
  saveLastUsageImportBatch({
    id: batchId,
    at: new Date().toISOString(),
    projectId: preview.projectId,
    projectTitle: preview.projectTitle,
    count: records.length,
    totalTokens: records.reduce((sum, record) => sum + Number(record.totalTokens || 0), 0)
  });
  saveUsageRecords();
  usageRange = "all";
  usageImportPreview = buildUsageImportPreview(preview.project, {
    source: preview.source,
    projectId: preview.projectId,
    includeChapterCost: preview.includeChapterCost
  });
  renderUsageStats();
  renderUsageImportPreview(usageImportPreview);
  setStatus(records.length
    ? `已导入 ${records.length} 条历史回填估算记录，正文库规模已更新`
    : "历史估算没有新增记录，正文库规模已更新");
}

function importHistoricalUsageRecords() {
  const preview = buildUsageImportPreview(state, { source: "current", projectId: state.projectId || state.projectTitle, ...currentUsageImportOptions() });
  usageImportPreview = preview;
  renderUsageImportPreview(preview);
  importUsagePreview(preview);
}

async function loadUsageProjectOptions() {
  const select = $("#usageProjectImportSelect");
  if (!select) return;
  const previous = select.value;
  select.innerHTML = `<option value="">正在读取项目库...</option>`;
  try {
    const data = await appFetch("/api/projects");
    const projects = data.projects || [];
    if (!projects.length) {
      select.innerHTML = `<option value="">项目库暂无项目</option>`;
      return;
    }
    select.innerHTML = projects.map((project) => `<option value="${escapeAttr(project.id)}">${escapeHtml(project.title || project.id)}</option>`).join("");
    if (previous && projects.some((project) => project.id === previous)) select.value = previous;
  } catch (error) {
    select.innerHTML = `<option value="">读取失败</option>`;
    setStatus("读取项目库失败：" + error.message);
  }
}

function renderUsageImportPreview(preview = usageImportPreview) {
  const target = $("#usageImportPreview");
  if (!target) return;
  const undo = $("#undoUsageImportBtn");
  if (undo) {
    undo.disabled = !lastUsageImportBatch?.id;
    undo.textContent = lastUsageImportBatch?.count ? `撤销上次导入（${lastUsageImportBatch.count}条）` : "撤销上次导入";
  }
  const confirmBtn = $("#confirmUsageProjectImportBtn");
  if (confirmBtn) confirmBtn.disabled = !preview?.fresh?.length && !preview?.corpusScale?.chapters;
  if (!preview) {
    target.innerHTML = `<strong>历史回填估算</strong><span>选择项目后先预览，确认无误再导入。历史估算用于看趋势，不等同于平台账单。</span>`;
    return;
  }
  const topTasks = Object.values((preview.fresh.length ? preview.totals : preview.allTotals).byTask || {})
    .sort((a, b) => b.total - a.total)
    .slice(0, 4)
    .map((item) => `${escapeHtml(item.label)} ${formatUsageNumber(item.total)}`)
    .join(" · ");
  const scale = preview.corpusScale || {};
  const chapterCostText = preview.includeChapterCost
    ? `已计入假设生成成本 ${formatUsageNumber(preview.chapterCostTotals.total)} Token`
    : `正文库规模不计入总消耗；如按 AI 假设生成约 ${formatUsageNumber(preview.chapterCostTotals.total)} Token`;
  target.innerHTML = `
    <div class="usage-import-preview-head">
      <strong>${escapeHtml(preview.projectTitle)}</strong>
      <span>${preview.fresh.length ? "可导入" : "无新增"} ${formatUsageNumber(preview.fresh.length)} 条 · 重复 ${formatUsageNumber(preview.duplicateCount)} 条</span>
    </div>
    <div class="usage-import-preview-grid">
      <span>章节 ${formatUsageNumber(preview.chapters)} 章</span>
      <span>正文 ${formatUsageNumber(preview.chapterWords)} 字</span>
      <span>大纲 ${formatUsageNumber(preview.outlineWords)} 字</span>
      <span>记忆卡 ${formatUsageNumber(preview.analysisWords)} 字</span>
      <span>方向 ${formatUsageNumber(preview.planningWords)} 字</span>
      <span>正文库规模 ${formatUsageNumber(scale.chapters)}章 / ${formatUsageNumber(scale.chapterWords)}字 / 约${formatUsageNumber(scale.outputTokens)}输出Token</span>
      <span>${escapeHtml(chapterCostText)}</span>
      <span>AI历史估算 ${formatUsageNumber(preview.allTotals.total)} Token</span>
      <span>本次可导入 ${formatUsageNumber(preview.totals.total)} Token</span>
    </div>
    <p>${topTasks ? `主要消耗：${topTasks}。` : "没有可估算的历史内容。"}</p>
  `;
}

async function previewUsageProjectImport() {
  const select = $("#usageProjectImportSelect");
  const id = select?.value;
  if (!id) {
    setStatus("请先选择项目库里的项目");
    return;
  }
  const project = await appFetch(`/api/projects/${encodeURIComponent(id)}`);
  usageImportPreview = buildUsageImportPreview(project, { source: "project", projectId: id, ...currentUsageImportOptions() });
  renderUsageImportPreview(usageImportPreview);
  setStatus(`已生成 ${usageImportPreview.projectTitle} 的历史估算预览`);
}

function confirmUsageProjectImport() {
  if (!usageImportPreview) {
    setStatus("请先预览项目库历史估算");
    return;
  }
  importUsagePreview(usageImportPreview);
}

function undoLastUsageImport() {
  if (!lastUsageImportBatch?.id) {
    setStatus("没有可撤销的历史导入批次");
    return;
  }
  if (!confirm(`撤销上次导入的 ${lastUsageImportBatch.count || 0} 条历史估算记录？`)) return;
  const before = usageRecords.length;
  usageRecords = usageRecords.filter((record) => record.historyBatchId !== lastUsageImportBatch.id);
  const removed = before - usageRecords.length;
  saveUsageRecords();
  saveLastUsageImportBatch(null);
  renderUsageStats();
  renderUsageImportPreview(usageImportPreview);
  setStatus(`已撤销 ${removed} 条历史估算记录`);
}

function recordUsageEvent(record) {
  if (!record) return;
  usageRecords.push(record);
  if (usageRecords.length > USAGE_RECORD_LIMIT) {
    usageRecords = usageRecords.slice(-USAGE_RECORD_LIMIT);
  }
  saveUsageRecords();
  renderUsageStats();
}

function usageRangeCutoff(range = usageRange) {
  const now = Date.now();
  if (range === "24h") return now - 24 * 60 * 60 * 1000;
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function formatUsageNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function formatDuration(ms) {
  const seconds = Math.round(Number(ms || 0) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function usageSourceLabel(record) {
  if (record?.task === CORPUS_SCALE_TASK || record?.origin === "scale") return "规模参考";
  if (record?.origin === "history") return "历史回填";
  if (record?.origin === "server") return "服务端估算";
  return record?.usageSource === "actual" ? "真实统计" : "实时估算";
}

function usageRecordCountsTowardTotal(record) {
  if (!record) return false;
  if (record.excludedFromTotals) return false;
  if (record.task === CORPUS_SCALE_TASK || record.origin === "scale") return false;
  return true;
}

function latestCorpusScaleRecord() {
  return usageRecords
    .filter((record) => record.task === CORPUS_SCALE_TASK || record.origin === "scale")
    .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())[0] || null;
}

function filteredUsageRecords() {
  const cutoff = usageRangeCutoff();
  const task = $("#usageTaskFilter")?.value || "all";
  const provider = $("#usageProviderFilter")?.value || "all";
  return usageRecords.filter((record) => {
    const time = new Date(record.at || 0).getTime();
    if (cutoff && time < cutoff) return false;
    if (task !== "all" && record.task !== task) return false;
    if (provider !== "all" && record.provider !== provider) return false;
    return true;
  });
}

function renderUsageFilterOptions() {
  const taskSelect = $("#usageTaskFilter");
  const providerSelect = $("#usageProviderFilter");
  if (taskSelect) {
    const previous = taskSelect.value || "all";
    const seen = new Set(["all"]);
    const options = [`<option value="all">全部功能</option>`];
    modelTaskOptions.forEach((item) => {
      seen.add(item.task);
      options.push(`<option value="${escapeAttr(item.task)}">${escapeHtml(item.name)}</option>`);
    });
    usageRecords.filter(usageRecordCountsTowardTotal).forEach((record) => {
      if (seen.has(record.task)) return;
      seen.add(record.task);
      options.push(`<option value="${escapeAttr(record.task)}">${escapeHtml(usageTaskName(record.task, record.taskLabel))}</option>`);
    });
    taskSelect.innerHTML = options.join("");
    taskSelect.value = seen.has(previous) ? previous : "all";
  }
  if (providerSelect) {
    const previous = providerSelect.value || "all";
    const providers = Array.from(new Set(usageRecords.filter(usageRecordCountsTowardTotal).map((record) => record.provider || "unknown"))).sort();
    providerSelect.innerHTML = [
      `<option value="all">全部服务</option>`,
      ...providers.map((provider) => `<option value="${escapeAttr(provider)}">${escapeHtml(provider)}</option>`)
    ].join("");
    providerSelect.value = previous === "all" || providers.includes(previous) ? previous : "all";
  }
}

function renderUsageStats() {
  if (!$("#usageRequestCount")) return;
  renderUsageFilterOptions();
  document.querySelectorAll("[data-usage-range]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.usageRange === usageRange);
  });
  const records = filteredUsageRecords();
  const countedRecords = records.filter(usageRecordCountsTowardTotal);
  const savedCorpusScale = latestCorpusScaleRecord();
  const liveCorpusScale = buildCorpusScale(state, state.projectId || state.projectTitle);
  const corpusScale = liveCorpusScale?.chapters
    ? {
        ...savedCorpusScale,
        corpusChapters: liveCorpusScale.chapters,
        corpusWords: liveCorpusScale.chapterWords,
        outputTokens: liveCorpusScale.outputTokens,
        latestChapter: liveCorpusScale.latestChapter
      }
    : savedCorpusScale;
  const panel = $("#usage");
  const emptyState = $("#usageEmptyState");
  if (panel) panel.classList.toggle("usage-empty", !countedRecords.length && !corpusScale);
  if (emptyState) emptyState.hidden = Boolean(countedRecords.length || corpusScale);
  const totals = countedRecords.reduce((acc, record) => {
    acc.input += Number(record.inputTokens || 0);
    acc.output += Number(record.outputTokens || 0);
    acc.total += Number(record.totalTokens || 0);
    acc.duration += Number(record.durationMs || 0);
    acc.success += record.status === "success" ? 1 : 0;
    acc.failed += record.status === "failed" ? 1 : 0;
    acc.actual += record.usageSource === "actual" ? 1 : 0;
    acc.history += record.origin === "history" ? 1 : 0;
    acc.estimated += record.usageSource !== "actual" && record.origin !== "history" ? 1 : 0;
    const key = record.task || "api";
    if (!acc.byTask[key]) {
      acc.byTask[key] = { task: key, label: usageTaskName(key, record.taskLabel), requests: 0, input: 0, output: 0, total: 0, failed: 0 };
    }
    acc.byTask[key].requests += 1;
    acc.byTask[key].input += Number(record.inputTokens || 0);
    acc.byTask[key].output += Number(record.outputTokens || 0);
    acc.byTask[key].total += Number(record.totalTokens || 0);
    if (record.status === "failed") acc.byTask[key].failed += 1;
    return acc;
  }, { input: 0, output: 0, total: 0, duration: 0, success: 0, failed: 0, actual: 0, estimated: 0, history: 0, byTask: {} });
  const topTask = Object.values(totals.byTask).sort((a, b) => b.total - a.total)[0];
  setText("usageRequestCount", formatUsageNumber(countedRecords.length));
  setText("usageSuccessCount", `成功 ${formatUsageNumber(totals.success)} · 失败 ${formatUsageNumber(totals.failed)}`);
  setText("usageInputTokens", formatUsageNumber(totals.input));
  setText("usageOutputTokens", formatUsageNumber(totals.output));
  setText("usageTotalTokens", formatUsageNumber(totals.total));
  setText("usageActualRate", `真实 ${formatUsageNumber(totals.actual)} · 实时估算 ${formatUsageNumber(totals.estimated)} · 历史 ${formatUsageNumber(totals.history)}`);
  setText("usageAverageTokens", formatUsageNumber(countedRecords.length ? Math.round(totals.total / countedRecords.length) : 0));
  setText("usageAverageDuration", `平均耗时 ${formatDuration(countedRecords.length ? totals.duration / countedRecords.length : 0)}`);
  setText("usageTopTask", topTask ? topTask.label : "暂无");
  setText("usageTopTaskTokens", `${formatUsageNumber(topTask?.total || 0)} Token`);
  setText("usageCorpusScale", corpusScale ? `${formatUsageNumber(corpusScale.corpusChapters || 0)}章 / ${formatUsageNumber(corpusScale.corpusWords || 0)}字` : "暂无");
  setText("usageCorpusScaleHint", corpusScale
    ? `约 ${formatUsageNumber(corpusScale.outputTokens || 0)} 输出Token · 不计入总消耗`
    : "已有正文规模会单独显示，不计入总消耗");
  setText("usageSummaryText", countedRecords.length
    ? `当前筛选共 ${formatUsageNumber(countedRecords.length)} 次消耗记录，累计 ${formatUsageNumber(totals.total)} Token；主要消耗：${topTask ? `${topTask.label} ${formatUsageNumber(topTask.total)} Token` : "暂无"}。正文库规模单独展示，不计入总消耗。`
    : (usageRecords.length ? "当前筛选范围内暂无 AI 消耗记录；正文库规模会单独显示，不计入总消耗。" : "还没有调用记录。生成内容后会自动统计，也可以先从项目库导入历史回填估算。"));

  const taskRows = $("#usageTaskRows");
  if (taskRows) {
    const rows = Object.values(totals.byTask).sort((a, b) => b.total - a.total);
    taskRows.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.label)}</td>
        <td>${formatUsageNumber(row.requests)}</td>
        <td>${formatUsageNumber(row.input)}</td>
        <td>${formatUsageNumber(row.output)}</td>
        <td><strong>${formatUsageNumber(row.total)}</strong></td>
        <td>${formatUsageNumber(row.failed)}</td>
      </tr>
    `).join("") : `<tr><td colspan="6">暂无统计数据</td></tr>`;
  }
  const logRows = $("#usageLogRows");
  if (logRows) {
    logRows.innerHTML = countedRecords.slice().reverse().slice(0, 120).map((record) => {
      const time = new Date(record.at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      const model = record.codexDefault ? "Codex 默认" : (record.model || "未填写");
      return `
        <tr title="${escapeAttr(record.error || "")}">
          <td>${escapeHtml(time)}</td>
          <td>${escapeHtml(usageTaskName(record.task, record.taskLabel))}</td>
          <td>${escapeHtml(record.provider || "unknown")} / ${escapeHtml(model)}</td>
          <td>${formatUsageNumber(record.inputTokens)}</td>
          <td>${formatUsageNumber(record.outputTokens)}</td>
          <td><strong>${formatUsageNumber(record.totalTokens)}</strong></td>
          <td>${usageSourceLabel(record)}</td>
          <td>${record.status === "success" ? "成功" : "失败"}</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="8">暂无调用记录</td></tr>`;
  }
}

function exportUsageRecords() {
  const payload = {
    exportedAt: new Date().toISOString(),
    projectTitle: state.projectTitle || "未命名",
    records: usageRecords
  };
  downloadTextFile(JSON.stringify(payload, null, 2), `AI使用统计-${state.projectTitle || "未命名"}-${new Date().toISOString().slice(0, 10)}.json`);
}

function clearUsageRecords() {
  if (!confirm("清空使用统计？这不会删除小说项目，但会删除当前浏览器里的 Token 记录。")) return;
  usageRecords = [];
  saveUsageRecords();
  renderUsageStats();
  setStatus("使用统计已清空");
}

function renderThemeCards() {
  const root = $("#themeWall");
  if (!root) return;
  root.innerHTML = "";
  themeGroups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "theme-group";
    const cards = group.themes.map((theme) => {
      const active = theme.id === state.theme;
      return `
        <button
          class="theme-card ${active ? "is-active" : ""}"
          type="button"
          role="radio"
          aria-checked="${active ? "true" : "false"}"
          data-theme-id="${escapeAttr(theme.id)}"
          style="--swatch-primary: ${escapeAttr(theme.primary)}; --swatch-bg: ${escapeAttr(theme.background)}; --swatch-text: ${escapeAttr(theme.text)};"
        >
          <span class="theme-card-main">
            <strong>${escapeHtml(theme.name)}</strong>
            <small>可读性通过</small>
          </span>
          <span class="theme-swatch-row" aria-hidden="true">
            <span class="theme-swatch" style="background: ${escapeAttr(theme.primary)}"></span>
            <span class="theme-swatch" style="background: ${escapeAttr(theme.background)}"></span>
            <span class="theme-swatch" style="background: ${escapeAttr(theme.text)}"></span>
          </span>
          <span class="theme-card-meta">
            <span>主色 ${escapeHtml(theme.primary)}</span>
            <span>背景 ${escapeHtml(theme.background)}</span>
            <span>文字 ${escapeHtml(theme.text)}</span>
          </span>
        </button>
      `;
    }).join("");
    section.innerHTML = `
      <div class="theme-group-title">${escapeHtml(group.title)}</div>
      <div class="theme-card-grid">${cards}</div>
    `;
    root.appendChild(section);
  });
  updateThemeCurrentName(state.theme);
}

function selectTheme(themeId) {
  if (!themeIds.has(themeId)) return;
  state.theme = themeId;
  const input = $("#theme");
  if (input) input.value = themeId;
  applyTheme(themeId);
  renderThemeCards();
  closeThemeDrawer();
  persist();
}

function setStatus(message) {
  const saveState = $("#saveState");
  const quickStatus = $("#quickStatus");
  if (saveState) saveState.textContent = message;
  if (quickStatus) quickStatus.textContent = message;
  updateWorkbenchFocus();
}

function bindFields() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const handler = () => {
      const changed = syncField(id);
      if (!changed && id !== "quickSourceText") return;
      if (id === "projectMode") {
        updateProjectModeUi();
        updateMemorySummaryCards();
        updateWritingContextBoard();
      }
      if (id === "simpleMode") applySimpleMode();
      if (id === "creativeStrategy") {
        updateProjectModeUi();
        updateMemorySummaryCards();
        updateWritingContextBoard();
      }
      if (id === "theme") applyTheme(state.theme);
      if (id === "quickOutput") updateQuickOutputStats();
      if (id === "quickSourceText") updateQuickSourceSummary();
      if (id === "shortReviewResult") setShortReviewStatus(inferShortReviewStatus(state.shortReviewResult));
      if (id.startsWith("ending")) updateEndingUi();
      if (USAGE_ESTIMATE_FIELDS.has(id)) {
        markUsageEstimateDirty(`field:${id}`);
        deferUsageEstimate(`field:${id}`);
      }
      if (["projectOutline", "outlineResult", "quickAnalysis", "quickBrief"].includes(id)) {
        scheduleMemorySummaryUpdate();
      }
      if (["projectTitle", "targetWords", "economyMode", "quickDraftScope", "creativeStrategy", "projectMode", "endingStage"].includes(id)) {
        updateGenerationSettingsSummary();
        updateWorkbenchFocus();
      }
      if (["apiProvider", "apiEndpoint", "apiModel", "apiKey", "codexCommand", "codexProfile", "codexReasoningEffort", "apiSystemPrompt", "apiTemperature", "apiMaxTokens"].includes(id)) {
        if (["apiModel", "codexReasoningEffort"].includes(id)) state.codexPresetId = "custom";
        syncActiveModelProfileFromFields();
        renderModelProfileOptions();
        renderModelBindingControls();
        renderCodexRuntimeControls();
        updateGenerationSettingsSummary();
      }
      if (["smartAiSettings", "apiModel", "codexReasoningEffort", "apiTemperature", "apiMaxTokens"].includes(id)) updateApiHelp();
      schedulePersist();
      schedulePromptUpdate(activePanelId());
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
}

function activePanelId() {
  return document.querySelector("[data-panel].is-active")?.id || "dashboard";
}

function switchTab(id) {
  const previousPanel = activePanelId();
  if (id !== "manuscript") setChapterFocusMode(false);
  const simplePanel = id === "quick" || id === "advancedTools";
  document.body.dataset.mode = simplePanel ? "simple" : "advanced";
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === id);
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === id);
  });
  const advancedButton = $("#advancedToggleBtn");
  if (advancedButton) advancedButton.classList.toggle("is-active", advancedToolPanels.has(id));
  if (id === "manuscript") {
    if (previousPanel !== "manuscript") renderChapterLibrary();
    updateChapterResponsiveControls();
  }
  if (id === "usage") {
    renderUsageStats();
    renderUsageImportPreview();
    loadUsageProjectOptions();
  }
  if (id === "diagnosis") {
    renderRevisionTasks();
  }
  schedulePromptUpdate(id);
}

function setAdvancedVisible(visible) {
  state.advancedVisible = false;
  document.body.classList.remove("advanced-visible");
  const button = $("#advancedToggleBtn");
  if (button) button.textContent = "高级工具";
}

function renderPipeline() {
  const root = $("#pipelineGrid");
  if (!root) return;
  root.innerHTML = "";
  state.pipeline.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "pipeline-item";
    row.innerHTML = `
      <input aria-label="章节" value="${escapeAttr(item.chapter)}" data-pipeline="${index}" data-key="chapter" />
      <input aria-label="推进" value="${escapeAttr(item.movement)}" data-pipeline="${index}" data-key="movement" placeholder="本章推进" />
      <input aria-label="读者奖励" value="${escapeAttr(item.reward)}" data-pipeline="${index}" data-key="reward" placeholder="读者奖励" />
      <select aria-label="状态" data-pipeline="${index}" data-key="status">
        ${["planned", "brief", "drafted", "revised", "queued", "published"].map((value) => `<option ${item.status === value ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      <button class="icon-button" type="button" aria-label="删除章节" data-remove-pipeline="${index}">×</button>
    `;
    root.appendChild(row);
  });
}

function renderLedger() {
  const root = $("#ledgerList");
  if (!root) return;
  root.innerHTML = "";
  state.ledger.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "ledger-item";
    row.innerHTML = `
      <input aria-label="承诺" value="${escapeAttr(item.promise)}" data-ledger="${index}" data-key="promise" placeholder="读者承诺/伏笔" />
      <input aria-label="埋设章节" value="${escapeAttr(item.planted)}" data-ledger="${index}" data-key="planted" placeholder="埋设章节" />
      <input aria-label="回收窗口" value="${escapeAttr(item.window)}" data-ledger="${index}" data-key="window" placeholder="回收窗口" />
      <select aria-label="状态" data-ledger="${index}" data-key="status">
        ${["open", "scheduled", "resolved", "risk"].map((value) => `<option ${item.status === value ? "selected" : ""}>${value}</option>`).join("")}
      </select>
      <button class="icon-button" type="button" aria-label="删除伏笔" data-remove-ledger="${index}">×</button>
    `;
    root.appendChild(row);
  });
}

function renderChecklist() {
  const root = $("#releaseChecklist");
  root.innerHTML = "";
  Object.entries(checklistLabels).forEach(([key, label]) => {
    const row = document.createElement("label");
    row.className = "check-item";
    row.innerHTML = `<input type="checkbox" data-check="${key}" ${state.checklist[key] ? "checked" : ""} /> <span>${label}</span>`;
    root.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shortHash(value) {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function extractMarkdownSectionByHeadings(text, headings) {
  const source = String(text || "").trim();
  if (!source) return "";
  const pattern = headings.map(escapeRegExp).join("|");
  const startMatch = source.match(new RegExp(`^#{1,3}\\s*(?:${pattern})\\s*$`, "im"));
  if (!startMatch) return "";
  const rest = source.slice(startMatch.index + startMatch[0].length);
  const endMatch = rest.match(/^#{1,3}\s*.+\s*$/im);
  return (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
}

function extractMarkdownSectionByKeywords(text, keywordGroups) {
  const source = String(text || "").trim();
  if (!source) return "";
  const headingPattern = /^#{1,4}\s*(.+?)\s*$/gim;
  const headings = [];
  let match;
  while ((match = headingPattern.exec(source))) {
    const title = String(match[1] || "").replace(/^[\d.、\s]+/, "").trim();
    const matched = keywordGroups.some((group) => group.every((keyword) => title.includes(keyword)));
    if (matched) headings.push({ index: match.index, end: match.index + match[0].length });
  }
  if (!headings.length) return "";
  const start = headings[0].end;
  const rest = source.slice(start);
  const endMatch = rest.match(/^#{1,4}\s*.+\s*$/im);
  return (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
}

function cleanConfirmationText(text) {
  return String(text || "")
    .replace(/^\s*[-*]\s*/, "")
    .replace(/^\s*\d+[.、]\s*/, "")
    .replace(/^(?:问题|作者需要决定|需要确认|待确认)\s*[:：]\s*/, "")
    .trim();
}

function stripConfirmationListMarker(line) {
  return String(line || "")
    .replace(/^\s*(?:[-*]|\d+[.、])\s*/, "")
    .trim();
}

function stripConfirmationStatus(text) {
  return String(text || "")
    .replace(/^【待确认】\s*/, "")
    .replace(/^待确认\s*[:：]\s*/, "")
    .replace(/^需要确认\s*[:：]\s*/, "")
    .trim();
}

function appendConfirmationField(entry, key, value) {
  const text = String(value || "").trim();
  if (!text) return;
  entry[key] = entry[key] ? `${entry[key]}\n${text}` : text;
}

function parseConfirmationBlock(block) {
  const entry = { issue: "", suggestion: "", decision: "", raw: String(block || "").trim() };
  const lines = String(block || "")
    .split(/\n+/)
    .map(stripConfirmationListMarker)
    .map((line) => line.trim())
    .filter(Boolean);
  let currentKey = "issue";
  lines.forEach((line) => {
    let match = line.match(/^(?:问题|待确认|需要确认|需要作者确认)\s*[:：]\s*(.+)$/);
    if (match) {
      currentKey = "issue";
      appendConfirmationField(entry, "issue", stripConfirmationStatus(match[1]));
      return;
    }
    match = line.match(/^(?:AI\s*建议|AI建议|建议)\s*[:：]\s*(.+)$/i);
    if (match) {
      currentKey = "suggestion";
      appendConfirmationField(entry, "suggestion", match[1]);
      return;
    }
    match = line.match(/^(?:作者需要决定|作者确认|作者决定|需要作者决定)\s*[:：]\s*(.+)$/);
    if (match) {
      currentKey = "decision";
      appendConfirmationField(entry, "decision", match[1]);
      return;
    }
    if (!entry.issue) {
      currentKey = "issue";
      appendConfirmationField(entry, "issue", stripConfirmationStatus(cleanConfirmationText(line)));
      return;
    }
    appendConfirmationField(entry, currentKey, line);
  });
  entry.issue = stripConfirmationStatus(entry.issue);
  if (!entry.issue && entry.decision) entry.issue = entry.decision;
  return entry.issue ? entry : null;
}

function splitConfirmationBlocks(section) {
  const blocks = [];
  let current = [];
  String(section || "").split(/\n+/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const stripped = stripConfirmationListMarker(trimmed);
    const isListLine = /^\s*(?:[-*]|\d+[.、])\s+/.test(line);
    const isContinuationLabel = /^(?:AI\s*建议|AI建议|建议|作者需要决定|作者确认|作者决定|需要作者决定)\s*[:：]/i.test(stripped);
    const startsNew = isListLine && !isContinuationLabel && current.length;
    if (startsNew) {
      blocks.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  });
  if (current.length) blocks.push(current.join("\n"));
  return blocks;
}

function parseOutlineConfirmationEntries(result) {
  const section = extractMarkdownSectionByHeadings(result, ["需要作者确认"])
    || extractMarkdownSectionByKeywords(result, [
      ["作者", "确认"],
      ["需要", "确认"],
      ["待确认"],
      ["作者", "决定"]
    ]);
  if (!section) {
    return String(result || "")
      .split(/\n+/)
      .map(cleanConfirmationText)
      .filter((line) => line.includes("【待确认】") || line.includes("待确认") || line.includes("需要作者确认"))
      .map((line) => parseConfirmationBlock(line))
      .filter(Boolean);
  }
  if (/^(暂无|无|没有|暂无明确)/.test(section.trim())) return [];
  const entries = splitConfirmationBlocks(section)
    .map((block) => parseConfirmationBlock(block.replace(/\n{2,}/g, "\n").trim()))
    .filter(Boolean)
    .filter((entry) => !/^(暂无|无|没有|暂无明确)$/.test(entry.issue));
  if (entries.length) return entries;
  return section
    .split(/\n+/)
    .map((line) => parseConfirmationBlock(line))
    .filter(Boolean);
}

function normalizeOutlineConfirmation(item, index = 0) {
  const source = typeof item === "string" ? { issue: item } : (item || {});
  const issue = stripConfirmationStatus(cleanConfirmationText(source.issue || source.raw || ""));
  if (!issue) return null;
  const suggestion = String(source.suggestion || "").trim();
  const decision = String(source.decision || "").trim();
  const choice = ["pending", "ai", "original", "manual"].includes(source.choice) ? source.choice : "pending";
  const note = String(source.note || "").trim();
  return {
    id: source.id || `outline-confirm-${index + 1}-${shortHash(`${issue}|${suggestion}|${decision}`)}`,
    issue,
    suggestion,
    decision,
    choice,
    note
  };
}

function buildOutlineConfirmationsFromResult(result) {
  const previous = new Map(
    (state.outlineConfirmations || []).map((item) => [String(item.issue || "").trim(), item])
  );
  return parseOutlineConfirmationEntries(result).map((entry, index) => {
    const normalized = normalizeOutlineConfirmation(entry, index);
    if (!normalized) return null;
    const existing = previous.get(normalized.issue) || {};
    return {
      id: existing.id || normalized.id,
      issue: normalized.issue,
      suggestion: normalized.suggestion || existing.suggestion || "",
      decision: normalized.decision || existing.decision || "",
      choice: existing.choice || "pending",
      note: existing.note || ""
    };
  }).filter(Boolean);
}

function confirmationChoiceLabel(choice) {
  const labels = {
    pending: "待确认",
    ai: "采用 AI 建议",
    original: "保留原设定",
    manual: "按我的说明"
  };
  return labels[choice] || labels.pending;
}

function outlineConfirmationSummary() {
  const items = state.outlineConfirmations || [];
  const lines = items.map((item, index) => {
    const note = String(item.note || "").trim();
    const choiceNote = item.choice === "pending"
      ? "尚未确认：更新大纲时只能保留为待确认，不能替作者拍板。"
      : `作者选择：${confirmationChoiceLabel(item.choice)}`;
    return [
      `确认项 ${index + 1}`,
      `问题：${item.issue}`,
      item.suggestion ? `AI建议：${item.suggestion}` : "",
      item.decision ? `作者需要决定：${item.decision}` : "",
      choiceNote,
      note ? `作者说明：${note}` : ""
    ].filter(Boolean).join("\n");
  });
  const authorNotes = String(state.outlineAuthorNotes || "").trim();
  if (authorNotes) lines.push(`作者补充说明：\n${authorNotes}`);
  return lines.join("\n\n").trim();
}

function renderOutlineConfirmations() {
  const root = $("#outlineConfirmationList");
  const count = $("#outlineConfirmationCount");
  if (!root) return;
  const items = state.outlineConfirmations || [];
  const pendingCount = items.filter((item) => !item.choice || item.choice === "pending").length;
  if (count) {
    count.textContent = !items.length
      ? "暂无确认项"
      : pendingCount
        ? `${pendingCount} 项待确认 / 共 ${items.length} 项`
        : `${items.length} 项已处理`;
  }
  if (!items.length) {
    root.innerHTML = `<div class="empty-note">检查大纲后，可从“需要作者确认”里提取确认项。</div>`;
    return;
  }
  const details = root.closest("details");
  if (details) details.open = true;
  root.innerHTML = items.map((item, index) => `
    <article class="outline-confirmation-card">
      <div class="outline-confirmation-title">确认 ${index + 1}</div>
      <div class="outline-confirmation-fields">
        <p><strong>问题</strong>${escapeHtml(item.issue)}</p>
        ${item.suggestion ? `<p><strong>AI建议</strong>${escapeHtml(item.suggestion)}</p>` : ""}
        ${item.decision ? `<p><strong>作者需要决定</strong>${escapeHtml(item.decision)}</p>` : ""}
      </div>
      <div class="outline-confirmation-controls">
        <label>
          处理方式
          <select data-outline-confirm-index="${index}" data-key="choice">
            <option value="pending" ${item.choice === "pending" ? "selected" : ""}>待确认</option>
            <option value="ai" ${item.choice === "ai" ? "selected" : ""}>采用 AI 建议</option>
            <option value="original" ${item.choice === "original" ? "selected" : ""}>保留原设定</option>
            <option value="manual" ${item.choice === "manual" ? "selected" : ""}>按我的说明</option>
          </select>
        </label>
        <label>
          作者说明
          <textarea rows="3" data-outline-confirm-index="${index}" data-key="note" placeholder="比如：保留旧设定，但把动机改成被迫合作。">${escapeHtml(item.note)}</textarea>
        </label>
      </div>
    </article>
  `).join("");
}

function compactPreview(value, fallback) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

function compactCount(value) {
  return String(value || "").replace(/\s/g, "").length;
}

function setText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function setDataStatus(id, status) {
  const target = document.getElementById(id);
  if (target) target.dataset.status = status;
}

function latestDraftNumber() {
  return Number(lastDraftedChapter()?.number || 0);
}

function analysisLagInfo() {
  const latest = latestDraftNumber();
  const covered = Number(state.quickAnalysisChapter || 0);
  const lag = latest > covered ? latest - covered : 0;
  return {
    latest,
    covered,
    lag,
    due: Boolean((state.quickAnalysis || "").trim() && covered && lag > MEMORY_CARD_REFRESH_GAP)
  };
}

function memoryCoverageLabel() {
  if (isShortStory()) {
    if (!(state.quickAnalysis || "").trim()) {
      if ((state.quickBrief || "").trim()) {
        return {
          value: "已并入骨架",
          hint: "短篇草稿理解已在骨架里处理",
          meta: "短篇理解：并入骨架"
        };
      }
      return {
        value: "自动处理",
        hint: "生成骨架时自动分析已有草稿",
        meta: "短篇理解：随骨架生成"
      };
    }
    return {
      value: `${compactCount(state.quickAnalysis)} 字`,
      hint: "已有短篇理解可供生成使用",
      meta: "短篇理解：已生成"
    };
  }
  if (!(state.quickAnalysis || "").trim()) {
    return {
      value: "未分析",
      hint: "分析后记录覆盖章节",
      meta: "覆盖章节：未分析"
    };
  }
  const { latest, covered, lag } = analysisLagInfo();
  if (!covered) {
    return {
      value: "未记录章节",
      hint: "旧记录或手动分析未绑定正文库，建议重分析",
      meta: "覆盖章节：未记录"
    };
  }
  const withinBuffer = lag > 0 && lag <= MEMORY_CARD_REFRESH_GAP;
  return {
    value: `到第${covered}章`,
    hint: lag > MEMORY_CARD_REFRESH_GAP
      ? `落后正文库 ${lag} 章，建议重分析`
      : (withinBuffer ? `落后 ${lag} 章，仍在${memoryFutureCount()}章建议范围内` : "与正文库最新章节一致"),
    meta: lag
      ? `覆盖到第${covered}章 · 落后${lag}章${withinBuffer ? " · 未超过4章缓冲" : ""}`
      : `覆盖到第${covered}章`
  };
}

function briefLifecycleInfo() {
  if (isShortStory()) {
    const ready = Boolean(String(state.quickBrief || "").trim());
    return {
      status: ready ? "ready" : "missing",
      stateLabel: ready ? "已生成" : "未生成",
      value: ready ? "已生成" : "未生成",
      hint: ready ? "可直接用于生成短篇正文" : "生成后显示完整短篇骨架",
      meta: ready ? "短篇骨架：已生成" : "短篇骨架：未生成",
      ready
    };
  }
  if (!(state.quickBrief || "").trim()) {
    return {
      status: "missing",
      stateLabel: "未推断",
      value: "未推断",
      hint: "推断后显示具体章节",
      meta: "目标章节：未推断",
      ready: false
    };
  }
  const start = Number(state.quickBriefStartChapter || 0);
  if (!start) {
    return {
      status: "stale",
      stateLabel: "需重推",
      value: "未记录章节",
      hint: "旧方向未保存章节范围，建议重推断",
      meta: "目标章节：未记录",
      ready: false
    };
  }
  const next = nextChapterNumber();
  const end = Number(state.quickBriefEndChapter || 0) || (start + directionChapterCount() - 1);
  const range = `第${start}-${end}章`;
  if (next < start) {
    return {
      status: "stale",
      stateLabel: "需核对",
      value: range,
      hint: `当前应写第${next}章，但方向从第${start}章开始，建议核对正文库编号或重推断。`,
      meta: `目标章节：${range} · 当前第${next}章 · 需核对`,
      ready: false
    };
  }
  if (next > end) {
    return {
      status: "exhausted",
      stateLabel: "已用完",
      value: range,
      hint: `当前应写第${next}章，这组方向已用完，建议重推${directionLabel()}。`,
      meta: `目标章节：${range} · 当前第${next}章 · 已用完`,
      ready: false
    };
  }
  if (next > start) {
    return {
      status: "usable",
      stateLabel: "仍可用",
      value: range,
      hint: `当前应写第${next}章，仍在${directionLabel()}范围内，可继续使用；两章模式下建议确认不要重复写已保存章节。`,
      meta: `目标章节：${range} · 当前第${next}章 · 仍可用`,
      ready: true
    };
  }
  return {
    status: "ready",
    stateLabel: "可使用",
    value: range,
    hint: `当前应写第${next}章，方向与正文库进度一致。`,
    meta: `目标章节：${range} · 可使用`,
    ready: true
  };
}

function briefRangeLabel() {
  return briefLifecycleInfo();
}

function briefIsOutdatedForNextChapter() {
  const lifecycle = briefLifecycleInfo();
  return lifecycle.status === "stale" || lifecycle.status === "exhausted";
}

function updateProgressData() {
  const short = isShortStory();
  setText("libraryProgressLabel", short ? "短篇保存" : "正文库进度");
  setText("analysisProgressLabel", short ? "草稿理解" : "记忆卡覆盖");
  setText("strategyProgressLabel", short ? "故事模式" : "创作策略");
  setText("strategyProgressValue", strategyDisplayName());
  setText("strategyProgressHint", strategyStatusText());
  setText("briefProgressLabel", short ? "短篇骨架" : directionLabel());
  const latest = lastDraftedChapter();
  if (latest) {
    setText("libraryProgressValue", short ? "已保存" : `第${latest.number || "?"}章`);
    setText("libraryProgressHint", latest.title || (short ? "短篇成稿已保存" : "已保存正文"));
  } else {
    setText("libraryProgressValue", short ? "未保存" : "暂无正文");
    setText("libraryProgressHint", short ? "生成并检查后可保存短篇" : "先保存章节后会自动更新");
  }

  const memory = memoryCoverageLabel();
  setText("analysisProgressValue", memory.value);
  setText("analysisProgressHint", memory.hint);
  setText("analysisSummaryMeta", memory.meta);

  const brief = briefRangeLabel();
  setText("briefProgressValue", brief.value);
  setText("briefProgressHint", brief.hint);
  setText("briefSummaryMeta", brief.meta);
  updateWorkbenchFocus();
  updateOutlineEvidenceUi();
}

function setMemorySummary(prefix, value, options) {
  const stateEl = $(`#${prefix}SummaryState`);
  const previewEl = $(`#${prefix}SummaryPreview`);
  const count = compactCount(value);
  if (stateEl) {
    stateEl.textContent = count ? `${count} 字` : options.emptyState;
  }
  if (previewEl) {
    previewEl.textContent = compactPreview(value, options.emptyPreview);
  }
}

function updateMemorySummaryCards() {
  const outline = (state.projectOutline || "").trim();
  const outlineResult = (state.outlineResult || "").trim();
  setMemorySummary("outline", outline || outlineResult, {
    emptyState: "未填写",
    emptyPreview: isShortStory()
      ? "点击编辑题材风格、主角、核心冲突、关键反转和结局方向。"
      : "点击编辑核心卖点、世界观、人物关系、阶段主线和伏笔回收。"
  });
  const outlineState = $("#outlineSummaryState");
  if (outlineState && !outline && outlineResult) outlineState.textContent = "有整理结果";
  setText("outlineSummaryMeta", outlineResult
    ? (isShortStory() ? "设定整理结果：待确认" : "大纲整理结果：待确认")
    : (isShortStory()
      ? "设定整理结果：无"
      : outlineEvidenceStatusText()));

  setMemorySummary("analysis", state.quickAnalysis, {
    emptyState: "未分析",
    emptyPreview: isShortStory()
      ? "点击查看或修改已写内容、缺失环节、最大风险和补全建议。"
      : `点击查看或修改下一步最该做什么、最大连载风险、${memoryFutureLabel()}。`
  });

  setMemorySummary("brief", state.quickBrief, {
    emptyState: "未推断",
    emptyPreview: isShortStory()
      ? "点击查看开端、发展、转折、高潮、结尾和情绪落点。"
      : `点击查看${directionLabel()}，生成正文会优先按前两章执行。`
  });
  const briefLifecycle = briefLifecycleInfo();
  const briefState = $("#briefSummaryState");
  if (briefState) {
    briefState.textContent = briefLifecycle.stateLabel;
    briefState.dataset.status = briefLifecycle.status;
  }
  const briefPreview = $("#briefSummaryPreview");
  if (briefPreview && !isShortStory() && state.quickBrief) {
    briefPreview.textContent = briefLifecycle.hint;
  }
  updateProgressData();
}

function scheduleMemorySummaryUpdate(delay = MEMORY_SUMMARY_DELAY_MS) {
  if (memorySummaryTimer) clearTimeout(memorySummaryTimer);
  memorySummaryTimer = setTimeout(() => {
    memorySummaryTimer = 0;
    updateMemorySummaryCards();
  }, delay);
}

function closeMemoryDrawer() {
  const drawer = $("#memoryDrawer");
  if (!drawer) return;
  drawer.hidden = true;
  document.body.classList.remove("memory-drawer-open");
}

function openMemoryDrawer(section = "outline") {
  const drawer = $("#memoryDrawer");
  if (!drawer) return;
  drawer.hidden = false;
  document.body.classList.add("memory-drawer-open");
  const titles = {
    outline: isShortStory() ? "故事设定" : "项目大纲",
    analysis: isShortStory() ? "短篇理解" : "小说记忆卡",
    brief: isShortStory() ? "短篇方案" : directionLabel()
  };
  const title = $("#memoryDrawerTitle");
  if (title) title.textContent = titles[section] || "创作记忆";
  document.querySelectorAll("[data-memory-section]").forEach((item) => {
    item.classList.toggle("is-target", item.dataset.memorySection === section);
  });
  const body = drawer.querySelector(".memory-drawer-body");
  if (body) body.scrollTop = 0;
}

function summarizeProject() {
  if (isShortStory()) {
    return [
      `作品名：${state.projectTitle || "未命名短篇"}`,
      "创作模式：短篇故事",
      `类型：${state.genre || "未定"}`,
      `平台/用途：${state.platform || "未定"}`,
      `目标字数：${state.targetWords || defaults.targetWords}`,
      `核心看点：${state.corePromise || "待补充"}`,
      `当前短篇状态：\n${state.projectState || "待补充"}`
    ].join("\n");
  }
  const progressLines = serialProgressSummaryLines();
  return [
    `作品名：${state.projectTitle || "未命名"}`,
    "创作模式：连载小说",
    `类型：${state.genre || "未定"}`,
    `平台：${state.platform || "未定"}`,
    `更新频率：${state.cadence}`,
    `每章目标字数：${state.targetWords}`,
    ...progressLines,
    `存稿：${state.bufferCount}`,
    `发布状态：${state.releaseStatus}`,
    `作品阶段：${endingStageText()}`,
    `预计剩余章数：${endingRemainingText()}`,
    `结局类型：${state.endingType || "未设置"}`,
    `核心卖点：${state.corePromise || "待补充"}`,
    `当前项目状态：\n${state.projectState || "待补充"}`
  ].join("\n");
}

function serialProgressSummaryLines() {
  if (isShortStory()) return [];
  const stats = chapterStats();
  const latest = stats.latest;
  const editing = currentChapterRecord();
  const stored = Number(state.currentChapter || 0);
  const latestNumber = Number(latest?.number || 0);
  const editingNumber = Number(editing?.number || 0);
  const nextNumber = nextChapterNumber();
  const lines = [
    latest
      ? `正文库最新章节：${chapterLabel(latest)}`
      : "正文库最新章节：暂无已写正文",
    editingNumber
      ? `当前编辑章节：第${editingNumber}章`
      : "当前编辑章节：暂无",
    `下一章续写锚点：第${nextNumber}章`
  ];
  if (stored && latestNumber && stored !== latestNumber) {
    lines.push(`旧进度字段 currentChapter：第${stored}章（仅作历史参考；续写以正文库最新第${latestNumber}章为准）`);
  } else if (stored) {
    lines.push(`当前章节字段：第${stored}章`);
  }
  return lines;
}

function pipelineText() {
  return state.pipeline
    .map((item) => `${item.chapter || "未命名章节"} | 推进：${item.movement || "待定"} | 奖励：${item.reward || "待定"} | 状态：${item.status}`)
    .join("\n");
}

function ledgerText() {
  return state.ledger
    .map((item) => `${item.promise || "未命名承诺"} | 埋设：${item.planted || "待定"} | 回收窗口：${item.window || "待定"} | 状态：${item.status}`)
    .join("\n");
}

function checklistText() {
  return Object.entries(checklistLabels)
    .map(([key, label]) => `${state.checklist[key] ? "[x]" : "[ ]"} ${label}`)
    .join("\n");
}

function currentChapterText() {
  const chapter = currentChapterRecord();
  if (!chapter) return "暂无章节";
  return [
    `章节：${chapterLabel(chapter)}`,
    `状态：${chapter.status || "planned"}`,
    `备注：${chapter.notes || "无"}`,
    `正文：\n${chapter.draft || "暂无正文"}`
  ].join("\n");
}

function sortedChapters() {
  ensureChapterCollection();
  if (!chapterCache.sorted) {
    chapterCache.sorted = state.chapters.slice().sort(compareChapters);
  }
  return chapterCache.sorted;
}

function chaptersAsSourceText(options = {}) {
  const includeNotes = options.includeNotes !== false;
  const key = includeNotes ? "withNotes" : "withoutNotes";
  if (chapterCache.source[key] !== null) return chapterCache.source[key];
  const source = sortedChapters()
    .map((chapter) => {
      const body = chapter.draft || "";
      const notes = includeNotes && chapter.notes ? `\n\n备注：${chapter.notes}` : "";
      return `# ${chapterLabel(chapter)}\n\n${body}${notes}`;
    })
    .filter((text) => text.replace(/[#\s]/g, "").length)
    .join("\n\n---\n\n");
  chapterCache.source[key] = source;
  chapterCache.sourceLength[key] = source.length;
  return source;
}

function chaptersAsDraftSourceText() {
  return chaptersAsSourceText({ includeNotes: false });
}

function existingNovelText(options = {}) {
  const quickText = (state.quickSourceText || "").trim();
  const chapterText = options.includeNotes === false ? chaptersAsDraftSourceText() : chaptersAsSourceText();
  if (options.preferChapters && chapterText.trim()) return chapterText;
  return quickText || chapterText;
}

function lastDraftedChapter() {
  return chapterStats().latest;
}

function maxChapterNumber() {
  return chapterStats().maxNumber;
}

function isWritablePlannedChapter(chapter) {
  const status = String(chapter?.status || "planned");
  return ["planned", "brief"].includes(status) && chapterWordCount(chapter) === 0;
}

function nextWritablePlannedChapter(afterNumber = latestDraftNumber(), usedIds = new Set()) {
  return sortedChapters().find((chapter) => {
    const number = Number(chapter.number || 0);
    return number > afterNumber && isWritablePlannedChapter(chapter) && !usedIds.has(chapter.id);
  }) || null;
}

function writablePlannedChapterByNumber(number, usedIds = new Set()) {
  const target = Number(number || 0);
  if (!target) return null;
  return sortedChapters().find((chapter) => (
    Number(chapter.number || 0) === target &&
    isWritablePlannedChapter(chapter) &&
    !usedIds.has(chapter.id)
  )) || null;
}

function nextChapterNumber() {
  const planned = nextWritablePlannedChapter();
  if (planned) return Number(planned.number || 0);
  const stats = chapterStats();
  if (stats.maxDraftedNumber) return stats.maxDraftedNumber + 1;
  return maxChapterNumber() + 1;
}

function lastChapterEnding(maxLength = 1800) {
  const chapter = lastDraftedChapter();
  if (!chapter) return "";
  const ending = chapterEndingText(chapter, maxLength);
  return `最新已写章节：${chapterLabel(chapter)}\n\n最新章节结尾：\n${ending}`;
}

function recentTwoChaptersReference(maxLengthPerChapter = 5200) {
  const chapters = sortedChapters()
    .filter((chapter) => chapterWordCount(chapter) > 0)
    .slice(-2);
  if (!chapters.length) return "";
  const latest = chapters[chapters.length - 1];
  return chapters.map((chapter, index) => {
    const role = chapter === latest ? "最新章节，正文开头必须承接这一章结尾" : "前一章，用于校准人物状态、语气和连续性";
    return [
      `## ${chapterLabel(chapter)}（${role}）`,
      `状态：${chapterStatusText(chapter.status)}，字数：${chapterWordCount(chapter)}`,
      chapter.notes ? `备注：${compactLine(chapter.notes, 260)}` : "备注：无",
      "",
      chapterDraftExcerpt(chapter, maxLengthPerChapter)
    ].join("\n");
  }).join("\n\n---\n\n");
}

function firstThreeChaptersReference(maxLengthPerChapter = 1500) {
  const chapters = sortedChapters()
    .filter((chapter) => chapterWordCount(chapter) > 0)
    .slice(0, 3);
  if (!chapters.length) return "";
  return chapters.map((chapter, index) => [
    `## 开篇契约参考 ${index + 1}：${chapterLabel(chapter)}`,
    `状态：${chapterStatusText(chapter.status)}，字数：${chapterWordCount(chapter)}`,
    chapter.notes ? `备注：${compactLine(chapter.notes, 220)}` : "备注：无",
    "",
    chapterDraftExcerpt(chapter, maxLengthPerChapter)
  ].join("\n")).join("\n\n---\n\n");
}

function nextPlannedChapterContext(maxLength = 1600) {
  const next = nextChapterNumber();
  const chapter = sortedChapters().find((item) => Number(item.number || 0) === next && chapterWordCount(item) === 0);
  if (!chapter) return "";
  const notes = String(chapter.notes || "").trim();
  if (!notes) return `正文库待写计划：${chapterLabel(chapter)}，但暂无备注。`;
  const trimmed = notes.length > maxLength ? `${notes.slice(0, maxLength)}...` : notes;
  return `正文库待写计划：${chapterLabel(chapter)}\n状态：${chapterStatusText(chapter.status)}\n计划备注：\n${trimmed}`;
}

function chapterEndingText(chapter, maxLength = 1400) {
  const draft = String(chapter?.draft || "").trim();
  return draft.length > maxLength ? draft.slice(-maxLength) : draft;
}

function compactLine(value, maxLength = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function chapterLibraryIndexText(maxChapters = 120) {
  const chapters = sortedChapters().slice(-maxChapters);
  if (!chapters.length) return "暂无章节";
  return chapters.map((chapter) => {
    const words = chapterWordCount(chapter);
    const notes = compactLine(chapter.notes, 160);
    return `${chapterLabel(chapter)} | 状态：${chapterStatusText(chapter.status)} | 正文：${words} 字 | 备注：${notes || "无"}`;
  }).join("\n");
}

function draftedChaptersForEvidence() {
  return sortedChapters().filter((chapter) => chapterWordCount(chapter) > 0);
}

function splitEvidenceCardText(text) {
  const source = String(text || "").trim();
  if (!source) return [];
  const parts = source
    .split(/\n\s*---\s*\n(?=##\s*证据批次：)/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [source];
}

function outlineEvidencePendingCardsText() {
  const pending = String(state.outlineEvidencePendingCards || "").trim();
  if (pending) return pending;
  const hasLegacyDelta = Number(state.outlineEvidenceUpdatedToChapter || 0) > Number(state.outlineEvidenceCompressedToChapter || 0);
  return hasLegacyDelta ? String(state.outlineEvidenceCards || "").trim() : "";
}

function pendingEvidenceChapterCount() {
  const from = Number(state.outlineEvidencePendingFromChapter || 0);
  const to = Number(state.outlineEvidencePendingToChapter || 0);
  if (from && to && to >= from) return to - from + 1;
  return Math.max(0, Number(state.outlineEvidenceUpdatedToChapter || 0) - Number(state.outlineEvidenceCompressedToChapter || 0));
}

function pendingEvidenceRangeLabel() {
  const from = Number(state.outlineEvidencePendingFromChapter || 0);
  const to = Number(state.outlineEvidencePendingToChapter || 0);
  if (from && to && to >= from) return from === to ? `第${to}章` : `第${from}-${to}章`;
  const count = pendingEvidenceChapterCount();
  return count ? `${count}章新增资料` : "无待整理资料";
}

function outlineEvidenceStatusText() {
  const cards = String(state.outlineEvidenceCards || "").trim();
  const compressed = String(state.outlineEvidenceGlobalSummary || state.outlineEvidenceArcSummaries || "").trim();
  const covered = Number(state.outlineEvidenceUpdatedToChapter || 0);
  if (!cards && !compressed) return "AI资料库：未更新";
  const count = cards.length;
  const compressedCount = [
    state.outlineEvidenceArcSummaries,
    state.outlineEvidenceGlobalSummary,
    state.outlineEvidenceCharacterIndex,
    state.outlineEvidenceForeshadowIndex
  ].join("").length;
  const time = state.outlineEvidenceUpdatedAt
    ? new Date(state.outlineEvidenceUpdatedAt).toLocaleString()
    : "未知时间";
  const compressedLabel = compressed
    ? ` · AI精简资料 ${compressedCount}字`
    : " · 建议整理";
  const pendingCount = pendingEvidenceChapterCount();
  const pendingLabel = pendingCount ? ` · ${pendingCount}章待深度整理` : "";
  return `AI资料库：已更新到第${covered || "?"}章 · 原始资料${count}字${compressedLabel}${pendingLabel} · ${time}`;
}

function projectBibleSummaryForAi(maxLength = 7000) {
  const stats = chapterStats();
  const latest = latestDraftNumber();
  const confirmation = outlineConfirmationSummary();
  const hasEvidenceIndex = [
    state.outlineEvidenceArcSummaries,
    state.outlineEvidenceGlobalSummary,
    state.outlineEvidenceCharacterIndex,
    state.outlineEvidenceForeshadowIndex
  ].some((value) => String(value || "").trim());
  const blocks = [
    "## 项目圣经总览",
    "说明：这是由项目大纲、作者确认区和 AI资料库四库动态汇总出来的总览，不是独立事实源。若与正文库事实冲突，以正文库已入库章节和四库事实为准。",
    "",
    "### 项目进度",
    [
      `作品：${state.projectTitle || "未命名作品"}`,
      `类型/平台：${state.genre || "未填写"} / ${state.platform || "未填写"}`,
      `正文库：已入库 ${stats.drafted || 0} 章，最新第 ${latest || 0} 章，总字数 ${stats.totalWords || 0}`,
      `AI资料库：覆盖到第 ${state.outlineEvidenceUpdatedToChapter || 0} 章，深度整理到第 ${state.outlineEvidenceCompressedToChapter || 0} 章`,
      `小说记忆卡：覆盖到第 ${state.quickAnalysisChapter || 0} 章`,
      `章节方向：${directionShortLabel()}`
    ].join("\n"),
    "",
    "### 核心卖点",
    trimHeadTailForPrompt(state.corePromise || "暂无", 900, "核心卖点"),
    "",
    "### 作者确认结论",
    confirmation ? trimHeadTailForPrompt(confirmation, 1400, "作者确认区") : "暂无作者确认项。",
    "",
    "### 项目大纲摘要",
    compactMarkdownSectionsForPrompt(state.projectOutline || state.outlineResult || "暂无项目大纲。", 1800, "项目大纲"),
    "",
    "### 剧情事实库",
    trimHeadTailForPrompt(state.outlineEvidenceArcSummaries || "暂无剧情事实库；请先深度整理 AI资料库。", 1400, "剧情事实库"),
    "",
    "### 世界观设定库",
    trimHeadTailForPrompt(state.outlineEvidenceGlobalSummary || "暂无世界观设定库；请先深度整理 AI资料库。", 1400, "世界观设定库"),
    "",
    "### 人物状态库",
    trimHeadTailForPrompt(state.outlineEvidenceCharacterIndex || "暂无人物状态库；请先深度整理 AI资料库。", 1400, "人物状态库"),
    "",
    "### 伏笔线索库",
    trimHeadTailForPrompt(state.outlineEvidenceForeshadowIndex || "暂无伏笔线索库；请先深度整理 AI资料库。", 1400, "伏笔线索库"),
    "",
    "### 小说记忆卡摘要",
    compactAnalysisContext(1200),
    "",
    `### ${directionShortLabel()}摘要`,
    compactBriefContext(1200),
    "",
    hasEvidenceIndex
      ? "### 使用建议\n生成正文时先用本总览确定正史边界，再按模块读取四库明细、最近两章和章节方向。"
      : "### 使用建议\n当前项目圣经还缺少四库事实，建议先更新并深度整理 AI资料库。"
  ];
  return trimHeadTailForPrompt(blocks.join("\n"), maxLength, "项目圣经总览");
}

function updateProjectBiblePreview() {
  const summary = projectBibleSummaryForAi(9000);
  const hasIndex = [
    state.outlineEvidenceArcSummaries,
    state.outlineEvidenceGlobalSummary,
    state.outlineEvidenceCharacterIndex,
    state.outlineEvidenceForeshadowIndex
  ].some((value) => String(value || "").trim());
  const value = compactCount(summary);
  setDataStatus("evidenceBibleCard", hasIndex ? "ok" : (state.projectOutline || state.outlineEvidenceCards ? "warn" : "idle"));
  setText("evidenceBibleValue", value ? `${value}字` : "未生成");
  setText("evidenceBibleHint", hasIndex ? "已汇总大纲、作者确认和四库" : "先更新并整理 AI资料库");
  const preview = $("#evidenceBiblePreview");
  if (preview) preview.value = summary;
}

function outlineEvidenceMetrics() {
  const stats = chapterStats();
  const latest = latestDraftNumber();
  const scanned = Number(state.outlineEvidenceUpdatedToChapter || 0);
  const compressedTo = Number(state.outlineEvidenceCompressedToChapter || 0);
  const pendingScanChapters = pendingOutlineEvidenceScanChapters().length;
  const raw = compactCount(state.outlineEvidenceCards);
  const arc = compactCount(state.outlineEvidenceArcSummaries);
  const global = compactCount(state.outlineEvidenceGlobalSummary);
  const characters = compactCount(state.outlineEvidenceCharacterIndex);
  const foreshadow = compactCount(state.outlineEvidenceForeshadowIndex);
  const indexTotal = arc + global + characters + foreshadow;
  const effectiveCompressedTo = compressedTo || (indexTotal ? scanned : 0);
  const hasRaw = raw > 0;
  const hasIndex = indexTotal > 0;
  const pendingCards = compactCount(outlineEvidencePendingCardsText());
  const pendingChapters = pendingEvidenceChapterCount();
  const pendingUpdateCalls = Math.ceil(pendingScanChapters / OUTLINE_EVIDENCE_BATCH_SIZE);
  const fullOrganizeCalls = Math.max(0, chunkEvidenceCards(splitOutlineEvidenceCards()).length) + (hasRaw ? 1 : 0);
  const deepOrganizeCalls = hasIndex ? (pendingCards ? 1 : 0) : fullOrganizeCalls;
  return {
    drafted: stats.drafted,
    totalWords: stats.totalWords,
    latest,
    scanned,
    compressedTo: effectiveCompressedTo,
    pendingScanChapters,
    raw,
    arc,
    global,
    characters,
    foreshadow,
    indexTotal,
    hasRaw,
    hasIndex,
    pendingCards,
    pendingChapters,
    pendingUpdateCalls,
    deepOrganizeCalls,
    unscanned: pendingScanChapters,
    uncompressed: Math.max(0, scanned - effectiveCompressedTo)
  };
}

function renderEvidenceStep(id, hintId, status, hint) {
  setDataStatus(id, status);
  setText(hintId, hint);
}

function renderEvidenceRoutes(metrics) {
  const directionName = directionShortLabel();
  if (metrics.hasIndex) {
    setText("evidenceRouteOutline", "项目圣经总览 + 新增事实");
    setText("evidenceRouteAnalysis", "项目圣经总览 + 最近两章");
    setText("evidenceRoutePlanning", "项目圣经总览 + 记忆卡 + 伏笔");
    setText("evidenceRouteDraft", `项目圣经总览 + 最近两章 + ${directionName}`);
    return;
  }
  if (metrics.hasRaw) {
    setText("evidenceRouteOutline", "项目大纲 + 原始资料");
    setText("evidenceRouteAnalysis", "项目大纲 + 原始资料摘要");
    setText("evidenceRoutePlanning", "大纲 + 记忆卡 + 最近两章");
    setText("evidenceRouteDraft", `最近两章 + ${directionName}`);
    return;
  }
  setText("evidenceRouteOutline", "等待更新AI资料库");
  setText("evidenceRouteAnalysis", "暂用正文库最近章节");
  setText("evidenceRoutePlanning", "暂用大纲和记忆卡");
  setText("evidenceRouteDraft", "暂用最近两章");
}

function renderEvidenceRisks(metrics) {
  const risks = [];
  const fulfillmentTaskRisks = chapterFulfillmentRevisionTaskRisks();
  if (!metrics.drafted) {
    risks.push("正文库暂无已保存正文：先导入或保存章节。");
  }
  if (metrics.drafted && !metrics.hasRaw && !metrics.hasIndex) {
    risks.push("正文库已有内容但 AI资料库未更新：整理大纲前建议先更新。");
  }
  if (metrics.unscanned > 0) {
    risks.push(`正文库有 ${metrics.unscanned} 章未进入 AI资料库：建议更新资料库。`);
  }
  if (metrics.hasRaw && !metrics.hasIndex) {
    risks.push("原始资料已建立，但还没有 AI精简资料：长篇生成前建议整理。");
  }
  if (metrics.hasIndex && metrics.pendingChapters > EVIDENCE_FAST_UPDATE_THRESHOLD) {
    risks.push(`有 ${metrics.pendingChapters} 章新增资料未深度整理：建议点“深度整理资料库”。`);
  }
  if (metrics.raw > OUTLINE_EVIDENCE_MAX_LENGTH * 0.85 && !metrics.hasIndex) {
    risks.push("AI资料库原始资料偏大：继续堆积会增加发送字数，建议整理。");
  }
  const analysisLag = analysisLagInfo();
  if (analysisLag.due) {
    risks.push(`小说记忆卡覆盖到第 ${analysisLag.covered} 章，已落后正文 ${analysisLag.lag} 章：建议更新记忆卡。`);
  }
  if (fulfillmentTaskRisks.length) {
    const preview = fulfillmentTaskRisks
      .slice(0, 3)
      .map((item) => `${item.label}：${compactLine(item.text, 80)}`)
      .join("；");
    risks.push(`本章兑现记录显示 ${fulfillmentTaskRisks.length} 章保存时仍带高优先级修改任务：${preview}。建议复查修改任务或在 AI资料库更新时补偿。`);
  }
  if (!risks.length) {
    risks.push("AI资料库、记忆卡和正文库进度同步，可以直接整理大纲、推断或生成正文。");
  }
  const status = risks.length === 1 && risks[0].startsWith("AI资料库") ? "ok" : "warn";
  setDataStatus("evidenceRiskList", status);
  setText("evidenceRiskList", risks.join("\n"));
}

function revisionDebtMetrics() {
  const tasks = Array.isArray(state.revisionTasks) ? state.revisionTasks : [];
  const todo = tasks.filter((task) => task && task.status === "todo");
  const blocks = todo.filter((task) => task.severity === "block").length;
  const warns = todo.length - blocks;
  const savedRisks = chapterFulfillmentRevisionTaskRisks().length;
  return {
    todo: todo.length,
    blocks,
    warns,
    savedRisks,
    total: todo.length + savedRisks
  };
}

function revisionDebtDisplay(debt = revisionDebtMetrics()) {
  let status = "ok";
  let value = "0项";
  let hint = "暂无待处理";
  if (debt.total > 0) {
    status = "warn";
    value = `${debt.total}项`;
    const parts = [];
    if (debt.blocks) parts.push(`P0 ${debt.blocks}`);
    if (debt.warns) parts.push(`P1 ${debt.warns}`);
    if (debt.savedRisks) parts.push(`保存待复查 ${debt.savedRisks}`);
    hint = parts.join(" · ");
  }
  return { status, value, hint, hasRisk: debt.total > 0 };
}

function renderEvidenceDebtSummary() {
  const debt = revisionDebtMetrics();
  const display = revisionDebtDisplay(debt);
  setDataStatus("evidenceDebtCard", display.status);
  setText("evidenceDebtValue", display.value);
  setText("evidenceDebtHint", display.hint);
  return debt;
}

function outlineFulfillmentCheckSummary() {
  const taskRiskSummary = chapterFulfillmentRevisionTaskRiskSummary(5);
  const rawCards = [
    String(state.outlineEvidenceCards || "").trim(),
    String(state.outlineEvidencePendingCards || "").trim()
  ].filter(Boolean).join("\n\n---\n\n");
  const sections = [];
  splitEvidenceCardText(rawCards).forEach((card) => {
    const section = extractSingleMarkdownSection(card, "章节方向兑现核对");
    if (section && !/暂无兑现记录|暂无明确/.test(section)) {
      const range = (card.match(/^##\s*(?:证据批次[:：]\s*)?(.+)$/m)?.[1] || "").trim();
      sections.push(`${range ? `${range}\n` : ""}${section}`);
    }
  });
  const indexLines = [
    state.outlineEvidenceArcSummaries,
    state.outlineEvidenceForeshadowIndex,
    state.outlineEvidenceCharacterIndex
  ]
    .join("\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /兑现|未兑现|偏航|补偿|计划目标|读者奖励/.test(line))
    .slice(-8);
  const combined = sections.length
    ? sections.slice(-3).join("\n\n---\n\n")
    : indexLines.join("\n");
  if (!combined.trim() && !taskRiskSummary) {
    return {
      status: "idle",
      meta: "暂无兑现核对",
      text: "保存正文并快速更新 AI资料库后，这里会显示章节方向是否兑现、是否偏航、哪些伏笔需要补偿。"
    };
  }
  const displayText = [taskRiskSummary, combined].filter(Boolean).join("\n\n---\n\n");
  const hasRisk = Boolean(taskRiskSummary) || /未兑现|偏航|补偿|待补偿|风险|缺失/.test(combined);
  return {
    status: hasRisk ? "warn" : "ok",
    meta: taskRiskSummary
      ? (sections.length ? `含保存记录待复查 · 原始核对 ${sections.length} 组` : "保存记录待复查")
      : (sections.length ? `原始核对 ${sections.length} 组` : "来自精简资料"),
    text: trimHeadTailForPrompt(displayText, 900, "章节方向兑现核对")
  };
}

function renderEvidenceFulfillmentSummary() {
  const summary = outlineFulfillmentCheckSummary();
  setDataStatus("evidenceFulfillmentCard", summary.status);
  setText("evidenceFulfillmentMeta", summary.meta);
  setText("evidenceFulfillmentSummary", summary.text);
  return summary;
}

function updateKnowledgeSummaryCard(metrics = outlineEvidenceMetrics()) {
  const hasIndex = metrics.hasIndex;
  const hasRaw = metrics.hasRaw;
  const needsUpdate = Boolean(metrics.unscanned || (hasIndex && metrics.pendingChapters > EVIDENCE_FAST_UPDATE_THRESHOLD));
  const fulfillment = outlineFulfillmentCheckSummary();
  const stateLabel = !metrics.drafted
    ? "等待正文"
    : (fulfillment.status === "warn" && !metrics.unscanned ? "待复查" : (hasIndex && !needsUpdate ? "可使用" : (hasRaw || hasIndex ? "建议整理" : "未更新")));
  const meta = metrics.scanned
    ? `覆盖到第${metrics.scanned}章${metrics.compressedTo ? ` · 精简到第${metrics.compressedTo}章` : ""}`
    : (metrics.drafted ? `正文库已写${metrics.drafted}章` : "覆盖章节：未建立");
  let preview = "正文库有内容后，可更新为 AI 可读取的事实资料。";
  if (metrics.unscanned) {
    preview = `正文库还有 ${metrics.unscanned} 章未进入资料库，建议快速更新。`;
  } else if (hasIndex && metrics.pendingChapters) {
    preview = `${pendingEvidenceRangeLabel()}已临时参与生成，超过4章后建议深度整理。`;
  } else if (hasIndex) {
    preview = `已有 ${metrics.indexTotal} 字精简资料，可供大纲、记忆卡、推断和正文生成读取。`;
  } else if (hasRaw) {
    preview = `已有 ${metrics.raw} 字原始资料，长篇使用前建议深度整理。`;
  }
  if (!metrics.unscanned && fulfillment.status !== "idle") {
    preview = `章节兑现核对：${compactLine(fulfillment.text, 96)}`;
  }
  setText("knowledgeSummaryState", stateLabel);
  setText("knowledgeSummaryMeta", meta);
  setText("knowledgeSummaryPreview", preview);
  const card = $("#knowledgeSummaryCard");
  if (card) {
    card.dataset.status = !metrics.drafted ? "waiting" : (fulfillment.status === "warn" || !(hasIndex && !needsUpdate) ? "warn" : "ready");
  }
}

function updateOutlineEvidenceUi() {
  setText("outlineEvidenceStatus", outlineEvidenceStatusText());
  const metrics = outlineEvidenceMetrics();
  const compressed = String(state.outlineEvidenceGlobalSummary || state.outlineEvidenceArcSummaries || "").trim();
  const time = state.outlineEvidenceCompressedAt
    ? new Date(state.outlineEvidenceCompressedAt).toLocaleString()
    : "";
  setText("outlineEvidenceCompressionStatus", compressed
    ? `AI精简资料：已整理到第${state.outlineEvidenceCompressedToChapter || state.outlineEvidenceUpdatedToChapter || "?"}章 · ${time}`
    : "AI精简资料：未生成");

  setDataStatus("evidenceWrittenCard", metrics.drafted ? "ok" : "idle");
  setText("evidenceWrittenValue", `${metrics.drafted || 0}章`);
  setText("evidenceWrittenHint", metrics.drafted ? `${metrics.totalWords}字 · 最新第${metrics.latest || "?"}章` : "先导入或保存正文");

  const scanStatus = !metrics.drafted ? "idle" : (!metrics.scanned || metrics.unscanned > 0 ? "warn" : "ok");
  setDataStatus("evidenceScanCard", scanStatus);
  setText("evidenceScanValue", metrics.scanned ? `第${metrics.scanned}章` : "未更新");
  setText("evidenceScanHint", !metrics.drafted ? "等待正文库" : (metrics.unscanned ? `${metrics.unscanned}章待更新` : "已覆盖最新章节"));

  const compressionStatus = !metrics.hasRaw && !metrics.hasIndex
    ? "idle"
    : (!metrics.hasIndex || metrics.pendingChapters > EVIDENCE_FAST_UPDATE_THRESHOLD ? "warn" : "ok");
  setDataStatus("evidenceCompressionCard", compressionStatus);
  setText("evidenceCompressionValue", metrics.hasIndex ? (metrics.pendingChapters ? "可选" : `第${metrics.compressedTo || metrics.scanned || "?"}章`) : "未生成");
  setText("evidenceCompressionHint", metrics.hasIndex
    ? (metrics.pendingChapters
      ? `${pendingEvidenceRangeLabel()}可暂用；超过${EVIDENCE_FAST_UPDATE_THRESHOLD}章建议整理`
      : `${metrics.indexTotal}字精简资料`)
    : (metrics.hasRaw ? "可整理成精简资料" : "等待更新"));

  let healthStatus = "idle";
  let healthValue = "待建立";
  let healthHint = "先保存正文";
  if (metrics.drafted && !metrics.hasRaw && !metrics.hasIndex) {
    healthStatus = "warn";
    healthValue = "待更新";
    healthHint = "更新AI资料库";
  } else if (metrics.hasRaw && !metrics.hasIndex) {
    healthStatus = "warn";
    healthValue = "待整理";
    healthHint = "生成AI精简资料";
  } else if (metrics.hasIndex && metrics.unscanned) {
    healthStatus = "warn";
    healthValue = "需更新";
    healthHint = "补充新章节";
  } else if (metrics.hasIndex && metrics.pendingChapters > EVIDENCE_FAST_UPDATE_THRESHOLD) {
    healthStatus = "warn";
    healthValue = "建议整理";
    healthHint = `新增${metrics.pendingChapters}章`;
  } else if (metrics.hasIndex) {
    healthStatus = "ok";
    healthValue = metrics.pendingChapters ? "可使用" : "可使用";
    healthHint = metrics.pendingChapters ? "新增资料已暂用" : "资料同步";
  }
  setDataStatus("evidenceHealthCard", healthStatus);
  setText("evidenceHealthValue", healthValue);
  setText("evidenceHealthHint", healthHint);
  renderEvidenceDebtSummary();

  renderEvidenceStep(
    "evidenceStepScan",
    "evidenceStepScanHint",
    scanStatus,
    metrics.unscanned ? `待读已入库 ${metrics.unscanned} 章` : (metrics.scanned ? "已读已入库正文" : "等待正文库")
  );
  renderEvidenceStep(
    "evidenceStepCompress",
    "evidenceStepCompressHint",
    compressionStatus,
    metrics.hasIndex
      ? (metrics.pendingChapters ? `${pendingEvidenceRangeLabel()}待选` : "已生成精简资料")
      : (metrics.hasRaw ? "建议整理" : "等待更新")
  );
  renderEvidenceStep(
    "evidenceStepUse",
    "evidenceStepUseHint",
    metrics.hasIndex ? "ok" : (metrics.hasRaw ? "warn" : "idle"),
    metrics.hasIndex ? "AI 将按模块读取" : (metrics.hasRaw ? "可临时使用原始资料" : "等待资料")
  );

  setText("evidenceArcSize", `${metrics.arc}字`);
  setText("evidenceGlobalSize", `${metrics.global}字`);
  setText("evidenceCharacterSize", `${metrics.characters}字`);
  setText("evidenceForeshadowSize", `${metrics.foreshadow}字`);
  updateProjectBiblePreview();
  setText("evidenceActionHint", `AI资料库只读取正文库已入库章节，不读取生成正文草稿；快速更新预计 ${metrics.pendingUpdateCalls || 0} 次 AI；深度整理预计 ${metrics.deepOrganizeCalls || 0} 次 AI；${metrics.pendingChapters ? `${pendingEvidenceRangeLabel()}正在临时参与生成` : "暂无待整理新增资料"}。`);
  renderEvidenceFulfillmentSummary();
  renderEvidenceRoutes(metrics);
  renderEvidenceRisks(metrics);
  updateKnowledgeSummaryCard(metrics);
}

function outlineEvidenceContextForPrompt() {
  const compressed = layeredEvidenceWithDelta("outline", OUTLINE_EVIDENCE_INDEX_MAX_LENGTH);
  if (compressed) {
    return `AI资料库（优先级高于原始资料，只包含已写正文事实和精简资料）：\n${compressed}`;
  }
  const cards = String(state.outlineEvidenceCards || "").trim();
  if (cards) {
    return `AI资料库原始资料（优先级高于旧大纲，只包含已写正文事实，不是未来建议）：\n${trimHeadTailForPrompt(cards, OUTLINE_EVIDENCE_MAX_LENGTH, "AI资料库原始资料")}`;
  }
  const manual = String(state.quickSourceText || "").trim();
  const fallback = [
    "AI资料库尚未更新。以下只作为临时依据：",
    "",
    "正文库章节索引：",
    chapterLibraryIndexText(160),
    "",
    "最近两个已写章节摘录：",
    recentTwoChaptersReference(state.economyMode ? 3600 : 4800) || "暂无最近章节",
    manual ? `\n手动粘贴素材摘录：\n${trimHeadTailForPrompt(manual, 5000, "手动素材")}` : ""
  ].filter(Boolean).join("\n");
  return fallback;
}

function outlineCheckEvidenceContextForPrompt() {
  const compressed = layeredEvidenceWithDelta("outline", OUTLINE_CHECK_EVIDENCE_MAX_LENGTH);
  if (compressed) {
    return `AI资料库检查摘录（优先级高于旧大纲，只包含已写正文事实和精简资料）：\n${compressed}`;
  }
  const cards = String(state.outlineEvidenceCards || "").trim();
  if (cards) {
    return `AI资料库原始资料检查摘录（优先级高于旧大纲，只包含已写正文事实）：\n${trimHeadTailForPrompt(cards, OUTLINE_CHECK_EVIDENCE_MAX_LENGTH, "AI资料库检查摘录")}`;
  }
  const manual = String(state.quickSourceText || "").trim();
  const fallback = [
    "AI资料库尚未更新。检查大纲时只使用正文库索引和最近章节摘录，避免把整本正文发给 AI：",
    "",
    "正文库章节索引：",
    chapterLibraryIndexText(80),
    "",
    "最近两个已写章节摘录：",
    recentTwoChaptersReference(1100) || "暂无最近章节",
    manual ? `\n手动粘贴素材摘录：\n${trimHeadTailForPrompt(manual, 1200, "手动素材")}` : ""
  ].filter(Boolean).join("\n");
  return trimHeadTailForPrompt(fallback, OUTLINE_CHECK_EVIDENCE_MAX_LENGTH, "检查大纲上下文");
}

function outlineEvidencePromptLengthEstimate() {
  const compressed = compactLayeredEvidenceContext(OUTLINE_EVIDENCE_INDEX_MAX_LENGTH);
  if (compressed) return Math.min(compressed.length, OUTLINE_EVIDENCE_INDEX_MAX_LENGTH);
  const cards = String(state.outlineEvidenceCards || "").trim();
  if (cards) return Math.min(cards.length, OUTLINE_EVIDENCE_MAX_LENGTH);
  const hasChapters = draftedChaptersForEvidence().length > 0;
  const manualLength = String(state.quickSourceText || "").trim().length;
  return Math.min(
    16000,
    chapterLibraryIndexText(160).length + (hasChapters ? 9000 : 0) + Math.min(manualLength, 5000)
  );
}

function chapterEvidenceKey(chapter) {
  return String(chapter?.id || `chapter-number-${Number(chapter?.number || 0)}`);
}

function chapterEvidenceHash(chapter) {
  return shortHash([
    Number(chapter?.number || 0),
    String(chapter?.title || ""),
    String(chapter?.status || ""),
    String(chapter?.notes || ""),
    String(chapter?.draft || "")
  ].join("\n---chapter-evidence---\n"));
}

function markChapterEvidenceDirty(chapter) {
  const key = chapterEvidenceKey(chapter);
  if (!key) return;
  const current = new Set(Array.isArray(state.outlineEvidenceDirtyChapterIds) ? state.outlineEvidenceDirtyChapterIds : []);
  current.add(key);
  state.outlineEvidenceDirtyChapterIds = Array.from(current);
}

function markChaptersEvidenceDirty(chapters) {
  chapters.forEach((chapter) => {
    if (chapterWordCount(chapter) > 0) markChapterEvidenceDirty(chapter);
  });
}

function markChaptersEvidenceScanned(chapters) {
  const hashes = state.outlineEvidenceChapterHashes && typeof state.outlineEvidenceChapterHashes === "object"
    ? { ...state.outlineEvidenceChapterHashes }
    : {};
  const dirty = new Set(Array.isArray(state.outlineEvidenceDirtyChapterIds) ? state.outlineEvidenceDirtyChapterIds : []);
  chapters.forEach((chapter) => {
    const key = chapterEvidenceKey(chapter);
    hashes[key] = chapterEvidenceHash(chapter);
    dirty.delete(key);
  });
  state.outlineEvidenceChapterHashes = hashes;
  state.outlineEvidenceDirtyChapterIds = Array.from(dirty);
}

function pendingOutlineEvidenceScanChapters(chapters = draftedChaptersForEvidence()) {
  const covered = Number(state.outlineEvidenceUpdatedToChapter || 0);
  const hashes = state.outlineEvidenceChapterHashes && typeof state.outlineEvidenceChapterHashes === "object"
    ? state.outlineEvidenceChapterHashes
    : {};
  const dirty = new Set(Array.isArray(state.outlineEvidenceDirtyChapterIds) ? state.outlineEvidenceDirtyChapterIds : []);
  return chapters.filter((chapter) => {
    const number = Number(chapter.number || 0);
    const key = chapterEvidenceKey(chapter);
    const hash = chapterEvidenceHash(chapter);
    return number > covered || dirty.has(key) || !hashes[key] || hashes[key] !== hash;
  });
}

function outlineCheckEvidencePromptLengthEstimate() {
  const compressed = compactLayeredEvidenceContext(OUTLINE_CHECK_EVIDENCE_MAX_LENGTH);
  if (compressed) return Math.min(compressed.length, OUTLINE_CHECK_EVIDENCE_MAX_LENGTH);
  const cards = String(state.outlineEvidenceCards || "").trim();
  if (cards) return Math.min(cards.length, OUTLINE_CHECK_EVIDENCE_MAX_LENGTH);
  const manualLength = String(state.quickSourceText || "").trim().length;
  return Math.min(
    OUTLINE_CHECK_EVIDENCE_MAX_LENGTH,
    chapterLibraryIndexText(80).length + 2200 + Math.min(manualLength, 1200)
  );
}

function compactLayeredEvidenceContext(maxLength = OUTLINE_EVIDENCE_INDEX_MAX_LENGTH, sections = ["global", "characters", "foreshadow", "arcs"]) {
  const blocks = [];
  if (sections.includes("global") && String(state.outlineEvidenceGlobalSummary || "").trim()) {
    blocks.push(`## 世界观设定库\n${state.outlineEvidenceGlobalSummary.trim()}`);
  }
  if (sections.includes("characters") && String(state.outlineEvidenceCharacterIndex || "").trim()) {
    blocks.push(`## 人物状态 + 小摘要\n${state.outlineEvidenceCharacterIndex.trim()}`);
  }
  if (sections.includes("foreshadow") && String(state.outlineEvidenceForeshadowIndex || "").trim()) {
    blocks.push(`## 伏笔线索库\n${state.outlineEvidenceForeshadowIndex.trim()}`);
  }
  if (sections.includes("arcs") && String(state.outlineEvidenceArcSummaries || "").trim()) {
    blocks.push(`## 剧情事实库\n${state.outlineEvidenceArcSummaries.trim()}`);
  }
  if (!blocks.length) return "";
  return trimHeadTailForPrompt(blocks.join("\n\n"), maxLength, "AI精简资料");
}

function layeredEvidenceWithDelta(task = "general", maxLength = 12000) {
  const taskSections = {
    outline: ["global", "characters", "foreshadow", "arcs"],
    analysis: ["global", "characters", "foreshadow", "arcs"],
    planning: ["global", "characters", "foreshadow"],
    draft: ["global", "characters", "foreshadow"],
    ending: ["foreshadow", "characters", "arcs", "global"],
    recovery: ["global", "characters", "foreshadow", "arcs"],
    light: ["global", "characters", "foreshadow"],
    general: ["global", "characters", "foreshadow", "arcs"]
  };
  const layered = compactLayeredEvidenceContext(Math.max(3000, Math.floor(maxLength * 0.78)), taskSections[task] || taskSections.general);
  if (!layered) return "";
  const hasDelta = Number(state.outlineEvidenceUpdatedToChapter || 0) > Number(state.outlineEvidenceCompressedToChapter || 0);
  if (!hasDelta) return layered;
  const cards = outlineEvidencePendingCardsText();
  if (!cards) return layered;
  const deltaBudget = Math.max(2200, maxLength - layered.length);
  return [
    layered,
    `## 快速更新新增资料（已更新到第${state.outlineEvidenceUpdatedToChapter || "?"}章，深度整理到第${state.outlineEvidenceCompressedToChapter || "?"}章）`,
    trimHeadTailForPrompt(cards, deltaBudget, "快速更新新增资料")
  ].join("\n\n");
}

function evidenceContextForTask(task = "general", maxLength = 10000) {
  const layered = layeredEvidenceWithDelta(task, maxLength);
  if (layered) return layered;
  return compactOutlineEvidenceContext(maxLength);
}

function chapterFulfillmentRecordFromNotes(notes, maxLength = 1100) {
  const text = String(notes || "").trim();
  const marker = "【本章兑现记录】";
  const index = text.lastIndexOf(marker);
  if (index < 0) return "";
  const record = text.slice(index).trim();
  return trimHeadTailForPrompt(record, maxLength, "本章兑现记录");
}

function chapterFulfillmentRevisionTaskRisks() {
  return draftedChaptersForEvidence()
    .map((chapter) => {
      const record = chapterFulfillmentRecordFromNotes(chapter.notes, 2200);
      const text = (record.match(/^未处理高优先级修改任务[:：]\s*(.+)$/m)?.[1] || "").trim();
      if (!text || /^无[。.]?$/.test(text)) return null;
      return {
        chapterNumber: Number(chapter.number || 0),
        label: chapterLabel(chapter),
        text: compactLine(text, 180)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.chapterNumber - a.chapterNumber);
}

function chapterFulfillmentRevisionTaskRiskSummary(limit = 5) {
  const risks = chapterFulfillmentRevisionTaskRisks();
  if (!risks.length) return "";
  const lines = risks.slice(0, limit).map((item) => `- ${item.label}：${item.text}`);
  const more = risks.length > limit ? `\n- 另有 ${risks.length - limit} 章也有保存记录待复查。` : "";
  return `保存记录待复查：${risks.length} 章保存时仍带高优先级修改任务，需要确认是否已修复或后续补偿。\n${lines.join("\n")}${more}`;
}

function outlineEvidenceBatchText(chapters) {
  return chapters.map((chapter) => [
    "# " + chapterLabel(chapter),
    "状态：" + chapterStatusText(chapter.status) + "，字数：" + chapterWordCount(chapter),
    chapter.notes ? "章节备注：" + compactLine(chapter.notes, 360) : "章节备注：无",
    chapterFulfillmentRecordFromNotes(chapter.notes)
      ? "本章兑现记录：\n" + chapterFulfillmentRecordFromNotes(chapter.notes)
      : "本章兑现记录：无",
    "",
    chapterDraftExcerpt(chapter, OUTLINE_EVIDENCE_CHAPTER_LIMIT)
  ].join("\n")).join("\n\n---\n\n");
}

function outlineEvidenceProjectSnapshot() {
  const latest = lastDraftedChapter();
  const stats = chapterStats();
  return [
    `作品名：${state.projectTitle || "未命名"}`,
    `类型：${state.genre || "未定"}`,
    `平台：${state.platform || "未定"}`,
    `核心卖点：${compactLine(state.corePromise || "待补充", 160)}`,
    `正文库最新章节：${latest ? chapterLabel(latest) : "暂无"}`,
    `正文库已写章节：${stats.drafted} 章，正文约 ${stats.totalWords} 字`,
    `本批任务只做历史正文证据提取，不得覆盖最新续写锚点。`
  ].join("\n");
}

function buildOutlineEvidenceScanPrompt(chapters, batchIndex, batchTotal) {
  return `你正在为一部长篇连载小说建立“全书证据库”。这是第 ${batchIndex}/${batchTotal} 批章节。

任务目标：
只从本批正文章节里提取已经发生、已经确认、已经埋下的事实，供后续整理项目大纲使用。

严格要求：
1. 不要写未来章节建议，不要推断下一章，不要续写正文。
2. 不要把猜测写成事实；不确定内容标【待确认】。
3. 正文事实优先级高于旧项目大纲；如果发现冲突，只标注冲突，不要替作者拍板。
4. 输出要压缩，保留对长期大纲有价值的信息。
5. 每章正文如果被截取，会保留开头、中段采样和结尾；中段采样里的伏笔、交易、道具来源、人物状态变化不能忽略。

请按以下结构输出：
## 批次范围
写明本批包含哪些章节。

## 剧情事实
按章节顺序列出关键事件，每条尽量短。

## 人物状态变化
列出主要人物的新状态、立场、伤势、关系、目标或秘密变化。

## 人物关系变化
列出关系推进、信任变化、矛盾升级或合作变化。

## 世界观/背景事实
列出本批确认的新设定、规则、地点、组织、资源或能力边界。

## 伏笔与信息
分成“新埋伏笔”“已回收伏笔”“仍未回收伏笔”。

## 章节方向兑现核对
如果章节资料包含“本章兑现记录”，逐章核对计划目标、必须出现/读者奖励、实际正文是否兑现、未兑现或偏航、需要补偿的伏笔/人物状态；没有记录写“暂无兑现记录”。

## 与旧大纲或记忆卡的冲突
只列冲突或疑点；没有就写“暂无明确冲突”。

## 可写入项目大纲的长期信息
只列能进入核心卖点、世界观、主要人物、人物关系、阶段主线、未回收伏笔、长期结局/回收方向的信息。

作品信息：
${outlineEvidenceProjectSnapshot()}

当前项目大纲（仅作对照，不可覆盖正文事实）：
${trimHeadTailForPrompt(state.projectOutline || "暂无项目大纲", 1800, "项目大纲")}

当前小说理解结果（仅作辅助）：
${trimHeadTailForPrompt(state.quickAnalysis || "暂无小说理解结果", 900, "小说理解结果")}

本批正文章节：
${outlineEvidenceBatchText(chapters)}

章节兑现核对硬要求：输出中必须增加“## 章节方向兑现核对”。如果章节资料里有“本章兑现记录”，必须逐章核对计划目标、必须出现/读者奖励、实际正文是否兑现、未兑现或偏航、需要补偿的伏笔/人物状态；没有记录写“暂无兑现记录”。`;
}

function appendOutlineEvidenceCard(chapters, content) {
  const first = chapters[0];
  const last = chapters[chapters.length - 1];
  const header = `## 证据批次：${chapterLabel(first)} - ${chapterLabel(last)}`;
  const card = `${header}\n${String(content || "").trim()}`;
  const next = [String(state.outlineEvidenceCards || "").trim(), card]
    .filter(Boolean)
    .join("\n\n---\n\n");
  const pendingNext = [String(state.outlineEvidencePendingCards || "").trim(), card]
    .filter(Boolean)
    .join("\n\n---\n\n");
  state.outlineEvidenceCards = trimHeadTailForPrompt(next, OUTLINE_EVIDENCE_MAX_LENGTH, "全书证据库");
  state.outlineEvidencePendingCards = trimHeadTailForPrompt(pendingNext, OUTLINE_EVIDENCE_COMPRESSION_BATCH_LIMIT, "AI资料库新增资料");
  const minChapter = Math.min(...chapters.map((chapter) => Number(chapter.number || 0)));
  const maxChapter = Math.max(...chapters.map((chapter) => Number(chapter.number || 0)));
  state.outlineEvidencePendingFromChapter = state.outlineEvidencePendingFromChapter
    ? Math.min(Number(state.outlineEvidencePendingFromChapter || minChapter), minChapter)
    : minChapter;
  state.outlineEvidencePendingToChapter = Math.max(Number(state.outlineEvidencePendingToChapter || 0), maxChapter);
  state.outlineEvidencePendingUpdatedAt = new Date().toISOString();
  state.outlineEvidenceUpdatedToChapter = Math.max(
    Number(state.outlineEvidenceUpdatedToChapter || 0),
    ...chapters.map((chapter) => Number(chapter.number || 0))
  );
  state.outlineEvidenceUpdatedAt = new Date().toISOString();
  markChaptersEvidenceScanned(chapters);
}

async function scanOutlineEvidenceLibrary() {
  syncFields();
  if (isShortStory()) {
    setStatus("短篇模式不需要 AI资料库");
    return { processed: 0, batches: 0 };
  }
  const drafted = draftedChaptersForEvidence();
  if (!drafted.length) {
    setStatus("正文库还没有可更新章节");
    return { processed: 0, batches: 0 };
  }
  const pending = pendingOutlineEvidenceScanChapters(drafted);
  if (!pending.length) {
    updateOutlineEvidenceUi();
    setStatus("AI资料库已经覆盖最新章节");
    return { processed: 0, batches: 0 };
  }
  const batches = [];
  for (let index = 0; index < pending.length; index += OUTLINE_EVIDENCE_BATCH_SIZE) {
    batches.push(pending.slice(index, index + OUTLINE_EVIDENCE_BATCH_SIZE));
  }
  const output = $("#outlineResult");
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const range = `${chapterLabel(batch[0])} - ${chapterLabel(batch[batch.length - 1])}`;
    const message = `正在更新 AI资料库 ${index + 1}/${batches.length}：${range}`;
    if (output) output.value = message;
    setStatus(message);
    try {
      const content = await callAi(buildOutlineEvidenceScanPrompt(batch, index + 1, batches.length), {
        task: "outline",
        maxTokens: 1800
      });
      appendOutlineEvidenceCard(batch, content);
      persist();
      await silentSaveProjectSnapshotToLibrary("outline-evidence");
      updateOutlineEvidenceUi();
      markUsageEstimateDirty("outline-evidence");
    } catch (error) {
      const partial = index > 0
        ? `已完成前 ${index} 批，本次停在 ${range}。下次再点“快速更新 AI资料库”会从未完成章节继续。`
        : `本次停在第一批 ${range}，未写入新的资料卡。`;
      const failMessage = [
        `AI资料库更新中断：${range}`,
        partial,
        "",
        `原因：${error.message || String(error)}`
      ].join("\n");
      state.aiKnowledgeOutput = failMessage;
      state.aiKnowledgeUpdatedAt = new Date().toISOString();
      if (output) output.value = failMessage;
      persist();
      updateOutlineEvidenceUi();
      setStatus("AI资料库更新中断，已保留完成批次");
      throw new Error(failMessage);
    }
  }
  const changedLabel = pending.some((chapter) => Number(chapter.number || 0) <= Number(state.outlineEvidenceUpdatedToChapter || 0))
    ? `新增/修订 ${pending.length} 章`
    : `新增 ${pending.length} 章`;
  const deepHint = pending.length > EVIDENCE_FAST_UPDATE_THRESHOLD
    ? `\n\n${changedLabel}，建议点“深度整理资料库”合并人物、伏笔、世界观和剧情资料。`
    : `\n\n${changedLabel}，未超过${EVIDENCE_FAST_UPDATE_THRESHOLD}章缓冲，可直接继续生成。`;
  const done = `${outlineEvidenceStatusText()}${deepHint}`;
  state.aiKnowledgeOutput = done;
  state.aiKnowledgeUpdatedAt = new Date().toISOString();
  if (output) output.value = done;
  persist();
  updateMemorySummaryCards();
  updatePrompt("quick");
  setStatus("AI资料库正文读取完成");
  return { processed: pending.length, batches: batches.length };
}

function clearOutlineEvidenceLibrary() {
  state.outlineEvidenceCards = "";
  state.outlineEvidencePendingCards = "";
  state.outlineEvidencePendingFromChapter = 0;
  state.outlineEvidencePendingToChapter = 0;
  state.outlineEvidencePendingUpdatedAt = "";
  state.outlineEvidenceUpdatedToChapter = 0;
  state.outlineEvidenceUpdatedAt = "";
  state.outlineEvidenceChapterHashes = {};
  state.outlineEvidenceDirtyChapterIds = [];
  state.outlineEvidenceArcSummaries = "";
  state.outlineEvidenceGlobalSummary = "";
  state.outlineEvidenceCharacterIndex = "";
  state.outlineEvidenceForeshadowIndex = "";
  state.outlineEvidenceCompressedAt = "";
  state.outlineEvidenceCompressedToChapter = 0;
  updateOutlineEvidenceUi();
  markUsageEstimateDirty("clear-outline-evidence");
  persist();
  setStatus("已清空 AI资料库");
}

function splitOutlineEvidenceCards() {
  return splitEvidenceCardText(state.outlineEvidenceCards);
}

function splitPendingEvidenceCards() {
  return splitEvidenceCardText(outlineEvidencePendingCardsText());
}

function chunkEvidenceCards(cards, maxLength = OUTLINE_EVIDENCE_COMPRESSION_BATCH_LIMIT) {
  const chunks = [];
  let current = [];
  let currentLength = 0;
  cards.forEach((card) => {
    const length = card.length + 12;
    if (current.length && currentLength + length > maxLength) {
      chunks.push(current.join("\n\n---\n\n"));
      current = [];
      currentLength = 0;
    }
    current.push(card);
    currentLength += length;
  });
  if (current.length) chunks.push(current.join("\n\n---\n\n"));
  return chunks;
}

function buildEvidenceStageCompressionPrompt(chunk, index, total) {
  return `请把下面这批“章节证据卡”压缩成阶段摘要。当前是第 ${index}/${total} 批。

压缩目标：
1. 保留已经发生的正文事实，不要续写，不要规划未来章节。
2. 压缩重复信息，保留能影响长期连载、大纲、人物、伏笔和完结的内容。
3. 不确定内容标【待确认】；合理推断标【推断】；正文明确发生标【已确定】。

请严格按以下结构输出：
## 阶段范围
概括本批证据覆盖的章节范围。

## 阶段主线事实
压缩列出本阶段已经发生的关键剧情事实。

## 人物状态变化
列出人物状态、立场、关系、目标、秘密、伤势或资源变化。

## 世界观/背景更新
列出新确认的规则、地点、组织、资源、能力边界。

## 伏笔索引
分成“新埋伏笔”“已回收伏笔”“仍未回收伏笔”。

## 章节方向兑现核对
如果证据卡包含“本章兑现记录”，逐章写清：计划目标是否兑现、必须出现/读者奖励是否落地、未兑现或偏航点、需要后续补偿的伏笔或人物状态；没有记录写“暂无兑现记录”。

## 冲突与待确认
列出与旧大纲、记忆卡或证据内部冲突的地方；没有就写“暂无明确冲突”。

## 可进入全局总设定库的信息
只列长期稳定、后续反复需要引用的信息。

作品信息：
${summarizeProject()}

章节证据卡：
${chunk}`;
}

function extractSingleMarkdownSection(text, title) {
  const source = String(text || "").trim();
  const escaped = String(title || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return "";
  const startMatch = source.match(new RegExp(`^#{1,3}\\s*${escaped}\\s*$`, "im"));
  if (!startMatch) return "";
  const rest = source.slice(startMatch.index + startMatch[0].length);
  const endMatch = rest.match(/^#{1,3}\s*.+\s*$/im);
  return (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
}

function buildEvidenceIndexMergePrompt(stageSummaries) {
  return `请把下面的“阶段摘要”合并成一个长期可复用的分层证据库。

合并目标：
1. 不要续写正文，不要生成未来章节建议。
2. 只保留已经发生、已经确认、或者必须标注【推断】【待确认】的长期信息。
3. 输出要压缩，方便后续大纲、记忆卡、推断、完结规划按需引用。
4. 不要把同一伏笔或同一人物状态重复写很多遍，合并为最新状态。
5. 不要额外输出“项目圣经总览”；项目圣经由系统根据以下四库自动汇总。

请严格按以下四个一级标题输出：
## 剧情事实库
按阶段或章节范围概括主线推进、阶段高潮、已完成内容和当前停靠点。

## 世界观设定库
保存核心卖点、世界观/背景、主要规则、长期主线、重要设定边界、长期结局或回收方向。

## 人物状态库
按人物列：当前状态、关系、目标、秘密、已发生关键事实、后续不能违背的限制。

## 伏笔线索库
分为“未回收伏笔”“已回收伏笔”“待确认伏笔/疑点”。每条尽量包含来源、当前状态、风险和回收方向。

阶段摘要：
章节方向兑现核对合并要求：如果阶段摘要里包含“章节方向兑现核对”或“本章兑现记录”，请把已兑现内容并入“剧情事实库”，把未兑现或偏航内容并入“伏笔线索库”的待回收/待补偿项，涉及人物状态变化的内容并入“人物状态库”。
${trimHeadTailForPrompt(stageSummaries, 26000, "阶段摘要")}`;
}

function buildEvidenceIncrementalMergePrompt(pendingCards) {
  return `请把“新增章节资料”合并进已有 AI资料库。

目标：
1. 只根据新增资料更新已有资料库，不要续写正文，不要规划未来章节。
2. 如果某个资料库没有变化，保留原内容，不要为了凑字而改写。
3. 输出必须是四个完整资料库，方便系统直接替换保存。
4. 新增信息必须优先尊重正文事实；不确定内容标【待确认】，合理推断标【推断】。
5. 如果新增资料包含“章节方向兑现核对”或“本章兑现记录”，必须把已兑现内容并入“剧情事实库”，把未兑现、偏航、待补偿内容并入“伏笔线索库”，人物关系或状态变化并入“人物状态库”。
6. 不要额外输出“项目圣经总览”；项目圣经由系统根据四库自动汇总。

请严格按以下四个一级标题输出：
## 剧情事实库
更新剧情事实库：阶段主线、已发生关键事件、当前停靠点。

## 世界观设定库
更新世界观设定库：核心卖点、规则、地点、组织、资源、长期主线、设定边界。

## 人物状态库
更新人物状态库：当前状态、关系、目标、秘密、伤势、资源、不能违背的限制。

## 伏笔线索库
更新伏笔线索库：未回收、已回收、待确认伏笔/疑点，尽量包含来源和当前状态。

已有 AI资料库：
## 剧情事实库
${state.outlineEvidenceArcSummaries || "暂无"}

## 世界观设定库
${state.outlineEvidenceGlobalSummary || "暂无"}

## 人物状态库
${state.outlineEvidenceCharacterIndex || "暂无"}

## 伏笔线索库
${state.outlineEvidenceForeshadowIndex || "暂无"}

新增章节资料（${pendingEvidenceRangeLabel()}）：
${trimHeadTailForPrompt(pendingCards, 18000, "新增章节资料")}`;
}

function clearPendingEvidenceCards() {
  state.outlineEvidencePendingCards = "";
  state.outlineEvidencePendingFromChapter = 0;
  state.outlineEvidencePendingToChapter = 0;
  state.outlineEvidencePendingUpdatedAt = "";
}

function applyEvidenceIndexResult(result, stageSummaries, options = {}) {
  const arcs = extractSingleMarkdownSection(result, "剧情事实库")
    || extractSingleMarkdownSection(result, "阶段/分卷摘要")
    || stageSummaries;
  const global = extractSingleMarkdownSection(result, "世界观设定库")
    || extractSingleMarkdownSection(result, "全局总设定库");
  const characters = extractSingleMarkdownSection(result, "人物状态库");
  const foreshadow = extractSingleMarkdownSection(result, "伏笔线索库")
    || extractSingleMarkdownSection(result, "伏笔索引库");
  state.outlineEvidenceArcSummaries = trimHeadTailForPrompt(arcs || state.outlineEvidenceArcSummaries, 9000, "阶段摘要");
  state.outlineEvidenceGlobalSummary = trimHeadTailForPrompt(global || state.outlineEvidenceGlobalSummary, 7000, "世界观设定库");
  state.outlineEvidenceCharacterIndex = trimHeadTailForPrompt(characters || state.outlineEvidenceCharacterIndex, 7000, "人物状态库");
  state.outlineEvidenceForeshadowIndex = trimHeadTailForPrompt(foreshadow || state.outlineEvidenceForeshadowIndex, 9000, "伏笔线索库");
  state.outlineEvidenceCompressedAt = new Date().toISOString();
  state.outlineEvidenceCompressedToChapter = Number(state.outlineEvidenceUpdatedToChapter || 0);
  if (options.clearPending !== false) clearPendingEvidenceCards();
}

async function compressOutlineEvidenceLibrary() {
  syncFields();
  if (isShortStory()) {
    setStatus("短篇模式不需要整理 AI资料库");
    return;
  }
  const pendingCardsText = outlineEvidencePendingCardsText();
  const hasExistingIndex = Boolean(String(state.outlineEvidenceGlobalSummary || state.outlineEvidenceArcSummaries || "").trim());
  if (hasExistingIndex && pendingCardsText) {
    await persistBeforeAiTask("outline", { sync: false });
    const output = $("#outlineResult");
    const message = `正在深度整理新增资料：${pendingEvidenceRangeLabel()}，预计 1 次 AI 调用`;
    if (output) output.value = message;
    setStatus(message);
    const result = await callAi(buildEvidenceIncrementalMergePrompt(pendingCardsText), {
      task: "outline",
      maxTokens: 5200
    });
    applyEvidenceIndexResult(result, state.outlineEvidenceArcSummaries, { clearPending: true });
    const done = [
      "AI资料库已完成增量深度整理。",
      "",
      outlineEvidenceStatusText(),
      "",
      "已更新：剧情事实库、世界观设定库、人物状态库、伏笔线索库。"
    ].join("\n");
    state.aiKnowledgeOutput = done;
    state.aiKnowledgeUpdatedAt = new Date().toISOString();
    markStructuralRefreshComplete();
    if (output) output.value = done;
    persist();
    updateOutlineEvidenceUi();
    updateMemorySummaryCards();
    updatePrompt("quick");
    markUsageEstimateDirty("incremental-organize-evidence");
    setStatus("AI资料库增量整理完成");
    return;
  }
  if (hasExistingIndex && !pendingCardsText) {
    setStatus("AI资料库已经深度整理完成，无新增资料");
    updateOutlineEvidenceUi();
    return;
  }
  const cards = splitOutlineEvidenceCards();
  if (!cards.length) {
    setStatus("请先更新 AI资料库");
    return;
  }
  await persistBeforeAiTask("outline", { sync: false });
  const chunks = chunkEvidenceCards(cards);
  const output = $("#outlineResult");
  const stageSummaries = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const message = `正在整理 AI资料库 ${index + 1}/${chunks.length}：生成阶段摘要`;
    if (output) output.value = message;
    setStatus(message);
    const summary = await callAi(buildEvidenceStageCompressionPrompt(chunks[index], index + 1, chunks.length), {
      task: "outline",
      maxTokens: 2600
    });
    stageSummaries.push(summary);
  }
  const mergedStageSummaries = trimHeadTailForPrompt(stageSummaries.join("\n\n---\n\n"), 26000, "阶段摘要");
  if (output) output.value = "正在合并阶段摘要，生成全局总设定、人物资料和伏笔资料...";
  setStatus("正在生成 AI精简资料");
  const result = await callAi(buildEvidenceIndexMergePrompt(mergedStageSummaries), {
    task: "outline",
    maxTokens: 5200
  });
  applyEvidenceIndexResult(result, mergedStageSummaries);
  const done = [
    "AI精简资料已生成。",
    "",
    outlineEvidenceStatusText(),
    "",
    "已生成：阶段/分卷摘要、全局总设定库、人物状态库、伏笔索引库。",
    "后续大纲、记忆卡、章节方向、完结规划会优先按需读取这些精简资料。"
  ].join("\n");
  state.aiKnowledgeOutput = done;
  state.aiKnowledgeUpdatedAt = new Date().toISOString();
  markStructuralRefreshComplete();
  if (output) output.value = done;
  persist();
  updateOutlineEvidenceUi();
  updateMemorySummaryCards();
  updatePrompt("quick");
  markUsageEstimateDirty("compress-outline-evidence");
  setStatus("AI资料库整理完成");
}

async function updateAiKnowledgeLibrary() {
  syncFields();
  if (isShortStory()) {
    setStatus("短篇模式会直接读取短篇设定和草稿，不需要 AI资料库");
    return;
  }
  const drafted = draftedChaptersForEvidence();
  const output = $("#outlineResult");
  if (!drafted.length) {
    const selectedProject = selectedProjectLibraryTitle();
    if (selectedProject) {
      showOpenProjectBeforeEvidenceMessage(selectedProject);
      return;
    }
    setStatus("正文库还没有可更新章节");
    if (output) output.value = "正文库还没有可更新章节。请先导入或保存正文。";
    return;
  }
  await persistBeforeAiTask("outline", { sync: false });
  const before = outlineEvidenceMetrics();
  if (output) output.value = `正在快速更新 AI资料库：只读取正文库新增章节，预计 ${before.pendingUpdateCalls || 0} 次 AI 调用。`;
  const result = await scanOutlineEvidenceLibrary();
  const metrics = outlineEvidenceMetrics();
  const organizeHint = !metrics.hasIndex
    ? "当前还没有 AI精简资料。建议在方便时点“深度整理资料库”，生成剧情、人物、伏笔、世界观四类资料。"
    : (metrics.pendingChapters > EVIDENCE_FAST_UPDATE_THRESHOLD
      ? `新增 ${metrics.pendingChapters} 章已超过${EVIDENCE_FAST_UPDATE_THRESHOLD}章缓冲，建议点“深度整理资料库”。`
      : `新增资料未超过${EVIDENCE_FAST_UPDATE_THRESHOLD}章缓冲，可直接继续生成；深度整理可稍后手动执行。`);
  const done = [
    result?.processed ? "AI资料库快速更新完成。" : "AI资料库已是最新。",
    "",
    outlineEvidenceStatusText(),
    "",
    `快速更新调用：${result?.batches || 0} 次 AI。`,
    `深度整理预计：${metrics.deepOrganizeCalls || 0} 次 AI。`,
    organizeHint
  ].join("\n");
  state.aiKnowledgeOutput = done;
  state.aiKnowledgeUpdatedAt = new Date().toISOString();
  if (output) output.value = done;
  updateOutlineEvidenceUi();
  updateMemorySummaryCards();
  updatePrompt("quick");
  persist();
  setStatus(result?.processed ? "AI资料库快速更新完成" : "AI资料库已是最新");
}

function recentChaptersForEndingText(maxChapters = 5, maxEndingLength = 800) {
  const chapters = sortedChapters().filter((chapter) => chapterWordCount(chapter) > 0).slice(-maxChapters);
  if (!chapters.length) return "暂无已写正文";
  return chapters.map((chapter) => [
    `## ${chapterLabel(chapter)}`,
    `状态：${chapterStatusText(chapter.status)}，字数：${chapterWordCount(chapter)}`,
    `备注：${chapter.notes || "无"}`,
    `章节结尾：\n${chapterEndingText(chapter, maxEndingLength) || "暂无"}`
  ].join("\n")).join("\n\n---\n\n");
}

function plannedChaptersForEndingText() {
  const chapters = sortedChapters().filter((chapter) => chapterWordCount(chapter) === 0 && ["planned", "brief"].includes(String(chapter.status || "planned")));
  if (!chapters.length) return "暂无待写计划章节";
  return chapters.map((chapter) => [
    `${chapterLabel(chapter)} | 状态：${chapterStatusText(chapter.status)}`,
    `计划/备注：${chapter.notes || "无"}`
  ].join("\n")).join("\n\n");
}

function endingLibraryContextBlock() {
  const stats = chapterStats();
  return `正文库统计：
总章节：${state.chapters.length}
已写章节：${stats.drafted}
正文字数：${stats.totalWords}
最新已写章节：${stats.latest ? chapterLabel(stats.latest) : "暂无"}
待写计划章节：${plannedChaptersForEndingText()}

正文库章节索引：
${chapterLibraryIndexText()}

最近已写章节：
${recentChaptersForEndingText()}`;
}

function updateWritingContextBoard() {
  const title = $("#quickLatestChapterTitle");
  const ending = $("#quickLatestChapterEnding");
  if (isShortStory()) {
    const manual = String(state.quickSourceText || "").trim();
    const saved = lastDraftedChapter();
    if (manual) {
      if (title) title.textContent = `已有草稿 · ${manual.replace(/\s/g, "").length} 字`;
      if (ending) ending.textContent = compactPreview(manual, "已有短篇草稿会作为最高优先级参考。");
    } else if (saved) {
      if (title) title.textContent = `已保存短篇 · ${chapterWordCount(saved)} 字`;
      if (ending) ending.textContent = chapterEndingText(saved, 260) || "已保存的短篇正文会作为参考素材。";
    } else {
      if (title) title.textContent = "等待短篇素材";
      if (ending) ending.textContent = "可以只填故事设定，也可以粘贴已有短篇草稿后继续补全。";
    }
    updateProgressData();
    return;
  }
  const chapter = lastDraftedChapter();
  if (!chapter) {
    if (title) title.textContent = "正文库暂无有效正文";
    if (ending) ending.textContent = "可以先粘贴已有小说，或到正文库导入/新建章节。生成正文时会从第1章开始。";
    updateProgressData();
    return;
  }
  const words = chapterWordCount(chapter);
  if (title) title.textContent = `${chapterLabel(chapter)} · ${words} 字`;
  if (ending) {
    const text = chapterEndingText(chapter, 260);
    ending.textContent = text || "该章节暂无正文内容。";
  }
  updateProgressData();
}

function draftContinuityInstruction(twoChapterDraft) {
  const last = lastDraftedChapter();
  const next = nextChapterNumber();
  const second = next + 1;
  const lastLine = last
    ? `正文库当前已写到${chapterLabel(last)}，本次必须从第${next}章开始。`
    : `正文库还没有有效正文，本次从第${next}章开始。`;
  const titleLine = twoChapterDraft
    ? `两章模式下，第一章标题必须使用“# 第${next}章 标题”，第二章标题必须使用“# 第${second}章 标题”。`
    : `单章模式下，章标题必须使用“# 第${next}章 标题”。`;
  return `章节连续性硬规则：\n1. ${lastLine}\n2. ${titleLine}\n3. 不要重复旧章节编号，不要回到旧章节重写，不要把最近两个参考章节当成要改写的正文。\n4. 开头必须承接最近两个参考章节里的最新一章结尾；如果其他资料与最近章节冲突，以正文库最近章节为准。`;
}

function recentContextLimit() {
  const value = Number(state.recentContextChars || 5000);
  return Number.isFinite(value) ? Math.max(1500, Math.min(value, 12000)) : 5000;
}

function trimForPrompt(value, maxLength = 18000) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `【前文较长，以下保留末尾 ${maxLength} 字用于续写】\n${text.slice(-maxLength)}`;
}

function trimHeadTailForPrompt(value, maxLength = 6000, label = "内容") {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const safeMax = Math.max(400, Number(maxLength) || 6000);
  const headFloor = safeMax < 1800 ? 120 : 600;
  const headLength = Math.min(safeMax - 120, Math.max(headFloor, Math.floor(safeMax * 0.35)));
  const tailLength = Math.max(120, safeMax - headLength);
  return `【${label}较长，已压缩为开头+末尾摘录，保留核心设定和最近变化】\n${text.slice(0, headLength)}\n\n……【中段已省略】……\n\n${text.slice(-tailLength)}`;
}

function compactMarkdownSectionsForPrompt(value, maxLength = 7600, label = "内容") {
  const text = String(value || "").trim();
  if (!text || text.length <= maxLength) return text;
  const sections = text
    .split(/(?=^#{1,4}\s+)/m)
    .map((part) => part.trim())
    .filter(Boolean);
  if (sections.length < 3) return trimHeadTailForPrompt(text, maxLength, label);
  const perSection = Math.max(520, Math.floor((maxLength - 180) / sections.length));
  const compacted = sections
    .map((section) => trimHeadTailForPrompt(section, perSection, label))
    .join("\n\n");
  return `【${label}较长，已按标题板块压缩，保留各板块检查依据】\n${trimHeadTailForPrompt(compacted, maxLength, label)}`;
}

function fieldForDraftPrompt(value, maxLength, label, fallback) {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return trimHeadTailForPrompt(text, maxLength, label);
}

function chapterDraftExcerpt(chapter, maxLength = 3600) {
  const draft = String(chapter?.draft || "").trim();
  if (!draft) return "暂无正文";
  if (draft.length <= maxLength) return draft;
  const safeMax = Math.max(1200, Number(maxLength || 3600));
  const headLength = Math.max(420, Math.floor(safeMax * 0.24));
  const tailLength = Math.max(640, Math.floor(safeMax * 0.32));
  const sampleBudget = Math.max(420, safeMax - headLength - tailLength - 260);
  const sampleCount = draft.length > safeMax * 2.2 && sampleBudget >= 900 ? 2 : 1;
  const sampleLength = Math.max(360, Math.floor(sampleBudget / sampleCount));
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const sampleAt = (ratio) => {
    const maxStart = Math.max(headLength, draft.length - tailLength - sampleLength);
    const center = Math.floor(draft.length * ratio);
    const start = clamp(center - Math.floor(sampleLength / 2), headLength, maxStart);
    return draft.slice(start, start + sampleLength);
  };
  const middleSamples = sampleCount === 2
    ? [
        `【中段采样 1，约 1/3 位置】\n${sampleAt(0.38)}`,
        `【中段采样 2，约 2/3 位置】\n${sampleAt(0.62)}`
      ]
    : [`【中段采样，约 1/2 位置】\n${sampleAt(0.5)}`];
  return [
    `【本章较长，已保留开头 + 中段采样 + 结尾；原文约 ${draft.length} 字，摘录上限约 ${safeMax} 字】`,
    draft.slice(0, headLength),
    ...middleSamples,
    `【结尾，供承接停靠点】\n${draft.slice(-tailLength)}`
  ].join("\n\n……【省略】……\n\n");
}

function recentDraftContextForGeneration() {
  const drafted = sortedChapters().filter((chapter) => chapterWordCount(chapter) > 0);
  const manual = String(state.quickSourceText || "").trim();
  if (!drafted.length) {
    return manual
      ? trimForPrompt(manual, isShortStory() ? 12000 : (state.economyMode ? Math.max(5000, recentContextLimit()) : 14000))
      : "";
  }
  const maxTotal = state.economyMode ? Math.max(5000, recentContextLimit()) : 14000;
  const chapters = drafted.slice(-3);
  const latest = chapters[chapters.length - 1];
  const olderBudget = Math.max(900, Math.floor(maxTotal * 0.22));
  const latestBudget = Math.max(2600, maxTotal - olderBudget * Math.max(0, chapters.length - 1));
  const blocks = chapters.map((chapter) => {
    const isLatest = chapter === latest;
    const budget = isLatest ? latestBudget : olderBudget;
    return [
      `# ${chapterLabel(chapter)}`,
      `状态：${chapterStatusText(chapter.status)}，字数：${chapterWordCount(chapter)}`,
      chapter.notes ? `备注：${compactLine(chapter.notes, 240)}` : "备注：无",
      `正文摘录：\n${chapterDraftExcerpt(chapter, budget)}`
    ].join("\n");
  });
  if (manual) {
    blocks.push(`手动补充素材：\n${trimForPrompt(manual, 2000)}`);
  }
  return blocks.join("\n\n---\n\n");
}

function buildDraftContextPackage() {
  const stats = chapterStats();
  const latest = stats.latest;
  const reference = recentTwoChaptersReference(state.economyMode ? 4200 : 5600);
  const packageLines = [
    "【生成专用上下文包】",
    "说明：这是为正文生成压缩后的资料包。只保留正文库进度和最近两个已写章节，不带其他章节正文。",
    `正文库进度：已写 ${stats.drafted} 章，正文 ${stats.totalWords} 字，最新章节：${latest ? chapterLabel(latest) : "暂无"}，下一章编号：第${nextChapterNumber()}章。`,
    "",
    "最近两个已写章节参考：",
    reference || "暂无可用章节参考"
  ];
  return packageLines.join("\n");
}

function chapterProgressContextLine() {
  const stats = chapterStats();
  const latest = stats.latest;
  return `正文库进度：已写 ${stats.drafted} 章，正文 ${stats.totalWords} 字，最新章节：${latest ? chapterLabel(latest) : "暂无"}，下一章编号：第${nextChapterNumber()}章。`;
}

function manualSupplementBlock(maxLength = 2200) {
  const manual = String(state.quickSourceText || "").trim();
  if (!manual) return "";
  return `手动补充素材：\n${trimHeadTailForPrompt(manual, maxLength, "手动补充素材")}`;
}

function compactOutlineContext(maxLength = 5200) {
  return fieldForDraftPrompt(state.projectOutline, maxLength, isShortStory() ? "故事设定" : "项目大纲", "暂无");
}

function compactAnalysisContext(maxLength = 3200) {
  return fieldForDraftPrompt(state.quickAnalysis, maxLength, isShortStory() ? "短篇理解结果" : "小说记忆卡", "暂无");
}

function compactBriefContext(maxLength = 4200) {
  return fieldForDraftPrompt(state.quickBrief, maxLength, isShortStory() ? "短篇骨架" : directionLabel(), "暂无");
}

function compactProjectBibleContext(maxLength = 3200) {
  return fieldForDraftPrompt(
    projectBibleSummaryForAi(maxLength),
    maxLength,
    "项目圣经总览",
    "暂无项目圣经总览。"
  );
}

function compactOutlineEvidenceContext(maxLength = 14000) {
  const cards = String(state.outlineEvidenceCards || "").trim();
  if (cards) return trimHeadTailForPrompt(cards, maxLength, "全书证据库");
  return [
    "证据库尚未扫描。以下只使用正文库索引和最近章节作为临时依据：",
    "",
    "正文库章节索引：",
    chapterLibraryIndexText(160),
    "",
    "最近两个已写章节：",
    recentTwoChaptersReference(state.economyMode ? 3600 : 4800) || "暂无最近章节"
  ].join("\n");
}

function buildAnalysisContextPackage() {
  if (isShortStory()) {
    return trimForPrompt(existingNovelText({ preferChapters: true, includeNotes: false }), state.economyMode ? 10000 : 16000);
  }
  const packageLines = [
    "【小说记忆卡上下文包】",
    "说明：用于更新小说理解结果。优先读取项目大纲、全书证据库和最近两个章节，不发送整本正文。",
    chapterProgressContextLine(),
    "",
    "项目大纲摘要：",
    compactOutlineContext(state.economyMode ? 5200 : 7000),
    "",
    "项目圣经总览：",
    compactProjectBibleContext(state.economyMode ? 2400 : 3400),
    "",
    "全书证据库/正文事实：",
    evidenceContextForTask("analysis", state.economyMode ? 12000 : 18000),
    "",
    "最近两个已写章节：",
    recentTwoChaptersReference(state.economyMode ? 3600 : 5200) || "暂无最近章节",
    "",
    manualSupplementBlock(2000)
  ].filter(Boolean);
  return packageLines.join("\n");
}

function buildPlanningContextPackage() {
  if (isShortStory()) {
    const source = existingNovelText({ preferChapters: true, includeNotes: false });
    if (!state.economyMode) return trimForPrompt(source, 16000);
    const limit = state.quickAnalysis.trim() ? recentContextLimit() : Math.max(8000, recentContextLimit());
    return trimForPrompt(source, limit);
  }
  const directionName = directionLabel();
  const packageLines = [
    `【${directionName}上下文包】`,
    `说明：只用于推断${directionName}，不发送整本正文。`,
    chapterProgressContextLine(),
    "",
    "项目大纲：",
    compactOutlineContext(state.economyMode ? 5200 : 7000),
    "",
    "项目圣经总览：",
    compactProjectBibleContext(state.economyMode ? 2400 : 3400),
    "",
    "小说记忆卡：",
    compactAnalysisContext(state.economyMode ? 3200 : 4800),
    "",
    "全书证据库摘要：",
    evidenceContextForTask("planning", state.economyMode ? 7000 : 11000),
    "",
    "正文库最近两个章节：",
    recentTwoChaptersReference(state.economyMode ? 4200 : 5600) || "暂无最近章节",
    "",
    "正文库待写章节计划：",
    nextPlannedChapterContext(1400) || "暂无待写计划",
    "",
    manualSupplementBlock(1600)
  ].filter(Boolean);
  return packageLines.join("\n");
}

function buildLightToolContextPackage() {
  return [
    "【轻量项目上下文】",
    chapterProgressContextLine(),
    "",
    "项目大纲摘要：",
    compactOutlineContext(3600),
    "",
    "项目圣经总览：",
    compactProjectBibleContext(2200),
    "",
    "小说记忆卡摘要：",
    compactAnalysisContext(2400),
    "",
    `${directionLabel()}摘要：`,
    compactBriefContext(2600),
    "",
    "证据索引摘要：",
    evidenceContextForTask("light", 3600),
    "",
    "最近两个已写章节：",
    recentTwoChaptersReference(2800) || "暂无最近章节"
  ].join("\n");
}

function buildRecoveryContextPackage() {
  return [
    "【断更恢复上下文包】",
    "说明：用于恢复连载状态，读取长期事实、记忆卡和最近章节，不发送整本正文。",
    chapterProgressContextLine(),
    "",
    "项目大纲：",
    compactOutlineContext(5200),
    "",
    "项目圣经总览：",
    compactProjectBibleContext(2800),
    "",
    "小说记忆卡：",
    compactAnalysisContext(3600),
    "",
    "全书证据库摘要：",
    evidenceContextForTask("recovery", 9000),
    "",
    "最近两个已写章节：",
    recentTwoChaptersReference(4200) || "暂无最近章节",
    "",
    `${directionLabel()}：`,
    compactBriefContext(2600)
  ].join("\n");
}

function buildEndingContextPackage() {
  return [
    "【完结规划上下文包】",
    "说明：用于收束主线、回收伏笔和倒排完结，不发送整本正文。",
    chapterProgressContextLine(),
    "",
    "项目大纲：",
    compactOutlineContext(6200),
    "",
    "项目圣经总览：",
    compactProjectBibleContext(3600),
    "",
    "小说记忆卡：",
    compactAnalysisContext(3600),
    "",
    "全书证据库/长期事实：",
    evidenceContextForTask("ending", 14000),
    "",
    "正文库结构摘要：",
    endingLibraryContextBlock(),
    "",
    `${directionLabel()}：`,
    compactBriefContext(2800),
    "",
    "最近两个已写章节：",
    recentTwoChaptersReference(4200) || "暂无最近章节"
  ].join("\n");
}

function sourceForMemoryCard() {
  return buildAnalysisContextPackage();
}

function sourceForPlanning() {
  return buildPlanningContextPackage();
}

function sourceForDraft() {
  return buildDraftContextPackage();
}

function promptCharCount(text) {
  return String(text || "").length;
}

function chapterSourceCharEstimate(options = {}) {
  const includeNotes = options.includeNotes !== false;
  const key = includeNotes ? "withNotes" : "withoutNotes";
  if (chapterCache.sourceLength[key] !== null) return chapterCache.sourceLength[key];
  const chapters = sortedChapters().filter((chapter) => {
    const body = String(chapter?.draft || "");
    const notes = includeNotes ? String(chapter?.notes || "") : "";
    return `${chapterLabel(chapter)}${body}${notes}`.replace(/[#\s]/g, "").length;
  });
  if (!chapters.length) return 0;
  const separatorLength = "\n\n---\n\n".length * Math.max(0, chapters.length - 1);
  const length = chapters.reduce((sum, chapter) => {
    const body = String(chapter?.draft || "");
    const notes = includeNotes && chapter.notes ? `\n\n备注：${chapter.notes}` : "";
    return sum + `# ${chapterLabel(chapter)}\n\n`.length + body.length + notes.length;
  }, separatorLength);
  chapterCache.sourceLength[key] = length;
  return length;
}

function existingNovelLengthEstimate(options = {}) {
  const quickLength = String(state.quickSourceText || "").trim().length;
  const chapterLength = chapterSourceCharEstimate(options);
  if (options.preferChapters && chapterLength) return chapterLength;
  return quickLength || chapterLength;
}

function promptOverheadEstimate(task) {
  const overhead = {
    outline: 1600,
    analysis: 1800,
    planning: 2200,
    draft: 2600
  };
  return overhead[task] || 1200;
}

function promptLengthEstimate(task) {
  const base = summarizeProject().length;
  if (isShortStory()) {
    const source = Math.min(existingNovelLengthEstimate({ preferChapters: true, includeNotes: false }), state.economyMode ? 10000 : 16000);
    if (task === "analysis") return base + 1200 + source + promptCharCount(state.projectOutline);
    if (task === "outline") return base + 1500 + source + promptCharCount(state.projectOutline);
    if (task === "planning") return base + 1800 + source + promptCharCount(state.projectOutline) + promptCharCount(state.quickAnalysis);
    if (task === "draft") return base + 2200 + source + promptCharCount(state.projectOutline) + promptCharCount(state.quickAnalysis) + promptCharCount(state.quickBrief);
  }
  if (task === "analysis") {
    return base + promptOverheadEstimate(task) + sourceForMemoryCardLengthEstimate();
  }
  if (task === "outline") {
    if ((state.outlineMode || "initial") === "check") {
      return base
        + promptOverheadEstimate(task)
        + Math.min(promptCharCount(state.projectOutline), OUTLINE_CHECK_OUTLINE_MAX_LENGTH)
        + outlineCheckEvidencePromptLengthEstimate()
        + Math.min(promptCharCount(state.quickAnalysis), OUTLINE_CHECK_ANALYSIS_MAX_LENGTH);
    }
    return base + promptOverheadEstimate(task) + promptCharCount(state.projectOutline) + outlineEvidencePromptLengthEstimate();
  }
  if (task === "planning") {
    return base + promptOverheadEstimate(task) + sourceForPlanningLengthEstimate();
  }
  if (task === "draft") {
    const outlineLength = Math.min(promptCharCount(state.projectOutline), state.economyMode ? 3600 : 5200);
    const analysisLength = Math.min(promptCharCount(state.quickAnalysis), state.economyMode ? 2200 : 3200);
    const briefLength = Math.min(promptCharCount(state.quickBrief), state.economyMode ? 3000 : 4200);
    return base + promptOverheadEstimate(task) + outlineLength + analysisLength + briefLength + sourceForDraftLengthEstimate();
  }
  return base + promptOverheadEstimate(task);
}

function sourceForMemoryCardLengthEstimate() {
  return sourceForMemoryCard().length;
}

function sourceForPlanningLengthEstimate() {
  return sourceForPlanning().length;
}

function sourceForDraftLengthEstimate() {
  return buildDraftContextPackage().length;
}

function updateUsageEstimate() {
  const target = $("#usageEstimate");
  if (!target) return;
  if (!usageEstimateCache.dirty && usageEstimateCache.text) {
    target.textContent = usageEstimateCache.text;
    return;
  }
  const sourceLength = existingNovelLengthEstimate();
  const analysisLength = promptLengthEstimate("analysis");
  const outlineLength = promptLengthEstimate("outline");
  const planningLength = promptLengthEstimate("planning");
  const draftLength = promptLengthEstimate("draft");
  const mode = state.economyMode ? "省量模式" : "完整模式";
  const aiMode = state.smartAiSettings ? "智能参数" : "手动参数";
  const scope = isShortStory() ? "短篇整篇" : quickDraftScopeLabel();
  usageEstimateCache.text = `预计发送字数：前文约 ${sourceLength}；大纲约 ${outlineLength}；理解约 ${analysisLength}；推断约 ${planningLength}；生成约 ${draftLength}。当前：${mode}，${scope}，${aiMode}，生成最大输出 ${quickDraftMaxTokens()}`;
  usageEstimateCache.dirty = false;
  usageEstimateCache.updatedAt = Date.now();
  target.textContent = usageEstimateCache.text;
}

function deferUsageEstimate(reason = "scheduled") {
  const target = $("#usageEstimate");
  if (!usageEstimateCache.dirty && usageEstimateCache.text) {
    if (target) target.textContent = usageEstimateCache.text;
    return;
  }
  usageEstimateCache.reason = reason;
  if (target) target.textContent = "预计发送字数：等待输入停顿后估算...";
  if (usageEstimateTimer) clearTimeout(usageEstimateTimer);
  usageEstimateTimer = setTimeout(() => {
    usageEstimateTimer = 0;
    updateUsageEstimate();
  }, USAGE_ESTIMATE_DELAY_MS);
}

function quickModeLabel() {
  const labels = {
    draft: "写新章节",
    continue: "续写当前章节",
    polish: "润色当前草稿"
  };
  return labels[state.quickMode] || labels.draft;
}

function shouldDraftTwoChapters() {
  if (isShortStory()) return false;
  return state.quickDraftScope === "two" && state.quickMode === "draft";
}

function ensureDraftModeForNewChapters() {
  if (state.quickMode === "draft") return false;
  state.quickMode = "draft";
  const mode = $("#quickMode");
  if (mode) mode.value = "draft";
  return true;
}

function quickDraftScopeLabel() {
  if (isShortStory()) return "短篇整篇";
  return shouldDraftTwoChapters() ? "一次写两章" : "只写下一章";
}

function smartDraftMaxTokens() {
  const target = Number(state.targetWords || defaults.targetWords);
  if (isShortStory()) {
    return Math.min(10000, Math.max(4200, Math.ceil(target * 1.6)));
  }
  if (shouldDraftTwoChapters()) {
    return Math.min(10000, Math.max(7200, Math.ceil(target * 2 * 1.45)));
  }
  return Math.min(6500, Math.max(4200, Math.ceil(target * 1.55)));
}

function quickDraftMaxTokens() {
  const configured = Number(state.apiMaxTokens || defaults.apiMaxTokens);
  if (state.smartAiSettings) return smartDraftMaxTokens();
  if (isShortStory()) {
    const target = Number(state.targetWords || defaults.targetWords);
    return Math.max(configured, Math.min(10000, Math.max(4200, Math.ceil(target * 1.4))));
  }
  if (!shouldDraftTwoChapters()) return configured;
  const target = Number(state.targetWords || defaults.targetWords);
  return Math.max(configured, Math.min(9000, Math.max(4096, Math.ceil(target * 2 * 1.3))));
}

function draftOutputBudgetRisk(maxTokens = quickDraftMaxTokens()) {
  const target = Math.max(300, Number(state.targetWords || defaults.targetWords || 2500));
  const chapters = shouldDraftTwoChapters() ? 2 : 1;
  const targetWords = isShortStory() ? target : target * chapters;
  const recommended = isShortStory()
    ? Math.ceil(targetWords * 1.45)
    : Math.ceil(targetWords * (chapters > 1 ? 1.35 : 1.28));
  const available = Math.max(0, Number(maxTokens || 0));
  const ratio = recommended ? available / recommended : 1;
  let level = "ok";
  if (ratio < 0.78) level = "block";
  else if (ratio < 0.95) level = "warn";
  return {
    level,
    available,
    recommended,
    targetWords,
    chapters,
    ratio
  };
}

function buildShortStoryAnalysisPrompt() {
  const source = sourceForMemoryCard();
  return `请先阅读“故事设定/骨架”，再阅读我已经写出的短篇草稿，整理成“短篇理解结果”。

短篇理解结果只负责判断这篇短篇怎样闭环，不要给连载章节建议。

请只输出以下四个板块：
1. 已写内容：概括目前已经发生的剧情、主角状态、叙事视角、文风和情绪基调。
2. 缺失环节：指出开端、发展、转折、高潮、结尾里还缺什么。
3. 最大风险：指出最容易导致短篇松散、反转无力、结尾不成立或情绪不到位的问题。
4. 补全建议：给出 3-6 条可直接用于后续生成的补全建议。

要求：
1. 不要续写正文，只做理解和归纳。
2. 不要把短篇改成连载，不要提出未来章节。
3. 如果信息不足，请根据设定合理推断，但标注“推断”。

作品信息：
${summarizeProject()}

故事设定/骨架：
${state.projectOutline || "暂无，请根据作品信息和草稿推断临时设定。"}

已有短篇草稿：
${source || "暂无草稿，请根据作品信息做创作前理解。"}`;
}

function buildAnalysisPrompt() {
  if (isShortStory()) return buildShortStoryAnalysisPrompt();
  const source = sourceForMemoryCard();
  const futureCount = memoryFutureCount();
  const futureName = memoryFutureLabel();
  const futureInstruction = isLonglineStrategy()
    ? "按第1章到第8章列出趋势：每章只写核心推进、读者奖励、风险点和可埋伏笔，不要写成详细剧情。"
    : "按第1章到第4章列出每章目标、核心场景、读者奖励和结尾压力。";
  const targetLength = isLonglineStrategy() ? "1800-2800 字" : "1300-2200 字";
  return `请先阅读“项目大纲”，再阅读“小说记忆卡上下文包”，整理成“小说理解结果”。\n\n当前创作策略：${strategyDisplayName()}；本次未来章节范围：${futureCount}章。\n\n分工说明：\n1. 项目大纲只负责故事骨架和长期路线，不负责未来章节建议。\n2. 小说理解结果负责续写判断：下一步最该做什么、最大连载风险、${futureName}、续写记忆卡。\n3. 作者需要确认的问题只放进项目大纲的“作者确认区”，本次不要输出作者确认问题。\n4. 全书证据库用于校准已经发生的事实、人物变化、世界观和伏笔；最近两个章节用于校准停靠点、人物口吻和连续性。\n5. 不要要求读取整本正文，不要把章节索引当成完整剧情。\n6. 如果项目大纲与正文事实冲突，请单独列出冲突，并优先尊重已经写出的正文事实。\n7. 必须隔离“未来建议”和“已发生事实”：${futureName}只能写预测和建议；续写记忆卡只能写已经发生、已经确认、当前状态和未回收债务。\n\n请只输出以下四个板块：\n1. 下一步最该做什么：用 3-6 条说明接下来最应该推进的剧情、人物或伏笔。\n2. 最大连载风险：指出最可能导致跑偏、断节奏、读者困惑或伏笔失控的问题。\n3. ${futureName}：${futureInstruction}\n4. 续写记忆卡：压缩整理当前主线、主要人物、人物关系、当前进度、上一章停靠点、未回收伏笔、读者期待和文风口吻。\n\n续写记忆卡硬规则：\n1. 只记录已写正文、项目大纲或证据库能支撑的事实。\n2. 可以写“当前状态、已造成的后果、未回收伏笔、仍欠读者的承诺”。\n3. 禁止写“下一章应该、未来会、建议、可以考虑、预计、后续安排”等未发生内容。\n4. 如果某条只是推断，必须标【推断】，并不要把它写成已确定事实。\n\n要求：\n1. 不要续写正文，只做理解和归纳。\n2. 尽量压缩在 ${targetLength}，方便后续反复复用。\n3. 如果信息不足，请根据项目大纲和上下文包合理推断，但标注“推断”。\n\n作品信息：\n${summarizeProject()}\n\n项目大纲：\n${state.projectOutline || "暂无项目大纲，请先根据上下文包整理一个临时大纲。"}\n\n小说记忆卡上下文包：\n${source || "暂无上下文"}`;
}

function outlineModeLabel() {
  if (isShortStory()) {
    const shortLabels = {
      initial: "初次整理",
      update: "更新设定",
      check: "检查设定"
    };
    return shortLabels[state.outlineMode] || shortLabels.initial;
  }
  const labels = {
    initial: "初次整理",
    update: "更新大纲",
    check: "检查大纲"
  };
  return labels[state.outlineMode] || labels.initial;
}

function outlineModeInstruction() {
  const mode = state.outlineMode || "initial";
  if (mode === "update") {
    return "当前模式：更新大纲。已有项目大纲优先视为作者手动设定，不要整体重写；只根据新增正文、章节备注、小说理解结果、最近一次检查结果和作者确认补充必要变化。作者确认优先级最高；正文事实高于旧大纲；未被作者确认的问题不要擅自拍板，只在“需要作者确认”里保留。";
  }
  if (mode === "check") {
    return "当前模式：检查大纲。不要输出完整新大纲，不要改写已有项目大纲；只检查已有大纲与正文事实、小说理解结果之间的冲突、缺口、含糊点和需要作者确认的地方。";
  }
  return "当前模式：初次整理。请从已有正文和必要辅助信息里整理一份完整项目大纲；如果已有项目大纲中已经有作者手动设定，请保留并优先尊重，不要随意删除。";
}

function buildShortStoryOutlinePrompt() {
  const source = sourceForMemoryCard();
  const mode = state.outlineMode || "initial";
  const outlineDate = localDateLabel();
  const confirmationSummary = outlineConfirmationSummary();
  const reviewContext = mode === "update" && ((state.outlineCheckResult || "").trim() || confirmationSummary)
    ? `\n最近一次设定检查结果（作为本次更新依据）：\n${state.outlineCheckResult || "暂无"}\n\n作者确认结果（优先级最高）：\n${confirmationSummary || "暂无作者确认；不要替作者决定不确定设定，只把未确认项继续列入“需要作者确认”。"}\n`
    : "";
  const shortStorySectionSchema = `### 1. 题材风格
- 类型：
- 叙事视角：
- 整体气质：
- 篇幅目标：
- 不能偏离：

### 2. 主角和处境
- 主角：
- 身份/处境：
- 当前状态：
- 核心欲望：
- 隐藏信息：
- 变化方向：

### 3. 核心冲突
- 表层冲突：
- 深层冲突：
- 对手/阻力：
- 失败代价：
- 冲突必须解决到什么程度：

### 4. 故事骨架
- 开端：
- 发展：
- 转折：
- 高潮：
- 结尾：

### 5. 关键反转或信息释放
- 关键信息：
- 释放位置：
- 读者误判点：
- 反转后影响：
- 不能提前说明：

### 6. 高潮与结尾方向
- 高潮事件：
- 主角选择：
- 冲突解决方式：
- 结尾画面：
- 余味/悬念边界：

### 7. 情绪落点和文风
- 核心情绪：
- 情绪变化：
- 文风关键词：
- 对话气质：
- 禁止写法：`;
  const checkFormat = `请严格按以下结构输出：

## 设定检查结果
说明当前短篇设定是否足够支撑完整故事。

## 发现的冲突
列出设定、已有草稿和短篇理解结果之间的冲突；没有就写“暂无明确冲突”。

## 缺失或含糊
列出题材风格、主角、核心冲突、故事骨架、关键反转、高潮结尾和情绪落点里缺失或不清楚的地方；同时检查是否缺少状态标记和来源。

## 需要作者确认
列出需要作者拍板的设定。每条使用以下格式：
- 问题：哪里不确定或冲突
  AI建议：你建议怎么处理
  作者需要决定：需要作者确认什么
不要把“AI建议”或“作者需要决定”另起成新的项目符号；它们必须属于同一个确认项。

## 建议修改方向
只给短篇设定层面的修改建议，不要续写正文。`;
  const updateFormat = `请严格按以下结构输出：

## 更新后的短篇设定
${shortStorySectionSchema}

## 本次变更说明
用短条目说明这次相比已有设定补充或调整了什么。

## 发现的冲突
列出设定、已有草稿和短篇理解结果之间的冲突；没有就写“暂无明确冲突”。

## 需要作者确认
列出不确定、需要作者拍板的设定；没有就写“暂无”。`;
  const formatBlock = mode === "check"
    ? `固定短篇设定模板（检查时请按这些板块和小字段逐项对照）：\n${shortStorySectionSchema}\n\n${checkFormat}`
    : updateFormat;

  return `请根据这个短篇故事项目执行“${outlineModeLabel()}”。

分工说明：
1. 短篇设定只负责完整故事闭环，不做连载章节规划。
2. 已有设定中的明确内容优先视为作者手动设定，不要擅自覆盖。
3. 已有草稿事实高于旧设定；如果冲突，请标注冲突，不要直接改成另一个版本。
4. 作者确认结果优先级最高；没有确认的内容放进“需要作者确认”。
5. 对不确定内容必须标【待确认】；不要把推断伪装成确定设定。
6. 短篇设定必须保留七个固定板块，并按固定小字段写。每条关键信息都要带状态标记：【已确定】【推断】【待确认】；能说明来源时写“来源：设定/草稿/短篇理解/作者确认/推断；更新：${outlineDate}”。

${formatBlock}
${reviewContext}

要求：
1. 不要续写正文，只整理短篇设定。
2. 输出要方便作者审阅，不要用过长段落。
3. 不要出现“未来章节建议”“下一章方向”等连载字段。
4. 更新后的短篇设定里只保留七个固定板块，不额外增加大类。

作品信息：
${summarizeProject()}

已有短篇设定：
${state.projectOutline || "暂无短篇设定"}

已有短篇草稿：
${source || "暂无草稿"}

已有短篇理解结果：
${state.quickAnalysis || "暂无"}`;
}

function buildOutlinePrompt() {
  if (isShortStory()) return buildShortStoryOutlinePrompt();
  const mode = state.outlineMode || "initial";
  const source = mode === "check" ? outlineCheckEvidenceContextForPrompt() : outlineEvidenceContextForPrompt();
  const outlineContext = mode === "check"
    ? compactMarkdownSectionsForPrompt(state.projectOutline || "暂无项目大纲", OUTLINE_CHECK_OUTLINE_MAX_LENGTH, "项目大纲")
    : (state.projectOutline || "暂无项目大纲");
  const analysisContext = mode === "check"
    ? compactMarkdownSectionsForPrompt(state.quickAnalysis || "暂无", OUTLINE_CHECK_ANALYSIS_MAX_LENGTH, "小说理解结果")
    : (state.quickAnalysis || "暂无");
  const outlineDate = localDateLabel();
  const confirmationSummary = outlineConfirmationSummary();
  const reviewContext = mode === "update" && ((state.outlineCheckResult || "").trim() || confirmationSummary)
    ? `\n最近一次大纲检查结果（作为本次更新依据）：\n${state.outlineCheckResult || "暂无"}\n\n作者确认结果（优先级最高）：\n${confirmationSummary || "暂无作者确认；不要替作者决定不确定设定，只把未确认项继续列入“需要作者确认”。"}\n`
    : "";
  const sharedRules = `分工说明：
1. 项目大纲只负责故事骨架和长期路线，不负责下一步建议、连载风险、未来章节建议或续写记忆卡，这些交给“小说理解结果”。
2. 已有项目大纲中的明确设定优先视为作者手动设定，不要删除、弱化或擅自覆盖。
3. 已经写出的正文事实优先级高于旧大纲；如果冲突，请标注冲突，不要直接改成另一个版本。
4. 作者确认结果优先级最高，必须按作者选择修订；没有确认的内容放进“需要作者确认”，不要伪装成确定设定。
5. 对不确定内容必须标【待确认】；合理推断必须标【推断】；正文或作者确认已经明确的内容标【已确定】。
6. 每条关键信息尽量写来源：正文章节/项目大纲/小说理解结果/作者确认/推断；同时写“更新：${outlineDate}”。
7. 项目大纲必须只包含七个固定板块，并按固定小字段写。
8. 不要输出“未来章节建议”“下一章建议”“下一步最该做什么”“最大连载风险”“续写记忆卡”。
9. 如果有全书证据库，必须优先读取证据库；不要要求读取完整正文，也不要把正文库索引误当成完整剧情。`;
  const outlineSections = `### 1. 核心卖点
- 一句话卖点：
- 目标读者：
- 读者奖励：
- 长期看点：
- 不能偏离：

### 2. 世界观/背景
- 基础规则：
- 关键场景/组织：
- 资源或能力边界：
- 当前已揭示：
- 暂不能揭示：

### 3. 主要人物
每个主要人物按此格式写：
- 角色名：
- 身份：
- 当前状态：
- 核心欲望：
- 隐藏信息：
- 和主角关系：
- 后续变化方向：

### 4. 人物关系建立
每组关键关系按此格式写：
- 关系双方：
- 当前关系：
- 张力/冲突：
- 已发生关键事实：
- 后续变化方向：

### 5. 分卷/阶段主线
每个阶段按此格式写：
- 阶段名：
- 章节范围：
- 主线目标：
- 当前进度：
- 阶段高潮：
- 不能提前/必须保留：

### 6. 未回收伏笔
每条伏笔按此格式写：
- 伏笔：
- 埋设位置：
- 当前状态：
- 预计回收阶段：
- 回收方向：
- 风险：

### 7. 长期结局或回收方向
- 终局方向：
- 主角最终变化：
- 主要回收：
- 情绪落点：
- 可变项：`;
  const updateFormat = `请严格按以下结构输出：

## 更新后的项目大纲
${outlineSections}

## 本次变更说明
用短条目说明这次相比已有大纲补充或调整了什么。

## 发现的冲突
列出正文事实、旧大纲和小说理解结果之间的冲突；没有就写“暂无明确冲突”。

## 需要作者确认
列出不确定、需要作者拍板的设定；没有就写“暂无”。`;
  const checkFormat = `请严格按以下结构输出：

## 大纲检查结果
说明当前大纲整体是否稳定，哪些部分最需要作者处理。

## 发现的冲突
列出正文事实、旧大纲和小说理解结果之间的冲突；没有就写“暂无明确冲突”。

## 缺失或含糊
列出核心卖点、世界观/背景、主要人物、人物关系、阶段主线、未回收伏笔、长期回收方向里缺失或不清楚的地方；同时检查是否缺少状态标记和来源。

## 需要作者确认
列出需要作者拍板的设定。每条使用以下格式：
- 问题：哪里不确定或冲突
  AI建议：你建议怎么处理
  作者需要决定：需要作者确认什么
不要把“AI建议”或“作者需要决定”另起成新的项目符号；它们必须属于同一个确认项。

## 建议修改方向
只给大纲层面的修改建议，不要写未来章节建议。`;
  const formatBlock = mode === "check"
    ? `固定项目大纲模板（检查时请按这些板块和小字段逐项对照）：\n${outlineSections}\n\n${checkFormat}`
    : updateFormat;

  return `请根据这本未完连载小说执行“${outlineModeLabel()}”。

${outlineModeInstruction()}

${sharedRules}

${formatBlock}
${reviewContext}

要求：
1. 不要续写正文，只处理项目大纲。
2. 已经确定的内容标【已确定】；合理推断标【推断】；需要作者拍板的内容标【待确认】。
3. 输出要方便作者审阅，不要用过长段落。

作品信息：
${summarizeProject()}

已有项目大纲：
${outlineContext}

全书证据库/正文依据：
${source || "暂无前文"}

已有小说理解结果（仅作辅助，不要让它覆盖项目大纲）：
${analysisContext}`;
}

function extractUpdatedOutline(result) {
  const text = String(result || "").trim();
  if (!text) return "";
  const startMatch = text.match(/^#{1,3}\s*(?:更新后的项目大纲|更新后的短篇设定)\s*$/im);
  if (!startMatch) {
    return "";
  }
  const start = startMatch.index + startMatch[0].length;
  const rest = text.slice(start);
  const endMatch = rest.match(/^#{1,3}\s*(本次变更说明|发现的冲突|需要作者确认|大纲检查结果|设定检查结果|缺失或含糊|建议修改方向)\s*$/im);
  return (endMatch ? rest.slice(0, endMatch.index) : rest).trim();
}

function applyOutlineResult() {
  syncFields();
  const result = ($("#outlineResult")?.value || state.outlineResult || "").trim();
  const nextOutline = extractUpdatedOutline(result);
  if (!result) {
    setStatus("还没有大纲整理结果");
    return;
  }
  if (!nextOutline) {
    setStatus("检查结果不能直接应用，请先处理作者确认，再点“根据确认优化大纲”");
    return;
  }
  state.projectOutline = nextOutline;
  const output = $("#projectOutline");
  if (output) output.value = nextOutline;
  const structuralRefreshMarked = markStructuralRefreshComplete();
  markUsageEstimateDirty("apply-outline");
  persist();
  updateMemorySummaryCards();
  updatePrompt("quick");
  setStatus(structuralRefreshMarked ? "已应用整理结果，并记录本次结构刷新" : "已应用整理结果");
}

function extractOutlineConfirmations() {
  syncFields();
  const result = ($("#outlineResult")?.value || state.outlineResult || state.outlineCheckResult || "").trim();
  if (!result) {
    setStatus("还没有可提取的检查结果");
    return;
  }
  const items = buildOutlineConfirmationsFromResult(result);
  if (!items.length) {
    setStatus("没有找到需要作者确认的条目");
    return;
  }
  state.outlineCheckResult = result;
  state.outlineConfirmations = items;
  persist();
  renderOutlineConfirmations();
  openMemoryDrawer("outline");
  openDetails(".outline-review-accordion");
  setStatus(`已提取 ${items.length} 个作者确认项`);
}

async function optimizeOutlineFromCheck() {
  syncFields();
  const checkResult = (state.outlineCheckResult || state.outlineResult || "").trim();
  if (!checkResult) {
    setStatus("请先运行“检查大纲”，再根据确认优化");
    return;
  }
  state.outlineCheckResult = checkResult;
  if (!(state.outlineConfirmations || []).length) {
    state.outlineConfirmations = buildOutlineConfirmationsFromResult(checkResult);
    renderOutlineConfirmations();
  }
  state.outlineMode = "update";
  const modeSelect = $("#outlineMode");
  if (modeSelect) modeSelect.value = "update";
  persist();
  await generateProjectOutline({ fromCheck: true });
}

function buildShortStoryPlanPrompt() {
  const source = sourceForPlanning();
  const economyNote = state.economyMode
    ? "当前开启省量模式：请优先依据“故事设定/骨架”和“短篇理解结果”，已有草稿只用于校准已经写出的事实和文风。"
    : "当前使用完整模式：可以更多参考已有草稿。";
  return `请根据这个短篇故事项目，推断一份“完整短篇骨架”。

必须按这个顺序分析，不要跳步：
1. 先分析故事设定/骨架：确认题材风格、主角、核心冲突、关键反转、结局方向和情绪落点。
2. 再分析短篇理解结果：确认已有正文写到了哪里、缺什么、最大风险是什么。
3. 再读取已有草稿：保留已经发生的剧情、人物关系、叙事视角、文风和信息释放顺序；如果没有独立“短篇理解结果”，请在本次骨架里完成草稿理解。
4. 最后输出完整短篇骨架：从开场钩子到结尾余味形成一个闭环，不要变成连载开头。

${economyNote}

请只输出以下结构：
1. 设定判断：用 3-6 条写出这篇短篇必须服从的方向。
2. 已有内容承接：如果有草稿，说明已写到哪里、应从哪里接、哪些不能改；如果没有草稿，说明建议开头。
3. 完整短篇骨架：
   - 标题建议
   - 开场钩子
   - 主角困境
   - 表层目标
   - 隐藏真相
   - 第一次转折
   - 情绪加压
   - 高潮选择
   - 结尾落点
   - 读者最后记住什么
4. 成稿风险预警：列出最可能导致短篇松散、反转无力、结尾不成立或情绪不到位的问题。
5. 写作注意：列出必须保留、必须避免、必须出现的元素。

要求：
1. 不要写正文，只做短篇骨架。
2. 不要输出未来章节建议，不要设计连载后续。
3. 如果信息不足，可以合理推断，但要标注“推断”。

作品信息：
${summarizeProject()}

故事设定/骨架：
${state.projectOutline || "暂无，请根据作品信息临时推断。"}

短篇理解结果：
${state.quickAnalysis || "尚未分析，请直接从草稿判断缺口和风险。"}

已有短篇草稿：
${source || "暂无草稿"}`;
}

function buildNextDirectionPrompt() {
  if (isShortStory()) return buildShortStoryPlanPrompt();
  const source = sourceForPlanning();
  const directionName = directionLabel();
  const futureName = memoryFutureLabel();
  const longline = isLonglineStrategy();
  const economyNote = state.economyMode
    ? "当前开启省量模式：只读取项目大纲、小说记忆卡、全书证据库摘要和最近两个章节；续写位置以正文库最新章节为准。"
    : "当前使用完整模式：仍使用分层上下文包，不一次发送整本正文。";
  const longlineSections = longline
    ? `6. 第三章方向预留：\n   - 标题建议\n   - 核心目标\n   - 承接第二章的压力点\n   - 2-4 个方向级剧情节点\n   - 伏笔牵引\n   - 读者奖励\n   - 避免跑偏点\n7. 第四章方向预留：\n   - 标题建议\n   - 核心目标\n   - 承接第三章的压力点\n   - 2-4 个方向级剧情节点\n   - 伏笔牵引\n   - 读者奖励\n   - 避免跑偏点\n8. 四章连续性检查：列出四章之间的人物状态、信息状态、伏笔状态和节奏压力。`
    : `6. 两章连续性检查：列出两章之间的人物状态、信息状态、伏笔状态和节奏压力。`;
  const finalOutputRule = longline
    ? "前两章要写成可直接交给“生成正文”使用的详细推断；第三、第四章只做方向预留，用于牵引伏笔、节奏和章末压力，不要写成详细正文大纲。"
    : "两章都要写成可直接交给“生成正文”使用的详细推断。";
  return `请根据这本未完连载小说，按固定流程推断“${directionName}”最适合写什么。\n\n当前创作策略：${strategyDisplayName()}。\n\n${draftContinuityInstruction(true)}\n\n必须按这个顺序分析，不要跳步：\n1. 先分析项目大纲：确认核心卖点、阶段主线、人物关系、未回收伏笔和长期回收方向，判断接下来章节不能偏离什么。\n2. 再分析小说理解结果：重点参考“下一步最该做什么”“最大连载风险”“${futureName}”和“续写记忆卡”，判断当前连载最需要推进什么、最要避开什么。\n3. 再读取正文库最近两个章节：前一章校准人物状态和语气，最新一章确定上一章实际停靠点、压力点和下一章开头接法。\n4. 最后输出${longline ? "四个章节方向：第一、第二章必须完整承接，第三、第四章只做长线预留" : "两个完整章节推断：下一章和下下章必须互相承接，第二章要承接第一章的章末钩子"}。\n\n${economyNote}\n\n${storyMomentumRules()}\n\n请只输出以下结构：\n1. 项目大纲分析：用 3-6 条写出接下来章节必须服从的大方向。\n2. 小说理解结果分析：用 3-6 条写出当前最该推进的动作、最大风险和可用记忆。\n3. 最近章节承接：说明正文库最近两个章节提供的停靠点、下一章开头接法、必须延续的情绪/冲突。\n4. 第一章推断，也就是下一章：\n   - 标题建议\n   - 本章核心目标\n   - 开头承接点\n   - 4-6 个具体剧情场景\n   - 人物推进\n   - 伏笔/信息推进\n   - 读者奖励\n   - 章末钩子\n   - 需要避免的跑偏点\n5. 第二章推断，也就是下下章：\n   - 标题建议\n   - 本章核心目标\n   - 如何承接第一章章末钩子\n   - 4-6 个具体剧情场景\n   - 人物推进\n   - 伏笔/信息推进\n   - 读者奖励\n   - 章末钩子\n   - 需要避免的跑偏点\n${longlineSections}\n\n要求：\n1. 不要写正文，只做章节方向推断。\n2. ${finalOutputRule}\n3. 如果项目大纲、小说理解结果和正文库最近章节冲突，优先尊重正文库最近章节，并标注冲突点。\n4. 如果信息不足，可以合理推断，但要标注“推断”。\n\n作品信息：\n${summarizeProject()}\n\n${directionName}上下文包：\n${source || "暂无上下文"}`;
}

function polishReviewContextBlock(reviewContext) {
  const context = String(reviewContext || "").trim();
  if (!context) return "";
  const longformAudit = context.includes("长篇体检") || context.includes("长篇质量体检");
  const title = longformAudit ? "长篇体检报告/精修依据" : "短篇检查意见";
  const scopedContext = trimHeadTailForPrompt(context, longformAudit ? 2600 : 1800, title);
  const scopeRule = longformAudit
    ? "如果体检报告指出追读、人物、设定或AI痕迹问题，只能在原章节内容范围内修正表现方式，不要新增后续剧情。"
    : "如果检查状态为“结构需重改”，只能在不改变原剧情主线、人物关系和叙事视角的前提下强化结构衔接，不要另起新故事。";
  return `\n\n${title}：\n${scopedContext}\n\n精修执行要求：\n1. 优先处理检查意见指出的问题。\n2. ${scopeRule}\n3. 不要把检查意见当成续写指令，不要新增后续剧情。`;
}

function antiAiTextureRules() {
  return `反AI痕迹要求：
1. 避免模板化句子和重复动作，尤其不要反复使用“深吸一口气”“空气凝固”“嘴角微扬”“眼神复杂”“心里一紧”等套话。
2. 少写抽象情绪标签，多用具体动作、物件、环境反应、身体细节和对话潜台词承载情绪。
3. 不要用总结报告式段落解释人物动机，不要把读者已经能看懂的东西重复说明。
4. 每一场戏都要有可见目标、阻力和变化；如果只是说明背景或复述设定，要压缩到最短。
5. 对话要区分身份、年龄、立场和当下压力，避免所有人说话都像同一个旁白。`;
}

function storyMomentumRules() {
  return `流程循环防护：
1. 规则、档案、系统、复核、权限等信息只能作为压力来源，不能替代剧情推进。
2. 每章至少要有一个可见变化：人物位置变化、资源得失、身体代价、敌方损失、关系变化或旧伏笔兑现。
3. 如果主角用规则反制敌人，必须落成读者看得见的结果，不能只停在“待确认、待复核、进入流程”。
4. 每2-3章要给一次阶段性回报：救下人、拿到物、确认真相、让敌方付出代价或获得短暂喘息。
5. 章末钩子要轮换使用真实危险、人物选择、真相揭露、临时胜利后的反扑、环境灾变，不要总用系统提示或待确认。`;
}

function serialQualityGateRules() {
  return `连载质量硬要求：
1. 开头300-500字内必须出现具体威胁、目标、阻力、异常画面或不可逆选择，不能只铺设定。
2. 每章必须推进人物状态、信息状态、资源状态、关系状态或危机状态中的至少一项。
3. 每章结尾要留下明确压力、反转、未完成动作、信息差或奖励预期，不能只自然收尾。
4. 人物行为必须有动机和代价；反派、配角和路人不能为了推动剧情突然降智。
5. 世界规则、能力边界、资源、伤势、时间线、地理位置和道具使用必须前后一致。
6. 爽点、压迫、悬念和释放要有节奏，避免长期压抑没有回报，也避免机械打脸套路。`;
}

function buildStandardPolishPrompt(text, reviewContext = "") {
  return `请润色下面这段连载小说正文。

润色目标：
1. 不改变原剧情、人物关系、章节结构、段落顺序和叙事视角。
2. 不新增重要情节，不删除关键信息，不改变人物性格和说话方式。
3. 保留原文的核心情绪和故事节奏。
4. 修正错别字、病句、标点问题和重复表达。
5. 优化句子节奏，让文字更流畅、更自然、更有小说感。
6. 适当增强画面感、氛围感和人物情绪，但不要过度华丽，不要大幅扩写。
7. 对话要更自然，符合人物身份和当前情绪。
8. 保持原文风格，不要改写成完全不同的版本。
9. 如果原文有标题，请保留标题；如果没有标题，不要额外添加说明。

输出要求：
只输出润色后的正文，不要输出分析、修改说明或清单。

${antiAiTextureRules()}

作品信息：
${summarizeProject()}

${revisionTasksContextForPrompt("当前未处理修改任务", 5)}
${polishReviewContextBlock(reviewContext)}

原章节正文：
${text || "暂无正文"}`;
}

function buildIntensivePolishPrompt(text, reviewContext = "") {
  return `你是一名资深小说编辑，请对下面的小说章节进行精修润色。

精修目标：
在完全保留原剧情、人物关系、叙事视角和章节结构的基础上，全面提升语言质感、叙事节奏、场景画面、人物表现、情绪张力和小说可读性。

必须保留：
1. 原剧情主线。
2. 原人物关系。
3. 原章节结构。
4. 原段落顺序。
5. 原叙事视角。
6. 原故事节奏。
7. 原情绪走向。
8. 原有伏笔。
9. 原有信息释放顺序。
10. 人物原本的性格、身份、立场和说话方式。

重点精修：
1. 修正错别字、病句、标点和语序问题。
2. 删除或压缩重复、啰嗦、拖慢节奏的表达。
3. 优化句子长短，让节奏更有层次。
4. 增强场景画面感，让读者更容易进入情境。
5. 增强人物动作、神态、心理描写，让情绪更自然。
6. 优化对话，让人物说话更符合身份、性格和当前情绪。
7. 加强段落之间的过渡和衔接。
8. 提升氛围感、压迫感、暧昧感、冲突感或悬念感，具体以原文章节内容为准。
9. 让文字更有小说质感，但不要脱离原文风格。

允许范围：
1. 可以适度补充动作、神态、环境和心理细节。
2. 可以调整句式，使表达更自然、更有节奏。
3. 可以增强原有情绪，但不能改变情绪方向。
4. 可以让场景更具体，但不能加入新的重要事件。
5. 可以让对话更有张力，但不能改变对话本意。

严格禁止：
1. 禁止改变剧情走向。
2. 禁止新增重要情节。
3. 禁止删掉关键情节。
4. 禁止改变人物人设。
5. 禁止改变人物关系。
6. 禁止新增原文没有的人物、设定或伏笔。
7. 禁止把原文改成完全不同的文风。
8. 禁止过度华丽化。
9. 禁止把含蓄的地方解释得太直白。
10. 禁止替我续写后续剧情。

精修风格：
文字自然、细腻、流畅，有画面感，有情绪张力，有小说阅读感。描写可以更丰富，但要克制，不要堆砌辞藻。

精修幅度：
较高，但不重写。可以明显提升文字表现力，但不能让内容变成另一个版本。

输出要求：
只输出精修后的正文，不要输出分析、修改说明或清单。

${antiAiTextureRules()}

作品信息：
${summarizeProject()}

${revisionTasksContextForPrompt("当前未处理修改任务", 5)}
${polishReviewContextBlock(reviewContext)}

原章节正文：
${text || "暂无正文"}`;
}

function buildPolishPrompt(text, reviewContext = "") {
  return state.polishMode === "intensive"
    ? buildIntensivePolishPrompt(text, reviewContext)
    : buildStandardPolishPrompt(text, reviewContext);
}

function polishMaxTokens(text) {
  const configured = Number(state.apiMaxTokens || defaults.apiMaxTokens);
  const multiplier = state.polishMode === "intensive" ? 1.95 : 1.6;
  const estimated = Math.ceil(String(text || "").length * multiplier);
  if (state.smartAiSettings) return Math.min(12000, Math.max(3600, estimated));
  return Math.max(configured, Math.min(12000, Math.max(3000, estimated)));
}

function endingTaskText(mode = state.endingTaskMode) {
  const labels = {
    libraryScan: "从正文库扫描线索",
    diagnosis: "生成完结诊断",
    payoffs: "整理待回收伏笔",
    reverse: "生成倒排完结大纲",
    readiness: "检查是否可以完结"
  };
  return labels[mode] || labels.diagnosis;
}

function buildEndingPrompt(mode = state.endingTaskMode || "diagnosis") {
  const source = buildEndingContextPackage();
  const next = nextChapterNumber();
  const remaining = Number(state.endingRemainingChapters || 0);
  const remainingText = remaining > 0 ? `${remaining} 章，预计从第${next}章写到第${next + remaining - 1}章` : "未设置，请先按当前剧情合理估算";
  const endingContext = endingContextBlock() || "暂未开启完结模式，请先根据项目现状判断是否适合进入收尾。";
  const common = `${builtinWritingFlowHeader("ending")}
当前任务：${endingTaskText(mode)}

基本原则：
1. 只做完结规划、诊断和检查，不要续写正文。
2. 已写正文事实优先级最高，其次是作者确认/最终决定，再其次是项目大纲和小说理解结果。
3. 完结阶段不要随便开新大坑，不要新增复杂人物，不要新增必须很多章才能回收的大伏笔。
4. 如果信息不足，可以合理推断，但必须标注【推断】；需要作者拍板的地方必须单独列出。
5. 所有建议都要服务收束主线、回收伏笔、交代人物结局和制造最终高潮。

作品信息：
${summarizeProject()}

完结设置：
${endingContext}

预计剩余章数：
${remainingText}

完结上下文包：
${source || "暂无"}`;

  if (mode === "libraryScan") {
    return `${common}

请只根据正文库和已写正文事实，扫描“完结阶段需要回收和交代的线索”。
重点不要空想未来新剧情，不要把项目大纲里没有落到正文的设定当成已发生事实。

输出以下板块：
1. 正文库进度判定：已经写到哪里，主线推进到什么阶段。
2. 明确未回收伏笔：列出伏笔、出现章节/位置、当前状态、为什么必须回收。
3. 疑似未回收线索：列出可能需要处理但证据不足的线，并标注【推断】。
4. 人物收尾债务：主角、反派、重要配角还有哪些关系、情绪或命运需要交代。
5. 可以合并/淡出的支线：哪些不值得单独占章。
6. 下一步建议：进入完结前最先应该补的 3-6 件事。
7. 需要作者确认：必须由作者拍板的问题。`;
  }

  if (mode === "payoffs") {
    return `${common}

请整理“待回收伏笔清单”，只输出以下板块：
1. 必须回收：不回收会影响主线、人物动机或读者承诺的伏笔。
2. 可以合并回收：可以和最终冲突、人物结局或反派真相合并处理的伏笔。
3. 可以淡出：不值得单独占章节、可以用一句话或余波交代的支线。
4. 不能新增：完结阶段必须避免继续扩张的设定、人物和悬念。
5. 需要作者确认：AI 不能擅自决定的伏笔处理方式。

每条请写：伏笔名称、来源/位置、当前状态、推荐回收方式、预计回收章节区间、风险。`;
  }

  if (mode === "reverse") {
    return `${common}

请生成“倒排完结大纲”。
输出要求：
1. 按预计剩余章数倒排，从第${next}章开始。
2. 每章必须写清：章节目标、要回收的伏笔、人物变化、核心冲突、读者奖励、章末压力。
3. 最后三章必须单独强化：最终冲突、高潮解决、余味/后日谈。
4. 如果剩余章数不足，请指出必须压缩或合并的内容。
5. 不要写正文，只写可执行大纲。

固定输出格式：
## 完结总路线
## 倒排章节表
## 最终高潮安排
## 人物结局安排
## 伏笔回收安排
## 需要作者确认`;
  }

  if (mode === "readiness") {
    return `${common}

请检查这本小说“是否已经具备进入完结/正式完结的条件”。
只输出以下板块：
1. 状态判定：只能选【暂不适合完结】【可以进入准备完结】【可以进入完结中】【已经可以完结】之一。
2. 还缺什么：按主线、人物、伏笔、情绪、读者奖励分类列出。
3. 最大完结风险：指出最可能烂尾、仓促、跑偏或读者不买账的点。
4. 最少还需要几章：给出保守估算，并说明原因。
5. 立刻可执行的下一步：给 3-6 条操作建议。
6. 需要作者确认：列出必须由作者拍板的问题。`;
  }

  return `${common}

请生成“完结诊断”。
只输出以下板块：
1. 当前离完结还差什么：按主线、人物、伏笔、最终反派/最终冲突、情绪落点分类。
2. 必须回收伏笔：列出最重要的 8-20 条，说明不回收的风险。
3. 必须交代人物：列出主角、反派、重要配角的当前状态和建议结局。
4. 支线处理建议：哪些支线应该合并、压缩、淡出或保留。
5. 最大完结风险：指出最容易导致烂尾、仓促或读者不满的点。
6. 推荐剩余章数：给出区间，并说明节奏原因。
7. 需要作者确认：列出 AI 不能擅自决定的关键问题。`;
}

function aiTaskPreset(task) {
  const presets = {
    test: { temperature: 0.2, maxTokens: 512 },
    dashboard: { temperature: 0.35, maxTokens: 2200 },
    arc: { temperature: 0.48, maxTokens: 3200 },
    outline: { temperature: 0.45, maxTokens: 4200 },
    analysis: { temperature: 0.35, maxTokens: 3500 },
    planning: { temperature: 0.55, maxTokens: 4500 },
    quick: { temperature: 0.72, maxTokens: smartDraftMaxTokens() },
    manuscript: { temperature: 0.5, maxTokens: 3200 },
    polish: { temperature: 0.55, maxTokens: 4200 },
    shortReview: { temperature: 0.28, maxTokens: 2600 },
    quality: { temperature: 0.32, maxTokens: 3600 },
    ending: { temperature: 0.38, maxTokens: 5200 },
    release: { temperature: 0.3, maxTokens: 1800 },
    feedback: { temperature: 0.35, maxTokens: 2200 },
    recovery: { temperature: 0.5, maxTokens: 3000 },
    api: { temperature: 0.6, maxTokens: 2400 }
  };
  return presets[task] || presets.api;
}

function aiTaskLabel(task) {
  if (isShortStory()) {
    const shortLabels = {
      outline: "short-story-setting",
      analysis: "short-story-analysis",
      planning: "short-story-structure",
      quick: "short-story-draft",
      polish: "short-story-polish",
      shortReview: "short-story-review"
    };
    if (shortLabels[task]) return shortLabels[task];
  }
  const labels = {
    outline: "project-outline",
    analysis: "novel-analysis",
    planning: "two-chapter-plan",
    quick: "chapter-draft",
    manuscript: "chapter-library",
    polish: "chapter-polish",
    quality: "longform-quality-audit",
    ending: "ending-plan",
    release: "release-check",
    feedback: "reader-feedback",
    recovery: "hiatus-recovery",
    test: "connection-test",
    api: "general"
  };
  return labels[task] || labels.api;
}

function aiSettingsFor(task = "api", options = {}) {
  const manual = {
    task,
    label: aiTaskLabel(task),
    temperature: Number(options.temperature ?? state.apiTemperature ?? defaults.apiTemperature),
    maxTokens: Number(options.maxTokens ?? state.apiMaxTokens ?? defaults.apiMaxTokens)
  };
  if (!state.smartAiSettings) return manual;
  const preset = aiTaskPreset(task);
  return {
    task,
    label: aiTaskLabel(task),
    temperature: Number(options.temperature ?? preset.temperature),
    maxTokens: Number(options.maxTokens ?? preset.maxTokens)
  };
}

function buildShortStoryDraftPrompt() {
  const source = sourceForDraft();
  const base = summarizeProject();
  const target = Number(state.targetWords || defaults.targetWords);
  const economyNote = state.economyMode
    ? "当前开启省量模式：请优先依据“故事设定/骨架”“完整短篇骨架”，已有草稿只用于承接事实、口吻和节奏。"
    : "当前使用完整模式：可以更多参考已有草稿。";
  return `${builtinWritingFlowHeader("short")}

请直接进入短篇正文写作，不要先输出大纲或解释。

生成判断顺序：
1. 先看故事设定/骨架，正文必须服从题材风格、主角、核心冲突、关键反转、高潮、结局方向和情绪落点。
2. 再看完整短篇骨架，重点落实开场钩子、主角困境、隐藏真相、高潮选择、结尾落点和读者最后记住什么。
3. 再看短篇理解结果，如有手动补充，必须落实已写内容、缺失环节、最大风险和补全建议。
4. 最后看已有草稿；如果有草稿，必须承接草稿，不要重写成另一个故事。

${economyNote}

输出要求：
1. 用中文写一篇完整短篇故事，尽量像可直接发布的正文。
2. 不要写成连载开头，不要留下必须下一章才能解决的主线缺口。
3. 如果已有草稿，保留原剧情、人物关系、叙事视角、文风和信息释放顺序，只补全后续或整合成完整短篇。
4. 字数目标约 ${target} 字；如果输出长度受限，优先保证故事完整闭环。
5. 可以有悬念或余味，但核心冲突必须在本篇内完成。
6. 不要输出分析、大纲、说明或保存提示，只输出短篇正文。

作品信息：
${base}

故事设定/骨架：
${state.projectOutline || "暂无，请根据作品信息和可选要求推断。"}

短篇理解结果：
${state.quickAnalysis || "尚未分析，请从已有草稿和设定直接判断。"}

完整短篇骨架：
${state.quickBrief || "暂无，请根据设定临时形成开端、发展、转折、高潮和结尾。"}

已有短篇草稿：
${source || "暂无草稿，请从零写完整短篇。"}

标题要求：
${state.quickTitle || state.projectTitle || "自动拟定"}

必须出现：
${state.quickMustHave || state.readerReward || "待补充"}`;
}

function buildShortStoryReviewPrompt(text) {
  return `你是一名短篇小说编辑，请对下面这篇短篇成稿做发布前检查。

检查目标：
只判断这篇短篇是否能作为一个完整故事成立，不要续写正文，不要重写正文，不要把它改成连载。

请只输出以下九个板块：
0. 状态判定：只能从【可保存】【建议精修】【结构需重改】中选一个，并用一句话说明原因。
1. 故事闭环：核心冲突是否在本篇内完成，是否还留下必须下一章解决的主线缺口。
2. 主角动机：主角想要什么、为什么行动、最后是否有变化，哪里不清楚。
3. 反转或高潮：反转/高潮是否成立，铺垫是否足够，是否突兀或力度不足。
4. 结尾余味：结尾是否有情绪落点、画面记忆点或反思余味，是否收得太急。
5. 节奏和废话：指出拖慢节奏、重复表达、信息解释过多或跳跃的地方。
6. AI痕迹和语言质感：指出模板句、假情绪、报告式说明、重复动作、所有人说话一样的问题。
7. 读者拉力：模拟普通读者是否愿意看完、老书虫是否觉得套路、付费用户是否觉得值得。
8. 修改优先级：给出 3-6 条最值得先改的建议，按重要程度排序。

要求：
1. 不要输出改写版正文。
2. 不要新增剧情设定。
3. 如果问题很小，状态判定选【可保存】；如果只需要语言提升，状态判定选【建议精修】；如果核心闭环、动机或高潮不成立，状态判定选【结构需重改】。
4. 建议要具体，方便作者拿去精修润色。
${antiAiTextureRules()}

作品信息：
${summarizeProject()}

故事设定/骨架：
${state.projectOutline || "暂无"}

完整短篇骨架：
${state.quickBrief || "暂无"}

短篇正文：
${text || "暂无正文"}`;
}

function qualityMilestoneInfo() {
  const stats = chapterStats();
  const totalWords = Number(stats.totalWords || 0);
  const sinceQuality = Math.max(0, totalWords - Number(state.lastQualityAuditWords || 0));
  const sinceStructuralAudit = Math.max(0, totalWords - Number(state.lastStructuralAuditWords || 0));
  const sinceStructuralRefresh = Math.max(0, totalWords - Number(state.lastStructuralRefreshWords || 0));
  return {
    totalWords,
    drafted: Number(stats.drafted || 0),
    latestLabel: stats.latest ? chapterLabel(stats.latest) : "暂无正文",
    qualityDue: totalWords >= 30000 && sinceQuality >= 30000,
    structuralAuditDue: totalWords >= 50000 && sinceStructuralAudit >= 50000,
    structuralRefreshDue: totalWords >= 50000 && sinceStructuralRefresh >= 50000,
    nextQualityWords: Math.max(0, 30000 - sinceQuality),
    nextStructuralAuditWords: Math.max(0, 50000 - sinceStructuralAudit),
    nextStructuralRefreshWords: Math.max(0, 50000 - sinceStructuralRefresh),
    sinceQuality,
    sinceStructuralAudit,
    sinceStructuralRefresh
  };
}

function qualityMilestoneText() {
  const info = qualityMilestoneInfo();
  const items = [
    `正文库：${info.drafted} 章，约 ${info.totalWords} 字，最新 ${info.latestLabel}`,
    info.qualityDue
      ? "已到 3 万字体检节点：建议运行长篇体检。"
      : `距离下次 3 万字体检约 ${info.nextQualityWords} 字。`,
    info.structuralAuditDue
      ? "已到 5 万字结构体检节点：本次体检会重点检查大纲、人物、世界观、伏笔、时间线和战力/道具体系。"
      : `距离下次 5 万字结构体检约 ${info.nextStructuralAuditWords} 字。`,
    info.structuralRefreshDue
      ? "结构刷新待完成：建议更新大纲、深度整理 AI资料库，并重推章节方向。"
      : `结构刷新维护仍在安全范围内，距离下次提醒约 ${info.nextStructuralRefreshWords} 字。`
  ];
  return items.join("\n");
}

function updateQualityAuditUi() {
  const result = $("#qualityAuditResult");
  if (result && result.value !== state.qualityAuditResult) result.value = state.qualityAuditResult || "";
  const info = qualityMilestoneInfo();
  setText("qualityAuditWords", `${info.totalWords} 字 / ${info.drafted} 章`);
  setText("qualityAuditMilestone", info.qualityDue || info.structuralAuditDue || info.structuralRefreshDue ? "建议体检" : "未到强提醒节点");
  setText("qualityAuditUpdated", state.qualityAuditUpdatedAt ? new Date(state.qualityAuditUpdatedAt).toLocaleString() : "尚未体检");
  setText("qualityAuditHint", qualityMilestoneText());
}

function markStructuralRefreshComplete() {
  const totalWords = Number(chapterStats().totalWords || 0);
  if (totalWords < 50000) return false;
  state.lastStructuralRefreshWords = totalWords;
  return true;
}

function buildQualityAuditPrompt() {
  const info = qualityMilestoneInfo();
  const latest = lastDraftedChapter();
  const latestText = latest ? chapterDraftExcerpt(latest, 3600) : "暂无最新章节正文";
  const recent = recentTwoChaptersReference(4200);
  const opening = firstThreeChaptersReference(1600);
  const evidence = evidenceContextForTask("quality", 9000);
  const libraryIndex = chapterLibraryIndexText(160);
  const milestone = qualityMilestoneText();
  return `${builtinWritingFlowHeader("quality")}

你现在是长篇连载质量总审。请只做质量体检和修改建议，不要续写正文，不要重写正文，不要生成新章节。

体检目标：
1. 判断这本书当前是否稳定具备追读欲、付费吸引力和长线连载质量。
2. 检查剧情结构、人物动机、设定一致性、AI痕迹、节奏、爽点释放和弃书风险。
3. 如果正文库已接近 3 万字节点，要做一次追读体检；如果已接近 5 万字节点，要额外给出结构刷新建议。

必须输出以下板块：
## 1. 状态判定
- 等级：A / B / C / D
- 普通读者是否愿意点下一章：
- 老书虫是否会觉得套路或水：
- 付费用户是否觉得值得继续：
- 最大弃书风险：

## 2. 开头和前三章契约
检查开头是否抓人、三章内是否建立核心冲突和读者承诺。没有足够正文证据时标【证据不足】。

## 3. 章节推进和水文风险
指出重复情节、解释废话、剧情停滞、机械套路、长期压抑无释放、高潮不足的位置或类型。

## 4. 人物质量
检查主要人物是否立体、行为是否合理、人设是否崩、是否降智/圣母/反派降智、配角是否工具人、对话是否同质化。

## 5. 设定和连续性
检查世界规则、能力/战力边界、时间线、地理、资源、道具、伤势、伏笔、设定吃书、巧合过多和作者强行安排。

## 6. AI痕迹和语言问题
标记重复词、重复句式、假情绪、报告式描写、机翻感、过度正确、生活细节不足。重点检查“深吸一口气”“空气凝固”“嘴角微扬”“眼神复杂”等模板化表达。

## 7. 3万/5万维护建议
按当前字数节点给出：是否需要体检、是否需要刷新项目大纲/正文规划/人物状态/世界观/伏笔/时间线/战力体系/道具状态。

## 8. 未处理修改任务复查
如果存在未处理修改任务，逐条判断：已解决 / 仍存在 / 部分解决 / 不适用，并给出证据。没有未处理修改任务时写“暂无待复查任务”。

## 9. 可执行修改任务
只列低风险、可直接执行的 5-12 条任务。每条必须使用以下字段，方便软件自动加入修改任务：
- 问题：具体问题和位置
  影响：影响小说质量、追读或维护的原因
  怎么改：作者可以直接执行的修改动作
  优先级：P0 / P1 / P2
  验证：改完后怎么确认问题已解决

${serialQualityGateRules()}

${storyMomentumRules()}

${antiAiTextureRules()}

当前维护节点：
${milestone}

作品信息：
${summarizeProject()}

${revisionTasksContextForPrompt("当前未处理修改任务", 8)}

${revisionTasksReviewInstructionForPrompt(8)}

项目大纲：
${trimHeadTailForPrompt(state.projectOutline || "暂无项目大纲", 5200, "项目大纲")}

小说记忆卡/小说理解结果：
${trimHeadTailForPrompt(state.quickAnalysis || "暂无小说记忆卡", 3600, "小说记忆卡")}

章节方向：
${trimHeadTailForPrompt(state.quickBrief || "暂无章节方向", 3200, "章节方向")}

AI资料库/证据索引：
${evidence || "暂无AI资料库"}

正文库章节索引：
${libraryIndex || "暂无章节索引"}

开头前三章参考：
${opening || "暂无开头前三章参考"}

最近两个章节参考：
${recent || "暂无最近章节"}

最新章节正文摘录：
${latestText}`;
}

function buildPrompt(mode) {
  const header = isShortStory()
    ? builtinWritingFlowHeader("short")
    : builtinWritingFlowHeader("serial");
  const base = summarizeProject();
  if (mode === "quick") return buildQuickDraftPromptForGeneration();
  const lightContext = buildLightToolContextPackage();
  const recoveryContext = buildRecoveryContextPackage();
  const prompts = {
    advancedTools: `${header}\n\n请根据当前项目状态，判断我接下来最适合使用哪个高级工具：正文润色、长篇体检、发布检查、读者反馈、断更恢复、季/卷规划、完结规划。只给出工具选择和原因。\n\n${base}\n\n${lightContext}`,
    diagnosis: `${header}\n\n请作为 AI诊断修复中心，对当前修改任务做分诊和修复路线规划。不要续写正文。\n\n必须输出：\n1. 任务总览：待处理问题里哪些最影响追读、人物一致性、设定稳定和大纲可靠性。\n2. 任务分诊：逐条判断去向：正文修复 / 大纲补充 / 记忆卡补充 / 方向避坑 / 作者确认 / 暂缓处理。\n3. 修复顺序：先处理哪 3-5 条，为什么。\n4. 应用建议：哪些需要修当前章节，哪些需要送入大纲整理结果，哪些需要追加到记忆卡。\n5. 复查标准：改完后用什么证据判断任务已解决。\n\n${base}\n\n${lightContext}\n\n${revisionTasksContextForPrompt("当前未处理修改任务", 12) || "当前暂无修改任务。"}\n\n当前项目大纲：\n${trimHeadTailForPrompt(state.projectOutline || "暂无项目大纲", 2600, "项目大纲")}\n\n当前小说记忆卡：\n${trimHeadTailForPrompt(state.quickAnalysis || "暂无小说记忆卡", 1800, "小说记忆卡")}`,
    dashboard: `${header}\n\n请根据以下项目状态，整理当前连载控制台：指出下一步最该做什么、最大连载风险、未来三章建议，并给出写作首页下一步操作顺序。\n\n${base}\n\n${lightContext}`,
    arc: `${header}\n\n请为这本连载做季/卷规划，输出更新节奏、章节跨度、前五章钩子、3-7章小弧线、主要回收窗口。\n\n要求：只使用项目大纲、全书证据库摘要、小说记忆卡和最近章节，不要要求读取整本正文。\n\n${base}\n\n${recoveryContext}\n\n季/卷目标：${state.seasonPromise || "待补充"}\n章节跨度：${state.seasonSpan || "待补充"}\n前五章钩子草稿：\n${state.firstHooks || "待补充"}`,
    ending: buildEndingPrompt(),
    manuscript: `${header}\n\n请对当前章节做正文修订或续写建议。优先检查：读者奖励是否明确、章末钩子是否有拉力、人物动机是否连贯、伏笔是否需要入账。必要时给出可直接替换的正文版本。\n\n${base}\n\n${lightContext}\n\n当前章节：\n${currentChapterText()}`,
    polish: buildPolishPrompt(state.polishSource || "请粘贴需要润色的章节正文。", state.polishReviewContext || ""),
    quality: buildQualityAuditPrompt(),
    release: `${header}\n\n请做发布前检查，判断这一章是否可以发布。重点检查开头300-500字是否抓人、章节推进、人物动机、对话区分度、读者奖励、章末钩子、伏笔债务、设定连续性和AI痕迹。\n\n说明：发布检查以待检查章节为最高优先级，轻量上下文只用于判断连续性和读者承诺。\n\n输出要求：\n1. 给出 A/B/C/D 发布等级和一句结论。\n2. 分别模拟普通读者、老书虫、付费用户，判断是否愿意点下一章、是否觉得水、是否觉得值得付费。\n3. 检查本章开头状态、结尾状态和不可逆变化，指出本章到底推进了什么。\n4. 检查人物动机、对话、反派/配角智商和工具人风险。\n5. 检查世界规则、能力/战力、时间地理、道具资源、伤势和伏笔是否前后一致。\n6. 单独输出“未处理修改任务复查”：逐条判断已解决 / 仍存在 / 部分解决 / 不适用，并给出证据。\n7. 列出发布前必须改的 0-8 项，不要续写正文。每条必须使用以下字段：问题、影响、怎么改、优先级、验证。\n\n${serialQualityGateRules()}\n\n${storyMomentumRules()}\n\n${antiAiTextureRules()}\n\n${base}\n\n${revisionTasksContextForPrompt("当前未处理修改任务", 8)}\n\n${revisionTasksReviewInstructionForPrompt(8)}\n\n${lightContext}\n\n检查项：\n${checklistText()}\n\n待检查章节：\n${state.releaseDraft || "待补充"}`,
    feedback: `${header}\n\n请分析读者反馈，区分有效信号和噪音，判断读者期待、困惑点、掉读风险，并给出下一章调整建议。\n\n说明：读者反馈以用户粘贴内容为最高优先级，轻量上下文只用于判断哪些反馈会影响当前连载方向。\n\n${base}\n\n${lightContext}\n\n读者反馈：\n${state.readerFeedback || "待补充"}`,
    recovery: `${header}\n\n这本连载需要断更恢复。请整理前情提要、未兑现承诺、最安全重启点、回归章节钩子和接下来三章计划。\n\n${base}\n\n${recoveryContext}\n\n停更时长：${state.hiatusLength || "待补充"}\n最后发布：${state.lastPublished || "待补充"}\n停更前剧情：\n${state.hiatusContext || "待补充"}`
  };
  return prompts[mode] || prompts.dashboard;
}

function buildQuickDraftPromptForGeneration() {
  if (isShortStory()) return buildShortStoryDraftPrompt();
  const header = builtinWritingFlowHeader("serial");
  const base = summarizeProject();
  const twoChapterDraft = shouldDraftTwoChapters();
  const directionName = directionLabel();
  const futureName = memoryFutureLabel();
  const longline = isLonglineStrategy();
  const continuityInstruction = draftContinuityInstruction(twoChapterDraft);
  const chapterReference = recentTwoChaptersReference(state.economyMode ? 4200 : 5600);
  const plannedNextChapter = nextPlannedChapterContext(900);
  const criticalEvidence = evidenceContextForTask("draft", state.economyMode ? 3200 : 4400);
  const projectBible = compactProjectBibleContext(state.economyMode ? 2600 : 4000);
  const outline = fieldForDraftPrompt(
    state.projectOutline,
    state.economyMode ? 3600 : 5200,
    "项目大纲",
    "暂无项目大纲，请根据小说理解结果和前文推断临时总方向。"
  );
  const analysis = fieldForDraftPrompt(
    state.quickAnalysis,
    state.economyMode ? 2200 : 3200,
    "小说记忆卡",
    `尚未分析，请只根据项目大纲、正文库最近两个章节和${directionName}判断。`
  );
  const brief = fieldForDraftPrompt(
    state.quickBrief,
    state.economyMode ? 3000 : 4200,
    directionName,
    shouldDraftTwoChapters()
      ? `请根据项目大纲、小说理解结果和前文推断${directionName}，并只写前两章正文，中间用 ===下一章=== 分隔。`
      : `请根据项目大纲、小说理解结果和前文推断${directionName}。正文只写第一章推断。`
  );
  const scopeInstruction = twoChapterDraft
    ? `本次正文范围：一次写两章。第一章严格对应下一章推断，第二章严格对应下下章推断，两章之间用 ===下一章=== 分隔。${longline ? "第三、第四章方向只用于牵引伏笔和压力，不要提前写。" : ""}`
    : `本次正文范围：只写下一章。${longline ? "第二到第四章方向" : "第二章推断"}只用于安排章末钩子和后续压力。`;
  const directionInstruction = twoChapterDraft
    ? `5. 最后看${directionName}：先锁定第一章推断，再锁定第二章推断；第二章开头要接住第一章结尾。${longline ? "第三、第四章方向只作为长线牵引，不写进本次正文。" : ""}`
    : `5. 最后看${directionName}：本次只写第一章推断，${longline ? "第二到第四章方向" : "第二章推断"}只作为后续压力参考。`;
  const outputInstruction = twoChapterDraft
    ? `输出要求：
1. 只输出两章正文，不要输出分析、大纲、说明或保存提示。
2. 第一章和第二章之间必须单独用这一行分隔：===下一章===。
3. 每章开头都要有章标题，并严格按“章节连续性硬规则”使用下一章编号。
4. 每章字数目标约 ${state.targetWords || 2500} 字；如果输出长度受限，优先保证两章都有完整起承转合，每章可以略短。
5. 不要重启故事，不要重复旧章节，不要改人物关系和人设。`
    : `输出要求：
1. 只输出下一章正文，不要输出分析、大纲、说明或保存提示。
2. 章标题必须严格按“章节连续性硬规则”使用下一章编号。
3. 字数目标约 ${state.targetWords || 2500} 字；如果一次写不完，优先写完整开头到自然段落节点。
4. 不要重启故事，不要重复旧章节，不要改人物关系和人设。`;
  const requiredAnchors = draftRequiredAnchorText();
  return `${header}

请按固定流程直接生成正文，不要带入其他章节全文，也不要把其他正文当作参考材料。

固定参考顺序：
1. 先看项目圣经总览和项目大纲，确定正史边界、核心卖点、世界观/背景、主要人物、人物关系、阶段主线、未回收伏笔和长期回收方向。
2. 再看小说记忆卡，也就是小说理解结果，确认下一步最该做什么、最大连载风险、${futureName}和续写记忆。
3. 再看分层证据索引里的长期设定、人物状态和未回收伏笔，只用于避免违背长期事实、人物关系和人物口吻，不要展开成新剧情。
4. 再看正文库最近两个已写章节，前一章用于校准人物状态和语气，最新一章用于确定真实续写起点、场景停靠点和章末压力。
${directionInstruction}
6. 然后直接生成正文。

${scopeInstruction}

${continuityInstruction}

${outputInstruction}

${serialQualityGateRules()}

${storyMomentumRules()}

${antiAiTextureRules()}

${revisionTasksContextForPrompt("当前未处理修改任务", 8)}

作品信息：
${base}

项目圣经总览（由大纲、作者确认和 AI资料库四库汇总，不是独立事实源）：
${projectBible}

项目大纲：
${outline}

小说记忆卡/小说理解结果：
${analysis}

AI资料库精简索引（只用于校准长期事实、人物状态和伏笔）：
${criticalEvidence || "暂无AI精简资料；本次只按项目大纲、记忆卡和最近章节执行。"}

正文库最近两个章节参考（最高优先级）：
${chapterReference || "暂无章节参考"}

正文库待写章节计划：
${plannedNextChapter || `暂无待写计划，请根据${directionName}和最新章节继续。`}

${directionName}：
${brief}

章节标题：${state.quickTitle || "自动拟定"}

本章必须出现：
${requiredAnchors || "待补充"}`;
}

function promptHiddenForMode(mode) {
  return mode === "quick" || mode === "advancedTools";
}

function updatePrompt(mode, options = {}) {
  if (promptUpdateTimer) {
    clearTimeout(promptUpdateTimer);
    promptUpdateTimer = 0;
  }
  if (promptHiddenForMode(mode) && !options.force) {
    deferUsageEstimate();
    return;
  }
  const output = $("#promptOutput");
  if (output) output.value = buildPrompt(mode);
  deferUsageEstimate("prompt-update");
}

function schedulePromptUpdate(mode) {
  if (promptHiddenForMode(mode)) {
    deferUsageEstimate();
    return;
  }
  if (promptUpdateTimer) clearTimeout(promptUpdateTimer);
  promptUpdateTimer = setTimeout(() => updatePrompt(mode), 120);
}

function copyPrompt() {
  const output = $("#promptOutput");
  updatePrompt(activePanelId(), { force: true });
  const text = output.value;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      $("#saveState").textContent = "提示词已复制";
    }).catch(() => fallbackCopy(output));
    return;
  }
  fallbackCopy(output);
}

function fallbackCopy(output) {
  output.focus();
  output.select();
  document.execCommand("copy");
  $("#saveState").textContent = "提示词已复制";
}

function exportState() {
  syncFields();
  const blob = new Blob([JSON.stringify(persistableState(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const title = sanitizeFileName(state.projectTitle || "serial-novel-control");
  link.href = URL.createObjectURL(blob);
  link.download = `${title}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function parseImportedStateText(text) {
  const parsed = JSON.parse(String(text || ""));
  return normalizeState(parsed);
}

async function importStateFromFile(file) {
  if (!file) return { ok: false, skipped: true };
  const replacement = confirmProjectReplacement("导入项目");
  if (!replacement.ok) return { ok: false, ...replacement };
  let imported;
  try {
    imported = parseImportedStateText(await file.text());
  } catch (error) {
    const message = `导入失败：文件不是有效的项目 JSON，当前项目未变更。原因：${error.message || String(error)}`;
    setStatus(message);
    const target = $("#saveState");
    if (target) target.textContent = message;
    return { ok: false, error };
  }
  state = imported;
  loadStateWarning = null;
  invalidateChapterCache();
  usageEstimateCache = createUsageEstimateCache();
  persist();
  hydrate();
  const chapterCount = sortedChapters().length;
  const message = `导入完成：${state.projectTitle || "未命名项目"}，共 ${chapterCount} 章`;
  setStatus(message);
  const target = $("#saveState");
  if (target) target.textContent = message;
  return { ok: true, chapterCount };
}

function sanitizeFileName(value) {
  return String(value).replace(/[\\/:*?"<>|]+/g, "-").trim() || "serial-novel-control";
}

function resetState() {
  if (!confirm("清空当前控制台数据？")) return;
  state = structuredClone(defaults);
  loadStateWarning = null;
  invalidateChapterCache();
  usageEstimateCache = createUsageEstimateCache();
  persist();
  hydrate();
}

function providerDisplayName() {
  const selected = $("#apiProvider")?.selectedOptions?.[0]?.textContent;
  const profile = activeModelProfile();
  const fallback = (profile?.provider || state.apiProvider) === "codex" ? "Codex 本机一键" : (profile?.provider || state.apiProvider);
  return (selected || fallback || "未选择").replace("，推荐", "");
}

function setApiAvailability(status, message) {
  apiAvailability = { status, message };
  updateApiHelp();
  updateGenerationSettingsSummary();
}

function mergeCodexConnection(status = {}) {
  const has = (key) => Object.prototype.hasOwnProperty.call(status, key);
  codexConnection = {
    ...codexConnection,
    installed: Boolean(status.installed ?? status.available),
    versionOk: Boolean(status.versionOk ?? status.available),
    path: status.path || "",
    version: status.version || "",
    execReady: Boolean(status.execReady),
    generationReady: Boolean(status.generationReady),
    lastProbeModel: has("lastProbeModel") ? (status.lastProbeModel || "") : (codexConnection.lastProbeModel || ""),
    lastProbeReasoningEffort: has("lastProbeReasoningEffort") ? (status.lastProbeReasoningEffort || "") : (codexConnection.lastProbeReasoningEffort || ""),
    lastProbeAt: has("lastProbeAt") ? (status.lastProbeAt || "") : (codexConnection.lastProbeAt || ""),
    lastProbeError: has("lastProbeError") ? (status.lastProbeError || "") : "",
    lastProbeContent: has("lastProbeContent") ? (status.lastProbeContent || "") : "",
    actualModel: has("actualModel") ? (status.actualModel || "") : (codexConnection.actualModel || ""),
    failureType: has("failureType") ? (status.failureType || "") : "",
    failureTitle: has("failureTitle") ? (status.failureTitle || "") : "",
    failureAdvice: has("failureAdvice") ? (status.failureAdvice || "") : "",
    lastProbeLogPath: has("lastProbeLogPath") ? (status.lastProbeLogPath || "") : "",
    statusLevel: status.statusLevel || codexConnection.statusLevel || "unknown"
  };
}

function codexModelIsDefault(model) {
  return !model || model === "default" || model === "codex-default";
}

function normalizeCodexModel(model) {
  const text = String(model || "").trim();
  return codexModelIsDefault(text) ? CODEX_RECOMMENDED_MODEL : text;
}

function codexModelDisplay(model) {
  return codexModelIsDefault(model) ? CODEX_RECOMMENDED_MODEL : model;
}

function normalizeCodexReasoningEffort(value) {
  const text = String(value || "").trim().toLowerCase();
  return codexReasoningValueSet.has(text) ? text : DEFAULT_CODEX_REASONING_EFFORT;
}

function codexReasoningLabel(value) {
  const normalized = normalizeCodexReasoningEffort(value);
  return codexReasoningOptions.find((item) => item.value === normalized)?.name || "高";
}

function codexReasoningHint(value) {
  const normalized = normalizeCodexReasoningEffort(value);
  return codexReasoningOptions.find((item) => item.value === normalized)?.hint || "";
}

function activeCodexReasoningEffort(profile = activeModelProfile()) {
  return normalizeCodexReasoningEffort(profile?.reasoningEffort || state.codexReasoningEffort);
}

function codexRuntimeSummary(profile = activeModelProfile()) {
  const provider = profile?.provider || state.apiProvider;
  const preset = providerPresets[provider] || providerPresets.codex;
  const model = provider === "codex"
    ? codexModelDisplay(normalizeCodexModel(profile?.model || state.apiModel || preset.model))
    : (profile?.model || state.apiModel || preset.model || "未填写模型");
  const reasoning = provider === "codex" ? ` · ${codexReasoningLabel(activeCodexReasoningEffort(profile))}推理` : "";
  return `${model}${reasoning}`;
}

function codexActualModelDisplay() {
  const model = codexProbeModel();
  const configuredModel = normalizeCodexModel(model);
  if (!codexConnection.generationReady && codexConnection.actualModel && codexConnection.actualModel !== configuredModel) {
    return `待测试：${configuredModel}（上次失败：${codexConnection.actualModel}）`;
  }
  if (codexConnection.actualModel) return codexConnection.actualModel;
  if (codexConnection.generationReady) return codexConnection.lastProbeModel || "已通过模型";
  if (!codexModelIsDefault(configuredModel)) return `待测试：${configuredModel}`;
  return "真实测试后显示";
}

function codexProbeReasoningEffort() {
  return activeCodexReasoningEffort(codexProbeProfile());
}

function codexFailureSummary(status = codexConnection) {
  if (!status?.lastProbeAt && !status?.lastProbeError && !status?.failureTitle) return "";
  const title = status.failureTitle || "Codex 真实连通失败";
  const model = status.actualModel ? `实际模型：${status.actualModel}` : "";
  const advice = status.failureAdvice || compactLine(status.lastProbeError || "请重新做真实连通测试，或调整模型方案。", 260);
  return [title, model, advice].filter(Boolean).join("；");
}

function codexGenerationBlockerMessage(status = codexConnection) {
  if (!status?.installed || !status?.versionOk) {
    return `Codex 安装或版本检测未通过：${status?.lastProbeError || status?.error || status?.version || "请先检查安装路径。"}`;
  }
  if (status.generationReady) return "";
  if (status.lastProbeAt || status.lastProbeError || status.failureTitle) {
    return `Codex 尚未真实可生成。\n${codexFailureSummary(status) || "最近真实连通测试失败。"}`;
  }
  return "Codex 已安装，但还没有通过真实连通测试。请先到 AI接口点击“真实连通测试”。";
}

function codexProbeProfile() {
  return selectedModelProfileForTask("test") || activeModelProfile();
}

function codexProbeModel() {
  const profile = codexProbeProfile();
  const preset = providerPresets[profile?.provider || state.apiProvider] || providerPresets.codex;
  return normalizeCodexModel(profile?.model || state.apiModel || preset.model || CODEX_RECOMMENDED_MODEL);
}

function updateCodexStatusCards() {
  const installStatus = $("#codexInstallStatus");
  const installHint = $("#codexInstallHint");
  const versionStatus = $("#codexVersionStatus");
  const versionHint = $("#codexVersionHint");
  const availabilityStatus = $("#apiAvailabilityStatus");
  const availabilityHint = $("#apiAvailabilityHint");
  const actualModelStatus = $("#codexActualModelStatus");
  const actualModelHint = $("#codexActualModelHint");
  const failurePanel = $("#codexFailurePanel");
  const failureTitle = $("#codexFailureTitle");
  const failureAdvice = $("#codexFailureAdvice");
  const failureMeta = $("#codexFailureMeta");
  if (installStatus) {
    installStatus.textContent = codexConnection.installed
      ? "已安装"
      : "未找到";
    installStatus.dataset.status = codexConnection.installed ? "installed" : "unavailable";
  }
  if (installHint) {
    installHint.textContent = codexConnection.installed
      ? `${codexConnection.version || "已找到 Codex"} · ${codexConnection.path || "路径未知"}`
      : "只检查本机 codex.exe 和版本，不代表能生成。";
  }
  if (versionStatus) {
    versionStatus.textContent = codexConnection.installed
      ? (codexConnection.versionOk ? "正常" : "异常")
      : "未检测";
    versionStatus.dataset.status = codexConnection.installed
      ? (codexConnection.versionOk ? "ok" : "unavailable")
      : "unknown";
  }
  if (versionHint) {
    versionHint.textContent = codexConnection.installed
      ? (codexConnection.version || codexConnection.lastProbeError || "已找到 Codex。")
      : "先检查本机是否安装 Codex。";
  }
  if (actualModelStatus) {
    actualModelStatus.textContent = codexActualModelDisplay();
    actualModelStatus.dataset.status = codexConnection.actualModel
      ? (codexConnection.generationReady ? "ok" : "unavailable")
      : "unknown";
  }
  if (actualModelHint) {
    const configuredModel = codexProbeModel();
    const reasoning = codexReasoningLabel(codexProbeReasoningEffort());
    actualModelHint.textContent = codexConnection.actualModel
      ? (codexConnection.generationReady ? `真实生成通过：${reasoning}推理。` : `当前配置会测试 ${configuredModel} · ${reasoning}推理；这里保留的是最近失败时实际尝试的模型。`)
      : `当前配置会测试 ${configuredModel} · ${reasoning}推理。`;
  }
  const showFailure = state.apiProvider === "codex"
    && !codexConnection.generationReady
    && Boolean(codexConnection.lastProbeAt || codexConnection.lastProbeError || codexConnection.failureTitle);
  if (failurePanel) failurePanel.hidden = !showFailure;
  if (showFailure) {
    if (failureTitle) failureTitle.textContent = codexConnection.failureTitle || "Codex 真实连通失败";
    if (failureAdvice) failureAdvice.textContent = codexConnection.failureAdvice || compactLine(codexConnection.lastProbeError || "请调整模型方案后重新测试。", 360);
    if (failureMeta) {
      failureMeta.textContent = [
        codexConnection.actualModel ? `实际模型：${codexConnection.actualModel}` : "",
        codexConnection.failureType ? `类型：${codexConnection.failureType}` : "",
        codexConnection.lastProbeAt ? `时间：${codexConnection.lastProbeAt}` : "",
        codexConnection.lastProbeLogPath ? `日志：${codexConnection.lastProbeLogPath}` : ""
      ].filter(Boolean).join(" · ");
    }
  }
  if (!availabilityStatus || !availabilityHint) return;
  if (state.apiProvider !== "codex") {
    availabilityStatus.textContent = apiAvailability.status === "available" ? "可用" : (apiAvailability.status === "unavailable" ? "不可用" : "未检测");
    availabilityStatus.dataset.status = apiAvailability.status || "unknown";
    availabilityHint.textContent = apiAvailability.message || "点“测试接口”确认当前服务。";
    return;
  }
  if (codexConnection.generationReady) {
    availabilityStatus.textContent = "真实可生成";
    availabilityStatus.dataset.status = "available";
    availabilityHint.textContent = `${codexConnection.actualModel || codexConnection.lastProbeModel || codexModelDisplay(codexProbeModel())} · ${codexReasoningLabel(codexConnection.lastProbeReasoningEffort || codexProbeReasoningEffort())}推理 · ${codexConnection.lastProbeAt || "刚刚测试"}`;
    return;
  }
  if (codexConnection.lastProbeAt || codexConnection.lastProbeError || codexConnection.failureTitle) {
    availabilityStatus.textContent = "真实失败";
    availabilityStatus.dataset.status = "unavailable";
    availabilityHint.textContent = compactLine(codexConnection.failureTitle || codexConnection.lastProbeError || "真实连通失败", 160);
    return;
  }
  if (codexConnection.installed && codexConnection.versionOk) {
    availabilityStatus.textContent = "未真实测试";
    availabilityStatus.dataset.status = "unknown";
    availabilityHint.textContent = "Codex 已安装，但还没有跑真实连通测试。";
    return;
  }
  availabilityStatus.textContent = "不可用";
  availabilityStatus.dataset.status = "unavailable";
  availabilityHint.textContent = "请先检查 Codex 安装路径。";
}

function applyProviderPreset() {
  const preset = providerPresets[state.apiProvider] || providerPresets.custom;
  if (state.apiProvider !== "custom") {
    state.apiEndpoint = preset.endpoint;
    state.apiModel = preset.model;
    state.codexReasoningEffort = normalizeCodexReasoningEffort(preset.reasoningEffort || state.codexReasoningEffort);
    $("#apiEndpoint").value = state.apiEndpoint;
    $("#apiModel").value = state.apiModel;
    const reasoningInput = $("#codexReasoningEffort");
    if (reasoningInput) reasoningInput.value = state.codexReasoningEffort;
  }
  if (preset.noKey) {
    state.apiKey = "";
    state.saveApiKey = false;
    $("#apiKey").value = "";
    $("#saveApiKey").checked = false;
  }
  apiAvailability = { status: "unknown", message: "请先检查安装，再做真实连通测试。" };
  syncActiveModelProfileFromFields();
  renderModelControls();
  updateGenerationSettingsSummary();
  persist();
}

function updateApiHelp() {
  const preset = providerPresets[state.apiProvider] || providerPresets.custom;
  const profile = activeModelProfile();
  const keyInput = $("#apiKey");
  const saveKey = $("#saveApiKey");
  const temperatureInput = $("#apiTemperature");
  const maxTokensInput = $("#apiMaxTokens");
  const providerName = providerDisplayName();
  const modeName = $("#apiModeName");
  const modeHint = $("#apiModeHint");
  const smartHint = $("#apiSmartHint");
  const currentModel = $("#apiCurrentModel");
  const currentStrategy = $("#apiCurrentStrategy");
  const currentReasoning = $("#apiCurrentReasoning");
  const routeHint = $("#apiModelRouteHint");
  const availabilityStatus = $("#apiAvailabilityStatus");
  const availabilityHint = $("#apiAvailabilityHint");
  const advancedSettings = $(".api-advanced-settings");
  if (modeName) modeName.textContent = providerName.replace("，推荐", "");
  if (modeHint) {
    modeHint.textContent = preset.noKey
      ? "当前服务不需要 API Key。"
      : "当前服务需要在高级参数里填写 API Key。";
  }
  if (currentModel) {
    const rawModel = profile?.model || preset.model || state.apiModel || "未填写模型";
    const model = state.apiProvider === "codex" ? normalizeCodexModel(rawModel) : rawModel;
    currentModel.textContent = profile
      ? `${profile.name} · ${state.apiProvider === "codex" ? codexModelDisplay(model) : model}`
      : (state.apiProvider === "codex" ? codexModelDisplay(model) : model);
  }
  if (currentReasoning) {
    currentReasoning.textContent = state.apiProvider === "codex"
      ? `${codexReasoningLabel(activeCodexReasoningEffort(profile))}推理`
      : "按服务商默认";
  }
  if (currentStrategy) currentStrategy.textContent = modelStrategyLabels[state.modelStrategy] || "自定义模式";
  if (routeHint) routeHint.textContent = modelRouteSummary();
  if (smartHint) {
    smartHint.textContent = state.smartAiSettings
      ? "模块固定模板已开启：参数自动匹配；模型按功能绑定选择。"
      : "手动参数已开启：高级参数里的温度和最大输出会覆盖模板。";
  }
  if (availabilityStatus) {
    const labels = {
      available: "可用",
      unavailable: "不可用",
      unknown: "未检测"
    };
    availabilityStatus.textContent = labels[apiAvailability.status] || labels.unknown;
    availabilityStatus.dataset.status = apiAvailability.status || "unknown";
  }
  if (availabilityHint) {
    availabilityHint.textContent = apiAvailability.message || "点“检测可用性”确认当前服务。";
  }
  updateCodexStatusCards();
  if (temperatureInput) temperatureInput.disabled = Boolean(state.smartAiSettings);
  if (maxTokensInput) maxTokensInput.disabled = Boolean(state.smartAiSettings);
  if (advancedSettings && state.apiProvider !== "codex") {
    advancedSettings.open = true;
  }
  if (preset.noKey) {
    keyInput.disabled = true;
    saveKey.disabled = true;
    keyInput.placeholder = state.apiProvider === "codex" ? "Codex 使用本机登录状态，不需要 API Key" : "这个选项不需要 API Key";
  } else {
    keyInput.disabled = false;
    saveKey.disabled = false;
    keyInput.placeholder = "粘贴你的 API Key";
  }
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function beginAiCallGuard(task = "api", label = "") {
  if (activeAiCall) {
    const elapsed = formatAiTaskDuration(Date.now() - Number(activeAiCall.startedAt || Date.now()));
    const name = activeAiCall.label || usageTaskName(activeAiCall.task, activeAiCall.taskLabel);
    throw new Error(`当前已有 AI 任务正在运行：${name}，已运行 ${elapsed}。请等待完成后再启动新的 AI 功能，避免多个结果互相覆盖。`);
  }
  const id = `active-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeAiCall = {
    id,
    task,
    label: label || usageTaskName(task, label),
    startedAt: Date.now()
  };
  return id;
}

function finishAiCallGuard(id) {
  if (activeAiCall?.id === id) {
    activeAiCall = null;
  }
}

function isTerminalAiError(message) {
  const text = String(message || "").toLowerCase();
  return [
    "模型不可用",
    "model is required",
    "not supported",
    "unsupported",
    "api key",
    "上下文可能过大",
    "输出被截断",
    "最大输出限制",
    "没有返回可用内容",
    "安全策略拦截",
    "too large",
    "context",
    "rate limit",
    "没有检测到可用",
    "codex is not available"
  ].some((marker) => text.includes(marker));
}

function isRetryableAiError(message) {
  const text = String(message || "").toLowerCase();
  if (!text || isTerminalAiError(text)) return false;
  return [
    "stream disconnected",
    "reconnecting",
    "falling back",
    "network",
    "failed to fetch",
    "econnreset",
    "temporarily",
    "502",
    "503",
    "504"
  ].some((marker) => text.includes(marker));
}

function activeGenerationEndpoint(task = "quick") {
  const profile = selectedModelProfileForTask(task) || activeModelProfile();
  const provider = profile?.provider || state.apiProvider;
  const preset = providerPresets[provider] || providerPresets.custom;
  return profile?.endpoint || preset.endpoint || state.apiEndpoint;
}

async function buildDraftPreflightReport() {
  flushCurrentChapterEditor();
  const report = {
    ok: [],
    warnings: [],
    blocking: []
  };
  const promptLength = promptLengthEstimate("draft");
  const maxTokens = quickDraftMaxTokens();
  const latest = lastDraftedChapter();
  if (isShortStory()) {
    if (state.projectOutline.trim() || state.corePromise.trim()) report.ok.push("短篇设定可用。");
    else report.warnings.push("短篇设定/核心看点偏少，AI 会临时补全。");
  } else {
    if (state.projectOutline.trim()) report.ok.push(`项目大纲已准备：${compactCount(state.projectOutline)} 字。`);
    else report.warnings.push("项目大纲为空，生成会更依赖前文推断。");
    const storedChapter = Number(state.currentChapter || 0);
    const latestNumber = Number(chapterStats().maxDraftedNumber || 0);
    if (storedChapter && latestNumber && storedChapter !== latestNumber) {
      report.warnings.push(`旧进度字段与正文库最新章节不一致：currentChapter 为第${storedChapter}章，正文库最新为第${latestNumber}章；本次会以正文库最新章节为续写起点。`);
    }
    if (state.quickAnalysis.trim()) {
      const memoryLag = analysisLagInfo();
      if (memoryLag.covered && memoryLag.due) {
        report.blocking.push(`小说记忆卡只覆盖到第${memoryLag.covered}章，已落后正文库 ${memoryLag.lag} 章；请先重新分析记忆卡再生成正文。`);
      } else if (memoryLag.covered && memoryLag.lag > 0) {
        report.ok.push(`小说记忆卡覆盖到第${memoryLag.covered}章，落后 ${memoryLag.lag} 章，仍在${MEMORY_CARD_REFRESH_GAP}章缓冲内。`);
      } else if (!memoryLag.covered) {
        report.warnings.push("小说记忆卡没有记录覆盖章节，建议重新分析一次，避免承接错位。");
      } else {
        report.ok.push(`小说记忆卡已准备：覆盖到第${memoryLag.covered}章。`);
      }
    } else report.warnings.push("小说记忆卡为空，建议先点“分析前文”。");
    if (state.quickBrief.trim()) {
      const start = Number(state.quickBriefStartChapter || 0);
      const next = nextChapterNumber();
      const end = Number(state.quickBriefEndChapter || 0) || (start + directionChapterCount() - 1);
      if (!start) {
        report.blocking.push(`${directionLabel()}没有记录目标章节范围；请先重新推断章节方向。`);
      } else if (next < start || next > end) {
        report.blocking.push(`当前应写第${next}章，但${directionLabel()}对应第${start}-${end}章；请先重新推断方向。`);
      } else if (next !== start) {
        report.warnings.push(`当前应写第${next}章，仍在${directionLabel()}第${start}-${end}章范围内；如上一章已保存，建议确认方向仍适用。`);
      } else {
        report.ok.push(`${directionLabel()}已匹配当前章节：第${start}-${end}章。`);
      }
    } else report.warnings.push(`${directionLabel()}为空，AI 会边推断边写，稳定性会下降。`);
    if (latest) report.ok.push(`正文库最新章节：${chapterLabel(latest)}，下一章从第${nextChapterNumber()}章开始。`);
    else report.warnings.push("正文库没有已写章节，会从第1章或现有素材开始推断。");
    const evidenceMetrics = outlineEvidenceMetrics();
    if (evidenceMetrics.drafted >= 6 && !evidenceMetrics.hasRaw && !evidenceMetrics.hasIndex) {
      report.blocking.push(`AI资料库尚未建立，但正文库已有 ${evidenceMetrics.drafted} 章；请先点“快速更新 AI资料库”，避免漏掉中期伏笔、人物状态和设定变化。`);
    } else if (evidenceMetrics.unscanned >= MEMORY_CARD_REFRESH_GAP) {
      report.blocking.push(`AI资料库还有 ${evidenceMetrics.unscanned} 章未读取，已超过 ${MEMORY_CARD_REFRESH_GAP} 章缓冲；请先快速更新 AI资料库再生成正文。`);
    } else if (evidenceMetrics.unscanned > 0) {
      report.warnings.push(`AI资料库还有 ${evidenceMetrics.unscanned} 章未读取，仍在 ${MEMORY_CARD_REFRESH_GAP} 章缓冲内；如果最近章节刚修改过，建议先快速更新。`);
    } else if (evidenceMetrics.hasIndex || evidenceMetrics.hasRaw) {
      report.ok.push(outlineEvidenceStatusText());
    }
  }
  if (promptLength > 36000) {
    report.blocking.push(`预计发送约 ${promptLength} 字，超过安全上限。请先压缩项目大纲、小说记忆卡或${directionLabel()}，再生成。`);
  } else if (promptLength > 26000) {
    report.warnings.push(`预计发送约 ${promptLength} 字，偏大；已只保留固定流程资料，不会发送其他章节正文。`);
  } else {
    report.ok.push(`预计发送约 ${promptLength} 字，已只保留固定流程资料。`);
  }
  if (!isShortStory() && shouldDraftTwoChapters()) {
    report.ok.push(`当前为一次写两章，最大输出 ${maxTokens}。`);
  } else {
    report.ok.push(`当前最大输出 ${maxTokens}。`);
  }
  const openRevisionTasks = todoRevisionTasks(4);
  const highRiskRevisionTasks = openRevisionTasks.filter((task) => task.severity === "block");
  if (highRiskRevisionTasks.length) {
    report.warnings.push(`当前还有 ${highRiskRevisionTasks.length} 条高优先级修改任务未处理；生成正文会带入这些任务作为避坑要求。`);
  } else if (openRevisionTasks.length) {
    report.ok.push(`当前有 ${openRevisionTasks.length} 条未处理修改任务，已纳入本次 AI 参考。`);
  }
  const budgetRisk = draftOutputBudgetRisk(maxTokens);
  if (budgetRisk.level === "block") {
    report.blocking.push(`输出预算明显不足：目标约 ${budgetRisk.targetWords} 字，当前最大输出 ${budgetRisk.available}，建议至少 ${budgetRisk.recommended}。请先改成一次一章或提高生成正文最大输出。`);
  } else if (budgetRisk.level === "warn") {
    report.warnings.push(`输出预算偏紧：目标约 ${budgetRisk.targetWords} 字，当前最大输出 ${budgetRisk.available}，建议约 ${budgetRisk.recommended}；继续生成可能出现短章或截断。`);
  } else {
    report.ok.push(`输出预算匹配：目标约 ${budgetRisk.targetWords} 字，最大输出 ${budgetRisk.available}。`);
  }
  if (activeGenerationEndpoint("quick") === "codex://exec") {
    try {
      const status = await checkCodexStatus();
      if (status.generationReady) {
        report.ok.push(`Codex 真实可生成：${status.actualModel || status.lastProbeModel || status.version || "已连接"}。`);
      } else {
        report.blocking.push(codexGenerationBlockerMessage(status));
      }
    } catch (error) {
      report.blocking.push(`Codex 不可用：${error.message}`);
    }
  }
  return report;
}

function formatDraftPreflightReport(report) {
  const lines = ["生成前检查："];
  report.ok.forEach((item) => lines.push(`✓ ${item}`));
  report.warnings.forEach((item) => lines.push(`! ${item}`));
  report.blocking.forEach((item) => lines.push(`× ${item}`));
  return lines.join("\n");
}

async function callAi(prompt, options = {}) {
  syncFieldsForAiSnapshot();
  syncActiveModelProfileFromFields();
  if (location.protocol === "file:") {
    throw new Error("请通过 http://127.0.0.1:8787/ 打开网页端，file:// 模式不能调用本地 API。");
  }
  const aiSettings = aiSettingsFor(options.task || activePanelId(), options);
  const profile = options.profileId ? modelProfileById(options.profileId) : (selectedModelProfileForTask(aiSettings.task) || activeModelProfile());
  const provider = profile?.provider || state.apiProvider;
  const preset = providerPresets[provider] || providerPresets.custom;
  const endpoint = profile?.endpoint || preset.endpoint || state.apiEndpoint;
  const rawModel = profile?.model || preset.model || state.apiModel;
  const model = endpoint === "codex://exec" ? normalizeCodexModel(rawModel) : rawModel;
  const reasoningEffort = endpoint === "codex://exec" ? activeCodexReasoningEffort(profile) : "";
  if (endpoint === "codex://exec" && aiSettings.task !== "test") {
    const status = await checkCodexStatus();
    if (!status.generationReady) {
      throw new Error(codexGenerationBlockerMessage(status));
    }
  }
  const body = {
    provider,
    profileName: profile?.name || "",
    endpoint,
    apiKey: profile?.apiKey || state.apiKey,
    model,
    codexCommand: profile?.codexCommand || state.codexCommand,
    codexProfile: profile?.codexProfile || state.codexProfile,
    reasoningEffort,
    task: aiSettings.task,
    taskLabel: aiSettings.label,
    smartAiSettings: Boolean(state.smartAiSettings),
    prompt: sanitizeLegacySkillReferences(prompt),
    systemPrompt: sanitizeLegacySkillReferences(profile?.systemPrompt || state.apiSystemPrompt),
    temperature: aiSettings.temperature,
    maxTokens: aiSettings.maxTokens
  };
  const aiCallGuardId = beginAiCallGuard(aiSettings.task, aiSettings.label);
  const usageInputText = [body.systemPrompt, body.prompt].filter(Boolean).join("\n\n");
  const usageStartedAt = performance.now();
  const aiTaskId = startAiTaskRecord(body, profile, aiSettings, usageInputText);
  const maxRetries = Number.isFinite(Number(options.retries))
    ? Math.max(0, Number(options.retries))
    : (endpoint === "codex://exec" ? 1 : 0);
  try {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const data = await fetchJsonWithTimeout("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }, aiFetchTimeoutMs(aiSettings.task, aiSettings.maxTokens), aiSettings.label || "AI 请求");
        const content = data.content || "";
        const validationMessage = aiContentValidationMessage(content, options, data);
        if (validationMessage) {
          const validationError = new Error(validationMessage);
          validationError.aiContentValidation = true;
          validationError.aiContent = content;
          validationError.aiRaw = data.raw;
          validationError.serverTaskId = data.serverTask?.id || "";
          validationError.aiMeta = data.meta || body;
          if (data.serverTask) {
            serverAiTaskSnapshot = { records: [{ ...data.serverTask, status: "failed", error: validationMessage }] };
          }
          throw validationError;
        }
        finishAiTaskRecord(aiTaskId, "success", {
          outputChars: String(content || "").replace(/\s/g, "").length,
          serverTaskId: data.serverTask?.id || ""
        });
        if (data.serverTask) {
          serverAiTaskSnapshot = { records: [data.serverTask] };
          renderAiTaskStatus();
        } else {
          refreshServerAiTasks();
        }
        recordAiCall(data.meta || body, profile, aiSettings, {
          inputText: usageInputText,
          content,
          raw: data.raw,
          serverTaskId: data.serverTask?.id || "",
          durationMs: performance.now() - usageStartedAt,
          status: "success"
        });
        return content;
      } catch (error) {
        if (attempt < maxRetries && isRetryableAiError(error.message)) {
          updateAiTaskRecord(aiTaskId, {
            status: "running",
            attempt: attempt + 2,
            error: `第 ${attempt + 1} 次失败，正在重试：${error.message}`
          });
          if (typeof options.onRetry === "function") {
            options.onRetry(attempt + 1, error);
          }
          await waitMs(1200 + attempt * 1000);
          continue;
        }
        const failedContent = String(error.aiContent || "");
        finishAiTaskRecord(aiTaskId, "failed", {
          error: error.message,
          outputChars: failedContent.replace(/\s/g, "").length,
          serverTaskId: error.serverTaskId || ""
        });
        recordUsageEvent(buildUsageRecord({
          meta: error.aiMeta || body,
          profile,
          settings: aiSettings,
          inputText: usageInputText,
          content: failedContent,
          raw: error.aiRaw,
          serverTaskId: error.serverTaskId || "",
          durationMs: performance.now() - usageStartedAt,
          status: "failed",
          error: error.message
        }));
        refreshServerAiTasks();
        throw error;
      }
    }
  } finally {
    finishAiCallGuard(aiCallGuardId);
  }
  return "";
}

async function checkCodexStatus() {
  syncFields();
  const response = await fetch("/api/codex/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codexCommand: state.codexCommand,
      codexProfile: codexProbeProfile()?.codexProfile || state.codexProfile,
      model: codexProbeModel(),
      reasoningEffort: codexProbeReasoningEffort()
    })
  });
  const data = await response.json();
  mergeCodexConnection(data);
  if (!response.ok || !data.installed || !data.versionOk) {
    throw new Error(data.error || "没有检测到可用的 Codex。");
  }
  return data;
}

async function probeCodexConnection() {
  syncFields();
  syncActiveModelProfileFromFields();
  const profile = codexProbeProfile();
  const model = normalizeCodexModel(profile?.model || state.apiModel || CODEX_RECOMMENDED_MODEL);
  const reasoningEffort = activeCodexReasoningEffort(profile);
  const response = await fetch("/api/codex/probe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codexCommand: profile?.codexCommand || state.codexCommand,
      codexProfile: profile?.codexProfile || state.codexProfile,
      model,
      reasoningEffort
    })
  });
  const data = await response.json();
  mergeCodexConnection(data);
  if (!response.ok || !data.generationReady) {
    throw new Error(codexGenerationBlockerMessage(data) || data.lastProbeError || data.error || "Codex 真实连通测试失败。");
  }
  return data;
}

async function checkCodexInstallOnly() {
  const output = $("#aiOutput");
  syncFields();
  syncActiveModelProfileFromFields();
  if (output) output.value = "正在检查本机 Codex 安装和版本...";
  try {
    const status = await checkCodexStatus();
    const model = codexProbeModel();
    if (output) {
      const latestProbeLines = status.lastProbeAt || status.failureTitle || status.lastProbeError
        ? [
          "",
          `最近真实测试：${status.generationReady ? "通过" : "失败"}`,
          status.actualModel ? `实际模型：${status.actualModel}` : "",
          status.failureTitle ? `失败原因：${status.failureTitle}` : "",
          status.failureAdvice ? `处理建议：${status.failureAdvice}` : ""
        ].filter(Boolean)
        : ["", "最近真实测试：尚未执行"];
      output.value = [
        "Codex 安装检测通过。",
        `版本：${status.version || "未知"}`,
        `路径：${status.path || "未知"}`,
        `当前测试模型：${codexModelDisplay(model)}`,
        `当前推理等级：${codexReasoningLabel(codexProbeReasoningEffort())}`,
        ...latestProbeLines,
        "",
        "注意：这只代表本机已安装 Codex，不代表已经能生成。",
        status.generationReady ? "下一步：可以开始生成。" : "下一步：调整模型方案后点击“真实连通测试”。"
      ].join("\n");
    }
    setApiAvailability(
      codexConnection.generationReady ? "available" : ((codexConnection.lastProbeAt || codexConnection.failureTitle) ? "unavailable" : "unknown"),
      codexConnection.generationReady
        ? "Codex 真实连通测试已通过。"
        : (codexConnection.failureAdvice || "Codex 已安装，请继续做真实连通测试。")
    );
    $("#saveState").textContent = "Codex 安装检测完成";
  } catch (error) {
    if (output) output.value = "Codex 安装检测失败：\n" + error.message;
    setApiAvailability("unavailable", "安装检测失败：" + error.message);
  }
}

async function testApi() {
  const output = $("#aiOutput");
  syncFields();
  syncActiveModelProfileFromFields();
  const profile = activeModelProfile();
  output.value = state.apiProvider === "codex" ? "正在进行 Codex 真实连通测试..." : "正在测试接口...";
  try {
    if (state.apiProvider === "codex") {
      await checkCodexStatus();
      const probeProfile = codexProbeProfile();
      const status = await probeCodexConnection();
      const model = status.actualModel || status.lastProbeModel || codexModelDisplay(codexProbeModel());
      const reasoning = status.lastProbeReasoningEffort || codexProbeReasoningEffort();
      output.value = [
        "Codex 真实连通测试通过。",
        `版本：${status.version || codexConnection.version || "未知"}`,
        `路径：${status.path || codexConnection.path || "未知"}`,
        `当前方案：${probeProfile?.name || "默认模型"}`,
        `测试模型：${model}`,
        `推理等级：${codexReasoningLabel(reasoning)}`,
        `测试时间：${status.lastProbeAt || "刚刚"}`,
        "",
        `模型回复：${status.lastProbeContent || "接口连接成功"}`,
        "",
        "下一步：可以点击“直接生成”。"
      ].join("\n");
      recordAiCall({
        provider: "codex",
        model: status.actualModel || status.lastProbeModel || normalizeCodexModel(probeProfile?.model),
        profileName: probeProfile?.name || "",
        reasoningEffort: reasoning,
        task: "test",
        taskLabel: "connection-test",
        maxTokens: 128,
        codexDefault: codexModelIsDefault(probeProfile?.model)
      }, probeProfile, { task: "test", label: "connection-test", maxTokens: 0 }, { track: false });
      setApiAvailability("available", `Codex 真实可生成：${model}`);
      $("#saveState").textContent = "Codex 真实连通测试完成";
    } else {
      const content = await callAi("请回复：接口连接成功。", { task: "test", profileId: state.activeModelProfileId });
      output.value = content;
      setApiAvailability("available", "当前接口测试成功。");
      $("#saveState").textContent = "接口测试完成";
    }
  } catch (error) {
    const detail = state.apiProvider === "codex"
      ? (codexGenerationBlockerMessage() || error.message)
      : error.message;
    output.value = "接口测试失败：\n" + detail;
    setApiAvailability("unavailable", "检测失败：" + detail);
  }
}

async function generateWithAi() {
  const output = $("#aiOutput");
  syncFields();
  await persistBeforeAiTask(activePanelId(), { sync: false });
  output.value = state.apiProvider === "codex"
    ? "正在调用本机 Codex，通常需要几十秒到两分钟，请稍等..."
    : "正在生成...";
  try {
    const content = await callAi($("#promptOutput").value, { task: activePanelId() });
    state.aiOutput = content;
    output.value = content;
    persist();
    $("#saveState").textContent = "AI 生成完成";
  } catch (error) {
    output.value = "生成失败：\n" + error.message;
  }
}

async function generateQuickDraft() {
  const output = $("#quickOutput");
  if (quickDraftBusy) {
    setStatus("正文正在生成中，请等待当前任务结束");
    return;
  }
  setQuickDraftBusy(true);
  try {
    syncFields();
    flushCurrentChapterEditor();
    const switchedToDraft = ensureDraftModeForNewChapters();
    updatePrompt("quick");
    await persistBeforeAiTask("quick", { sync: false });
    const working = isShortStory() ? "正在生成短篇故事" : "正在生成正文";
    hideDraftRecoveryPanel();
    output.value = state.apiProvider === "codex"
      ? `${working}，正在调用本机 Codex，通常需要几十秒到两分钟，请稍等...`
      : `${working}...`;
    const preflight = await buildDraftPreflightReport();
    output.value = `${working}...\n\n${formatDraftPreflightReport(preflight)}\n\n${preflight.blocking.length ? "生成已暂停，请先处理以上问题。" : "检查通过，正在发送给 AI..."}`;
    if (preflight.blocking.length) {
      setStatus("生成前检查未通过");
      return;
    }
    if (isShortStory()) {
      state.shortReviewResult = "";
      state.polishReviewContext = "";
      setShortReviewStatus("pending");
      renderPolishReviewContext();
      const reviewOutput = $("#shortReviewResult");
      if (reviewOutput) reviewOutput.value = "";
    }
    if (switchedToDraft && !isShortStory()) {
      output.value += "\n\n提示：已自动切回“写新章节”模式，避免把旧章节当成当前章节继续改写。";
    }
    try {
      const content = await callAi(buildQuickDraftPromptForGeneration(), {
        task: "quick",
        maxTokens: quickDraftMaxTokens(),
        validateContent: draftOutputValidationMessage,
        onRetry: (attempt, error) => {
          output.value += `\n\n检测到临时连接问题，正在自动重试第 ${attempt} 次...\n原因：${error.message}`;
          setStatus(`正在自动重试第 ${attempt} 次`);
        }
      });
      const validationMessage = draftOutputValidationMessage(content);
      if (validationMessage) throw new Error(validationMessage);
      state.quickOutput = content;
      state.quickOutputSavedHash = "";
      state.aiOutput = content;
      output.value = content;
      const aiOutput = $("#aiOutput");
      if (aiOutput) aiOutput.value = content;
      updateQuickOutputStats();
      persist();
      const draftCount = splitGeneratedChapters(content).length;
      hideDraftRecoveryPanel();
      setStatus(isShortStory() ? "短篇已生成" : (draftCount > 1 ? `正文已生成，可保存 ${draftCount} 章` : "正文已生成"));
    } catch (error) {
      output.value = "生成失败：\n" + error.message;
      showDraftRecoveryPanel(error.message);
      setStatus("生成失败");
    }
  } finally {
    setQuickDraftBusy(false);
  }
}

async function reviewShortStoryDraft() {
  syncFields();
  const text = ($("#quickOutput")?.value || state.quickOutput || "").trim();
  const output = $("#shortReviewResult");
  if (!isShortStory()) {
    await saveQuickDraftAsChapter();
    return;
  }
  if (!text) {
    setStatus("请先生成短篇正文，再检查短篇");
    return;
  }
  await persistBeforeAiTask("shortReview", { sync: false });
  if (output) output.value = "正在检查短篇闭环、反转、结尾和节奏...";
  setShortReviewStatus("running");
  setStatus("正在检查短篇");
  try {
    const content = await callAi(buildShortStoryReviewPrompt(text), { task: "shortReview" });
    state.shortReviewResult = content;
    state.polishReviewContext = "";
    setShortReviewStatus(inferShortReviewStatus(content));
    renderPolishReviewContext();
    if (output) output.value = content;
    persist();
    setStatus("短篇检查完成，可以送去精修或保存短篇");
  } catch (error) {
    setShortReviewStatus("pending");
    if (output) output.value = "检查失败：\n" + error.message;
    setStatus("短篇检查失败");
  }
}

function openPolishPanel() {
  setAdvancedVisible(true);
  switchTab("polish");
  const input = $("#polishSource");
  if (input) input.focus();
  setStatus("已打开正文润色");
}

function useQuickOutputForPolish() {
  syncFields();
  const text = ($("#quickOutput")?.value || state.quickOutput || "").trim();
  if (!text) {
    setStatus("生成正文里还没有内容");
    return;
  }
  if (!isDraftOutputReady(text)) {
    setStatus("当前内容是生成状态、检查文本或失败日志，不能送去润色");
    return;
  }
  state.polishSource = text;
  state.polishReviewContext = "";
  const input = $("#polishSource");
  if (input) input.value = text;
  renderPolishReviewContext();
  setAdvancedVisible(true);
  switchTab("polish");
  persist();
  setStatus("已带入生成正文");
}

function copyQuickOutput() {
  const output = $("#quickOutput");
  const text = (output?.value || state.quickOutput || "").trim();
  if (!text) {
    setStatus("没有可复制的生成正文");
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      setStatus("生成正文已复制");
    }).catch(() => {
      if (output) fallbackCopy(output);
      setStatus("生成正文已复制");
    });
    return;
  }
  if (output) fallbackCopy(output);
  setStatus("生成正文已复制");
}

function clearQuickOutput() {
  state.quickOutput = "";
  state.aiOutput = "";
  const output = $("#quickOutput");
  const aiOutput = $("#aiOutput");
  if (output) output.value = "";
  if (aiOutput) aiOutput.value = "";
  hideDraftRecoveryPanel();
  updateQuickOutputStats();
  persist();
  setStatus("生成正文已清空");
}

function useShortStoryForIntensivePolish() {
  syncFields();
  const text = ($("#quickOutput")?.value || state.quickOutput || "").trim();
  if (!text) {
    setStatus("请先生成短篇正文");
    return;
  }
  state.polishSource = text;
  state.polishReviewContext = ($("#shortReviewResult")?.value || state.shortReviewResult || "").trim();
  state.polishMode = "intensive";
  const input = $("#polishSource");
  const mode = $("#polishMode");
  if (input) input.value = text;
  if (mode) mode.value = "intensive";
  renderPolishReviewContext();
  setAdvancedVisible(true);
  switchTab("polish");
  persist();
  setStatus(state.polishReviewContext ? "已带入精修润色和短篇检查意见" : "已带入精修润色");
}

async function polishChapter() {
  syncFields();
  const input = ($("#polishSource")?.value || state.polishSource || "").trim();
  const output = $("#polishOutput");
  if (!input) {
    setStatus("请先粘贴需要润色的章节");
    return;
  }
  await persistBeforeAiTask("polish", { sync: false });
  if (output) output.value = "正在润色正文，通常需要几十秒到两分钟...";
  setStatus("正在润色正文");
  try {
    const content = await callAi(buildPolishPrompt(input, state.polishReviewContext || ""), { task: "polish", maxTokens: polishMaxTokens(input) });
    state.polishOutput = content;
    state.aiOutput = content;
    if (output) output.value = content;
    const aiOutput = $("#aiOutput");
    if (aiOutput) aiOutput.value = content;
    persist();
    setStatus("正文润色完成");
  } catch (error) {
    if (output) output.value = "润色失败：\n" + error.message;
    setStatus("润色失败");
  }
}

async function runQualityAudit() {
  syncFields();
  flushCurrentChapterEditor();
  const output = $("#qualityAuditResult");
  const stats = chapterStats();
  if (!stats.drafted && !String(state.projectOutline || "").trim()) {
    setStatus("请先导入正文库或整理项目大纲，再运行长篇体检");
    return;
  }
  await persistBeforeAiTask("quality", { sync: false });
  if (output) output.value = "正在进行长篇质量体检，通常需要几十秒到几分钟...";
  setStatus("正在进行长篇质量体检");
  try {
    const content = await callAi(buildQualityAuditPrompt(), {
      task: "quality",
      maxTokens: aiTaskPreset("quality").maxTokens
    });
    state.qualityAuditResult = content;
    state.qualityAuditUpdatedAt = new Date().toISOString();
    state.lastQualityAuditWords = Number(stats.totalWords || 0);
    if (Number(stats.totalWords || 0) >= 50000) {
      state.lastStructuralAuditWords = Number(stats.totalWords || 0);
    }
    state.aiOutput = content;
    if (output) output.value = content;
    const aiOutput = $("#aiOutput");
    if (aiOutput) aiOutput.value = content;
    updateQualityAuditUi();
    persist();
    setStatus("长篇质量体检完成");
  } catch (error) {
    if (output) output.value = "长篇体检失败：\n" + error.message;
    setStatus("长篇体检失败");
  }
}

function currentChapterDraftForPolish() {
  const editorDraft = ($("#chapterEditorDraft")?.value || "").trim();
  if (editorDraft) return editorDraft;
  return String(currentChapterRecord()?.draft || "").trim();
}

function useQualityAuditForPolish() {
  syncFields();
  const audit = ($("#qualityAuditResult")?.value || state.qualityAuditResult || "").trim();
  if (!audit) {
    setStatus("请先运行长篇体检，再送去润色");
    return;
  }
  if (/^(正在|长篇体检失败|体检失败)/.test(audit)) {
    setStatus("当前体检结果不可用，请等体检完成后再送去润色");
    return;
  }
  const source = currentChapterDraftForPolish();
  state.polishReviewContext = `【长篇体检报告，作为本次精修优先处理依据】\n${audit}`;
  state.polishMode = "intensive";
  if (source) {
    state.polishSource = source;
    const input = $("#polishSource");
    if (input) input.value = source;
  }
  const mode = $("#polishMode");
  if (mode) mode.value = "intensive";
  renderPolishReviewContext();
  setAdvancedVisible(true);
  switchTab("polish");
  persist();
  setStatus(source ? "已带入长篇体检报告和当前章节，建议直接开始精修" : "已带入长篇体检报告，请粘贴要精修的章节");
}

function copyPolishOutput() {
  const output = $("#polishOutput");
  const text = (output?.value || state.polishOutput || "").trim();
  if (!text) {
    setStatus("没有可复制的润色结果");
    return;
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      setStatus("润色结果已复制");
    }).catch(() => {
      fallbackCopy(output);
      setStatus("润色结果已复制");
    });
    return;
  }
  fallbackCopy(output);
  setStatus("润色结果已复制");
}

function usePolishAsQuickOutput() {
  syncFields();
  const text = ($("#polishOutput")?.value || state.polishOutput || "").trim();
  if (!text) {
    setStatus("没有可放入的润色结果");
    return;
  }
  state.quickOutput = text;
  const quickOutput = $("#quickOutput");
  if (quickOutput) quickOutput.value = text;
  updateQuickOutputStats();
  persist();
  setStatus("已放入生成正文");
}

function endingOutputTarget(mode) {
  const map = {
    libraryScan: ["endingLibraryScanResult", "正文库完结扫描"],
    diagnosis: ["endingDiagnosis", "完结诊断"],
    payoffs: ["endingPayoffResult", "待回收伏笔整理"],
    reverse: ["endingReverseOutline", "倒排完结大纲"],
    readiness: ["endingReadinessResult", "完结可行性检查"]
  };
  return map[mode] || map.diagnosis;
}

async function generateEndingPlan(mode = "diagnosis") {
  syncFields();
  state.endingTaskMode = mode;
  const [fieldId, label] = endingOutputTarget(mode);
  const output = document.getElementById(fieldId);
  const prompt = buildEndingPrompt(mode);
  const promptOutput = $("#promptOutput");
  if (promptOutput) promptOutput.value = prompt;
  await persistBeforeAiTask("ending", { sync: false });
  if (output) output.value = `正在生成${label}，通常需要几十秒到两分钟...`;
  setStatus(`正在生成${label}`);
  try {
    const content = await callAi(prompt, { task: "ending", maxTokens: aiTaskPreset("ending").maxTokens });
    state[fieldId] = content;
    state.aiOutput = content;
    if (output) output.value = content;
    const aiOutput = $("#aiOutput");
    if (aiOutput) aiOutput.value = content;
    updateEndingUi();
    markUsageEstimateDirty(`ending:${mode}`);
    persist();
    updatePrompt("ending", { force: true });
    setStatus(`${label}已生成`);
  } catch (error) {
    if (output) output.value = `${label}生成失败：\n${error.message}`;
    setStatus(`${label}生成失败`);
  }
}

function normalizeChapterNumberToken(value) {
  const fullWidthDigits = "０１２３４５６７８９";
  return String(value || "").replace(/[０-９]/g, (char) => String(fullWidthDigits.indexOf(char)));
}

function parseChineseChapterNumber(value) {
  const text = normalizeChapterNumberToken(value).trim();
  if (/^\d+$/.test(text)) return Number(text);
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  let total = 0;
  let current = 0;
  for (const char of text) {
    if (Object.prototype.hasOwnProperty.call(digits, char)) {
      current = digits[char];
    } else if (char === "十") {
      total += (current || 1) * 10;
      current = 0;
    } else if (char === "百") {
      total += (current || 1) * 100;
      current = 0;
    }
  }
  const number = total + current;
  return number > 0 ? number : 0;
}

function cleanEndingPlanTitle(value, number) {
  const text = String(value || "")
    .replace(/^[：:、\-\s]+/, "")
    .split(/[|｜；;]/)[0]
    .replace(/^章节目标[：:]/, "")
    .trim();
  return text || `第${number}章`;
}

function parseEndingReversePlans(text) {
  const lines = String(text || "").split(/\r?\n/);
  const plans = [];
  let current = null;
  const chapterPattern = /^\s*(?:#{1,6}\s*)?(?:[-*]\s*)?(?:\d+[.、]\s*)?第\s*([0-9０-９一二两三四五六七八九十百零〇]+)\s*章\s*([：:、\-\s].*)?$/;
  const tableChapterPattern = /^\s*\|?\s*第\s*([0-9０-９一二两三四五六七八九十百零〇]+)\s*章\s*(?:\||[：:、\-\s])\s*(.*)$/;
  lines.forEach((line) => {
    const match = line.match(chapterPattern) || line.match(tableChapterPattern);
    if (match) {
      if (current) plans.push(current);
      const number = parseChineseChapterNumber(match[1]);
      current = {
        number,
        title: cleanEndingPlanTitle(match[2] || "", number),
        lines: [line]
      };
      return;
    }
    if (current) current.lines.push(line);
  });
  if (current) plans.push(current);
  return plans
    .filter((plan) => Number.isFinite(plan.number) && plan.number > 0)
    .map((plan) => ({
      ...plan,
      summary: plan.lines.join("\n").trim()
    }));
}

function endingPlanNote(plan) {
  const source = plan.summary || `${chapterLabel(plan)}：${plan.title}`;
  const trimmed = source.length > 1800 ? `${source.slice(0, 1800)}...` : source;
  return [
    "【完结倒排计划】",
    trimmed,
    state.endingLibraryScanResult ? `\n【正文库扫描参考】\n${state.endingLibraryScanResult.slice(0, 1200)}` : "",
    state.endingAuthorDecisions ? `\n【作者最终决定】\n${state.endingAuthorDecisions}` : ""
  ].filter(Boolean).join("\n");
}

function mergeEndingPlanNotes(existing, note) {
  const oldNote = String(existing || "").trim();
  if (!oldNote) return note;
  if (oldNote.includes("【完结倒排计划】")) {
    return `${oldNote}\n\n【更新后的完结倒排计划】\n${note}`;
  }
  return `${oldNote}\n\n${note}`;
}

function applyEndingReverseOutlineToChapterPlans() {
  syncFields();
  const text = String(state.endingReverseOutline || "").trim();
  if (!text) {
    setStatus("请先生成或填写倒排完结大纲");
    return;
  }
  const plans = parseEndingReversePlans(text);
  if (!plans.length) {
    setStatus("倒排大纲里没有识别到“第X章”章节计划");
    return;
  }
  const message = `将把 ${plans.length} 个倒排计划写入正文库。已有正文的章节不会覆盖，只会跳过。是否继续？`;
  if (!confirm(message)) return;
  saveCurrentChapter({ silent: true, skipRender: true, persist: false });
  const existingByNumber = new Map(state.chapters.map((chapter) => [Number(chapter.number || 0), chapter]));
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let firstAffectedId = "";
  plans.forEach((plan, index) => {
    const existing = existingByNumber.get(plan.number);
    const note = endingPlanNote(plan);
    if (existing) {
      if (chapterWordCount(existing) > 0) {
        skipped += 1;
        return;
      }
      const genericTitle = !existing.title || existing.title === `第${plan.number}章`;
      if (genericTitle) existing.title = plan.title || existing.title || `第${plan.number}章`;
      existing.status = "brief";
      existing.notes = mergeEndingPlanNotes(existing.notes, note);
      updated += 1;
      firstAffectedId ||= existing.id;
      return;
    }
    const chapter = {
      id: `chapter-${Date.now()}-ending-${index + 1}`,
      number: plan.number,
      title: plan.title || `第${plan.number}章`,
      status: "brief",
      draft: "",
      notes: note
    };
    state.chapters.push(chapter);
    existingByNumber.set(plan.number, chapter);
    created += 1;
    firstAffectedId ||= chapter.id;
  });
  if (!created && !updated) {
    setStatus(`没有写入计划章节，已跳过 ${skipped} 个已有正文的章节`);
    return;
  }
  if (state.endingStage === "serial") {
    state.endingStage = "preparing";
    const stage = $("#endingStage");
    if (stage) stage.value = state.endingStage;
  }
  if (!Number(state.endingRemainingChapters || 0)) {
    state.endingRemainingChapters = plans.length;
    const remaining = $("#endingRemainingChapters");
    if (remaining) remaining.value = state.endingRemainingChapters;
  }
  if (firstAffectedId) state.activeChapterId = firstAffectedId;
  invalidateChapterCache({ sourceMode: "notes" });
  renderChapterLibrary();
  updateEndingUi();
  markUsageEstimateDirty("ending-plan-chapters");
  persist();
  updatePrompt("ending", { force: true });
  setStatus(`已写入完结计划：新建 ${created} 章，更新 ${updated} 章，跳过 ${skipped} 章`);
}

function useChaptersAsSource() {
  const source = chaptersAsDraftSourceText();
  if (!source.trim()) {
    setStatus(isShortStory() ? "还没有已保存短篇可带入" : "正文库里还没有可汇总的正文");
    return;
  }
  state.quickSourceText = "";
  const input = $("#quickSourceText");
  if (input) {
    input.value = "";
    input.dataset.loaded = "false";
  }
  const details = $("#quickSourceDetails");
  if (details) details.open = false;
  persist();
  updateQuickSourceSummary();
  markUsageEstimateDirty("use-chapter-source");
  deferUsageEstimate("use-chapter-source");
  setStatus(isShortStory() ? "已带入已保存短篇作为参考" : "已切换为从正文库读取前文");
}

async function analyzeNovelSource() {
  syncFields();
  const hasContext = Boolean(
    String(state.quickSourceText || "").trim() ||
    String(state.outlineEvidenceCards || "").trim() ||
    draftedChaptersForEvidence().length ||
    String(state.projectOutline || "").trim()
  );
  if (!hasContext && !isShortStory()) {
    setStatus("请先填写项目大纲、导入正文库，或先更新 AI资料库");
    return;
  }
  await persistBeforeAiTask("analysis", { sync: false });
  const output = $("#quickAnalysis");
  output.value = isShortStory()
    ? "正在分析短篇草稿，通常需要几十秒到两分钟..."
    : "正在分析记忆卡，通常需要几十秒到两分钟...";
  setStatus(isShortStory() ? "正在分析短篇" : "正在分析记忆卡");
  try {
    const content = await callAi(buildAnalysisPrompt(), { task: "analysis" });
    const coveredChapter = lastDraftedChapter();
    state.quickAnalysis = content;
    state.quickAnalysisChapter = Number(coveredChapter?.number || 0);
    state.quickAnalysisSourceLabel = coveredChapter ? chapterLabel(coveredChapter) : "手动前文";
    state.quickAnalysisUpdatedAt = new Date().toISOString();
    state.projectState = content;
    output.value = content;
    const projectState = $("#projectState");
    if (projectState) projectState.value = content;
    markUsageEstimateDirty("analysis-result");
    persist();
    updateMemorySummaryCards();
    updatePrompt("quick");
    setStatus(isShortStory() ? "短篇理解完成" : "记忆卡分析完成");
  } catch (error) {
    output.value = "分析失败：\n" + error.message;
    setStatus("分析失败");
  }
}

async function generateProjectOutline(options = {}) {
  syncFields();
  const hasNovelSource = Boolean(
    String(state.quickSourceText || "").trim() ||
    String(state.outlineEvidenceCards || "").trim() ||
    draftedChaptersForEvidence().length
  );
  if (!hasNovelSource && !state.quickAnalysis.trim() && !state.projectOutline.trim() && !(isShortStory() && state.corePromise.trim())) {
    setStatus(isShortStory() ? "请先填写核心看点，或先写一点短篇设定" : "请先粘贴已有小说，或先写一点项目大纲");
    return;
  }
  await persistBeforeAiTask("outline", { sync: false });
  const output = $("#outlineResult");
  const workingMessage = options.fromCheck
    ? (isShortStory() ? "正在根据检查结果和作者确认优化设定..." : "正在根据检查结果和作者确认优化大纲...")
    : (isShortStory() ? "正在整理短篇设定..." : "正在整理项目大纲...");
  if (output) output.value = workingMessage;
  setStatus(options.fromCheck
    ? (isShortStory() ? "正在根据确认优化设定" : "正在根据确认优化大纲")
    : (isShortStory() ? "正在整理短篇设定" : "正在整理项目大纲"));
  try {
    const content = await callAi(buildOutlinePrompt(), { task: "outline" });
    state.outlineResult = content;
    if (output) output.value = content;
    markUsageEstimateDirty("outline-result");
    if (state.outlineMode === "check") {
      state.outlineCheckResult = content;
      state.outlineConfirmationParseError = "";
      try {
        state.outlineConfirmations = buildOutlineConfirmationsFromResult(content);
        renderOutlineConfirmations();
      } catch (parseError) {
        state.outlineConfirmationParseError = parseError.message || String(parseError);
      }
      openMemoryDrawer("outline");
      openDetails(".outline-review-accordion");
    }
    persist();
    updateMemorySummaryCards();
    updatePrompt("quick");
    if (state.outlineMode === "check" && state.outlineConfirmationParseError) {
      setStatus(isShortStory() ? "设定检查完成，但确认项提取失败" : "大纲检查完成，但确认项提取失败");
    } else {
      setStatus(state.outlineMode === "check"
        ? (isShortStory() ? "设定检查完成，可处理作者确认后优化" : "大纲检查完成，可处理作者确认后优化")
        : (isShortStory() ? "设定整理结果已生成，确认后可点“应用整理结果”" : "大纲整理结果已生成，确认后可点“应用整理结果”"));
    }
  } catch (error) {
    if (output) output.value = "生成大纲失败：\n" + error.message;
    setStatus("生成大纲失败");
  }
}

async function inferNextChapter() {
  syncFields();
  const hasContext = Boolean(
    String(state.quickSourceText || "").trim() ||
    String(state.outlineEvidenceCards || "").trim() ||
    draftedChaptersForEvidence().length
  );
  if (!hasContext && !state.quickAnalysis.trim() && !state.projectOutline.trim() && !(isShortStory() && state.corePromise.trim())) {
    setStatus(isShortStory() ? "请先填写短篇设定或核心看点" : "请先粘贴已有小说，或先整理大纲");
    return;
  }
  await persistBeforeAiTask("planning", { sync: false });
  const output = $("#quickBrief");
  const directionName = directionLabel();
  output.value = isShortStory()
    ? "正在自动理解已有草稿，并生成完整短篇骨架..."
    : `正在按大纲、小说理解和正文库最近两个章节推断${directionName}...`;
  setStatus(isShortStory() ? "正在生成短篇骨架（含草稿理解）" : `正在推断${directionName}`);
  try {
    const targetStart = nextChapterNumber();
    const content = await callAi(buildNextDirectionPrompt(), { task: "planning" });
    state.quickBrief = content;
    state.quickBriefStartChapter = isShortStory() ? 0 : targetStart;
    state.quickBriefEndChapter = isShortStory() ? 0 : targetStart + directionChapterCount() - 1;
    state.quickBriefAnchorChapter = latestDraftNumber();
    state.quickBriefUpdatedAt = new Date().toISOString();
    if (!isShortStory()) markStructuralRefreshComplete();
    output.value = content;
    markUsageEstimateDirty("brief-result");
    persist();
    updateMemorySummaryCards();
    updatePrompt("quick");
    setStatus(isShortStory() ? "短篇骨架已生成" : `${directionName}已生成`);
  } catch (error) {
    output.value = "推断失败：\n" + error.message;
    setStatus("推断失败");
  }
}

function splitGeneratedChapters(text) {
  const clean = String(text || "").trim();
  if (!clean) return [];
  const markerParts = clean
    .split(/^[^\S\r\n]*={3,}[^\S\r\n]*(?:下一章|下章|第二章|next[^\S\r\n]*chapter)[^\S\r\n]*={3,}[^\S\r\n]*$/gim)
    .map((part) => part.trim())
    .filter(Boolean);
  if (markerParts.length > 1) return markerParts;

  const headingMatches = Array.from(clean.matchAll(/^#{0,3}\s*第\s*[\d一二三四五六七八九十百千万]+\s*章[^\n]*$/gm));
  if (headingMatches.length > 1) {
    return headingMatches.map((match, index) => {
      const start = match.index || 0;
      const end = headingMatches[index + 1]?.index ?? clean.length;
      return clean.slice(start, end).trim();
    }).filter(Boolean);
  }
  return [clean];
}

function titleFromGeneratedChapter(text, fallbackNumber, index) {
  const firstLine = String(text || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
  const cleaned = firstLine.replace(/^#+\s*/, "").replace(/^标题[:：]\s*/, "").trim();
  if (isShortStory()) {
    return (state.quickTitle || state.projectTitle || cleaned || "短篇故事").trim().slice(0, 80);
  }
  if (index === 0 && (state.quickTitle || "").trim()) {
    return state.quickTitle.trim().replace(/^第\s*[\d一二三四五六七八九十百千万]+\s*章\s*/, "").slice(0, 80) || "自动生成章节";
  }
  const numbered = cleaned.match(/^第\s*[\d一二三四五六七八九十百千万]+\s*章\s*(.*)$/);
  if (numbered) return (numbered[1] || cleaned).slice(0, 80);
  return "自动生成章节";
}

function chineseChapterNumberToInt(value) {
  const raw = String(value || "").trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  const digitMap = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
  };
  const unitMap = { 十: 10, 百: 100, 千: 1000 };
  let total = 0;
  let section = 0;
  let number = 0;
  for (const char of raw) {
    if (Object.prototype.hasOwnProperty.call(digitMap, char)) {
      number = digitMap[char];
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(unitMap, char)) {
      section += (number || 1) * unitMap[char];
      number = 0;
      continue;
    }
    if (char === "万") {
      section += number;
      total += section * 10000;
      section = 0;
      number = 0;
    }
  }
  return total + section + number;
}

function chapterNumberFromGeneratedChapter(text, fallbackNumber) {
  const match = String(text || "").match(/^\s*#{0,3}\s*第\s*([0-9一二两三四五六七八九十百千万〇零]+)\s*章/m);
  const parsed = match ? chineseChapterNumberToInt(match[1]) : 0;
  return parsed || fallbackNumber;
}

function draftedChapterExists(number) {
  const target = Number(number || 0);
  return sortedChapters().some((chapter) => Number(chapter.number || 0) === target && chapterWordCount(chapter) > 0);
}

function nextAvailableGeneratedChapterNumber(startNumber, usedNumbers = new Set()) {
  let number = Math.max(1, Number(startNumber || 1));
  while (usedNumbers.has(number) || draftedChapterExists(number)) {
    number += 1;
  }
  return number;
}

function mergeGeneratedChapterNotes(existingNotes, generatedNotes) {
  const existing = String(existingNotes || "").trim();
  const generated = String(generatedNotes || "").trim();
  if (!existing) return generated;
  if (!generated || existing.includes(generated)) return existing;
  return `${existing}\n\n---\n\n${generated}`;
}

function chapterFulfillmentRecord(chapter, draftText, index, total, quality) {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const directionRange = Number(state.quickBriefStartChapter || 0) && Number(state.quickBriefEndChapter || 0)
    ? `第${state.quickBriefStartChapter}-${state.quickBriefEndChapter}章`
    : "未记录";
  const explicitRequired = [state.quickMustHave, state.readerReward].filter(Boolean).join("、");
  const chapterAnchors = directionAnchorTextForChapter(Number(chapter?.number || 0), 6);
  const requiredReward = compactLine(explicitRequired || chapterAnchors || draftRequiredAnchorText(), 260) || "未填写";
  const qualityRawItems = Array.isArray(quality?.items)
    ? quality.items.filter((item) => item && item.level !== "pass")
    : [];
  const revisionGateItems = qualityRawItems
    .filter((item) => item.source === "revisionTaskGate")
    .map((item) => compactLine(item.message || "", 180))
    .filter(Boolean);
  const qualityItems = qualityRawItems
    .filter((item) => item.source !== "revisionTaskGate")
    .slice(0, 4)
    .map((item) => compactLine(item.message || item.level || "", 120))
    .filter(Boolean);
  const qualitySummary = quality?.title
    ? `${quality.title}${qualityItems.length ? `：${qualityItems.join("；")}` : ""}`
    : "未检查";
  const revisionGateSummary = revisionGateItems.length ? revisionGateItems.slice(0, 2).join("；") : "无";
  const chapterDirection = briefSegmentForChapter(Number(chapter?.number || 0)) || state.quickBrief || "";
  const directionExcerpt = trimHeadTailForPrompt(chapterDirection, 900, "章节方向摘录").trim();
  return [
    "【本章兑现记录】",
    `章节：${chapterLabel(chapter)}`,
    `保存时间：${generatedAt}`,
    `生成范围：${total > 1 ? `第 ${index + 1}/${total} 段` : "单章"}`,
    `对应方向：${directionRange}`,
    `字数：${draftPartWordCount(draftText)}`,
    `必须出现/读者奖励：${requiredReward}`,
    `保存前质量门：${qualitySummary}`,
    `未处理高优先级修改任务：${revisionGateSummary}`,
    directionExcerpt || "章节方向摘录：未记录",
    "后续检查：下次更新 AI资料库时，请核对本章目标是否兑现、人物状态是否变化、是否新增/回收伏笔、章末压力是否成立。"
  ].join("\n");
}

async function saveQuickDraftAsChapter(options = {}) {
  syncFields();
  const output = ($("#quickOutput")?.value || state.quickOutput || "").trim();
  if (quickDraftBusy) {
    setStatus("正文还在生成中，不能保存");
    return;
  }
  if (!output) {
    setStatus("没有可保存的正文");
    return;
  }
  if (!isDraftOutputReady(output)) {
    setStatus("当前内容是生成状态、检查文本或失败日志，不是正文，不能保存");
    return;
  }
  const outputHash = shortHash(output);
  const quality = draftQualityReport(output);
  renderDraftQualityGate(output, { allowForceSave: quality.level === "warn" });
  if (quality.level === "block") {
    draftQualityWarnConfirmHash = "";
    setStatus("保存前质量门未通过：当前内容不是可保存正文");
    return;
  }
  if (quality.level === "warn" && (!options.allowWarn || draftQualityWarnConfirmHash !== outputHash)) {
    draftQualityWarnConfirmHash = outputHash;
    setStatus("保存前质量门发现风险：请先处理提示项，或在质量门里点击“确认仍保存”。");
    return;
  }
  if (state.quickOutputSavedHash && state.quickOutputSavedHash === outputHash) {
    setStatus("这份生成正文已经保存过；如需另存，请先修改正文或重新生成");
    return;
  }
  const nextNumber = nextChapterNumber();
  const parts = isShortStory() ? [output] : splitGeneratedChapters(output);
  const usedPlanIds = new Set();
  const usedNumbers = new Set();
  let updatedPlans = 0;
  let createdNew = 0;
  const savedChapters = parts.map((part, index) => {
    const fallbackNumber = nextNumber + index;
    const parsedNumber = chapterNumberFromGeneratedChapter(part, fallbackNumber);
    const number = nextAvailableGeneratedChapterNumber(parsedNumber, usedNumbers);
    usedNumbers.add(number);
    const title = titleFromGeneratedChapter(part, fallbackNumber, index);
    const baseNotes = isShortStory()
      ? `${state.quickBrief || ""}\n\n短篇模式保存`.trim()
      : (parts.length > 1 ? `${state.quickBrief || ""}\n\n自动拆分保存：第 ${index + 1} 段正文`.trim() : state.quickBrief || "");
    const notes = mergeGeneratedChapterNotes(
      baseNotes,
      chapterFulfillmentRecord({ number, title }, part, index, parts.length, quality)
    );
    const planned = isShortStory() ? null : writablePlannedChapterByNumber(number, usedPlanIds);
    if (planned) {
      usedPlanIds.add(planned.id);
      planned.title = title && title !== "自动生成章节" ? title : (planned.title || title || `第 ${number} 章`);
      planned.status = "drafted";
      planned.draft = part;
      planned.notes = mergeGeneratedChapterNotes(planned.notes, notes);
      updatedPlans += 1;
      return planned;
    }
    createdNew += 1;
    const chapter = {
      id: `chapter-${Date.now()}-${index + 1}`,
      number,
      title,
      status: "drafted",
      draft: part,
      notes
    };
    state.chapters.push(chapter);
    return chapter;
  });
  invalidateChapterCache();
  markChaptersEvidenceDirty(savedChapters);
  deferUsageEstimate("save-generated-chapters");
  const lastChapter = savedChapters[savedChapters.length - 1];
  state.activeChapterId = lastChapter.id;
  state.currentChapter = lastChapter.number;
  state.releaseStatus = "drafted";
  state.aiOutput = output;
  state.quickOutputSavedHash = outputHash;
  draftQualityWarnConfirmHash = "";
  state.quickMode = "draft";
  state.quickSourceText = "";
  state.quickLastHook = "";
  const mode = $("#quickMode");
  const sourceInput = $("#quickSourceText");
  if (mode) mode.value = state.quickMode;
  if (sourceInput) {
    sourceInput.value = "";
    sourceInput.dataset.loaded = "false";
  }
  const sourceDetails = $("#quickSourceDetails");
  if (sourceDetails) sourceDetails.open = false;
  persist();
  renderChapterLibrary();
  updateWritingContextBoard();
  updateMemorySummaryCards();
  updateQuickSourceSummary();
  updateDraftBoundaryNotice(output);
  schedulePromptUpdate("quick");
  setStatus(isShortStory()
    ? `已保存短篇：${lastChapter.title || "短篇故事"}`
    : (savedChapters.length > 1
      ? `已保存 ${savedChapters.length} 个正史章节（写入计划 ${updatedPlans} 个，新增 ${createdNew} 个），AI资料库更新时会读取`
      : (updatedPlans ? `已写入待写计划并转为正史：${chapterLabel(lastChapter)}` : `已保存为新正史章节：${chapterLabel(lastChapter)}`)));
  const target = $("#saveState");
  if (target) target.textContent = "章节已保存到浏览器，正在同步项目库...";
  const syncResult = await autoSaveProjectLibraryAfterChapterSave("generated-draft");
  if (!syncResult?.ok) {
    setStatus(`章节已保存到浏览器，但项目库同步未完成：${syncResult?.error?.message || "请手动保存项目库"}`);
  }
}

function handleSaveQuickDraftAsChapter(options = {}) {
  saveQuickDraftAsChapter(options).catch((error) => {
    setStatus("保存生成正文失败：" + (error.message || String(error)));
  });
}

function bindEvents() {
  bindFields();
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => updatePrompt(button.dataset.prompt, { force: true }));
  });
  $("#advancedToggleBtn").addEventListener("click", () => {
    switchTab("advancedTools");
  });
  document.querySelectorAll("[data-open-tool]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.openTool));
  });
  document.querySelectorAll("[data-open-memory]").forEach((button) => {
    button.addEventListener("click", () => openMemoryDrawer(button.dataset.openMemory));
  });
  $("#knowledgeSummaryCard")?.addEventListener("click", openKnowledgeDetails);
  $("#closeKnowledgeDetailsBtn")?.addEventListener("click", closeKnowledgeDetails);
  document.querySelectorAll("[data-usage-range]").forEach((button) => {
    button.addEventListener("click", () => {
      usageRange = button.dataset.usageRange || "24h";
      renderUsageStats();
    });
  });
  $("#usageTaskFilter")?.addEventListener("change", renderUsageStats);
  $("#usageProviderFilter")?.addEventListener("change", renderUsageStats);
  $("#refreshUsageBtn")?.addEventListener("click", renderUsageStats);
  $("#exportUsageBtn")?.addEventListener("click", exportUsageRecords);
  $("#importHistoricalUsageBtn")?.addEventListener("click", importHistoricalUsageRecords);
  $("#refreshUsageProjectsBtn")?.addEventListener("click", loadUsageProjectOptions);
  $("#previewUsageProjectImportBtn")?.addEventListener("click", () => previewUsageProjectImport().catch((error) => setStatus("生成历史估算预览失败：" + error.message)));
  $("#confirmUsageProjectImportBtn")?.addEventListener("click", confirmUsageProjectImport);
  $("#undoUsageImportBtn")?.addEventListener("click", undoLastUsageImport);
  $("#includeCorpusGenerationCost")?.addEventListener("change", () => {
    if (!usageImportPreview) return;
    previewUsageProjectImport().catch(() => {
      usageImportPreview = buildUsageImportPreview(usageImportPreview.project || state, {
        source: usageImportPreview.source,
        projectId: usageImportPreview.projectId,
        ...currentUsageImportOptions()
      });
      renderUsageImportPreview(usageImportPreview);
    });
  });
  $("#usageEmptyImportBtn")?.addEventListener("click", importHistoricalUsageRecords);
  document.querySelectorAll("[data-open-usage-target]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.openUsageTarget));
  });
  $("#clearUsageBtn")?.addEventListener("click", clearUsageRecords);
  $("#themeWall")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-theme-id]");
    if (!card) return;
    selectTheme(card.dataset.themeId);
  });
  $("#themeDrawerOpenBtn")?.addEventListener("click", openThemeDrawer);
  $("#themeDrawerCloseBtn")?.addEventListener("click", closeThemeDrawer);
  $("#themeDrawerBackdrop")?.addEventListener("click", closeThemeDrawer);
  $("#simpleModeToggle")?.addEventListener("change", (event) => {
    state.simpleMode = Boolean(event.target.checked);
    applySimpleMode();
    schedulePersist();
  });
  $("#closeMemoryDrawerBtn")?.addEventListener("click", closeMemoryDrawer);
  $("#closeMemoryDrawerBackdrop")?.addEventListener("click", closeMemoryDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#knowledgeDetails")?.open) closeKnowledgeDetails();
    if (event.key === "Escape" && !$("#memoryDrawer")?.hidden) closeMemoryDrawer();
    if (event.key === "Escape" && !$("#themeDrawer")?.hidden) closeThemeDrawer();
  });
  $("#useChaptersAsSourceBtn").addEventListener("click", useChaptersAsSource);
  $("#quickSourceDetails")?.addEventListener("toggle", (event) => {
    if (event.currentTarget.open) ensureQuickSourceLoaded();
  });
  $("#analyzeNovelBtn").addEventListener("click", analyzeNovelSource);
  $("#generateOutlineBtn").addEventListener("click", generateProjectOutline);
  $("#updateAiKnowledgeBtn")?.addEventListener("click", () => {
    updateAiKnowledgeLibrary().catch((error) => {
      setStatus("更新 AI资料库失败：" + error.message);
      const output = $("#outlineResult");
      if (output) output.value = "更新 AI资料库失败：\n" + error.message;
    });
  });
  $("#organizeAiKnowledgeBtn")?.addEventListener("click", () => {
    compressOutlineEvidenceLibrary().catch((error) => {
      setStatus("深度整理 AI资料库失败：" + error.message);
      const output = $("#outlineResult");
      if (output) output.value = "深度整理 AI资料库失败：\n" + error.message;
    });
  });
  $("#clearOutlineEvidenceBtn")?.addEventListener("click", clearOutlineEvidenceLibrary);
  $("#refreshProjectBibleInlineBtn")?.addEventListener("click", () => {
    refreshProjectBible().catch((error) => {
      setStatus("刷新项目圣经失败：" + error.message);
    });
  });
  $("#applyOutlineResultBtn").addEventListener("click", applyOutlineResult);
  $("#extractOutlineConfirmationsBtn").addEventListener("click", extractOutlineConfirmations);
  $("#optimizeOutlineFromCheckBtn").addEventListener("click", () => {
    optimizeOutlineFromCheck().catch((error) => {
      setStatus("根据确认优化失败：" + error.message);
    });
  });
  $("#inferNextBtn").addEventListener("click", inferNextChapter);
  $("#focusPrimaryBtn")?.addEventListener("click", runWorkbenchPrimaryAction);
  $("#endingLibraryScanBtn")?.addEventListener("click", () => generateEndingPlan("libraryScan"));
  $("#endingDiagnosisBtn")?.addEventListener("click", () => generateEndingPlan("diagnosis"));
  $("#endingPayoffBtn")?.addEventListener("click", () => generateEndingPlan("payoffs"));
  $("#endingReverseBtn")?.addEventListener("click", () => generateEndingPlan("reverse"));
  $("#endingReadinessBtn")?.addEventListener("click", () => generateEndingPlan("readiness"));
  $("#endingApplyPlanBtn")?.addEventListener("click", applyEndingReverseOutlineToChapterPlans);
  $("#quickGenerateBtn").addEventListener("click", generateQuickDraft);
  $("#quickSaveOutputBtn")?.addEventListener("click", () => handleSaveQuickDraftAsChapter());
  $("#copyQuickOutputBtn")?.addEventListener("click", copyQuickOutput);
  $("#quickOutputToPolishBtn")?.addEventListener("click", useQuickOutputForPolish);
  $("#clearQuickOutputBtn")?.addEventListener("click", clearQuickOutput);
  $("#retryEconomyDraftBtn")?.addEventListener("click", () => retryDraftWithEconomy().catch((error) => setStatus("省量重试失败：" + error.message)));
  $("#retrySingleDraftBtn")?.addEventListener("click", () => retryDraftSingleChapter().catch((error) => setStatus("单章重试失败：" + error.message)));
  $("#viewCodexLogBtn")?.addEventListener("click", viewLastCodexLog);
  $("#copyDraftErrorBtn")?.addEventListener("click", copyDraftErrorDetails);
  $("#draftQualityToPolishBtn")?.addEventListener("click", useDraftQualityForPolish);
  $("#draftQualityToReleaseBtn")?.addEventListener("click", useDraftQualityForRelease);
  $("#draftQualityOpenAuditBtn")?.addEventListener("click", openQualityAuditFromDraftGate);
  $("#draftQualityForceSaveBtn")?.addEventListener("click", () => handleSaveQuickDraftAsChapter({ allowWarn: true }));
  $("#quickOpenDiagnosisBtn")?.addEventListener("click", () => switchTab("diagnosis"));
  $("#diagnosisOpenQualityBtn")?.addEventListener("click", () => switchTab("quality"));
  $("#diagnosisOpenReleaseBtn")?.addEventListener("click", () => switchTab("release"));
  $("#diagnosisOpenOutlineBtn")?.addEventListener("click", () => {
    state.outlineMode = "check";
    const modeSelect = $("#outlineMode");
    if (modeSelect) modeSelect.value = "check";
    openMemoryDrawer("outline");
    setStatus("已打开项目大纲抽屉；可先检查大纲，再把确认项送入修复中心处理");
  });
  $("#diagnosisFromQualityBtn")?.addEventListener("click", addDraftQualityRevisionTasks);
  $("#diagnosisFromAuditBtn")?.addEventListener("click", addQualityAuditRevisionTasks);
  $("#diagnosisFromReleaseBtn")?.addEventListener("click", addReleaseRevisionTasks);
  $("#revisionFromCurrentQualityBtn")?.addEventListener("click", addDraftQualityRevisionTasks);
  $("#revisionFromQualityBtn")?.addEventListener("click", addDraftQualityRevisionTasks);
  $("#revisionFromAuditBtn")?.addEventListener("click", addQualityAuditRevisionTasks);
  $("#revisionFromReleaseBtn")?.addEventListener("click", addReleaseRevisionTasks);
  $("#revisionApplyReviewBtn")?.addEventListener("click", applyRevisionTaskReviewFromLatestResult);
  $("#revisionClearDoneBtn")?.addEventListener("click", clearDoneRevisionTasks);
  $("#revisionAiClassifyBtn")?.addEventListener("click", () => classifyRevisionTasksWithAi().catch((error) => setStatus("AI分类任务失败：" + error.message)));
  $("#revisionAiPlanBtn")?.addEventListener("click", () => generateRevisionTaskPlan().catch((error) => setStatus("生成修改方案失败：" + error.message)));
  $("#revisionAiOutlinePatchBtn")?.addEventListener("click", () => generateRevisionTaskOutlinePatch().catch((error) => setStatus("生成大纲补充失败：" + error.message)));
  $("#revisionAiMemoryPatchBtn")?.addEventListener("click", () => generateRevisionTaskMemoryPatch().catch((error) => setStatus("生成记忆卡补充失败：" + error.message)));
  $("#revisionAiRewriteBtn")?.addEventListener("click", () => rewriteCurrentChapterForRevisionTasks().catch((error) => setStatus("AI修正文失败：" + error.message)));
  $("#revisionAiReviewBtn")?.addEventListener("click", () => reviewRevisionTasksWithAi().catch((error) => setStatus("AI复查任务失败：" + error.message)));
  $("#revisionAiApplyDraftBtn")?.addEventListener("click", applyRevisionAiDraftToCurrentChapter);
  $("#revisionAiApplyOutlinePatchBtn")?.addEventListener("click", applyRevisionOutlinePatchToResult);
  $("#revisionAiApplyMemoryPatchBtn")?.addEventListener("click", applyRevisionMemoryPatchToAnalysis);
  $("#revisionAiOutput")?.addEventListener("input", (event) => {
    state.revisionAiOutput = event.target.value || "";
    if (state.revisionAiResultType === "rewrite") state.revisionAiDraft = state.revisionAiOutput;
    else state.revisionAiDraft = "";
    renderRevisionAiPanel();
    schedulePersist();
  });
  $("#revisionTaskList")?.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-revision-select]");
    if (checkbox) {
      updateRevisionTaskSelection(checkbox.dataset.revisionSelect, checkbox.checked);
      return;
    }
    const routeSelect = event.target.closest("[data-revision-route]");
    if (routeSelect) {
      updateRevisionTaskRoute(routeSelect.dataset.revisionRoute, routeSelect.value);
      return;
    }
    const select = event.target.closest("[data-revision-status]");
    if (!select) return;
    updateRevisionTaskStatus(select.dataset.revisionStatus, select.value);
  });
  $("#revisionTaskList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-revision-delete]");
    if (!button) return;
    deleteRevisionTask(button.dataset.revisionDelete);
  });
  $("#quickSaveChapterBtn").addEventListener("click", () => {
    if (isShortStory()) {
      reviewShortStoryDraft().catch((error) => setStatus("短篇检查失败：" + error.message));
      return;
    }
    handleSaveQuickDraftAsChapter();
  });
  $("#shortSaveStoryBtn")?.addEventListener("click", () => handleSaveQuickDraftAsChapter());
  $("#shortReviewToPolishBtn")?.addEventListener("click", useShortStoryForIntensivePolish);
  $("#useQuickOutputForPolishBtn").addEventListener("click", useQuickOutputForPolish);
  $("#polishChapterBtn").addEventListener("click", polishChapter);
  $("#copyPolishOutputBtn").addEventListener("click", copyPolishOutput);
  $("#usePolishAsQuickOutputBtn").addEventListener("click", usePolishAsQuickOutput);
  $("#qualityAuditBtn")?.addEventListener("click", runQualityAudit);
  $("#qualityToPolishBtn")?.addEventListener("click", useQualityAuditForPolish);
  $("#copyPromptBtn").addEventListener("click", copyPrompt);
  $("#saveBtn").addEventListener("click", () => {
    syncFields();
    flushCurrentChapterEditor();
    persist();
  });
  $("#saveProjectBtn").addEventListener("click", () => {
    saveProjectToLibrary().catch((error) => {
      $("#saveState").textContent = "项目库保存失败：" + error.message;
    });
  });
  $("#refreshProjectsBtn").addEventListener("click", () => {
    refreshProjectLibrary();
    refreshAppStatus();
  });
  $("#refreshProjectBibleBtn")?.addEventListener("click", () => {
    refreshProjectBible().catch((error) => {
      const message = "项目圣经刷新失败：" + error.message;
      setStatus(message);
      $("#saveState").textContent = message;
    });
  });
  $("#loadProjectBtn").addEventListener("click", () => {
    loadSelectedProject().catch((error) => {
      $("#saveState").textContent = "打开项目失败：" + error.message;
    });
  });
  $("#chapterLibrary").addEventListener("change", () => {
    selectChapterById($("#chapterLibrary").value);
  });
  $("#chapterSearchInput")?.addEventListener("input", scheduleChapterListRefresh);
  $("#chapterStatusFilter")?.addEventListener("change", refreshChapterListView);
  $("#chapterCardList").addEventListener("click", (event) => {
    const card = event.target.closest("[data-chapter-id]");
    if (!card) return;
    selectChapterById(card.dataset.chapterId);
  });
  $("#newChapterBtn").addEventListener("click", createNewChapter);
  $("#saveChapterBtn").addEventListener("click", saveCurrentChapter);
  $("#chapterFocusBtn")?.addEventListener("click", toggleChapterFocusMode);
  $("#chapterLibraryToggleBtn")?.addEventListener("click", toggleChapterLibraryPanel);
  $("#chapterSideToggleBtn")?.addEventListener("click", toggleChapterSidePanel);
  $("#chapterSideCloseBtn")?.addEventListener("click", () => setChapterSideCollapsed(true));
  $("#aiToChapterBtn").addEventListener("click", writeAiOutputToChapter);
  $("#exportChapterBtn").addEventListener("click", exportCurrentChapterMarkdown);
  $("#exportCurrentTxtBtn").addEventListener("click", exportCurrentChapterTxt);
  $("#exportSelectedTxtBtn").addEventListener("click", exportSelectedChaptersTxt);
  $("#exportAllTxtBtn").addEventListener("click", exportAllChaptersTxt);
  $("#deleteChapterBtn").addEventListener("click", deleteCurrentChapter);
  $("#chapterEditorDraft").addEventListener("input", () => {
    scheduleChapterStatsUpdate();
    updateChapterSaveState();
    scheduleChapterEditorAutosave();
    schedulePromptUpdate("manuscript");
  });
  ["chapterEditorNumber", "chapterEditorStatus", "chapterEditorTitle", "chapterEditorNotes"].forEach((id) => {
    const element = $(`#${id}`);
    const handler = () => {
      markChapterEditorDirty();
      scheduleChapterEditorAutosave();
      schedulePromptUpdate("manuscript");
    };
    element.addEventListener("input", handler);
    element.addEventListener("change", handler);
  });
  $("#exportBtn").addEventListener("click", exportState);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#resetBtn").addEventListener("click", resetState);
  $("#apiProvider").addEventListener("change", () => {
    syncFields();
    applyProviderPreset();
  });
  $("#modelProfileSelect")?.addEventListener("change", (event) => selectModelProfile(event.target.value));
  $("#modelProfileName")?.addEventListener("input", (event) => {
    const profile = activeModelProfile();
    if (profile) profile.name = event.target.value || profile.name;
    state.modelStrategy = "custom";
    renderModelProfileOptions();
    updateApiHelp();
    schedulePersist();
  });
  $("#saveModelProfileBtn")?.addEventListener("click", saveActiveModelProfile);
  $("#newModelProfileBtn")?.addEventListener("click", createNewModelProfile);
  $("#deleteModelProfileBtn")?.addEventListener("click", deleteActiveModelProfile);
  document.querySelectorAll("[data-model-strategy]").forEach((button) => {
    button.addEventListener("click", () => applyModelStrategy(button.dataset.modelStrategy));
  });
  document.querySelectorAll("[data-codex-preset]").forEach((button) => {
    button.addEventListener("click", () => applyCodexPreset(button.dataset.codexPreset));
  });
  document.querySelectorAll("[data-codex-model]").forEach((button) => {
    button.addEventListener("click", () => chooseCodexModel(button.dataset.codexModel));
  });
  $("#detectCodexBtn").addEventListener("click", checkCodexInstallOnly);
  $("#codexProbeBtn").addEventListener("click", testApi);
  $("#testApiBtn").addEventListener("click", testApi);
  $("#generateWithAiBtn").addEventListener("click", generateWithAi);
  $("#refreshDiagnosticsBtn")?.addEventListener("click", refreshDiagnostics);
  $("#copyDiagnosticsBtn")?.addEventListener("click", copyDiagnostics);
  $("#clearApiKeyBtn").addEventListener("click", () => {
    state.apiKey = "";
    state.saveApiKey = false;
    modelProfiles().forEach((profile) => {
      profile.apiKey = "";
    });
    $("#apiKey").value = "";
    $("#saveApiKey").checked = false;
    renderModelControls();
    persist();
  });
  $("#importFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    try {
      await importStateFromFile(file);
    } catch (error) {
      const message = "导入失败：" + (error.message || String(error));
      setStatus(message);
      $("#saveState").textContent = message;
    } finally {
      event.target.value = "";
    }
  });
  document.addEventListener("input", handleDynamicInput);
  document.addEventListener("change", handleDynamicInput);
  window.addEventListener("beforeunload", (event) => {
    if (!quickDraftBusy && !chapterEditorHasUnsavedChanges() && !hasUnsavedGeneratedOutput() && !loadStateWarning) return;
    event.preventDefault();
    event.returnValue = "";
  });
  window.addEventListener("resize", updateChapterResponsiveControls);
}

function handleDynamicInput(event) {
    const target = event.target;
    if (target.dataset.check) {
      state.checklist[target.dataset.check] = target.checked;
      schedulePersist();
      updatePrompt("release");
    }
    if (target.dataset.outlineConfirmIndex) {
      const index = Number(target.dataset.outlineConfirmIndex);
      const key = target.dataset.key;
      if (Number.isInteger(index) && state.outlineConfirmations[index] && ["choice", "note"].includes(key)) {
        state.outlineConfirmations[index][key] = target.value;
        if (key === "choice") renderOutlineConfirmations();
        updateMemorySummaryCards();
        schedulePersist();
        schedulePromptUpdate("outline");
      }
    }
    if (target.dataset.modelBinding) {
      state.moduleModelBindings[target.dataset.modelBinding] = target.value;
      state.modelStrategy = "custom";
      renderModelControls();
      schedulePersist();
    }
}

function frontendBehaviorSelfTestChapter(title, lines) {
  return [
    title,
    "",
    ...lines
  ].join("\n");
}

function runFrontendBehaviorSelfTest() {
  const savedState = JSON.parse(JSON.stringify(state));
  const quickOutputField = $("#quickOutput");
  const savedQuickOutputValue = quickOutputField ? quickOutputField.value : null;
  const setSelfTestQuickOutput = (value) => {
    state.quickOutput = value;
    if (quickOutputField) quickOutputField.value = value;
  };
  const checks = [];
  const pass = (name, details = "") => checks.push({ name, status: "pass", details });
  const assert = (condition, name, details = "") => {
    if (!condition) {
      const error = new Error(`${name}${details ? `：${details}` : ""}`);
      error.checks = checks;
      throw error;
    }
    pass(name, details);
  };
  try {
    state = normalizeState({
      ...defaults,
      projectMode: "serial",
      quickDraftScope: "two",
      targetWords: 900,
      quickBriefStartChapter: 3,
      quickBriefEndChapter: 4,
      quickBrief: "第3章打开安全屋，兑现钥匙线索；第4章承接名单压力。",
      quickMustHave: "安全屋钥匙、红牌名单、门外压力"
    });
    invalidateChapterCache();

    assert(OUTLINE_EVIDENCE_BATCH_SIZE === 2, "AI资料库快速更新每批最多2章");
    assert(OUTLINE_EVIDENCE_CHAPTER_LIMIT <= 1800, "AI资料库单章摘录已压缩");
    assert(
      typeof currentProjectIsBlankForAutoLoad === "function" && typeof showOpenProjectBeforeEvidenceMessage === "function",
      "空项目保护和打开项目提示已就绪"
    );

    const invalidOutput = "抱歉，当前会话里没有可用的 $novel-writing 技能，因此无法按该技能流程生成正文。";
    assert(Boolean(draftOutputValidationMessage(invalidOutput)), "错误输出会被正文校验拦截");
    assert(Boolean(aiContentValidationMessage(invalidOutput, { validateContent: draftOutputValidationMessage })), "AI内容校验钩子会拦截错误正文");
    assert(!isDraftOutputReady(invalidOutput), "错误输出不会被视为可保存正文");
    const failedUsage = buildUsageRecord({
      meta: { provider: "codex", model: CODEX_RECOMMENDED_MODEL, task: "quick" },
      settings: { task: "quick", label: "生成正文" },
      inputText: "生成正文",
      content: invalidOutput,
      status: "failed",
      error: draftOutputValidationMessage(invalidOutput),
      serverTaskId: "server-ai-task-selftest"
    });
    assert(
      failedUsage.status === "failed" && failedUsage.outputTokens > 0 && failedUsage.historyKey === "server-task:server-ai-task-selftest",
      "校验失败会按失败统计并保留输出消耗"
    );
    assert(
      aiSnapshotSkipFields.has("quickOutput") && aiSnapshotSkipFields.has("aiOutput"),
      "AI调用前快照会跳过临时输出框"
    );
    state.lastPreAiSaveAt = "2026-05-28T00:00:00.000Z";
    state.lastPreAiSaveTask = "quick";
    state.lastPreAiSaveStatus = "project-library";
    assert(
      preAiSaveStatusText().includes("发送前快照") && preAiSaveStatusText().includes("已写入项目库"),
      "AI任务状态会显示发送前快照"
    );
    const originalStoredState = localStorage.getItem(STORAGE_KEY);
    const originalLoadWarning = loadStateWarning;
    try {
      localStorage.setItem(STORAGE_KEY, "{ broken");
      loadStateWarning = null;
      const recoveredState = loadState();
      assert(
        Boolean(loadStateWarning) && recoveredState.projectTitle === defaults.projectTitle,
        "浏览器缓存损坏会进入恢复提示"
      );
    } finally {
      if (originalStoredState === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, originalStoredState);
      loadStateWarning = originalLoadWarning;
    }
    let badImportBlocked = false;
    try {
      parseImportedStateText("{ broken");
    } catch {
      badImportBlocked = true;
    }
    assert(badImportBlocked, "导入坏备份不会覆盖当前项目");
    setSelfTestQuickOutput("# 第三章 安全屋钥匙\n\n尚未保存的生成正文");
    state.quickOutputSavedHash = "";
    assert(hasUnsavedGeneratedOutput(), "未入库生成正文会阻止替换项目");
    assert(unsavedReplacementReasons().includes("生成正文尚未保存入正文库"), "项目替换会提示未入库生成正文");
    const originalConfirm = window.confirm;
    let confirmCalled = false;
    try {
      window.confirm = () => {
        confirmCalled = true;
        return false;
      };
      const replacement = confirmProjectReplacement("打开项目");
      assert(!replacement.ok && replacement.canceled && confirmCalled, "打开项目会拦截未保存生成正文");
    } finally {
      window.confirm = originalConfirm;
      setSelfTestQuickOutput("");
      state.quickOutputSavedHash = "";
    }
    setSelfTestQuickOutput("# 第三章 安全屋钥匙\n\n已保存的生成正文");
    state.quickOutputSavedHash = shortHash(state.quickOutput);
    assert(!hasUnsavedGeneratedOutput(), "已入库生成正文不会重复阻止替换项目");
    setSelfTestQuickOutput("生成失败：Codex ran out of room in the model's context window.");
    state.quickOutputSavedHash = "";
    assert(!hasUnsavedGeneratedOutput(), "失败日志不会被当作未入库正文");
    setSelfTestQuickOutput("");
    state.quickOutputSavedHash = "";
    state.quickMustHave = "";
    state.readerReward = "";
    state.quickBriefStartChapter = 3;
    state.quickBriefEndChapter = 4;
    state.quickBrief = [
      "4. 第一章推断，也就是下一章：",
      "   - 本章核心目标：打开安全屋铁门，确认红牌名单是真实权限线索。",
      "   - 读者奖励：拿到安全屋钥匙和短暂物资。",
      "   - 章末钩子：门外巡逻队封锁走廊。",
      "5. 第二章推断，也就是下下章：",
      "   - 本章核心目标：追查红牌名单背后的内库权限。",
      "   - 读者奖励：发现名单最后一行写着林野编号。",
      "   - 章末钩子：安全屋第三个活人暴露。"
    ].join("\n");
    assert(
      briefSegmentForChapter(3).includes("安全屋钥匙") && briefSegmentForChapter(4).includes("林野编号"),
      "章节方向可按第一章/第二章匹配实际章号"
    );
    assert(
      draftRequiredAnchorText().includes("安全屋钥匙"),
      "必写质量锚点可从章节方向兜底"
    );

    const chapterThree = frontendBehaviorSelfTestChapter("# 第三章 安全屋钥匙", [
      "林野决定打开那道被焊死的铁门，他没有解释太多，只把钥匙压进锁孔，确认门后的脚步声越来越近。",
      "苏眠发现门缝里夹着一张红牌名单，名单上有他们一直追查的编号，也有安全屋真正的权限标记。",
      "两人拿到物资和证据，短暂活了下来，但广播忽然响起，提醒所有巡逻队立刻封锁这条走廊。",
      "门外传来枪栓拉开的声音，林野确认这不是结束，而是他们第一次真正暴露。"
    ]);
    const chapterFour = frontendBehaviorSelfTestChapter("# 第四章 红牌名单", [
      "名单上的名字证明秦婉没有撒谎，她冒险交出的不是求救信，而是一条能进入内库的路线。",
      "林野选择和苏眠分头行动，一边破坏监控，一边把名单里的叛徒引到旧仓库门口。",
      "他们获得了新的通行权限，也确认安全屋里还有第三个人活着，这个人知道老赵失踪的真相。",
      "就在苏眠准备关门时，名单最后一行自动浮现，写着林野自己的编号。"
    ]);
    const generated = `${chapterThree}\n\n${chapterFour}`;
    const parts = splitGeneratedChapters(generated);
    assert(parts.length === 2, "两章正文会按章节标题拆分", `识别到 ${parts.length} 段`);
    const report = draftQualityReport(generated);
    assert(report.level !== "block", "可用正文不会被质量门误判为阻断", report.title);
    assert(
      report.items.some((item) => item.message.includes("必须出现/读者奖励已有明显命中")),
      "质量门会确认必须出现项已兑现"
    );
    const offPlanDraft = [
      "# 第三章 雨夜",
      "",
      "林野在屋里想了很久，回忆过去的争吵，没有行动，也没有拿到新的东西。",
      "",
      "# 第四章 空白",
      "",
      "苏眠站在窗边看雨，故事停在原地，既没有新的线索，也没有新的压力。"
    ].join("\n");
    const offPlanReport = draftQualityReport(offPlanDraft);
    assert(
      offPlanReport.items.some((item) => item.message.includes("必须出现/读者奖励未明显命中")),
      "质量门会提示必须出现项未兑现"
    );
    assert(
      offPlanReport.items.some((item) => item.message.includes("方向关键词未明显命中")),
      "质量门会提示章节方向未兑现"
    );
    const flatExplanationPart = [
      "# 第三章 说明",
      "",
      "他很清楚这意味着事情并不简单，也就是说问题在于他们必须继续等待，但事实上所有选择都指向同一个结论。".repeat(24)
    ].join("\n");
    const flatItems = draftSemanticQualityItems(flatExplanationPart, 1, 900);
    assert(
      flatItems.some((item) => item.message.includes("对话/人物交锋信号偏少")),
      "质量门会提示人物交锋不足"
    );
    assert(
      flatItems.some((item) => item.message.includes("场景物件/感官细节偏少")),
      "质量门会提示小说现场感不足"
    );
    const wrappedDraft = [
      "好的，以下是根据你的要求生成的正文：",
      "",
      "# 第三章 安全屋钥匙",
      "",
      "林野推开门，走廊里的灯忽明忽暗，枪声从楼下传来。".repeat(18)
    ].join("\n");
    const wrappedReport = draftQualityReport(wrappedDraft);
    assert(
      wrappedReport.items.some((item) => item.message.includes("AI 说明/前言")),
      "质量门会提示AI前言包装"
    );
    const ruleLoopPart = [
      "# 第三章 深层复核",
      "",
      "系统提示：当前对象进入复核流程，记录来源待确认。".repeat(32)
    ].join("\n");
    const ruleLoopItems = draftSemanticQualityItems(ruleLoopPart, 1, 900);
    assert(
      ruleLoopItems.some((item) => item.message.includes("规则术语密度偏高")),
      "质量门会提示规则术语过密"
    );
    assert(
      ruleLoopItems.some((item) => item.message.includes("章末钩子偏系统提示/待确认")),
      "质量门会提示系统式章末钩子"
    );
    assert(
      ruleLoopItems.some((item) => item.message.includes("连续重复句风险")),
      "质量门会提示连续重复句"
    );
    setSelfTestQuickOutput(ruleLoopPart);
    state.quickOutputSavedHash = "";
    const ruleLoopTasks = revisionTasksFromQualityGate();
    assert(
      ruleLoopTasks.some((task) => task.title.includes("把流程规则落成可见行动和代价")),
      "质量门待办会给出流程循环改写动作"
    );
    assert(
      ruleLoopTasks.some((task) => task.title.includes("重写章末钩子为真实危险或人物选择")),
      "质量门待办会给出章末钩子改写动作"
    );
    assert(
      ruleLoopTasks.some((task) => task.title.includes("删除连续重复段落")),
      "质量门待办会给出重复段落处理动作"
    );
    const structuredAuditText = [
      "## 8. 可执行修改任务",
      "- 问题：第80章规则术语过密",
      "  影响：读者像在看流程说明，追读奖励不清楚",
      "  怎么改：删掉重复复核句，补林野付出身体代价和赵刚一次实质损失",
      "  优先级：P0",
      "  验证：重读本章能看到敌方损失、主角代价和明确阶段回报"
    ].join("\n");
    const structuredTasks = revisionTasksFromText(structuredAuditText, "qualityAudit", "长篇体检");
    assert(
      structuredTasks.length === 1 && structuredTasks[0].severity === "block",
      "结构化体检任务会按优先级生成待办"
    );
    assert(
      structuredTasks[0].detail.includes("怎么改：删掉重复复核句") && structuredTasks[0].detail.includes("验证：重读本章"),
      "结构化体检任务会保留修改动作和验证方式"
    );
    state.revisionTasks = structuredTasks;
    const revisionPromptContext = revisionTasksContextForPrompt("当前未处理修改任务", 5);
    assert(
      revisionPromptContext.includes("第80章规则术语过密") && revisionPromptContext.includes("怎么改：删掉重复复核句"),
      "未处理修改任务会生成AI避坑上下文"
    );
    const revisionReviewInstruction = revisionTasksReviewInstructionForPrompt(5);
    assert(
      revisionReviewInstruction.includes("未处理修改任务复查") && revisionReviewInstruction.includes("已解决 / 仍存在 / 部分解决 / 不适用"),
      "未处理修改任务会生成复查要求"
    );
    state.revisionTasks = [
      normalizeRevisionTask({ id: "review-apply-1", title: "第80章规则术语过密", detail: "规则术语过密", severity: "block", status: "todo", sourceLabel: "长篇体检" }, 1),
      normalizeRevisionTask({ id: "review-apply-2", title: "章末压力不明显", detail: "章末没有真实危险", severity: "warn", status: "todo", sourceLabel: "长篇体检" }, 2),
      normalizeRevisionTask({ id: "review-apply-3", title: "旧进度字段不一致", detail: "currentChapter 过旧", severity: "warn", status: "todo", sourceLabel: "发布检查" }, 3)
    ].filter(Boolean);
    const reviewApplyResult = applyRevisionTaskReviewResult([
      "## 未处理修改任务复查",
      "1. 已解决：第80章规则术语过密已通过新增人物行动和身体代价解决。",
      "2. 仍存在：章末压力不明显，结尾仍是说明式待确认。",
      "3. 不适用：旧进度字段不一致已由正文库最新章节锚点替代。"
    ].join("\n"), { render: false, persistChanges: false, silent: true });
    assert(
      reviewApplyResult.done === 1 && reviewApplyResult.kept === 1 && reviewApplyResult.ignored === 1,
      "修改任务复查会回填已解决、仍存在和不适用"
    );
    const reviewStatusById = Object.fromEntries(state.revisionTasks.map((task) => [task.id, task.status]));
    assert(
      reviewStatusById["review-apply-1"] === "done"
        && reviewStatusById["review-apply-2"] === "todo"
        && reviewStatusById["review-apply-3"] === "ignored",
      "修改任务复查会更新任务状态"
    );
    state.revisionSelectedTaskIds = ["review-apply-2"];
    assert(
      selectedRevisionTasks().length === 1 && selectedRevisionTasks()[0].id === "review-apply-2",
      "修改任务清单支持勾选任务给AI处理"
    );
    assert(
      revisionTasksForAi(5).length === 1 && revisionTasksForAi(5)[0].id === "review-apply-2",
      "AI处理任务会优先使用已勾选待办"
    );
    assert(
      buildRevisionTaskPlanPrompt(selectedRevisionTasks()).includes("## 修改方案"),
      "AI处理任务可以生成修改方案提示词"
    );
    assert(
      buildRevisionTaskRewritePrompt(selectedRevisionTasks()).includes("禁止改变剧情走向"),
      "AI修正文提示词会保护原剧情"
    );
    assert(
      buildRevisionTaskReviewPrompt(selectedRevisionTasks(), "正文已改").includes("## 未处理修改任务复查"),
      "AI复查任务会输出可回填的复查板块"
    );
    state.revisionAiOutput = "## 未处理修改任务复查\n1. 已解决：章末压力已经落到真实危险。";
    assert(
      latestRevisionReviewSourceText().includes("章末压力已经落到真实危险"),
      "应用复查结论会读取AI处理任务输出"
    );
    assert(
      buildQuickDraftPromptForGeneration().includes("当前未处理修改任务"),
      "生成正文会带入未处理修改任务"
    );
    state.polishMode = "intensive";
    assert(
      buildPolishPrompt("# 第80章 复核\n\n正文", "").includes("当前未处理修改任务"),
      "正文润色会带入未处理修改任务"
    );
    assert(
      buildPrompt("release").includes("当前未处理修改任务"),
      "发布检查会带入未处理修改任务"
    );
    assert(
      buildQualityAuditPrompt().includes("未处理修改任务复查"),
      "长篇体检会复查未处理修改任务"
    );
    assert(
      buildPrompt("release").includes("未处理修改任务复查"),
      "发布检查会复查未处理修改任务"
    );
    state.revisionTasks = [
      normalizeRevisionTask({
        id: "save-gate-block-task",
        title: "第3章规则术语过密",
        detail: "规则术语过密，需要落成人物行动和身体代价。",
        severity: "block",
        status: "todo",
        chapterNumber: 3,
        sourceLabel: "长篇体检",
        reviewStatus: "todo"
      }, 1)
    ].filter(Boolean);
    const saveGateDraft = "# 第3章 安全屋钥匙\n\n林野把安全屋钥匙攥在掌心，门外的脚步声越来越近。红牌名单压在桌角，苏眠没有催他，只把备用灯推到地图边缘，让他看清那条被涂黑的路线。\n\n门锁响了一声。林野抬头，第一次没有解释流程，而是把钥匙递给苏眠，自己挡在门缝前。";
    const saveGateReport = draftQualityReport(saveGateDraft);
    assert(
      saveGateReport.items.some((item) => item.source === "revisionTaskGate" && item.message.includes("未处理高优先级修改任务")),
      "保存前质量门会提示高优先级修改任务未处理"
    );
    const saveGateRecord = chapterFulfillmentRecord({ number: 3, title: "安全屋钥匙" }, saveGateDraft, 0, 1, saveGateReport);
    assert(
      saveGateRecord.includes("未处理高优先级修改任务") && saveGateRecord.includes("第3章规则术语过密"),
      "本章兑现记录会写入未处理高优先级修改任务"
    );
    state.chapters = [
      { id: "selftest-fulfillment-risk-3", number: 3, title: "安全屋钥匙", status: "drafted", draft: saveGateDraft, notes: saveGateRecord }
    ];
    invalidateChapterCache();
    const fulfillmentTaskRisks = chapterFulfillmentRevisionTaskRisks();
    assert(
      fulfillmentTaskRisks.length === 1 && fulfillmentTaskRisks[0].text.includes("第3章规则术语过密"),
      "AI资料库会提取本章兑现记录里的高优先级任务"
    );
    const fulfillmentRiskSummary = outlineFulfillmentCheckSummary();
    assert(
      fulfillmentRiskSummary.status === "warn" && fulfillmentRiskSummary.text.includes("保存记录待复查"),
      "章节兑现卡会显示保存记录待复查"
    );
    const debtSummary = renderEvidenceDebtSummary();
    assert(
      debtSummary.total === 2
        && $("#evidenceDebtValue")?.textContent.includes("2项")
        && $("#evidenceDebtHint")?.textContent.includes("P0 1")
        && $("#evidenceDebtHint")?.textContent.includes("保存待复查 1"),
      "质量债务卡会汇总待办和保存记录待复查"
    );
    state.projectOutline = "核心卖点：安全屋与红牌名单。";
    state.quickAnalysis = "下一步：第4章必须处理安全屋钥匙代价。";
    state.quickBrief = "目标章节：第4-5章。第4章承接安全屋钥匙，第5章处理红牌名单。";
    state.quickBriefStartChapter = 4;
    state.quickBriefEndChapter = 5;
    setSelfTestQuickOutput("");
    updateWorkbenchFocus();
    const debtAction = resolveWorkbenchAction();
    assert(
      $("#focusDebtState")?.textContent.includes("2项")
        && $("#focusDebtHint")?.textContent.includes("保存待复查 1")
        && $(".quality-debt-focus-card")?.classList.contains("is-risk"),
      "首页会显示质量债务"
    );
    assert(
      debtAction.id === "draft" && debtAction.hint.includes("风险避坑") && debtAction.status.includes("建议先复查"),
      "生成正文按钮会提示质量债务"
    );
    state.revisionTasks[0].status = "done";
    const clearedSaveGateReport = draftQualityReport(saveGateDraft);
    assert(
      !clearedSaveGateReport.items.some((item) => item.source === "revisionTaskGate"),
      "已处理修改任务不会触发保存前质量门"
    );
    state.chapters = [
      { id: "selftest-old-progress-1", number: 1, title: "开端", status: "drafted", draft: "林野拿到第一枚钥匙，确认安全屋存在。", notes: "" },
      { id: "selftest-old-progress-87", number: 87, title: "断点", status: "drafted", draft: "第八十七章结尾停在门外枪声和新名单。", notes: "" }
    ];
    state.activeChapterId = "selftest-old-progress-1";
    state.currentChapter = 44;
    invalidateChapterCache();
    const progressSummary = summarizeProject();
    assert(
      progressSummary.includes("正文库最新章节：第87章") && progressSummary.includes("旧进度字段 currentChapter：第44章"),
      "项目摘要会以正文库最新章节作为续写锚点"
    );

    state.chapters = [
      { id: "selftest-drafted-1", number: 1, title: "开端", status: "drafted", draft: "林野拿到第一枚钥匙，确认安全屋存在。", notes: "" },
      { id: "selftest-drafted-2", number: 2, title: "门缝", status: "drafted", draft: "苏眠发现门缝里的红牌名单，危机开始逼近。", notes: "" },
      { id: "selftest-plan-3", number: 3, title: "待写计划", status: "planned", draft: "", notes: "写安全屋钥匙。" }
    ];
    invalidateChapterCache();
    assert(nextChapterNumber() === 3, "下一章优先使用最早空计划章");
    assert(writablePlannedChapterByNumber(3)?.id === "selftest-plan-3", "同编号空计划章可作为写回目标");

    state.outlineEvidenceUpdatedToChapter = 2;
    state.outlineEvidenceChapterHashes = {};
    state.outlineEvidenceDirtyChapterIds = [];
    const pending = pendingOutlineEvidenceScanChapters(draftedChaptersForEvidence());
    assert(pending.length === 2, "缺少 hash 的已写章节会进入 AI资料库待扫描队列", `待扫描 ${pending.length} 章`);

    return { ok: true, checks };
  } catch (error) {
    return {
      ok: false,
      error: error.message || String(error),
      checks: error.checks || checks
    };
  } finally {
    state = normalizeState(savedState);
    if (quickOutputField && savedQuickOutputValue !== null) quickOutputField.value = savedQuickOutputValue;
    invalidateChapterCache();
    usageEstimateCache = createUsageEstimateCache();
  }
}

window.SerialNovelControlSelfTest = {
  run: runFrontendBehaviorSelfTest
};

function installFrontendBehaviorSelfTestHook() {
  if (document.getElementById("frontendSelfTestBtn")) return;
  const button = document.createElement("button");
  button.id = "frontendSelfTestBtn";
  button.type = "button";
  button.textContent = "run frontend self test";
  button.setAttribute("aria-hidden", "true");
  Object.assign(button.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "1px",
    height: "1px",
    opacity: "0.01",
    overflow: "hidden",
    padding: "0",
    border: "0",
    zIndex: "0"
  });
  const result = document.createElement("pre");
  result.id = "frontendSelfTestResult";
  result.setAttribute("aria-hidden", "true");
  Object.assign(result.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "1px",
    height: "1px",
    opacity: "0.01",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: "-1"
  });
  button.addEventListener("click", () => {
    result.textContent = JSON.stringify(runFrontendBehaviorSelfTest());
  });
  document.documentElement.appendChild(button);
  document.documentElement.appendChild(result);
}

function runUiLayoutAudit() {
  const issues = [];
  const hiddenVisible = Array.from(document.querySelectorAll("[hidden]"))
    .map((node) => ({ node, rect: node.getBoundingClientRect(), display: getComputedStyle(node).display }))
    .filter((item) => item.display !== "none" && item.rect.width > 1 && item.rect.height > 1);
  if (hiddenVisible.length) {
    issues.push(`hidden 元素仍占空间：${hiddenVisible.map((item) => item.node.id || item.node.className || item.node.tagName).join(", ")}`);
  }
  const activePanel = document.querySelector(".panel.is-active");
  if (activePanel && activePanel.getBoundingClientRect().height > 2600) {
    issues.push(`当前页面高度偏高：${Math.round(activePanel.getBoundingClientRect().height)}px`);
  }
  const tallCards = Array.from(document.querySelectorAll("#quick .memory-card, #quick .workbench-readiness-card"))
    .filter((node) => node.getBoundingClientRect().height > 180);
  if (tallCards.length) {
    issues.push(`首页卡片高度异常：${tallCards.map((node) => node.id || node.className).join(", ")}`);
  }
  const versionNotice = $("#versionNotice");
  if (versionNotice?.open && versionNotice.getBoundingClientRect().height > 260) {
    issues.push(`版本通知展开高度偏高：${Math.round(versionNotice.getBoundingClientRect().height)}px`);
  }
  const generationSettings = document.querySelector(".generation-settings");
  if (generationSettings?.open && generationSettings.getBoundingClientRect().height > 900) {
    issues.push(`生成设置展开高度偏高：${Math.round(generationSettings.getBoundingClientRect().height)}px`);
  }
  if (issues.length) {
    console.warn("[Serial Novel UI Audit]", issues);
  } else {
    console.info("[Serial Novel UI Audit] layout ok");
  }
  return issues;
}

window.SerialNovelControlUiAudit = {
  run: runUiLayoutAudit
};

installFrontendBehaviorSelfTestHook();
hydrate();
updateApiHelp();
bindEvents();
updateChapterResponsiveControls();
setTimeout(runUiLayoutAudit, 500);
