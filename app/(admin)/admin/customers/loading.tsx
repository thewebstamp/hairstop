export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  );
}