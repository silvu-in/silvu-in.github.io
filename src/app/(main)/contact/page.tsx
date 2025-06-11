
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          Contact Us
        </h1>
        <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
          We're here to help! Reach out to us through any of the methods below.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-3 h-6 w-6 text-primary" />
              Our Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>Silvu Aerospace Innovations Pvt. Ltd.</p>
            <p>123 Innovation Drive, Tech Park</p>
            <p>Bangalore, Karnataka 560001</p>
            <p>India</p>
            <div className="pt-2">
              <a 
                href="https://maps.google.com/?q=123+Innovation+Drive,+Tech+Park,+Bangalore" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Get Directions (Opens in Google Maps)
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-3 h-6 w-6 text-primary" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>Monday - Friday: 9:00 AM - 6:00 PM (IST)</p>
            <p>Saturday: 10:00 AM - 4:00 PM (IST)</p>
            <p>Sunday: Closed</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-3 h-6 w-6 text-primary" />
              Email Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>For Sales & Product Inquiries:</p>
            <a href="mailto:sales@silvu.example.com" className="text-primary hover:underline">sales@silvu.example.com</a>
            <p className="pt-2">For Support & Technical Assistance:</p>
            <a href="mailto:support@silvu.example.com" className="text-primary hover:underline">support@silvu.example.com</a>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-3 h-6 w-6 text-primary" />
              Call Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>Customer Service:</p>
            <a href="tel:+919876543210" className="text-primary hover:underline">+91-987-654-3210</a>
            <p className="pt-2">Business Development:</p>
            <a href="tel:+919876543211" className="text-primary hover:underline">+91-987-654-3211</a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-muted-foreground">
        <p>We aim to respond to all inquiries within 24-48 business hours.</p>
      </div>
    </PageContainer>
  );
}
