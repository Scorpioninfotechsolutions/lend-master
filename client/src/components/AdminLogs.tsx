import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, User, DollarSign, Settings, CalendarIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, FileDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, 
  getDay, getDate, eachDayOfInterval, isSameDay, parse, addWeeks, addMonths, subWeeks, subMonths, subDays, getWeek, setWeek, subYears } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface Lender {
  _id: string;
  name: string;
  username: string;
  email: string;
  status: string;
  profilePicture?: string;
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  type: "auth" | "loan" | "payment" | "system";
  timestamp: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  relatedUser?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

// New components for different calendar views
interface DayViewProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const DayView = ({ selectedDate, onSelect }: DayViewProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  const goToPreviousDay = () => {
    setCurrentDate(prevDate => subDays(prevDate, 1));
  };
  
  const goToNextDay = () => {
    setCurrentDate(prevDate => addDays(prevDate, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  useEffect(() => {
    onSelect(currentDate);
  }, [currentDate, onSelect]);
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="text-lg font-medium">{format(currentDate, "EEEE")}</div>
          <div className="text-sm text-gray-500">{format(currentDate, "MMMM d, yyyy")}</div>
        </div>
        <Button variant="outline" size="sm" onClick={goToNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        className="w-full mt-2" 
        variant="outline" 
        onClick={goToToday}
      >
        Today
      </Button>
      <div 
        className="mt-4 py-6 border rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={() => onSelect(currentDate)}
      >
        <div className="text-center">
          <div className="text-3xl font-bold">{format(currentDate, "d")}</div>
          <div className="text-gray-500 mt-2">{format(currentDate, "EEEE")}</div>
        </div>
      </div>
    </div>
  );
};

interface WeekViewProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const WeekView = ({ selectedDate, onSelect }: WeekViewProps) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const startOfCurrentWeek = startOfWeek(currentDate);
  
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };
  
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };
  
  const daysOfWeek = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: endOfWeek(currentDate)
  });
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="text-sm font-medium">
            Week of {format(startOfCurrentWeek, "MMMM d, yyyy")}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        className="w-full mt-2" 
        variant="outline" 
        onClick={goToCurrentWeek}
      >
        Current Week
      </Button>
      <div className="mt-4 grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => (
          <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        {daysOfWeek.map((day, index) => (
          <div
            key={`day-${index}`}
            className={`text-center p-2 border rounded-md cursor-pointer hover:bg-gray-50 ${
              isSameDay(day, selectedDate) ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={() => onSelect(day)}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminLogs = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getFullImageUrl } = useAuth();

  // State for lenders
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // State for activity logs dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [viewType, setViewType] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [detailedLogView, setDetailedLogView] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Export related state
  const [isExporting, setIsExporting] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>(undefined);
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);

  // Fetch lenders on component mount
  useEffect(() => {
    fetchLenders();
  }, []);

  // Fetch activity logs when date or lender changes
  useEffect(() => {
    if (selectedLender && isDialogOpen) {
      fetchActivityLogs();
    }
  }, [selectedLender, selectedDate, viewType, isDialogOpen]);

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/logs/lenders');
      setLenders(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch lenders",
        variant: "destructive",
      });
      console.error('Error fetching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    if (!selectedLender) return;
    
    try {
      setLogsLoading(true);
      
      // Determine date range based on view type
      let startDate, endDate;
      
      if (viewType === "day") {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      } else if (viewType === "week") {
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
      } else {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }
      
      const response = await axios.get(`/logs/lender/${selectedLender._id}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      setActivityLogs(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
      console.error('Error fetching activity logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };
  
  const viewLenderLogs = (lender: Lender) => {
    setSelectedLender(lender);
    setSelectedDate(new Date());
    setViewType("day");
    setIsDialogOpen(true);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDetailedLogView(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return "bg-green-100 text-green-800";
      case 'inactive': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'auth': return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'loan': return <Activity className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'payment': return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'system': return <Settings className="h-4 w-4 sm:h-5 sm:w-5" />;
      default: return <Activity className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const formatLogDate = (timestamp: string) => {
    return format(new Date(timestamp), "PPpp"); // Format: Jan 1, 2021, 12:00 PM
  };

  // Function to handle exporting logs
  const exportLogs = async (startDate: Date, endDate: Date) => {
    if (!selectedLender) return;
    
    try {
      setIsExporting(true);
      
      const response = await axios.get(`/logs/export/${selectedLender._id}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format: 'csv'
        },
        responseType: 'blob'
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedLender.name}_logs_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t('common.success'),
        description: t('logs.exportSuccess'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('logs.exportError'),
        variant: "destructive",
      });
      console.error('Error exporting logs:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExport = (period: '3months' | '6months' | '1year' | 'custom') => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3months':
        startDate = subMonths(endDate, 3);
        exportLogs(startDate, endDate);
        break;
      case '6months':
        startDate = subMonths(endDate, 6);
        exportLogs(startDate, endDate);
        break;
      case '1year':
        startDate = subYears(endDate, 1);
        exportLogs(startDate, endDate);
        break;
      case 'custom':
        setExportDateRange(undefined);
        setShowCustomDateDialog(true);
        break;
      default:
        break;
    }
  };
  
  const handleCustomDateExport = () => {
    if (exportDateRange?.from && exportDateRange?.to) {
      exportLogs(exportDateRange.from, exportDateRange.to);
      setShowCustomDateDialog(false);
    } else {
      toast({
        title: t('common.error'),
        description: t('logs.selectBothDates'),
        variant: "destructive",
      });
    }
  };

  const handleImageError = (lenderId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [lenderId]: true
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{t('logs.activityLogs')}</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lenders.map((lender) => (
            <Card key={lender._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      {lender.profilePicture && !imageErrors[lender._id] ? (
                        <AvatarImage 
                          src={getFullImageUrl(lender.profilePicture)} 
                          onError={() => handleImageError(lender._id)}
                        />
                      ) : (
                        <AvatarFallback>{lender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{lender.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{lender.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(lender.status)}>{lender.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => viewLenderLogs(lender)} 
                  className="w-full mt-2"
                  variant="outline"
                >
                  {t('common.view')} {t('logs.activityLogs')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Logs Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>
                  {selectedLender?.name} - {t('logs.activityLogs')}
                </DialogTitle>
                <DialogDescription>
                  {t('logs.user')}: {selectedLender?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-6 flex flex-col lg:flex-row lg:space-x-6">
            {/* Calendar Section - Left side on larger screens */}
            <div className="lg:w-1/3 flex flex-col">
              {/* Tabs above the calendar */}
              <Tabs defaultValue="day" value={viewType} onValueChange={(value) => setViewType(value as "day" | "week" | "month")} className="mb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">{t('common.daily')}</TabsTrigger>
                  <TabsTrigger value="week">{t('common.weekly')}</TabsTrigger>
                  <TabsTrigger value="month">{t('common.monthly')}</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Calendar with dynamic view modes */}
              {viewType === "day" && (
                <DayView 
                  selectedDate={selectedDate} 
                  onSelect={handleDateSelect} 
                />
              )}
              
              {viewType === "week" && (
                <WeekView 
                  selectedDate={selectedDate} 
                  onSelect={handleDateSelect} 
                />
              )}
              
              {viewType === "month" && (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="border rounded-md mx-auto"
                  showOutsideDays={true}
                  fixedWeeks={true}
                />
              )}
            </div>
            
            {/* Activity Logs Section - Right side on larger screens */}
            <div className="mt-6 lg:mt-0 lg:w-2/3">
              {!detailedLogView ? (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">{t('logs.selectDateToViewLogs')}</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      {format(selectedDate, "PPP")} {t('logs.activityLogs')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailedLogView(false)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t('common.calendar')}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={isExporting}>
                            <FileDown className="mr-2 h-4 w-4" />
                            {isExporting ? t('logs.exporting') : t('common.export')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExport('3months')}>
                            {t('logs.last3Months')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('6months')}>
                            {t('logs.last6Months')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('1year')}>
                            {t('logs.lastYear')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExport('custom')}>
                            {t('logs.customDateRange')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {logsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">{t('common.loading')}</p>
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <p className="text-gray-500">{t('common.noData')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {activityLogs.map((log) => (
                        <Card key={log._id} className="hover:shadow-sm transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between p-3 cursor-pointer" onClick={() => toggleLogExpansion(log._id)}>
                            <div className="flex items-center space-x-2">
                              {getIcon(log.type)}
                              <CardTitle className="text-sm">{log.action}</CardTitle>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">
                                {format(new Date(log.timestamp), "h:mm a")}
                              </span>
                              {expandedLogs[log._id] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </CardHeader>
                          
                          {expandedLogs[log._id] && (
                            <CardContent className="px-3 py-2 text-sm border-t">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">{t('logs.user')}:</span> {log.user.name} ({log.user.role})
                                </div>
                                {log.relatedUser && (
                                  <div>
                                    <span className="font-medium">{t('logs.relatedUser')}:</span> {log.relatedUser.name} ({log.relatedUser.role})
                                  </div>
                                )}
                                <div className="col-span-2">
                                  <span className="font-medium">{t('logs.timestamp')}:</span> {formatLogDate(log.timestamp)}
                                </div>
                                {log.description && (
                                  <div className="col-span-2">
                                    <span className="font-medium">{t('logs.description')}:</span> {log.description}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomDateDialog} onOpenChange={setShowCustomDateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('logs.selectCustomDateRange')}</DialogTitle>
            <DialogDescription>
              {t('logs.selectStartAndEndDates')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Calendar
              mode="range"
              selected={exportDateRange}
              onSelect={setExportDateRange}
              className="border rounded-md"
              disabled={(date) => date > new Date()}
              numberOfMonths={1}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCustomDateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCustomDateExport} disabled={!exportDateRange?.from || !exportDateRange?.to}>
              {t('common.export')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogs;
