export default function LegacyAccountRouteLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#E8ECF2]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Loading page...</span>
      </div>
    </div>
  );
}
