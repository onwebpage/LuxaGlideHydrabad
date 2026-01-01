import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, MessageSquare, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "connect@queen4feet.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "Mumbai, Maharashtra",
      description: "123 Fashion District, Andheri East"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/20 to-primary/10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 px-8 py-3 text-base font-medium shadow-lg" data-testid="badge-contact">
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Get in Touch
            </Badge>
            
            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-8 leading-tight">
              Let's Start a
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Have questions? We're here to help you with your shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Contact Information
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Multiple ways to reach our team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={info.title} className="group">
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden" data-testid={`card-contact-${index}`}>
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg border-2 border-primary/20">
                      <info.icon className="w-10 h-10 text-primary" />
                    </div>
                    
                    <h3 className="relative font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {info.title}
                    </h3>
                    <p className="relative text-foreground font-semibold mb-2">{info.detail}</p>
                    <p className="relative text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-6 py-2">Contact Form</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Send Us a Message
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <Card className="border-2 shadow-2xl">
                <CardContent className="p-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-xs uppercase tracking-widest mb-3 block font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        required
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs uppercase tracking-widest mb-3 block font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs uppercase tracking-widest mb-3 block font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        data-testid="input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-xs uppercase tracking-widest mb-3 block font-medium">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        required
                        data-testid="input-subject"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-xs uppercase tracking-widest mb-3 block font-medium">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 resize-none"
                        required
                        data-testid="input-message"
                      />
                    </div>

                    <div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full text-lg font-semibold shadow-xl"
                        data-testid="button-submit"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <Card className="border-2 shadow-xl hover-elevate transition-all duration-500">
                <CardContent className="p-10">
                  <Sparkles className="w-12 h-12 text-primary mb-6" />
                  <h3 className="font-serif text-3xl font-bold mb-4">
                    Why Contact Us?
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Whether you're looking for the perfect outfit or a seller wanting to reach more customers, our team is ready to assist you.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 shadow-xl">
                <CardContent className="p-10">
                  <MessageSquare className="w-12 h-12 text-primary mb-6" />
                  <h4 className="font-serif text-2xl font-bold mb-4">
                    Quick Response
                  </h4>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Order and delivery inquiries",
                      "Returns and refunds",
                      "Technical support",
                      "General questions"
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-foreground"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl hover-elevate transition-all duration-500">
                <CardContent className="p-10">
                  <h4 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    Office Location
                  </h4>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    123 Fashion District, Andheri East<br />
                    Mumbai, Maharashtra 400069<br />
                    India
                  </p>
                  <div className="aspect-video bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-lg overflow-hidden border-2 shadow-inner">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="w-16 h-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-secondary/10 via-background to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-6 py-2">FAQ</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {[
              {
                question: "How do I track my order?",
                answer: "Once your order ships, you'll receive a tracking link via email and SMS. You can also view order status in your account dashboard."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We support multiple secure payment methods including UPI, credit/debit cards, net banking, and cash on delivery."
              },
              {
                question: "How long does delivery take?",
                answer: "Standard delivery takes 3-7 business days depending on your location. Express delivery options are available at checkout."
              },
              {
                question: "What is your return policy?",
                answer: "We offer hassle-free returns within 7 days of delivery. Simply initiate a return from your orders page and we'll arrange pickup."
              }
            ].map((faq, index) => (
              <div key={index}>
                <Card className="hover-elevate active-elevate-2 transition-all duration-500 border-2">
                  <CardContent className="p-8">
                    <h4 className="font-serif text-2xl font-bold mb-4 flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary mt-1 shrink-0" />
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground text-lg leading-relaxed pl-9">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
