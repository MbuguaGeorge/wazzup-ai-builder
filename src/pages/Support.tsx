import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, FileText, HelpCircle, Book, MessageSquare, Clock, AlertCircle, CheckCircle2, XCircle, MessageSquare as MessageIcon } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import { API_BASE_URL } from "@/lib/config";
import SupportTicketDetail from "@/components/support/SupportTicketDetail";

interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user_full_name: string;
  user_email: string;
}

const Support = () => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const { toast } = useToast();

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/support/tickets/`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        console.error('Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        toast({
          title: "Error fetching tickets",
          description: `Status: ${response.status} - ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error fetching tickets",
        description: "Please check if the server is running and try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.category || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      
      if (selectedFile) {
        formDataToSend.append('attachments', selectedFile);
      }

      const response = await authFetch(`${API_BASE_URL}/api/support/tickets/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Support request submitted",
          description: "We'll get back to you within 24 hours.",
        });
        // Refresh tickets list
        fetchTickets();
      } else {
        console.error('Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorMessage = "Please try again.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Status: ${response.status} - ${response.statusText}`;
        }
        
        toast({
          title: "Error submitting request",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ subject: "", category: "", description: "" });
    setSelectedFile(null);
    setIsSubmitted(false);
  };

  const handleViewTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setShowTicketDetail(true);
  };

  const handleCloseTicketDetail = () => {
    setShowTicketDetail(false);
    setSelectedTicketId(null);
    // Refresh tickets to get updated status
    fetchTickets();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const helpfulLinks = [
    {
      title: "FAQ",
      description: "Find answers to common questions",
      icon: HelpCircle,
      href: "#",
    },
    {
      title: "Documentation",
      description: "Detailed guides and tutorials",
      icon: Book,
      href: "#",
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: MessageSquare,
      href: "#",
    },
  ];

  const categories = [
    "billing",
    "technical_issue",
    "general_question",
    "feedback",
    "feature_request",
    "account_management",
  ];

  if (isSubmitted) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Need help? We're here to assist you. Submit a support request and our team will get back to you as soon as possible.</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Request Submitted Successfully!</h1>
            <p className="text-muted-foreground max-w-md">
              Thank you for contacting us. We've received your support request and our team will get back to you within 24 hours.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={resetForm} variant="outline">
              Submit Another Request
            </Button>
            <Button onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground">Need help? We're here to assist you. Submit a support request and our team will get back to you as soon as possible.</p>
      </div>

      {/* Tickets Section */}
      <div className="space-y-4">
        <Card>
          <CardContent>
            {loadingTickets ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <img alt="Empty state" src="https://frontends.mailjet.com/assets/mg_tickets.png" className="w-[15%] mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">No Tickets Found</p>
                <p className="text-sm w-[15%] font-light mx-auto">Having trouble? Find answers to our most common questions below or submit a ticket for additional help.</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    // Temporarily disabled: onClick={() => handleViewTicket(ticket.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(ticket.status)}
                          <h3 className="font-medium">{ticket.subject}</h3>
                          <Badge variant="outline" className="text-xs">
                            {ticket.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {ticket.category.replace('_', ' ')}</span>
                          <span>Created: {formatDate(ticket.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`ml-2 ${ticket.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`} 
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Support Request</CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us assist you better.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your issue in detail..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload a file or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                      <FileText className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help Right Away?</CardTitle>
              <CardDescription>
                Check out these resources for quick answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {helpfulLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Response Time</p>
                <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Support Hours</p>
                <p className="text-sm text-muted-foreground">Monday - Saturday, 9AM - 6PM EST</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">support@wozza.io</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicketDetail} onOpenChange={setShowTicketDetail}>
        <DialogContent className="max-w-4xl h-auto max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Support Ticket Details</DialogTitle>
            <DialogDescription>
              View and respond to your support ticket in real-time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6">
            {selectedTicketId && (
              <SupportTicketDetail
                ticketId={selectedTicketId}
                onClose={handleCloseTicketDetail}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;