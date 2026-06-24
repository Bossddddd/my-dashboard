import mermaid from 'mermaid';

const code = `
    graph TD
        classDef branch fill:#e3f2fd,stroke:#1976d2,stroke-width:6px,color:#000
        classDef step01 fill:#e8f5e9,stroke:#2e7d32,stroke-width:6px,color:#000
        classDef step02 fill:#fff3e0,stroke:#f57c00,stroke-width:6px,color:#000
        classDef step03 fill:#fce4ec,stroke:#c2185b,stroke-width:6px,color:#000
        classDef deploy fill:#ede7f6,stroke:#5e35b1,stroke-width:6px,color:#000
        classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:6px,color:#000
        classDef phase fill:#333,stroke:#000,stroke-width:0px,color:#fff,font-weight:bold
        classDef startNode fill:#fff8e1,stroke:#fbc02d,stroke-width:6px,color:#000
        classDef sentry fill:#f3e5f5,stroke:#7b1fa2,stroke-width:6px,color:#000
        classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:6px,color:#000
        
        START(["🚀 Start Develop"]):::startNode
        PUSH(["📤 Push to Dev"]):::branch
        PhaseDev["DEVELOPMENT PHASE (dev branch)"]:::phase
        Q1["01: Code Quality, Security & Build<br/>(Lint, Type Check, Unit Tests, Next.js Build)"]:::step01
        D1["02: Database Migration<br/>(Drizzle Push to Test DB)"]:::step02
        E1["03: E2E Tests<br/>(Playwright UI Tests)"]:::step03
        V1(["Vercel Preview Deployment<br/>(Staging Environment)"]):::deploy
        SEN1(["👁️ Sentry Error Tracking<br/>(Monitor Staging)"]):::sentry
        CHK1{"Pass E2E and Sentry?"}:::decision
        F1(["Fix Code & Push Again"]):::error

        START ==> PUSH
        PUSH ==> PhaseDev
        PhaseDev --> Q1
        Q1 -->|Pass| D1
        D1 -->|Pass| E1
        E1 -->|Pass| V1
        V1 -.->|Continuous Monitoring| SEN1
        
        Q1 -.->|Fail| F1
        D1 -.->|Fail| F1
        E1 -.->|Fail| F1
        F1 -.-> PUSH

        PhaseProd["PRODUCTION PHASE (main branch)"]:::phase
        M1(["Merge 'dev' into 'main'<br/>(Create Pull Request / Merge)"]):::branch
        Q2["01: Code Quality, Security & Build<br/>(Lint, Type Check, Unit Tests, Next.js Build)"]:::step01
        D2["02: Database Migration<br/>(Drizzle Push to Test DB)"]:::step02
        E2["03: Read-Only Tests<br/>(Production Sanity Check / Read-Only)"]:::step03
        V2(["Vercel Production Deployment<br/>(Live Environment)"]):::deploy
        SEN2(["👁️ Sentry Error Tracking<br/>(Monitor Production)"]):::sentry
        F2(["Revert Merge & Fix Code"]):::error
        
        V1 ==>|Ready for Review| CHK1
        CHK1 ==>|Yes: Promote| PhaseProd
        CHK1 -.->|No: Fail| F1
        
        PhaseProd --> M1
        M1 --> Q2
        Q2 -->|Pass| D2
        D2 -->|Pass| E2
        E2 -->|Pass| V2
        V2 -.->|Continuous Monitoring| SEN2
        
        Q2 -.->|Fail| F2
        D2 -.->|Fail| F2
        E2 -.->|Fail| F2
        F2 -.-> F1
`;

console.log("TESTING PARSE...");
(async () => {
try {
  await mermaid.parse(code);
  console.log("PARSE SUCCESS!");
} catch (e) {
  console.log("PARSE FAILED:", e.message);
}
})();
