import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import {
  CartesianGrid,
  XAxis,
  Label,
  Pie,
  PieChart,
  Bar,
  BarChart,
} from 'recharts';
import { DialogModalProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin, isLowConfidence } from '@/lib/authHelpers';
import InlineEditableContent from './InlineEditableContent';
import { getActStatus, getAllStatusesWithActive } from '@/lib/statusHelpers';

const chartConfig = {
  percentageNo: {
    label: 'Procent głosów przeciw',
    color: '#f96d6e',
  },
  percentageYes: {
    label: 'Procent głosów za',
    color: '#f8d3d4',
  },
  government: {
    label: 'Rządzący',
    color: '#f8d3d4',
  },
  opposition: {
    label: 'Opozycja',
    color: '#f96d6e',
  },
} satisfies ChartConfig;

const truncatePartyName = (name: string): string => {
  if (name.length > 4) {
    return name.slice(0, 4) + '...';
  }
  return name;
};

// Custom tooltip to show vote numbers with full party names
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: {
    party: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/[0.03] dark:bg-white/[0.06] backdrop-blur-xl text-neutral-100 px-4 py-3 rounded-xl shadow-2xl border border-white/[0.06]">
        <p className="font-medium mb-1.5 text-neutral-200">
          {payload[0].payload.party}
        </p>
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
          <p
            key={index}
            className="text-sm text-neutral-400"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value} głosów
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart tooltip to show actual vote numbers
interface PieTooltipPayloadEntry {
  name: string;
  value: number;
  payload: {
    fill: string;
  };
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayloadEntry[];
  totalYes: number;
  totalNo: number;
}

const CustomPieTooltip = ({
  active,
  payload,
  totalYes,
  totalNo,
}: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const isYes = entry.name === 'Za';
    const votes = isYes ? totalYes : totalNo;
    return (
      <div className="bg-white/[0.03] dark:bg-white/[0.06] backdrop-blur-xl text-neutral-100 px-4 py-3 rounded-xl shadow-2xl border border-white/[0.06]">
        <p className="font-medium mb-1.5 text-neutral-200">{entry.name}</p>
        <p
          className="text-sm text-neutral-400"
          style={{ color: entry.payload.fill }}
        >
          {votes} głosów ({entry.value.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

const DialogModal = ({ isOpen, onClose, card }: DialogModalProps) => {
  const votes = card?.votes;
  const parties = votes?.parties;
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Get status information
  const currentStatus = getActStatus(
    card?.announcement_date,
    card?.promulgation
  );
  const statusList = getAllStatusesWithActive(currentStatus);

  const combinedData = parties
    ? Object.keys(parties).map(party => ({
        party: party,
        yes: parties[party].votes.yes,
        no: parties[party].votes.no,
      }))
    : [];

  const combinedChartConfig = {
    yes: {
      label: 'Liczba głosów za',
      color: chartConfig.percentageYes.color,
    },
    no: {
      label: 'Liczba głosów przeciw',
      color: chartConfig.percentageNo.color,
    },
  };

  const totalYes = combinedData.reduce((acc, curr) => acc + curr.yes, 0);
  const totalNo = combinedData.reduce((acc, curr) => acc + curr.no, 0);
  const totalVotes = totalYes + totalNo;
  const percentYes = totalVotes > 0 ? (totalYes / totalVotes) * 100 : 0;
  const percentNo = 100 - percentYes;

  const pieYesNoData = [
    {
      name: 'Za',
      value: percentYes,
      fill: combinedChartConfig.yes.color,
    },
    {
      name: 'Przeciw',
      value: percentNo,
      fill: combinedChartConfig.no.color,
    },
  ];

  const yesPercentageGov =
    votes?.votesSupportByGroup?.government.yesPercentage ?? 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Brak daty';
    if (dateString == undefined) return 'Brak daty';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Brak daty'
      : date.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
  };

  const formattedDate = formatDate(card?.announcement_date ?? '');
  const formattedPromulgationDate = formatDate(card?.promulgation ?? '');

  const isAdmin = useIsAdmin();
  const needsVerification = isLowConfidence(card?.confidence_score);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-testid="act-modal"
        className={`overflow-auto w-11/12 h-11/12 sm:w-4/5 sm:h-4/5 !max-w-[1000px] !max-h-[800px] !rounded-2xl flex flex-col gap-8 border-none`}
      >
        <>
          <DialogHeader className="h-fit">
            <div className="flex items-start gap-3 mb-3">
              <DialogTitle className="text-2xl font-medium tracking-tight leading-tight text-left flex-1">
                {card?.title}
              </DialogTitle>
              {isAdmin && needsVerification && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0 mt-1"
                >
                  Wymaga weryfikacji
                </Badge>
              )}
            </div>
            <DialogDescription className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
              <InlineEditableContent
                content={card?.content ?? ''}
                field="content"
                actId={card?.id ?? ''}
                isAdmin={isAdmin}
              />
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
              Odnośnik do pełnej treści aktu
            </div>
            <a
              href={card?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-2 text-sm font-normal
                transition-all duration-300 focus-visible:outline-none
                justify-start w-fit max-w-full truncate relative mask-alpha mask-r-from-black mask-r-from-97% mask-r-to-transparent
                text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 hover:dark:text-neutral-200 underline underline-offset-2"
            >
              {card?.title}
            </a>
          </div>
          {card?.categories && card.categories.length > 0 && (
            <div className="flex flex-col space-y-3">
              <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                Akt dotyczy
              </div>
              <div className="flex flex-wrap gap-2">
                {card.categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="bg-white/[0.04] dark:bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-600 dark:text-neutral-300 rounded-full cursor-default"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="flex flex-col space-y-1.5">
              <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                Data ogłoszenia
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {formattedDate}
              </span>
            </div>
            <div className="flex flex-col space-y-1.5">
              <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                Data wejścia w życie
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {formattedPromulgationDate}
              </span>
            </div>
          </div>
          {currentStatus !== 'Nieznany' && (
            <div className="flex flex-col space-y-4">
              <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                Status aktu
              </div>
              <div className="flex flex-col gap-3">
                {statusList.map(status => (
                  <div
                    key={status.name}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        status.isActive
                          ? 'bg-red-500/80'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                    <span
                      className={`transition-colors duration-300 ${
                        status.isActive
                          ? 'font-medium text-neutral-800 dark:text-neutral-100'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {status.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {votes?.government && totalVotes > 0 && (
            <>
              {/* Vote Summary Box */}
              <div className="flex flex-col space-y-4">
                <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                  Wynik głosowania
                </div>
                <div className="flex flex-col gap-4 p-5 rounded-xl bg-white/[0.02] dark:bg-white/[0.03] premium-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs tracking-wide ${
                          percentYes > 50
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {percentYes > 50 ? 'PRZYJĘTO' : 'ODRZUCONO'}
                      </div>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Różnica: {Math.abs(totalYes - totalNo)} głosów
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                        Głosy za
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-medium text-neutral-800 dark:text-neutral-100">
                          {totalYes}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          ({percentYes.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                        Głosy przeciw
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-medium text-neutral-800 dark:text-neutral-100">
                          {totalNo}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          ({percentNo.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Button for Detailed Analysis */}
              <button
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] text-neutral-600 dark:text-neutral-300 border-none outline-none text-sm font-medium tracking-wide transition-all duration-500 flex items-center justify-center gap-2"
              >
                {showDetailedAnalysis
                  ? 'Ukryj szczegółową analizę'
                  : 'Pokaż szczegółową analizę'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-500 ${
                    showDetailedAnalysis ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDetailedAnalysis && (
                <>
                  {/* Government vs Opposition Comparison */}
                  <div className="flex flex-col space-y-4">
                    <div>
                      <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
                        Koalicja vs Opozycja
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Jak głosowały partie rządzące i opozycyjne
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {/* Government bar */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-200">
                            Koalicja rządząca
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                            {votes?.votesSupportByGroup?.government?.yesVotes ||
                              0}{' '}
                            głosów za ({yesPercentageGov.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/[0.04] dark:bg-white/[0.06] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${yesPercentageGov}%`,
                              backgroundColor: 'rgba(248, 211, 212, 0.8)',
                            }}
                          />
                        </div>
                      </div>
                      {/* Opposition bar */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-200">
                            Opozycja
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                            {votes?.votesSupportByGroup?.opposition?.yesVotes ||
                              0}{' '}
                            głosów za ({(100 - yesPercentageGov).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/[0.04] dark:bg-white/[0.06] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${100 - yesPercentageGov}%`,
                              backgroundColor: 'rgba(249, 109, 110, 0.7)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participation Rate */}
                  {votes?.summary && (
                    <div className="flex flex-col space-y-4">
                      <div>
                        <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
                          Frekwencja głosowania
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          Liczba posłów, którzy wzięli udział w głosowaniu
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] dark:bg-white/[0.03] premium-border">
                          <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                            Głosowało
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-neutral-800 dark:text-neutral-100">
                              {votes.summary.yes + votes.summary.no}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              /{votes.summary.total}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] dark:bg-white/[0.03] premium-border">
                          <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                            Wstrzymało się
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-neutral-800 dark:text-neutral-100">
                              {votes.summary.abstain}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {(
                                (votes.summary.abstain / votes.summary.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] dark:bg-white/[0.03] premium-border">
                          <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                            Nieobecnych
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-neutral-800 dark:text-neutral-100">
                              {votes.summary.absent}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {(
                                (votes.summary.absent / votes.summary.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.02] dark:bg-white/[0.03] premium-border">
                          <span className="text-[10px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                            Frekwencja
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-medium text-neutral-800 dark:text-neutral-100">
                              {(
                                ((votes.summary.yes + votes.summary.no) /
                                  votes.summary.total) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-4">
                    <div>
                      <div className="text-[11px] tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
                        Szczegółowy rozkład głosów
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Wykres słupkowy pokazuje liczbę głosów za oraz przeciw
                        dla każdej partii. Wykres kołowy przedstawia ogólny
                        rozkład wszystkich głosów.
                      </div>
                    </div>
                    {/* Wykresy "za" i "przeciw" */}
                    <div className="flex flex-col md:flex-row gap-5 w-full h-auto md:max-h-80">
                      <ChartContainer
                        config={combinedChartConfig}
                        className="md:w-1/2"
                      >
                        <BarChart
                          accessibilityLayer
                          data={combinedData}
                          margin={{
                            top: 20,
                            right: 12,
                            left: 12,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="party"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={truncatePartyName}
                          />
                          <ChartTooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="yes"
                            fill="var(--color-yes)"
                            radius={4}
                            minPointSize={2}
                          />
                          <Bar
                            dataKey="no"
                            fill="var(--color-no)"
                            radius={4}
                            minPointSize={2}
                          />
                        </BarChart>
                      </ChartContainer>
                      <ChartContainer
                        config={chartConfig}
                        className="md:w-1/2 aspect-square"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={
                              <CustomPieTooltip
                                totalYes={totalYes}
                                totalNo={totalNo}
                              />
                            }
                          />
                          <Pie
                            data={pieYesNoData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                          >
                            <Label
                              content={({ viewBox }) => {
                                if (
                                  viewBox &&
                                  'cx' in viewBox &&
                                  'cy' in viewBox
                                ) {
                                  return (
                                    <text
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="fill-foreground text-3xl font-bold"
                                      >
                                        {percentYes.toFixed(1)}%
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-muted-foreground text-sm"
                                      >
                                        Za
                                      </tspan>
                                    </text>
                                  );
                                }
                              }}
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      </DialogContent>
    </Dialog>
  );
};

export default DialogModal;
