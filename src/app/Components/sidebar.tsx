"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Folder,
  File,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const iconMap = {
  home: Home,
  user: User,
  folder: Folder,
  file: File,
  "credit-card": CreditCard,
  settings: Settings,
  logout: LogOut,
};

// Define a type for navigation items
type SideItems = {
  name: string;
  icon: string;
  href: string;
};

type SidebarProps = {
  defaultExpanded?: boolean;
  items: SideItems[];
};

const Sidebar = ({ defaultExpanded = true, items }: SidebarProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const pathname = usePathname();

  return (
    <aside
      style={{ border: "1px solid white" }}
      className={`flex flex-col h-full bg-gray-800 text-white transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {expanded && <h1 className="text-xl font-bold">App Name</h1>}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-md hover:bg-gray-700"
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent size={20} className="flex-shrink-0" />
                  )}
                  {expanded && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {/* User avatar or initials */}
            <span>U</span>
          </div>
          {expanded && (
            <div className="ml-3">
              <p className="font-medium">Username</p>
              <p className="text-sm text-gray-400">View profile</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;