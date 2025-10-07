"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Bitcoin,
  RefreshCw,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CryptoChart } from "@/components/crypto-chart";
import {
  type CryptoDataPoint,
  type CryptoId,
  type CryptoInfo,
  type TimeRange,
  type Currency,
  fetchCryptoData,
  CRYPTO_CURRENCIES,
} from "@/lib/data";
import { SolanaIcon } from "./icons/solana";
import { EthereumIcon } from "./icons/ethereum";
import { SquaraLogo } from "./icons/squara-logo";
import { ThemeToggle } from "./theme-toggle";
import { analyzeCrypto, type AnalyzeCryptoOutput } from "@/ai/flows/analyze-crypto-flow";
import { useToast } from "@/hooks/use-toast";

const ICONS: Record<CryptoId, React.ElementType> = {
  BTC: Bitcoin,
  ETH: EthereumIcon,
  SOL: SolanaIcon,
};

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "30m", label: "30 Min" },
  { value: "1h", label: "1 Hora" },
  { value: "24h", label: "24 Horas" },
  { value: "7d", label: "7 Dias" },
  { value: "30d", label: "1 Mês" },
  { value: "1y", label: "1 Ano" },
];

export default function CryptoDashboard() {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = React.useState<CryptoId>("BTC");
  const [selectedTimeRange, setSelectedTimeRange] = React.useState<TimeRange>("24h");
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency>("USD");
  const [cryptoInfo, setCryptoInfo] = React.useState<Record<CryptoId, CryptoInfo> | null>(null);
  const [chartData, setChartData] = React.useState<CryptoDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeCryptoOutput | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = React.useState(false);


  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCryptoData(selectedCrypto, selectedTimeRange, selectedCurrency);
      setCryptoInfo(data.info);
      setChartData(data.history);
    } catch (error) {
      console.error("Failed to fetch crypto data", error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar os dados das criptomoedas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCrypto, selectedTimeRange, selectedCurrency, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleAnalysis = async () => {
    if (!chartData.length) {
      toast({
        title: "Dados insuficientes",
        description: "Não há dados históricos para analisar.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeCrypto({
        cryptoName: CRYPTO_CURRENCIES.find(c => c.id === selectedCrypto)?.name || selectedCrypto,
        priceHistory: chartData,
      });
      setAnalysisResult(result);
      setIsAnalysisDialogOpen(true);
    } catch (error) {
      console.error("Failed to analyze crypto data", error);
      toast({
        title: "Erro na Análise",
        description: "A análise de IA falhou. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentCryptoInfo = cryptoInfo?.[selectedCrypto];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <SquaraLogo className="h-6 w-6" />
          <h1>Squara</h1>
        </div>
        <div className="ml-auto">
            <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          {CRYPTO_CURRENCIES.map((crypto) => {
            const Icon = ICONS[crypto.id];
            const info = cryptoInfo?.[crypto.id];
            const isSelected = selectedCrypto === crypto.id;

            return (
              <Card
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id)}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "border-primary ring-2 ring-primary"
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{crypto.name}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading || !info ? (
                    <>
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="mt-2 h-4 w-1/2" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat(selectedCurrency === "BRL" ? "pt-BR" : "en-US", {
                          style: "currency",
                          currency: selectedCurrency,
                        }).format(info[selectedCurrency.toLowerCase() as "usd" | "brl"])}
                      </div>
                      <p className={cn("text-xs text-muted-foreground flex items-center gap-1",
                          info[`${selectedCurrency.toLowerCase()}_24h_change`] >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {info[`${selectedCurrency.toLowerCase()}_24h_change`] >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {info[`${selectedCurrency.toLowerCase()}_24h_change`].toFixed(2)}% nas últimas 24h
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Tabs value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as Currency)}>
                  <TabsList>
                    <TabsTrigger value="USD">USD</TabsTrigger>
                    <TabsTrigger value="BRL">BRL</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tabs value={selectedTimeRange} onValueChange={(v) => setSelectedTimeRange(v as TimeRange)}>
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-full">
                    {TIME_RANGES.map((range) => (
                      <TabsTrigger key={range.value} value={range.value}>
                        {range.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleRefresh}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Atualizar
                  </span>
                </Button>
                 <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Analisar com IA
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <div className="flex h-[250px] w-full items-center justify-center sm:h-[400px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <CryptoChart data={chartData} currency={selectedCurrency} cryptoId={selectedCrypto} timeRange={selectedTimeRange} />
            )}
          </CardContent>
        </Card>
      </main>

       <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise de IA para {CRYPTO_CURRENCIES.find(c => c.id === selectedCrypto)?.name}
            </DialogTitle>
            <DialogDescription>
              Esta é uma análise gerada por inteligência artificial com base nos dados recentes. Não é um conselho financeiro.
            </DialogDescription>
          </DialogHeader>
          {analysisResult ? (
            <div className="space-y-4 py-4 text-sm">
              <div>
                  <h3 className="font-semibold text-muted-foreground">Sentimento do Mercado</h3>
                  <p>{analysisResult.sentiment}</p>
              </div>
               <div>
                  <h3 className="font-semibold text-muted-foreground">Previsão de Tendência</h3>
                  <p>{analysisResult.trend_prediction}</p>
              </div>
               <div>
                  <h3 className="font-semibold text-muted-foreground">Resumo da Análise</h3>
                  <p className="text-sm">{analysisResult.summary}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-24">
              <LoaderCircle className="animate-spin" />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsAnalysisDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
