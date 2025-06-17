
import { ClipboardCopy, ClipboardList, Columns2, LogOut, User } from "lucide-react";

export const menuItems = [
    { icon: <Columns2 size={20} />, name: "Tableau de bord", path: "/dashboardVendeur" },
    { icon: <ClipboardList size={20} />, name: "vente Ticket", path: "/sell" },
    { icon: <ClipboardCopy size={20} />, name: "Historique ", path: "/History" },
  
];

export const userOptions = [
    { icon: <User size={20} />, name: "Profile", path: "/profile_V" },
    { icon: <LogOut size={20} />, name: "Se déconnecter", path: "/logout" },
];