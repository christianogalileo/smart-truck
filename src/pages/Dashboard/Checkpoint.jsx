import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Checkpoint = ({ role }) => { // ← menerima role langsung
  const userRole = role || 'Guest'; // fallback jika kosong
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = 'http://38.147.122.240:5000';

  const fetchCheckpoints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/checkpoints`);
      if (!res.ok) throw new Error("Failed to fetch data");
      let data = await res.json();

      // Urutkan sesuai checkpoint 1-4 lalu timestamp
      const order = { "Checkpoint 1": 1, "Checkpoint 2": 2, "Checkpoint 3": 3, "Checkpoint 4": 4 };
      data.sort((a, b) => order[a.checkpoint] - order[b.checkpoint] || new Date(a.timestamp) - new Date(b.timestamp));

      setCheckpoints(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch checkpoints:', err);
      setError('Gagal mengambil data checkpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
    const interval = setInterval(fetchCheckpoints, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex min-h-screen bg-fixed bg-cover bg-center"
      style={{ background: 'linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)' }}
    >
      {/* Sidebar */}
      <aside className="bg-black bg-opacity-70 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img src="/images/admin.png" alt="User Icon" className="rounded-full mb-2 w-16 h-16 object-cover" />
            <h2 className="font-semibold text-lg">{userRole}</h2>
          </div>

          <nav className="space-y-6">
            <Link to="/master-data" className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600">Master Data</Link>

            {/* Menu hanya tampil untuk Admin / Super Admin */}
            {(userRole === 'Admin' || userRole === 'Super Admin') && (
              <>
                <Link to="/tracking" className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600">Tracking</Link>
                <Link to="/info-driver" className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600">Info Driver</Link>
              </>
            )}

            <Link to="/checkpoint" className="block bg-blue-700 rounded-lg p-3 text-center hover:bg-blue-600">Checkpoint</Link>
            <Link to="/timbang-muat" className="block bg-indigo-700 hover:bg-indigo-600 rounded-lg p-3 text-center">Timbang Muat</Link>
            <Link to="/timbang-gudang" className="block bg-indigo-700 hover:bg-indigo-600 rounded-lg p-3 text-center">Timbang Gudang</Link>
          </nav>
        </div>

        <nav className="space-y-6 mt-6">
          <Link to="/settings" className="block bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600">Settings</Link>
          <Link to="/logout" className="block bg-red-600 rounded-lg p-3 text-center hover:bg-red-500">Logout</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white bg-opacity-80 rounded-tl-3xl shadow-inner m-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard / Checkpoint Logs</h1>
        </header>

        {loading && <div className="text-gray-600 mb-4">⏳ Memuat data...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Checkpoint Logs (Auto-refresh 2 detik)</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Truck ID</th>
                  <th className="border p-2">Plat Nomor</th>
                  <th className="border p-2">Truck Type</th>
                  <th className="border p-2">Driver</th>
                  <th className="border p-2">Checkpoint</th>
                  <th className="border p-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {checkpoints.length > 0 ? (
                  checkpoints.map(cp => (
                    <tr key={cp.id} className="hover:bg-gray-100">
                      <td className="border p-2">{cp.truckId}</td>
                      <td className="border p-2">{cp.plateNumber || '-'}</td>
                      <td className="border p-2">{cp.truckType}</td>
                      <td className="border p-2">{cp.driver}</td>
                      <td className="border p-2 font-medium">{cp.checkpoint}</td>
                      <td className="border p-2">{new Date(cp.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">Tidak ada data checkpoint</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Checkpoint;
