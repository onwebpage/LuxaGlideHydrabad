import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: formProgress } = useScroll({
    target: formRef,
    offset: ["start end", "end start"]
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const formY = useTransform(formProgress, [0, 1], ["0%", "15%"]);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "support@luxewholesale.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+91 98765 43210",
      description: "Mon-Sat, 9 AM - 6 PM IST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: "Mumbai, Maharashtra",
      description: "123 Fashion District, Andheri East"
    },
    {
      icon: Clock,
      title: "Business Hours",
      detail: "Monday - Saturday",
      description: "9:00 AM - 6:00 PM IST"
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
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20"
          style={{ y: heroY }}
        />
        
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-6 px-6 py-2" data-testid="badge-contact">
              Get in Touch
            </Badge>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="font-serif text-5xl md:text-7xl font-semibold mb-8 leading-tight"
            >
              Let's Start a
              <br />
              <span className="text-primary">Conversation</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Have questions? We're here to help you succeed in your wholesale fashion business.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring"
                }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full hover-elevate transition-all duration-500" data-testid={`card-contact-${index}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
                    >
                      <info.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="font-serif text-xl font-semibold mb-2">{info.title}</h3>
                    <p className="text-foreground font-medium mb-2">{info.detail}</p>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form with Parallax */}
      <section ref={formRef} className="py-32 relative overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          style={{ y: formY }}
          className="absolute inset-0 opacity-5"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Send Us a Message
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Card className="backdrop-blur-sm border-2">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        data-testid="input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                        data-testid="input-subject"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                        data-testid="input-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg group"
                      data-testid="button-submit"
                    >
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-serif text-3xl font-semibold mb-4">
                  Why Contact Us?
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Whether you're a buyer looking for the perfect wholesale partner or a vendor wanting to expand your reach, our team is ready to assist you.
                </p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-8">
                  <MessageSquare className="w-12 h-12 text-primary mb-4" />
                  <h4 className="font-serif text-2xl font-semibold mb-3">
                    Quick Response
                  </h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Vendor onboarding inquiries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Buyer partnership opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Technical support
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      General questions
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h4 className="font-serif text-2xl font-semibold mb-4">
                    Office Location
                  </h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    123 Fashion District, Andheri East<br />
                    Mumbai, Maharashtra 400069<br />
                    India
                  </p>
                  <div className="aspect-video bg-secondary rounded-md overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <MapPin className="w-12 h-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {[
              {
                question: "How do I become a verified vendor?",
                answer: "Register as a vendor, complete your profile, and submit your KYC documents. Our team will review and verify your account within 2-3 business days."
              },
              {
                question: "What are the minimum order quantities?",
                answer: "MOQ varies by vendor and product. Each product listing clearly shows the minimum order quantity required."
              },
              {
                question: "How does payment work?",
                answer: "We support multiple secure payment methods including bank transfers, UPI, and credit cards. Payment terms can be discussed with individual vendors."
              },
              {
                question: "What is your refund policy?",
                answer: "Refund policies vary by vendor. Please check individual vendor policies before placing an order. We mediate disputes to ensure fair resolution."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover-elevate transition-all duration-300">
                  <CardContent className="p-8">
                    <h4 className="font-serif text-xl font-semibold mb-3">
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
