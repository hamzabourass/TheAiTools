import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export const FeatureCard = ({ icon: Icon, title, description, features, linkHref, linkText }) => (
    <Card className="group hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="w-full" asChild>
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  )