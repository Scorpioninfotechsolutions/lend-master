import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShieldAlert, Upload, Database } from "lucide-react";
import api from "../utils/api";
import Layout from "@/components/Layout";
import { useAuth } from "../contexts/AuthContext";

const AdminTools = () => {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleMigration = async () => {
    setIsMigrating(true);
    
    try {
      const response = await api.post('/admin/migrate-card-details');
      
      if (response.data.success) {
        toast({
          title: "Migration Successful",
          description: response.data.message
        });
      } else {
        toast({
          title: "Migration Failed",
          description: response.data.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.response?.data?.message || error.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a JSON file to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('cardDetailsFile', selectedFile);
      
      const response = await api.post('/admin/import-card-details', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Import Successful",
          description: response.data.message
        });
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('card-details-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        toast({
          title: "Import Failed",
          description: response.data.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.response?.data?.message || error.message || "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout userRole="admin" onNavigate={() => {}} onLogout={logout}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Migrate Card Details
              </CardTitle>
              <CardDescription>
                Migrate existing card details from user records to the new encrypted storage system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This tool will find all borrowers with card details stored directly in their user records
                and move them to the new secure storage system. This is useful if you have legacy data
                that needs to be migrated.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Warning: This is a one-time operation</span>
                </div>
                <p className="mt-1 text-xs">
                  This operation should only be run once during the migration to the new system.
                  Running it multiple times is safe but unnecessary.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleMigration} disabled={isMigrating}>
                {isMigrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  "Migrate Card Details"
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Import Card Details
              </CardTitle>
              <CardDescription>
                Import card details from a JSON file and store them securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use this tool to import card details from a JSON file. The file should contain an array of
                objects with userId, cvv, and atmPin fields.
              </p>
              
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="card-details-file">Upload JSON File</Label>
                  <Input 
                    id="card-details-file" 
                    type="file" 
                    accept=".json"
                    onChange={handleFileChange}
                  />
                </div>
                
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {selectedFile.name}
                  </p>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>File Format Requirements</span>
                  </div>
                  <p className="mt-1 text-xs">
                    The JSON file should be an array of objects with the following structure:
                  </p>
                  <pre className="mt-2 text-xs bg-amber-100 p-2 rounded overflow-x-auto">
                    {`[
  {
    "userId": "user_id_here",
    "cvv": "123",
    "atmPin": "4567"
  },
  ...
]`}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !selectedFile}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Card Details"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminTools; 