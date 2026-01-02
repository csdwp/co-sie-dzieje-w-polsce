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
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  CartesianGrid,
  XAxis,
  Label,
  Pie,
  PieChart,
  Bar,
  BarChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
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
  const noPercentageGov = 100 - yesPercentageGov;

  const pieChartDataYes = [
    {
      name: 'Rządzący',
      value: yesPercentageGov,
      fill: chartConfig.government.color,
    },
    {
      name: 'Opozycja',
      value: 100 - yesPercentageGov,
      fill: chartConfig.opposition.color,
    },
  ];

  const pieChartDataNo = [
    {
      name: 'Rządzący',
      value: noPercentageGov,
      fill: chartConfig.government.color,
    },
    {
      name: 'Opozycja',
      value: 100 - noPercentageGov,
      fill: chartConfig.opposition.color,
    },
  ];

  const radarDataYes = combinedData.map(d => ({
    party: d.party,
    yes: d.yes,
  }));

  const radarDataNo = combinedData.map(d => ({
    party: d.party,
    no: d.no,
  }));

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
        className={`overflow-auto w-11/12 h-11/12 sm:w-4/5 sm:h-4/5 !max-w-[1000px] !max-h-[800px] rounded-3xl flex flex-col gap-6 border-none`}
      >
        <>
          <DialogHeader className="h-fit">
            <div className="flex items-start gap-2 mb-2">
              <DialogTitle className="text-2xl font-bold leading-tight text-left flex-1">
                {card?.title}
              </DialogTitle>
              {isAdmin && needsVerification && (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50 shrink-0 mt-1"
                >
                  ⚠️ Wymaga weryfikacji
                </Badge>
              )}
            </div>
            <DialogDescription>
              <InlineEditableContent
                content={card?.content ?? ''}
                field="content"
                actId={card?.id ?? ''}
                isAdmin={isAdmin}
              />
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="font-semibold text-xl">
              Odnośnik do pełnej treści aktu
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1 h-fit"></div>
            <a
              href={card?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-2 rounded-md text-sm font-medium 
                transition-colors focus-visible:outline-none focus-visible:ring-1 
                focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none 
                [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-transparent 
                underline justify-start w-fit max-w-full truncate relative mask-alpha mask-r-from-black mask-r-from-97% mask-r-to-transparent
                text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-100"
            >
              {card?.title}
            </a>
          </div>
          {card?.categories && card.categories.length > 0 && (
            <div className="flex flex-col space-y-1.5">
              <div className="font-semibold text-xl">Akt dotyczy</div>
              <div className="flex flex-wrap gap-1.5 mt-1 h-fit">
                {card.categories.map((category: string, index: number) => (
                  <span
                    key={index}
                    className="dark:bg-neutral-700/50 h-fit bg-neutral-600/10 px-2 py-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 rounded-full cursor-default"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex flex-col">
              <div className="font-semibold text-xl">Data ogłoszenia aktu</div>
              <div className="flex flex-wrap gap-1.5 mt-1 h-fit"></div>
              <span className="text-sm text-muted-foreground">
                {formattedDate}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-xl">
                Data wejścia aktu w życie
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1 h-fit"></div>
              <span className="text-sm text-muted-foreground">
                {formattedPromulgationDate}
              </span>
            </div>
          </div>
          {currentStatus !== 'Nieznany' && (
            <div className="flex flex-col space-y-1.5">
              <div className="font-semibold text-xl">Status aktu</div>
              <div className="flex flex-col gap-2 mt-2">
                {statusList.map(status => (
                  <div
                    key={status.name}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status.isActive
                          ? 'bg-red-500'
                          : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    />
                    <span
                      className={
                        status.isActive
                          ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }
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
              <div className="flex flex-col space-y-1.5">
                <div className="font-semibold tracking-tight text-xl">
                  Wynik głosowania
                </div>
                <div className="flex flex-col gap-3 mt-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800/40 border-2 border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                          percentYes > 50
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {percentYes > 50 ? '✓ PRZYJĘTO' : '✗ ODRZUCONO'}
                      </div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Margin: {Math.abs(totalYes - totalNo)} głosów
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Głosy za
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {totalYes}
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          ({percentYes.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Głosy przeciw
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {totalNo}
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
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
                className="w-full px-4 py-3 rounded-lg hover:underline text-neutral-900 dark:text-neutral-100 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {showDetailedAnalysis
                  ? 'Ukryj szczegółową analizę'
                  : 'Pokaż szczegółową analizę'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${
                    showDetailedAnalysis ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDetailedAnalysis && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <div className="font-semibold text-xl">
                      Wykresy głosów &quot;za&quot; i &quot;przeciw&quot;
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Wykres słupkowy przedstawia liczbę głosów za oraz przeciw
                      dla każdej partii. Wykres kołowy pokazuje procentowy
                      rozkład głosów za i przeciw.
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
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                          />
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
                            content={<ChartTooltipContent hideLabel />}
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
                                        className="fill-muted-foreground"
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
                    {/* Wykresy "za" */}
                    <div className="font-semibold text-xl">
                      Rozkład głosów &quot;za&quot; przyjęciem ustawy
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Wykres radarowy przedstawia rozkład głosów za z podziałem
                      na partie. Wykres kołowy przedstawia procentowy rozkład
                      głosów za wśród partii rządzących i opozycyjnych.
                    </div>
                    <div className="flex flex-col md:flex-row gap-5 w-full h-auto md:max-h-80">
                      <ChartContainer
                        config={combinedChartConfig}
                        className="md:w-1/2 aspect-square"
                      >
                        <RadarChart data={radarDataYes}>
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="party"
                            tickFormatter={truncatePartyName}
                          />
                          <Radar
                            name="Głosy za"
                            dataKey="yes"
                            fillOpacity={0.6}
                            fill="#f8d3d4"
                            stroke="#f8d3d4"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ChartContainer>
                      <ChartContainer
                        config={chartConfig}
                        className="md:w-1/2 aspect-square"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={pieChartDataYes}
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
                                        {yesPercentageGov.toFixed(1)}%
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-muted-foreground"
                                      >
                                        Rządzący
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
                    {/* Wykresy "przeciw" */}
                    <div className="font-semibold text-xl">
                      Rozkład głosów &quot;przeciw&quot; przyjęciem ustawy
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Wykres radarowy przedstawia rozkład głosów przeciw z
                      podziałem na partie. Wykres kołowy przedstawia procentowy
                      rozkład głosów przeciw wśród partii rządzących i
                      opozycyjnych.
                    </div>
                    <div className="flex flex-col md:flex-row gap-5 w-full h-auto md:max-h-80">
                      <ChartContainer
                        config={combinedChartConfig}
                        className="md:w-1/2 aspect-square"
                      >
                        <RadarChart data={radarDataNo}>
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="party"
                            tickFormatter={truncatePartyName}
                          />
                          <Radar
                            name="Głosy przeciw"
                            dataKey="no"
                            fill="#f8d3d4"
                            stroke="#f8d3d4"
                            fillOpacity={0.6}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ChartContainer>
                      <ChartContainer
                        config={chartConfig}
                        className="md:w-1/2 aspect-square"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={pieChartDataNo}
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
                                        {noPercentageGov.toFixed(1)}%
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-muted-foreground"
                                      >
                                        Rządzący
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
