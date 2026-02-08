import { Lock, Bug, Search, Zap, Globe, Clock, FileSearch, Shield } from 'lucide-react';

const EXTERNAL_TOOLS = [
  {
    name: "SSL Labs Test",
    desc: "Analyzes the SSL configuration of a server and grades it",
    url: "https://www.ssllabs.com/ssltest/",
    icon: Lock,
  },
  {
    name: "Virus Total",
    desc: "Checks a URL against multiple antivirus engines",
    url: "https://www.virustotal.com",
    icon: Bug,
  },
  {
    name: "Shodan",
    desc: "Search engine for Internet-connected devices",
    url: "https://www.shodan.io",
    icon: Search,
  },
  {
    name: "Page Speed Insights",
    desc: "Checks performance, accessibility and SEO on mobile + desktop",
    url: "https://pagespeed.web.dev/",
    icon: Zap,
  },
  {
    name: "Web Check",
    desc: "View literally everything about a website",
    url: "https://web-check.xyz",
    icon: Globe,
  },
  {
    name: "Archive",
    desc: "View previous versions of a site via the Internet Archive",
    url: "https://archive.org",
    icon: Clock,
  },
  {
    name: "URLScan",
    desc: "Scans a URL and provides information about the page",
    url: "https://urlscan.io",
    icon: FileSearch,
  },
  {
    name: "Sucuri SiteCheck",
    desc: "Checks a URL against blacklists and known threats",
    url: "https://sitecheck.sucuri.net",
    icon: Shield,
  },
];

export default EXTERNAL_TOOLS;
