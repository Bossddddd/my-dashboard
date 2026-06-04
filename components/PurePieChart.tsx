export default function PurePieChart({
  success,
  inProgress,
  late,
  size = "sm",
}: {
  success: number;
  inProgress: number;
  late: number;
  size?: "sm" | "lg";
}) {
  const total = success + inProgress + late;
  const sizeClass = size === "lg" ? "w-48 h-48 sm:w-56 sm:h-56" : "w-24 h-24";
  const innerSizeClass = size === "lg" ? "w-32 h-32 sm:w-36 h-36" : "w-14 h-14";
  const textClass = size === "lg" ? "text-3xl sm:text-4xl" : "text-sm";
  const subTextClass = size === "lg" ? "text-xs sm:text-sm" : "text-[9px]";

  if (total === 0) {
    return (
      <div className={`${sizeClass} rounded-full bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400`}>
        <span className="text-xs font-medium">ไม่มีข้อมูล</span>
      </div>
    );
  }

  const successPercent = (success / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;

  return (
    <div
      className={`relative ${sizeClass} rounded-full flex items-center justify-center shadow-sm shrink-0`}
      style={{
        background: `conic-gradient(#10B981 0% ${successPercent}%, #F59E0B ${successPercent}% ${successPercent + inProgressPercent}%, #EF4444 ${successPercent + inProgressPercent}% 100%)`,
      }}
    >
      <div className={`${innerSizeClass} bg-white rounded-full flex flex-col items-center justify-center text-center shadow-sm`}>
        <span className={`${textClass} font-black text-gray-700 font-mono leading-none`}>{total}</span>
        <span className={`${subTextClass} text-gray-400 font-bold mt-1`}>งานทั้งหมด</span>
      </div>
    </div>
  );
}
