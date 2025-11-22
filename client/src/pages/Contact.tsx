import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Sparkles, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Enhanced Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/20 to-primary/10"
          style={{ y: heroY }}
        >
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Badge className="mb-8 px-8 py-3 text-base font-medium shadow-lg" data-testid="badge-contact">
                <MessageSquare className="w-4 h-4 mr-2 inline" />
                Get in Touch
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-6xl md:text-8xl font-bold mb-8 leading-tight"
            >
              Let's Start a
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Conversation
              </span>
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

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Contact Info Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Contact Information
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Multiple ways to reach our team
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                className="group"
              >
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden" data-testid={`card-contact-${index}`}>
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                      className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg border-2 border-primary/20"
                    >
                      <info.icon className="w-10 h-10 text-primary" />
                    </motion.div>
                    
                    <h3 className="relative font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {info.title}
                    </h3>
                    <p className="relative text-foreground font-semibold mb-2">{info.detail}</p>
                    <p className="relative text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Form */}
      <section ref={formRef} className="py-32 relative overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          style={{ y: formY }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-6 py-2">Contact Form</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Send Us a Message
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
            {/* Enhanced Form */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="border-2 shadow-2xl">
                <CardContent className="p-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full text-lg font-semibold shadow-xl"
                        data-testid="button-submit"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <Card className="border-2 shadow-xl hover-elevate transition-all duration-500">
                <CardContent className="p-10">
                  <Sparkles className="w-12 h-12 text-primary mb-6" />
                  <h3 className="font-serif text-3xl font-bold mb-4">
                    Why Contact Us?
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    Whether you're a buyer looking for the perfect wholesale partner or a vendor wanting to expand your reach, our team is ready to assist you.
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
                      "Vendor onboarding inquiries",
                      "Buyer partnership opportunities",
                      "Technical support",
                      "General questions"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center gap-3 text-foreground"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>{item}</span>
                      </motion.li>
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-secondary/10 via-background to-secondary/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 px-6 py-2">FAQ</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
