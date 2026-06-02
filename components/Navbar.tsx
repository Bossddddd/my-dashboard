export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="text-xl font-bold text-gray-800">
        Maintenance-Dashboard
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Admin User</span>
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
          A
        </div>
      </div>
    </header>
  );
}