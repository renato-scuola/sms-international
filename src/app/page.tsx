import SMSForm from '@/components/SMSForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.02),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_50%)]"></div>
      
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Info card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
          <h2 className="text-white text-sm font-medium mb-2">🎯 Advanced IP Spoofing</h2>
          <p className="text-gray-300 text-xs leading-relaxed">
            Using <span className="text-white font-semibold">multiple IP variants + strategy rotation</span> to maximize SMS quota. 
            Each attempt uses different session data!
          </p>
        </div>
        
        {/* SMS Form */}
        <SMSForm />
      </div>
    </div>
  );
}
