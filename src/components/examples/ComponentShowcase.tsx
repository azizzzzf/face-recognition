/**
 * ComponentShowcase.tsx
 * 
 * This file demonstrates how to use all the reusable UI components together.
 * It serves as both documentation and a testing ground for the components.
 * 
 * Usage in your pages:
 * import { ComponentShowcase } from '@/components/examples/ComponentShowcase';
 */

"use client";

import * as React from "react";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  TrendingUp, 
  Brain,
  Plus
} from "lucide-react";

// Import our custom components
import { DataTable, DataTableColumn } from "@/ui/data-table";
import { SearchFilter, SelectFilter, DateRangeFilter } from "@/components/SearchFilter";
import { ConfirmDialog, useConfirmDialog } from "@/components/ConfirmDialog";
import { StatCard, MetricCard, KPICard } from "@/components/StatCard";
import { ActionMenu, TableRowActionMenu } from "@/components/ActionMenu";
import { ExportButton } from "@/components/ExportButton";
import { 
  TableSkeleton, 
  StatCardSkeleton, 
  PageSkeleton 
} from "@/components/LoadingSkeleton";
import { 
  NoDataEmptyState, 
  NoResultsEmptyState,
  TableEmptyState 
} from "@/components/EmptyState";

// shadcn/ui components
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

// Mock data types
interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  accuracy: number;
  model: string;
  status: "present" | "late" | "absent";
}

// Mock data
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    timestamp: "2024-01-15T08:00:00Z",
    accuracy: 0.95,
    model: "arcface",
    status: "present",
  },
  {
    id: "2", 
    userId: "user2",
    userName: "Jane Smith",
    timestamp: "2024-01-15T08:30:00Z",
    accuracy: 0.88,
    model: "face-api",
    status: "late",
  },
  {
    id: "3",
    userId: "user3", 
    userName: "Mike Johnson",
    timestamp: "2024-01-15T09:00:00Z",
    accuracy: 0.92,
    model: "arcface",
    status: "present",
  },
];

export function ComponentShowcase() {
  // State management
  const [attendanceData, setAttendanceData] = React.useState<AttendanceRecord[]>(mockAttendanceData);
  const [loading] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<AttendanceRecord | null>(null);
  
  // Filter state
  const [searchValue, setSearchValue] = React.useState("");
  const [selectValues, setSelectValues] = React.useState<Record<string, string>>({
    model: "all",
    status: "all",
  });
  const [dateValues, setDateValues] = React.useState<Record<string, string>>({});
  
  // Dialog state
  const confirmDialog = useConfirmDialog();

  // DataTable columns configuration
  const columns: DataTableColumn<AttendanceRecord>[] = [
    {
      key: "userName",
      header: "Name",
      sortable: true,
      searchable: true,
    },
    {
      key: "timestamp",
      header: "Time", 
      sortable: true,
      cell: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "accuracy",
      header: "Accuracy",
      sortable: true,
      cell: (value) => (
        <Badge 
          variant={value >= 0.9 ? "default" : value >= 0.8 ? "secondary" : "destructive"}
        >
          {(value * 100).toFixed(1)}%
        </Badge>
      ),
    },
    {
      key: "model", 
      header: "Model",
      cell: (value) => (
        <Badge variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (value) => (
        <Badge 
          variant={
            value === "present" ? "default" : 
            value === "late" ? "secondary" : 
            "destructive"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (_, record) => (
        <TableRowActionMenu
          onView={() => setSelectedRecord(record)}
          onEdit={() => console.log("Edit:", record.id)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  // SearchFilter configuration
  const selectFilters: SelectFilter[] = [
    {
      key: "model",
      label: "Model",
      options: [
        { value: "arcface", label: "ArcFace", count: 2 },
        { value: "face-api", label: "Face-API", count: 1 },
      ],
    },
    {
      key: "status", 
      label: "Status",
      options: [
        { value: "present", label: "Present", count: 2 },
        { value: "late", label: "Late", count: 1 },
        { value: "absent", label: "Absent", count: 0 },
      ],
    },
  ];

  const dateFilters: DateRangeFilter[] = [
    {
      key: "attendance",
      label: "Attendance Date",
      type: "date-range",
    },
  ];

  // Event handlers
  const handleDelete = (record: AttendanceRecord) => {
    confirmDialog.openDialog({
      title: "Delete Attendance Record",
      description: `Are you sure you want to delete the attendance record for ${record.userName}?`,
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setAttendanceData(prev => prev.filter(item => item.id !== record.id));
      },
    });
  };

  const handleExport = async (data: Record<string, unknown>[], format: string) => {
    console.log(`Exporting ${data.length} records as ${format}`);
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleAddRecord = () => {
    console.log("Add new attendance record");
  };

  // const handleRefresh = async () => {
  //   setLoading(true);
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  //   setLoading(false);
  // };

  // Mock stats data
  const statsData = {
    todayCount: 45,
    weekCount: 312,
    averageAccuracy: 92.5,
    mostUsedModel: "ArcFace",
  };

  if (loading) {
    return <PageSkeleton showHeader showStats showTable />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Component Showcase</h1>
        <p className="text-muted-foreground">
          Demonstration of all reusable UI components working together.
        </p>
      </div>

      <Tabs defaultValue="full-example" className="space-y-6">
        <TabsList>
          <TabsTrigger value="full-example">Full Example</TabsTrigger>
          <TabsTrigger value="individual">Individual Components</TabsTrigger>
          <TabsTrigger value="loading-states">Loading States</TabsTrigger>
          <TabsTrigger value="empty-states">Empty States</TabsTrigger>
        </TabsList>

        <TabsContent value="full-example" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Attendance"
              value={statsData.todayCount}
              trend={{
                direction: "up",
                value: 12,
                label: "vs yesterday",
              }}
              icon={<Calendar className="h-5 w-5" />}
              variant="primary"
            />
            
            <StatCard
              title="This Week"
              value={statsData.weekCount}
              trend={{
                direction: "up",
                value: 8,
                label: "vs last week",
              }}
              icon={<Users className="h-5 w-5" />}
              variant="success"
            />
            
            <StatCard
              title="Average Accuracy"
              value={`${statsData.averageAccuracy}%`}
              trend={{
                direction: "neutral",
                value: 0,
                label: "stable",
              }}
              icon={<TrendingUp className="h-5 w-5" />}
              variant="info"
            />
            
            <StatCard
              title="Primary Model"
              value={statsData.mostUsedModel}
              subtitle="Most used recognition model"
              icon={<Brain className="h-5 w-5" />}
              variant="default"
            />
          </div>

          {/* Main Data Table with Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Attendance Records</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and view all attendance records
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <ExportButton
                    data={attendanceData}
                    formats={["csv", "json", "xlsx"]}
                    filename="attendance_records"
                    onExport={handleExport}
                    showCount
                  />
                  
                  <Button onClick={handleAddRecord} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Advanced Search and Filters */}
              <SearchFilter
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder="Search by name..."
                
                selectFilters={selectFilters}
                selectValues={selectValues}
                onSelectChange={(key, value) => 
                  setSelectValues(prev => ({ ...prev, [key]: value as string }))
                }
                
                dateFilters={dateFilters}
                dateValues={dateValues}
                onDateChange={(key, value) =>
                  setDateValues(prev => ({ ...prev, [key]: value }))
                }
                
                onExport={(filters) => console.log("Export with filters:", filters)}
                onClearAll={() => {
                  setSearchValue("");
                  setSelectValues({ model: "all", status: "all" });
                  setDateValues({});
                }}
              />
              
              {/* Data Table */}
              <DataTable
                data={attendanceData}
                columns={columns}
                searchable={false} // Using our custom SearchFilter instead
                loading={loading}
                emptyState={
                  <TableEmptyState
                    title="No Attendance Records"
                    description="No attendance records found. Start by adding your first record."
                    searchQuery={searchValue}
                    hasFilters={selectValues.model !== "all" || selectValues.status !== "all"}
                    onClearFilters={() => {
                      setSearchValue("");
                      setSelectValues({ model: "all", status: "all" });
                    }}
                    onAddItem={handleAddRecord}
                  />
                }
                pagination={{
                  enabled: true,
                  pageSize: 10,
                  showPageSizeSelector: true,
                }}
                onRowClick={(record) => console.log("Row clicked:", record)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* StatCard Examples */}
            <Card>
              <CardHeader>
                <CardTitle>StatCard Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricCard
                  metric={{
                    label: "Total Users",
                    value: 1240,
                    change: 15,
                    changeLabel: "vs last month",
                  }}
                  icon={<Users className="h-5 w-5" />}
                  variant="primary"
                />
                
                <KPICard
                  kpi={{
                    name: "Monthly Goal",
                    current: 85,
                    target: 100,
                    change: 12,
                    period: "vs last month",
                  }}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </CardContent>
            </Card>

            {/* ActionMenu Examples */}
            <Card>
              <CardHeader>
                <CardTitle>ActionMenu Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Sample Item</span>
                  <ActionMenu
                    items={[
                      {
                        key: "view",
                        label: "View Details",
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => console.log("View clicked"),
                      },
                      {
                        key: "edit",
                        label: "Edit Item", 
                        icon: <Edit className="h-4 w-4" />,
                        onClick: () => console.log("Edit clicked"),
                      },
                      {
                        key: "delete",
                        label: "Delete Item",
                        icon: <Trash2 className="h-4 w-4" />,
                        variant: "destructive",
                        confirm: {
                          title: "Delete Item",
                          description: "This action cannot be undone.",
                        },
                        onClick: () => console.log("Delete confirmed"),
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loading-states" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Loading Skeletons</h3>
            
            <StatCardSkeleton count={4} />
            
            <Card>
              <CardHeader>
                <CardTitle>Table Loading State</CardTitle>
              </CardHeader>
              <CardContent>
                <TableSkeleton rows={5} columns={4} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="empty-states" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Empty States</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>No Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoDataEmptyState
                    title="No Records Found"
                    description="Start by adding your first attendance record."
                    onAddItem={handleAddRecord}
                    addItemLabel="Add First Record"
                    compact
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>No Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoResultsEmptyState
                    title="No Results"
                    description="Try adjusting your search terms."
                    searchQuery="nonexistent user"
                    onClearFilters={() => console.log("Clear filters")}
                    compact
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedRecord && (
        <ConfirmDialog
          open={!!selectedRecord}
          onOpenChange={() => setSelectedRecord(null)}
          title="Attendance Record Details"
          confirmText="Close"
          hideCancel
          variant="info"
          onConfirm={() => setSelectedRecord(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm">{selectedRecord.userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <p className="text-sm">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Accuracy</label>
                <p className="text-sm">{(selectedRecord.accuracy * 100).toFixed(1)}%</p>
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <p className="text-sm">{selectedRecord.model}</p>
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.closeDialog}
        title={confirmDialog.config.title || "Confirm Action"}
        onConfirm={confirmDialog.config.onConfirm || (() => {})}
        {...confirmDialog.config}
      />
    </div>
  );
}