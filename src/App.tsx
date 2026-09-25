import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle,
  ClipboardText,
  Copy,
  FileText,
  Fingerprint,
  GitBranch,
  Globe,
  List,
  LockKey,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from "@phosphor-icons/react";
import AnimatedContent from "./components/react-bits/AnimatedContent/AnimatedContent";
import GlareHover from "./components/react-bits/GlareHover";
import SpotlightCard from "./components/react-bits/SpotlightCard";

const WECHAT = "Ayachinene00721";
const navigation = [
  ["#delivery", "交付方式"],
  ["#method", "工作方式"],
  ["#boundary", "信任边界"],
];
const workflows = [
  {
    title: "归集材料",
    description: "把分散的工程文件，放回同一个项目。",
    body: "归档图纸、控制计划与质量记录，记录文件身份、版本和可读性，为后续核验建立输入基础。",
    icon: FileText,
    nodes: ["工程图纸", "控制计划", "质量记录"],
    result: "建立项目材料索引",
  },
  {
    title: "关联证据",
    description: "把同一个特征，在不同文件里对上。",
    body: "抽取零件、修订、特征、公差和工序信息，将事实与来源位置关联。证据不足的内容保留待确认状态。",
    icon: GitBranch,
    nodes: ["零件与修订", "特征与公差", "工序与检测"],
    result: "建立跨文档证据关系",
  },
  {
    title: "核对差异",
    description: "让缺项和冲突，带着来源浮出水面。",
    body: "检查材料完整性与跨文档一致性。处理阶段通过契约检查和持久化状态复算，未决问题进入复核。",
    icon: Fingerprint,
    nodes: ["缺失材料", "版本差异", "数据冲突"],
    result: "形成可定位的问题清单",
  },
  {
    title: "复核交付",
    description: "把工程判断，留给掌握证据的人。",
    body: "工程师基于原始证据确认、驳回或补充说明，保留复核记录，并导出审核报告与问题清单。",
    icon: ShieldCheck,
    nodes: ["人工确认", "复核留痕", "报告导出"],
    result: "输出可交接的审核记录",
  },
];
const deliveries = [
  {
    name: "本地化部署定制",
    label: "企业自有环境",
    icon: LockKey,
    title: "在自己的环境里，掌握审核全过程。",
    body: "将工作台、原始材料和审核记录部署在企业环境中，按内部流程配置模型接口与运行策略。",
    points: ["原始材料加密保存", "适配企业审核流程", "连接企业内网模型"],
    note: "完全离线运行，需要同时配置已部署在内网的模型服务。",
  },
  {
    name: "网页订阅",
    label: "浏览器访问",
    icon: Globe,
    title: "打开浏览器，进入企业的审核空间。",
    body: "通过订阅凭证访问在线工作台，按企业空间管理项目、材料和审核记录，减少本地环境维护。",
    points: ["订阅凭证访问", "租户项目隔离", "集中查看审核记录"],
    note: "服务开通、部署区域与数据保存方案，在演示后按实际需求确认。",
  },
  {
    name: "Web API 功能定制",
    label: "现有系统集成",
    icon: GitBranch,
    title: "让审核能力，接入已有业务流程。",
    body: "面向 PLM、QMS 或采购平台讨论接口集成，将材料核验与结果回传接入企业现有系统。",
    points: ["按接口授权", "对接现有业务系统", "按需定制集成"],
    note: "集成范围与具体系统适配，需结合企业接口和业务流程评估。",
  },
];
const questions = [
  [
    "可以完全离线使用吗？",
    "可以采用内网部署。完全离线运行时，模型服务也需要部署在企业内网；工作台本身不包含大模型权重。具体配置可在演示时结合现有环境确认。",
  ],
  [
    "发现的问题能定位到原件吗？",
    "审核记录支持关联文档、页码、坐标或单元格等来源位置，具体定位粒度取决于文件格式与解析结果。证据不完整或存在歧义的内容会保留给人工复核。",
  ],
  [
    "AI 会直接替代最终审批吗？",
    "雨兔用于材料核验、问题定位和复核辅助。工程师保留确认与判断，系统输出审核记录和报告，客户的正式批准仍按企业原有流程执行。",
  ],
  [
    "现在如何了解产品？",
    "本网站用于产品介绍。通过“预约演示”添加微信，说明材料类型、审核流程和部署需求，即可沟通适合的产品演示与交付方案。",
  ],
];

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatedContent
      className={className}
      distance={24}
      duration={0.65}
      delay={delay}
      ease="power3.out"
      threshold={0.08}
    >
      {children}
    </AnimatedContent>
  );
}
function Brand() {
  return (
    <>
      <span className="brand-logo-frame" aria-hidden="true">
        <img src="/brand-logo.webp" alt="" width="1280" height="1280" />
      </span>
      <span className="brand-text">
        <strong>
          雨兔<span> RainyRabit</span>
        </strong>
        <small>PPAP Evidence Agent</small>
      </span>
    </>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [workflow, setWorkflow] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("rainyrabit-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      /* Storage is optional. */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedDelivery = deliveries[delivery];
  const selectedWorkflow = workflows[workflow];
  const WorkflowIcon = selectedWorkflow.icon;
  const DeliveryIcon = selectedDelivery.icon;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("rainyrabit-theme", theme);
    } catch {
      /* Keep working without persistence. */
    }
  }, [theme]);
  useEffect(() => {
    const closeMenu = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !contactOpen) return;
    lastFocusRef.current = document.activeElement as HTMLElement;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      lastFocusRef.current?.focus();
    };
  }, [contactOpen]);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const openContact = () => {
    setMenuOpen(false);
    setCopyState("idle");
    setContactOpen(true);
  };
  const copyContact = async () => {
    let success = false;
    try {
      await navigator.clipboard.writeText(WECHAT);
      success = true;
    } catch {
      const input = document.createElement("textarea");
      input.value = WECHAT;
      input.setAttribute("aria-label", "微信号");
      input.style.cssText = "position:fixed;left:-9999px;top:0";
      const focused = document.activeElement as HTMLElement;
      (dialogRef.current?.open ? dialogRef.current : document.body).appendChild(
        input,
      );
      input.select();
      try {
        success = document.execCommand("copy");
      } catch {
        success = false;
      }
      input.remove();
      focused?.focus();
    }
    setCopyState(success ? "success" : "error");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyState("idle"), 4000);
  };
  const changeTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    count: number,
    change: (value: number) => void,
    prefix: string,
  ) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    change(next);
    document.getElementById(prefix + "-" + next)?.focus();
  };
  const primaryButton = () => (
    <GlareHover
      className="cta-glare"
      width="fit-content"
      height="auto"
      borderRadius="10px"
      background="var(--accent)"
      borderColor="transparent"
      glareColor="#ffffff"
      glareOpacity={0.22}
      glareSize={220}
      transitionDuration={550}
    >
      <button
        type="button"
        className="button button-primary"
        onClick={openContact}
      >
        预约演示
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
    </GlareHover>
  );

  return (
    <div className="site" id="top">
      <a className="skip-link" href="#main">
        跳转到主要内容
      </a>
      <header className="site-header">
        <div className="nav-shell container">
          <a
            className="brand"
            href="#top"
            aria-label="雨兔 RainyRabit PPAP Evidence Agent 首页"
            onClick={() => setMenuOpen(false)}
          >
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="主导航">
            {navigation.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="icon-button theme-toggle"
              aria-label={theme === "light" ? "切换深色模式" : "切换浅色模式"}
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <button className="nav-cta" type="button" onClick={openContact}>
              预约演示
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <button
              className="icon-button menu-toggle"
              type="button"
              aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={23} /> : <List size={23} />}
            </button>
          </div>
        </div>
        <nav
          className="mobile-navigation"
          id="mobile-navigation"
          aria-label="移动端导航"
          hidden={!menuOpen}
        >
          {navigation.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              为工程证据，建立清晰关联
            </p>
            <h1 id="hero-title">
              每一份 PPAP，<span>都有据可审。</span>
            </h1>
            <p className="hero-description">
              连接图纸、控制计划与质量记录，定位缺项和跨文档冲突，让审核回到工程证据。
            </p>
            <div className="hero-actions">
              {primaryButton()}
              <a className="button button-text" href="#method">
                了解工作方式
                <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="/hero-evidence.webp"
              srcSet="/hero-evidence-mobile.webp 768w, /hero-evidence.webp 1536w"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 50vw, 635px"
              alt="银色精密零件、工程图纸与蓝色透明层板组成的工业证据概念视觉"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </div>
        </section>
        <div
          className="material-band container"
          aria-label="关联的工程材料类型"
        >
          <p>
            散落在不同文档里的事实，
            <br />
            终于可以连在一起。
          </p>
          <div className="material-types">
            <span>工程图纸</span>
            <span>PFMEA</span>
            <span>控制计划</span>
            <span>MSA</span>
            <span>尺寸结果</span>
          </div>
        </div>
        <section
          className="capabilities section-space container"
          aria-labelledby="capability-title"
        >
          <Reveal>
            <div className="section-heading">
              <h2 id="capability-title">
                少一点翻找，
                <br />
                多一份有依据的判断。
              </h2>
              <p>
                从材料里的一个数值，到工程师的一次确认，
                <br className="desktop-break" />
                让审核的来龙去脉更清楚。
              </p>
            </div>
          </Reveal>
          <div className="capability-grid">
            <Reveal className="evidence-card-wrap">
              <SpotlightCard
                className="feature-card evidence-card"
                spotlightColor="rgba(32, 111, 235, 0.13)"
              >
                <div className="feature-top">
                  <span className="feature-icon">
                    <GitBranch size={25} />
                  </span>
                  <span className="feature-category">跨文档一致性</span>
                </div>
                <h3>不同文件，同一条证据链。</h3>
                <p>
                  关联零件、修订和关键特征，把分散的记录转化为可核对的关系。
                </p>
                <div
                  className="evidence-map"
                  aria-label="图纸特征关联控制计划与尺寸结果的关系示意"
                >
                  <div className="evidence-origin">
                    <FileText size={23} aria-hidden="true" />
                    <span>
                      图纸特征<small>身份 · 公差 · 修订</small>
                    </span>
                    <CheckCircle size={18} aria-hidden="true" />
                  </div>
                  <div className="map-connectors" aria-hidden="true">
                    <i />
                    <i />
                  </div>
                  <div className="evidence-targets">
                    <span>
                      <ClipboardText size={20} aria-hidden="true" />
                      控制计划
                    </span>
                    <span>
                      <Fingerprint size={20} aria-hidden="true" />
                      尺寸结果
                    </span>
                  </div>
                  <span className="diagram-caption">证据关系示意</span>
                </div>
              </SpotlightCard>
            </Reveal>
            <Reveal className="review-card-wrap" delay={0.08}>
              <SpotlightCard
                className="feature-card review-card"
                spotlightColor="rgba(32, 111, 235, 0.16)"
              >
                <div className="feature-top">
                  <span className="feature-icon">
                    <ShieldCheck size={25} />
                  </span>
                  <span className="feature-category">人工复核保留</span>
                </div>
                <h3>
                  问题看得见，
                  <br />
                  判断有来由。
                </h3>
                <p>
                  缺项、冲突和不确定信息进入复核。接受或驳回，都留下理由与记录。
                </p>
                <div className="review-visual" aria-hidden="true">
                  <div className="review-seal">
                    <ShieldCheck weight="duotone" />
                  </div>
                  <span>证据优先，人来判断</span>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
          <Reveal>
            <div className="evidence-note">
              <Fingerprint size={28} aria-hidden="true" />
              <div>
                <h3>每个结论，都有回到原件的路。</h3>
                <p>
                  文档、页码、单元格与坐标，让问题定位、复核和交接有据可循。
                </p>
              </div>
              <a href="#boundary" aria-label="了解证据追溯与信任边界">
                <ArrowUpRight size={26} />
              </a>
            </div>
          </Reveal>
        </section>
        <section
          className="method-section section-space"
          id="method"
          aria-labelledby="method-title"
        >
          <div className="container">
            <Reveal>
              <div className="section-heading">
                <h2 id="method-title">
                  先建立事实，
                  <br />
                  再开始判断。
                </h2>
                <p>从一份材料开始，走完一条可以复核的审核路径。</p>
              </div>
            </Reveal>
            <div className="workflow-layout">
              <div
                className="workflow-tabs"
                role="tablist"
                aria-label="审核流程"
                aria-orientation="vertical"
              >
                {workflows.map((step, index) => (
                  <button
                    key={step.title}
                    id={"workflow-tab-" + index}
                    role="tab"
                    type="button"
                    aria-selected={workflow === index}
                    aria-controls="workflow-panel"
                    tabIndex={workflow === index ? 0 : -1}
                    className={
                      "workflow-tab " + (workflow === index ? "active" : "")
                    }
                    onClick={() => setWorkflow(index)}
                    onKeyDown={(event) =>
                      changeTab(
                        event,
                        index,
                        workflows.length,
                        setWorkflow,
                        "workflow-tab",
                      )
                    }
                  >
                    <span className="step-number">0{index + 1}</span>
                    <span>
                      <strong>{step.title}</strong>
                      <small>{step.description}</small>
                    </span>
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div
                className="workflow-panel"
                id="workflow-panel"
                role="tabpanel"
                aria-labelledby={"workflow-tab-" + workflow}
                tabIndex={0}
              >
                <div className="workflow-panel-inner" key={workflow}>
                  <div className="process-heading">
                    <span className="process-icon">
                      <WorkflowIcon size={30} />
                    </span>
                    <span>工作流程示意</span>
                  </div>
                  <div className="process-nodes">
                    {selectedWorkflow.nodes.map((node) => (
                      <div key={node}>
                        <Check size={15} aria-hidden="true" />
                        {node}
                      </div>
                    ))}
                  </div>
                  <div className="process-line" aria-hidden="true" />
                  <div className="process-result">
                    <CheckCircle size={24} aria-hidden="true" />
                    <strong>{selectedWorkflow.result}</strong>
                  </div>
                  <p className="process-description">{selectedWorkflow.body}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="delivery-section section-space container"
          id="delivery"
          aria-labelledby="delivery-title"
        >
          <Reveal>
            <div className="section-heading centered">
              <p className="eyebrow">同一套证据思路，适配不同业务环境</p>
              <h2 id="delivery-title">按你的边界，选择交付方式。</h2>
              <p>从企业本地部署，到浏览器访问，再到现有系统集成。</p>
            </div>
          </Reveal>
          <div className="delivery-tabs" role="tablist" aria-label="交付方式">
            {deliveries.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  role="tab"
                  id={"delivery-tab-" + index}
                  key={item.name}
                  aria-selected={delivery === index}
                  aria-controls="delivery-panel"
                  tabIndex={delivery === index ? 0 : -1}
                  className={delivery === index ? "active" : ""}
                  onClick={() => setDelivery(index)}
                  onKeyDown={(event) =>
                    changeTab(
                      event,
                      index,
                      deliveries.length,
                      setDelivery,
                      "delivery-tab",
                    )
                  }
                >
                  <Icon size={20} aria-hidden="true" />
                  {item.name}
                </button>
              );
            })}
          </div>
          <div
            id="delivery-panel"
            className="delivery-panel"
            role="tabpanel"
            aria-labelledby={"delivery-tab-" + delivery}
            tabIndex={0}
          >
            <div className="delivery-copy">
              <span className="delivery-label">{selectedDelivery.label}</span>
              <h3>{selectedDelivery.title}</h3>
              <p>{selectedDelivery.body}</p>
              <button className="text-link" type="button" onClick={openContact}>
                预约演示
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="delivery-spec">
              <DeliveryIcon size={42} weight="duotone" aria-hidden="true" />
              <ul>
                {selectedDelivery.points.map((point) => (
                  <li key={point}>
                    <Check size={18} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <p>{selectedDelivery.note}</p>
            </div>
          </div>
        </section>
        <section
          className="boundary-section section-space container"
          id="boundary"
          aria-labelledby="boundary-title"
        >
          <Reveal className="boundary-heading">
            <span className="feature-icon">
              <LockKey size={26} />
            </span>
            <h2 id="boundary-title">
              把信任，
              <br />
              建立在清晰之上。
            </h2>
            <p>
              关于数据边界、证据追溯，
              <br />
              以及人和 AI 各自的角色。
            </p>
          </Reveal>
          <div className="faq-list">
            {questions.map(([title, body], index) => (
              <details key={title} open={index === 0 ? true : undefined}>
                <summary>
                  {title}
                  <span className="faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{body}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          className="contact-section container"
          id="contact"
          aria-labelledby="contact-title"
        >
          <Reveal>
            <div className="contact-content">
              <div className="contact-brand">
                <Brand />
              </div>
              <h2 id="contact-title">
                下一份 PPAP，
                <br />
                从清晰的证据开始。
              </h2>
              <p>
                聊聊你的材料、审核流程与部署环境。
                <br />
                我们一起找到合适的使用方式。
              </p>
              {primaryButton()}
              <span className="contact-wechat">微信：{WECHAT}</span>
            </div>
          </Reveal>
        </section>
      </main>
      <footer className="site-footer container">
        <div>
          <strong>雨兔 RainyRabit</strong>
          <span>PPAP 证据与一致性审核</span>
        </div>
        <p>证据优先，人工决策保留。</p>
        <a href="#top">
          回到顶部
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </footer>
      <dialog
        ref={dialogRef}
        className="contact-dialog"
        aria-labelledby="contact-dialog-title"
        aria-describedby="contact-dialog-description"
        onCancel={() => setContactOpen(false)}
        onClose={() => setContactOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              setContactOpen(false);
          }
        }}
      >
        <button
          className="icon-button dialog-close"
          type="button"
          aria-label="关闭预约窗口"
          onClick={() => setContactOpen(false)}
          autoFocus
        >
          <X size={23} />
        </button>
        <span className="feature-icon">
          <ClipboardText size={26} />
        </span>
        <h2 id="contact-dialog-title">聊聊你的 PPAP 审核。</h2>
        <p id="contact-dialog-description">
          添加微信，告诉我们材料类型、审核流程和部署需求，我们会与你沟通演示安排。
        </p>
        <div className="wechat-card">
          <span>联系微信</span>
          <strong>{WECHAT}</strong>
          <button
            className="button button-primary"
            type="button"
            onClick={copyContact}
          >
            {copyState === "success" ? <Check size={18} /> : <Copy size={18} />}
            {copyState === "success" ? "已复制微信号" : "复制微信号"}
          </button>
        </div>
        <p className="copy-feedback" role="status">
          {copyState === "error"
            ? "暂时无法自动复制，请长按或选中上方微信号手动复制。"
            : copyState === "success"
              ? "复制成功，打开微信搜索并添加。"
              : "此页面不收集或上传你的项目材料。"}
        </p>
      </dialog>
    </div>
  );
}
export default App;
