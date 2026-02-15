import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Download, FileSpreadsheet, FileJson, Calendar as CalendarIcon, TrendingUp, Users, DollarSign, PieChart } from "lucide-react";
import { format } from "date-fns";
import { fetchReportData } from "./reports/reportDataService";
import { useAuth } from "../AuthContext";
import { buildFinancialSummary } from "../components/reports/financialAggregator";
import { generateJSONReport } from "../components/reports/jsonReport";
import { generateExcelReport } from "../components/reports/excelReport";
import { generatePDFReport } from "../components/reports/pdfReport";
import { buildMemberSummary } from "../components/reports/memberAggregator";
import { buildLoanPortfolioSummary } from "../components/reports/loanAggregator";
import { buildTrustAnalyticsSummary } from "../components/reports/trustAggregator";



export function ReportsView() {
  const { shgId }  = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 10, 6),

    
  });

  const handleGenerateReport = async () => {
  // Basic validation
  if (!dateRange.from || !dateRange.to) {
    alert("Please select a valid date range");
    return;
  }

  if (!reportType || !exportFormat) {
    alert("Please select report type and export format");
    return;
  }

  try {
    setIsGenerating(true);

    // 1️⃣ Fetch data
    const data = await fetchReportData(
      shgId!,
      reportType,
      dateRange.from,
      dateRange.to
    );

    if (!data || !data.loans) {
      alert("No data available for selected range");
      return;
    }

    // 2️⃣ Build summary (financial only for now)
let summary: any = null;
let detailData: any[] = [];

switch (reportType) {
  case "financial":
    summary = buildFinancialSummary(data.loans);
    detailData = data.loans;
    break;

  case "members":
    summary = buildMemberSummary(data.members || []);
    detailData = data.members || [];
    break;

  case "loans":
    summary = buildLoanPortfolioSummary(data.loans);
    detailData = data.loans;
    break;

  case "analytics":
    summary = buildTrustAnalyticsSummary(data.trustScores || []);
    detailData = data.trustScores || [];
    break;

  default:
    alert("Unsupported report type");
    return;
}


    // 3️⃣ Export switch
switch (exportFormat) {
  case "pdf":
    generatePDFReport(summary, detailData);
    break;

  case "excel":
    generateExcelReport(summary, detailData);
    break;

  case "json":
    generateJSONReport({
      summary,
      data: detailData,
    });
    break;

  default:
    alert("Unsupported export format");
}

  } catch (error) {
    console.error("Report generation failed:", error);
    alert("Failed to generate report. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("financial");
  const [exportFormat, setExportFormat] = useState("pdf");



  const reportCategories = [
    {
      id: "financial",
      name: "Financial Summary",
      icon: DollarSign,
      description: "Complete financial overview including savings, loans, and repayments",
      metrics: ["Total Savings: ₹4.8L", "Active Loans: ₹5.5L", "Collection Rate: 96%"],
      color: "text-green-600 bg-green-50 border-green-200",
    },
    {
      id: "members",
      name: "Member Activity",
      icon: Users,
      description: "Member engagement, attendance, and participation metrics",
      metrics: ["Active Members: 40", "Avg Attendance: 92%", "New Members: 5"],
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "loans",
      name: "Loan Portfolio",
      icon: TrendingUp,
      description: "Detailed loan disbursement, repayment, and default analysis",
      metrics: ["Total Disbursed: ₹6.2L", "Repayment Rate: 96%", "Defaults: 1%"],
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "analytics",
      name: "Trust Analytics",
      icon: PieChart,
      description: "Trust score distribution and behavioral patterns",
      metrics: ["Avg Score: 87.5", "High Performers: 75%", "Trend: +2.3"],
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
  ];

  const recentReports = [
    {
      id: 1,
      name: "Monthly Financial Report - October 2025",
      type: "Financial",
      generatedDate: "2025-11-01",
      size: "2.4 MB",
      status: "Ready",
    },
    {
      id: 2,
      name: "Q3 2025 Member Activity Report",
      type: "Members",
      generatedDate: "2025-10-15",
      size: "1.8 MB",
      status: "Ready",
    },
    {
      id: 3,
      name: "Loan Portfolio Analysis - September 2025",
      type: "Loans",
      generatedDate: "2025-10-01",
      size: "3.1 MB",
      status: "Ready",
    },
    {
      id: 4,
      name: "Trust Score Analytics - 2025 H1",
      type: "Analytics",
      generatedDate: "2025-09-30",
      size: "1.5 MB",
      status: "Ready",
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      name: "Monthly Financial Summary",
      frequency: "Monthly",
      nextRun: "2025-12-01",
      recipients: "leader@shg.com",
    },
    {
      id: 2,
      name: "Weekly Member Activity",
      frequency: "Weekly",
      nextRun: "2025-11-10",
      recipients: "admin@shg.com",
    },
    {
      id: 3,
      name: "Quarterly Compliance Report",
      frequency: "Quarterly",
      nextRun: "2026-01-01",
      recipients: "compliance@shg.com",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and download comprehensive reports for your SHG</p>
      </div>

      {/* Report Generator */}
      <Card className="border-teal-100">
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>Select report type and parameters to generate a custom report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-4 gap-4">
              {reportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setReportType(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      reportType === category.id
                        ? `${category.color} border-current`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${reportType === category.id ? "opacity-100" : "text-gray-400"}`} />
                    <p className={`text-sm mb-1 ${reportType === category.id ? "" : "text-gray-700"}`}>
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{category.description}</p>
                    <div className="space-y-1">
                      {category.metrics.map((metric, idx) => (
                        <p key={idx} className="text-xs text-gray-600">{metric}</p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Date Range and Export Options */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF Document
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel Spreadsheet
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4" />
                        JSON Data
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="invisible">Action</Label>
                <Button
    className="w-full bg-teal-600 hover:bg-teal-700"
    onClick={handleGenerateReport}
    disabled={isGenerating}
  >
    <Download className="w-4 h-4 mr-2" />
    {isGenerating ? "Generating..." : "Generate Report"}
  </Button>

                {/* <Button
                  variant="outline"
                  onClick={async () => {
                    const data = await fetchReportData(
                      shgId!,
                      'financial',
                      dateRange.from!,
                      dateRange.to!
                    );
                    let summary ;
                    console.log("REPORT DATA:", data);
                     if (reportType === "financial") {
                      summary = buildFinancialSummary(data!.loans);
                      console.log("FINANCIAL SUMMARY:", summary);
                    }
                    const payload = {
                    summary: summary,
                    loans: data!.loans,
                  };

                  // JSON
                  //generateJSONReport(payload);

                  // Excel
                 //generateExcelReport(summary, data!.loans);

                  // PDF
                    generatePDFReport(summary, data!.loans);
                  }}
                >
                  Test Fetch
                </Button> */}
                

              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Recent and Scheduled Reports */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Recent Reports */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Generated Reports</CardTitle>
              <CardDescription>Access and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-gray-900">{report.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {report.type}
                          </Badge>
                          <span className="text-xs text-gray-500">Generated: {report.generatedDate}</span>
                          <span className="text-xs text-gray-500">{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700">{report.status}</Badge>
                      <Button size="sm" variant="outline" className="border-teal-500 text-teal-700 hover:bg-teal-50">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automated Report Schedule</CardTitle>
                  <CardDescription>Manage recurring report generation and delivery</CardDescription>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  + New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledReports.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-900">{schedule.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {schedule.frequency}
                          </Badge>
                          <span className="text-xs text-gray-500">Next: {schedule.nextRun}</span>
                          <span className="text-xs text-gray-500">To: {schedule.recipients}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        Disable
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Reports Generated</p>
            <p className="text-3xl text-gray-900 mt-1">247</p>
            <p className="text-xs text-gray-500 mt-1">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Active Schedules</p>
            <p className="text-3xl text-teal-700 mt-1">8</p>
            <p className="text-xs text-gray-500 mt-1">Automated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-3xl text-blue-700 mt-1">124 MB</p>
            <p className="text-xs text-gray-500 mt-1">of 1 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Compliance Score</p>
            <p className="text-3xl text-green-700 mt-1">98%</p>
            <p className="text-xs text-gray-500 mt-1">Excellent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
