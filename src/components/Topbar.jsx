// 📂 src/components/Topbar.jsx
import React from "react";
import { Search, Bell, User, ChevronDown, LogOut, Menu } from "lucide-react";


function Topbar({ setSidebarOpen }) {
return (
<header className="top-bar">
<div className="top-bar-left">
<button className="menu-btn" onClick={() => setSidebarOpen(true)}>
<Menu size={20} />
</button>
<div className="breadcrumb">
<span className="fw-bold">Dashboard Gestor</span>
<span className="text-muted"> • Painel de controle</span>
</div>
</div>


<div className="top-bar-right">
<div className="search-bar">
<Search size={18} />
<input type="text" placeholder="Pesquisar..." />
</div>


<button className="icon-btn">
<Bell size={20} />
<span className="notification-badge">3</span>
</button>


<div className="user-menu">
<div className="user-avatar">
<User size={20} />
</div>
<span className="user-name">Gestor</span>
<ChevronDown size={16} />
</div>


<button className="icon-btn logout-btn">
<LogOut size={20} />
</button>
</div>
</header>
);
}


export default Topbar;