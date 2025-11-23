import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, Download, AlertCircle } from "lucide-react";

export default function AdminProductsBulkUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    created?: number;
    errors?: Array<{ row: number; error: string }>;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/products/bulk-upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadResult({
        created: data.created,
        errors: data.errors,
      });

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${data.created} products`,
      });

      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload products",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `vendorId,name,description,categoryId,fabric,price,moq,stock,images,colors,sizes,bulkPricing
vendor-id-here,Sample Cotton T-Shirt,High quality cotton t-shirt for wholesale,category-id-here,Cotton,299,10,100,"[""https://example.com/image1.jpg""]","[""White"",""Black"",""Blue""]","[""S"",""M"",""L"",""XL""]","[{""quantity"":50,""price"":280},{""quantity"":100,""price"":250}]"`;
    
    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-products.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/dashboard/admin/products")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="font-serif text-4xl font-semibold mb-2" data-testid="text-title">
              Bulk Upload Products
            </h1>
            <p className="text-muted-foreground">
              Upload multiple products at once using a CSV or Excel file
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Follow these steps to bulk upload products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Required Fields:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>vendorId</strong> - The ID of the vendor (required)</li>
                <li><strong>name</strong> - Product name (required)</li>
                <li><strong>description</strong> - Product description (required)</li>
                <li><strong>price</strong> - Product price (required)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Optional Fields:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>categoryId</strong> - Category ID</li>
                <li><strong>fabric</strong> - Fabric type</li>
                <li><strong>moq</strong> - Minimum order quantity (default: 10)</li>
                <li><strong>stock</strong> - Available stock (default: 0)</li>
                <li><strong>images</strong> - JSON array of image URLs</li>
                <li><strong>colors</strong> - JSON array of colors</li>
                <li><strong>sizes</strong> - JSON array of sizes</li>
                <li><strong>bulkPricing</strong> - JSON array of pricing tiers</li>
              </ul>
            </div>
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Sample CSV Template</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Download a sample CSV template with the correct format</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={downloadSampleCSV}
                  data-testid="button-download-sample"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select a CSV or Excel file to upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                data-testid="input-file"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Products"}
            </Button>

            {uploadResult && (
              <div className="space-y-4 mt-6">
                {uploadResult.created > 0 && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900 dark:text-green-100">Upload Successful</AlertTitle>
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Successfully uploaded {uploadResult.created} products. All products are in "Pending" status and need to be approved before publishing.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errors Found</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">The following rows had errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {uploadResult.errors.map((error, idx) => (
                          <li key={idx}>
                            Row {error.row}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
