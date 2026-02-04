import { Link, useLocation } from "react-router-dom";
import { Home, Video, User, Upload, MessageSquare } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();

  const Item = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer
        ${pathname === to ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="w-60 bg-white shadow-md p-4 space-y-2">
      <h1 className="text-xl font-bold text-blue-600 mb-6">MyTube</h1>

      <Item to="/" icon={<Home size={20} />} label="Home" />
      <Item to="/tweets" icon={<MessageSquare size={20} />} label="Tweets" />
      <Item to="/upload" icon={<Upload size={20} />} label="Upload Video" />
      <Item to="/channel" icon={<User size={20} />} label="My Channel" />
    </aside>
  );
}
