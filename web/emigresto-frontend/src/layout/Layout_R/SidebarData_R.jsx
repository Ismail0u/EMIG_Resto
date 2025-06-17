
import { ClipboardCopy, ClipboardList, Columns2, LogOut, User } from "lucide-react";

export const menuItems = [
    { icon: <Columns2 size={20} />, name: "Tableau de bord", path: "/dashboard" },
    { icon: <ClipboardList size={20} />, name: "Réservations", path: "/reservations" },
    { icon: <ClipboardCopy size={20} />, name: "Liste des etudiants", path: "/etudiants" },
  
];

export const userOptions = [
    { icon: <User size={20} />, name: "Profile", path: "/profile_R" },
    { icon: <LogOut size={20} />, name: "Se déconnecter", path: "/logout" },
];