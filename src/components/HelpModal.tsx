import { useState } from 'react';

type Section = 'params' | 'metrics' | 'viz' | 'theory';

const sections: { id: Section; label: string }[] = [
  { id: 'params', label: '파라미터' },
  { id: 'metrics', label: '분석 지표' },
  { id: 'viz', label: '시각화' },
  { id: 'theory', label: 'LBM 이론' },
];

function ParamsSection() {
  return (
    <div className="space-y-6">
      <HelpEntry
        title="협착 유형 (Stenosis Type)"
        description="혈관 내벽이 좁아지는 형태를 선택합니다. 동맥경화 진행 시 다양한 형태의 협착이 발생할 수 있으며, 각 형태에 따라 혈류 패턴이 크게 달라집니다."
        details={[
          { term: '정상', desc: '협착이 없는 일직선 채널. 대조군으로 사용하며, 이론적 Poiseuille 유동과 비교할 수 있습니다.' },
          { term: '균일 협착 (Symmetric)', desc: '혈관 위아래가 대칭적으로 좁아지는 형태. 가장 전형적인 동맥경화 모델입니다.' },
          { term: '편심 협착 (Eccentric)', desc: '한쪽 벽면만 돌출되는 비대칭 협착. 실제 동맥경화에서 더 흔하게 관찰되며, 비대칭 와류를 생성합니다.' },
          { term: '다중 협착 (Multi)', desc: '두 군데 이상에서 좁아진 경우. 협착 간 상호작용으로 복잡한 유동 패턴이 나타납니다.' },
          { term: '점진적 (Gradual)', desc: '긴 거리에 걸쳐 서서히 좁아지는 형태. 유동 박리가 적고 비교적 안정적인 흐름을 보입니다.' },
          { term: '급격한 (Sharp)', desc: '짧은 구간에서 갑자기 좁아지는 형태. 강한 유동 박리와 재순환 영역을 생성합니다.' },
        ]}
      />

      <HelpEntry
        title="협착률 (Stenosis Ratio)"
        description="혈관이 얼마나 좁아지는지를 나타냅니다. 0.1이면 약간 좁아지고, 0.8이면 채널 높이의 80%가 막히는 심한 협착입니다."
        formula="실효 채널 높이 = 원래 높이 × (1 - 협착률)"
        note="임상적으로 50% 이상 협착은 혈역학적으로 유의미한 협착(hemodynamically significant stenosis)으로 분류됩니다."
      />

      <HelpEntry
        title="완화 시간 τ (Relaxation Time)"
        description="LBM에서 유체의 점도를 결정하는 핵심 파라미터입니다. τ가 클수록 점도가 높아져 끈적한 유체, 작을수록 묽은 유체를 모사합니다."
        formula="동점도 ν = (τ − 0.5) / 3"
        details={[
          { term: 'τ = 0.55', desc: 'ν ≈ 0.017 → 낮은 점도, 높은 레이놀즈 수. 난류 경향이 나타나기 시작합니다.' },
          { term: 'τ = 0.60', desc: 'ν ≈ 0.033 → 기본값. 혈액의 대략적 특성에 해당합니다.' },
          { term: 'τ = 1.00', desc: 'ν ≈ 0.167 → 높은 점도. 층류 지배적인 완만한 흐름을 보입니다.' },
        ]}
        note="τ가 0.5에 가까울수록 수치적으로 불안정해집니다. 최소값은 0.55로 제한됩니다."
      />

      <HelpEntry
        title="유입 속도 (Inlet Velocity)"
        description="혈관 입구에서의 최대 유속입니다. 입구에는 포물선형 속도 프로파일(Poiseuille profile)이 적용됩니다. 벽면에서 0, 중심에서 최대값을 가집니다."
        formula="u(y) = u_inlet × 4 × y/H × (1 − y/H)"
        note="LBM에서는 격자 단위(lattice unit)를 사용합니다. 안정성을 위해 Mach 수(u/cs)가 0.3 이하여야 하며, 이는 u_inlet < 0.17에 해당합니다."
      />

      <HelpEntry
        title="시뮬레이션 스텝 (Max Steps)"
        description="시뮬레이션을 진행할 총 타임스텝 수입니다. 스텝이 많을수록 유동이 더 완전하게 발달(fully developed)하지만 계산 시간도 늘어납니다."
        details={[
          { term: '1000~2000', desc: '유동이 아직 발달 중. 초기 천이 과정을 관찰할 수 있습니다.' },
          { term: '3000~5000', desc: '대부분의 조건에서 정상상태(steady state)에 도달합니다.' },
          { term: '5000+', desc: '비정상 유동(unsteady flow)이나 와류 발진(vortex shedding) 관찰에 필요합니다.' },
        ]}
      />

      <HelpEntry
        title="격자 크기 (nx × ny)"
        description="시뮬레이션 격자의 해상도입니다. nx는 혈관 길이(가로), ny는 혈관 폭(세로)에 해당합니다."
        details={[
          { term: 'nx (가로)', desc: '클수록 혈관이 길어지고 협착 전후의 유동 발달을 더 잘 관찰할 수 있습니다.' },
          { term: 'ny (세로)', desc: '클수록 채널 단면 해상도가 높아져 속도 프로파일과 경계층을 더 정밀하게 포착합니다.' },
        ]}
        note="격자가 클수록 계산량이 격자 수(nx × ny)에 비례하여 증가합니다. 800×160이 속도와 정밀도의 좋은 균형점입니다."
      />
    </div>
  );
}

function MetricsSection() {
  return (
    <div className="space-y-6">
      <HelpEntry
        title="레이놀즈 수 (Reynolds Number, Re)"
        description="관성력과 점성력의 비를 나타내는 무차원수입니다. 유동의 성격(층류/난류)을 결정하는 가장 중요한 지표입니다."
        formula="Re = u × D / ν"
        details={[
          { term: 'Re < 1', desc: '크리핑 유동(Creeping flow). 점성 지배적, 대칭적 흐름.' },
          { term: 'Re < 500', desc: '층류(Laminar flow). 안정적이고 예측 가능한 유동 패턴.' },
          { term: '500 < Re < 2000', desc: '천이 영역(Transition). 협착 후방에서 불안정성이 나타나기 시작.' },
          { term: 'Re > 2000', desc: '난류(Turbulent). 불규칙한 와류와 혼합이 발생. (2D LBM으로는 정확한 모사가 어려움)' },
        ]}
        note="혈관 내 혈류의 Re는 보통 100~1000 범위입니다. 협착 부위에서는 국소 Re가 크게 증가합니다."
      />

      <HelpEntry
        title="유량 (Flow Rate)"
        description="채널 중간 지점(x = nx/2)에서의 단면 유량입니다. 단면을 통과하는 유속의 합으로 계산됩니다."
        formula="Q = Σ u_x(y)  (채널 단면의 모든 유체 셀에 대해)"
        note="정상 채널에서의 이론값은 Q = (2/3) × u_max × H 입니다. 협착이 있으면 연속방정식에 의해 협착 부위에서 유속이 증가하지만, 동일 단면의 유량은 보존됩니다."
      />

      <HelpEntry
        title="압력 강하 (Pressure Drop)"
        description="혈관 입구와 출구 사이의 압력 차이입니다. LBM에서 압력은 밀도에 비례합니다 (p = ρ/3). 협착이 심할수록 압력 강하가 커집니다."
        formula="ΔP = P_inlet − P_outlet = (ρ_inlet − ρ_outlet) / 3"
        note="임상적으로 협착 전후의 압력 강하는 FFR(Fractional Flow Reserve) 측정의 기초가 됩니다. FFR < 0.8이면 중재 시술이 필요한 것으로 판단합니다."
      />

      <HelpEntry
        title="벽면 전단 응력 (Wall Shear Stress, WSS)"
        description="혈관 벽면에 작용하는 마찰력입니다. 벽면 바로 옆 유체의 속도 기울기에 비례하며, 동맥경화 진행에 핵심적인 역할을 합니다."
        formula="WSS = ν × (∂u/∂y)|wall ≈ ν × u_첫번째_유체셀 / Δy"
        details={[
          { term: '높은 WSS', desc: '협착 목(throat) 부위. 혈관벽 손상과 혈소판 활성화를 유발할 수 있습니다.' },
          { term: '낮은 WSS', desc: '협착 후방 재순환 영역. 동맥경화 플라크가 성장하기 좋은 환경입니다.' },
          { term: '진동 WSS (Oscillatory WSS)', desc: '방향이 반복적으로 바뀌는 전단응력. 내피세포 기능 장애를 유발합니다.' },
        ]}
        note="생리학적으로 정상 WSS는 1~7 Pa 범위입니다. 시뮬레이션에서는 격자 단위로 표시됩니다."
      />

      <HelpEntry
        title="재순환 길이 (Recirculation Length)"
        description="협착 후방에서 역류(ux < 0)가 발생하는 영역의 길이입니다. 이 영역에서는 혈류가 정체되어 혈전 형성 위험이 높아집니다."
        details={[
          { term: '짧은 재순환', desc: '낮은 Re 또는 완만한 협착. 혈전 위험이 상대적으로 낮습니다.' },
          { term: '긴 재순환', desc: '높은 Re 또는 급격한 협착. 혈류 정체 시간이 길어져 혈전 형성 위험이 높습니다.' },
        ]}
        note="재순환 길이는 Re 수에 대략 선형적으로 비례합니다."
      />

      <HelpEntry
        title="Poiseuille 오차"
        description="시뮬레이션 결과와 해석적 이론값(Poiseuille 해) 간의 상대 오차입니다. 정상 채널에서 이 값이 작을수록 시뮬레이션의 정확도가 높다는 것을 의미합니다."
        formula="오차 = |Q_sim − Q_theory| / Q_theory × 100%"
        details={[
          { term: '< 2%', desc: '우수한 정확도. 시뮬레이션이 충분히 수렴했습니다.' },
          { term: '2~10%', desc: '양호. 스텝을 더 늘리거나 해상도를 높이면 개선됩니다.' },
          { term: '> 10%', desc: '유동이 아직 완전히 발달하지 않았거나 해상도가 부족할 수 있습니다.' },
        ]}
      />
    </div>
  );
}

function VizSection() {
  return (
    <div className="space-y-6">
      <HelpEntry
        title="속도장 (Velocity Magnitude)"
        description="각 격자점에서의 유속 크기를 컬러맵으로 표시합니다. 보라색(느림)에서 노란색(빠름)까지 Viridis 컬러맵을 사용합니다."
        details={[
          { term: '입구 영역', desc: '포물선 프로파일이 보입니다. 중심이 빠르고 벽면이 느립니다.' },
          { term: '협착 목', desc: '연속방정식(A₁v₁ = A₂v₂)에 의해 유속이 급격히 증가합니다. 밝은 노란색으로 표시됩니다.' },
          { term: '협착 후방', desc: '유동 박리와 재순환이 일어나는 영역입니다. 속도가 낮거나 역류합니다.' },
        ]}
      />

      <HelpEntry
        title="유선 (Streamlines)"
        description="유체 입자가 따라가는 경로를 선으로 그린 것입니다. 4차 Runge-Kutta 적분으로 추적합니다. 유선이 좁아지면 유속이 빨라지고, 유선이 닫힌 루프를 형성하면 재순환 영역입니다."
        details={[
          { term: '평행한 유선', desc: '안정적인 층류 흐름. 정상 혈관에서 주로 관찰됩니다.' },
          { term: '벌어지는 유선', desc: '확대 영역에서 유속이 감소하며 유선이 벌어집니다.' },
          { term: '와류/루프', desc: '재순환 영역. 혈전 형성 고위험 지역입니다.' },
        ]}
      />

      <HelpEntry
        title="와류도 (Vorticity)"
        description="유체의 회전 정도를 나타냅니다. 파란색은 시계방향 회전, 빨간색은 반시계방향 회전, 흰색은 회전이 없는 영역입니다."
        formula="ω = ∂u_y/∂x − ∂u_x/∂y"
        details={[
          { term: '벽면 부근', desc: '속도 기울기가 크므로 항상 높은 와류도를 보입니다.' },
          { term: '협착 후방', desc: '강한 와류 쌍(vortex pair)이 형성됩니다. 위쪽과 아래쪽이 반대 방향으로 회전합니다.' },
          { term: '채널 중심', desc: '완전 발달 유동에서는 와류도가 거의 0입니다.' },
        ]}
      />

      <HelpEntry
        title="WSS 그래프"
        description="혈관 길이 방향(x축)에 따른 벽면 전단 응력의 분포를 상벽(빨강)과 하벽(파랑)으로 나눠 보여줍니다."
        details={[
          { term: '피크 위치', desc: '협착 목 부분에서 WSS가 최대. 이 부위에서 혈관 내벽 손상 위험이 높습니다.' },
          { term: '골 위치', desc: '협착 후방에서 WSS가 최소. 이 부위에서 동맥경화 플라크가 추가 성장할 수 있습니다.' },
          { term: '상하벽 차이', desc: '편심 협착에서는 상하벽 WSS가 크게 달라져 비대칭 패턴을 보입니다.' },
        ]}
      />
    </div>
  );
}

function TheorySection() {
  return (
    <div className="space-y-6">
      <HelpEntry
        title="Lattice Boltzmann Method (LBM)"
        description="유체를 연속체가 아닌 격자 위의 입자 분포 함수로 모사하는 전산유체역학(CFD) 기법입니다. Navier-Stokes 방정식의 직접 풀이 대신, 입자 충돌과 이동의 반복으로 거시적 유동을 재현합니다."
        details={[
          { term: '장점', desc: '복잡한 경계 처리가 간단하고, 병렬화가 용이하며, 비압축성 유동에 잘 맞습니다.' },
          { term: '단점', desc: '저마하수(Ma < 0.3) 조건에서만 정확하고, 고레이놀즈수 난류의 정밀 모사에는 한계가 있습니다.' },
        ]}
      />

      <HelpEntry
        title="D2Q9 격자"
        description="본 시뮬레이터에서 사용하는 격자 모델입니다. 2차원(D2) 공간에서 9개(Q9) 방향의 이산 속도를 사용합니다."
        details={[
          { term: '0번 방향', desc: '정지 (가중치 4/9)' },
          { term: '1~4번', desc: '동서남북 4방향 (각 가중치 1/9)' },
          { term: '5~8번', desc: '대각선 4방향 (각 가중치 1/36)' },
        ]}
      />

      <HelpEntry
        title="BGK 충돌 연산자"
        description="분포 함수를 평형 분포(Maxwell-Boltzmann의 이산 근사)를 향해 단일 완화 시간(τ)으로 이완시킵니다."
        formula="f_i(x, t+1) = f_i(x, t) − (1/τ) × [f_i − f_i^eq]"
        note="τ가 작을수록(0.5에 가까울수록) 빠르게 평형에 도달하지만 수치적 불안정성이 증가합니다."
      />

      <HelpEntry
        title="경계 조건"
        description="시뮬레이션의 물리적 정확도를 결정하는 핵심 요소입니다."
        details={[
          { term: 'Bounce-back (벽면)', desc: '벽에 부딪힌 입자가 반대 방향으로 반사됩니다. No-slip 조건(벽면 유속 = 0)을 구현합니다.' },
          { term: 'Zou-He 입구', desc: '지정된 포물선 속도 프로파일을 유지하도록 미지의 분포 함수를 계산합니다.' },
          { term: 'Zou-He 출구', desc: '출구 밀도(압력)를 일정하게 유지하여 자연스러운 유출을 허용합니다.' },
        ]}
      />

      <HelpEntry
        title="Poiseuille 유동 (검증)"
        description="두 평행판 사이의 완전 발달 층류 유동의 해석해입니다. 시뮬레이션 정확도를 검증하는 벤치마크로 사용됩니다."
        formula="u(y) = u_max × 4y(H−y) / H², Q = (2/3) × u_max × H"
        note="정상 채널에서 충분한 스텝 후 시뮬레이션 유량이 이론값에 수렴하면 솔버가 올바르게 동작하는 것입니다."
      />
    </div>
  );
}

interface HelpEntryProps {
  title: string;
  description: string;
  formula?: string;
  details?: { term: string; desc: string }[];
  note?: string;
}

function HelpEntry({ title, description, formula, details, note }: HelpEntryProps) {
  return (
    <div className="border-b border-slate-700/30 pb-5 last:border-b-0">
      <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-300 leading-relaxed mb-3">{description}</p>
      {formula && (
        <div className="bg-slate-800/80 rounded-lg px-4 py-2.5 mb-3 font-mono text-sm text-blue-300 border border-slate-700/40">
          {formula}
        </div>
      )}
      {details && (
        <div className="space-y-2 mb-3">
          {details.map((d, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-blue-400 font-medium whitespace-nowrap min-w-[120px]">{d.term}</span>
              <span className="text-slate-400">{d.desc}</span>
            </div>
          ))}
        </div>
      )}
      {note && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-300/80">
          {note}
        </div>
      )}
    </div>
  );
}

export function HelpModal({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>('params');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-[900px] max-w-[92vw] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">도움말 — 파라미터 및 분석 지표 설명</h2>
            <p className="text-xs text-slate-500 mt-0.5">각 수치의 의미와 해석 방법을 설명합니다</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 px-6 pt-4 pb-2 shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeSection === s.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeSection === 'params' && <ParamsSection />}
          {activeSection === 'metrics' && <MetricsSection />}
          {activeSection === 'viz' && <VizSection />}
          {activeSection === 'theory' && <TheorySection />}
        </div>
      </div>
    </div>
  );
}
