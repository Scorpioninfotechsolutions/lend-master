
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

interface SchedulePageProps {
  userRole?: "admin" | "lender" | "borrower";
}

const SchedulePage = ({ userRole = "lender" }: SchedulePageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  const scheduleItems = [
    {
      id: 1,
      type: "repayment",
      borrower: "John Doe",
      amount: 1250,
      time: "10:00 AM",
      date: "2024-01-15",
      status: "upcoming",
      loanId: "LN001"
    },
    {
      id: 2,
      type: "meeting",
      borrower: "Jane Smith",
      amount: null,
      time: "2:00 PM",
      date: "2024-01-16",
      status: "scheduled",
      purpose: "Loan Review"
    },
    {
      id: 3,
      type: "repayment",
      borrower: "Mike Johnson",
      amount: 2000,
      time: "11:30 AM",
      date: "2024-01-18",
      status: "overdue",
      loanId: "LN003"
    },
    {
      id: 4,
      type: "follow-up",
      borrower: "Sarah Wilson",
      amount: null,
      time: "3:30 PM",
      date: "2024-01-20",
      status: "pending",
      purpose: "Payment Reminder"
    }
  ];

  // Filter data based on user role - borrowers only see their own schedule
  const currentUserSchedule = scheduleItems.filter(item => item.borrower === "John Doe"); // Simulating current user
  const displaySchedule = userRole === "borrower" ? currentUserSchedule : scheduleItems;

  const todaySchedule = displaySchedule.filter(item => item.date === "2024-01-15");
  const upcomingSchedule = displaySchedule.filter(item => new Date(item.date) > new Date("2024-01-15"));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "repayment": return <DollarSign className="h-4 w-4" />;
      case "meeting": return <Users className="h-4 w-4" />;
      case "follow-up": return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === "borrower" ? "My Schedule" : "Schedule & Calendar"}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
          <Button 
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {formatDate(currentDate)}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {userRole === "borrower" ? "My Today's Schedule" : "Today's Schedule"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <p className="font-medium">
                          {userRole === "borrower" ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : item.borrower}
                        </p>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.amount && (
                        <p className="font-medium">₹{item.amount.toLocaleString()}</p>
                      )}
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {userRole === "borrower" ? "My Upcoming Events" : "Upcoming Events"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <p className="font-medium">
                        {userRole === "borrower" ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : item.borrower}
                      </p>
                      <p className="text-sm text-gray-500">{item.date} at {item.time}</p>
                      {item.purpose && (
                        <p className="text-xs text-gray-400">{item.purpose}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.amount && (
                      <p className="font-medium">₹{item.amount.toLocaleString()}</p>
                    )}
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {userRole === "borrower" ? "My Schedule Summary" : "Schedule Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {userRole === "borrower" ? "Today's Payments" : "Today's Repayments"}
                  </span>
                </div>
                <span className="font-bold text-blue-600">
                  ₹{todaySchedule.filter(i => i.type === 'repayment').reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString()}
                </span>
              </div>
              
              {userRole !== "borrower" && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Meetings This Week</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {displaySchedule.filter(i => i.type === 'meeting').length}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {userRole === "borrower" ? "My Overdue Items" : "Overdue Items"}
                  </span>
                </div>
                <span className="font-bold text-red-600">
                  {displaySchedule.filter(i => i.status === 'overdue').length}
                </span>
              </div>
              
              {userRole !== "borrower" && (
                <div className="pt-4">
                  <Button className="w-full">Add New Event</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid (simplified for this example) */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6; // Simplified calendar logic
              const hasEvent = displaySchedule.some(item => 
                new Date(item.date).getDate() === day && day > 0 && day <= 31
              );
              
              return (
                <div key={i} className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                  day > 0 && day <= 31 ? 'text-gray-900' : 'text-gray-300'
                } ${hasEvent ? 'bg-blue-50 border-blue-200' : ''}`}>
                  {day > 0 && day <= 31 ? day : ''}
                  {hasEvent && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;
